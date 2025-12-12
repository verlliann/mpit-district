# AI Engine Service

## Обзор

AI Engine Service обрабатывает текст с помощью LLM (Large Language Models) для анализа и генерации контента.

**Технологии:** Python 3.11+, FastAPI, LangChain, Transformers  
**LLM APIs:** Claude Sonnet 4, GPT-4o, YandexGPT  
**Communication:** gRPC  
**Port:** 50052

---

## Архитектура

```
┌──────────────────────────────────────────┐
│         AI Engine Service                │
│                                          │
│  ┌────────────┐      ┌──────────────┐  │
│  │   gRPC     │      │  Prompt      │  │
│  │  Server    │─────▶│  Manager     │  │
│  └────────────┘      └──────┬───────┘  │
│                              │          │
│              ┌───────────────┼──────────────┐
│              │               │              │
│       ┌──────▼──────┐ ┌─────▼──────┐ ┌────▼─────┐
│       │   Analyzer  │ │ Generator  │ │  Fact    │
│       │   Module    │ │   Module   │ │ Checker  │
│       └──────┬──────┘ └─────┬──────┘ └────┬─────┘
│              │               │              │
│              └───────────────┼──────────────┘
│                              │
│                      ┌───────▼───────┐
│                      │ LLM Providers │
│                      │ Claude/GPT-4  │
│                      └───────────────┘
└──────────────────────────────────────────┘
```

---

## Основные модули

### 1. Analyzer Module

Анализ контента статьи.

```python
# modules/analyzer.py
from langchain.prompts import ChatPromptTemplate
from langchain.output_parsers import PydanticOutputParser
from pydantic import BaseModel, Field

class AnalysisResult(BaseModel):
    sentiment: str = Field(description="Тональность: positive/neutral/negative")
    sentiment_score: float = Field(description="Оценка тональности 0-1")
    facts: list[str] = Field(description="Ключевые факты")
    entities: list[dict] = Field(description="Упомянутые сущности")
    quotes: list[dict] = Field(description="Цитаты")
    summary: str = Field(description="Краткое содержание")
    keywords: list[str] = Field(description="Ключевые слова")

class Analyzer:
    def __init__(self, llm_client):
        self.llm = llm_client
        self.parser = PydanticOutputParser(pydantic_object=AnalysisResult)
    
    async def analyze(self, content: str, title: str) -> AnalysisResult:
        prompt = ChatPromptTemplate.from_template("""
        Проанализируй эту новостную статью и извлеки структурированную информацию.
        
        Заголовок: {title}
        Содержание: {content}
        
        {format_instructions}
        
        Требования:
        - Извлекай только факты из текста, не додумывай
        - Определи тональность статьи
        - Выдели ключевые цитаты с атрибуцией
        - Найди упоминания персон, организаций, мест
        - Создай краткое содержание (2-3 предложения)
        """)
        
        chain = prompt | self.llm | self.parser
        result = await chain.ainvoke({
            "title": title,
            "content": content,
            "format_instructions": self.parser.get_format_instructions()
        })
        
        return result
```

### 2. Generator Module

Генерация постов для различных платформ.

```python
# modules/generator.py
from enum import Enum
from typing import List

class Platform(str, Enum):
    TELEGRAM = "telegram"
    VK = "vk"
    INSTAGRAM = "instagram"
    LINKEDIN = "linkedin"

class Style(str, Enum):
    INFORMATIONAL = "informational"
    ENGAGING = "engaging"
    EXPERT = "expert"
    EMOTIONAL = "emotional"

class Generator:
    def __init__(self, llm_client):
        self.llm = llm_client
        self.prompts = self._load_prompts()
    
    async def generate_post(
        self,
        facts: List[str],
        platform: Platform,
        style: Style,
        formality_level: int = 7,
        options: dict = None
    ) -> str:
        # Выбор промпта на основе платформы и стиля
        prompt_template = self.prompts[platform][style]
        
        # Параметры платформы
        platform_params = self._get_platform_params(platform)
        
        prompt = prompt_template.format(
            facts="\n".join(f"- {fact}" for fact in facts),
            min_length=platform_params["min_length"],
            max_length=platform_params["max_length"],
            formality=formality_level,
            **options if options else {}
        )
        
        response = await self.llm.ainvoke(prompt)
        
        # Постобработка
        post = self._postprocess(response.content, platform)
        
        return post
    
    def _get_platform_params(self, platform: Platform) -> dict:
        params = {
            Platform.TELEGRAM: {
                "min_length": 200,
                "max_length": 500,
                "use_emojis": True,
                "hashtag_count": (2, 3)
            },
            Platform.VK: {
                "min_length": 300,
                "max_length": 800,
                "use_emojis": True,
                "hashtag_count": (3, 5)
            },
            Platform.INSTAGRAM: {
                "min_length": 150,
                "max_length": 300,
                "use_emojis": True,
                "hashtag_count": (5, 10)
            },
            Platform.LINKEDIN: {
                "min_length": 600,
                "max_length": 1200,
                "use_emojis": False,
                "hashtag_count": (0, 3)
            }
        }
        return params.get(platform, {})
```

