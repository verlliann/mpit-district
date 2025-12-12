# AI-Newsmaker Backend

Backend микросервисная архитектура для платформы AI-Newsmaker.

## 🏗️ Архитектура

```
┌─────────────────┐
│  GraphQL API    │ ← Frontend подключается сюда
│   (Port 4000)   │
└────────┬────────┘
         │
         ├──────────────────────────────────────┐
         │         gRPC Communication            │
         ├──────┬────────┬────────┬────────┬────┴──┐
         │      │        │        │        │       │
    ┌────▼──┐ ┌─▼───┐ ┌─▼───┐ ┌──▼──┐ ┌───▼───┐  │
    │Parser │ │ AI  │ │Media│ │Pub- │ │Storage│  │
    │Service│ │Engi-│ │Serv-│ │lish-│ │Service│  │
    │:50051 │ │ne   │ │ice  │ │ing  │ │:50055 │  │
    │       │ │:5005│ │:5005│ │:5005│ │       │  │
    └───┬───┘ └──┬──┘ └──┬──┘ └──┬──┘ └───┬───┘  │
        │        │       │       │        │       │
        └────────┴───────┴───────┴────────┴───────┘
                         │
         ┌───────────────┴───────────────┐
         │       Infrastructure          │
         ├──────────┬──────────┬─────────┤
         │PostgreSQL│  Redis   │ MinIO   │
         │  :5432   │  :6379   │ :9000   │
         └──────────┴──────────┴─────────┘
```

## 📦 Микросервисы

### Storage Service (Go)
- **Port:** 50055
- **Роль:** Единый слой доступа к данным
- **Технологии:** Go, PostgreSQL, Redis

### Parser Service (Python)
- **Port:** 50051
- **Роль:** Парсинг новостных сайтов
- **Технологии:** Python, Scrapy, Playwright, Newspaper3k

### AI Engine Service (Python)
- **Port:** 50052
- **Роль:** Анализ контента, генерация постов
- **Технологии:** Python, LangChain, Claude, GPT-4, YandexGPT

### Media Service (Python)
- **Port:** 50053
- **Роль:** Обработка изображений, AI-генерация
- **Технологии:** Python, Pillow, MinIO

### Publishing Service (Node.js)
- **Port:** 50054
- **Роль:** Публикация на соцсети, сбор метрик
- **Технологии:** Node.js, NestJS, BullMQ

### GraphQL Gateway (Node.js)
- **Port:** 4000
- **Роль:** Единая точка входа для фронтенда
- **Технологии:** Node.js, Apollo Server, GraphQL

## 🚀 Быстрый старт

### Предварительные требования

- Docker & Docker Compose
- Go 1.21+
- Python 3.11+
- Node.js 20+
- Make (optional, но рекомендуется)

### Установка

1. **Клонировать репозиторий**
```bash
cd backend
```

2. **Создать .env файл**
```bash
cp .env.example .env
# Отредактируйте .env и добавьте свои API ключи
```

3. **Запустить инфраструктуру**
```bash
make dev
# или
docker-compose -f docker-compose.dev.yml up -d
```

4. **Применить миграции**
```bash
make db-migrate
```

5. **Сгенерировать Proto код**
```bash
make proto
```

### Разработка отдельного сервиса

#### Storage Service (Go)
```bash
cd services/storage
go run cmd/server/main.go
```

#### Parser Service (Python)
```bash
cd services/parser
pip install -r requirements.txt
python -m src.main
```

#### GraphQL Gateway (Node.js)
```bash
cd services/graphql-gateway
npm install
npm run dev
```

## 📝 Полезные команды

```bash
# Запустить инфраструктуру (PostgreSQL, Redis, MinIO)
make dev

# Остановить все
make down

# Посмотреть логи
make logs

# Посмотреть логи конкретного сервиса
make logs-service SERVICE=postgres

# Запустить все тесты
make test

# Сгенерировать Proto код
make proto

# Форматировать код
make format

# Запустить линтеры
make lint

# Сбросить базу данных (ОСТОРОЖНО!)
make db-reset

# Открыть PostgreSQL shell
make db-shell

# Посмотреть все команды
make help
```

## 🗄️ База данных

### Подключение к PostgreSQL

```bash
# Через Docker
make db-shell

# Напрямую
psql -h localhost -p 5432 -U newsmaker -d newsmaker
```

### Веб-интерфейсы

- **PGAdmin:** http://localhost:5050
  - Email: `admin@newsmaker.dev`
  - Password: `admin`

- **Redis Commander:** http://localhost:8081

- **MinIO Console:** http://localhost:9001
  - Username: `minioadmin`
  - Password: `minioadmin123`

- **RabbitMQ Management:** http://localhost:15672
  - Username: `newsmaker`
  - Password: `newsmaker_rabbit_pass`

