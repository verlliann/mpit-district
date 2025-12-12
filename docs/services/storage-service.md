# Storage Service

## Обзор

Storage Service управляет данными и файлами.

**Технологии:** Go, PostgreSQL, Redis, S3  
**Communication:** gRPC  
**Port:** 50055

---

## Основные функции

### 1. CRUD операции
- Articles (статьи)
- Posts (посты)
- Users (пользователи)
- Metrics (метрики)

### 2. File Management
- Upload/Download через streaming
- S3 integration
- CDN URLs

### 3. Caching
- Redis для часто запрашиваемых данных
- Cache invalidation strategies

---

## Пример реализации (Go)

### Database Operations

```go
package storage

import (
    "context"
    "database/sql"
    _ "github.com/lib/pq"
)

type ArticleRepository struct {
    db *sql.DB
}

func (r *ArticleRepository) Save(ctx context.Context, article *Article) error {
    query := `
        INSERT INTO articles (id, user_id, url, title, content, sentiment)
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (id) DO UPDATE SET
            title = EXCLUDED.title,
            content = EXCLUDED.content,
            updated_at = NOW()
    `
    
    _, err := r.db.ExecContext(ctx, query,
        article.ID,
        article.UserID,
        article.URL,
        article.Title,
        article.Content,
        article.Sentiment,
    )
    
    return err
}

func (r *ArticleRepository) Get(ctx context.Context, id string) (*Article, error) {
    query := `
        SELECT id, user_id, url, title, content, sentiment, created_at
        FROM articles
        WHERE id = $1
    `
    
    var article Article
    err := r.db.QueryRowContext(ctx, query, id).Scan(
        &article.ID,
        &article.UserID,
        &article.URL,
        &article.Title,
        &article.Content,
        &article.Sentiment,
        &article.CreatedAt,
    )
    
    if err == sql.ErrNoRows {
        return nil, ErrNotFound
    }
    
    return &article, err
}
```

### File Upload (Streaming)

```go
func (s *StorageService) UploadFile(stream pb.StorageService_UploadFileServer) error {
    var fileData []byte
    var metadata *pb.FileMetadata
    
    for {
        chunk, err := stream.Recv()
        if err == io.EOF {
            break
        }
        if err != nil {
            return err
        }
        
        if metadata == nil {
            metadata = chunk.Metadata
        }
        
        fileData = append(fileData, chunk.Data...)
    }
    
    // Upload to S3
    url, err := s.s3Client.Upload(fileData, metadata.Filename)
    if err != nil {
        return err
    }
    
    return stream.SendAndClose(&pb.FileUploadResult{
        Success: true,
        FileId:  metadata.FileId,
        Url:     url,
    })
}
```

---

## Deployment

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: storage-service
spec:
  replicas: 3
  template:
    spec:
      containers:
      - name: storage-service
        image: ai-newsmaker/storage-service:latest
        ports:
        - containerPort: 50055
        env:
        - name: DATABASE_URL
          value: "postgresql://user:pass@postgres:5432/aidb"
        - name: REDIS_URL
          value: "redis://redis-service:6379"
        - name: S3_ENDPOINT
          value: "https://s3.amazonaws.com"
```

---

**См. также:**
- [Database Schema](../database/schema.md)
- [S3 Configuration](../infrastructure/storage.md)

