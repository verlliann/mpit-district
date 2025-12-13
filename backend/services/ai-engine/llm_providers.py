"""LLM Provider implementations for AI Engine Service."""
import os
import time
from typing import Optional
from dataclasses import dataclass
import structlog

from openai import AsyncOpenAI
from anthropic import AsyncAnthropic
import httpx

from config import settings

logger = structlog.get_logger(__name__)


@dataclass
class LLMResponse:
    """LLM response with metadata."""
    content: str
    model: str
    total_tokens: int
    prompt_tokens: int
    completion_tokens: int
    cost: float


class LLMProvider:
    """Base LLM provider interface."""
    
    def __init__(self, name: str, model: str):
        self.name = name
        self.model = model
        self.logger = logger.bind(provider=name, model=model)
    
    async def complete(self, prompt: str, **kwargs) -> LLMResponse:
        raise NotImplementedError


class OpenAIProvider(LLMProvider):
    """OpenAI GPT-4o provider."""
    
    # Модели: gpt-4o, gpt-4-turbo, gpt-3.5-turbo
    MODELS = {
        "gpt-4o": {"input": 2.5, "output": 10.0},  # $ per 1M tokens
        "gpt-4-turbo": {"input": 10.0, "output": 30.0},
        "gpt-3.5-turbo": {"input": 0.5, "output": 1.5}
    }
    
    def __init__(self):
        model = settings.OPENAI_MODEL or "gpt-4o"
        super().__init__("openai", model)
        self.client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
    
    async def complete(self, prompt: str, temperature: float = 0.7, max_tokens: int = 4096, **kwargs) -> LLMResponse:
        self.logger.info("Calling OpenAI", model=self.model)
        
        start_time = time.time()
        
        response = await self.client.chat.completions.create(
            model=self.model,
            messages=[
                {"role": "system", "content": "Отвечай ТОЛЬКО валидным JSON без markdown."},
                {"role": "user", "content": prompt}
            ],
            temperature=temperature,
            max_tokens=max_tokens,
            response_format={"type": "json_object"}
        )
        
        elapsed = time.time() - start_time
        
        content = response.choices[0].message.content
        prompt_tokens = response.usage.prompt_tokens
        completion_tokens = response.usage.completion_tokens
        total_tokens = response.usage.total_tokens
        
        pricing = self.MODELS.get(self.model, {"input": 10.0, "output": 30.0})
        cost = (prompt_tokens / 1_000_000) * pricing["input"] + (completion_tokens / 1_000_000) * pricing["output"]
        
        self.logger.info("OpenAI done", tokens=total_tokens, cost=round(cost, 5), time_ms=int(elapsed * 1000))
        
        return LLMResponse(content, self.model, total_tokens, prompt_tokens, completion_tokens, cost)


class AnthropicProvider(LLMProvider):
    """Anthropic Claude provider."""
    
    # Модели: claude-sonnet-4-20250514, claude-3-sonnet-20240229
    MODELS = {
        "claude-sonnet-4-20250514": {"input": 3.0, "output": 15.0},
        "claude-3-sonnet-20240229": {"input": 3.0, "output": 15.0},
        "claude-3-haiku-20240307": {"input": 0.25, "output": 1.25}
    }
    
    def __init__(self):
        model = settings.ANTHROPIC_MODEL or "claude-sonnet-4-20250514"
        super().__init__("anthropic", model)
        self.client = AsyncAnthropic(api_key=settings.ANTHROPIC_API_KEY)
    
    async def complete(self, prompt: str, temperature: float = 0.7, max_tokens: int = 4096, **kwargs) -> LLMResponse:
        self.logger.info("Calling Anthropic", model=self.model)
        
        start_time = time.time()
        
        response = await self.client.messages.create(
            model=self.model,
            max_tokens=max_tokens,
            temperature=temperature,
            messages=[{"role": "user", "content": f"{prompt}\n\nОтветь ТОЛЬКО валидным JSON."}]
        )
        
        elapsed = time.time() - start_time
        
        content = response.content[0].text
        prompt_tokens = response.usage.input_tokens
        completion_tokens = response.usage.output_tokens
        total_tokens = prompt_tokens + completion_tokens
        
        pricing = self.MODELS.get(self.model, {"input": 3.0, "output": 15.0})
        cost = (prompt_tokens / 1_000_000) * pricing["input"] + (completion_tokens / 1_000_000) * pricing["output"]
        
        self.logger.info("Anthropic done", tokens=total_tokens, cost=round(cost, 5), time_ms=int(elapsed * 1000))
        
        return LLMResponse(content, self.model, total_tokens, prompt_tokens, completion_tokens, cost)


class YandexGPTProvider(LLMProvider):
    """Yandex GPT provider."""
    
    # Модели: yandexgpt-lite, yandexgpt
    MODELS = {
        "yandexgpt-lite": {"input": 0.2, "output": 0.4},  # rubles per 1M tokens
        "yandexgpt": {"input": 0.6, "output": 1.2}
    }
    
    def __init__(self):
        model = settings.YANDEX_MODEL or "yandexgpt-lite"
        super().__init__("yandex", model)
        self.api_key = settings.YANDEX_API_KEY
        self.folder_id = settings.YANDEX_FOLDER_ID
        self.endpoint = "https://llm.api.cloud.yandex.net/foundationModels/v1/completion"
    
    async def complete(self, prompt: str, temperature: float = 0.7, max_tokens: int = 4096, **kwargs) -> LLMResponse:
        self.logger.info("Calling YandexGPT", model=self.model)
        
        start_time = time.time()
        
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Api-Key {self.api_key}",
            "x-folder-id": self.folder_id
        }
        
        data = {
            "modelUri": f"gpt://{self.folder_id}/{self.model}/latest",
            "completionOptions": {"stream": False, "temperature": temperature, "maxTokens": str(max_tokens)},
            "messages": [
                {"role": "system", "text": "Отвечай ТОЛЬКО валидным JSON."},
                {"role": "user", "text": prompt}
            ]
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.post(self.endpoint, headers=headers, json=data, timeout=120.0)
            response.raise_for_status()
            result = response.json()
        
        elapsed = time.time() - start_time
        
        content = result["result"]["alternatives"][0]["message"]["text"]
        
        # Yandex не возвращает токены, оцениваем
        prompt_tokens = len(prompt) // 4
        completion_tokens = len(content) // 4
        total_tokens = prompt_tokens + completion_tokens
        
        pricing = self.MODELS.get(self.model, {"input": 0.2, "output": 0.4})
        cost_rubles = (prompt_tokens / 1_000_000) * pricing["input"] + (completion_tokens / 1_000_000) * pricing["output"]
        cost = cost_rubles / 100  # ~100 RUB per USD
        
        self.logger.info("YandexGPT done", tokens=total_tokens, cost=round(cost, 5), time_ms=int(elapsed * 1000))
        
        return LLMResponse(content, self.model, total_tokens, prompt_tokens, completion_tokens, cost)


def get_llm_provider(provider_name: str = None) -> LLMProvider:
    """Get LLM provider by name."""
    name = provider_name or settings.DEFAULT_LLM_PROVIDER or "openai"
    
    providers = {
        "openai": OpenAIProvider,
        "anthropic": AnthropicProvider,
        "yandex": YandexGPTProvider
    }
    
    if name not in providers:
        raise ValueError(f"Unknown provider: {name}")
    
    return providers[name]()
