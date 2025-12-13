# 📁 Структура проекта Publishing Service

Финальная структура проекта, адаптированная под `publishing.proto`.

---

## 🏗️ Общая структура

```
services/publishing-service/
├── 📦 src/                          # Основной gRPC сервис
│   ├── bots/                        # Реализации 6 платформ
│   │   ├── base.bot.ts              # Базовый класс
│   │   ├── telegram.bot.ts          # Telegram Bot
│   │   ├── vk.bot.ts                # VK Bot
│   │   ├── facebook.bot.ts          # Facebook Bot
│   │   ├── instagram.bot.ts         # Instagram Bot
│   │   ├── linkedin.bot.ts          # LinkedIn Bot
│   │   └── twitter.bot.ts           # Twitter Bot
│   ├── queue/                       # BullMQ очереди
│   │   ├── types.ts                 # Типы (соответствуют proto)
│   │   ├── index.ts                 # Инициализация очередей
│   │   └── processors/              # Обработчики задач
│   │       └── publishing.processor.ts
│   ├── services/                    # gRPC сервисы
│   │   └── publishing.service.ts    # 9 RPC методов
│   ├── utils/                       # Утилиты сервиса
│   │   ├── logger.ts                # Логирование (Pino)
│   │   ├── rate-limiter.ts          # Rate limiting
│   │   ├── retry.ts                 # Retry механизм
│   │   └── proto-loader.ts          # Загрузка proto файлов
│   ├── config.ts                    # Конфигурация
│   └── index.ts                     # Entry point
│
├── 📊 utils-metrics/                # Утилиты сбора метрик (отдельно!)
│   ├── README.md                    # Документация утилит
│   ├── vk-metrics-collector.js      # VK сборщик (Node.js)
│   ├── collect-vk-metrics.js        # VK запуск
│   ├── telegram_auth_interactive.py # Telegram авторизация (Python)
│   └── telegram_collect_metrics.py  # Telegram сбор (Python)
│
├── 📝 metrics/                      # Собранные метрики (генерируется)
│   ├── vk_metrics_*.json            # VK данные
│   ├── vk_report_*.txt              # VK отчёты
│   ├── telegram_metrics_*.json      # Telegram данные
│   └── telegram_report_*.txt        # Telegram отчёты
│
├── 📚 Документация
│   ├── README.md                    # Краткое описание
│   └── DEVOPS.md                    # Полная DevOps документация
│
├── 🧪 Тестовые скрипты
│   └── send-both.js                 # Тест отправки в VK + Telegram
│
└── ⚙️ Конфигурация
    ├── package.json                 # Node.js зависимости
    ├── tsconfig.json                # TypeScript конфиг
    └── .env                         # Переменные окружения (не коммитится)
```

---

## 🎯 Соответствие publishing.proto

### ✅ Реализованные RPC методы (9/9):

| # | Метод | Статус | Файл |
|---|-------|--------|------|
| 1 | `HealthCheck` | ✅ | publishing.service.ts:9 |
| 2 | `PublishPost` | ✅ | publishing.service.ts:20 |
| 3 | `PublishBatch` | ✅ | publishing.service.ts:88 |
| 4 | `SchedulePost` | ✅ | publishing.service.ts:157 |
| 5 | `CancelScheduledPost` | ✅ | publishing.service.ts:212 |
| 6 | `UpdatePublishedPost` | ✅ | publishing.service.ts:244 |
| 7 | `DeletePublishedPost` | ✅ | publishing.service.ts:288 |
| 8 | `TestConnection` | ✅ | publishing.service.ts:323 |
| 9 | `GetPlatformLimits` | ✅ | publishing.service.ts:374 |

### ✅ Типы данных соответствуют proto:

- `Platform` enum - 6 платформ
- `PublishingErrorCode` enum - 12 кодов ошибок
- `PublishOptions` - все поля (location, hashtags, mentions, etc.)
- `ConnectionInfo` + `AccountInfo` + `RateLimitInfo`
- `PlatformLimits` (ContentLimits, MediaLimits, PostingLimits)
- `ImageDimensions` - все 5 полей

### ✅ Платформы реализованы (6/6):

| Платформа | Публикация | Редактирование | Удаление | Лимиты |
|-----------|------------|----------------|----------|--------|
| Telegram  | ✅ | ✅ (48ч) | ✅ | ✅ |
| VK        | ✅ | ✅ (24ч) | ✅ | ✅ |
| Facebook  | ✅ | ✅ (1ч) | ✅ | ✅ |
| Instagram | ✅ | ❌ | ✅ | ✅ |
| LinkedIn  | ✅ | ❌ | ✅ | ✅ |
| Twitter   | ✅ | ❌ | ✅ | ✅ |

---

## 📊 Метрики (отдельные утилиты)

**Важно:** Метрики **НЕ входят** в `publishing.proto` и gRPC сервис!  
Это независимые скрипты для аналитики.

### VK Метрики ✅

**Файлы:**
- `utils-metrics/vk-metrics-collector.js`
- `utils-metrics/collect-vk-metrics.js`

