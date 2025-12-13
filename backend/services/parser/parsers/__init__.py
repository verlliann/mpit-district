"""Парсеры для извлечения контента из различных источников."""

from .base import BaseParser
from .html_parser import HTMLParser
from .rss_parser import RSSParser

# Опциональный импорт JavaScriptParser (требует Playwright)
try:
    from .javascript_parser import JavaScriptParser
    HAS_JAVASCRIPT_PARSER = True
except ImportError:
    HAS_JAVASCRIPT_PARSER = False
    JavaScriptParser = None

# Опциональный импорт PDFParser (требует pdfplumber или PyMuPDF)
try:
    from .pdf_parser import PDFParser
    HAS_PDF_PARSER = True
except ImportError:
    HAS_PDF_PARSER = False
    PDFParser = None

# Формирование списка экспортируемых классов
__all__ = ['BaseParser', 'HTMLParser', 'RSSParser']

if HAS_JAVASCRIPT_PARSER and JavaScriptParser:
    __all__.append('JavaScriptParser')

if HAS_PDF_PARSER and PDFParser:
    __all__.append('PDFParser')

