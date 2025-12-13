"""Загрузчик конфигураций сайтов."""

import yaml
from pathlib import Path
from typing import Dict, Any, Optional


class SiteConfigLoader:
    """Загрузчик конфигураций для различных сайтов."""
    
    def __init__(self, config_path: str = "config/sites.yaml"):
        """
        Инициализация загрузчика конфигураций.
        
        Args:
            config_path: Путь к файлу конфигурации
        """
        self.config_path = Path(config_path)
        self.configs: Dict[str, Any] = {}
        self._load_configs()
    
    def _load_configs(self) -> None:
        """Загрузка конфигураций из файла."""
        if not self.config_path.exists():
            # Используем дефолтную конфигурацию
            self.configs = self._get_default_configs()
            return
        
        try:
            with open(self.config_path, 'r', encoding='utf-8') as f:
                self.configs = yaml.safe_load(f) or {}
        except Exception as e:
            print(f"Warning: Failed to load config file: {e}")
            self.configs = self._get_default_configs()
    
    def get_config(self, domain: str) -> Dict[str, Any]:
        """
        Получение конфигурации для домена.
        
        Args:
            domain: Домен сайта
            
        Returns:
            Словарь с конфигурацией или пустой словарь
        """
        return self.configs.get(domain, {})
    
    def _get_default_configs(self) -> Dict[str, Any]:
        """
        Получение дефолтных конфигураций.
        
        Returns:
            Словарь с дефолтными конфигурациями
        """
        return {
            'tass.ru': {
                'parser_type': 'html',
                'selectors': {
                    'title': 'h1.ds_doc-header',
                    'content': '.text-block',
                    'author': '.ds_doc-author',
                    'date': 'time.ds_doc-header_date',
                },
                'rate_limit': 2,
            },
            'ria.ru': {
                'parser_type': 'html',
                'selectors': {
                    'title': '.article__title',
                    'content': '.article__body',
                    'author': '.article__author-name',
                    'date': '.article__info-date',
                },
                'rate_limit': 2,
            },
            'interfax.ru': {
                'parser_type': 'javascript',
                'selectors': {
                    'title': 'h1',
                    'content': 'article.article',
                },
                'wait_for_selector': 'article.article',
                'rate_limit': 1,
            },
        }

