"""Утилиты для работы с прокси."""

import os
from typing import Optional, Dict, List


class ProxyManager:
    """Менеджер прокси для обхода блокировок."""
    
    def __init__(self):
        """Инициализация менеджера прокси."""
        self.proxies: List[str] = []
        self.current_index = 0
        self._load_proxies()
    
    def _load_proxies(self) -> None:
        """Загрузка прокси из переменных окружения."""
        proxy_list = os.getenv('PROXY_LIST', '')
        if proxy_list:
            self.proxies = [p.strip() for p in proxy_list.split(',') if p.strip()]
    
    def get_proxy(self) -> Optional[Dict[str, str]]:
        """
        Получение следующего прокси (round-robin).
        
        Returns:
            Словарь с прокси или None
        """
        if not self.proxies:
            return None
        
        proxy = self.proxies[self.current_index]
        self.current_index = (self.current_index + 1) % len(self.proxies)
        
        return {
            'http': proxy,
            'https': proxy
        }
    
    def add_proxy(self, proxy: str) -> None:
        """
        Добавление прокси в список.
        
        Args:
            proxy: URL прокси
        """
        if proxy and proxy not in self.proxies:
            self.proxies.append(proxy)
    
    def remove_proxy(self, proxy: str) -> None:
        """
        Удаление прокси из списка.
        
        Args:
            proxy: URL прокси
        """
        if proxy in self.proxies:
            self.proxies.remove(proxy)
            if self.current_index >= len(self.proxies):
                self.current_index = 0