## 🧪 Тестирование

### Unit тесты
```bash
# Все сервисы
make test

# Конкретный сервис
cd services/storage && go test ./...
cd services/parser && pytest
cd services/graphql-gateway && npm test
```

### Integration тесты
```bash
make test-integration
```

### E2E тесты
```bash
make test-e2e
```

### Тестирование gRPC вручную

Используйте `grpcurl`:

```bash
# Установка grpcurl
go install github.com/fullstorydev/grpcurl/cmd/grpcurl@latest

# Список сервисов
grpcurl -plaintext localhost:50055 list

# Список методов
grpcurl -plaintext localhost:50055 list storage.StorageService

# Вызов метода
grpcurl -plaintext -d '{"id":"123"}' \
  localhost:50055 storage.StorageService/GetArticle
```

## 📊 Мониторинг

### Prometheus
```bash
make prometheus
# http://localhost:9090
```

### Grafana
```bash
make grafana
# http://localhost:3001
```

### Jaeger (Tracing)
```bash
make jaeger
# http://localhost:16686
```

## 🔧 Разработка

### Структура проекта

```
backend/
├── services/              # Микросервисы
│   ├── storage/          # Storage Service (Go)
│   ├── parser/           # Parser Service (Python)
│   ├── ai-engine/        # AI Engine Service (Python)
│   ├── media/            # Media Service (Python)
│   ├── publishing/       # Publishing Service (Node.js)
│   └── graphql-gateway/  # GraphQL Gateway (Node.js)
├── proto/                # Protocol Buffers definitions
├── database/             # Database migrations & seeds
│   ├── init/            # Init scripts
│   └── migrations/      # Migration files
├── tests/               # Integration & E2E tests
│   ├── integration/
│   └── e2e/
├── config/              # Configuration files
├── scripts/             # Utility scripts
├── docker-compose.yml        # Full stack
├── docker-compose.dev.yml    # Dev infrastructure only
├── Makefile             # Commands
└── README.md            # This file
```

### Добавление нового gRPC метода

1. Обновите `.proto` файл в `proto/`
2. Запустите `make proto` для генерации кода
3. Реализуйте метод в соответствующем сервисе
4. Обновите GraphQL Gateway если нужен доступ с фронтенда

### Code Style

- **Go:** `gofmt`, `golangci-lint`
- **Python:** `black`, `isort`, `flake8`, `mypy`
- **TypeScript:** `prettier`, `eslint`

Запустите `make format` для автоформатирования всего кода.

## 🐛 Отладка

### Логи сервиса

```bash
# Все сервисы
docker-compose logs -f

# Конкретный сервис
docker-compose logs -f storage-service
```

### Подключение к контейнеру

```bash
make shell-storage
make shell-parser
make shell-gateway
```

### Проблемы с подключением к БД

```bash
# Проверить статус
docker-compose ps

# Рестарт PostgreSQL
docker-compose restart postgres

# Посмотреть логи
docker-compose logs postgres
```

## 📚 Документация

- [Backend Roadmap](../docs/development/backend-roadmap.md)
- [API Documentation](../docs/api/)
- [Architecture](../docs/architecture/)
- [Services](../docs/services/)
- [Database Schema](../docs/database/schema.md)
- [Social Platforms Integration](../docs/integrations/social-platforms.md)

## 🔐 Безопасность

### Секреты и переменные окружения

- Никогда не коммитьте `.env` файлы
- Используйте `.env.example` как шаблон
- В production используйте Kubernetes Secrets или HashiCorp Vault

### API ключи

Все API ключи для LLM и соцсетей должны быть в `.env`:
- `OPENAI_API_KEY`
- `ANTHROPIC_API_KEY`
- `YANDEX_API_KEY`
- `TELEGRAM_BOT_TOKEN`
- `VK_ACCESS_TOKEN`
- и т.д.

## 🚢 Деплой

### Docker

```bash
# Собрать все образы
make build

# Запустить полный стек
docker-compose up -d
```

### Kubernetes

```bash
# Применить конфигурацию
kubectl apply -f k8s/

# Или с Helm
helm install ai-newsmaker ./helm/ai-newsmaker
```

См. [Deployment Guide](../docs/development/deployment.md) для деталей.

## 📞 Поддержка

- **Issues:** [GitHub Issues](https://github.com/your-org/ai-newsmaker/issues)
- **Документация:** [docs/](../docs/)
- **Roadmap:** [Backend Roadmap](../docs/development/backend-roadmap.md)

## 📄 Лицензия

[MIT License](../LICENSE)

---

**Следуйте [Backend Roadmap](../docs/development/backend-roadmap.md) для пошаговой разработки! 🚀**

