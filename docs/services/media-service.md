# Media Service

## Обзор

Media Service обрабатывает изображения и генерирует визуальный контент.

**Технологии:** Python 3.11+, Pillow, FFmpeg, Replicate API  
**Communication:** gRPC  
**Port:** 50053

---

## Основные функции

### 1. Обработка изображений
- Изменение размера (resize)
- Кроппинг (crop)
- Оптимизация (compression)
- Конвертация форматов (JPG, PNG, WebP)
- Наложение watermark

### 2. AI-генерация
- Stable Diffusion через Replicate
- DALL-E через OpenAI
- Промпт-инжиниринг для качественных результатов

### 3. Платформенная оптимизация
- Telegram: до 10MB, 1280x1280
- Instagram: 1080x1080 (квадрат), 1080x1350 (портрет)
- VK: 1920x1080
- LinkedIn: 1200x627

---

## Примеры использования

### Обработка изображения

```python
from PIL import Image
import io

class ImageProcessor:
    async def process(self, image_data: bytes, operations: list) -> bytes:
        img = Image.open(io.BytesIO(image_data))
        
        for op in operations:
            if op == "resize":
                img = self._resize(img, max_width=1200)
            elif op == "optimize":
                img = self._optimize(img, quality=85)
            elif op == "watermark":
                img = self._add_watermark(img)
        
        output = io.BytesIO()
        img.save(output, format='WEBP', quality=90)
        return output.getvalue()
    
    def _resize(self, img: Image, max_width: int) -> Image:
        if img.width > max_width:
            ratio = max_width / img.width
            new_height = int(img.height * ratio)
            img = img.resize((max_width, new_height), Image.LANCZOS)
        return img
```

### AI-генерация

```python
import replicate

class AIImageGenerator:
    def __init__(self):
        self.client = replicate.Client(api_token=os.getenv("REPLICATE_API_TOKEN"))
    
    async def generate(self, prompt: str, options: dict) -> str:
        output = await self.client.run(
            "stability-ai/stable-diffusion:latest",
            input={
                "prompt": prompt,
                "negative_prompt": options.get("negative_prompt", ""),
                "width": options.get("width", 1024),
                "height": options.get("height", 768),
                "num_outputs": 1,
                "guidance_scale": 7.5,
                "num_inference_steps": 50
            }
        )
        
        return output[0]  # URL изображения
```

---

## Deployment

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: media-service
spec:
  replicas: 2
  template:
    spec:
      containers:
      - name: media-service
        image: ai-newsmaker/media-service:latest
        ports:
        - containerPort: 50053
        resources:
          requests:
            memory: "1Gi"
            cpu: "1000m"
```

---

**См. также:**
- [gRPC API](../api/grpc/services.md)
- [Storage Service](./storage-service.md)

