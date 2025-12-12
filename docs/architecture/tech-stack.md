# Технологический стек

## Обзор

Полный стек технологий, используемых в проекте ИИ-Ньюсмейкер.

---

## Frontend

### Core Framework
- **React 18+**: UI библиотека
- **Next.js 14+**: Фреймворк для SSR/ISR
  - App Router
  - Server Components
  - API Routes

### State Management
- **Apollo Client**: GraphQL state management + кэш
- **Zustand**: Легковесный state для локальных данных
- **React Query**: Альтернатива для REST запросов (если нужно)

### UI Framework
- **Tailwind CSS**: Utility-first CSS framework
- **shadcn/ui**: Высококачественные React компоненты
- **Radix UI**: Headless UI components (accessibility)
- **Lucide Icons**: Иконки

### Forms & Validation
- **React Hook Form**: Управление формами
- **Zod**: Schema validation

### Rich Text
- **Tiptap**: WYSIWYG редактор
- **Markdown**: Поддержка markdown

### Calendar & Scheduling
- **FullCalendar**: Календарь публикаций
- **React Big Calendar**: Альтернатива
- **date-fns**: Работа с датами

### Charts & Analytics
- **Recharts**: Графики и диаграммы
- **Chart.js**: Альтернатива

### Real-time
- **Apollo Subscriptions**: GraphQL subscriptions через WebSocket
- **WebSocket**: Прямая работа с WS (при необходимости)

---

## Backend - API Layer

### GraphQL Gateway
- **Apollo Server**: GraphQL сервер
- **GraphQL Yoga**: Альтернатива Apollo
- **GraphQL Tools**: Schema stitching, directives
- **DataLoader**: Батчинг и кэширование

**Language**: Node.js (TypeScript)

**Features**:
- Schema stitching
- Federation support
- Subscription support
- Custom directives
- Authentication middleware

### API Gateway
- **Kong**: Enterprise API Gateway
- **Nginx**: Альтернатива Kong
  - Load balancing
  - SSL termination
  - Rate limiting
  - Request routing

---

## Backend - Microservices

### Parser Service
**Language**: Python 3.11+

**Framework**: FastAPI

**Libraries**:
- `scrapy` - мощный парсинг фреймворк
- `beautifulsoup4` - HTML парсинг
- `newspaper3k` - извлечение статей
- `playwright` - headless browser для JS-сайтов
- `selenium` - альтернатива playwright
- `trafilatura` - извлечение основного контента
- `grpcio` - gRPC сервер

### AI Engine Service
**Language**: Python 3.11+

**Framework**: FastAPI

**Libraries**:
- `langchain` - LLM orchestration
- `openai` - OpenAI API client
- `anthropic` - Anthropic (Claude) API client
- `transformers` - Hugging Face models
- `spacy` - NLP (NER, POS tagging)
- `sentence-transformers` - embeddings
- `grpcio` - gRPC сервер

**LLM Providers**:
- Anthropic Claude Sonnet 4
- OpenAI GPT-4o
- Yandex Cloud YandexGPT

### Media Service
**Language**: Python 3.11+ / Node.js (TypeScript)

**Framework**: FastAPI / NestJS

**Libraries (Python)**:
- `Pillow` - обработка изображений
- `opencv-python` - компьютерное зрение
- `replicate` - AI генерация (Stable Diffusion)
- `stability-sdk` - Stability AI API

**Libraries (Node.js)**:
- `sharp` - высокопроизводительная обработка изображений
- `fluent-ffmpeg` - работа с видео

### Publishing Service
**Language**: Node.js (TypeScript)

**Framework**: NestJS

**Libraries**:
- `telegraf` - Telegram Bot API
- `vk-io` - VK API client
- `facebook-nodejs-business-sdk` - Meta API
- `linkedin-api-client` - LinkedIn API
- `axios` - HTTP client
- `bullmq` - Job queue
- `@grpc/grpc-js` - gRPC client

### Storage Service
**Language**: Go / Rust

**Framework**: 
- Go: `grpc-go`, `gorm`
- Rust: `tonic`, `sqlx`

**Purpose**: Высокопроизводительный CRUD сервис

---

## Databases & Storage

### Primary Database
**PostgreSQL 15+**

**Features**:
- ACID транзакции
- JSONB для гибких схем
- Full-text search (pg_trgm, ts_vector)
- Partitioning для больших таблиц

**Extensions**:
- `uuid-ossp` - UUID генерация
- `pg_trgm` - fuzzy search
- `pgvector` - vector similarity (для embeddings)

### Cache & Queue
**Redis 7+**

**Use cases**:
- Session management
- Cache layer
- Rate limiting
- Job queue (BullMQ)
- Pub/Sub для real-time

### Search Engine (Optional)
**Elasticsearch 8+**

**Use cases**:
- Полнотекстовый поиск
- Агрегации
- Аналитика

### File Storage
**MinIO / AWS S3**

**Use cases**:
- Хранение изображений
- Хранение медиа файлов
- Backup архивы

**CDN**: CloudFlare / AWS CloudFront

---

## Infrastructure

### Containerization
- **Docker**: Контейнеризация приложений
- **Docker Compose**: Локальная разработка

### Orchestration
**Kubernetes (K8s)**

**Components**:
- Deployments
- Services (ClusterIP, LoadBalancer)
- Ingress (nginx-ingress)
- ConfigMaps & Secrets
- Persistent Volumes
- HPA (Horizontal Pod Autoscaler)

