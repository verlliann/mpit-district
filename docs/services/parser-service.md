# Parser Service

## Обзор

Parser Service отвечает за извлечение контента из веб-страниц новостных сайтов.

**Технологии:** Python 3.11+, gRPC, Newspaper3k, BeautifulSoup4, Playwright, Feedparser, PDFPlumber  
**Communication:** gRPC  
**Port:** 50051

---

## Архитектура

```
┌──────────────────────────────────────┐
│         Parser Service               │
│                                      │
│  ┌────────────┐                     │
│  │   gRPC     │                     │
│  │  Server    │                     │
│  └─────┬──────┘                     │
│        │                             │
│  ┌─────▼──────────────────┐         │
│  │   Parser Manager       │         │
│  └─────┬──────────────────┘         │
│        │                             │
│   ┌────┴────┬────────┬────────┐    │
│   │         │        │        │    │
│ ┌─▼──┐  ┌──▼─┐  ┌──▼─┐  ┌───▼┐     │
│ │RSS │  │HTML│  │JS  │  │PDF │     │
│ │Par │  │Par │  │Par │  │Par │     │
│ │ser │  │ser │  │ser │  │ser │     │
│ └────┘  └────┘  └────┘  └────┘     │
└──────────────────────────────────────┘
```

---

## Основные компоненты

### 1. gRPC Server

Обработка входящих gRPC запросов от GraphQL Gateway.

```python
# server.py
import grpc
from concurrent import futures
from proto import parser_pb2_grpc
from handlers import ParserServiceHandler

def serve():
    server = grpc.server(futures.ThreadPoolExecutor(max_workers=10))
    parser_pb2_grpc.add_ParserServiceServicer_to_server(
        ParserServiceHandler(), 
        server
    )
    server.add_insecure_port('[::]:50051')
    server.start()
    server.wait_for_termination()

if __name__ == '__main__':
    serve()
```

### 2. Parser Manager

Выбор подходящего парсера для конкретного сайта.

```python
# parser_manager.py
from typing import Optional
from parsers.base import BaseParser
from parsers.html_parser import HTMLParser
from parsers.javascript_parser import JavaScriptParser
from parsers.rss_parser import RSSParser

class ParserManager:
    def __init__(self):
        self.parsers = {
            'html': HTMLParser(),
            'javascript': JavaScriptParser(),
            'rss': RSSParser()
        }
        self.site_configs = self._load_site_configs()
    
    def get_parser(self, url: str) -> BaseParser:
        """Выбор парсера на основе URL"""
        domain = self._extract_domain(url)
        config = self.site_configs.get(domain)
        
        if config:
            parser_type = config.get('parser_type', 'html')
            return self.parsers[parser_type]
        
        # Fallback to HTML parser
        return self.parsers['html']
    
    async def parse_article(self, url: str, options: dict) -> dict:
        parser = self.get_parser(url)
        return await parser.parse(url, options)
```

### 3. HTML Parser

Парсинг статичных HTML страниц.

```python
# parsers/html_parser.py
from bs4 import BeautifulSoup
import requests
from newspaper import Article
from parsers.base import BaseParser

class HTMLParser(BaseParser):
    async def parse(self, url: str, options: dict) -> dict:
        # Использование newspaper3k для основного контента
        article = Article(url)
        article.download()
        article.parse()
        
        # Дополнительная обработка с BeautifulSoup
        soup = BeautifulSoup(article.html, 'html.parser')
        
        # Извлечение изображений
        images = self._extract_images(soup, url)
        
        # Извлечение метаданных
        metadata = self._extract_metadata(soup)
        
        return {
            'title': article.title,
            'content': article.text,
            'excerpt': article.meta_description,
            'author': ', '.join(article.authors) if article.authors else None,
            'published_at': article.publish_date,
            'images': images,
            'metadata': metadata,
            'html': str(soup)
        }
    
    def _extract_images(self, soup: BeautifulSoup, base_url: str) -> list:
        """
        Извлечение изображений из HTML.
        Поддерживает различные атрибуты: src, data-src, data-lazy-src, data-original, data-url, data-image.
        Фильтрует иконки и маленькие изображения.
        """
        images = []
        seen_urls = set()
        
        for img in soup.find_all('img'):
            # Пробуем разные атрибуты для src
            src = (img.get('src') or 
                   img.get('data-src') or 
                   img.get('data-lazy-src') or
                   img.get('data-original') or
                   img.get('data-url') or
                   img.get('data-image'))
            
            if not src:
                continue
            
            normalized_url = self.normalize_url(src, base_url)
            
            # Пропускаем дубликаты и служебные изображения
            if normalized_url in seen_urls:
                continue
            seen_urls.add(normalized_url)
            
            images.append({
                'url': normalized_url,
                'alt_text': img.get('alt', '') or img.get('title', ''),
                'width': self._parse_int(img.get('width')),
                'height': self._parse_int(img.get('height'))
            })
        
        return images
```

