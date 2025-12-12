"""gRPC handler для Parser Service."""

import uuid
import time
from typing import Iterator
import grpc

from proto import parser_pb2, parser_pb2_grpc, common_pb2
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
    
    def ParseArticle(self, request: parser_pb2.ParseRequest, context) -> parser_pb2.ParsedArticle:
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
            if not url:
                context.set_code(grpc.StatusCode.INVALID_ARGUMENT)
                context.set_details("URL is required")
                return parser_pb2.ParsedArticle()
            
            # Проверка кэша
            cached = self.cache.get(url)
            if cached:
                return self._dict_to_parsed_article(cached, url)
            
            # Rate limiting
            domain = self.parser_manager._extract_domain(url)
            # await self.rate_limiter.acquire(domain)  # Раскомментировать для production
            
            # Парсинг
            options = {
                'extract_images': request.extract_images,
                'extract_metadata': request.extract_metadata,
            }
            
            if request.options:
                if request.options.timeout_seconds:
                    options['timeout_seconds'] = request.options.timeout_seconds
                if request.options.use_headless_browser:
                    options['use_headless_browser'] = request.options.use_headless_browser
                if request.options.user_agent:
                    options['user_agent'] = request.options.user_agent
                else:
                    options['user_agent'] = get_random_user_agent()
            
            result = asyncio.run(self.parser_manager.parse_article(url, options))
            
            # Сохранение в кэш
            self.cache.set(url, result)
            
            # Формирование ответа
            parsing_time_ms = int((time.time() - start_time) * 1000)
            return self._dict_to_parsed_article(result, url, parsing_time_ms)
            
        except URLNotSupported as e:
            context.set_code(grpc.StatusCode.INVALID_ARGUMENT)
            context.set_details(f"URL not supported: {str(e)}")
            return parser_pb2.ParsedArticle()
        except ParsingTimeout as e:
            context.set_code(grpc.StatusCode.DEADLINE_EXCEEDED)
            context.set_details(f"Parsing timeout: {str(e)}")
            return parser_pb2.ParsedArticle()
        except ContentNotFound as e:
            context.set_code(grpc.StatusCode.NOT_FOUND)
            context.set_details(f"Content not found: {str(e)}")
            return parser_pb2.ParsedArticle()
        except Exception as e:
            context.set_code(grpc.StatusCode.INTERNAL)
            context.set_details(f"Internal error: {str(e)}")
            return parser_pb2.ParsedArticle()
    
    def BatchParseArticles(self, request_iterator: Iterator[parser_pb2.ParseRequest], context) -> Iterator[parser_pb2.ParsedArticle]:
        """
        Пакетный парсинг статей (streaming).
        
        Args:
            request_iterator: Итератор запросов
            context: gRPC context
            
        Yields:
            Результаты парсинга
        """
        for request in request_iterator:
            result = self.ParseArticle(request, context)
            yield result
    
    def ValidateURL(self, request: parser_pb2.URLRequest, context) -> parser_pb2.ValidationResponse:
        """
        Валидация URL.
        
        Args:
            request: Запрос на валидацию
            context: gRPC context
            
        Returns:
            Результат валидации
        """
        from urllib.parse import urlparse
        
        url = request.url
        if not url:
            return parser_pb2.ValidationResponse(
                valid=False,
                error="URL is empty"
            )
        
        try:
            parsed = urlparse(url)
            if not parsed.scheme or not parsed.netloc:
                return parser_pb2.ValidationResponse(
                    valid=False,
                    error="Invalid URL format"
                )
            
            # Нормализация URL
            normalized = f"{parsed.scheme}://{parsed.netloc}{parsed.path}"
            if parsed.query:
                normalized += f"?{parsed.query}"
            
            # Получение информации об источнике
            domain = parsed.netloc
            if domain.startswith('www.'):
                domain = domain[4:]
            
            config = self.parser_manager.config_loader.get_config(domain)
            parser_type = config.get('parser_type', 'html') if config else 'html'
            
            source_info = parser_pb2.SourceInfo(
                name=domain,
                domain=domain,
                supported=True,
                parser_type=parser_type
            )
            
            return parser_pb2.ValidationResponse(
                valid=True,
                normalized_url=normalized,
                source_info=source_info
            )
            
        except Exception as e:
            return parser_pb2.ValidationResponse(
                valid=False,
                error=f"Validation error: {str(e)}"
            )
    
    def GetSupportedSources(self, request: parser_pb2.Empty, context) -> parser_pb2.SourcesList:
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
            source = parser_pb2.Source(
                name=domain,
                domain=domain,
                country="RU",  # Можно расширить
                language="ru",
                requires_auth=False
            )
            sources.append(source)
        
        return parser_pb2.SourcesList(sources=sources)
    
    def _dict_to_parsed_article(self, data: dict, url: str, parsing_time_ms: int = 0) -> parser_pb2.ParsedArticle:
        """
        Преобразование словаря в ParsedArticle.
        
        Args:
            data: Словарь с данными статьи
            url: URL статьи
            parsing_time_ms: Время парсинга в миллисекундах
            
        Returns:
            ParsedArticle объект
        """
        # Преобразование изображений
        images = []
        for img in data.get('images', []):
            image = common_pb2.Image(
                url=img.get('url', ''),
                alt_text=img.get('alt_text', ''),
                width=img.get('width', 0) or 0,
                height=img.get('height', 0) or 0,
            )
            images.append(image)
        
        # Преобразование метаданных
        metadata = data.get('metadata', {})
        
        # Статистика
        stats = parser_pb2.ParsingStats(
            parsing_time_ms=parsing_time_ms,
            content_length=len(data.get('content', '')),
            images_count=len(images),
            parser_version="1.0.0"
        )
        
        article = parser_pb2.ParsedArticle(
            id=str(uuid.uuid4()),
            url=url,
            normalized_url=url,
            title=data.get('title', ''),
            content=data.get('content', ''),
            excerpt=data.get('excerpt', ''),
            source=data.get('source', ''),
            author=data.get('author', '') or '',
            published_at=int(data.get('published_at', 0)) if data.get('published_at') else 0,
            images=images,
            metadata=metadata,
            html=data.get('html', ''),
            stats=stats
        )
        
        return article