**Запуск:**
```bash
cd utils-metrics
node collect-vk-metrics.js
```

**Собирает:**
- Просмотры, лайки, комментарии, репосты
- Статистика сообщества (охват, посетители)
- Engagement rate

**Требования:**
- `VK_USER_TOKEN` в `.env`

---

### Telegram Метрики ⏳

**Файлы:**
- `utils-metrics/telegram_auth_interactive.py`
- `utils-metrics/telegram_collect_metrics.py`

**Запуск (вручную в cmd):**
```cmd
cd utils-metrics
py telegram_auth_interactive.py    # Авторизация (1 раз)
py telegram_collect_metrics.py     # Сбор метрик
```

**Собирает:**
- Просмотры, форварды, реакции
- Количество подписчиков
- Engagement rate

**Требования:**
- Python 3.7+ с библиотекой `telethon`
- `TELEGRAM_API_ID`, `TELEGRAM_API_HASH` в `.env`
- **VPN** (MTProto заблокирован в РФ)
- Авторизация через телефон

---

## 🚀 Быстрый старт

### Основной сервис (gRPC):

```bash
# 1. Запустить Redis
docker run -d -p 6379:6379 redis:7-alpine

# 2. Запустить Publishing Service
npm run dev
```

### Сбор метрик VK:

```bash
# Перейти в папку утилит
cd utils-metrics

# Запустить сбор
node collect-vk-metrics.js
```

### Сбор метрик Telegram:

```cmd
# Открыть CMD (не PowerShell!)
cd utils-metrics

# Авторизоваться (один раз)
py telegram_auth_interactive.py

# Собрать метрики
py telegram_collect_metrics.py
```

---

## 📂 Файлы и их назначение

### Основной сервис

| Файл | Назначение |
|------|-----------|
| `src/index.ts` | Entry point, запуск gRPC сервера |
| `src/services/publishing.service.ts` | 9 RPC методов по proto |
| `src/bots/*.bot.ts` | Реализации 6 платформ |
| `src/queue/types.ts` | TypeScript типы = proto messages |
| `src/config.ts` | Конфигурация из .env |

### Утилиты метрик

| Файл | Назначение |
|------|-----------|
| `utils-metrics/collect-vk-metrics.js` | Запуск VK метрик |
| `utils-metrics/vk-metrics-collector.js` | VK API логика |
| `utils-metrics/telegram_auth_interactive.py` | Telegram авторизация |
| `utils-metrics/telegram_collect_metrics.py` | Telegram MTProto логика |
| `utils-metrics/README.md` | Документация утилит |

### Документация

| Файл | Содержание |
|------|-----------|
| `README.md` | Краткое описание, структура, gRPC API |
| `DEVOPS.md` | Полное руководство DevOps (установка, мониторинг) |
| `utils-metrics/README.md` | Инструкции по сбору метрик |

### Тестирование

| Файл | Назначение |
|------|-----------|
| `send-both.js` | Отправка тестового поста в VK + Telegram |

---

## ✅ Что очищено

### Удалены:
- ❌ `test-vk-token.js` - временный тест
- ❌ `telegram-auth.js`, `telegram-auth-proxy.js` - не работали
- ❌ `telegram-bot-metrics.js` - ограниченный Bot API
- ❌ `update-telegram-env.js`, `debug-env.js` - debug скрипты
- ❌ `zen/` папка - устаревшие Яндекс.Дзен файлы
- ❌ `VK_METRICS_GUIDE.md`, `TELEGRAM_METRICS_GUIDE.md` - дубликаты

### Оставлены (рабочие):
- ✅ `utils-metrics/` - все рабочие утилиты метрик
- ✅ `src/` - основной сервис (полностью по proto)
- ✅ `send-both.js` - тестовый скрипт
- ✅ Вся документация (README.md, DEVOPS.md)

---

## 📦 Зависимости

### Node.js (основной сервис):
- `@grpc/grpc-js` - gRPC сервер
- `bullmq` + `ioredis` - очереди
- `node-telegram-bot-api` - Telegram
- `vk-io` - VK
- `instagram-private-api` - Instagram
- `twitter-api-v2` - Twitter

### Python (Telegram метрики):
- `telethon` - Telegram MTProto API
- `python-dotenv` - чтение .env

---

## 🔄 Workflow

### Разработка
```bash
npm run dev              # Запуск с hot-reload
```

### Production
```bash
npm run build            # Компиляция TypeScript
npm start                # Запуск
```

### Метрики
```bash
cd utils-metrics
node collect-vk-metrics.js          # VK
py telegram_collect_metrics.py      # Telegram (требует авторизации)
```

---

## 📈 Следующие шаги

1. ✅ **Основной сервис** - готов, работает, соответствует proto
2. ✅ **VK метрики** - настроены, работают
3. ⏳ **Telegram метрики** - нужна авторизация в cmd:
   ```cmd
   cd utils-metrics
   py telegram_auth_interactive.py
   ```

---

**Версия:** 1.0.0  
**Последнее обновление:** 2025-12-12  
**Статус:** Production Ready ✅

