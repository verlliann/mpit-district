"""RSS/Atom парсер для лент новостей."""

import feedparser
from typing import Dict, Any, List
from datetime import datetime

from .base import BaseParser
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from exceptions import URLNotSupported


class RSSParser(BaseParser):
    """Парсер для RSS/Atom лент."""
    
    async def parse(self, url: str, options: Dict[str, Any]) -> Dict[str, Any]:
        """
        Парсинг RSS/Atom ленты.
        
        Args:
            url: URL RSS/Atom ленты
            options: Опции парсинга
            
        Returns:
            Словарь со списком статей из ленты
        """
        try:
            feed = feedparser.parse(url)
        except Exception as e:
            raise URLNotSupported(f"Failed to parse RSS feed: {str(e)}")
        
        if feed.bozo and feed.bozo_exception:
            raise URLNotSupported(f"Invalid RSS feed: {feed.bozo_exception}")
        
        articles = []
        
        for entry in feed.entries:
            # Парсинг даты
            published_at = None
            if hasattr(entry, 'published_parsed') and entry.published_parsed:
                try:
                    published_at = int(datetime(*entry.published_parsed[:6]).timestamp())
                except:
                    pass
            
            # Извлечение изображений из RSS записи
            images = []
            extract_images = options.get('extract_images', True)
            if extract_images:
                # Пробуем разные способы извлечения изображений
                # 1. Из media:content (Media RSS)
                if hasattr(entry, 'media_content'):
                    for media in entry.media_content:
                        if media.get('type', '').startswith('image/'):
                            images.append({
                                'url': media.get('url', ''),
                                'alt_text': media.get('description', '') or '',
                                'width': media.get('width', 0) or 0,
                                'height': media.get('height', 0) or 0,
                            })
                
                # 2. Из media:thumbnail
                if hasattr(entry, 'media_thumbnail'):
                    for thumb in entry.media_thumbnail:
                        images.append({
                            'url': thumb.get('url', ''),
                            'alt_text': '',
                            'width': thumb.get('width', 0) or 0,
                            'height': thumb.get('height', 0) or 0,
                        })
                
                # 3. Из enclosure (если это изображение)
                if hasattr(entry, 'enclosures'):
                    for enc in entry.enclosures:
                        if enc.get('type', '').startswith('image/'):
                            images.append({
                                'url': enc.get('href', ''),
                                'alt_text': '',
                                'width': 0,
                                'height': 0,
                            })
                
                # 4. Из content/summary (парсим HTML)
                content_html = entry.get('content', [{}])[0].get('value', '') if hasattr(entry, 'content') else ''
                if not content_html:
                    content_html = entry.get('summary', '')
                
                if content_html:
                    try:
                        from bs4 import BeautifulSoup
                        soup = BeautifulSoup(content_html, 'html.parser')
                        for img in soup.find_all('img'):
                            src = img.get('src') or img.get('data-src') or ''
                            if src:
                                # Нормализация URL
                                normalized_url = self.normalize_url(src, entry.link if hasattr(entry, 'link') else url)
                                
                                # Парсинг размеров
                                def _parse_int(value):
                                    try:
                                        return int(value) if value else 0
                                    except (ValueError, TypeError):
                                        return 0
                                
                                width = _parse_int(img.get('width'))
                                height = _parse_int(img.get('height'))
                                
                                images.append({
                                    'url': normalized_url,
                                    'alt_text': img.get('alt', ''),
                                    'width': width,
                                    'height': height,
                                })
                    except:
                        pass
            
            article = {
                'title': entry.title if hasattr(entry, 'title') else '',
                'content': entry.summary if hasattr(entry, 'summary') else '',
                'url': entry.link if hasattr(entry, 'link') else url,
                'author': entry.author if hasattr(entry, 'author') else None,
                'published_at': published_at,
                'excerpt': entry.summary if hasattr(entry, 'summary') else '',
                'images': images,
                'metadata': {
                    'feed_title': feed.feed.title if hasattr(feed.feed, 'title') else '',
                    'feed_link': feed.feed.link if hasattr(feed.feed, 'link') else '',
                },
                'source': self.extract_domain(entry.link if hasattr(entry, 'link') else url),
            }
            
            articles.append(article)
        
        # Если запрошена одна статья, возвращаем первую
        if options.get('single_article', False) and articles:
            return articles[0]
        
        # Иначе возвращаем список статей
        return {
            'articles': articles,
            'feed_info': {
                'title': feed.feed.title if hasattr(feed.feed, 'title') else '',
                'link': feed.feed.link if hasattr(feed.feed, 'link') else '',
                'description': feed.feed.description if hasattr(feed.feed, 'description') else '',
            }
        }

