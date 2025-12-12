# Database Migrations

## Обзор

Управление изменениями схемы базы данных.

---

## Инструменты

### Go (golang-migrate)

```bash
migrate create -ext sql -dir migrations -seq add_posts_table
```

### Python (Alembic)

```bash
alembic revision --autogenerate -m "Add posts table"
alembic upgrade head
```

---

## Пример миграции

```sql
-- migrations/001_create_articles.up.sql
CREATE TABLE articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- migrations/001_create_articles.down.sql
DROP TABLE articles;
```

---

## Best Practices

1. **Всегда создавайте down миграции**
2. **Не изменяйте существующие миграции**
3. **Тестируйте миграции в staging**
4. **Делайте бэкап перед миграцией**

---

**См. также:**
- [Database Schema](./schema.md)

