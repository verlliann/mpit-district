# Storage Service

Go-based gRPC microservice for data persistence and caching.

## 🎯 Responsibilities

- Single source of truth for all data
- CRUD operations for articles, posts, metrics, templates
- PostgreSQL connection pooling
- Redis caching layer
- Data validation and integrity

## 🏗️ Architecture

```
┌─────────────────┐
│  gRPC Gateway   │
└────────┬────────┘
         │
    ┌────▼────┐
    │ Storage │
    │ Service │
    └────┬────┘
         │
    ┌────┴────────┐
    │             │
┌───▼───┐   ┌────▼────┐
│Postgre│   │  Redis  │
│  SQL  │   │ (Cache) │
└───────┘   └─────────┘
```

## 🚀 Quick Start

### Prerequisites

- Go 1.21+
- PostgreSQL 15+
- Redis 7+

### Development

```bash
# Install dependencies
go mod download

# Generate proto code
cd ../../proto && ./generate.sh

# Run service
go run cmd/server/main.go
```

### Docker

```bash
# Build
docker build -t storage-service .

# Run
docker run -p 50055:50055 \
  -e DATABASE_URL=postgresql://... \
  -e REDIS_URL=redis://... \
  storage-service
```

## 📂 Project Structure

```
storage/
├── cmd/
│   └── server/
│       └── main.go           # Entry point
├── internal/
│   ├── config/
│   │   └── config.go         # Configuration
│   ├── db/
│   │   ├── postgres.go       # PostgreSQL client
│   │   └── redis.go          # Redis client
│   ├── repository/
│   │   ├── article.go        # Article CRUD
│   │   ├── post.go           # Post CRUD
│   │   ├── metrics.go        # Metrics CRUD
│   │   └── template.go       # Template CRUD
│   ├── server/
│   │   └── server.go         # gRPC handlers
│   └── pb/                   # Generated proto code
├── Dockerfile
├── go.mod
├── go.sum
└── README.md
```

## 🔧 Configuration

Environment variables:

```bash
# gRPC
GRPC_PORT=50055

# PostgreSQL
DATABASE_URL=postgresql://user:pass@localhost:5432/newsmaker

# Redis
REDIS_URL=redis://:password@localhost:6379/0

# Cache
CACHE_TTL=3600  # seconds

# Logging
LOG_LEVEL=info
ENVIRONMENT=development
```

## 📡 gRPC API

### Articles

```protobuf
rpc SaveArticle(SaveArticleRequest) returns (Article);
rpc GetArticle(GetArticleRequest) returns (Article);
rpc ListArticles(ListArticlesRequest) returns (ListArticlesResponse);
rpc UpdateArticle(UpdateArticleRequest) returns (Article);
rpc DeleteArticle(DeleteArticleRequest) returns (StatusResponse);
```

### Posts

```protobuf
rpc SavePost(SavePostRequest) returns (Post);
rpc GetPost(GetPostRequest) returns (Post);
rpc ListPosts(ListPostsRequest) returns (ListPostsResponse);
rpc UpdatePost(UpdatePostRequest) returns (Post);
rpc DeletePost(DeletePostRequest) returns (StatusResponse);
```

### Testing

```bash
# Test gRPC methods
grpcurl -plaintext -d '{"id":"123"}' \
  localhost:50055 storage.StorageService/GetArticle

# Health check
grpcurl -plaintext \
  localhost:50055 grpc.health.v1.Health/Check
```

## 🧪 Testing

```bash
# Run unit tests
go test ./...

# Run with coverage
go test -cover ./...

# Run integration tests
go test -tags=integration ./...
```

## 📊 Performance

### Database Connection Pool

- Max connections: 25
- Min connections: 5
- Max connection lifetime: 1 hour
- Health check period: 1 minute

### Redis Cache

- Default TTL: 1 hour (articles)
- Default TTL: 30 minutes (posts)
- Pool size: 10
- Min idle connections: 5

## 🔍 Monitoring

### Metrics

- gRPC request latency
- Database query performance
- Cache hit/miss ratio
- Connection pool stats

### Health Check

```bash
grpcurl -plaintext localhost:50055 grpc.health.v1.Health/Check
```

## 🐛 Troubleshooting

### Connection Issues

```bash
# Check if service is running
nc -zv localhost 50055

# Check PostgreSQL connection
psql $DATABASE_URL -c "SELECT 1"

# Check Redis connection
redis-cli -u $REDIS_URL PING
```

### Debug Logging

```bash
LOG_LEVEL=debug go run cmd/server/main.go
```

## 📝 Development Guidelines

1. **Repository Pattern**: All database access goes through repositories
2. **Cache First**: Always try cache before hitting the database
3. **Error Handling**: Return meaningful errors with context
4. **Transactions**: Use transactions for multi-step operations
5. **Testing**: Write tests for all public methods

## 🔐 Security

- SQL injection prevention (parameterized queries)
- Connection pooling to prevent exhaustion
- Encrypted sensitive data (tokens, passwords)
- Rate limiting (planned)

## 📚 References

- [Proto Definitions](../../proto/storage.proto)
- [Database Schema](../../database/init/01_schema.sql)
- [Architecture Docs](../../../docs/architecture/)

---

**Status:** ✅ In Development

**Next Steps:**
1. Complete all gRPC method implementations
2. Add comprehensive tests
3. Implement metrics collection
4. Add rate limiting
5. Performance optimization

