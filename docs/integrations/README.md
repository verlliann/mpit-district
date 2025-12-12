# Integrations

Документация по интеграциям с внешними сервисами и социальными платформами.

---

## Социальные платформы

### [Полная документация](./social-platforms.md)

Подробное руководство по интеграции с социальными сетями, включая:
- Подключение и авторизацию
- Публикацию контента
- Сбор метрик и статистики
- Обработку ошибок
- Rate limiting

### Поддерживаемые платформы

| Платформа | Публикация | Метрики | Статус |
|-----------|-----------|---------|--------|
| **Telegram** | ✅ Текст, фото, медиа-группы | ✅ Просмотры, пересылки, реакции | Полная поддержка |
| **VK** | ✅ Текст, фото, видео, отложенная публикация | ✅ Просмотры, лайки, комментарии, репосты | Полная поддержка |
| **Facebook** | ✅ Текст, фото, карусели, отложенная публикация | ✅ Лайки, комментарии, расшаривания, reach | Полная поддержка |
| **Instagram** | ✅ Фото, карусели, Stories | ✅ Лайки, комментарии, saves, impressions | Полная поддержка |
| **LinkedIn** | ✅ Текст, изображения, статьи | ✅ Лайки, комментарии, расшаривания | Полная поддержка |
| **OK.ru** | ✅ Текст, фото | ⚠️ Ограниченные метрики | Базовая поддержка |
| **Twitter/X** | 🔄 В разработке | 🔄 В разработке | Планируется |
| **TikTok** | 🔄 В разработке | 🔄 В разработке | Планируется |

---

## Быстрый старт

### 1. Подключение платформы

```typescript
import { TelegramPublisher } from '@/integrations/telegram';

const publisher = new TelegramPublisher(process.env.TELEGRAM_BOT_TOKEN);

const result = await publisher.publish({
  channelId: '@my_channel',
  content: 'Hello, World!',
  mediaUrls: ['https://example.com/image.jpg']
});

console.log('Published:', result.externalUrl);
```

### 2. Сбор метрик

```typescript
import { TelegramMetricsCollector } from '@/integrations/telegram';

const collector = new TelegramMetricsCollector(token);

const metrics = await collector.getPostMetrics(channelId, messageId);

console.log('Views:', metrics.views);
console.log('Engagement:', metrics.engagement);
```

### 3. Универсальный менеджер

```typescript
import { PublisherManager, Platform } from '@/integrations';

const manager = new PublisherManager();

// Регистрация publishers
manager.registerPublisher(Platform.TELEGRAM, telegramPublisher, telegramCollector);
manager.registerPublisher(Platform.VK, vkPublisher, vkCollector);

// Публикация
const result = await manager.publish(Platform.TELEGRAM, accountId, {
  content: 'Universal post',
  mediaUrls: []
});

// Получение метрик
const metrics = await manager.getMetrics(Platform.TELEGRAM, postId, externalId);
```

---

## Архитектура

```
integrations/
├── telegram/
│   ├── publisher.ts          # Публикация в Telegram
│   ├── metrics.ts            # Сбор метрик
│   ├── webhook.ts            # Webhook обработчик
│   └── auth.ts               # Авторизация
├── vk/
│   ├── publisher.ts
│   ├── metrics.ts
│   ├── callback.ts           # Callback API
│   └── auth.ts
├── meta/
│   ├── facebook-publisher.ts
│   ├── instagram-publisher.ts
│   ├── metrics.ts
│   └── auth.ts
├── linkedin/
│   ├── publisher.ts
│   ├── metrics.ts
│   └── auth.ts
├── publisher-manager.ts      # Универсальный менеджер
├── token-manager.ts          # Управление токенами
├── rate-limiter.ts           # Rate limiting
└── errors.ts                 # Обработка ошибок
```

---

## Особенности платформ

### Telegram
- ✅ Не требует OAuth (используется Bot Token)
- ✅ Простая публикация через Bot API
- ⚠️ Ограниченная статистика (требуется MTProto для детальных метрик)
- ⚠️ Нет нативной отложенной публикации (используем очереди)

### VK
- ✅ Полная поддержка медиа-загрузки
- ✅ Отложенная публикация
- ✅ Callback API для real-time событий
- ⚠️ Rate limit: 3 запроса/секунду

