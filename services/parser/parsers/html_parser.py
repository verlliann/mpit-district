"""HTML парсер для статичных веб-страниц."""

import asyncio
from typing import Dict, Any, List, Optional
from datetime import datetime
import hashlib

from bs4 import BeautifulSoup
import requests
from newspaper import Article
from newspaper.article import ArticleException

from .base import BaseParser


class HTMLParser(BaseParser):
    """Парсер для HTML страниц с использованием newspaper3k и BeautifulSoup."""
    
    def __init__(self):
        super().__init__()
        self.timeout = 30
    
    async def parse(self, url: str, options: Dict[str, Any]) -> Dict[str, Any]:
        """
        Парсинг HTML статьи.
        
        Args:
            url: URL статьи
            options: Опции парсинга
            
        Returns:
            Словарь с данными статьи
        """
        extract_images = options.get('extract_images', True)
        extract_metadata = options.get('extract_metadata', True)
        
        # Используем newspaper3k для основного контента
        article = Article(url)
        
        # Настройка для обхода SSL проблем (только для тестирования)
        import ssl
        import urllib3
        urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)
        
        # Попытка скачать с увеличенным timeout
        try:
            article.download()
        except Exception as e:
            # Если не получилось, пробуем через requests с увеличенным timeout
            import requests
            try:
                headers = {
                    'User-Agent': options.get('user_agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36')
                }
                response = requests.get(
                    url, 
                    verify=False, 
                    timeout=60,  # Увеличенный timeout
                    headers=headers,
                    allow_redirects=True
                )
                article.html = response.text
            except Exception as e2:
                # Если и это не помогло, пробуем через requests с session
                session = requests.Session()
                session.headers.update(headers)
                try:
                    response = session.get(url, verify=False, timeout=60, allow_redirects=True)
                    article.html = response.text
                except Exception as e3:
                    raise Exception(f"Failed to download article: {str(e3)}. Original error: {str(e)}")
        
        # Проверяем, что HTML загружен
        if not hasattr(article, 'html') or not article.html:
            raise Exception("Failed to download article HTML")
        
        # Парсинг статьи
        try:
            article.parse()
        except Exception as e:
            # Если парсинг не удался, но HTML есть, пробуем извлечь базовую информацию
            soup = BeautifulSoup(article.html, 'html.parser')
            
            # Извлекаем заголовок
            title = soup.find('title')
            if title:
                article.title = title.get_text().strip()
            
            # Извлекаем основной контент
            main_content = soup.find('article') or soup.find('main') or soup.find('body')
            if main_content:
                # Удаляем скрипты и стили
                for script in main_content(["script", "style", "nav", "header", "footer"]):
                    script.decompose()
                article.text = main_content.get_text(separator='\n', strip=True)
            else:
                # Если не нашли контент, используем весь body
                article.text = soup.get_text(separator='\n', strip=True)
        
        # Дополнительная обработка с BeautifulSoup
        soup = BeautifulSoup(article.html, 'html.parser')
        
        # Извлечение изображений
        images = []
        if extract_images:
            images = await self._extract_images(soup, url)
        
        # Извлечение метаданных
        metadata = {}
        if extract_metadata:
            metadata = self._extract_metadata(soup, article)
        
        # Проверка на блокировки и ошибки
        content = self.clean_text(article.text)
        title = article.title or ''
        
        # Проверка на типичные сообщения о блокировке
        block_messages = [
            'ваш браузер устарел',
            'browser is outdated',
            'доступ запрещен',
            'access denied',
            'cloudflare',
            'ddos protection',
            'проверка браузера',
            'browser check',
            'captcha',
            'robot',
            'bot detected'
        ]
        
        content_lower = content.lower()
        if any(msg in content_lower for msg in block_messages):
            # Пробуем извлечь контент напрямую из HTML
            main_content = soup.find('article') or soup.find('main') or soup.find('[role="article"]')
            if main_content:
                for script in main_content(["script", "style", "nav", "header", "footer", "aside", "noscript"]):
                    script.decompose()
                content = main_content.get_text(separator='\n', strip=True)
                content = self.clean_text(content)
            
            # Если все еще блокировка, пробуем найти title в HTML
            if not title or len(title) < 5:
                title_tag = soup.find('title')
                if title_tag:
                    title = title_tag.get_text(strip=True)
            
            # Если контент все еще подозрителен, выбрасываем ошибку
            if len(content) < 200 and any(msg in content_lower for msg in block_messages):
                from exceptions import ContentNotFound
                raise ContentNotFound(f"Site blocked parsing or requires authentication: {url}")
        
        # Проверка минимальной длины контента
        if len(content) < 50:
            raise ContentNotFound(f"Article content too short or not found: {url}")
        
        # Формирование результата
        result = {
            'title': title,
            'content': content,
            'excerpt': article.meta_description or article.summary or '',
            'author': ', '.join(article.authors) if article.authors else None,
            'published_at': self._parse_date(article.publish_date),
            'images': images,
            'metadata': metadata,
            'html': str(soup),
            'source': self.extract_domain(url),
        }
        
        return result
    
    async def _extract_images(self, soup: BeautifulSoup, base_url: str) -> List[Dict[str, Any]]:
        """
        Извлечение изображений из HTML.
        
        Args:
            soup: BeautifulSoup объект
            base_url: Базовый URL для нормализации
            
        Returns:
            Список изображений
        """
        images = []
        seen_urls = set()
        
        for img in soup.find_all('img'):
            # Пробуем разные атрибуты для src
            src = (img.get('src') or 
                   img.get('data-src') or 
                   img.get('data-lazy-src') or
                   img.get('data-original') or
                   img.get('data-url') or
                   img.get('data-image'))
            
            if not src:
                continue
            
            # Нормализация URL
            normalized_url = self.normalize_url(src, base_url)
            
            # Пропускаем дубликаты
            if normalized_url in seen_urls:
                continue
            seen_urls.add(normalized_url)
            
            # Пропускаем служебные изображения (иконки, логотипы, аватары)
            skip_patterns = ['icon', 'logo', 'avatar', 'favicon', 'sprite', 'button', 'arrow', 'close']
            url_lower = normalized_url.lower()
            if any(pattern in url_lower for pattern in skip_patterns):
                # Но пропускаем только если изображение маленькое
                width = img.get('width')
                height = img.get('height')
                if width and height:
                    try:
                        if int(width) < 100 or int(height) < 100:
                            continue
                    except (ValueError, TypeError):
                        pass
                else:
                    # Если нет размеров и это похоже на иконку, пропускаем
                    continue
            
            # Пропускаем маленькие изображения (вероятно иконки), но только если размеры указаны
            width = img.get('width')
            height = img.get('height')
            
            if width and height:
                try:
                    if int(width) < 50 or int(height) < 50:
                        continue
                except (ValueError, TypeError):
                    pass
            
            images.append({
                'url': normalized_url,
                'alt_text': img.get('alt', '') or img.get('title', ''),
                'width': self._parse_int(img.get('width')),
                'height': self._parse_int(img.get('height')),
            })
        
        return images
    
    def _extract_metadata(self, soup: BeautifulSoup, article: Article) -> Dict[str, Any]:
        """
        Извлечение дополнительных метаданных.
        
        Args:
            soup: BeautifulSoup объект
            article: Article объект из newspaper3k
            
        Returns:
            Словарь с метаданными
        """
        metadata = {}
        
        # Open Graph метатеги
        og_tags = {
            'og:title': 'og_title',
            'og:description': 'og_description',
            'og:image': 'og_image',
            'og:url': 'og_url',
            'og:type': 'og_type',
        }
        
        for og_name, key in og_tags.items():
            tag = soup.find('meta', property=og_name)
            if tag and tag.get('content'):
                metadata[key] = tag['content']
        
        # Twitter Card метатеги
        twitter_tags = {
            'twitter:title': 'twitter_title',
            'twitter:description': 'twitter_description',
            'twitter:image': 'twitter_image',
        }
        
        for twitter_name, key in twitter_tags.items():
            tag = soup.find('meta', attrs={'name': twitter_name})
            if tag and tag.get('content'):
                metadata[key] = tag['content']
        
        # Стандартные метатеги
        meta_description = soup.find('meta', attrs={'name': 'description'})
        if meta_description and meta_description.get('content'):
            metadata['description'] = meta_description['content']
        
        meta_keywords = soup.find('meta', attrs={'name': 'keywords'})
        if meta_keywords and meta_keywords.get('content'):
            metadata['keywords'] = meta_keywords['content']
        
        # Язык
        html_tag = soup.find('html')
        if html_tag and html_tag.get('lang'):
            metadata['language'] = html_tag['lang']
        
        return metadata
    
    def _parse_date(self, date: Optional[Any]) -> Optional[int]:
        """
        Парсинг даты в timestamp.
        
        Args:
            date: Дата (может быть datetime, string, или None)
            
        Returns:
            Unix timestamp или None
        """
        if not date:
            return None
        
        if isinstance(date, datetime):
            return int(date.timestamp())
        
        if isinstance(date, str):
            # Попытка парсинга строки
            try:
                from dateutil import parser as date_parser
                dt = date_parser.parse(date)
                return int(dt.timestamp())
            except:
                return None
        
        return None
    
    def _parse_int(self, value: Optional[Any]) -> Optional[int]:
        """Парсинг целого числа."""
        if not value:
            return None
        
        try:
            return int(value)
        except (ValueError, TypeError):
            return None

