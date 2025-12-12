# Backend Development Roadmap

## 📋 Оптимальный порядок разработки

Разработка backend должна идти поэтапно с возможностью тестирования на каждом шаге.

---

## Этап 0: Подготовка инфраструктуры (1-2 недели)

### 0.1 Базовая инфраструктура
**Цель:** Подготовить окружение для разработки

**Задачи:**
1. ✅ **Docker Compose** для локальной разработки
   ```yaml
   # docker-compose.yml
   services:
     postgres:
       image: postgres:15-alpine
       ports: ["5432:5432"]
     redis:
       image: redis:7-alpine
       ports: ["6379:6379"]
     minio:
       image: minio/minio
       ports: ["9000:9000"]
   ```

2. ✅ **Database setup**
   - PostgreSQL схема
   - Миграции (Alembic/TypeORM)
   - Seed данные для тестирования

3. ✅ **Proto files** для gRPC
   - Создать все .proto файлы
   - Сгенерировать код для всех языков
   - Настроить CI для автоматической генерации

**Результат:** 
- Локальное окружение запускается одной командой
- База данных с базовой схемой
- Proto файлы готовы

---

## Этап 1: Storage Service (1 неделя)

### Почему первый?
- Все сервисы зависят от Storage
- Простой CRUD сервис - хорошая база для начала
- Можно быстро протестировать gRPC коммуникацию

### 1.1 Основной функционал
```
Week 1, Days 1-3: Базовый CRUD
├── Настройка Go/Rust проекта
├── Подключение к PostgreSQL
├── Реализация gRPC методов:
│   ├── SaveArticle / GetArticle
│   ├── SavePost / GetPost
│   └── ListArticles / ListPosts
└── Unit тесты

Week 1, Days 4-5: Дополнительные функции
├── File upload/download (streaming)
├── Кэширование (Redis)
└── Connection pooling

Week 1, Days 6-7: Тестирование
├── Integration тесты
├── Load тесты
└── Документация API
```

**Как тестировать:**
```bash
# gRPC тестирование
grpcurl -plaintext -d '{"id":"123"}' localhost:50055 storage.StorageService/GetArticle
```

**Результат:**
- ✅ Работающий Storage Service
- ✅ Можно сохранять/получать данные
- ✅ Готов для использования другими сервисами

---

## Этап 2: Parser Service (1-1.5 недели)

### Почему второй?
- Не зависит от других микросервисов (кроме Storage)
- Можно тестировать независимо
- Фундамент для всего pipeline

### 2.1 Разработка (Week 2)
```
Days 1-2: Базовый парсинг
├── Python проект (FastAPI + gRPC)
├── Интеграция Newspaper3k/Scrapy
├── Парсинг ТОП-10 российских СМИ
│   ├── tass.ru
│   ├── ria.ru
│   ├── interfax.ru
│   └── ...
└── Базовая очистка контента

Days 3-4: JavaScript сайты
├── Playwright интеграция
├── Headless browser
├── Anti-bot обход
└── Rate limiting

Days 5-6: Улучшения
├── Кэширование результатов
├── Retry механизм
├── Обработка ошибок
└── Site configs (YAML)

Days 7: Тестирование
├── Unit тесты
├── Integration с Storage
└── Тесты на реальных сайтах
```

**Тестирование:**
```python
# Тест парсинга
python -m pytest tests/test_parser.py

# Ручной тест gRPC
grpcurl -d '{"url":"https://tass.ru/..."}' localhost:50051 parser.ParserService/ParseArticle
```

**Результат:**
- ✅ Парсит статьи из основных СМИ
- ✅ Сохраняет в Storage Service
- ✅ Обрабатывает ошибки

---

## Этап 3: GraphQL Gateway (1.5 недели)

### Почему третий?
- Нужен для тестирования через фронтенд
- Связывает все микросервисы
- Критичен для дальнейшей разработки

### 3.1 Базовая настройка (Week 3)
```
Days 1-2: Основа
├── Apollo Server setup
├── Schema определение
├── gRPC clients для всех сервисов
└── Authentication middleware (JWT)

Days 3-5: Queries & Mutations
├── Articles queries
│   ├── articles(filter, pagination)
│   └── article(id)
├── Parse mutation
│   └── parseArticle(url)
├── Posts queries
│   ├── posts(filter)
│   └── post(id)
└── DataLoader для батчинга

Days 6-7: Subscriptions
├── WebSocket setup
├── Redis Pub/Sub
├── parsingProgress subscription
└── Тестирование
```

**Тестирование:**
```bash
# Запуск GraphQL Playground
http://localhost:4000/graphql

# Тест query
query {
  articles(limit: 10) {
    nodes {
      id
      title
    }
  }
}

# Тест mutation
mutation {
  parseArticle(url: "https://example.com") {
    article { id title }
  }
}
```

**Результат:**
- ✅ GraphQL API работает
- ✅ Фронтенд может подключиться
- ✅ Базовый flow: парсинг → сохранение → отображение

