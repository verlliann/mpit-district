# ИИ-Ньюсмейкер - Документация проекта

## Обзор проекта

**ИИ-Ньюсмейкер** — веб-платформа для автоматизированной мультиплатформенной адаптации и дистрибуции новостного контента с использованием искусственного интеллекта.

### Основные возможности

- 🤖 **AI-анализ** новостных статей с извлечением фактов и тональности
- ✍️ **Автоматическая генерация** контента для различных платформ
- 📅 **Медиапланирование** с визуальным календарем
- 🚀 **Автопостинг** в социальные сети
- 📊 **Аналитика** и отчетность
- 👥 **Командная работа** с workflow согласования

### Ключевые метрики

- ⚡️ Экономия времени: **90%** (с 2-3 часов до 10 минут)
- 📈 Увеличение охвата: **+300%**
- 🎯 Продление жизни новости: с 3 часов до **5-7 дней**
- 🔒 Uptime: **≥99.9%**

---

## Структура документации

### 📐 [Архитектура](./architecture/)
- [Общая архитектура системы](./architecture/overview.md)
- [Микросервисная архитектура](./architecture/microservices.md)
- [Диаграммы взаимодействия](./architecture/diagrams.md)
- [Технологический стек](./architecture/tech-stack.md)

### 🔌 [API](./api/)
- **GraphQL**
  - [Схема и типы](./api/graphql/schema.md)
  - [Queries и Mutations](./api/graphql/operations.md)
  - [Subscriptions](./api/graphql/subscriptions.md)
- **gRPC**
  - [Protocol Buffers](./api/grpc/protobuf.md)
  - [Сервисы и методы](./api/grpc/services.md)

### 🎛️ [Микросервисы](./services/)
- [Parser Service](./services/parser-service.md) - Парсинг и извлечение контента
- [AI Engine Service](./services/ai-engine-service.md) - Обработка текста с помощью LLM
- [Media Service](./services/media-service.md) - Обработка и генерация медиа
- [Publishing Service](./services/publishing-service.md) - Публикация на платформы
- [Storage Service](./services/storage-service.md) - Управление данными

### 💻 [Frontend](./frontend/)
- [Структура приложения](./frontend/structure.md)
- [Компоненты и UI](./frontend/components.md)
- [State Management](./frontend/state-management.md)
- [Роутинг и страницы](./frontend/routing.md)

### 🗄️ [База данных](./database/)
- [Схема БД (PostgreSQL)](./database/schema.md)
- [Индексы и оптимизация](./database/optimization.md)
- [Миграции](./database/migrations.md)

### 🏗️ [Инфраструктура](./infrastructure/)
- [Kubernetes конфигурация](./infrastructure/kubernetes.md)
- [CI/CD Pipeline](./infrastructure/cicd.md)
- [Мониторинг и логирование](./infrastructure/monitoring.md)
- [Backup и восстановление](./infrastructure/backup.md)

### 🔐 [Безопасность](./security/)
- [Аутентификация и авторизация](./security/auth.md)
- [Защита данных](./security/data-protection.md)
- [API Security](./security/api-security.md)

### 🛠️ [Разработка](./development/)
- [Настройка окружения](./development/setup.md)
- [Руководство по разработке](./development/guidelines.md)
- [Тестирование](./development/testing.md)
- [Деплой](./development/deployment.md)

---

## Быстрый старт

### Требования

- Node.js 18+
- Python 3.11+
- Docker & Docker Compose
- Kubernetes (для production)
- PostgreSQL 15+
- Redis 7+

### Локальная разработка

```bash
# Клонирование репозитория
git clone <repository-url>
cd ai-newsmaker

# Запуск через Docker Compose
docker-compose up -d

# Frontend
cd frontend
npm install
npm run dev

# Backend сервисы
cd services/<service-name>
# Следуйте инструкциям в README каждого сервиса
```

---

## Roadmap

### ✅ Этап 1: MVP (6-8 недель)
- Базовый веб-интерфейс
- Парсинг статей
- Генерация постов для 3 платформ
- Ручное копирование постов

### 🚧 Этап 2: Базовая версия (8-10 недель)
- Автопостинг на 4+ платформ
- Календарь с drag & drop
- Real-time updates
- Базовая аналитика

### 📋 Этап 3: Расширенная версия (10-12 недель)
- AI-генерация визуального контента
- Мониторинг упоминаний
- Командная работа
- Продвинутая аналитика

### 🎯 Этап 4: Оптимизация (4-6 недель)
- Performance optimization
- ML и персонализация
- Дополнительные платформы

---

## Контакты и поддержка

- **Документация**: `/docs`
- **Issues**: GitHub Issues
- **Команда**: [team@ai-newsmaker.com](mailto:team@ai-newsmaker.com)

---

**Версия**: 2.0  
**Обновлено**: Декабрь 2025  
**Лицензия**: MIT