### Meta (Facebook/Instagram)
- ✅ Единая авторизация для обеих платформ
- ✅ Отложенная публикация (только Facebook)
- ✅ Детальная статистика через Insights API
- ⚠️ Токены истекают (требуется refresh)
- ⚠️ Instagram требует двухэтапную публикацию

### LinkedIn
- ✅ Профессиональная аудитория
- ✅ Поддержка организаций
- ⚠️ Ограниченная статистика без Marketing API
- ⚠️ Сложная загрузка медиа

---

## Best Practices

### 1. Безопасность токенов
```typescript
// ✅ Хорошо: Шифрование токенов
const encryptedToken = encrypt(accessToken);
await db.save({ token: encryptedToken });

// ❌ Плохо: Хранение в открытом виде
await db.save({ token: accessToken });
```

### 2. Error Handling
```typescript
try {
  await publisher.publish(post);
} catch (error) {
  if (error instanceof TokenExpiredError) {
    await refreshToken();
    await publisher.publish(post); // Retry
  } else if (error instanceof RateLimitError) {
    await sleep(error.retryAfter * 1000);
    await publisher.publish(post); // Retry
  } else {
    throw error;
  }
}
```

### 3. Rate Limiting
```typescript
// Всегда проверяйте лимиты перед запросом
await rateLimiter.acquire(platform, accountId);
await publisher.publish(post);
```

### 4. Retry Logic
```typescript
const result = await retry(
  () => publisher.publish(post),
  {
    attempts: 3,
    delay: 1000,
    backoff: 'exponential'
  }
);
```

---

## Мониторинг

### Metrics

```typescript
// Prometheus metrics
const publishAttempts = new Counter({
  name: 'social_publish_attempts_total',
  labelNames: ['platform', 'status']
});

const publishDuration = new Histogram({
  name: 'social_publish_duration_seconds',
  labelNames: ['platform']
});
```

### Logging

```typescript
logger.info('Publishing post', {
  platform: 'telegram',
  postId: post.id,
  accountId: account.id
});

logger.error('Publish failed', {
  platform: 'telegram',
  error: error.message,
  stack: error.stack
});
```

---

## Testing

### Mock Publishers

```typescript
// tests/mocks/telegram-publisher.mock.ts
export class MockTelegramPublisher {
  async publish(options: any): Promise<PublishResult> {
    return {
      success: true,
      messageId: 123,
      externalId: 'mock_123',
      externalUrl: 'https://t.me/test/123',
      publishedAt: new Date()
    };
  }
}
```

### Integration Tests

```typescript
describe('Integration: Telegram Publishing', () => {
  it('should publish real post to test channel', async () => {
    const publisher = new TelegramPublisher(TEST_TOKEN);
    
    const result = await publisher.publish({
      channelId: TEST_CHANNEL_ID,
      content: 'Integration test post'
    });

    expect(result.success).toBe(true);
    
    // Cleanup
    await publisher.deleteMessage(TEST_CHANNEL_ID, result.messageId);
  });
});
```

---

## Troubleshooting

### Telegram
**Problem**: Bot can't send messages  
**Solution**: Ensure bot is admin in the channel

**Problem**: No metrics available  
**Solution**: Use MTProto API for detailed stats or rely on channel statistics

### VK
**Problem**: Photo upload fails  
**Solution**: Check upload server response, ensure correct format

**Problem**: Token invalid  
**Solution**: VK tokens don't expire, check if user revoked access

### Meta
**Problem**: Token expired  
**Solution**: Use refresh token to get new access token

**Problem**: Instagram publish fails  
**Solution**: Ensure image meets requirements (aspect ratio, file size)

### LinkedIn
**Problem**: Can't upload images  
**Solution**: Follow 3-step process: register, upload, attach

**Problem**: Limited metrics  
**Solution**: Apply for Marketing Developer Platform access

---

## Support

- 📖 [Full Documentation](./social-platforms.md)
- 🐛 [Report Issues](https://github.com/your-org/ai-newsmaker/issues)
- 💬 [Discussions](https://github.com/your-org/ai-newsmaker/discussions)

---

**См. также:**
- [Publishing Service](../services/publishing-service.md)
- [API Documentation](../api/README.md)
- [Development Guide](../development/setup.md)