### 3. Fact Checker

Проверка фактов на соответствие исходному тексту.

```python
# modules/fact_checker.py
from typing import List, Dict

class FactChecker:
    def __init__(self, llm_client):
        self.llm = llm_client
    
    async def check_facts(
        self,
        claims: List[str],
        original_content: str
    ) -> List[Dict]:
        prompt = f"""
        Проверь каждое утверждение на соответствие исходному тексту.
        
        Исходный текст:
        {original_content}
        
        Утверждения для проверки:
        {chr(10).join(f"{i+1}. {claim}" for i, claim in enumerate(claims))}
        
        Для каждого утверждения определи:
        - accurate: true/false (есть ли оно в исходном тексте)
        - confidence: 0-1 (уверенность в оценке)
        - explanation: объяснение
        
        Верни результат в JSON формате.
        """
        
        response = await self.llm.ainvoke(prompt)
        
        # Парсинг JSON ответа
        results = self._parse_fact_check_response(response.content)
        
        return results
```

---

## LLM Providers Integration

### Provider Manager

```python
# llm/provider_manager.py
from enum import Enum
from anthropic import AsyncAnthropic
from openai import AsyncOpenAI

class LLMProvider(str, Enum):
    CLAUDE = "claude"
    GPT4 = "gpt4"
    YANDEX = "yandex"

class ProviderManager:
    def __init__(self):
        self.providers = {
            LLMProvider.CLAUDE: AsyncAnthropic(api_key=os.getenv("ANTHROPIC_API_KEY")),
            LLMProvider.GPT4: AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY")),
        }
        self.default_provider = LLMProvider.CLAUDE
    
    def get_client(self, provider: LLMProvider = None):
        provider = provider or self.default_provider
        return self.providers[provider]
    
    async def complete(
        self,
        prompt: str,
        provider: LLMProvider = None,
        max_tokens: int = 2000,
        temperature: float = 0.7
    ) -> str:
        client = self.get_client(provider)
        
        if provider == LLMProvider.CLAUDE:
            response = await client.messages.create(
                model="claude-sonnet-4-20250514",
                max_tokens=max_tokens,
                temperature=temperature,
                messages=[{"role": "user", "content": prompt}]
            )
            return response.content[0].text
        
        elif provider == LLMProvider.GPT4:
            response = await client.chat.completions.create(
                model="gpt-4o",
                max_tokens=max_tokens,
                temperature=temperature,
                messages=[{"role": "user", "content": prompt}]
            )
            return response.choices[0].message.content
```

---

## Prompt Templates

### Структура промптов

```python
# prompts/templates.py
TELEGRAM_ENGAGING = """
Создай пост для Telegram на основе этих фактов:

Факты:
{facts}

Требования:
- Длина: {min_length}-{max_length} символов
- Стиль: вовлекающий, живой
- Уровень формальности: {formality}/10
- Добавь 2-3 релевантных эмодзи
- Добавь 2-3 хештега
- Включи призыв к действию в конце
- НЕ придумывай факты, используй только данные выше

Верни только текст поста, без пояснений.
"""

VK_INFORMATIONAL = """
Создай пост для ВКонтакте на основе этих фактов:

Факты:
{facts}

Требования:
- Длина: {min_length}-{max_length} символов
- Стиль: информационный, структурированный
- Уровень формальности: {formality}/10
- Используй абзацы для структуры
- Добавь 3-5 хештегов
- Можно использовать списки или bullet points

Верни только текст поста.
"""

LINKEDIN_EXPERT = """
Создай профессиональный пост для LinkedIn:

Факты:
{facts}

Требования:
- Длина: {min_length}-{max_length} символов
- Стиль: экспертный, аналитический
- Деловой тон, профессиональная терминология
- Акцент на инсайты и значимость для бизнеса
- Избегай эмодзи
- Добавь 0-3 релевантных хештега

Верни только текст поста.
"""
```

---

## Caching & Optimization

### Prompt Caching

