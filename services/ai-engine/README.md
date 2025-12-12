# AI Engine Service

AI Engine Service для анализа контента и генерации постов с использованием LLM.

## Возможности

- ✅ Анализ контента статей
- ✅ Извлечение фактов
- ✅ Named Entity Recognition (NER)
- ✅ Извлечение цитат
- ✅ Анализ тональности
- ✅ Создание резюме
- ✅ Генерация постов для различных платформ
- ✅ Поддержка нескольких LLM провайдеров

## LLM Провайдеры

- **OpenAI** (GPT-4, GPT-4 Turbo)
- **Anthropic** (Claude 3 Sonnet, Claude Sonnet 4)
- **Yandex** (YandexGPT)

## Требования

- Python 3.11+
- API ключи для LLM провайдеров

## Установка

### Локальная разработка

1. Установите зависимости:
```bash
pip install -r requirements.txt
```

2. Сгенерируйте proto файлы:
```bash
./generate_proto.sh
```

3. Создайте `.env` файл:
```bash
cp env.example .env
# Отредактируйте .env и добавьте свои API ключи
```

4. Запустите сервис:
```bash
python main.py
```

### Docker

Запуск через Docker Compose (из корня проекта):
```bash
docker-compose up ai-engine-service
```

## Конфигурация

Переменные окружения (`.env`):

```env
# gRPC
GRPC_PORT=50052

# Storage Service
STORAGE_GRPC_URL=storage-service:50055

# OpenAI
OPENAI_API_KEY=sk-your-key
OPENAI_MODEL=gpt-4-turbo-preview

# Anthropic
ANTHROPIC_API_KEY=sk-ant-your-key
ANTHROPIC_MODEL=claude-3-sonnet-20240229

# Yandex GPT
YANDEX_API_KEY=your-key
YANDEX_FOLDER_ID=your-folder-id
YANDEX_MODEL=yandexgpt-lite

# Default provider
DEFAULT_LLM_PROVIDER=openai
```

## Использование

### Health Check

```bash
grpcurl -plaintext localhost:50052 common.AIEngineService/HealthCheck
```

### Анализ контента

```python
import grpc
from generated import ai_engine_pb2, ai_engine_pb2_grpc

channel = grpc.insecure_channel('localhost:50052')
stub = ai_engine_pb2_grpc.AIEngineServiceStub(channel)

request = ai_engine_pb2.AnalyzeContentRequest(
    article_id="article-123",
    title="Заголовок статьи",
    content="Полный текст статьи...",
    options=ai_engine_pb2.AnalysisOptions(
        extract_facts=True,
        extract_entities=True,
        extract_quotes=True,
        analyze_sentiment=True,
        generate_summary=True,
        max_facts=10,
        min_fact_importance=5
    )
)

response = stub.AnalyzeContent(request)
print(f"Facts: {len(response.facts)}")
print(f"Entities: {len(response.entities)}")
```

### Генерация постов

```python
request = ai_engine_pb2.GeneratePostsRequest(
    article_id="article-123",
    platforms=[
        common_pb2.PLATFORM_TELEGRAM,
        common_pb2.PLATFORM_VK,
        common_pb2.PLATFORM_INSTAGRAM
    ],
    style=common_pb2.POST_STYLE_ENGAGING,
    formality_level=7,
    key_facts=[
        storage_pb2.Fact(content="Ключевой факт 1"),
        storage_pb2.Fact(content="Ключевой факт 2")
    ],
    custom_instructions="Добавь призыв к действию"
)

response = stub.GeneratePosts(request)
for post in response.posts:
    print(f"Platform: {post.platform}")
    print(f"Content: {post.content}")
    print(f"Hashtags: {post.hashtags}")
```

## API Methods

- `HealthCheck` - проверка работоспособности
- `AnalyzeContent` - полный анализ контента
- `GeneratePosts` - генерация постов для нескольких платформ
- `GeneratePost` - генерация поста для одной платформы
- `RegeneratePost` - перегенерация поста с новыми параметрами
- `ExtractFacts` - извлечение фактов
- `ExtractEntities` - NER
- `ExtractQuotes` - извлечение цитат
- `AnalyzeSentiment` - анализ тональности
- `Summarize` - создание резюме

## Мониторинг

Сервис логирует все операции в JSON формате через structlog:

```json
{
  "event": "Content analyzed",
  "article_id": "article-123",
  "facts_count": 8,
  "entities_count": 12,
  "processing_time_ms": 2350,
  "provider": "openai",
  "model": "gpt-4-turbo-preview",
  "cost_usd": 0.0234
}
```

## Стоимость

Примерные цены (на январь 2025):

| Провайдер | Модель | Input (1M tokens) | Output (1M tokens) |
|-----------|--------|-------------------|-------------------|
| OpenAI | GPT-4o | $5 | $15 |
| OpenAI | GPT-4 Turbo | $10 | $30 |
| Anthropic | Claude Sonnet | $3 | $15 |
| Yandex | YandexGPT | ₽60 (~$0.6) | ₽120 (~$1.2) |

## Troubleshooting

### Ошибка "API key not found"
Проверьте переменные окружения и убедитесь, что API ключи настроены правильно.

### Ошибка "Failed to generate proto files"
Убедитесь, что установлен `grpcio-tools`:
```bash
pip install grpcio-tools
```

### Timeout при запросах
Увеличьте timeout в конфигурации или выберите более быстрый провайдер.

## Разработка

### Структура проекта

```
ai-engine/
├── main.py              # Точка входа
├── service.py           # gRPC servicer
├── config.py            # Конфигурация
├── llm_providers.py     # LLM провайдеры
├── prompts.py           # Prompt templates
├── requirements.txt     # Зависимости
├── Dockerfile          # Docker образ
├── generate_proto.sh   # Генерация proto
└── generated/          # Сгенерированные proto файлы
```

### Добавление нового провайдера

1. Создайте класс провайдера в `llm_providers.py`:
```python
class NewProvider(LLMProvider):
    def __init__(self):
        super().__init__("new_provider", "model-name")
    
    async def complete(self, prompt: str, **kwargs) -> LLMResponse:
        # Реализация
        pass
```

2. Добавьте в `get_llm_provider()`:
```python
providers = {
    "new_provider": NewProvider,
    # ...
}
```

## Лицензия

MIT

