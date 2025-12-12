# Техническое задание: ИИ-Ньюсмейкер (Web Platform)

## 1. Общая информация о проекте

### 1.1 Название проекта
**ИИ-Ньюсмейкер** — веб-платформа для автоматизированной мультиплатформенной адаптации и дистрибуции новостного контента с использованием искусственного интеллекта.

### 1.2 Назначение системы
Веб-платформа для автоматического анализа новостных публикаций о бренде/компании и создания адаптированного контента для различных социальных платформ и медиа-каналов, продлевая жизненный цикл информационных поводов.

### 1.3 Целевая аудитория
- PR-менеджеры и специалисты по коммуникациям
- SMM-специалисты
- Маркетинговые агентства
- Пресс-службы компаний
- Медиа-команды брендов

---

## 2. Цели и задачи проекта

### 2.1 Основные цели
1. Автоматизация процесса адаптации новостного контента для различных платформ
2. Увеличение продолжительности жизни информационных поводов с 2-3 часов до 5-7 дней
3. Расширение охвата аудитории за счет мультиплатформенного присутствия
4. Сокращение времени работы PR-специалиста на рутинных задачах с 2-3 часов до 5-10 минут

### 2.2 Основные задачи
- Извлечение структурированной информации из новостных статей
- Генерация контента в различных стилях и форматах
- Автоматизация публикации на целевых платформах
- Обеспечение контроля качества и тональности контента

---

## 3. Функциональные требования

### 3.1 Обработка входящего контента

#### 3.1.1 Приём исходных материалов
**Обязательные функции:**
- Ввод URL-ссылок на статьи через веб-форму
- Drag & Drop для загрузки файлов
- Поддержка российских и международных новостных ресурсов
- Парсинг основного текста статьи (исключая рекламу, навигацию, комментарии)
- Извлечение метаданных: заголовок, дата публикации, автор, изображения
- Предпросмотр статьи перед обработкой

**Дополнительные функции:**
- Прямой ввод текста в редактор (Rich Text Editor)
- Обработка PDF-файлов пресс-релизов
- Массовая загрузка URL (batch processing)
- Поддержка архивных ссылок
- Интеграция с RSS-лентами для автоматического мониторинга

#### 3.1.2 Анализ контента
**Обязательные функции:**
- Извлечение ключевых фактов и тезисов
- Выявление цитат и их атрибуция
- Извлечение числовых данных и статистики
- Определение основных персон и организаций
- Анализ тональности упоминания (позитивная/нейтральная/негативная)
- Визуализация результатов анализа

**Дополнительные функции:**
- Категоризация новости (финансы, HR, продукт, партнерство)
- Определение уровня значимости новости
- Выявление инфоповодов для будущих публикаций
- Семантический анализ и tag cloud
- Сравнение с предыдущими новостями

#### 3.1.3 Верификация и безопасность
**Обязательные функции:**
- Проверка на фейковые новости и недостоверную информацию
- Фильтрация негативного контента (с возможностью переключения)
- Предупреждения о потенциально спорных формулировках
- Защита от галлюцинаций ИИ (fact-checking на основе исходного текста)
- Индикация уровня достоверности (confidence score)

### 3.2 Генерация адаптированного контента

#### 3.2.1 Мультиформатная генерация
**Обязательные форматы:**
1. **Telegram** (200-500 символов)
   - Лаконичный стиль
   - Эмодзи для визуального акцента
   - Хештеги (2-3 релевантных)
   - Призыв к действию

2. **VK** (300-800 символов)
   - Более развернутый стиль
   - Встроенные ссылки
   - Оптимизация под алгоритм ВКонтакте

3. **LinkedIn** (600-1200 символов)
   - Деловой тон
   - Акцент на экспертность и достижения
   - Профессиональная терминология

4. **Instagram/Facebook** (150-300 символов)
   - Цепляющий заголовок
   - Визуальный акцент
   - Хештеги (5-10)

**Дополнительные форматы:**
- Twitter/X (до 280 символов)
- Дзен/VC.ru — статейный формат (1500-2500 символов)
- Email-рассылка
- Карточки для презентаций
- Короткие видео-скрипты (для TikTok, Reels)

#### 3.2.2 Стилистическая адаптация
**Обязательные стили:**
- Информационный (сухие факты)
- Вовлекающий (с призывом к дискуссии)
- Экспертный (с анализом и контекстом)
- Эмоциональный (с усилением позитива/негатива)

**Настройки стиля:**
- Уровень формальности (шкала 1-10)
- Использование профессионального жаргона
- Степень использования эмодзи
- Длина предложений
- Tone of voice (настраиваемый профиль бренда)

#### 3.2.3 Генерация визуального контента
**Обязательные функции:**
- Подбор релевантных изображений из статьи
- Создание текстовых карточек с ключевыми цитатами
- Кроппинг изображений под форматы платформ

**Дополнительные функции (киллер-фичи):**
- Генерация AI-иллюстраций на основе содержания
- Создание инфографики из числовых данных
- Генерация превью-карточек для социальных сетей
- Анимированные карточки (GIF, short video)
- Автоматическое наложение брендинга (логотип, цвета)

### 3.3 Медиапланирование

#### 3.3.1 Формирование контент-плана
**Обязательные функции:**
- Автоматическая генерация 3-5 постов из одной статьи
- Визуальный календарь публикаций (calendar view, timeline view)
- Drag & Drop для изменения дат и времени
- Рекомендации по оптимальному времени публикации
- Batch-редактирование постов
- Дублирование и шаблонизация

**Дополнительные функции:**
- Создание вариативных версий (A/B тестирование)
- Интеграция с календарем инфоповодов
- Учет активности конкурентов
- Умные рекомендации на основе исторических данных

#### 3.3.2 Стратегии распространения
**Встроенные стратегии:**
1. **Быстрый охват** — публикация во всех каналах в течение 24 часов
2. **Равномерное распределение** — по 1 посту раз в 1-2 дня
3. **Волновая стратегия** — 2 волны публикаций с интервалом 3-4 дня
4. **Умная стратегия** — на основе ML-анализа поведения аудитории
5. **Custom** — полностью настраиваемая стратегия

### 3.4 Публикация и автопостинг

#### 3.4.1 Интеграция с платформами
**Обязательные интеграции:**
- Telegram (через Telegram Bot API)
- VK (через VK API)
- Facebook/Instagram (Meta Business Suite API)
- LinkedIn (LinkedIn API)

**Желательные интеграции:**
- OK.ru (Одноклассники API)
- Дзен (Яндекс Дзен API)
- Twitter/X API
- TikTok (TikTok for Business API)

#### 3.4.2 Режимы публикации
**Обязательные режимы:**
- **Предпросмотр** — полный preview с возможностью редактирования
- **Ручная публикация** — публикация одним кликом
- **Запланированная публикация** — scheduling по времени
- **Автоматическая публикация** — по заданному расписанию

**Контроль публикаций:**
- Real-time статус публикаций
- История опубликованных постов
- Отмена/редактирование запланированных постов
- Повторная публикация (repost)
- Архивация и удаление

#### 3.4.3 Управление соц. аккаунтами
**Функции:**
- Подключение нескольких аккаунтов одной платформы
- Группировка аккаунтов (по брендам, регионам)
- Переключение между аккаунтами
- Контроль прав доступа к аккаунтам
- Мониторинг статуса токенов

### 3.5 Дополнительные функции

#### 3.5.1 Мониторинг упоминаний
- Отслеживание новых публикаций о бренде в СМИ
- RSS-агрегация
- Уведомления о новых упоминаниях (email, push)
- Фильтрация по источникам и тональности
- Интеграция с Brand24, YouScan и др.

#### 3.5.2 Аналитика и отчетность
**Основные метрики:**
- Охваты, вовлеченность, клики
- Сравнение эффективности платформ
- Анализ лучших постов
- ROI по каждой публикации
- Динамика метрик (графики, тренды)

