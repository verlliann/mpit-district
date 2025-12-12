# Database Optimization

## Индексирование

### Основные индексы

```sql
-- Для частых запросов по user_id
CREATE INDEX idx_articles_user_id ON articles(user_id);
CREATE INDEX idx_posts_user_id ON posts(user_id);

-- Для сортировки по дате
CREATE INDEX idx_articles_created_at ON articles(created_at DESC);
CREATE INDEX idx_posts_scheduled_at ON posts(scheduled_at) WHERE status = 'SCHEDULED';

-- Для фильтрации
CREATE INDEX idx_posts_status ON posts(status);
CREATE INDEX idx_articles_sentiment ON articles(sentiment);
```

### Composite индексы

```sql
-- Для запросов с несколькими условиями
CREATE INDEX idx_posts_user_status ON posts(user_id, status);
CREATE INDEX idx_articles_user_date ON articles(user_id, created_at DESC);
```

---

## Партиционирование

```sql
-- Партиционирование по дате для metrics
CREATE TABLE metrics (
  id UUID,
  post_id UUID,
  created_at TIMESTAMP,
  ...
) PARTITION BY RANGE (created_at);

CREATE TABLE metrics_2025_01 PARTITION OF metrics
  FOR VALUES FROM ('2025-01-01') TO ('2025-02-01');
```

---

## Connection Pooling

```python
# Python (SQLAlchemy)
from sqlalchemy import create_engine

engine = create_engine(
    DATABASE_URL,
    pool_size=20,
    max_overflow=10,
    pool_pre_ping=True
)
```

---

## Query Optimization

### Use EXPLAIN ANALYZE

```sql
EXPLAIN ANALYZE
SELECT * FROM posts
WHERE user_id = '...' AND status = 'PUBLISHED'
ORDER BY created_at DESC
LIMIT 20;
```

### Избегайте N+1 queries

```sql
-- Bad: N+1
SELECT * FROM posts;
-- Затем для каждого поста:
SELECT * FROM metrics WHERE post_id = ?;

-- Good: JOIN
SELECT p.*, m.*
FROM posts p
LEFT JOIN metrics m ON m.post_id = p.id
WHERE p.user_id = ?;
```

---

**См. также:**
- [Database Schema](./schema.md)
- [Migrations](./migrations.md)

