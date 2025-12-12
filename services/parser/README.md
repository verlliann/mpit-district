# Parser Service

Микросервис для парсинга и извлечения контента из веб-страниц новостных сайтов.

## Технологии

- Python 3.11+
- gRPC для межсервисной коммуникации
- BeautifulSoup4, Newspaper3k для парсинга HTML
- Playwright для JavaScript-сайтов
- Redis для кэширования

## Структура проекта

```
services/parser/
├── proto/              # Protocol Buffers определения
├── parsers/            # Парсеры (HTML, JS, RSS)
├── handlers/           # gRPC handlers
├── utils/              # Утилиты (rate limiter, cache, etc.)
├── config/             # Конфигурации сайтов
├── tests/              # Тесты
├── server.py           # gRPC сервер
├── requirements.txt    # Зависимости
└── Dockerfile          # Docker образ
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

## API

### ParseArticle

Парсинг одной статьи по URL.

### BatchParseArticles

Пакетный парсинг статей (streaming).

### ValidateURL

Валидация и нормализация URL.

## Конфигурация

Конфигурации для известных сайтов находятся в `config/sites.yaml`.

## Мониторинг

Сервис экспортирует метрики Prometheus на порту 9090.

