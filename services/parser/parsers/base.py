"""Базовый класс для всех парсеров."""

from abc import ABC, abstractmethod
from typing import Dict, Any, Optional
from urllib.parse import urljoin, urlparse


class BaseParser(ABC):
    """Базовый класс для парсеров статей."""
    
    def __init__(self):
        self.timeout = 30
        self.user_agent = None
    
    @abstractmethod
    async def parse(self, url: str, options: Dict[str, Any]) -> Dict[str, Any]:
        """
        Парсинг статьи по URL.
        
        Args:
            url: URL статьи
            options: Дополнительные опции парсинга
            
        Returns:
            Словарь с данными статьи:
            - title: заголовок
            - content: основной текст
            - excerpt: краткое описание
            - author: автор
            - published_at: дата публикации (timestamp)
            - images: список изображений
            - metadata: дополнительные метаданные
        """
        pass
    
    def normalize_url(self, url: str, base_url: Optional[str] = None) -> str:
        """
        Нормализация URL.
        
        Args:
            url: URL для нормализации
            base_url: Базовый URL для относительных путей
            
        Returns:
            Нормализованный URL
        """
        if not url:
            return ""
        
        # Если URL уже абсолютный
        parsed = urlparse(url)
        if parsed.scheme:
            return url
        
        # Если есть базовый URL, делаем абсолютный путь
        if base_url:
            return urljoin(base_url, url)
        
        return url
    
    def extract_domain(self, url: str) -> str:
        """
        Извлечение домена из URL.
        
        Args:
            url: URL
            
        Returns:
            Домен
        """
        parsed = urlparse(url)
        return parsed.netloc or ""
    
    def clean_text(self, text: str) -> str:
        """
        Очистка текста от лишних пробелов и символов.
        
        Args:
            text: Исходный текст
            
        Returns:
            Очищенный текст
        """
        if not text:
            return ""
        
        # Удаление лишних пробелов и переносов строк
        lines = [line.strip() for line in text.split('\n')]
        lines = [line for line in lines if line]
        
        return '\n'.join(lines)

