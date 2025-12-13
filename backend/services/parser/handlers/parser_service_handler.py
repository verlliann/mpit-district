"""gRPC handler для Parser Service."""

import uuid
import time
from typing import Iterator
import grpc

from proto import parser_pb2, parser_pb2_grpc, common_pb2, storage_pb2
from parser_manager import ParserManager
from utils.cache import ParserCache
from utils.rate_limiter import RateLimiter
from utils.user_agents import get_random_user_agent
from exceptions import ParserException, URLNotSupported, ParsingTimeout, ContentNotFound


class ParserServiceHandler(parser_pb2_grpc.ParserServiceServicer):
    """Handler для gRPC запросов Parser Service."""
    
    def __init__(self):
        """Инициализация handler."""
        self.parser_manager = ParserManager()
        self.cache = ParserCache()
        self.rate_limiter = RateLimiter()
    
    def HealthCheck(self, request, context):
        """
        Health check endpoint для gRPC.
        
        Args:
            request: HealthCheckRequest
            context: gRPC context
            
        Returns:
            HealthCheckResponse
        """
        try:
            # Проверка базовой работоспособности
            if self.parser_manager is None:
                return common_pb2.HealthCheckResponse(
                    status=common_pb2.HealthCheckResponse.NOT_SERVING,
                    message="Parser manager not initialized"
                )
            
            # Проверка доступности парсеров
            if not self.parser_manager.parsers:
                return common_pb2.HealthCheckResponse(
                    status=common_pb2.HealthCheckResponse.NOT_SERVING,
                    message="No parsers available"
                )
            
            # Сервис готов
            return common_pb2.HealthCheckResponse(
                status=common_pb2.HealthCheckResponse.SERVING,
                message="Service is healthy"
            )
            
        except Exception as e:
            return common_pb2.HealthCheckResponse(
                status=common_pb2.HealthCheckResponse.NOT_SERVING,
                message=f"Service error: {str(e)}"
            )
    
    def ParseArticle(self, request: parser_pb2.ParseArticleRequest, context) -> parser_pb2.ParseArticleResponse:
        """
        Парсинг одной статьи.
        
        Args:
            request: Запрос на парсинг
            context: gRPC context
            
        Returns:
            Результат парсинга
        """
        import asyncio
        start_time = time.time()
        
        try:
            url = request.url
            url = request.url
            if not url:
                return parser_pb2.ParseArticleResponse(
                    success=False,
                    error="URL is required"
                )
            
            # Проверка кэша (если не force_refresh)
            if not request.force_refresh:
                cached = self.cache.get(url)
                if cached:
                    article = self._dict_to_storage_article(cached, url)
                    return parser_pb2.ParseArticleResponse(
                        success=True,
                        article=article,
                        metadata=self._create_parsing_metadata(cached, from_cache=True)
                    )
            
            # Rate limiting
            domain = self.parser_manager._extract_domain(url)
            # await self.rate_limiter.acquire(domain)  # Раскомментировать для production
            
            # Парсинг
            # Используем те же опции, что и в test_client.py для корректной работы
            # НО: для Telegram и других JS-сайтов автоматически используем браузер
            domain = self.parser_manager._extract_domain(url)
            config = self.parser_manager.config_loader.get_config(domain)
            use_browser = request.use_browser
            # Если конфигурация требует JavaScript парсер, автоматически включаем браузер
            if config and (config.get('parser_type') == 'javascript' or config.get('use_headless_browser')):
                use_browser = True
            
            options = {
                'extract_images': True,
                'extract_metadata': True,
                'use_browser': use_browser,
                'user_agent': get_random_user_agent(),
                'verify_ssl': False,  # Отключение проверки SSL для тестирования
                'timeout_seconds': 90,  # Увеличенный timeout
                'wait_until': 'load',  # Используем 'load' вместо 'networkidle' для скорости
                'block_media': False,  # Не блокируем медиа
            }
            
            result = asyncio.run(self.parser_manager.parse_article(url, options))
            
            # Сохранение в кэш
            self.cache.set(url, result)
            
            # Формирование ответа
            parsing_time_ms = int((time.time() - start_time) * 1000)
            article = self._dict_to_storage_article(result, url)
            # Передаем URL в метаданные для правильного определения стратегии
            result_with_url = {**result, 'url': url}
            metadata = self._create_parsing_metadata(result_with_url, parsing_time_ms, from_cache=False)
            
            return parser_pb2.ParseArticleResponse(
                success=True,
                article=article,
                metadata=metadata
            )
            
        except URLNotSupported as e:
            return parser_pb2.ParseArticleResponse(
                success=False,
                error=f"URL not supported: {str(e)}"
            )
        except ParsingTimeout as e:
            return parser_pb2.ParseArticleResponse(
                success=False,
                error=f"Parsing timeout: {str(e)}"
            )
        except ContentNotFound as e:
            return parser_pb2.ParseArticleResponse(
                success=False,
                error=f"Content not found: {str(e)}"
            )
        except Exception as e:
            return parser_pb2.ParseArticleResponse(
                success=False,
                error=f"Internal error: {str(e)}"
            )
    
    def ParseArticles(self, request: parser_pb2.ParseArticlesRequest, context):
        """
        Пакетный парсинг статей (streaming).
        
        Args:
            request: Запрос с массивом URL
            context: gRPC context
            
        Yields:
            Результаты парсинга
        """
        for url in request.urls:
            parse_request = parser_pb2.ParseArticleRequest(
                url=url,
                use_browser=request.use_browser
            )
            result = self.ParseArticle(parse_request, context)
            yield result
    
    def TestURL(self, request: parser_pb2.TestURLRequest, context) -> parser_pb2.TestURLResponse:
        """
        Тестирование URL на возможность парсинга.
        
        Args:
            request: Запрос с URL
            context: gRPC context
            
        Returns:
            Результат тестирования
        """
        from urllib.parse import urlparse
        
        url = request.url
        if not url:
            return parser_pb2.TestURLResponse(
                is_supported=False,
                error="URL is empty"
            )
        
        try:
            parsed = urlparse(url)
            if not parsed.scheme or not parsed.netloc:
                return parser_pb2.TestURLResponse(
                    is_supported=False,
                    error="Invalid URL format"
                )
            
            # Получение информации об источнике
            domain = parsed.netloc
            if domain.startswith('www.'):
                domain = domain[4:]
            
            config = self.parser_manager.config_loader.get_config(domain)
            parser_type = config.get('parser_type', 'html') if config else 'html'
            requires_browser = parser_type == 'javascript' or request.url.endswith('.pdf')
            
            return parser_pb2.TestURLResponse(
                is_supported=True,
                source=domain,
                requires_browser=requires_browser
            )
            
        except Exception as e:
            return parser_pb2.TestURLResponse(
                is_supported=False,
                error=f"Test error: {str(e)}"
            )
    
    def GetSupportedSources(self, request: parser_pb2.GetSupportedSourcesRequest, context) -> parser_pb2.GetSupportedSourcesResponse:
        """
        Получение списка поддерживаемых источников.
        
        Args:
            request: Пустой запрос
            context: gRPC context
            
        Returns:
            Список источников
        """
        sources = []
        configs = self.parser_manager.config_loader.configs
        
        for domain, config in configs.items():
            parser_type = config.get('parser_type', 'html')
            strategy_map = {
                'html': parser_pb2.PARSING_STRATEGY_NEWSPAPER,
                'javascript': parser_pb2.PARSING_STRATEGY_PLAYWRIGHT,
                'rss': parser_pb2.PARSING_STRATEGY_RSS,
                'pdf': parser_pb2.PARSING_STRATEGY_UNSPECIFIED
            }
            
            source = parser_pb2.SourceConfig(
                name=domain,
                domain=domain,
                requires_browser=(parser_type == 'javascript'),
                is_active=True,
                strategy=strategy_map.get(parser_type, parser_pb2.PARSING_STRATEGY_UNSPECIFIED)
            )
            sources.append(source)
        
        return parser_pb2.GetSupportedSourcesResponse(sources=sources)
    
    def _dict_to_storage_article(self, data: dict, url: str) -> storage_pb2.Article:
        """
        Преобразование словаря в storage.Article.
        
        Args:
            data: Словарь с данными статьи
            url: URL статьи
            
        Returns:
            storage.Article объект
        """
        import time
        from datetime import datetime
        
        # Преобразование изображений
        images = []
        for img in data.get('images', []):
            image = storage_pb2.Image(
                url=img.get('url', ''),
                alt_text=img.get('alt_text', ''),
                width=img.get('width', 0) or 0,
                height=img.get('height', 0) or 0,
            )
            images.append(image)
        
        # Преобразование даты
        published_at = None
        if data.get('published_at'):
            timestamp = data['published_at']
            if isinstance(timestamp, (int, float)):
                published_at = common_pb2.Timestamp(
                    seconds=int(timestamp),
                    nanos=0
                )
        
        parsed_at = common_pb2.Timestamp(
            seconds=int(time.time()),
            nanos=0
        )
        
        created_at = common_pb2.Timestamp(
            seconds=int(time.time()),
            nanos=0
        )
        
        article = storage_pb2.Article(
            id=str(uuid.uuid4()),
            url=url,
            title=data.get('title', ''),
            content=data.get('content', ''),
            excerpt=data.get('excerpt', ''),
            source=data.get('source', ''),
            author=data.get('author', '') or '',
            published_at=published_at,
            parsed_at=parsed_at,
            language=data.get('metadata', {}).get('language', 'ru'),
            word_count=len(data.get('content', '').split()),
            images=images,
            created_at=created_at,
            updated_at=created_at
        )
        
        return article
    
    def _create_parsing_metadata(self, data: dict, parsing_time_ms: int = 0, from_cache: bool = False) -> parser_pb2.ParsingMetadata:
        """
        Создание метаданных парсинга.
        
        Args:
            data: Словарь с данными статьи
            parsing_time_ms: Время парсинга в миллисекундах
            from_cache: Флаг использования кэша
            
        Returns:
            ParsingMetadata объект
        """
        domain = data.get('source', '')
        url = data.get('url', '')  # Получаем URL из данных если есть
        parser_type = 'html'  # По умолчанию
        
        # Определение стратегии парсинга
        if domain in self.parser_manager.config_loader.configs:
            config = self.parser_manager.config_loader.configs[domain]
            parser_type = config.get('parser_type', 'html')
        
        # Специальная обработка для Telegram
        if url and ('t.me' in url or domain == 't.me'):
            parser_type = 'javascript'
        
        strategy_map = {
            'html': parser_pb2.PARSING_STRATEGY_NEWSPAPER,
            'javascript': parser_pb2.PARSING_STRATEGY_PLAYWRIGHT,
            'rss': parser_pb2.PARSING_STRATEGY_RSS,
            'pdf': parser_pb2.PARSING_STRATEGY_UNSPECIFIED
        }
        
        return parser_pb2.ParsingMetadata(
            source=domain,
            strategy=strategy_map.get(parser_type, parser_pb2.PARSING_STRATEGY_UNSPECIFIED),
            parsing_time_ms=parsing_time_ms,
            from_cache=from_cache,
            content_length=len(data.get('content', '')),
            images_found=len(data.get('images', [])),
            user_agent=''  # Можно добавить из options
        )
