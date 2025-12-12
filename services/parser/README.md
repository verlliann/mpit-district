# Parser Service

Микросервис для парсинга и извлечения контента из веб-страниц новостных сайтов.

## Технологии

- Python 3.11+
- gRPC для межсервисной коммуникации
- BeautifulSoup4, Newspaper3k для парсинга HTML
- Playwright для JavaScript-сайтов и динамического контента
- Feedparser для RSS/Atom лент
- PDFPlumber, PyMuPDF для парсинга PDF файлов
- Redis для кэширования (опционально)

## Структура проекта

```
services/parser/
├── proto/              # Protocol Buffers определения
├── parsers/            # Парсеры (HTML, JS, RSS, PDF)
├── handlers/           # gRPC handlers
├── utils/              # Утилиты (rate limiter, cache, user agents, proxy)
├── config/             # Конфигурации сайтов (sites.yaml)
├── server.py           # gRPC сервер
├── parser_manager.py   # Менеджер парсеров
├── grpc_client.py      # gRPC клиент для тестирования
├── test_client.py      # Простой тестовый клиент
├── requirements.txt    # Зависимости
└── README.md           # Документация
```

## Быстрый старт

### Локальная разработка

```bash
# Установка зависимостей
pip install -r requirements.txt

# Генерация gRPC кода
python -m grpc_tools.protoc -I./proto --python_out=. --grpc_python_out=. proto/*.proto

# Запуск сервера
python server.py
```

### Docker

```bash
docker build -t ai-newsmaker/parser-service:latest .
docker run -p 50051:50051 ai-newsmaker/parser-service:latest
```

## API (gRPC)

### HealthCheck

Проверка состояния сервиса.

### ParseArticle

Парсинг одной статьи по URL. Возвращает:
- Заголовок, контент, автора, дату публикации
- Список изображений с URL, alt-текстом и размерами
- Метаданные (Open Graph, Twitter Cards)
- Информацию о стратегии парсинга

### ParseArticles

Пакетный парсинг статей (streaming).

### TestURL

Проверка, поддерживается ли URL и требуется ли браузер.

### GetSupportedSources

Получение списка поддерживаемых источников с конфигурациями.

## Конфигурация

Конфигурации для известных сайтов находятся в `config/sites.yaml`.

## Особенности

- **Извлечение изображений**: Автоматическое извлечение изображений из всех источников (HTML, RSS, Telegram, PDF)
- **Telegram поддержка**: Специальная обработка для Telegram постов через iframe
- **PDF парсинг**: Поддержка извлечения текста и изображений из PDF файлов
- **RSS/Atom**: Парсинг лент с извлечением изображений из media тегов
- **Fallback механизмы**: Автоматический переход между парсерами при ошибках
- **Кэширование**: Опциональное кэширование результатов в Redis

