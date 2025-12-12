# Микросервисная архитектура

## Обзор микросервисов

Система состоит из 5 основных микросервисов, каждый из которых решает свою задачу и может разрабатываться и масштабироваться независимо.

```
┌────────────────────────────────────────────────────┐
│                 Microservices Layer                │
│                                                    │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐       │
│  │  Parser  │  │    AI    │  │  Media   │       │
│  │ Service  │─→│  Engine  │─→│ Service  │       │
│  │          │  │  Service │  │          │       │
│  └──────────┘  └──────────┘  └──────────┘       │
│                      ↓                            │
│              ┌──────────────┐                    │
│              │  Publishing  │                    │
│              │   Service    │                    │
│              └──────────────┘                    │
│                      ↓                            │
│              ┌──────────────┐                    │
│              │   Storage    │                    │
│              │   Service    │                    │
│              └──────────────┘                    │
└────────────────────────────────────────────────────┘
```

---

## 1. Parser Service

### Назначение
Извлечение и обработка контента из веб-страниц новостных сайтов.

### Технологии
- **Язык**: Python 3.11+
- **Framework**: FastAPI
- **Libraries**: 
  - Scrapy / BeautifulSoup4 - парсинг HTML
  - Newspaper3k - извлечение статей
  - Playwright - для JavaScript-сайтов
- **Communication**: gRPC

### Основные функции
- Валидация и нормализация URL
- Извлечение основного контента страницы
- Удаление рекламы, навигации, комментариев
- Извлечение метаданных (заголовок, автор, дата)
- Загрузка изображений
- Обход anti-bot защиты

### gRPC API

```protobuf
service ParserService {
  rpc ParseArticle(ParseRequest) returns (ParsedArticle);
  rpc BatchParseArticles(stream ParseRequest) returns (stream ParsedArticle);
  rpc ValidateURL(URLRequest) returns (ValidationResponse);
}

message ParseRequest {
  string url = 1;
  string user_id = 2;
  bool extract_images = 3;
}

message ParsedArticle {
  string id = 1;
  string url = 2;
  string title = 3;
  string content = 4;
  string excerpt = 5;
  string source = 6;
  string author = 7;
  int64 published_at = 8;
  repeated Image images = 9;
}
```

### Масштабирование
- Horizontal scaling (несколько экземпляров)
- Rate limiting для каждого домена
- Кэширование результатов (TTL: 1 час)

---

## 2. AI Engine Service

### Назначение
Анализ контента и генерация адаптированных постов с помощью LLM.

### Технологии
- **Язык**: Python 3.11+
- **Framework**: FastAPI
- **Libraries**:
  - LangChain - orchestration
  - Transformers (Hugging Face)
  - spaCy - NER (Named Entity Recognition)
- **LLM APIs**: 
  - Anthropic (Claude Sonnet 4)
  - OpenAI (GPT-4o)
  - Yandex Cloud (YandexGPT)
- **Communication**: gRPC

### Основные функции
- **Анализ контента**:
  - Sentiment analysis
  - Извлечение ключевых фактов
  - Named Entity Recognition (персоны, организации)
  - Извлечение цитат
- **Генерация контента**:
  - Мультиформатная генерация (Telegram, VK, Instagram, LinkedIn)
  - Стилистическая адаптация
  - Tone of voice настройка
- **Fact-checking**: проверка на галлюцинации

### gRPC API

```protobuf
service AIService {
  rpc AnalyzeContent(ContentRequest) returns (AnalysisResult);
  rpc GeneratePost(GenerationRequest) returns (GeneratedPost);
  rpc BatchGeneratePosts(PostGenerationBatch) returns (stream GeneratedPost);
  rpc CheckFacts(FactCheckRequest) returns (FactCheckResult);
}

message ContentRequest {
  string content = 1;
  string title = 2;
}

message AnalysisResult {
  Sentiment sentiment = 1;
  double sentiment_score = 2;
  repeated Fact facts = 3;
  repeated Entity entities = 4;
  repeated Quote quotes = 5;
}

message GenerationRequest {
  string article_id = 1;
  repeated string facts = 2;
  string platform = 3;
  string style = 4;
  int32 formality_level = 5;
}
```

### Оптимизация
- **Prompt caching**: кэширование системных промптов
- **Batch processing**: групповая обработка запросов
- **Model selection**: дешевые модели для простых задач
- **Token optimization**: минимизация токенов в промптах

### Cost Management
- Мониторинг использования токенов
- Лимиты на пользователя/команду
- Fallback на более дешевые модели

---

## 3. Media Service

### Назначение
Обработка, оптимизация и генерация визуального контента.

### Технологии
- **Язык**: Python 3.11+
- **Framework**: FastAPI
- **Libraries**:
  - Pillow - обработка изображений
  - FFmpeg - обработка видео
  - Replicate / Stability AI - AI генерация
- **Communication**: gRPC

### Основные функции
- Оптимизация изображений (сжатие, WebP)
- Cropping под форматы платформ
- Генерация thumbnails
- AI-генерация изображений
- Создание инфографики
- Наложение брендинга (логотип, watermark)

### gRPC API