### 4. JavaScript Parser

Парсинг SPA и динамических сайтов с помощью headless browser (Playwright).
Поддерживает извлечение контента из iframe (например, Telegram виджеты).

```python
# parsers/javascript_parser.py
from playwright.async_api import async_playwright
from parsers.html_parser import HTMLParser

class JavaScriptParser(HTMLParser):
    async def parse(self, url: str, options: dict) -> dict:
        async with async_playwright() as p:
            browser = await p.chromium.launch(headless=True)
            page = await browser.new_page()
            
            # Блокировка медиа (опционально)
            if options.get('block_media', False):
                await page.route("**/*.{png,jpg,jpeg,gif,svg,css,woff,woff2}", 
                               lambda route: route.abort())
            
            # Загрузка страницы
            wait_until = options.get('wait_until', 'load')
            await page.goto(url, wait_until=wait_until, timeout=options.get('timeout_seconds', 60000))
            
            # Специальная обработка для Telegram
            if 't.me' in url:
                # Ожидание и извлечение из iframe
                telegram_content, telegram_images = await self._extract_from_telegram_iframe(page)
            
            # Прокрутка для lazy loading
            await page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
            await asyncio.sleep(2)
            
            # Получение HTML
            html = await page.content()
            
            await browser.close()
            
            # Обработка полученного HTML с извлечением изображений
            return await self._parse_html(html, url, options, 
                                         telegram_content=telegram_content,
                                         telegram_images=telegram_images)
    
    async def _extract_from_telegram_iframe(self, page):
        """Извлечение контента и изображений из Telegram iframe"""
        # Поиск и переключение на iframe
        # Извлечение через JavaScript evaluate()
        # Возвращает (content, images)
        pass
```

### 5. RSS Parser

Парсинг RSS/Atom лент с извлечением изображений из media тегов и HTML контента.

```python
# parsers/rss_parser.py
import feedparser
from parsers.base import BaseParser

class RSSParser(BaseParser):
    async def parse(self, url: str, options: dict) -> dict:
        feed = feedparser.parse(url)
        
        articles = []
        for entry in feed.entries:
            # Извлечение изображений из media:content, media:thumbnail, enclosure и HTML
            images = self._extract_images_from_entry(entry, url, options)
            
            articles.append({
                'title': entry.title,
                'content': entry.summary if hasattr(entry, 'summary') else '',
                'url': entry.link,
                'author': entry.author if hasattr(entry, 'author') else None,
                'published_at': entry.published_parsed if hasattr(entry, 'published_parsed') else None,
                'images': images
            })
        
        return articles
```

### 6. PDF Parser

Парсинг PDF файлов с извлечением текста, метаданных и изображений.

```python
# parsers/pdf_parser.py
import pdfplumber
from parsers.base import BaseParser

class PDFParser(BaseParser):
    async def parse(self, url: str, options: dict) -> dict:
        # Скачивание PDF
        response = requests.get(url, timeout=options.get('timeout_seconds', 30))
        pdf_bytes = response.content
        
        # Извлечение текста и метаданных
        with pdfplumber.open(io.BytesIO(pdf_bytes)) as pdf:
            pages_text = []
            for page in pdf.pages:
                text = page.extract_text()
                if text:
                    pages_text.append(text)
            
            content = '\n\n'.join(pages_text)
            metadata = pdf.metadata or {}
        
        # Извлечение изображений (если используется PyMuPDF)
        images = []
        if options.get('extract_images', True) and HAS_PYMUPDF:
            images = self._extract_images_from_pdf(pdf_bytes)
        
        return {
            'title': metadata.get('Title', ''),
            'content': content,
            'author': metadata.get('Author'),
            'published_at': None,
            'images': images,
            'metadata': metadata
        }
```