**Отчеты:**
- Dashboard с основными KPI
- Детальные отчеты по периодам
- Экспорт (PDF, Excel, CSV)
- Автоматическая отправка отчетов
- Кастомные дашборды

#### 3.5.3 Командная работа
**Функции:**
- Многопользовательский доступ
- Роли: Admin, Editor, Publisher, Viewer
- Workflow согласования (draft → review → approved → published)
- Комментарии и правки в постах
- Уведомления о действиях команды
- Activity log

#### 3.5.4 Библиотека и шаблоны
**Функции:**
- Библиотека всех созданных постов
- Поиск и фильтрация
- Папки и теги
- Шаблоны постов (для частых сценариев)
- Сниппеты (часто используемые фразы, CTA)
- Медиа-библиотека (изображения, видео)

---

## 4. Технические требования

### 4.1 Архитектура системы

#### 4.1.1 Общая архитектура (Микросервисы)

```
┌─────────────────────────────────────────────────────────────┐
│                        Client Layer                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Web App      │  │ Mobile App   │  │ Browser Ext  │      │
│  │ (React/Next) │  │ (опционально)│  │ (опционально)│      │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘      │
└─────────┼──────────────────┼──────────────────┼─────────────┘
          │                  │                  │
          └──────────────────┴──────────────────┘
                             │
                    ┌────────▼────────┐
                    │   API Gateway   │
                    │   (Kong/Nginx)  │
                    └────────┬────────┘
                             │
          ┌──────────────────┴──────────────────┐
          │                                     │
    ┌─────▼──────┐                    ┌────────▼────────┐
    │  GraphQL   │                    │   REST/gRPC     │
    │  Gateway   │                    │    Gateway      │
    │  (Apollo)  │                    └────────┬────────┘
    └─────┬──────┘                             │
          │                                     │
          │                                     │
┌─────────┴──────────────────────────────────────────────────┐
│                     Service Layer (gRPC)                    │
│                                                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │  Parser  │  │    AI    │  │  Media   │  │Publishing│  │
│  │ Service  │◄─┤  Engine  │◄─┤ Service  │◄─┤ Service  │  │
│  │          │  │  Service │  │          │  │          │  │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘  │
│       │             │             │             │         │
│       └─────────────┴─────────────┴─────────────┘         │
│                          │                                 │
│                    ┌─────▼──────┐                         │
│                    │  Storage   │                         │
│                    │  Service   │                         │
│                    └─────┬──────┘                         │
└──────────────────────────┼─────────────────────────────────┘
                           │
              ┌────────────┴────────────┐
              │                         │
       ┌──────▼──────┐          ┌──────▼──────┐
       │ PostgreSQL  │          │    Redis    │
       │  (Primary)  │          │   (Cache)   │
       └─────────────┘          └─────────────┘
              │
       ┌──────▼──────┐
       │     S3      │
       │  (Storage)  │
       └─────────────┘
```

#### 4.1.2 Микросервисы (gRPC Communication)

**1. Parser Service**
- **Назначение:** парсинг веб-страниц и извлечение контента
- **Технологии:** Python/Go + gRPC
- **Функции:**
  - URL validation и normalization
  - Content extraction (Scrapy, Newspaper3k)
  - Metadata extraction
  - Image downloading
  - Anti-bot обход (Playwright/Selenium)
- **gRPC API:**
  ```protobuf
  service ParserService {
    rpc ParseArticle(ParseRequest) returns (ParsedArticle);
    rpc BatchParseArticles(stream ParseRequest) returns (stream ParsedArticle);
    rpc ValidateURL(URLRequest) returns (ValidationResponse);
  }
  ```

**2. AI Engine Service**
- **Назначение:** обработка текста с помощью LLM
- **Технологии:** Python + gRPC + LangChain
- **Функции:**
  - Sentiment analysis
  - Entity extraction (NER)
  - Fact extraction
  - Content generation
  - Style adaptation
  - Fact-checking
- **LLM интеграции:** Claude Sonnet 4, GPT-4o, YandexGPT
- **gRPC API:**
  ```protobuf
  service AIService {
    rpc AnalyzeContent(ContentRequest) returns (AnalysisResult);
    rpc GeneratePost(GenerationRequest) returns (GeneratedPost);
    rpc BatchGeneratePosts(PostGenerationBatch) returns (stream GeneratedPost);
    rpc CheckFacts(FactCheckRequest) returns (FactCheckResult);
  }
  ```

**3. Media Service**
- **Назначение:** обработка и генерация визуального контента
- **Технологии:** Python/Node.js + gRPC
- **Функции:**
  - Image optimization и cropping
  - AI image generation (Stable Diffusion, DALL-E)
  - Infographic creation
  - Video thumbnail generation
  - Brand overlay
- **gRPC API:**
  ```protobuf
  service MediaService {
    rpc ProcessImage(ImageRequest) returns (ProcessedImage);
    rpc GenerateAIImage(AIImageRequest) returns (GeneratedImage);
    rpc CreateInfographic(InfographicRequest) returns (Infographic);
    rpc OptimizeForPlatform(OptimizationRequest) returns (OptimizedMedia);
  }
  ```

**4. Publishing Service**
- **Назначение:** публикация контента на социальных платформах
- **Технологии:** Node.js/Python + gRPC
- **Функции:**
  - OAuth управление
  - Публикация на платформы
  - Scheduling
  - Retry механизм
  - Rate limiting
- **gRPC API:**
  ```protobuf
  service PublishingService {
    rpc PublishPost(PublishRequest) returns (PublishResult);
    rpc SchedulePost(ScheduleRequest) returns (ScheduleResult);
    rpc GetPublicationStatus(StatusRequest) returns (PublicationStatus);
    rpc CancelScheduledPost(CancelRequest) returns (CancelResult);
  }
  ```

**5. Storage Service**
- **Назначение:** управление данными
- **Технологии:** Go/Rust + gRPC
- **Функции:**
  - CRUD операции
  - Caching strategy
  - File management
  - Backup/restore
- **gRPC API:**
  ```protobuf
  service StorageService {
    rpc SaveArticle(Article) returns (SaveResult);
    rpc GetArticle(GetRequest) returns (Article);
    rpc SavePost(Post) returns (SaveResult);
    rpc GetUserData(UserRequest) returns (UserData);
  }
  ```

#### 4.1.3 GraphQL API (Frontend ↔ Backend)

**Преимущества GraphQL для проекта:**
- Гибкие запросы данных (клиент запрашивает только нужные поля)
- Единая точка входа для всех операций
- Real-time subscriptions для обновлений
- Strongly typed schema
- Отличная поддержка в React

**GraphQL Schema (основные типы):**

