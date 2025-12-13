"""Кэш для результатов парсинга."""

import json
import hashlib
from typing import Optional, Dict, Any
from datetime import timedelta

try:
    import redis
    HAS_REDIS = True
except ImportError:
    HAS_REDIS = False
    redis = None


class ParserCache:
    """Кэш для результатов парсинга статей."""
    
    def __init__(self, redis_url: str = "redis://localhost:6379", ttl: int = 3600):
        """
        Инициализация кэша.
        
        Args:
            redis_url: URL Redis сервера
            ttl: Time to live в секундах (по умолчанию 1 час)
        """
        self.redis = None
        self.ttl = ttl
        
        if HAS_REDIS and redis:
            try:
                self.redis = redis.from_url(redis_url, decode_responses=True)
                self.redis.ping()  # Проверка подключения
            except Exception as e:
                print(f"Warning: Redis connection failed: {e}. Cache disabled.")
                self.redis = None
        else:
            print("Warning: Redis not available. Cache disabled.")
    
    def _make_key(self, url: str) -> str:
        """
        Создание ключа кэша для URL.
        
        Args:
            url: URL статьи
            
        Returns:
            Ключ кэша
        """
        url_hash = hashlib.md5(url.encode()).hexdigest()
        return f"parser:article:{url_hash}"
    
    def get(self, url: str) -> Optional[Dict[str, Any]]:
        """
        Получение статьи из кэша.
        
        Args:
            url: URL статьи
            
        Returns:
            Словарь с данными статьи или None
        """
        if not self.redis:
            return None
        
        try:
            key = self._make_key(url)
            data = self.redis.get(key)
            if data:
                return json.loads(data)
        except Exception as e:
            print(f"Cache get error: {e}")
        
        return None
    
    def set(self, url: str, article: Dict[str, Any]) -> None:
        """
        Сохранение статьи в кэш.
        
        Args:
            url: URL статьи
            article: Словарь с данными статьи
        """
        if not self.redis:
            return
        
        try:
            key = self._make_key(url)
            data = json.dumps(article, default=str)
            self.redis.setex(key, self.ttl, data)
        except Exception as e:
            print(f"Cache set error: {e}")
    
    def delete(self, url: str) -> None:
        """
        Удаление статьи из кэша.
        
        Args:
            url: URL статьи
        """
        if not self.redis:
            return
        
        try:
            key = self._make_key(url)
            self.redis.delete(key)
        except Exception as e:
            print(f"Cache delete error: {e}")