---

## Этап 4: AI Engine Service (2 недели)

### Почему четвертый?
- Самый сложный сервис
- Требует интеграции с LLM API
- Критичен для основного функционала

### 4.1 Разработка (Week 4-5)
```
Week 4, Days 1-3: Анализ контента
├── Python + LangChain setup
├── Интеграция с Claude/GPT-4
├── Sentiment analysis
├── Fact extraction
├── NER (Named Entity Recognition)
└── Quote extraction

Week 4, Days 4-7: Генерация контента
├── Система промптов
├── Генерация для каждой платформы:
│   ├── Telegram (200-500 символов)
│   ├── VK (300-800 символов)
│   ├── Instagram (150-300 символов)
│   └── LinkedIn (600-1200 символов)
├── Стилистическая адаптация
└── Fact-checking (против галлюцинаций)

Week 5, Days 1-3: Оптимизация
├── Prompt caching
├── Batch processing
├── Cost optimization
├── Token tracking
└── Fallback механизмы

Week 5, Days 4-5: Тестирование
├── Unit тесты для промптов
├── A/B тестирование генерации
├── Проверка качества
└── Load тесты
```

**Тестирование:**
```python
# Тест анализа
result = await ai_service.analyze_content(article_text)
assert result.sentiment in ['POSITIVE', 'NEUTRAL', 'NEGATIVE']
assert len(result.facts) > 0

# Тест генерации
posts = await ai_service.generate_posts(
    facts=facts,
    platforms=['TELEGRAM', 'VK'],
    style='ENGAGING'
)
assert len(posts) == 2
assert 200 <= len(posts[0].content) <= 500  # Telegram
```

**Результат:**
- ✅ Анализирует статьи
- ✅ Генерирует качественные посты
- ✅ Адаптирует под платформы
- ✅ Контролирует стоимость

---

## Этап 5: Publishing Service (1.5 недели)

### Почему пятый?
- Требует интеграции с внешними API
- Зависит от AI Engine (нужен контент для публикации)
- Критичен для end-to-end flow

### 5.1 Разработка (Week 6)
```
Days 1-2: Базовая структура
├── Node.js + NestJS setup
├── BullMQ + Redis для очередей
├── OAuth управление
└── Token хранение (зашифрованное)

Days 3-5: Интеграции
├── Telegram Bot API
│   ├── sendMessage
│   ├── sendPhoto
│   └── sendMediaGroup
├── VK API
│   ├── wall.post
│   ├── photos.getWallUploadServer
│   └── photos.saveWallPhoto
├── Facebook API
│   └── /feed endpoint
└── Instagram API
    └── Container + Publish flow

Days 6-7: Job Queue & Retry
├── Scheduling механизм
├── Retry с exponential backoff
├── Dead letter queue
├── Circuit breaker
└── Тестирование
```

**Тестирование:**
```typescript
// Тест публикации в Telegram
const result = await publishingService.publish({
  platform: 'TELEGRAM',
  channelId: '@test_channel',
  content: 'Test post',
  mediaUrls: ['https://example.com/image.jpg']
});
expect(result.success).toBe(true);

// Тест scheduling
const job = await publishingService.schedule({
  postId: '123',
  scheduledAt: new Date(Date.now() + 3600000) // +1 hour
});
expect(job.id).toBeDefined();
```

**Результат:**
- ✅ Публикует на 4+ платформы
- ✅ Scheduling работает
- ✅ Retry при ошибках
- ✅ Собирает метрики

---

## Этап 6: Media Service (1 неделя)

### Почему шестой?
- Опциональный для MVP
- Улучшает качество контента
- Можно добавить позже

### 6.1 Разработка (Week 7)
```
Days 1-3: Обработка изображений
├── Pillow/Sharp setup
├── Resize & crop
├── Оптимизация (сжатие)
├── Конвертация форматов
└── Watermark

Days 4-5: AI-генерация (optional)
├── Stable Diffusion интеграция
├── DALL-E интеграция
└── Инфографика

Days 6-7: Тестирование
└── Unit + Integration тесты
```

**Результат:**
- ✅ Обрабатывает изображения
- ✅ Оптимизирует под платформы
- ⚠️ AI-генерация (nice-to-have)

---

## Этап 7: Интеграция и E2E тесты (1 неделя)

### 7.1 End-to-End flow (Week 8)
```
Days 1-3: E2E тесты
├── Полный flow: URL → Публикация
│   1. Parse article
│   2. Analyze content
│   3. Generate posts
│   4. Publish to platforms
│   5. Collect metrics
└── Automated E2E suite

Days 4-5: Performance тесты
├── Load testing
├── Stress testing
└── Bottleneck анализ

Days 6-7: Мониторинг
├── Prometheus metrics
├── Grafana dashboards
├── Jaeger tracing
└── Loki logging
```

