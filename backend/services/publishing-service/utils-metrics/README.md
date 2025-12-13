# 📊 Утилиты сбора метрик

Независимые утилиты для сбора метрик из социальных сетей.

**Важно:** Метрики НЕ входят в основной gRPC сервис (`publishing.proto`).  
Это отдельные скрипты для аналитики и мониторинга.

---

## 📦 Структура

```
utils-metrics/
├── vk-metrics-collector.js          # Класс для сбора VK метрик
├── collect-vk-metrics.js            # Скрипт запуска сбора VK
├── telegram_auth_interactive.py     # Авторизация в Telegram
├── telegram_collect_metrics.py      # Скрипт сбора Telegram метрик
├── telegram_session.session         # Session файл (генерируется)
└── README.md                         # Эта документация
```

---

## 🚀 Использование

### VK Метрики

```bash
cd utils-metrics
node collect-vk-metrics.js
```

**Требования:**
- VK_USER_TOKEN в `.env` (корень проекта)
- VK_GROUP_ID в `.env`

**Результат:**
- `../metrics/vk_metrics_*.json` - JSON данные
- `../metrics/vk_report_*.txt` - текстовый отчёт

---

### Telegram Метрики

**Шаг 1: Авторизация (один раз)**

Откройте обычную командную строку Windows (cmd):

```cmd
cd utils-metrics
py telegram_auth_interactive.py
```

Введите номер телефона, код из Telegram, пароль 2FA (если есть).

**Шаг 2: Сбор метрик**

```cmd
py telegram_collect_metrics.py
```

**Требования:**
- Python 3.7+
- Библиотеки: `telethon`, `python-dotenv`
- TELEGRAM_API_ID и TELEGRAM_API_HASH в `.env`
- Авторизация через `telegram_auth_interactive.py`

**Результат:**
- `../metrics/telegram_metrics_*.json` - JSON данные
- `../metrics/telegram_report_*.txt` - текстовый отчёт

---

## 📊 Доступные метрики

### VK
- ✅ Просмотры постов
- ✅ Лайки, комментарии, репосты
- ✅ Статистика сообщества (охват, посетители)
- ✅ Engagement rate

### Telegram
- ✅ Просмотры постов
- ✅ Форварды
- ✅ Реакции
- ✅ Количество подписчиков
- ✅ Engagement rate

---

## 🔧 Настройка

### Переменные окружения

Добавьте в `.env` (корень проекта):

```env
# VK
VK_USER_TOKEN=vk1.a.your_user_token_here
VK_GROUP_ID=-234580749

# Telegram
TELEGRAM_API_ID=35139259
TELEGRAM_API_HASH=b25479cd7760a9fe42fec4e290ef6cc5
```

---

## 📚 Полная документация

- **[VK_METRICS_GUIDE.md](../VK_METRICS_GUIDE.md)** - подробное руководство по VK
- **[TELEGRAM_METRICS_GUIDE.md](../TELEGRAM_METRICS_GUIDE.md)** - подробное руководство по Telegram

---

## ⚠️ Важно

1. **Метрики отделены от основного сервиса** - это независимые утилиты
2. **Требуют VPN** - Telegram MTProto может быть заблокирован в России
3. **Авторизация Telegram** - нужна один раз, session сохраняется
4. **VK User Token** - нужен для статистики (Service Token не подходит)

---

## 🤖 Автоматизация

### Ежедневный сбор (Linux/macOS)

```bash
# Добавьте в crontab
0 2 * * * cd /path/to/utils-metrics && node collect-vk-metrics.js
0 3 * * * cd /path/to/utils-metrics && py telegram_collect_metrics.py
```

### Ежедневный сбор (Windows Task Scheduler)

Создайте две задачи:
1. VK: запускать `node collect-vk-metrics.js` каждый день в 02:00
2. Telegram: запускать `py telegram_collect_metrics.py` каждый день в 03:00

---

**Версия:** 1.0.0  
**Последнее обновление:** 2025-12-12

