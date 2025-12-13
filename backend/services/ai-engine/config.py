"""AI Engine Service configuration."""
from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    """AI Engine Service configuration."""
    
    # gRPC
    GRPC_PORT: int = 50052
    GRPC_MAX_WORKERS: int = 10
    
    # Storage Service
    STORAGE_GRPC_URL: str = "storage-service:50055"
    
    # LLM Providers
    # OpenAI (GPT-4o, GPT-4-turbo)
    OPENAI_API_KEY: Optional[str] = None
    OPENAI_MODEL: str = "gpt-4o"
    OPENAI_MAX_TOKENS: int = 4096
    
    # Anthropic (Claude Sonnet 4)
    ANTHROPIC_API_KEY: Optional[str] = None
    ANTHROPIC_MODEL: str = "claude-sonnet-4-20250514"
    ANTHROPIC_MAX_TOKENS: int = 4096
    
    # Yandex GPT
    YANDEX_API_KEY: Optional[str] = None
    YANDEX_FOLDER_ID: Optional[str] = None
    YANDEX_MODEL: str = "yandexgpt-lite"
    
    # Google Gemini
    GEMINI_API_KEY: Optional[str] = None
    GEMINI_MODEL: str = "gemini-1.5-flash"  # gemini-2.0-flash-exp, gemini-1.5-pro, gemini-1.5-flash-8b
    
    # Default provider: openai | anthropic | yandex | gemini
    DEFAULT_LLM_PROVIDER: str = "openai"
    
    # Processing
    MAX_CONTENT_LENGTH: int = 32000
    
    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