**Distributions**:
- **Development**: Minikube, Kind
- **Production**: AWS EKS, Google GKE, или self-hosted

### Service Mesh
**Istio / Linkerd**

**Features**:
- Traffic management
- mTLS между сервисами
- Observability (metrics, tracing)
- Circuit breaker
- Rate limiting

### Helm
**Helm Charts** для управления K8s манифестами

---

## CI/CD

### Version Control
- **Git**: Контроль версий
- **GitHub / GitLab**: Хостинг репозитория

### CI/CD Platform
**GitHub Actions / GitLab CI**

**Pipeline stages**:
1. Lint & Format
2. Unit tests
3. Build Docker images
4. Push to registry
5. Deploy to staging
6. Integration tests
7. Deploy to production (manual approval)

### GitOps
**ArgoCD**

**Features**:
- Declarative GitOps
- Automatic sync
- Rollback capability
- Multi-cluster support

### Container Registry
- **Docker Hub**
- **GitHub Container Registry**
- **AWS ECR**
- **Harbor** (self-hosted)

---

## Monitoring & Observability

### Metrics
**Prometheus + Grafana**

**Metrics collected**:
- Request rate, latency, errors
- Resource usage (CPU, memory)
- Business metrics (posts created, published)
- gRPC call metrics

**Exporters**:
- Node exporter
- PostgreSQL exporter
- Redis exporter

### Logging
**Loki / ELK Stack**

**Components**:
- **Loki**: Log aggregation (Grafana stack)
- **ELK**: Elasticsearch + Logstash + Kibana
- **Promtail / Fluentd**: Log shippers

**Log format**: Structured JSON

### Tracing
**Jaeger / Tempo**

**Features**:
- Distributed tracing
- gRPC call tracing
- Performance profiling
- Trace visualization

### APM
**Sentry / DataDog**

**Features**:
- Error tracking
- Performance monitoring
- User session replay
- Alerts

---

## Message Queue (Event Streaming)

### Apache Kafka / RabbitMQ

**Use cases**:
- Асинхронная обработка
- Event sourcing
- Audit log
- Интеграция между сервисами

**Alternatives**:
- **NATS**: Легковесная альтернатива
- **Redis Streams**: Простая альтернатива

---

## Testing

### Unit Testing
**Frontend**:
- Jest
- React Testing Library
- Vitest

**Backend (Python)**:
- pytest
- pytest-asyncio
- pytest-mock

**Backend (Node.js)**:
- Jest
- Vitest

### Integration Testing
- Supertest (API testing)
- Playwright (E2E)
- K6 (Load testing)

### Contract Testing
- Pact (для API контрактов)
- Protobuf validation (gRPC)

---

## Security

### Authentication & Authorization
- **JWT**: JSON Web Tokens
- **OAuth 2.0**: Social login
- **Passport.js**: Authentication middleware (Node.js)

### Secrets Management
- **HashiCorp Vault**: Централизованное управление секретами
- **Kubernetes Secrets**: Для K8s окружения

### Encryption
- **TLS 1.3**: Шифрование в транспорте
- **AES-256**: Шифрование данных at rest
- **bcrypt / Argon2id**: Хеширование паролей

---

## Development Tools

### Code Quality
- **ESLint**: Линтер для JS/TS
- **Prettier**: Форматирование кода
- **Pylint / Ruff**: Линтер для Python
- **Black**: Форматирование Python кода

### Type Checking
- **TypeScript**: Статическая типизация для JS
- **mypy**: Статическая типизация для Python

### Documentation
- **Swagger / OpenAPI**: REST API документация
- **GraphQL Playground**: GraphQL explorer
- **Docusaurus**: Документация сайт

### IDE
- **VS Code**: Рекомендуемая IDE
- **PyCharm**: Для Python разработки

---

## Communication & Collaboration

### Real-time Communication
- **Slack**: Team chat
- **Discord**: Community

### Project Management
- **Jira**: Issue tracking
- **GitHub Projects**: Альтернатива Jira
- **Notion**: Документация и wiki

---

## Production Infrastructure

### Cloud Providers (Options)
1. **AWS**: EKS, RDS, S3, CloudFront
2. **Google Cloud**: GKE, Cloud SQL, Cloud Storage
3. **Azure**: AKS, Azure Database, Blob Storage
4. **Self-hosted**: On-premise Kubernetes

### Recommended Stack for Production

**Managed Services**:
- Kubernetes: AWS EKS / Google GKE
- Database: AWS RDS PostgreSQL / Cloud SQL
- Cache: AWS ElastiCache Redis / Memorystore
- Storage: AWS S3 / Google Cloud Storage
- CDN: CloudFlare / AWS CloudFront

**Self-managed**:
- Microservices: на Kubernetes
- Monitoring: Prometheus + Grafana
- Tracing: Jaeger
- Logging: Loki

---

## Cost Optimization

### Considerations
- **Kubernetes**: HPA для автомасштабирования
- **Database**: Read replicas только при необходимости
- **LLM APIs**: Кэширование, batch processing
- **Storage**: Lifecycle policies для S3
- **CDN**: Агрессивное кэширование статики

---

## Version Requirements

| Component | Minimum Version |
|-----------|----------------|
| Node.js | 18.x |
| Python | 3.11 |
| PostgreSQL | 15.x |
| Redis | 7.x |
| Kubernetes | 1.27+ |
| Docker | 24.x |

---

**См. также:**
- [Общая архитектура](./overview.md)
- [Infrastructure](../infrastructure/kubernetes.md)
- [Development Setup](../development/setup.md)

