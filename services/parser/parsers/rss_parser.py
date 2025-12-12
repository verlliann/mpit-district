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
            
            article = {
                'title': entry.title if hasattr(entry, 'title') else '',
                'content': entry.summary if hasattr(entry, 'summary') else '',
                'url': entry.link if hasattr(entry, 'link') else url,
                'author': entry.author if hasattr(entry, 'author') else None,
                'published_at': published_at,
                'excerpt': entry.summary if hasattr(entry, 'summary') else '',
                'images': [],
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

