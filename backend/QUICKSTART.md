# 🚀 Backend Quick Start Guide

Пошаговая инструкция для запуска backend AI-Newsmaker.

## 📋 Что создано

### ✅ Инфраструктура
- **Docker Compose** - для локальной разработки
- **PostgreSQL** - база данных со схемой
- **Redis** - кэш и очереди
- **MinIO** - S3-совместимое хранилище
- **RabbitMQ** - брокер сообщений

### ✅ Микросервисы
1. **Storage Service** (Go) - единый слой доступа к данным
2. **GraphQL Gateway** (Node.js) - API для фронтенда

### ⏭️ В разработке другими командами
- Parser Service (Python)
- Publishing Service (Node.js)

### ⏸️ Еще не реализовано
- AI Engine Service (Python)
- Media Service (Python)

### ✅ Proto файлы
- `common.proto` - общие типы
- `storage.proto` - Storage Service API
- `parser.proto` - Parser Service API
- `ai_engine.proto` - AI Engine Service API
- `media.proto` - Media Service API
- `publishing.proto` - Publishing Service API

## 🎯 Быстрый старт (MVP)

### Шаг 1: Установка зависимостей

```bash
cd backend

# Установить buf (для proto)
go install github.com/bufbuild/buf/cmd/buf@latest

# Установить grpcurl (для тестирования)
go install github.com/fullstorydev/grpcurl/cmd/grpcurl@latest
```

### Шаг 2: Запустить инфраструктуру

```bash
# Запустить PostgreSQL, Redis, MinIO, RabbitMQ
make dev

# Или без make:
docker-compose -f docker-compose.dev.yml up -d
```

Проверьте доступность:
- PostgreSQL: http://localhost:5050 (PGAdmin)
- Redis: http://localhost:8081 (Redis Commander)
- MinIO: http://localhost:9001 (Console)
- RabbitMQ: http://localhost:15672 (Management)

### Шаг 3: Storage Service

```bash
cd services/storage

# Установить зависимости
go mod download

# Запустить сервис
go run cmd/server/main.go
```

Сервис запустится на `localhost:50055`

**Тест:**
```bash
grpcurl -plaintext localhost:50055 grpc.health.v1.Health/Check
```

### Шаг 4: GraphQL Gateway

```bash
cd services/graphql-gateway

# Установить зависимости
npm install

# Запустить в dev режиме
npm run dev
```

Gateway запустится на `http://localhost:4000`

**Тест:**
```bash
curl http://localhost:4000/health
```

### Шаг 5: Проверить GraphQL API

Откройте в браузере: http://localhost:4000/graphql

Попробуйте запрос:

```graphql
query {
  me {
    id
    email
    name
    role
  }
}
```

## 🧪 Тестирование

### Storage Service (gRPC)

```bash
# Health check
grpcurl -plaintext localhost:50055 grpc.health.v1.Health/Check

# Список сервисов
grpcurl -plaintext localhost:50055 list

# Список методов Storage Service
grpcurl -plaintext localhost:50055 list storage.StorageService
```

### GraphQL Gateway

```bash
# Health check
curl http://localhost:4000/health

# GraphQL query
curl -X POST http://localhost:4000/graphql \
  -H "Content-Type: application/json" \
  -d '{"query":"{ me { id name } }"}'
```

## 🐳 Docker (полный стек)

Запустить все сервисы в Docker:

```bash
# Сборка
make build

# Запуск
docker-compose up -d

# Проверка логов
docker-compose logs -f

# Остановка
docker-compose down
```

## 📊 Веб-интерфейсы

После запуска `make dev` доступны:

| Сервис | URL | Логин | Пароль |
|--------|-----|-------|--------|
| **PGAdmin** | http://localhost:5050 | admin@newsmaker.dev | admin |
| **Redis Commander** | http://localhost:8081 | - | - |
| **MinIO Console** | http://localhost:9001 | minioadmin | minioadmin123 |
| **RabbitMQ** | http://localhost:15672 | newsmaker | newsmaker_rabbit_pass |
| **GraphQL Playground** | http://localhost:4000/graphql | - | - |

