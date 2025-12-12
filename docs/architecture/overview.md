# Общая архитектура системы

## Обзор

ИИ-Ньюсмейкер построен на основе **микросервисной архитектуры** с использованием GraphQL для клиентских запросов и gRPC для межсервисной коммуникации.

## Архитектурные принципы

### 1. Разделение ответственности
- Каждый микросервис отвечает за свою область
- Четкие границы между сервисами
- Независимое развертывание и масштабирование

### 2. API-first подход
- GraphQL для frontend - гибкие запросы данных
- gRPC для backend - высокая производительность
- REST для внешних интеграций

### 3. Асинхронная обработка
- Очереди задач (BullMQ + Redis)
- Event-driven architecture
- Streaming для длительных операций

## Слои архитектуры

```
┌─────────────────────────────────────────────────┐
│           Client Layer (Presentation)           │
│  ┌──────────────┐  ┌──────────────┐            │
│  │   Web App    │  │  Mobile App  │            │
│  │ (React/Next) │  │  (Optional)  │            │
│  └──────┬───────┘  └──────┬───────┘            │
└─────────┼──────────────────┼──────────────────┘
          │                  │
          └──────────┬───────┘
                     │
          ┌──────────▼──────────┐
          │    API Gateway      │  ← Load Balancer
          │   (Kong/Nginx)      │  ← Rate Limiting
          └──────────┬──────────┘  ← SSL/TLS
                     │
          ┌──────────▼──────────┐
          │  GraphQL Gateway    │  ← Single Entry Point
          │  (Apollo Server)    │  ← Schema Stitching
          └──────────┬──────────┘  ← Authentication
                     │
     ┌───────────────┼───────────────┐
     │               │               │
┌────▼────┐   ┌─────▼─────┐   ┌────▼────┐
│ Parser  │   │ AI Engine │   │  Media  │
│ Service │◄──┤  Service  │◄──┤ Service │
└────┬────┘   └─────┬─────┘   └────┬────┘
     │              │              │
     └──────────────┼──────────────┘
                    │
           ┌────────▼────────┐
           │    Publishing   │
           │     Service     │
           └────────┬────────┘
                    │
           ┌────────▼────────┐
           │     Storage     │
           │     Service     │
           └────────┬────────┘
                    │
     ┌──────────────┼──────────────┐
     │              │              │
┌────▼─────┐  ┌────▼────┐  ┌─────▼─────┐
│PostgreSQL│  │  Redis  │  │  S3/MinIO │
└──────────┘  └─────────┘  └───────────┘
```

## Основные компоненты

### Frontend Layer
- **Web Application**: React + Next.js
- **State Management**: Apollo Client + Zustand
- **UI Components**: shadcn/ui + Tailwind CSS

### API Gateway Layer
- **Kong/Nginx**: Точка входа, load balancing, rate limiting
- **GraphQL Gateway**: Apollo Server, единая точка доступа для клиентов
- **Authentication**: JWT tokens, OAuth 2.0

### Service Layer (Микросервисы)
- **Parser Service**: Извлечение контента из веб-страниц
- **AI Engine Service**: Анализ и генерация контента с помощью LLM
- **Media Service**: Обработка изображений и генерация визуала
- **Publishing Service**: Публикация на социальные платформы
- **Storage Service**: Управление данными и файлами

### Data Layer
- **PostgreSQL**: Основное хранилище (статьи, посты, пользователи)
- **Redis**: Кэш, сессии, очереди задач
- **S3/MinIO**: Файловое хранилище (изображения, медиа)

## Коммуникация между компонентами

### Client ↔ GraphQL Gateway
- **Протокол**: HTTP/HTTPS (GraphQL over HTTP)
- **Формат**: JSON
- **Real-time**: WebSocket (GraphQL Subscriptions)
- **Преимущества**: 
  - Клиент запрашивает только нужные данные
  - Единая точка входа
  - Strongly typed schema

### GraphQL Gateway ↔ Microservices
- **Протокол**: gRPC (HTTP/2)
- **Формат**: Protocol Buffers
- **Преимущества**:
  - Высокая производительность
  - Bidirectional streaming
  - Строгая типизация
  - Кодогенерация

### Service ↔ Database
- **PostgreSQL**: SQL через ORM (TypeORM, SQLAlchemy)
- **Redis**: Redis protocol
- **S3**: REST API

## Паттерны взаимодействия

### 1. Request-Response (Синхронный)
```
Client → GraphQL → gRPC Service → Database → Response
```
- Используется для: простых CRUD операций, быстрых запросов

### 2. Async Processing (Асинхронный)
```
Client → GraphQL → Queue (Redis) → Worker → Database
              ↓
         Job ID (immediate response)
              ↓
    Subscription (progress updates)
```
- Используется для: парсинга статей, генерации контента, публикации

### 3. Event-Driven
```
Service A → Event (Kafka/RabbitMQ) → Service B
```
- Используется для: уведомлений, аналитики, аудита

## Масштабирование

### Horizontal Scaling
- Каждый микросервис может масштабироваться независимо
- Kubernetes автоматически создает новые pod'ы при нагрузке
- Load balancing через Kubernetes Service

### Vertical Scaling
- Увеличение ресурсов (CPU, RAM) для отдельных сервисов
- Оптимизация запросов к БД
- Кэширование на разных уровнях

### Database Scaling
- **Read Replicas**: для чтения
- **Sharding**: при необходимости (по user_id или team_id)
- **Connection Pooling**: эффективное использование соединений

## Отказоустойчивость

### Circuit Breaker Pattern
- Предотвращение каскадных сбоев
- Автоматическое восстановление
- Graceful degradation

### Retry Mechanism
- Exponential backoff
- Максимальное количество попыток
- Dead letter queue для failed jobs

### Health Checks
- Kubernetes liveness probes
- Readiness probes
- Startup probes

## Безопасность

### Network Security
- **mTLS**: между микросервисами (через Istio)
- **TLS 1.3**: для внешних соединений
- **Network Policies**: изоляция в Kubernetes

### Application Security
- **JWT**: для аутентификации пользователей
- **RBAC**: контроль доступа
- **Rate Limiting**: защита от DDoS
- **Input Validation**: на всех уровнях

## Мониторинг и наблюдаемость

### Metrics
- **Prometheus**: сбор метрик
- **Grafana**: визуализация

### Logging
- **Loki/ELK**: централизованное логирование
- Structured logging (JSON)
- Log levels (DEBUG, INFO, WARN, ERROR)

### Tracing
- **Jaeger**: distributed tracing
- Correlation IDs для отслеживания запросов
- Performance profiling

## Преимущества архитектуры

✅ **Масштабируемость**: независимое масштабирование сервисов  
✅ **Надежность**: изоляция сбоев, автовосстановление  
✅ **Гибкость**: легко добавлять новые функции  
✅ **Производительность**: gRPC для быстрой коммуникации  
✅ **Developer Experience**: четкие границы, независимая разработка  
✅ **Maintainability**: легче понимать и поддерживать код  

## Компромиссы

⚠️ **Сложность**: больше moving parts  
⚠️ **Network Latency**: overhead на межсервисную коммуникацию  
⚠️ **Distributed Debugging**: сложнее отлаживать  
⚠️ **Data Consistency**: eventual consistency вместо strong consistency  

---

**См. также:**
- [Микросервисная архитектура](./microservices.md)
- [Диаграммы взаимодействия](./diagrams.md)
- [Технологический стек](./tech-stack.md)