```protobuf
service MediaService {
  rpc ProcessImage(ImageRequest) returns (ProcessedImage);
  rpc GenerateAIImage(AIImageRequest) returns (GeneratedImage);
  rpc CreateInfographic(InfographicRequest) returns (Infographic);
  rpc OptimizeForPlatform(OptimizationRequest) returns (OptimizedMedia);
}

message ImageRequest {
  string image_url = 1;
  repeated string operations = 2;
}

message AIImageRequest {
  string prompt = 1;
  string style = 2;
  int32 width = 3;
  int32 height = 4;
}
```

### Масштабирование
- Асинхронная обработка через очередь
- CDN для отдачи готовых изображений
- Кэширование обработанных изображений

---

## 4. Publishing Service

### Назначение
Публикация контента на социальные платформы и управление расписанием.

### Технологии
- **Язык**: Node.js (TypeScript)
- **Framework**: NestJS
- **Libraries**:
  - Social platform SDKs (Telegram, VK, Meta)
  - BullMQ - job queue
  - Axios - HTTP client
- **Communication**: gRPC

### Основные функции
- OAuth управление для соц. сетей
- Публикация постов на платформы
- Scheduling (планирование публикаций)
- Retry mechanism с exponential backoff
- Rate limiting для каждой платформы
- Webhook обработка для статусов

### Интеграции
- **Telegram**: Bot API
- **VK**: VK API
- **Instagram/Facebook**: Meta Business Suite API
- **LinkedIn**: LinkedIn API
- **Twitter/X**: X API v2

### gRPC API

```protobuf
service PublishingService {
  rpc PublishPost(PublishRequest) returns (PublishResult);
  rpc SchedulePost(ScheduleRequest) returns (ScheduleResult);
  rpc GetPublicationStatus(StatusRequest) returns (PublicationStatus);
  rpc CancelScheduledPost(CancelRequest) returns (CancelResult);
  rpc GetMetrics(MetricsRequest) returns (MetricsResponse);
}

message PublishRequest {
  string post_id = 1;
  string platform = 2;
  string account_id = 3;
  string content = 4;
  repeated string media_urls = 5;
}

message PublishResult {
  bool success = 1;
  string external_id = 2;
  string error = 3;
}
```

### Надежность
- Job queue (BullMQ + Redis)
- Retry logic (max 3 attempts)
- Dead letter queue для failed jobs
- Circuit breaker для API платформ

---

## 5. Storage Service

### Назначение
Централизованное управление данными и файлами.

### Технологии
- **Язык**: Go / Rust (высокая производительность)
- **Framework**: gRPC native
- **Database**: PostgreSQL driver
- **Communication**: gRPC

### Основные функции
- CRUD операции для всех сущностей
- File management (upload/download)
- Caching strategy (Redis)
- Backup/restore
- Data migration

### gRPC API

```protobuf
service StorageService {
  rpc SaveArticle(Article) returns (SaveResult);
  rpc GetArticle(GetRequest) returns (Article);
  rpc SavePost(Post) returns (SaveResult);
  rpc GetPost(GetRequest) returns (Post);
  rpc SaveFile(stream FileChunk) returns (FileUploadResult);
  rpc GetFile(FileRequest) returns (stream FileChunk);
  rpc DeleteFile(FileRequest) returns (DeleteResult);
}

message Article {
  string id = 1;
  string user_id = 2;
  string url = 3;
  string title = 4;
  string content = 5;
  // ... другие поля
}

message SaveResult {
  bool success = 1;
  string id = 2;
  string error = 3;
}
```

### Оптимизация
- Connection pooling
- Read replicas для чтения
- Prepared statements
- Batch operations

---

## Межсервисное взаимодействие

### Service Discovery
- Kubernetes DNS для обнаружения сервисов
- Health checks для определения доступности

### Load Balancing
- gRPC load balancing через Kubernetes Service
- Client-side load balancing (опционально)

### Error Handling
- Graceful degradation
- Fallback механизмы
- Error propagation с контекстом

### Monitoring
- Distributed tracing (Jaeger)
- Metrics (Prometheus)
- Structured logging

---

## Service Mesh (Istio)

### Преимущества
- **Traffic Management**: routing, load balancing
- **Security**: mTLS между сервисами
- **Observability**: automatic tracing и metrics
- **Resilience**: circuit breaker, retry policies

### Конфигурация

```yaml
apiVersion: networking.istio.io/v1beta1
kind: VirtualService
metadata:
  name: ai-engine-service
spec:
  hosts:
  - ai-engine-service
  http:
  - timeout: 30s
    retries:
      attempts: 3
      perTryTimeout: 10s
```

---

## Best Practices

### 1. API Design
- Используйте versioning (v1, v2)
- Backward compatibility
- Clear error messages

### 2. Data Management
- Избегайте распределенных транзакций
- Eventual consistency
- Saga pattern для long-running операций

### 3. Testing
- Unit tests для каждого сервиса
- Integration tests для API
- Contract testing для gRPC

### 4. Deployment
- Независимое развертывание
- Canary deployments
- Rollback strategy

---

**См. также:**
- [Parser Service детали](../services/parser-service.md)
- [AI Engine Service детали](../services/ai-engine-service.md)
- [gRPC Protocol Buffers](../api/grpc/protobuf.md)

