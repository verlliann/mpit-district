# API Security

## Rate Limiting

### GraphQL

```typescript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP'
});

app.use('/graphql', limiter);
```

### Query Complexity Limiting

```typescript
import { createComplexityLimitRule } from 'graphql-validation-complexity';

const complexityLimit = createComplexityLimitRule(1000, {
  scalarCost: 1,
  objectCost: 2,
  listFactor: 10
});

const server = new ApolloServer({
  validationRules: [complexityLimit]
});
```

---

## Input Validation

### Zod Schema

```typescript
import { z } from 'zod';

const parseArticleSchema = z.object({
  url: z.string().url(),
  extractImages: z.boolean().optional()
});

// Usage
const input = parseArticleSchema.parse(req.body);
```

---

## CORS

```typescript
import cors from 'cors';

app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(','),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

---

## SQL Injection Prevention

```typescript
// ✅ Good: Use parameterized queries
const article = await db.query(
  'SELECT * FROM articles WHERE id = $1',
  [articleId]
);

// ❌ Bad: String concatenation
const article = await db.query(
  `SELECT * FROM articles WHERE id = '${articleId}'`
);
```

---

## XSS Prevention

```typescript
import DOMPurify from 'dompurify';

export function sanitizeHTML(dirty: string): string {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p'],
    ALLOWED_ATTR: ['href']
  });
}
```

---

**См. также:**
- [Authentication](./auth.md)
- [Data Protection](./data-protection.md)

