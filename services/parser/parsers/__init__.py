"""Парсеры для извлечения контента из различных источников."""

from .base import BaseParser
from .html_parser import HTMLParser
from .rss_parser import RSSParser

# Опциональный импорт JavaScriptParser (требует Playwright)
try:
    from .javascript_parser import JavaScriptParser
    __all__ = [
        'BaseParser',
        'HTMLParser',
        'JavaScriptParser',
        'RSSParser',
    ]
except ImportError:
    # Playwright не установлен, JavaScriptParser недоступен
    __all__ = [
        'BaseParser',
        'HTMLParser',
        'RSSParser',
    ]

