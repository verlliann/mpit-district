"""Менеджер парсеров для выбора подходящего парсера."""

import yaml
from pathlib import Path
from typing import Optional, Dict, Any
from urllib.parse import urlparse

from parsers.base import BaseParser
from parsers.html_parser import HTMLParser
from parsers.rss_parser import RSSParser
from config_loader import SiteConfigLoader

# Опциональный импорт JavaScriptParser
try:
    from parsers.javascript_parser import JavaScriptParser
    HAS_JAVASCRIPT_PARSER = True
except ImportError:
    HAS_JAVASCRIPT_PARSER = False
    JavaScriptParser = None


class ParserManager:
    """Менеджер для выбора и управления парсерами."""
    
    def __init__(self, config_path: str = "config/sites.yaml"):
        """
        Инициализация менеджера парсеров.
        
        Args:
            config_path: Путь к файлу конфигурации сайтов
        """
        self.parsers = {
            'html': HTMLParser(),
            'rss': RSSParser(),
        }
        # Добавляем JavaScriptParser только если доступен
        if HAS_JAVASCRIPT_PARSER and JavaScriptParser:
            self.parsers['javascript'] = JavaScriptParser()
        
        self.config_loader = SiteConfigLoader(config_path)
    
    def get_parser(self, url: str) -> BaseParser:
        """
        Выбор парсера на основе URL.
        
        Args:
            url: URL статьи
            
        Returns:
            Подходящий парсер
        """
        domain = self._extract_domain(url)
        config = self.config_loader.get_config(domain)
        
        # Проверка на RSS/Atom ленту
        if self._is_rss_feed(url):
            return self.parsers['rss']
        
        # Использование конфигурации сайта
        if config:
            parser_type = config.get('parser_type', 'html')
            if parser_type == 'javascript' and HAS_JAVASCRIPT_PARSER and JavaScriptParser:
                return self.parsers['javascript']
            elif parser_type in self.parsers:
                return self.parsers[parser_type]
        
        # Fallback to HTML parser
        return self.parsers['html']
    
    async def parse_article(self, url: str, options: Dict[str, Any]) -> Dict[str, Any]:
        """
        Парсинг статьи с автоматическим выбором парсера.
        
        Args:
            url: URL статьи
            options: Опции парсинга
            
        Returns:
            Словарь с данными статьи
        """
        parser = self.get_parser(url)
        domain = self._extract_domain(url)
        config = self.config_loader.get_config(domain)
        
        # Добавление конфигурации сайта в опции
        if config:
            options = {**options, **config}
        
        # Попытка парсинга
        try:
            return await parser.parse(url, options)
        except Exception as e:
            # Если HTML парсер не справился, пробуем JavaScript парсер (если доступен)
            if parser.__class__.__name__ == 'HTMLParser' and HAS_JAVASCRIPT_PARSER and JavaScriptParser:
                print(f"[INFO] HTML parser failed, trying JavaScript parser...")
                js_parser = JavaScriptParser()
                return await js_parser.parse(url, {**options, 'use_headless_browser': True})
            else:
                raise
    
    def _extract_domain(self, url: str) -> str:
        """
        Извлечение домена из URL.
        
        Args:
            url: URL
            
        Returns:
            Домен
        """
        parsed = urlparse(url)
        domain = parsed.netloc or ""
        
        # Удаление www. префикса
        if domain.startswith('www.'):
            domain = domain[4:]
        
        return domain
    
    def _is_rss_feed(self, url: str) -> bool:
        """
        Проверка, является ли URL RSS/Atom лентой.
        
        Args:
            url: URL для проверки
            
        Returns:
            True если это RSS/Atom лента
        """
        url_lower = url.lower()
        return any(ext in url_lower for ext in ['/rss', '/feed', '/atom', '.rss', '.xml', 'rss.xml', 'feed.xml'])