```graphql
type Article {
  id: ID!
  url: String!
  title: String!
  content: String!
  source: String!
  publishedAt: DateTime!
  parsedAt: DateTime!
  sentiment: Sentiment!
  facts: [Fact!]!
  entities: [Entity!]!
  images: [Image!]!
  posts: [Post!]!
}

type Post {
  id: ID!
  articleId: ID!
  platform: Platform!
  content: String!
  style: Style!
  status: PostStatus!
  scheduledAt: DateTime
  publishedAt: DateTime
  metrics: Metrics
  images: [Image!]!
}

type Metrics {
  views: Int!
  likes: Int!
  comments: Int!
  shares: Int!
  clicks: Int!
  engagement: Float!
}

enum Platform {
  TELEGRAM
  VK
  INSTAGRAM
  FACEBOOK
  LINKEDIN
  TWITTER
  TIKTOK
}

enum PostStatus {
  DRAFT
  REVIEW
  APPROVED
  SCHEDULED
  PUBLISHED
  FAILED
}

type Query {
  # Получение статей
  articles(
    limit: Int = 20
    offset: Int = 0
    filter: ArticleFilter
  ): [Article!]!
  
  article(id: ID!): Article
  
  # Получение постов
  posts(
    limit: Int = 20
    offset: Int = 0
    filter: PostFilter
  ): [Post!]!
  
  post(id: ID!): Post
  
  # Запланированные посты
  scheduledPosts(
    from: DateTime
    to: DateTime
  ): [Post!]!
  
  # Аналитика
  analytics(
    from: DateTime!
    to: DateTime!
    platforms: [Platform!]
  ): Analytics!
  
  # Библиотека шаблонов
  templates: [Template!]!
}

type Mutation {
  # Парсинг статьи
  parseArticle(url: String!): ParseArticleResult!
  
  # Генерация постов
  generatePosts(
    articleId: ID!
    platforms: [Platform!]!
    style: Style!
    count: Int = 5
  ): [Post!]!
  
  # Редактирование поста
  updatePost(
    id: ID!
    content: String
    scheduledAt: DateTime
  ): Post!
  
  # Публикация
  publishPost(id: ID!): PublishResult!
  publishBatch(ids: [ID!]!): [PublishResult!]!
  
  # Планирование
  schedulePost(
    id: ID!
    scheduledAt: DateTime!
  ): Post!
  
  # Отмена публикации
  cancelScheduledPost(id: ID!): Boolean!
  
  # Удаление
  deletePost(id: ID!): Boolean!
}

type Subscription {
  # Обновление статуса поста
  postStatusChanged(postId: ID!): Post!
  
  # Новые метрики
  metricsUpdated(postId: ID!): Metrics!
  
  # Уведомления
  notifications: Notification!
}
```

**GraphQL Gateway реализация:**
- **Apollo Server** (Node.js)
- **GraphQL Federation** для разделения схемы между сервисами
- **DataLoader** для батчинга и кэширования запросов
- **GraphQL Subscriptions** через WebSocket

#### 4.1.4 Взаимодействие между слоями

**Frontend → GraphQL:**
- HTTP/HTTPS для queries и mutations
- WebSocket для subscriptions
- Apollo Client для state management

**GraphQL Gateway → gRPC Services:**
- gRPC для высокопроизводительной коммуникации
- Protocol Buffers для сериализации
- HTTP/2 multiplexing
- Bidirectional streaming

**Преимущества этой архитектуры:**
- **GraphQL** — гибкость для фронтенда, одна точка входа
- **gRPC** — высокая производительность между сервисами
- **Микросервисы** — независимая разработка и масштабирование
- **Clear separation** — каждый уровень решает свою задачу

### 4.2 Стек технологий

#### 4.2.1 Frontend
- **Framework:** React 18+ с Next.js 14+ (SSR, ISR)
- **State Management:** 
  - Apollo Client (для GraphQL)
  - Zustand/Jotai (для локального state)
- **UI Framework:** 
  - Tailwind CSS
  - shadcn/ui (компоненты)
  - Radix UI (headless components)
- **Forms:** React Hook Form + Zod (валидация)
- **Rich Text Editor:** 
  - Tiptap / Lexical
  - Поддержка Markdown
- **Calendar/Scheduler:** FullCalendar / React Big Calendar
- **Charts:** Recharts / Chart.js
- **Real-time:** Apollo Subscriptions (WebSocket)

#### 4.2.2 Backend - API Layer
**GraphQL Gateway:**
- **Framework:** Apollo Server / GraphQL Yoga
- **Language:** Node.js (TypeScript)
- **Features:**
  - Schema stitching
  - DataLoader (батчинг)
  - Subscriptions (WebSocket)
  - Authentication middleware

**API Gateway:**
- **Platform:** Kong / Nginx
- **Features:**
  - Rate limiting
  - Load balancing
  - SSL termination
  - Request routing

#### 4.2.3 Backend - Microservices
**Parser Service:**
- **Language:** Python 3.11+
- **Libraries:** 
  - Scrapy / BeautifulSoup4
  - Newspaper3k
  - Playwright (для JS-сайтов)
- **gRPC:** grpcio + protobuf

**AI Engine Service:**
- **Language:** Python 3.11+
- **Libraries:**
  - LangChain
  - Transformers (Hugging Face)
  - spaCy (NER)
- **LLM APIs:**
  - Anthropic (Claude)
  - OpenAI (GPT-4)
  - Yandex Cloud (YandexGPT)
- **gRPC:** grpcio + protobuf

**Media Service:**
- **Language:** Python / Node.js
- **Libraries:**
  - Pillow (обработка изображений)
  - FFmpeg (видео)
  - Replicate / Stability AI (генерация)
- **gRPC:** grpcio / @grpc/grpc-js

**Publishing Service:**
- **Language:** Node.js (TypeScript)
- **Libraries:**
  - Social platform SDKs
  - Axios для HTTP requests
- **Scheduler:** BullMQ + Redis
- **gRPC:** @grpc/grpc-js

**Storage Service:**
- **Language:** Go / Rust (для высокой производительности)
- **gRPC:** grpc-go / tonic

#### 4.2.4 Data Layer
**Databases:**
- **Primary:** PostgreSQL 15+
  - Хранение: статьи, посты, пользователи, метрики
  - Full-text search (pg_trgm, ts_vector)
  - JSONB для гибких схем
- **Cache:** Redis 7+
  - Session management
  - Rate limiting
  - Job queue (BullMQ)
  - Real-time data
- **Search:** Elasticsearch 8+ (опционально)
  - Полнотекстовый поиск
  - Агрегации и аналитика
- **File Storage:** 
  - MinIO / AWS S3
  - CDN: CloudFlare / AWS CloudFront

#### 4.2.5 Infrastructure
**Containerization:**
- Docker + Docker Compose (dev)
- Kubernetes (production)
- Helm charts для деплоя

**Service Mesh:**
- Istio / Linkerd (для управления gRPC трафиком)

**CI/CD:**
- GitHub Actions / GitLab CI
- ArgoCD (GitOps для K8s)

**Monitoring:**
- **Metrics:** Prometheus + Grafana
- **Tracing:** Jaeger / Tempo (для gRPC)
- **Logging:** Loki / ELK Stack
- **APM:** Sentry / DataDog

**Message Queue:**
- Apache Kafka / RabbitMQ (для event streaming)
- Используется для:
  - Асинхронная обработка
  - Event sourcing
  - Интеграция между сервисами

### 4.3 Требования к производительности

#### 4.3.1 Скорость обработки
- Парсинг статьи: ≤ 3 секунд (gRPC streaming)
- Генерация одного поста: ≤ 8 секунд
- Генерация полного контент-плана (5 постов): ≤ 25 секунд
- Публикация поста: ≤ 2 секунд
- GraphQL query response: ≤ 100ms (без LLM)
- gRPC call latency: ≤ 10ms (inter-service)

#### 4.3.2 Масштабируемость
- Одновременных пользователей: ≥ 500
- Обработка статей: ≥ 5000/день
- Публикация постов: ≥ 20000/день
- GraphQL queries: ≥ 10000/секунду
- gRPC calls: ≥ 50000/секунду

#### 4.3.3 Надёжность
- Uptime: ≥ 99.9%
- Автоматическое восстановление (Kubernetes self-healing)
- Резервное копирование: ежедневно + continuous WAL
- Circuit breaker для внешних API
- Retry механизм с exponential backoff
- Graceful degradation при сбое сервисов

### 4.4 Безопасность

#### 4.4.1 Аутентификация и авторизация
- **JWT tokens** для сессий
- **OAuth 2.0** для соц. сетей
- **RBAC** (Role-Based Access Control)
- **MFA** (Multi-Factor Authentication)
- **API Keys** для внешних интеграций
- **GraphQL** — authentication middleware
- **gRPC** — metadata для auth tokens

