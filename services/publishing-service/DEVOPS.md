# Publishing Service - DevOps Documentation

Полная документация для разворачивания, настройки и эксплуатации Publishing Service.

---

## 📋 Содержание

1. [Обзор сервиса](#обзор-сервиса)
2. [Архитектура](#архитектура)
3. [Требования](#требования)
4. [Установка](#установка)
5. [Конфигурация](#конфигурация)
6. [Запуск](#запуск)
7. [Мониторинг](#мониторинг)
8. [Troubleshooting](#troubleshooting)
9. [Production Checklist](#production-checklist)

---

## 🎯 Обзор сервиса

**Publishing Service** - микросервис для публикации контента на социальные платформы и сбора метрик.

### Возможности

- ✅ Публикация на 6 платформ: Telegram, VK, Instagram, Facebook, LinkedIn, Twitter
- ✅ Планирование отложенных публикаций
- ✅ Автоматический сбор метрик (просмотры, лайки, комментарии, engagement)
- ✅ Retry механизм с exponential backoff
- ✅ Rate limiting
- ✅ Очереди задач (BullMQ + Redis)

### Технологии

- **Node.js** 18+
- **TypeScript** 5+
- **gRPC** (порт 50053)
- **BullMQ + Redis** (очереди)
- **Protocol Buffers** (API contracts)

---

## 🏗️ Архитектура

```
┌─────────────────────────────────────────────────────────┐
│                   Publishing Service                     │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────────┐         ┌──────────────┐             │
│  │ gRPC Server  │────────▶│ Publishing   │             │
│  │ Port: 50053  │         │ Service      │             │
│  └──────────────┘         └──────┬───────┘             │
│                                   │                      │
│                          ┌────────▼────────┐            │
│                          │   Bot Factory   │            │
│                          └────────┬────────┘            │
│                                   │                      │
│         ┌─────────────────────────┼─────────────┐       │
│         │         │        │      │      │      │       │
│         ▼         ▼        ▼      ▼      ▼      ▼       │
│     Telegram    VK    Instagram Facebook LinkedIn Twitter│
│                                                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │               Queue System (BullMQ)               │  │
│  │  ┌──────────────────┐                          │  │
│  │  │ Publishing Queue │                          │  │
│  │  └──────────────────┘                          │  │
│  └──────────────────────────────────────────────────┘  │
│                            │                             │
│                            ▼                             │
│                   ┌────────────────┐                    │
│                   │     Redis      │                    │
│                   └────────────────┘                    │
└─────────────────────────────────────────────────────────┘
```

---

## 💻 Требования

### Системные требования

- **OS:** Linux (Ubuntu 20.04+) / macOS / Windows Server 2019+
- **CPU:** 2 cores минимум
- **RAM:** 2 GB минимум, 4 GB рекомендуется
- **Disk:** 10 GB свободного места

### Зависимости

| Компонент | Версия | Обязательно |
|-----------|--------|-------------|
| Node.js | 18+ | ✅ |
| npm | 9+ | ✅ |
| Redis | 6+ | ✅ |
| TypeScript | 5+ | ✅ |

### Порты

| Порт | Назначение | Доступ |
|------|------------|--------|
| 50053 | gRPC Server | Internal |
| 6379 | Redis | Internal |

---

## 📦 Установка

### 1. Клонирование репозитория

```bash
cd /opt
git clone <repository-url> mpit-district
cd mpit-district/services/publishing-service
```

### 2. Установка зависимостей

```bash
npm install
```

### 3. Установка Redis

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install redis-server
sudo systemctl enable redis-server
sudo systemctl start redis-server
```

**macOS:**
```bash
brew install redis
brew services start redis
```

**Проверка:**
```bash
redis-cli ping
# Ответ: PONG
```

### 4. Компиляция TypeScript

```bash
npm run build
```

---

## ⚙️ Конфигурация

### Переменные окружения

Создайте файл `.env`:

```bash
# =============================================================================
# PUBLISHING SERVICE CONFIGURATION
# =============================================================================

# -----------------------------------------------------------------------------
# Server Configuration
# -----------------------------------------------------------------------------
NODE_ENV=production
PORT=50053
LOG_LEVEL=info

# -----------------------------------------------------------------------------
# Redis Configuration
# -----------------------------------------------------------------------------
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0

# -----------------------------------------------------------------------------
# Queue Configuration
# -----------------------------------------------------------------------------
QUEUE_CONCURRENCY=5
QUEUE_MAX_ATTEMPTS=3
QUEUE_BACKOFF_DELAY=3000

# -----------------------------------------------------------------------------
# Telegram Configuration
# -----------------------------------------------------------------------------
TELEGRAM_BOT_TOKEN=your_bot_token_here
TELEGRAM_CHAT_ID=@your_channel

# MTProto API (опционально, для метрик)
TELEGRAM_API_ID=
TELEGRAM_API_HASH=
TELEGRAM_SESSION=

# -----------------------------------------------------------------------------
# VK Configuration
# -----------------------------------------------------------------------------
# Service Token (для публикации)
VK_ACCESS_TOKEN=vk1.a.your_service_token

# User Token (для метрик, опционально)
VK_USER_TOKEN=vk1.a.your_user_token

VK_GROUP_ID=-123456789

# -----------------------------------------------------------------------------
# Instagram Configuration (Meta Business API)
# -----------------------------------------------------------------------------
INSTAGRAM_ACCESS_TOKEN=
INSTAGRAM_BUSINESS_ACCOUNT_ID=

# -----------------------------------------------------------------------------
# Facebook Configuration (Meta Business API)
# -----------------------------------------------------------------------------
FACEBOOK_ACCESS_TOKEN=
FACEBOOK_PAGE_ID=

# -----------------------------------------------------------------------------
# LinkedIn Configuration
# -----------------------------------------------------------------------------
LINKEDIN_ACCESS_TOKEN=
LINKEDIN_ORGANIZATION_ID=

# -----------------------------------------------------------------------------
# Twitter Configuration
# -----------------------------------------------------------------------------
TWITTER_API_KEY=
TWITTER_API_SECRET=
TWITTER_ACCESS_TOKEN=
TWITTER_ACCESS_SECRET=

# -----------------------------------------------------------------------------
# Rate Limiting
# -----------------------------------------------------------------------------
RATE_LIMIT_TELEGRAM=30
RATE_LIMIT_VK=3
RATE_LIMIT_FACEBOOK=200
RATE_LIMIT_INSTAGRAM=200
RATE_LIMIT_LINKEDIN=100
RATE_LIMIT_TWITTER=300

# -----------------------------------------------------------------------------
# Tokens
# -----------------------------------------------------------------------------
```

### Получение токенов

#### Telegram Bot Token

1. Найдите [@BotFather](https://t.me/botfather) в Telegram
2. Отправьте `/newbot`
3. Следуйте инструкциям
4. Скопируйте токен

#### VK Tokens

**Service Token (для публикации):**
1. Зайдите в группу → Управление → Настройки
2. Работа с API → Создать ключ
3. Выберите права: "Управление сообществом"

#### Meta (Facebook/Instagram)

1. Перейдите на https://developers.facebook.com
2. Создайте приложение типа "Business"
3. Добавьте продукты: "Facebook Login", "Instagram Basic Display"
4. Получите токены через OAuth 2.0

---

## 🚀 Запуск

### Development

```bash
# С автоперезагрузкой
npm run dev
```

### Production

#### Вариант 1: Прямой запуск

```bash
npm start
```

#### Вариант 2: PM2 (рекомендуется)

**Установка PM2:**
```bash
npm install -g pm2
```

**Создание конфигурации `ecosystem.config.js`:**

```javascript
module.exports = {
  apps: [{
    name: 'publishing-service',
    script: './dist/index.js',
    instances: 2,
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 50053
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    max_memory_restart: '1G',
    autorestart: true,
    max_restarts: 10,
    min_uptime: '10s'
  }]
};
```

**Запуск:**
```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

**Управление:**
```bash
pm2 list              # Список процессов
pm2 logs              # Логи
pm2 monit             # Мониторинг
pm2 restart all       # Рестарт
pm2 stop all          # Остановка
pm2 delete all        # Удаление
```

#### Вариант 3: Systemd

**Создание unit файла `/etc/systemd/system/publishing-service.service`:**

```ini
[Unit]
Description=Publishing Service
After=network.target redis.service

[Service]
Type=simple
User=nodejs
WorkingDirectory=/opt/mpit-district/services/publishing-service
EnvironmentFile=/opt/mpit-district/services/publishing-service/.env
ExecStart=/usr/bin/node /opt/mpit-district/services/publishing-service/dist/index.js
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal
SyslogIdentifier=publishing-service

[Install]
WantedBy=multi-user.target
```

**Активация:**
```bash
sudo systemctl daemon-reload
sudo systemctl enable publishing-service
sudo systemctl start publishing-service
sudo systemctl status publishing-service
```

---

## 📊 Мониторинг

### Логи

**PM2:**
```bash
pm2 logs publishing-service --lines 100
```

**Systemd:**
```bash
journalctl -u publishing-service -f
```

**Файлы:**
```bash
tail -f logs/out.log
tail -f logs/err.log
```

### Метрики

**PM2 Monitoring:**
```bash
pm2 monit
```

**Redis Stats:**
```bash
redis-cli INFO stats
redis-cli INFO memory
```

**BullMQ Queue Stats:**
```bash
redis-cli KEYS "bull:*"
redis-cli LLEN "bull:publishing:waiting"
```

### Health Check

**gRPC Health Check:**
```bash
grpcurl -plaintext localhost:50053 publishing.PublishingService/HealthCheck
```

**Redis Health:**
```bash
redis-cli ping
```

---

## 🔍 Troubleshooting

### Сервис не запускается

**Проверка портов:**
```bash
lsof -i :50053
lsof -i :6379
```

**Проверка Redis:**
```bash
redis-cli ping
sudo systemctl status redis
```

**Проверка логов:**
```bash
pm2 logs publishing-service --err
journalctl -u publishing-service -n 50
```

### Проблемы с публикацией

**Telegram:**
- Проверьте токен бота
- Убедитесь, что бот добавлен в канал как администратор
- Проверьте наличие прав на публикацию

**VK:**
- Service Token: только для публикации
- User Token: для метрик (требует права `stats`)
- Проверьте owner_id (для групп отрицательный)

### Очереди переполнены

**Проверка:**
```bash
redis-cli LLEN "bull:publishing:waiting"
redis-cli LLEN "bull:publishing:active"
redis-cli LLEN "bull:publishing:failed"
```

**Очистка failed jobs:**
```bash
redis-cli DEL "bull:publishing:failed"
```

### Высокая нагрузка

**Проверка памяти:**
```bash
pm2 list
free -h
```

**Ограничение памяти PM2:**
```javascript
// ecosystem.config.js
max_memory_restart: '512M'
```

**Оптимизация Redis:**
```bash
# redis.conf
maxmemory 256mb
maxmemory-policy allkeys-lru
```

---

## ✅ Production Checklist

### Перед деплоем

- [ ] Node.js 18+ установлен
- [ ] Redis установлен и запущен
- [ ] Все переменные окружения настроены в `.env`
- [ ] Токены API получены и проверены
- [ ] TypeScript скомпилирован (`npm run build`)
- [ ] PM2 установлен (или systemd настроен)
- [ ] Логирование настроено
- [ ] Порты открыты (50053, 6379)

### Безопасность

- [ ] `.env` не коммитится в Git
- [ ] Redis защищен паролем (если публичный)
- [ ] Firewall настроен (только внутренние порты)
- [ ] SSL/TLS настроен для gRPC (если нужно)
- [ ] Rate limiting настроен
- [ ] Токены API зашифрованы в БД

### Мониторинг

- [ ] PM2 monitoring настроен
- [ ] Логи ротируются (logrotate)
- [ ] Alerting настроен (если есть)
- [ ] Health checks работают

### Резервное копирование

- [ ] Redis persistence включен
- [ ] Backup скрипты настроены
- [ ] Recovery процедура документирована

---

## 📈 Масштабирование

### Горизонтальное масштабирование

**PM2 Cluster Mode:**
```javascript
// ecosystem.config.js
instances: 'max', // или конкретное число
exec_mode: 'cluster'
```

**Multiple instances:**
```bash
# На разных серверах
PORT=50053 pm2 start ecosystem.config.js
PORT=50054 pm2 start ecosystem.config.js
```

### Вертикальное масштабирование

**Увеличение ресурсов:**
- CPU: 2 → 4+ cores
- RAM: 2GB → 8GB+
- Redis: отдельный сервер

**Оптимизация:**
```javascript
// config.ts
export const config = {
  queue: {
    concurrency: 10, // увеличить
    maxAttempts: 5
  }
};
```

---

## 🔄 Обновление

### Rolling Update

```bash
# 1. Скачать новую версию
git pull

# 2. Установить зависимости
npm install

# 3. Скомпилировать
npm run build

# 4. Плавный рестарт
pm2 reload publishing-service
```

### Zero-downtime Deploy

```bash
# PM2 graceful reload
pm2 reload publishing-service --update-env
```

---

## 🐛 Debugging

### Включение debug логов

```bash
# .env
LOG_LEVEL=debug
```

### gRPC Debug

```bash
# Включить gRPC логи
export GRPC_VERBOSITY=debug
export GRPC_TRACE=all
npm start
```

### Redis Debug

```bash
redis-cli MONITOR
```

---

## 📞 Поддержка

### Документация

- **Proto файлы:** `../../publishing.proto`
- **API документация:** `docs/integrations/social-platforms.md`
- **Архитектура:** `docs/architecture/overview.md`

### Useful Commands

```bash
# Проверка версий
node --version
npm --version
redis-cli --version

# Проверка процессов
ps aux | grep node
ps aux | grep redis

# Проверка сети
netstat -tulpn | grep 50053
ss -tulpn | grep redis

# Проверка дискового пространства
df -h
du -sh node_modules

# Очистка
npm cache clean --force
redis-cli FLUSHDB
pm2 flush
```

---

## 🎓 Best Practices

### Code

- Всегда используйте TypeScript strict mode
- Логируйте все ошибки через logger
- Используйте retry механизм для внешних API
- Валидируйте входные данные

### Operations

- Регулярно обновляйте зависимости
- Мониторьте использование ресурсов
- Делайте backup Redis данных
- Используйте health checks

### Security

- Храните токены в .env
- Используйте secrets manager в production
- Регулярно ротируйте токены
- Ограничивайте доступ к Redis

---

## 📋 Appendix

### Environment Variables Reference

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| NODE_ENV | Yes | development | Environment |
| PORT | Yes | 50053 | gRPC port |
| REDIS_HOST | Yes | localhost | Redis host |
| REDIS_PORT | Yes | 6379 | Redis port |
| TELEGRAM_BOT_TOKEN | For Telegram | - | Bot token |
| VK_ACCESS_TOKEN | For VK | - | Access token |
| LOG_LEVEL | No | info | Log level |

### Port Reference

| Port | Service | Protocol |
|------|---------|----------|
| 50053 | Publishing Service | gRPC |
| 6379 | Redis | TCP |

### Rate Limits

| Platform | Requests/min | Notes |
|----------|--------------|-------|
| Telegram | 30 | Per bot |
| VK | 3 | Per second |
| Facebook | 200 | Per hour |
| Instagram | 200 | Per hour |
| LinkedIn | 100 | Per day |
| Twitter | 300 | Per 15 min |

---

**Last Updated:** 2024-12-12  
**Version:** 1.0.0  
**Maintainer:** DevOps Team

