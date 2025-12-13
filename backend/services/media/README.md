# Media Service

Media Service для обработки изображений и генерации визуального контента.

## Возможности

- ✅ Загрузка и скачивание изображений
- ✅ Обработка изображений (resize, crop, rotate, etc.)
- ✅ AI-генерация изображений (DALL-E)
- ✅ Создание инфографики
- ✅ Оптимизация для различных платформ
- ✅ OCR (извлечение текста)
- ✅ Хранение в MinIO

## Требования

- Python 3.11+
- MinIO (для хранения)
- OpenAI API key (для DALL-E)

## Установка

### Локальная разработка

1. Установите зависимости:
```bash
pip install -r requirements.txt
```

2. Установите системные зависимости (Ubuntu/Debian):
```bash
sudo apt-get install tesseract-ocr tesseract-ocr-rus tesseract-ocr-eng
```

3. Сгенерируйте proto файлы:
```bash
./generate_proto.sh
```

4. Создайте `.env` файл:
```bash
cp env.example .env
```

5. Запустите MinIO:
```bash
docker run -p 9000:9000 -p 9001:9001 \
  -e "MINIO_ROOT_USER=minioadmin" \
  -e "MINIO_ROOT_PASSWORD=minioadmin123" \
  minio/minio server /data --console-address ":9001"
```

6. Запустите сервис:
```bash
python main.py
```

### Docker

Запуск через Docker Compose (из корня проекта):
```bash
docker-compose up media-service minio
```

## Конфигурация

Переменные окружения (`.env`):

```env
# gRPC
GRPC_PORT=50053

# MinIO
MINIO_ENDPOINT=minio:9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin123
MINIO_BUCKET=media
MINIO_SECURE=false

# OpenAI (для DALL-E)
OPENAI_API_KEY=sk-your-key

# Image processing
MAX_IMAGE_SIZE=52428800  # 50MB
JPEG_QUALITY=85
PNG_COMPRESSION=6
```

## Использование

### Health Check

```bash
grpcurl -plaintext localhost:50053 media.MediaService/HealthCheck
```

### Загрузка изображения

```python
import grpc
from generated import media_pb2, media_pb2_grpc

channel = grpc.insecure_channel('localhost:50053')
stub = media_pb2_grpc.MediaServiceStub(channel)

def upload_image(stub, image_path, article_id):
    def request_generator():
        # Отправляем метаданные
        metadata = media_pb2.ImageMetadata(
            filename="image.jpg",
            mime_type="image/jpeg",
            article_id=article_id
        )
        yield media_pb2.UploadImageRequest(metadata=metadata)
        
        # Отправляем данные чанками
        with open(image_path, 'rb') as f:
            while True:
                chunk = f.read(1024 * 1024)  # 1MB chunks
                if not chunk:
                    break
                yield media_pb2.UploadImageRequest(chunk=chunk)
    
    response = stub.UploadImage(request_generator())
    return response.image

image = upload_image(stub, "path/to/image.jpg", "article-123")
print(f"Uploaded: {image.id}, URL: {image.url}")
```

### Обработка изображения

```python
request = media_pb2.ProcessImageRequest(
    image_id="image-123",
    operations=[
        media_pb2.ImageOperation(
            type=media_pb2.OPERATION_TYPE_RESIZE,
            params={"width": "1200", "height": "630", "maintain_aspect": "true"}
        ),
        media_pb2.ImageOperation(
            type=media_pb2.OPERATION_TYPE_WATERMARK,
            params={"text": "© AI Newsmaker", "position": "bottom-right"}
        ),
        media_pb2.ImageOperation(
            type=media_pb2.OPERATION_TYPE_COMPRESS,
            params={"quality": "85"}
        )
    ]
)

response = stub.ProcessImage(request)
processed_data = response.processed_image
```

### AI генерация изображения

```python
request = media_pb2.GenerateImageRequest(
    prompt="Красивый закат на море, фотореалистично",
    provider=media_pb2.IMAGE_GENERATION_PROVIDER_DALLE,
    style=media_pb2.IMAGE_STYLE_PHOTOREALISTIC,
    size=media_pb2.IMAGE_SIZE_LANDSCAPE,
    quality=85,
    article_id="article-123",
    negative_prompts=["low quality", "blurry"]
)

response = stub.GenerateImage(request)
print(f"Generated image: {response.image.url}")
print(f"Cost: ${response.metadata.cost_usd}")
```