#### 4.4.2 Защита данных
- **Encryption:**
  - At rest: AES-256
  - In transit: TLS 1.3 (HTTP/2 для gRPC)
- **Secrets management:** HashiCorp Vault
- **Database:** шифрование чувствительных полей
- **Password hashing:** Argon2id

#### 4.4.3 Защита API
- **Rate Limiting:**
  - GraphQL: сложность запроса + depth limiting
  - REST: по IP и по пользователю
- **CORS** настройка
- **CSP** (Content Security Policy)
- **Input validation:** на всех уровнях
- **SQL injection** защита (ORM + prepared statements)
- **XSS** защита (sanitization)

#### 4.4.4 gRPC Security
- **mTLS** (mutual TLS) между сервисами
- **Token-based auth** в metadata
- **Network policies** в Kubernetes
- **Service mesh** (Istio) для zero-trust security

---

## 5. Интерфейс пользователя (Web)

### 5.1 Структура веб-приложения

#### 5.1.1 Основные страницы

**1. Dashboard (Главная) — `/dashboard`**
- Обзор активности за период
- Ключевые метрики (виджеты):
  - Общие охваты
  - Вовлеченность
  - Количество постов
  - Успешные публикации
- Последние обработанные статьи (timeline)
- Запланированные посты (preview)
- Quick actions (быстрый доступ к функциям)

**2. Создание контента — `/create`**

**Шаг 1: Ввод статьи**
```
┌────────────────────────────────────────────┐
│  🔗 Вставьте ссылку на статью             │
│  ┌──────────────────────────────────────┐ │
│  │ https://example.com/article...       │ │
│  └──────────────────────────────────────┘ │
│                                            │
│  или                                       │
│                                            │
│  📄 Загрузите файл (drag & drop)          │
│  ┌──────────────────────────────────────┐ │
│  │     Перетащите файл сюда             │ │
│  │     или кликните для выбора          │ │
│  └──────────────────────────────────────┘ │
│                                            │
│  [Анализировать]                          │
└────────────────────────────────────────────┘
```

**Шаг 2: Результаты анализа**
```
┌─────────────────────────────────────────────────────┐
│  Статья успешно проанализирована ✅                │
│                                                     │
│  📰 Заголовок: "Компания X запускает новый продукт"│
│  📅 Дата: 10 декабря 2025                          │
│  📰 Источник: Example News                         │
│  🎯 Тональность: Позитивная (0.87) ████████▒▒      │
│                                                     │
│  Ключевые факты:                                   │
│  • Запуск нового продукта в Q1 2026               │
│  • Инвестиции составили $50M                       │
│  • Ожидаемый рост рынка 25%                       │
│                                                     │
│  Упомянутые персоны:                               │
│  • John Doe (CEO)                                  │
│  • Jane Smith (CTO)                                │
│                                                     │
│  [Создать контент-план] [Сохранить для анализа]   │
└─────────────────────────────────────────────────────┘
```

**Шаг 3: Настройка генерации**
```
┌────────────────────────────────────────────┐
│  Выберите платформы:                       │
│  ☑ Telegram    ☑ VK        ☑ LinkedIn     │
│  ☑ Instagram   ☐ Facebook  ☐ Twitter      │
│                                            │
│  Стиль генерации:                          │
│  ◉ Информационный                          │
│  ○ Вовлекающий                             │
│  ○ Экспертный                              │
│  ○ Эмоциональный                           │
│                                            │
│  Уровень формальности: [======▒▒▒▒] 7/10  │
│                                            │
│  Количество постов: [▼ 5]                 │
│                                            │
│  Стратегия распространения:                │
│  [▼ Равномерное распределение (7 дней)]   │
│                                            │
│  [Создать контент] [Расширенные настройки]│
└────────────────────────────────────────────┘
```

**Шаг 4: Редактор постов**
```
┌─────────────────────────────────────────────────────┐
│  Сгенерировано 5 постов ✨                          │
│                                                     │
│  Пост 1 из 5  [◀ ▶]                               │
│                                                     │
│  Платформа: [Telegram ▼]  Дата: [11 дек, 18:00 ▼]│
│                                                     │
│  ┌───────────────────────────────────────────────┐ │
│  │ 🚀 Компания X представила революционный      │ │
│  │ продукт! Инвестиции $50M, ожидаемый рост    │ │
│  │ рынка 25%.                                   │ │
│  │                                               │ │
│  │ #InnovationNews #TechLaunch #CompanyX        │ │
│  │                                               │ │
│  │ 🔗 Читать полностью →                        │ │
│  └───────────────────────────────────────────────┘ │
│                                                     │
│  [Изображение: product-launch.jpg]                 │
│  [Изменить] [Сгенерировать новое]                  │
│                                                     │
│  Предпросмотр: [Telegram] [Desktop] [Mobile]       │
│                                                     │
│  [✏️ Редактировать] [🔄 Регенерировать]           │
│  [📅 Изменить время] [🗑️ Удалить]                │
│                                                     │
│  [◀ Назад к настройкам] [Сохранить] [Опубликовать ▶]│
└─────────────────────────────────────────────────────┘
```

**3. Календарь публикаций — `/calendar`**

**Calendar View:**
```
┌──────────────────────────────────────────────────┐
│  Декабрь 2025              [Месяц ▼] [Неделя ▼] │
├──────────────────────────────────────────────────┤
│  ПН   ВТ   СР   ЧТ   ПТ   СБ   ВС               │
├──────────────────────────────────────────────────┤
│   9   10   11   12   13   14   15               │
│            📱  📘  📷                            │
│                2    1    1                       │
│                                                  │
│  16   17   18   19   20   21   22               │
│  📱  📘                                          │
│   1    1                                         │
└──────────────────────────────────────────────────┘

Легенда:
📱 Telegram  📘 VK  📷 Instagram  💼 LinkedIn
```

**Timeline View:**
```
┌──────────────────────────────────────────────────┐
│  11 декабря 2025                                 │
├──────────────────────────────────────────────────┤
│  09:00 ─────────────────────────────────────    │
│  10:00 ─────────────────────────────────────    │
│  11:00 ─────────────────────────────────────    │
│  12:00 ─ 📱 "Новый продукт компании X"         │
│  13:00 ─────────────────────────────────────    │
│  14:00 ─────────────────────────────────────    │
│  15:00 ─ 📘 "Запуск инновации от X"            │
│  16:00 ─────────────────────────────────────    │
│  17:00 ─────────────────────────────────────    │
│  18:00 ─ 📷 "Революция в индустрии"            │
└──────────────────────────────────────────────────┘
```

**Drag & Drop:**
- Перетаскивание постов между датами
- Изменение времени публикации
- Группировка постов
- Batch operations (выделение нескольких постов)

**4. Библиотека контента — `/library`**

```
┌────────────────────────────────────────────────────┐
│  Библиотека  [🔍 Поиск...]  [+ Создать]          │
├────────────────────────────────────────────────────┤
│  Фильтры:                                          │
│  Статус: [Все ▼]  Платформа: [Все ▼]             │
│  Период: [Последний месяц ▼]                      │
│  Сортировка: [По дате ▼]                          │
├────────────────────────────────────────────────────┤
│                                                    │
│  ┌──────────────────────────────────────────┐    │
│  │ 📰 "Компания X запускает продукт"        │    │
│  │ 📅 10 дек 2025  |  📊 5 постов           │    │
│  │ Платформы: 📱 📘 📷 💼                   │    │
│  │ Охват: 15.2K  |  Вовлеченность: 4.5%    │    │
│  │ [Просмотреть] [Дублировать] [Архив]     │    │
│  └──────────────────────────────────────────┘    │
│                                                    │
│  ┌──────────────────────────────────────────┐    │
│  │ 📰 "Интервью с CEO компании Y"           │    │
│  │ 📅 8 дек 2025  |  📊 3 поста             │    │
│  │ Платформы: 📱 💼                         │    │
│  │ Охват: 8.7K  |  Вовлеченность: 3.2%     │    │
│  │ [Просмотреть] [Дублировать] [Архив]     │    │
│  └──────────────────────────────────────────┘    │
│                                                    │
└────────────────────────────────────────────────────┘
```