---

## Site Configurations

### Конфигурация для известных сайтов

```yaml
# config/sites.yaml
tass.ru:
  parser_type: html
  selectors:
    title: h1.ds_doc-header
    content: .text-block
    author: .ds_doc-author
    date: time.ds_doc-header_date
  rate_limit: 2  # requests per second

ria.ru:
  parser_type: html
  selectors:
    title: .article__title
    content: .article__body
    author: .article__author-name
    date: .article__info-date

interfax.ru:
  parser_type: javascript  # Требует JS
  selectors:
    title: h1
    content: article.article
  wait_for: article.article
  rate_limit: 1
```

### Загрузка конфигурации

```python
# config_loader.py
import yaml
from pathlib import Path

class SiteConfigLoader:
    def __init__(self, config_path: str = "config/sites.yaml"):
        self.config_path = Path(config_path)
        self.configs = self._load_configs()
    
    def _load_configs(self) -> dict:
        if not self.config_path.exists():
            return {}
        
        with open(self.config_path, 'r', encoding='utf-8') as f:
            return yaml.safe_load(f)
    
    def get_config(self, domain: str) -> dict:
        return self.configs.get(domain, {})
```

---

## Anti-Bot Bypass

### User Agent Rotation

```python
# utils/user_agents.py
import random

USER_AGENTS = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36',
]

def get_random_user_agent() -> str:
    return random.choice(USER_AGENTS)
```

### Proxy Support

```python
# utils/proxy.py
import os
from typing import Optional

class ProxyManager:
    def __init__(self):
        self.proxies = self._load_proxies()
        self.current_index = 0
    
    def _load_proxies(self) -> list:
        proxy_list = os.getenv('PROXY_LIST', '').split(',')
        return [p.strip() for p in proxy_list if p.strip()]
    
    def get_proxy(self) -> Optional[dict]:
        if not self.proxies:
            return None
        
        proxy = self.proxies[self.current_index]
        self.current_index = (self.current_index + 1) % len(self.proxies)
        
        return {
            'http': proxy,
            'https': proxy
        }
```

---

## Rate Limiting

### Per-domain rate limiter

```python
# utils/rate_limiter.py
import asyncio
from collections import defaultdict
from datetime import datetime, timedelta

class RateLimiter:
    def __init__(self):
        self.requests = defaultdict(list)
        self.limits = {}  # domain -> requests_per_second
    
    def set_limit(self, domain: str, requests_per_second: int):
        self.limits[domain] = requests_per_second
    
    async def acquire(self, domain: str):
        limit = self.limits.get(domain, 5)  # Default: 5 req/sec
        now = datetime.now()
        
        # Очистка старых запросов
        self.requests[domain] = [
            req_time for req_time in self.requests[domain]
            if now - req_time < timedelta(seconds=1)
        ]
        
        # Проверка лимита
        if len(self.requests[domain]) >= limit:
            sleep_time = 1.0 - (now - self.requests[domain][0]).total_seconds()
            if sleep_time > 0:
                await asyncio.sleep(sleep_time)
        
        self.requests[domain].append(now)
```

---

## Error Handling

```python
# exceptions.py
class ParserException(Exception):
    """Base parser exception"""
    pass

class URLNotSupported(ParserException):
    """URL is not supported"""
    pass

class ParsingTimeout(ParserException):
    """Parsing timeout exceeded"""
    pass

class ContentNotFound(ParserException):
    """Article content not found"""
    pass

class RateLimitExceeded(ParserException):
    """Rate limit exceeded"""
    pass
```

### Error Handler

```python
# handlers/error_handler.py
from grpc import StatusCode
import grpc

def handle_parsing_error(func):
    async def wrapper(*args, **kwargs):
        try:
            return await func(*args, **kwargs)
        except URLNotSupported as e:
            context.set_code(StatusCode.INVALID_ARGUMENT)
            context.set_details(f'URL not supported: {str(e)}')
            return None
        except ParsingTimeout as e:
            context.set_code(StatusCode.DEADLINE_EXCEEDED)
            context.set_details(f'Parsing timeout: {str(e)}')
            return None
        except ContentNotFound as e:
            context.set_code(StatusCode.NOT_FOUND)
            context.set_details(f'Content not found: {str(e)}')
            return None
        except Exception as e:
            context.set_code(StatusCode.INTERNAL)
            context.set_details(f'Internal error: {str(e)}')
            return None
    
    return wrapper
```

