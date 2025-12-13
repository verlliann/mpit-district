"""Rate limiter для ограничения запросов к сайтам."""

import asyncio
from collections import defaultdict
from datetime import datetime, timedelta
from typing import Dict, List


class RateLimiter:
    """Rate limiter для ограничения запросов по доменам."""
    
    def __init__(self):
        """Инициализация rate limiter."""
        self.requests: Dict[str, List[datetime]] = defaultdict(list)
        self.limits: Dict[str, int] = {}  # domain -> requests_per_second
    
    def set_limit(self, domain: str, requests_per_second: int) -> None:
        """
        Установка лимита для домена.
        
        Args:
            domain: Домен
            requests_per_second: Количество запросов в секунду
        """
        self.limits[domain] = requests_per_second
    
    async def acquire(self, domain: str) -> None:
        """
        Получение разрешения на запрос (блокирует если лимит превышен).
        
        Args:
            domain: Домен для которого нужно получить разрешение
        """
        limit = self.limits.get(domain, 5)  # Default: 5 req/sec
        now = datetime.now()
        
        # Очистка старых запросов (старше 1 секунды)
        self.requests[domain] = [
            req_time for req_time in self.requests[domain]
            if (now - req_time).total_seconds() < 1.0
        ]
        
        # Проверка лимита
        if len(self.requests[domain]) >= limit:
            # Вычисляем время ожидания
            oldest_request = self.requests[domain][0]
            elapsed = (now - oldest_request).total_seconds()
            sleep_time = 1.0 - elapsed
            
            if sleep_time > 0:
                await asyncio.sleep(sleep_time)
                # Обновляем время после ожидания
                now = datetime.now()
                # Очищаем старые запросы снова
                self.requests[domain] = [
                    req_time for req_time in self.requests[domain]
                    if (now - req_time).total_seconds() < 1.0
                ]
        
        # Добавляем текущий запрос
        self.requests[domain].append(now)