**5. Аналитика — `/analytics`**

```
┌─────────────────────────────────────────────────┐
│  Аналитика  [Последние 30 дней ▼]              │
├─────────────────────────────────────────────────┤
│                                                 │
│  Основные метрики                               │
│  ┌────────────┬────────────┬────────────┐      │
│  │ Охват      │ Вовлеч.    │ CTR        │      │
│  │ 127.5K     │ 4.2%       │ 2.1%       │      │
│  │ +12% ↑     │ +0.5% ↑    │ -0.3% ↓    │      │
│  └────────────┴────────────┴────────────┘      │
│                                                 │
│  График охватов                                 │
│  ┌─────────────────────────────────────────┐   │
│  │ 15K                                     │   │
│  │ 10K         ╱╲    ╱╲                   │   │
│  │  5K    ╱╲  ╱  ╲  ╱  ╲  ╱╲             │   │
│  │  0K  ─────────────────────────────     │   │
│  │      1  5  10  15  20  25  30 дек     │   │
│  └─────────────────────────────────────────┘   │
│                                                 │
│  Эффективность по платформам                    │
│  📱 Telegram   ████████░░  4.5K (35%)          │
│  📘 VK         ██████░░░░  3.2K (25%)          │
│  📷 Instagram  ████████░░  4.1K (32%)          │
│  💼 LinkedIn   ██░░░░░░░░  1.0K (8%)           │
│                                                 │
│  [Экспорт отчета] [Настроить дашборд]         │
└─────────────────────────────────────────────────┘
```

**6. Настройки — `/settings`**

**Подразделы:**
- **Профиль** — данные пользователя
- **Команда** — управление пользователями и ролями
- **Соцсети** — подключение аккаунтов
- **Стиль бренда** — tone of voice, брендинг
- **Шаблоны** — управление шаблонами
- **Уведомления** — настройка оповещений
- **API** — ключи для интеграций
- **Биллинг** — тарифы и оплата

### 5.2 UX/UI принципы