```python
# cache/prompt_cache.py
import hashlib
import redis
import json

class PromptCache:
    def __init__(self, redis_url: str = "redis://localhost:6379"):
        self.redis = redis.from_url(redis_url)
        self.ttl = 86400  # 24 hours
    
    def _make_key(self, prompt: str, model: str) -> str:
        content = f"{model}:{prompt}"
        hash_key = hashlib.sha256(content.encode()).hexdigest()
        return f"llm:cache:{hash_key}"
    
    async def get(self, prompt: str, model: str) -> str:
        key = self._make_key(prompt, model)
        cached = self.redis.get(key)
        if cached:
            return json.loads(cached)
        return None
    
    async def set(self, prompt: str, model: str, response: str):
        key = self._make_key(prompt, model)
        self.redis.setex(key, self.ttl, json.dumps(response))
```

### Token Usage Tracking

```python
# monitoring/token_tracker.py
from collections import defaultdict
from datetime import datetime

class TokenTracker:
    def __init__(self):
        self.usage = defaultdict(lambda: {
            "prompt_tokens": 0,
            "completion_tokens": 0,
            "total_tokens": 0,
            "requests": 0
        })
    
    def track(self, user_id: str, model: str, tokens: dict):
        key = f"{user_id}:{model}"
        self.usage[key]["prompt_tokens"] += tokens.get("prompt_tokens", 0)
        self.usage[key]["completion_tokens"] += tokens.get("completion_tokens", 0)
        self.usage[key]["total_tokens"] += tokens.get("total_tokens", 0)
        self.usage[key]["requests"] += 1
    
    def get_usage(self, user_id: str) -> dict:
        user_usage = {
            k.split(":")[1]: v 
            for k, v in self.usage.items() 
            if k.startswith(f"{user_id}:")
        }
        return user_usage
```

---

## Error Handling & Fallbacks

```python
# llm/fallback_handler.py
class FallbackHandler:
    def __init__(self, provider_manager: ProviderManager):
        self.provider_manager = provider_manager
        self.provider_order = [
            LLMProvider.CLAUDE,
            LLMProvider.GPT4,
            LLMProvider.YANDEX
        ]
    
    async def complete_with_fallback(self, prompt: str, **kwargs) -> str:
        last_error = None
        
        for provider in self.provider_order:
            try:
                result = await self.provider_manager.complete(
                    prompt,
                    provider=provider,
                    **kwargs
                )
                return result
            except Exception as e:
                last_error = e
                logger.warning(f"Provider {provider} failed: {e}")
                continue
        
        raise Exception(f"All providers failed. Last error: {last_error}")
```

---

## Testing

### Unit Tests

```python
# tests/test_generator.py
import pytest
from modules.generator import Generator, Platform, Style

@pytest.mark.asyncio
async def test_generate_telegram_post():
    generator = Generator(mock_llm_client)
    
    facts = [
        "Компания запустила новый продукт",
        "Инвестиции составили $50M",
        "Ожидается рост на 25%"
    ]
    
    post = await generator.generate_post(
        facts=facts,
        platform=Platform.TELEGRAM,
        style=Style.ENGAGING,
        formality_level=7
    )
    
    assert len(post) >= 200
    assert len(post) <= 500
    assert "#" in post  # Has hashtags
```

---

## Deployment

### Docker

```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 50052

CMD ["python", "server.py"]
```

### Kubernetes

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: ai-engine-service
spec:
  replicas: 3
  template:
    spec:
      containers:
      - name: ai-engine
        image: ai-newsmaker/ai-engine-service:latest
        ports:
        - containerPort: 50052
        env:
        - name: ANTHROPIC_API_KEY
          valueFrom:
            secretKeyRef:
              name: llm-secrets
              key: anthropic-key
        - name: OPENAI_API_KEY
          valueFrom:
            secretKeyRef:
              name: llm-secrets
              key: openai-key
        resources:
          requests:
            memory: "1Gi"
            cpu: "1000m"
          limits:
            memory: "2Gi"
            cpu: "2000m"
```

---

## Monitoring

### Метрики

```python
from prometheus_client import Counter, Histogram, Gauge

llm_requests_total = Counter(
    'llm_requests_total',
    'Total LLM requests',
    ['provider', 'model', 'operation']
)

llm_tokens_used = Counter(
    'llm_tokens_used_total',
    'Total tokens used',
    ['provider', 'model', 'type']  # type: prompt/completion
)

llm_request_duration = Histogram(
    'llm_request_duration_seconds',
    'LLM request duration',
    ['provider', 'operation']
)

llm_cost_total = Counter(
    'llm_cost_total_usd',
    'Total cost in USD',
    ['provider', 'model']
)
```

---

**См. также:**
- [gRPC Protobuf](../api/grpc/protobuf.md)
- [Prompt Engineering Guide](../development/prompt-engineering.md)
- [Cost Optimization](../development/cost-optimization.md)

