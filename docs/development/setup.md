# Development Setup

## Prerequisites

- Node.js 18+
- Python 3.11+
- Docker & Docker Compose
- PostgreSQL 15+
- Redis 7+

---

## Quick Start

### Clone Repository

```bash
git clone https://github.com/your-org/ai-newsmaker.git
cd ai-newsmaker
```

### Environment Variables

```bash
# Copy example env file
cp .env.example .env

# Edit with your values
nano .env
```

```bash
# .env
DATABASE_URL=postgresql://user:pass@localhost:5432/aidb
REDIS_URL=redis://localhost:6379
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...
JWT_SECRET=your-secret-key
```

### Docker Compose (Recommended)

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

```yaml
# docker-compose.yml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: aidb
      POSTGRES_USER: aiuser
      POSTGRES_PASSWORD: password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

  parser-service:
    build: ./services/parser
    ports:
      - "50051:50051"
    environment:
      - REDIS_URL=redis://redis:6379

  graphql-gateway:
    build: ./backend/graphql-gateway
    ports:
      - "4000:4000"
    environment:
      - DATABASE_URL=postgresql://aiuser:password@postgres:5432/aidb

  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_GRAPHQL_URL=http://localhost:4000/graphql

volumes:
  postgres_data:
```

---

## Manual Setup

### Backend Services

```bash
# Parser Service
cd services/parser
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python server.py

# AI Engine Service
cd services/ai-engine
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python server.py
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

---

## Database Migration

```bash
# Run migrations
npm run migrate:up

# Create new migration
npm run migrate:create add_posts_table
```

---

## Verification

```bash
# Check services
curl http://localhost:4000/graphql
curl http://localhost:3000

# Check gRPC
grpcurl -plaintext localhost:50051 list
```

---

**См. также:**
- [Development Guidelines](./guidelines.md)
- [Testing](./testing.md)