#### 5.2.1 Дизайн-система
- **Цветовая схема:**
  - Primary: Vibrant blue (#0066FF)
  - Success: Green (#00C853)
  - Warning: Orange (#FF9800)
  - Error: Red (#F44336)
  - Neutral: Gray scale
- **Typography:**
  - Headings: Inter / SF Pro
  - Body: Inter / System UI
  - Monospace: JetBrains Mono (для кода)
- **Spacing:** 4px base grid
- **Borders:** Rounded corners (8px default)
- **Shadows:** Subtle elevation (Material Design inspired)

#### 5.2.2 Responsive Design
- **Desktop:** 1920×1080+ (основной фокус)
- **Laptop:** 1366×768
- **Tablet:** 768×1024 (ограниченная функциональность)
- **Mobile:** 375×667+ (только просмотр, базовое редактирование)

#### 5.2.3 Accessibility
- **WCAG 2.1 Level AA** compliance
- Keyboard navigation
- Screen reader support
- Focus indicators
- Высокая контрастность (опция)
- Масштабирование текста

#### 5.2.4 Performance
- **Lazy loading** компонентов
- **Virtual scrolling** для длинных списков
- **Optimistic UI** updates
- **Skeleton screens** во время загрузки
- **Image optimization** (WebP, responsive images)

---

## 6. Этапы разработки

### Этап 1: MVP (6-8 недель)

**Цель:** Минимально работающая версия с базовым функционалом.

**Задачи:**

**Неделя 1-2: Инфраструктура и архитектура**
- Настройка Kubernetes кластера
- Настройка PostgreSQL, Redis, S3
- Настройка gRPC прotobufs
- Настройка GraphQL schema
- CI/CD pipelines

**Неделя 3-4: Backend микросервисы (базовая версия)**
- Parser Service (основные СМИ)
- AI Engine Service (интеграция с Claude/GPT)
- Storage Service (CRUD операции)
- GraphQL Gateway (основные queries/mutations)

**Неделя 5-6: Frontend**
- Next.js setup + Apollo Client
- Страница создания контента
- Простой Dashboard
- Библиотека (список статей и постов)

**Неделя 7-8: Интеграция и тестирование**
- Интеграция всех компонентов
- E2E тесты
- Bug fixes
- Деплой в staging

**Результат MVP:**
- Работающий веб-интерфейс
- Парсинг статей из ТОП-20 российских СМИ
- Генерация постов для 3 платформ (Telegram, VK, Instagram)
- Ручное копирование постов (без автопостинга)
- Базовая библиотека контента
- Простая аналитика

### Этап 2: Базовая версия (8-10 недель)

**Цель:** Добавление автопостинга, улучшение UI, расширение функционала.

**Задачи:**

**Неделя 1-2: Publishing Service**
- Интеграция с Telegram Bot API
- Интеграция с VK API
- Интеграция с Instagram/Facebook API
- Scheduler на BullMQ
- Retry механизм

**Неделя 3-4: Media Service**
- Обработка и оптимизация изображений
- Создание текстовых карточек
- Интеграция с AI image generation
- Upload в S3 + CDN

**Неделя 5-6: Frontend улучшения**
- Календарь публикаций (FullCalendar)
- Drag & Drop для планирования
- Real-time обновления (GraphQL Subscriptions)
- Улучшенный редактор постов
- Предпросмотр для разных платформ

**Неделя 7-8: Аналитика**
- Сбор метрик с платформ
- Dashboard с графиками
- Экспорт отчетов (PDF, Excel)

**Неделя 9-10: Тестирование и полировка**
- Load testing
- Security audit
- Bug fixes
- Documentation

**Результат:**
- Полный автопостинг на 4+ платформ
- Календарь с drag & drop
- Real-time updates
- Базовая аналитика
- Работа с медиа

### Этап 3: Расширенная версия (10-12 недель)

**Цель:** Продвинутые функции, AI-генерация визуала, командная работа.

**Задачи:**

**Неделя 1-3: AI визуальный контент**
- Интеграция с Stable Diffusion / DALL-E
- Генерация инфографики
- Автоматическое создание карточек
- Template system для визуала

**Неделя 4-5: Мониторинг упоминаний**
- RSS агрегация
- Интеграция с Brand24 / YouScan
- Уведомления о новых упоминаниях
- Фильтрация и категоризация

**Неделя 6-7: Командная работа**
- Многопользовательский доступ
- RBAC (роли и права)
- Workflow согласования (draft → review → approved)
- Комментарии в постах
- Activity log
- Real-time collaboration (WebSocket)

**Неделя 8-9: Библиотека и шаблоны**
- Система шаблонов
- Теги и папки
- Поиск и фильтрация
- Сниппеты (часто используемые фразы)
- Импорт/экспорт

**Неделя 10-11: Продвинутая аналитика**
- A/B тестирование
- Предиктивная аналитика
- Рекомендации по оптимизации
- Competitive analysis
- Custom дашборды

**Неделя 12: Интеграции и polish**
- Zapier / Make.com интеграция
- Webhook API
- Chrome extension (опционально)
- Final testing и bug fixes

**Результат:**
- AI-генерация визуального контента
- Мониторинг упоминаний
- Полноценная командная работа
- Система шаблонов
- Продвинутая аналитика
- Внешние интеграции

### Этап 4: Оптимизация и масштабирование (4-6 недель)

**Цель:** Performance, ML, дополнительные платформы.

**Задачи:**

**Неделя 1-2: Performance optimization**
- Database query optimization
- gRPC connection pooling
- GraphQL query complexity limits
- Caching strategy (Redis multi-level)
- CDN optimization
- Code splitting и lazy loading

**Неделя 3-4: ML и персонализация**
- Fine-tuning моделей на данных пользователя
- Персонализация стиля генерации
- Smart scheduling (на основе ML)
- A/B testing automation
- Sentiment prediction

**Неделя 5-6: Дополнительные платформы**
- TikTok integration
- Twitter/X integration
- Pinterest integration
- Medium / Habr integration
- Поддержка региональных платформ

**Результат:**
- Оптимизированная производительность
- Персонализированный AI
- Поддержка 8+ платформ
- Production-ready система

---

## 7. Критерии приёмки и KPI

### 7.1 Функциональные критерии

#### 7.1.1 Работоспособность (обязательно)
- ✅ Парсинг статей из ТОП-50 СМИ с success rate ≥ 95%
- ✅ Генерация контент-плана ≤ 30 секунд
- ✅ Автопостинг работает без ошибок в ≥ 98% случаев
- ✅ GraphQL API response time ≤ 100ms (без LLM)
- ✅ gRPC inter-service latency ≤ 10ms
- ✅ System uptime ≥ 99.9%

#### 7.1.2 Качество контента (критично)
- ✅ Сгенерированные тексты грамотные и связные (оценка ≥ 4.5/5)
- ✅ Фактическая точность 100% (no hallucinations)
- ✅ Стиль адаптирован под каждую платформу
- ✅ Тональность сохранена или изменена по запросу
- ✅ Sentiment analysis accuracy ≥ 85%

#### 7.1.3 Безопасность (обязательно)
- ✅ Все данные зашифрованы (at rest и in transit)
- ✅ JWT token expiration ≤ 24 часа
- ✅ mTLS между микросервисами
- ✅ Rate limiting работает корректно
- ✅ GDPR compliance
- ✅ Regular security audits

#### 7.1.4 Удобство использования (критично)
- ✅ Создание контент-плана из статьи ≤ 3 клика
- ✅ Time to first post ≤ 5 минут (новый пользователь)
- ✅ Интуитивный интерфейс (SUS score ≥ 75)
- ✅ Mobile responsive
- ✅ Accessibility (WCAG 2.1 Level AA)

### 7.2 Технические критерии

#### 7.2.1 Performance
- **Frontend:**
  - First Contentful Paint ≤ 1.5s
  - Time to Interactive ≤ 3s
  - Lighthouse score ≥ 90
- **Backend:**
  - GraphQL query: ≤ 100ms (cached)
  - gRPC call: ≤ 10ms
  - Database query: ≤ 50ms
- **Overall:**
  - Parser: ≤ 3s per article
  - AI generation: ≤ 8s per post
  - Publishing: ≤ 2s per post

#### 7.2.2 Scalability
- Concurrent users: ≥ 500
- Articles/day: ≥ 5,000
- Posts/day: ≥ 20,000
- GraphQL QPS: ≥ 10,000
- gRPC QPS: ≥ 50,000
- Horizontal scaling: auto-scaling в K8s

#### 7.2.3 Reliability
- Uptime: ≥ 99.9%
- MTTR: ≤ 15 минут
- RTO: ≤ 1 час
- RPO: ≤ 5 минут
- Automated backups: daily + continuous WAL

### 7.3 KPI успешности проекта

#### Для пользователей:
- **Экономия времени:** 90% (с 2-3 часов до 10 минут)
- **Увеличение охвата:** +300%
- **Продление жизни новости:** с 3 часов до 5-7 дней
- **Качество контента:** ≥ 4.5/5
- **User satisfaction:** NPS ≥ 50

#### Для бизнеса:
- **MVP launch:** 8 недель
- **Full launch:** 20 недель
- **First 100 users:** 2 месяца после MVP
- **First 1000 users:** 6 месяцев после full launch
- **Retention (D30):** ≥ 60%
- **MRR growth:** 20% MoM
- **CAC payback:** ≤ 6 месяцев

---

## 8. Ограничения и риски

### 8.1 Технические ограничения
- **LLM API зависимость:**
  - Rate limits (Claude: 100K tokens/min)
  - Cost per request ($0.003-0.015 per 1K tokens)
  - Latency (3-8 seconds per request)
- **Social platform API limits:**
  - Rate limits (VK: 3 req/sec, Instagram: varies)
  - Token expiration
  - API changes и breaking updates
- **gRPC limitations:**
  - Требует HTTP/2
  - Browser support ограничен (нужен grpc-web)
  - Debugging сложнее чем REST

### 8.2 Юридические ограничения
- **Авторские права:** нужен disclaimer о fair use
- **GDPR:** обработка персональных данных
- **Закон о персональных данных (152-ФЗ)**
- **Platform ToS:** ограничения на автоматизацию

### 8.3 Риски и митигация

**Высокий риск:**
- **Блокировка API соцсетей**
  - *Митигация:* официальные Business API, соблюдение rate limits, user-agent rotation
  
- **Высокая стоимость LLM API**
  - *Митигация:* caching, prompt optimization, cheaper models для простых задач, batch processing

**Средний риск:**
- **Низкое качество AI генерации**
  - *Митигация:* A/B тестирование промптов, human-in-the-loop, fine-tuning
  
- **Сложность парсинга некоторых сайтов**
  - *Митигация:* headless browser (Playwright), fallback механизмы, manual input option

- **Performance issues под нагрузкой**
  - *Митигация:* horizontal scaling (K8s), caching strategy, load testing

**Низкий риск:**
- **Конкуренция на рынке**
  - *Митигация:* unique features (AI quality, ease of use), быстрый feedback loop

- **Adoption barriers**
  - *Митигация:* freemium модель, extensive documentation, onboarding flow

---

## 9. Поддержка и развитие

### 9.1 DevOps и мониторинг

**Мониторинг:**
- **Prometheus + Grafana:** метрики сервисов
- **Jaeger:** distributed tracing (gRPC)
- **Loki / ELK:** централизованное логирование
- **Sentry:** error tracking
- **Uptime Robot:** availability monitoring

**Алерты:**
- Latency > 1s
- Error rate > 1%
- Service down
- Database connection pool exhaustion
- Queue length > threshold

**SLA:**
- Uptime: 99.9%
- Support response: < 1 hour (critical), < 4 hours (normal)
- Bug fix: < 24 hours (critical), < 1 week (normal)

### 9.2 Roadmap развития

**Q1 2026 (краткосрочный):**
- Mobile app (React Native)
- Video content generation
- Advanced A/B testing
- CRM integrations (Salesforce, HubSpot)

**Q2-Q3 2026 (среднесрочный):**
- White-label solution
- Enterprise features (SSO, SAML)
- Multi-brand management
- Advanced workflow automation
- Marketplace для templates

**Q4 2026+ (долгосрочный):**
- Full content marketing platform
- AI content strategy advisor
- Predictive analytics
- Auto-generated reports
- Voice/video content generation
- Multi-language support

### 9.3 Монетизация

**Тарифные планы:**

**Free:**
- 5 статей/месяц
- 2 подключенных платформы
- Базовая аналитика
- 1 пользователь

**Pro ($49/мес):**
- 50 статей/месяц
- 5 платформ
- Полная аналитика
- AI image generation
- 3 пользователя
- Email support

**Business ($149/мес):**
- 200 статей/месяц
- Все платформы
- Advanced analytics
- A/B testing
- 10 пользователей
- Приоритетная поддержка
- API access

**Enterprise (custom):**
- Unlimited
- White-label
- Dedicated support
- Custom integrations
- SLA guarantees
- On-premise option

---

## 10. Приложения

### 10.1 GraphQL Schema (полная)

```graphql
# Scalars
scalar DateTime
scalar JSON

# Enums
enum Platform {
  TELEGRAM
  VK
  INSTAGRAM
  FACEBOOK
  LINKEDIN
  TWITTER
  TIKTOK
  DZEN
}

enum PostStatus {
  DRAFT
  REVIEW
  APPROVED
  SCHEDULED
  PUBLISHING
  PUBLISHED
  FAILED
  CANCELLED
}

enum Style {
  INFORMATIONAL
  ENGAGING
  EXPERT
  EMOTIONAL
}

enum Sentiment {
  POSITIVE
  NEUTRAL
  NEGATIVE
}

enum UserRole {
  ADMIN
  EDITOR
  PUBLISHER
  VIEWER
}

# Types
type User {
  id: ID!
  email: String!
  name: String!
  role: UserRole!
  avatar: String
  createdAt: DateTime!
  team: Team
  preferences: UserPreferences
}

type Team {
  id: ID!
  name: String!
  members: [TeamMember!]!
  socialAccounts: [SocialAccount!]!
}

type TeamMember {
  user: User!
  role: UserRole!
  joinedAt: DateTime!
}

type Article {
  id: ID!
  url: String!
  title: String!
  content: String!
  excerpt: String
  source: String!
  author: String
  publishedAt: DateTime!
  parsedAt: DateTime!
  sentiment: Sentiment!
  sentimentScore: Float!
  facts: [Fact!]!
  entities: [Entity!]!
  quotes: [Quote!]!
  images: [Image!]!
  posts: [Post!]!
  user: User!
}

type Fact {
  id: ID!
  text: String!
  importance: Float!
}

type Entity {
  id: ID!
  name: String!
  type: String! # PERSON, ORGANIZATION, LOCATION, etc.
  mentions: Int!
}

type Quote {
  id: ID!
  text: String!
  author: String
}

type Image {
  id: ID!
  url: String!
  thumbnailUrl: String
  width: Int
  height: Int
  altText: String
}

type Post {
  id: ID!
  article: Article!
  platform: Platform!
  content: String!
  style: Style!
  status: PostStatus!
  scheduledAt: DateTime
  publishedAt: DateTime
  externalId: String
  images: [Image!]!
  metrics: Metrics
  user: User!
  createdAt: DateTime!
  updatedAt: DateTime!
}

type Metrics {
  views: Int!
  likes: Int!
  comments: Int!
  shares: Int!
  clicks: Int!
  engagement: Float!
  reach: Int!
  impressions: Int!
  updatedAt: DateTime!
}

type SocialAccount {
  id: ID!
  platform: Platform!
  username: String!
  displayName: String
  avatar: String
  isActive: Boolean!
  connectedAt: DateTime!
  expiresAt: DateTime
}

type Template {
  id: ID!
  name: String!
  description: String
  platform: Platform
  style: Style
  content: String!
  tags: [String!]!
  usageCount: Int!
  createdBy: User!
  createdAt: DateTime!
}

type Analytics {
  totalPosts: Int!
  totalReach: Int!
  totalEngagement: Float!
  averageEngagement: Float!
  topPosts: [Post!]!
  platformBreakdown: [PlatformMetrics!]!
  timeline: [TimelineMetrics!]!
}

type PlatformMetrics {
  platform: Platform!
  posts: Int!
  reach: Int!
  engagement: Float!
}

type TimelineMetrics {
  date: DateTime!
  posts: Int!
  reach: Int!
  engagement: Float!
}

type Notification {
  id: ID!
  type: String!
  title: String!
  message: String!
  data: JSON
  read: Boolean!
  createdAt: DateTime!
}

type UserPreferences {
  defaultPlatforms: [Platform!]!
  defaultStyle: Style!
  formalityLevel: Int!
  autoPublish: Boolean!
  notifications: NotificationSettings!
}

type NotificationSettings {
  email: Boolean!
  push: Boolean!
  newMentions: Boolean!
  publishSuccess: Boolean!
  publishFailure: Boolean!
}

# Inputs
input ArticleFilter {
  search: String
  sentiment: Sentiment
  from: DateTime
  to: DateTime
}

input PostFilter {
  platforms: [Platform!]
  status: PostStatus
  from: DateTime
  to: DateTime
}

input GeneratePostsInput {
  articleId: ID!
  platforms: [Platform!]!
  style: Style!
  count: Int = 5
  formalityLevel: Int = 7
  strategy: DistributionStrategy
}

input DistributionStrategy {
  type: String! # QUICK, EVEN, WAVE, SMART
  days: Int
  customSchedule: [DateTime!]
}

input UpdatePostInput {
  content: String
  scheduledAt: DateTime
  images: [ID!]
}

input ConnectSocialAccountInput {
  platform: Platform!
  accessToken: String!
  refreshToken: String
}

# Queries
type Query {
  # Current user
  me: User!
  
  # Articles
  articles(
    limit: Int = 20
    offset: Int = 0
    filter: ArticleFilter
  ): ArticlesConnection!
  
  article(id: ID!): Article
  
  # Posts
  posts(
    limit: Int = 20
    offset: Int = 0
    filter: PostFilter
  ): PostsConnection!
  
  post(id: ID!): Post
  
  scheduledPosts(
    from: DateTime
    to: DateTime
  ): [Post!]!
  
  # Analytics
  analytics(
    from: DateTime!
    to: DateTime!
    platforms: [Platform!]
  ): Analytics!
  
  # Templates
  templates(platform: Platform): [Template!]!
  template(id: ID!): Template
  
  # Social accounts
  socialAccounts: [SocialAccount!]!
  
  # Notifications
  notifications(
    limit: Int = 20
    offset: Int = 0
    unreadOnly: Boolean = false
  ): [Notification!]!
}

type ArticlesConnection {
  nodes: [Article!]!
  totalCount: Int!
  pageInfo: PageInfo!
}

type PostsConnection {
  nodes: [Post!]!
  totalCount: Int!
  pageInfo: PageInfo!
}

type PageInfo {
  hasNextPage: Boolean!
  hasPreviousPage: Boolean!
}

# Mutations
type Mutation {
  # Article operations
  parseArticle(url: String!): ParseArticleResult!
  deleteArticle(id: ID!): Boolean!
  
  # Post generation
  generatePosts(input: GeneratePostsInput!): [Post!]!
  
  # Post operations
  updatePost(id: ID!, input: UpdatePostInput!): Post!
  deletePost(id: ID!): Boolean!
  duplicatePost(id: ID!): Post!
  
  # Publishing
  publishPost(id: ID!): PublishResult!
  publishBatch(ids: [ID!]!): [PublishResult!]!
  schedulePost(id: ID!, scheduledAt: DateTime!): Post!
  cancelScheduledPost(id: ID!): Boolean!
  
  # Social accounts
  connectSocialAccount(input: ConnectSocialAccountInput!): SocialAccount!
  disconnectSocialAccount(id: ID!): Boolean!
  
  # Templates
  createTemplate(
    name: String!
    description: String
    platform: Platform
    style: Style
    content: String!
    tags: [String!]
  ): Template!
  updateTemplate(id: ID!, content: String!): Template!
  deleteTemplate(id: ID!): Boolean!
  
  # User preferences
  updatePreferences(preferences: JSON!): User!
  
  # Notifications
  markNotificationRead(id: ID!): Boolean!
  markAllNotificationsRead: Boolean!
}

type ParseArticleResult {
  article: Article
  error: String
}

type PublishResult {
  post: Post!
  success: Boolean!
  error: String
  externalId: String
}

# Subscriptions
type Subscription {
  # Post status updates
  postStatusChanged(postId: ID!): Post!
  
  # Metrics updates
  metricsUpdated(postId: ID!): Metrics!
  
  # New notifications
  notificationReceived: Notification!
  
  # Parsing progress
  parsingProgress(articleId: ID!): ParsingProgress!
}

type ParsingProgress {
  status: String!
  progress: Int!
  message: String
}
```

### 10.2 gRPC Proto Definitions

**parser.proto:**
```protobuf
syntax = "proto3";

package parser;

service ParserService {
  rpc ParseArticle(ParseRequest) returns (ParsedArticle);
  rpc BatchParseArticles(stream ParseRequest) returns (stream ParsedArticle);
  rpc ValidateURL(URLRequest) returns (ValidationResponse);
}

message ParseRequest {
  string url = 1;
  string user_id = 2;
}

message URLRequest {
  string url = 1;
}

message ValidationResponse {
  bool valid = 1;
  string error = 2;
  string normalized_url = 3;
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
  map<string, string> metadata = 10;
}

message Image {
  string url = 1;
  string thumbnail_url = 2;
  int32 width = 3;
  int32 height = 4;
  string alt_text = 5;
}
```

**ai_engine.proto:**
```protobuf
syntax = "proto3";

package ai_engine;

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

enum Sentiment {
  POSITIVE = 0;
  NEUTRAL = 1;
  NEGATIVE = 2;
}

message Fact {
  string text = 1;
  double importance = 2;
}

message Entity {
  string name = 1;
  string type = 2;
  int32 mentions = 3;
}

message Quote {
  string text = 1;
  string author = 2;
}

message GenerationRequest {
  string article_id = 1;
  repeated string facts = 2;
  string platform = 3;
  string style = 4;
  int32 formality_level = 5;
}

message GeneratedPost {
  string content = 1;
  string platform = 2;
  string style = 3;
  repeated string hashtags = 4;
}

message PostGenerationBatch {
  string article_id = 1;
  repeated string platforms = 2;
  string style = 3;
  int32 count = 4;
}

message FactCheckRequest {
  repeated string claims = 1;
  string original_content = 2;
}

message FactCheckResult {
  repeated FactCheck checks = 1;
}

message FactCheck {
  string claim = 1;
  bool accurate = 2;
  double confidence = 3;
  string explanation = 4;
}
```

### 10.3 Примеры промптов для AI

**Анализ статьи:**
```
Проанализируй эту новостную статью и извлеки структурированную информацию:

Заголовок: {title}
Содержание: {content}

Верни JSON со следующими полями:
{
  "facts": [
    {"text": "...", "importance": 0.0-1.0}
  ],
  "entities": [
    {"name": "...", "type": "PERSON|ORGANIZATION|LOCATION", "mentions": N}
  ],
  "quotes": [
    {"text": "...", "author": "..."}
  ],
  "sentiment": "POSITIVE|NEUTRAL|NEGATIVE",
  "sentiment_score": 0.0-1.0,
  "summary": "..."
}

Требования:
- Извлекай только факты из текста, не додумывай
- Определяй важность факта на основе его релевантности для основной темы
- Определяй sentiment на основе тональности всего текста
```

**Генерация поста (Telegram):**
```
Создай пост для Telegram на основе этих фактов из статьи:

Факты:
{facts}

Требования:
- Длина: 200-500 символов
- Стиль: {style} (INFORMATIONAL|ENGAGING|EXPERT|EMOTIONAL)
- Уровень формальности: {formality_level}/10
- Добавь 2-3 релевантных эмодзи
- Добавь 2-3 хештега
- Включи call-to-action в конце
- НЕ придумывай факты, используй только данные выше
- Сохрани тональность: {sentiment}

Верни только текст поста, без дополнительных пояснений.
```

### 10.4 Database Schema (PostgreSQL)

```sql
-- Users and Teams
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE team_members (
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR(50) NOT NULL,
  joined_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (team_id, user_id)
);

-- Articles
CREATE TABLE articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  url TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT,
  source VARCHAR(255),
  author VARCHAR(255),
  published_at TIMESTAMP,
  parsed_at TIMESTAMP DEFAULT NOW(),
  sentiment VARCHAR(20) NOT NULL,
  sentiment_score FLOAT,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_articles_user_id ON articles(user_id);
CREATE INDEX idx_articles_published_at ON articles(published_at DESC);
CREATE INDEX idx_articles_sentiment ON articles(sentiment);

-- Facts, Entities, Quotes
CREATE TABLE facts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id UUID REFERENCES articles(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  importance FLOAT NOT NULL
);

CREATE TABLE entities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id UUID REFERENCES articles(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL,
  mentions INT NOT NULL
);

CREATE TABLE quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id UUID REFERENCES articles(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  author VARCHAR(255)
);

-- Images
CREATE TABLE images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  url TEXT NOT NULL,
  thumbnail_url TEXT,
  width INT,
  height INT,
  alt_text TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE article_images (
  article_id UUID REFERENCES articles(id) ON DELETE CASCADE,
  image_id UUID REFERENCES images(id) ON DELETE CASCADE,
  PRIMARY KEY (article_id, image_id)
);

-- Posts
CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id UUID REFERENCES articles(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  platform VARCHAR(50) NOT NULL,
  content TEXT NOT NULL,
  style VARCHAR(50) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'DRAFT',
  scheduled_at TIMESTAMP,
  published_at TIMESTAMP,
  external_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_posts_article_id ON posts(article_id);
CREATE INDEX idx_posts_status ON posts(status);
CREATE INDEX idx_posts_scheduled_at ON posts(scheduled_at);
CREATE INDEX idx_posts_platform ON posts(platform);

CREATE TABLE post_images (
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  image_id UUID REFERENCES images(id) ON DELETE CASCADE,
  PRIMARY KEY (post_id, image_id)
);

-- Metrics
CREATE TABLE metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  views INT DEFAULT 0,
  likes INT DEFAULT 0,
  comments INT DEFAULT 0,
  shares INT DEFAULT 0,
  clicks INT DEFAULT 0,
  reach INT DEFAULT 0,
  impressions INT DEFAULT 0,
  engagement FLOAT DEFAULT 0,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Social Accounts
CREATE TABLE social_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  platform VARCHAR(50) NOT NULL,
  username VARCHAR(255) NOT NULL,
  display_name VARCHAR(255),
  avatar_url TEXT,
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  expires_at TIMESTAMP,
  is_active BOOLEAN DEFAULT true,
  connected_at TIMESTAMP DEFAULT NOW()
);

-- Templates
CREATE TABLE templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  platform VARCHAR(50),
  style VARCHAR(50),
  content TEXT NOT NULL,
  tags TEXT[],
  usage_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- User Preferences
CREATE TABLE user_preferences (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  default_platforms TEXT[],
  default_style VARCHAR(50),
  formality_level INT DEFAULT 7,
  auto_publish BOOLEAN DEFAULT false,
  notification_settings JSONB,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Notifications
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  data JSONB,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);
```

---

## Заключение

Данное техническое задание описывает создание **современной веб-платформы** для автоматизации PR и SMM с использованием передовых технологий:

**Ключевые технологические решения:**
- **GraphQL** — гибкий и эффективный API для frontend
- **gRPC** — высокопроизводительная коммуникация между микросервисами
- **Микросервисная архитектура** — масштабируемость и независимая разработка
- **Kubernetes** — оркестрация и автоматическое масштабирование
- **React + Next.js** — современный, быстрый frontend
- **AI/LLM** — интеллектуальная генерация контента

**Преимущества платформы:**
- ⚡️ **Скорость:** полный контент-план за 30 секунд
- 🎯 **Качество:** AI-адаптация под каждую платформу
- 🤖 **Автоматизация:** от анализа до публикации
- 📈 **Эффективность:** +300% охват, 90% экономии времени
- 🔒 **Надежность:** 99.9% uptime, enterprise-grade security
- 📊 **Аналитика:** real-time метрики и insights

**Реализация:** поэтапная, с фокусом на быструю валидацию через MVP и итеративное улучшение на основе feedback пользователей.

---

**Версия документа:** 2.0 (Web Platform)  
**Дата:** Декабрь 2025  
**Статус:** Готово к разработке  
**Архитектура:** GraphQL + gRPC + Микросервисы**