### Оптимизация для платформы

```python
request = media_pb2.OptimizeForPlatformRequest(
    image_id="image-123",
    platform=common_pb2.PLATFORM_INSTAGRAM,
    image_type=media_pb2.PLATFORM_IMAGE_TYPE_POST
)

response = stub.OptimizeForPlatform(request)
optimized_data = response.optimized_image
print(f"Optimized to {response.optimization.width}x{response.optimization.height}")
```

### Создание инфографики

```python
request = media_pb2.CreateInfographicRequest(
    title="Ключевые факты",
    elements=[
        media_pb2.InfographicElement(
            type=media_pb2.ELEMENT_TYPE_HEADER,
            content="Заголовок секции",
            order=1
        ),
        media_pb2.InfographicElement(
            type=media_pb2.ELEMENT_TYPE_FACT,
            content="Важный факт номер 1",
            order=2
        ),
        media_pb2.InfographicElement(
            type=media_pb2.ELEMENT_TYPE_STAT,
            content="95% успеха",
            order=3
        )
    ],
    template=media_pb2.INFOGRAPHIC_TEMPLATE_MODERN,
    style=media_pb2.INFOGRAPHIC_STYLE_NEWS
)

response = stub.CreateInfographic(request)
print(f"Infographic URL: {response.image.url}")
```

## API Methods

- `HealthCheck` - проверка работоспособности
- `UploadImage` - загрузка изображения (streaming)
- `DownloadImage` - скачивание изображения (streaming)
- `ProcessImage` - обработка изображения
- `GenerateImage` - AI-генерация изображения
- `CreateInfographic` - создание инфографики
- `OptimizeForPlatform` - оптимизация под платформу
- `ExtractText` - OCR извлечение текста
- `GetImageMetadata` - получение метаданных

## Операции обработки

### Доступные операции

| Операция | Описание | Параметры |
|----------|----------|-----------|
| RESIZE | Изменение размера | width, height, maintain_aspect |
| CROP | Обрезка | x, y, width, height |
| ROTATE | Поворот | angle, expand |
| COMPRESS | Сжатие | quality |
| WATERMARK | Водяной знак | text, position, opacity |
| FILTER | Фильтры | type (blur/sharpen/enhance/brightness/contrast), factor/radius |
| FORMAT_CONVERT | Конвертация формата | format (JPEG/PNG/WEBP) |

## Спецификации платформ

### Instagram
- **Post**: 1080x1080 (1:1)
- **Story**: 1080x1920 (9:16)
- **Max size**: 8MB

### Telegram
- **Post**: 1280x720 (16:9)
- **Story**: 1080x1920 (9:16)
- **Max size**: 10MB

### VK
- **Post**: 1200x630 (1.91:1)
- **Cover**: 1590x400
- **Max size**: 5MB

### LinkedIn
- **Post**: 1200x627 (1.91:1)
- **Max size**: 5MB

## AI Генерация

### DALL-E 3 Pricing

| Quality | Size | Price |
|---------|------|-------|
| Standard | 1024x1024 | $0.040 |
| Standard | 1792x1024 | $0.080 |
| HD | 1024x1024 | $0.080 |
| HD | 1792x1024 | $0.120 |

## MinIO Console

Веб-интерфейс MinIO доступен по адресу: http://localhost:9001

- Username: `minioadmin`
- Password: `minioadmin123`

## Troubleshooting

### Ошибка "MinIO connection failed"
Убедитесь, что MinIO запущен и доступен:
```bash
curl http://localhost:9000/minio/health/live
```

### Ошибка "tesseract not found"
Установите tesseract:
```bash
# Ubuntu/Debian
sudo apt-get install tesseract-ocr

# macOS
brew install tesseract
```

### Слишком большой размер изображения
Измените MAX_IMAGE_SIZE в конфигурации или используйте операцию COMPRESS.

## Разработка

### Структура проекта

```
media/
├── main.py              # Точка входа
├── service.py           # gRPC servicer
├── config.py            # Конфигурация
├── minio_client.py      # MinIO client
├── image_processor.py   # Обработка изображений
├── image_generator.py   # AI генерация
├── requirements.txt     # Зависимости
├── Dockerfile          # Docker образ
├── generate_proto.sh   # Генерация proto
└── generated/          # Сгенерированные proto файлы
```

## Лицензия

MIT