**E2E тест:**
```typescript
describe('Full Pipeline', () => {
  it('should process article and publish', async () => {
    // 1. Parse
    const article = await graphql(`
      mutation { parseArticle(url: "https://example.com/article") { id } }
    `);
    
    // 2. Generate
    const posts = await graphql(`
      mutation { generatePosts(articleId: "${article.id}", platforms: [TELEGRAM]) { id } }
    `);
    
    // 3. Publish
    const result = await graphql(`
      mutation { publishPost(id: "${posts[0].id}") { success } }
    `);
    
    expect(result.success).toBe(true);
  });
});
```

**Результат:**
- ✅ Весь pipeline работает
- ✅ Performance приемлемый
- ✅ Мониторинг настроен

---

## 📊 Timeline Summary

```
Этап 0: Инфраструктура       [██] 1-2 недели
Этап 1: Storage Service      [██] 1 неделя
Этап 2: Parser Service       [███] 1.5 недели
Этап 3: GraphQL Gateway      [███] 1.5 недели
Этап 4: AI Engine Service    [████] 2 недели
Этап 5: Publishing Service   [███] 1.5 недели
Этап 6: Media Service        [██] 1 неделя
Этап 7: Integration & Tests  [██] 1 неделя
─────────────────────────────────────────────
ИТОГО:                       10-11 недель (MVP)
```

---

## 🔄 Параллельная разработка

После Этапа 1 (Storage готов) можно параллелить:

### Команда из 3-4 человек:
```
Developer 1: AI Engine Service     [████████░░] Week 4-5
Developer 2: Publishing Service    [████████░░] Week 4-5
Developer 3: Media Service         [████░░░░░░] Week 5
Developer 4: Frontend Integration  [██████████] Week 3-7
```

**Сокращение до 7-8 недель** при параллельной работе!

---

## ✅ Чеклист для каждого этапа

### Перед переходом к следующему этапу:

- [ ] ✅ Все unit тесты проходят
- [ ] ✅ Integration тесты написаны
- [ ] ✅ gRPC методы задокументированы
- [ ] ✅ Docker image собирается
- [ ] ✅ Сервис запускается в docker-compose
- [ ] ✅ Ручное тестирование пройдено
- [ ] ✅ Code review выполнен
- [ ] ✅ Мониторинг настроен (метрики, логи)

---

## 🎯 Приоритеты по функциям

### Must Have (MVP):
1. ✅ Парсинг статей (ТОП-20 СМИ)
2. ✅ AI анализ (sentiment, facts, entities)
3. ✅ Генерация постов (3 платформы: Telegram, VK, LinkedIn)
4. ✅ Ручная публикация (copy-paste)
5. ✅ Базовая библиотека контента

### Should Have (v1.0):
1. ✅ Автопостинг (4+ платформы)
2. ✅ Scheduling
3. ✅ Календарь публикаций
4. ✅ Базовая аналитика
5. ✅ Обработка изображений

### Nice to Have (v1.1+):
1. ⚠️ AI-генерация изображений
2. ⚠️ Видео контент
3. ⚠️ A/B тестирование
4. ⚠️ Командная работа
5. ⚠️ Advanced аналитика

---

## 🚨 Типичные проблемы и решения

### Проблема 1: LLM API дорогой
**Решение:**
- Кэшировать результаты анализа
- Использовать batch processing
- Fallback на более дешевые модели
- Prompt optimization

### Проблема 2: Social API rate limits
**Решение:**
- Очереди с rate limiting
- Multiple tokens rotation
- Exponential backoff
- Мониторинг лимитов

### Проблема 3: gRPC debugging сложный
**Решение:**
- Использовать grpcurl для тестов
- Добавить logging interceptors
- Jaeger для tracing
- gRPC reflection для discovery

### Проблема 4: WebSocket subscriptions нестабильны
**Решение:**
- Automatic reconnection
- Heartbeat/ping-pong
- Exponential backoff
- Graceful degradation

---

## 📚 Полезные ссылки

- [Storage Service](../services/storage-service.md)
- [Parser Service](../services/parser-service.md)
- [AI Engine Service](../services/ai-engine-service.md)
- [Publishing Service](../services/publishing-service.md)
- [Social Platforms Integration](../integrations/social-platforms.md)
- [GraphQL Schema](../api/graphql/schema.md)
- [gRPC Protobuf](../api/grpc/protobuf.md)

---

## 🎓 Рекомендации

### 1. Start Small
Начните с минимального набора функций, но сделайте их качественно.

### 2. Test Early
Пишите тесты с первого дня. Они окупятся.

### 3. Monitor Everything
Metrics, logs, traces - настройте сразу.

### 4. Document as You Go
Не откладывайте документацию на потом.

### 5. Use Docker
Все сервисы должны запускаться в Docker с первого дня.

### 6. Automate
CI/CD, тесты, деплой - автоматизируйте максимум.

---

**Следуя этому плану, вы получите работающий MVP за 10-11 недель (или 7-8 при параллельной разработке)! 🚀**

