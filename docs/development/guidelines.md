# Development Guidelines

## Code Style

### TypeScript/JavaScript

```typescript
// Use TypeScript strict mode
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true
  }
}

// Use ESLint
// .eslintrc.js
module.exports = {
  extends: ['next/core-web-vitals', 'prettier'],
  rules: {
    'no-console': 'warn',
    'prefer-const': 'error'
  }
};
```

### Python

```python
# Use Black for formatting
# pyproject.toml
[tool.black]
line-length = 100
target-version = ['py311']

# Use pylint/ruff for linting
# .pylintrc
[MESSAGES CONTROL]
max-line-length = 100
```

---

## Git Workflow

### Branch Naming

```
feature/add-telegram-integration
bugfix/fix-parsing-error
hotfix/critical-security-patch
```

### Commit Messages

```
feat: Add Telegram Bot API integration
fix: Resolve parsing error for JavaScript sites
docs: Update API documentation
refactor: Improve Parser Service performance
test: Add unit tests for AI Engine
```

---

## Code Review

### Checklist

- [ ] Code follows style guidelines
- [ ] Tests added/updated
- [ ] Documentation updated
- [ ] No console.log() statements
- [ ] Error handling implemented
- [ ] Performance considerations addressed

---

## Testing

### Unit Tests

```typescript
// Example Jest test
describe('Parser Service', () => {
  it('should parse article URL', async () => {
    const result = await parseArticle('https://example.com/article');
    expect(result.title).toBeDefined();
    expect(result.content).toHaveLength.greaterThan(100);
  });
});
```

### E2E Tests

```typescript
// Playwright test
test('create post workflow', async ({ page }) => {
  await page.goto('/create');
  await page.fill('[name="url"]', 'https://example.com/article');
  await page.click('button[type="submit"]');
  await expect(page.locator('.post-card')).toBeVisible();
});
```

---

**См. также:**
- [Setup Guide](./setup.md)
- [Testing](./testing.md)
- [Deployment](./deployment.md)

