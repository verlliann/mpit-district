# Диаграммы взаимодействия

## Обзор

Визуальное представление потоков данных и взаимодействий в системе.

---

## 1. Общая архитектура системы

```
┌─────────────────────────────────────────────────────────────┐
│                        Client Layer                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Web App      │  │ Mobile App   │  │ Browser Ext  │      │
│  │ (React/Next) │  │ (Optional)   │  │ (Optional)   │      │
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
┌─────────┴──────────────────────────────────────────────────┐
│                     Service Layer (gRPC)                    │
│                                                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │  Parser  │  │    AI    │  │  Media   │  │Publishing│  │
│  │ Service  │─→│  Engine  │─→│ Service  │─→│ Service  │  │
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

---

## 2. Поток создания контента

### Шаг 1: Парсинг статьи

```
┌─────────┐      HTTP/GraphQL      ┌─────────────┐
│         │─────────────────────────▶│             │
│  Client │    parseArticle(url)    │   GraphQL   │
│         │◀─────────────────────────│   Gateway   │
└─────────┘      Job ID + Status    └─────┬───────┘
                                           │ gRPC
                                           │
                                    ┌──────▼───────┐
                                    │    Parser    │
                                    │    Service   │
                                    └──────┬───────┘
                                           │
                                    ┌──────▼───────┐
                                    │   Storage    │
                                    │   Service    │
                                    └──────┬───────┘
                                           │
                                    ┌──────▼───────┐
                                    │  PostgreSQL  │
                                    └──────────────┘
```

### Шаг 2: Анализ контента

```
┌──────────────┐      gRPC       ┌──────────────┐
│   GraphQL    │────────────────▶│  AI Engine   │
│   Gateway    │  AnalyzeContent │   Service    │
│              │◀────────────────│              │
└──────────────┘  Analysis Result└──────┬───────┘
                                        │
                                 ┌──────▼───────┐
                                 │     LLM      │
                                 │  (Claude/    │
                                 │   GPT-4)     │
                                 └──────────────┘
```

### Шаг 3: Генерация постов

```
┌─────────┐    generatePosts()    ┌─────────────┐
│ Client  │───────────────────────▶│   GraphQL   │
└─────────┘                        │   Gateway   │
                                   └─────┬───────┘
                                         │ gRPC
                                         │
                                  ┌──────▼───────┐
                                  │  AI Engine   │
                                  │   Service    │
                                  └──────┬───────┘
                                         │
                            ┌────────────┴────────────┐
                            │                         │
                     ┌──────▼───────┐         ┌──────▼───────┐
                     │    Media     │         │   Storage    │
                     │   Service    │         │   Service    │
                     └──────────────┘         └──────┬───────┘
                                                     │
                                              ┌──────▼───────┐
                                              │  PostgreSQL  │
                                              └──────────────┘
```

### Шаг 4: Публикация

```
┌─────────┐   publishPost(id)    ┌─────────────┐
│ Client  │──────────────────────▶│   GraphQL   │
└─────────┘                       │   Gateway   │
                                  └─────┬───────┘
                                        │ gRPC
                                        │
                                 ┌──────▼───────┐
                                 │ Publishing   │
                                 │  Service     │
                                 └──────┬───────┘
                                        │
                         ┌──────────────┼──────────────┐
                         │              │              │
                  ┌──────▼──────┐ ┌─────▼──────┐ ┌────▼─────┐
                  │  Telegram   │ │   VK API   │ │  Meta    │
                  │    Bot API  │ │            │ │  API     │
                  └─────────────┘ └────────────┘ └──────────┘
```

---

## 3. Асинхронная обработка

### Job Queue Pattern

```
┌─────────┐                    ┌─────────────┐
│ Client  │───── Request ─────▶│  GraphQL    │
└─────────┘                    │  Gateway    │
     ▲                         └─────┬───────┘
     │                               │
     │                               │ Add to Queue
     │                               ▼
     │                         ┌─────────────┐
     │                         │    Redis    │
     │                         │   (BullMQ)  │
     │                         └─────┬───────┘
     │                               │
     │ Subscription                  │ Pop Job
     │ (Progress Updates)            │
     │                               ▼
     │                         ┌─────────────┐
     └─────────────────────────│   Worker    │
            WebSocket          │  (Service)  │
                               └─────┬───────┘
                                     │
                                     │ Save Result
                                     ▼
                               ┌─────────────┐
                               │  Storage    │
                               │  Service    │
                               └─────────────┘
```

---

## 4. Real-time обновления (GraphQL Subscriptions)

```
┌─────────┐                         ┌─────────────┐
│ Client  │──── WebSocket ──────────│  GraphQL    │
│         │      Subscribe          │  Gateway    │
└─────────┘                         └─────┬───────┘
     ▲                                    │
     │                                    │ Pub/Sub
     │                                    ▼
     │                              ┌─────────────┐
     │                              │    Redis    │
     │                              │   Pub/Sub   │
     │                              └─────┬───────┘
     │                                    ▲
     │                                    │
     │       Event Published              │
     │◀───────────────────────────────────┘
     │                                    
     └────── Update UI ──────────────────

События:
- postStatusChanged
- metricsUpdated
- notificationReceived
- parsingProgress
```

---

## 5. Authentication Flow

### Регистрация / Login

```
┌─────────┐     1. Credentials    ┌─────────────┐
│ Client  │──────────────────────▶│  GraphQL    │
└─────────┘                       │  Gateway    │
     ▲                            └─────┬───────┘
     │                                  │
     │                                  │ 2. Verify
     │                                  ▼
     │                            ┌─────────────┐
     │                            │  Auth       │
     │                            │  Service    │
     │                            └─────┬───────┘
     │                                  │
     │                                  │ 3. Query DB
     │                                  ▼
     │                            ┌─────────────┐
     │    5. JWT Token            │ PostgreSQL  │
     │◀───────────────────────────└─────────────┘
     │                            4. Generate JWT
     │
     └──── 6. Store in localStorage ────