## 🔧 Разработка

### Proto файлы

Если изменили `.proto` файлы:

```bash
cd proto
./generate.sh
```

### Storage Service

```bash
cd services/storage

# Запуск
go run cmd/server/main.go

# Тесты
go test ./...

# Форматирование
gofmt -w .
```

### GraphQL Gateway

```bash
cd services/graphql-gateway

# Разработка (hot reload)
npm run dev

# Сборка
npm run build

# Prod запуск
npm start

# Тесты
npm test
```

## 🔗 Подключение фронтенда

Фронтенд уже настроен для подключения! Файлы:
- `frontend/services/apollo.ts` - Apollo Client
- `frontend/services/graphql/queries.ts` - Queries
- `frontend/services/graphql/mutations.ts` - Mutations
- `frontend/services/graphql/subscriptions.ts` - Subscriptions

### Запуск фронтенда

```bash
cd frontend
npm install
npm run dev
```

Откройте http://localhost:5173

**Важно:** Убедитесь что GraphQL Gateway запущен на `localhost:4000`

## 🎯 Следующие шаги

### Для завершения MVP:

1. ✅ **Инфраструктура** - готова
2. ✅ **Storage Service** - готов
3. ✅ **GraphQL Gateway** - готов
4. ⏳ **Parser Service** - в разработке другой командой
5. ⏳ **Publishing Service** - в разработке другой командой
6. ⏸️ **AI Engine Service** - требуется реализация
7. ⏸️ **Media Service** - требуется реализация

### Что работает сейчас:

- ✅ GraphQL API доступен
- ✅ Базовые queries (articles, posts, me)
- ✅ Подключение к Storage Service
- ✅ WebSocket subscriptions
- ✅ Фронтенд может подключиться

### Что не работает (ждет реализации):

- ❌ Парсинг статей (Parser Service)
- ❌ AI анализ и генерация (AI Engine Service)
- ❌ Публикация в соцсети (Publishing Service)
- ❌ Обработка изображений (Media Service)

## 🐛 Troubleshooting

### PostgreSQL не запускается

```bash
# Проверить порт
lsof -i :5432

# Рестарт
docker-compose -f docker-compose.dev.yml restart postgres
```

### Storage Service не подключается к БД

```bash
# Проверить connection string
echo $DATABASE_URL

# Должен быть:
# postgresql://newsmaker:newsmaker_dev_password@localhost:5432/newsmaker
```

### GraphQL Gateway не видит Storage Service

```bash
# Проверить что Storage запущен
grpcurl -plaintext localhost:50055 grpc.health.v1.Health/Check

# Проверить переменные окружения
echo $STORAGE_GRPC_URL  # должен быть localhost:50055
```

### Порты заняты

Измените порты в `docker-compose.dev.yml` или освободите:

```bash
# Узнать что занимает порт
lsof -i :5432
lsof -i :4000
lsof -i :50055
```

## 📚 Документация

- [Backend README](README.md) - полная документация
- [Backend Roadmap](../docs/development/backend-roadmap.md) - план разработки
- [Storage Service](services/storage/README.md)
- [GraphQL Gateway](services/graphql-gateway/README.md)
- [Database Schema](database/init/01_schema.sql)
- [Proto Files](proto/)

## 💡 Полезные команды

```bash
# Посмотреть все команды
make help

# Логи всех сервисов
make logs

# Логи конкретного сервиса
make logs-service SERVICE=postgres

# Остановить всё
make down

# Очистить всё (включая volumes)
make clean

# Открыть PostgreSQL shell
make db-shell

# Статус контейнеров
make ps
```

## 🎉 Готово!

Теперь у вас работает:

1. ✅ PostgreSQL с полной схемой
2. ✅ Redis для кэша
3. ✅ Storage Service (gRPC)
4. ✅ GraphQL Gateway (HTTP/WS)
5. ✅ Готовый frontend для подключения

**Можно начинать разработку фронтенда и интеграцию!** 🚀

---

Для вопросов и поддержки см. [Backend README](README.md)

