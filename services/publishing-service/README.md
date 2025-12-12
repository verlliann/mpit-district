# Publishing Service

Микросервис для публикации контента на социальные платформы через gRPC API.

## 🚀 Возможности

- ✅ **6 платформ**: Telegram, VK, Instagram, Facebook, LinkedIn, Twitter
- 📝 **Публикация**: текст, фото, видео с автоматической валидацией лимитов
- 📅 **Планирование**: отложенная публикация с точностью до секунды
- ✏️ **Редактирование**: обновление опубликованных постов (если платформа поддерживает)
- 🗑️ **Удаление**: удаление постов с автоматическим retry
- 🔄 **Надёжность**: retry механизм с exponential backoff, rate limiting
- ⚡ **Очереди**: BullMQ + Redis для асинхронной обработки
- 📊 **Мониторинг**: структурированное логирование, health checks
- 🔐 **Безопасность**: валидация токенов, защита от rate limits

## 🏗️ Архитектура

```
gRPC API (port 50053)
    ↓
Publishing Service
    ↓
Bot Factory → 6 Platform Bots
    ↓
BullMQ Queue System
    ↓
Redis
```

## 📡 gRPC API

Сервис реализует следующие методы согласно `publishing.proto`:

| Метод | Описание |
|-------|----------|
| `HealthCheck` | Проверка здоровья сервиса |
| `PublishPost` | Публикация одного поста |
| `PublishBatch` | Пакетная публикация (streaming) |
| `SchedulePost` | Планирование поста на будущее |
| `CancelScheduledPost` | Отмена запланированного поста |
| `UpdatePublishedPost` | Обновление опубликованного поста |
| `DeletePublishedPost` | Удаление опубликованного поста |
| `TestConnection` | Проверка подключения к платформе |
| `GetPlatformLimits` | Получение лимитов платформы |

## 🚀 Быстрый старт

```bash
# 1. Установить зависимости
cd services/publishing-service
npm install

# 2. Запустить Redis
docker run -d -p 6379:6379 redis:7-alpine

# 3. Настроить .env
cp .env.example .env
# Отредактируйте .env с вашими токенами

# 4. Запустить сервис
npm run dev
```

## 📚 Документация

- **[DEVOPS.md](DEVOPS.md)** - полная документация для DevOps (установка, настройка, мониторинг)
- **[publishing.proto](../../publishing.proto)** - gRPC API контракт
- **[send-both.js](send-both.js)** - пример отправки тестового поста в Telegram и VK

## 🛠️ Технологии

- **Node.js** 18+
- **TypeScript** 5+
- **gRPC** (@grpc/grpc-js)
- **BullMQ** + Redis (очереди)
- **Protocol Buffers** (API контракты)
- **Pino** (структурированное логирование)

## 📂 Структура проекта

```
services/publishing-service/
├── src/                      # Исходный код gRPC сервиса
│   ├── bots/                 # Реализации платформ (6 ботов)
│   ├── queue/                # BullMQ очереди
│   ├── services/             # gRPC сервис
│   └── utils/                # Вспомогательные утилиты
├── utils-metrics/            # Утилиты сбора метрик (отдельно)
│   ├── collect-vk-metrics.js
│   ├── vk-metrics-collector.js
│   ├── telegram_auth_interactive.py
│   ├── telegram_collect_metrics.py
│   └── README.md
├── metrics/                  # Собранные метрики (генерируется)
├── send-both.js              # Тестовый скрипт отправки
├── DEVOPS.md                 # DevOps документация
└── README.md                 # Этот файл
```

## 🔧 Разработка

```bash
# Development с hot-reload
npm run dev

# Компиляция TypeScript
npm run build

# Production запуск
npm start
```

## 📊 Сбор метрик

Метрики **НЕ входят** в основной gRPC сервис (согласно `publishing.proto`).  
Это отдельные утилиты в папке `utils-metrics/`.

**Запуск:**
```bash
# VK метрики
cd utils-metrics
node collect-vk-metrics.js

# Telegram метрики (требует авторизации)
py telegram_auth_interactive.py  # один раз
py telegram_collect_metrics.py   # сбор метрик
```

**Документация:**
- [VK_METRICS_GUIDE.md](VK_METRICS_GUIDE.md)
- [TELEGRAM_METRICS_GUIDE.md](TELEGRAM_METRICS_GUIDE.md)

## 📞 Поддержка

Для вопросов и проблем см. [DEVOPS.md](DEVOPS.md) раздел "Troubleshooting".

---

**Версия:** 1.0.0  
**Node.js:** 18+  
**Порт:** 50053 (gRPC)
