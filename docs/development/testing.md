# Testing

## Unit Tests

### Jest (Frontend)

```bash
npm test
npm test -- --coverage
```

```typescript
// components/__tests__/PostCard.test.tsx
import { render, screen } from '@testing-library/react';
import { PostCard } from '../PostCard';

describe('PostCard', () => {
  it('renders post content', () => {
    const post = {
      id: '1',
      content: 'Test post',
      platform: 'TELEGRAM',
      status: 'DRAFT'
    };
    
    render(<PostCard post={post} />);
    expect(screen.getByText('Test post')).toBeInTheDocument();
  });
});
```

### pytest (Backend)

```bash
pytest
pytest --cov=src
```

```python
# tests/test_parser.py
import pytest
from parsers.html_parser import HTMLParser

@pytest.mark.asyncio
async def test_parse_article():
    parser = HTMLParser()
    result = await parser.parse('https://example.com/article', {})
    
    assert result['title']
    assert len(result['content']) > 100
```

---

## Integration Tests

```typescript
// tests/integration/api.test.ts
import { ApolloClient, gql } from '@apollo/client';

describe('GraphQL API', () => {
  it('parses article', async () => {
    const result = await client.mutate({
      mutation: gql`
        mutation {
          parseArticle(url: "https://example.com/article") {
            article {
              title
            }
          }
        }
      `
    });
    
    expect(result.data.parseArticle.article.title).toBeDefined();
  });
});
```

---

## E2E Tests

### Playwright

```bash
npx playwright test
npx playwright test --ui
```

```typescript
// e2e/create-post.spec.ts
import { test, expect } from '@playwright/test';

test('create post workflow', async ({ page }) => {
  await page.goto('/create');
  
  // Input URL
  await page.fill('[name="url"]', 'https://example.com/article');
  await page.click('button:has-text("Analyze")');
  
  // Wait for analysis
  await expect(page.locator('.analysis-result')).toBeVisible();
  
  // Generate posts
  await page.click('button:has-text("Generate Posts")');
  await expect(page.locator('.post-card')).toHaveCount(5);
});
```

---

## Load Testing

### K6

```javascript
// load-test.js
import http from 'k6/http';
import { check } from 'k6';

export const options = {
  vus: 100,
  duration: '30s'
};

export default function () {
  const res = http.post('http://localhost:4000/graphql', JSON.stringify({
    query: '{ articles { nodes { id title } } }'
  }), {
    headers: { 'Content-Type': 'application/json' }
  });
  
  check(res, {
    'status is 200': (r) => r.status === 200
  });
}
```

```bash
k6 run load-test.js
```

---

**См. также:**
- [Development Setup](./setup.md)
- [Guidelines](./guidelines.md)

