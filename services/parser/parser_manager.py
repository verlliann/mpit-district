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

# Опциональный импорт PDFParser
try:
    from parsers.pdf_parser import PDFParser
    HAS_PDF_PARSER = True
except ImportError:
    HAS_PDF_PARSER = False
    PDFParser = None


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
        
        # Добавляем PDFParser только если доступен
        if HAS_PDF_PARSER and PDFParser:
            self.parsers['pdf'] = PDFParser()
        
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
        
        # Проверка на PDF файл
        if self._is_pdf(url):
            if HAS_PDF_PARSER and PDFParser and 'pdf' in self.parsers:
                return self.parsers['pdf']
            else:
                raise ImportError("PDF parser not available. Install pdfplumber or pymupdf.")
        
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
        
        # Специальная обработка для Telegram - всегда используем JavaScript парсер
        if 't.me' in url and HAS_JAVASCRIPT_PARSER and JavaScriptParser:
            return self.parsers['javascript']
        
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
            # Объединяем опции с конфигурацией (конфигурация имеет приоритет)
            options = {**options, **config}
            # Если в конфигурации указан use_headless_browser или parser_type=javascript, используем браузер
            if (config.get('use_headless_browser') or config.get('parser_type') == 'javascript') and not options.get('use_browser'):
                options['use_browser'] = True
        
        # Попытка парсинга
        try:
            return await parser.parse(url, options)
        except Exception as e:
            # Если HTML парсер не справился, пробуем JavaScript парсер (если доступен)
            if parser.__class__.__name__ == 'HTMLParser' and HAS_JAVASCRIPT_PARSER and JavaScriptParser:
                print(f"[INFO] HTML parser failed, trying JavaScript parser...")
                js_parser = JavaScriptParser()
                # Используем те же опции, что и в test_client.py
                js_options = {
                    **options,
                    'use_browser': True,
                    'use_headless_browser': True,
                    'wait_until': options.get('wait_until', 'load'),
                    'block_media': options.get('block_media', False),
                }
                return await js_parser.parse(url, js_options)
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
    
    def _is_pdf(self, url: str) -> bool:
        """
        Проверка, является ли URL PDF файлом.
        
        Args:
            url: URL для проверки
            
        Returns:
            True если это PDF файл
        """
        url_lower = url.lower()
        return url_lower.endswith('.pdf') or '/pdf' in url_lower or 'application/pdf' in url_lower

