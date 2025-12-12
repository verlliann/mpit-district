"""Media Service configuration."""
from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    """Media Service configuration."""
    
    # gRPC
    GRPC_PORT: int = 50053
    GRPC_MAX_WORKERS: int = 10
    
    # Storage Service
    STORAGE_GRPC_URL: str = "storage-service:50055"
    
    # MinIO
    MINIO_ENDPOINT: str = "minio:9000"
    MINIO_ACCESS_KEY: str = "minioadmin"
    MINIO_SECRET_KEY: str = "minioadmin123"
    MINIO_BUCKET: str = "media"
    MINIO_SECURE: bool = False
    
    # Image Generation Providers
    # OpenAI DALL-E
    OPENAI_API_KEY: Optional[str] = None
    
    # Replicate (Stable Diffusion)
    REPLICATE_API_TOKEN: Optional[str] = None
    
    # Yandex (Kandinsky)
    YANDEX_API_KEY: Optional[str] = None
    YANDEX_FOLDER_ID: Optional[str] = None
    
    # Image processing
    MAX_IMAGE_SIZE: int = 50 * 1024 * 1024  # 50MB
    JPEG_QUALITY: int = 85
    PNG_COMPRESSION: int = 6
    
    # Chunk size for streaming
    CHUNK_SIZE: int = 1024 * 1024  # 1MB
    
    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