```

### Authenticated Request

```
┌─────────┐   1. Request + JWT    ┌─────────────┐
│ Client  │──────────────────────▶│  GraphQL    │
└─────────┘                       │  Gateway    │
     ▲                            └─────┬───────┘
     │                                  │
     │                                  │ 2. Verify JWT
     │                                  │ Extract user_id
     │                                  ▼
     │                            ┌─────────────┐
     │                            │  Microservice│
     │    4. Response             │  (with user) │
     │◀───────────────────────────└─────────────┘
                                  3. Process request
```

---

## 6. Service Mesh (Istio)

```
┌──────────────────────────────────────────────────┐
│                   Kubernetes                     │
│                                                  │
│  ┌────────────┐         ┌────────────┐         │
│  │  Service A │         │  Service B │         │
│  │            │         │            │         │
│  │  ┌──────┐  │         │  ┌──────┐  │         │
│  │  │ App  │  │         │  │ App  │  │         │
│  │  └───┬──┘  │         │  └───▲──┘  │         │
│  │      │     │         │      │     │         │
│  │  ┌───▼──┐  │  mTLS   │  ┌───┴──┐  │         │
│  │  │Envoy │  │─────────┼─▶│Envoy │  │         │
│  │  │Proxy │  │         │  │Proxy │  │         │
│  │  └──────┘  │         │  └──────┘  │         │
│  └────────────┘         └────────────┘         │
│         │                      │                │
│         └──────────┬───────────┘                │
│                    │                            │
│              ┌─────▼─────┐                      │
│              │   Istio   │                      │
│              │  Control  │                      │
│              │   Plane   │                      │
│              └───────────┘                      │
└──────────────────────────────────────────────────┘

Features:
- Traffic routing
- Load balancing
- Circuit breaker
- Retries
- Timeouts
- Metrics & Tracing
- mTLS enforcement
```

---

## 7. Data Flow для аналитики

```
┌─────────────┐
│ Social API  │
│ (Telegram,  │
│  VK, etc.)  │
└─────┬───────┘
      │ Webhook / Polling
      ▼
┌─────────────┐
│ Publishing  │
│  Service    │
└─────┬───────┘
      │ Save metrics
      ▼
┌─────────────┐      ┌──────────┐
│  Storage    │─────▶│PostgreSQL│
│  Service    │      └──────────┘
└─────┬───────┘
      │ Pub event
      ▼
┌─────────────┐
│    Redis    │
│   Pub/Sub   │
└─────┬───────┘
      │
      ▼
┌─────────────┐      ┌──────────┐
│  Analytics  │─────▶│ Grafana  │
│  Service    │      └──────────┘
└─────────────┘
```

---

## 8. Deployment Pipeline

```
┌─────────┐
│   Git   │
│  Push   │
└────┬────┘
     │
     ▼
┌────────────┐
│  GitHub    │
│  Actions   │
└────┬───────┘
     │
     ├──▶ 1. Lint & Format
     ├──▶ 2. Unit Tests
     ├──▶ 3. Build Docker Images
     ├──▶ 4. Push to Registry
     │
     ▼
┌────────────┐
│   ArgoCD   │
│  (GitOps)  │
└────┬───────┘
     │
     ├──▶ 5. Deploy to Staging
     ├──▶ 6. Integration Tests
     ├──▶ 7. Manual Approval
     │
     ▼
┌────────────┐
│ Production │
│ Kubernetes │
└────────────┘
```

---

## 9. Monitoring & Alerting Flow

```
┌─────────────┐
│ Microservice│
└─────┬───────┘
      │ Expose metrics
      │ (/metrics endpoint)
      ▼
┌─────────────┐
│ Prometheus  │─────┬─────▶ ┌──────────┐
│  (Scrape)   │     │       │ Grafana  │
└─────────────┘     │       │Dashboard │
      │             │       └──────────┘
      │             │
      │             │       ┌──────────┐
      │             └──────▶│Alertmanager│
      │                     │(Alerts)  │
      ▼                     └──────────┘
┌─────────────┐
│   Jaeger    │
│  (Tracing)  │
└─────────────┘
```

---

## 10. Backup & Disaster Recovery

```
┌─────────────┐
│ PostgreSQL  │
│  (Primary)  │
└─────┬───────┘
      │
      ├──▶ Continuous WAL Archiving
      │    (Write-Ahead Log)
      │         │
      │         ▼
      │    ┌─────────┐
      │    │   S3    │
      │    │ Backups │
      │    └─────────┘
      │
      ├──▶ Daily Full Backup
      │         │
      │         ▼
      │    ┌─────────┐
      │    │   S3    │
      │    │ Archive │
      │    └─────────┘
      │
      └──▶ Read Replica (Hot Standby)
                │
                ▼
           ┌─────────────┐
           │ PostgreSQL  │
           │  (Replica)  │
           └─────────────┘

Recovery Time Objective (RTO): ≤ 1 hour
Recovery Point Objective (RPO): ≤ 5 minutes
```

---

**См. также:**
- [Общая архитектура](./overview.md)
- [Микросервисы](./microservices.md)
- [Infrastructure](../infrastructure/kubernetes.md)

