# AI Newsmaker Backend

Бэкенд для AI Newsmaker - системы автоматической генерации постов из новостных статей.

## Сервисы

### AI Engine Service (порт 50052)

gRPC сервис для работы с AI/LLM:
- Анализ контента статей
- Извлечение фактов, сущностей, цитат
- Анализ тональности
- Генерация постов для социальных сетей
- Саммаризация текста

Поддерживаемые LLM провайдеры:
- OpenAI (GPT-4, GPT-3.5)
- Anthropic (Claude 3)
- Yandex GPT

### Media Service (порт 50053)

gRPC сервис для работы с медиа:
- Загрузка/скачивание изображений
- Обработка изображений (resize, crop, filters)
- Генерация изображений через AI (DALL-E, Kandinsky)
- Создание инфографики
- OCR (извлечение текста из изображений)
- Оптимизация под платформы

## Требования

- Docker & Docker Compose
- API ключи (по необходимости):
  - OpenAI API Key
  - Anthropic API Key
  - Yandex API Key

## Быстрый старт

1. Создайте файл `.env` в корне проекта:

```bash
# LLM Providers
OPENAI_API_KEY=sk-your-openai-key
ANTHROPIC_API_KEY=sk-ant-your-anthropic-key
YANDEX_API_KEY=your-yandex-key
YANDEX_FOLDER_ID=your-folder-id

# Default LLM provider (openai, anthropic, yandex)
DEFAULT_LLM_PROVIDER=openai
```

2. Запустите сервисы:

```bash
docker-compose up -d
```

3. Проверьте статус:

```bash
docker-compose ps
```

## Структура проекта

```
├── docker-compose.yml
├── common.proto          # Общие типы
├── storage.proto         # Storage сервис proto
├── ai_engine.proto       # AI Engine сервис proto
├── media.proto          # Media сервис proto
├── parser.proto         # Parser сервис proto
└── services/
    ├── ai-engine/       # AI Engine сервис
    │   ├── Dockerfile
    │   ├── main.py
    │   ├── service.py
    │   ├── config.py
    │   ├── llm_providers.py
    │   ├── prompts.py
    │   └── requirements.txt
    └── media/           # Media сервис
        ├── Dockerfile
        ├── main.py
        ├── service.py
        ├── config.py
        ├── minio_client.py
        ├── image_processor.py
        ├── image_generator.py
        └── requirements.txt
```

## API Endpoints

### AI Engine Service

| Метод | Описание |
|-------|----------|
| `HealthCheck` | Проверка состояния сервиса |
| `AnalyzeContent` | Комплексный анализ статьи |
| `GeneratePosts` | Генерация постов для нескольких платформ |
| `GeneratePost` | Генерация поста для одной платформы |
| `RegeneratePost` | Перегенерация поста |
| `ExtractFacts` | Извлечение фактов |
| `ExtractEntities` | Извлечение сущностей (NER) |
| `ExtractQuotes` | Извлечение цитат |
| `AnalyzeSentiment` | Анализ тональности |
| `Summarize` | Саммаризация текста |

### Media Service

| Метод | Описание |
|-------|----------|
| `HealthCheck` | Проверка состояния сервиса |
| `UploadImage` | Загрузка изображения (streaming) |
| `DownloadImage` | Скачивание изображения (streaming) |
| `ProcessImage` | Обработка изображения |
| `GenerateImage` | Генерация изображения через AI |
| `CreateInfographic` | Создание инфографики |
| `OptimizeForPlatform` | Оптимизация под платформу |
| `ExtractText` | OCR - извлечение текста |
| `GetImageMetadata` | Получение метаданных |

## Разработка

### Локальный запуск без Docker

1. Установите зависимости:

```bash
cd services/ai-engine
pip install -r requirements.txt

cd ../media
pip install -r requirements.txt
```

2. Сгенерируйте gRPC код:

```bash
cd services/ai-engine
chmod +x generate_proto.sh
./generate_proto.sh

cd ../media
chmod +x generate_proto.sh
./generate_proto.sh
```

3. Запустите сервисы:

```bash
# AI Engine
cd services/ai-engine
python main.py

# Media (в другом терминале)
cd services/media
python main.py
```

## Лицензия

MIT