---

## Caching

```python
# cache.py
import redis
import json
from typing import Optional
import hashlib

class ParserCache:
    def __init__(self, redis_url: str = "redis://localhost:6379"):
        self.redis = redis.from_url(redis_url)
        self.ttl = 3600  # 1 hour
    
    def _make_key(self, url: str) -> str:
        return f"parser:article:{hashlib.md5(url.encode()).hexdigest()}"
    
    def get(self, url: str) -> Optional[dict]:
        key = self._make_key(url)
        data = self.redis.get(key)
        if data:
            return json.loads(data)
        return None
    
    def set(self, url: str, article: dict):
        key = self._make_key(url)
        self.redis.setex(key, self.ttl, json.dumps(article))
```

---

## Testing

### Unit Tests

```python
# tests/test_html_parser.py
import pytest
from parsers.html_parser import HTMLParser

@pytest.mark.asyncio
async def test_parse_article():
    parser = HTMLParser()
    url = "https://example.com/article"
    
    result = await parser.parse(url, {})
    
    assert result['title']
    assert result['content']
    assert len(result['content']) > 100

@pytest.mark.asyncio
async def test_extract_images():
    parser = HTMLParser()
    # ... test implementation
```

### Integration Tests

```python
# tests/test_parser_service.py
import grpc
from proto import parser_pb2, parser_pb2_grpc

def test_parse_article_grpc():
    channel = grpc.insecure_channel('localhost:50051')
    client = parser_pb2_grpc.ParserServiceStub(channel)
    
    request = parser_pb2.ParseRequest(
        url="https://tass.ru/example",
        user_id="test-user"
    )
    
    response = client.ParseArticle(request)
    
    assert response.title
    assert response.content
```

---

## Deployment

### Docker

```dockerfile
# Dockerfile
FROM python:3.11-slim

WORKDIR /app

# Установка зависимостей для Playwright
RUN apt-get update && apt-get install -y \
    wget \
    gnupg \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Установка браузеров для Playwright
RUN playwright install chromium
RUN playwright install-deps chromium

COPY . .

EXPOSE 50051

CMD ["python", "server.py"]
```

### Kubernetes

```yaml
# k8s/parser-service.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: parser-service
spec:
  replicas: 3
  selector:
    matchLabels:
      app: parser-service
  template:
    metadata:
      labels:
        app: parser-service
    spec:
      containers:
      - name: parser-service
        image: ai-newsmaker/parser-service:latest
        ports:
        - containerPort: 50051
          protocol: TCP
        env:
        - name: REDIS_URL
          value: "redis://redis-service:6379"
        resources:
          requests:
            memory: "512Mi"
            cpu: "500m"
          limits:
            memory: "1Gi"
            cpu: "1000m"
        livenessProbe:
          grpc:
            port: 50051
          initialDelaySeconds: 10
          periodSeconds: 10
        readinessProbe:
          grpc:
            port: 50051
          initialDelaySeconds: 5
          periodSeconds: 5
---
apiVersion: v1
kind: Service
metadata:
  name: parser-service
spec:
  selector:
    app: parser-service
  ports:
  - port: 50051
    targetPort: 50051
    protocol: TCP
  type: ClusterIP
```

---

## Monitoring

### Metrics

```python
# metrics.py
from prometheus_client import Counter, Histogram, Gauge

parse_requests_total = Counter(
    'parser_requests_total',
    'Total number of parse requests',
    ['status']
)

parse_duration_seconds = Histogram(
    'parser_duration_seconds',
    'Time spent parsing articles',
    ['parser_type']
)

active_parsers = Gauge(
    'parser_active_parsers',
    'Number of currently active parsers'
)
```

---

**См. также:**
- [gRPC Services](../api/grpc/services.md)
- [Архитектура](../architecture/microservices.md)
- [Development Setup](../development/setup.md)

