# Publishing Service

## Обзор

Publishing Service управляет публикацией контента на социальные платформы.

**Технологии:** Node.js (TypeScript), NestJS, BullMQ  
**Communication:** gRPC  
**Port:** 50054

---

## Интеграции

### 1. Telegram Bot API

```typescript
import TelegramBot from 'node-telegram-bot-api';

class TelegramPublisher {
  private bot: TelegramBot;

  constructor(token: string) {
    this.bot = new TelegramBot(token);
  }

  async publish(channelId: string, content: string, mediaUrls: string[]) {
    if (mediaUrls.length > 0) {
      return await this.bot.sendPhoto(channelId, mediaUrls[0], {
        caption: content,
        parse_mode: 'HTML'
      });
    } else {
      return await this.bot.sendMessage(channelId, content, {
        parse_mode: 'HTML'
      });
    }
  }
}
```

### 2. VK API

```typescript
import { VK } from 'vk-io';

class VKPublisher {
  private vk: VK;

  constructor(token: string) {
    this.vk = new VK({ token });
  }

  async publish(groupId: number, content: string, mediaUrls: string[]) {
    const attachments = await this._uploadPhotos(groupId, mediaUrls);
    
    return await this.vk.api.wall.post({
      owner_id: -groupId,
      message: content,
      attachments: attachments.join(',')
    });
  }
}
```

---

## Job Queue (Scheduling)

### BullMQ Integration

```typescript
import { Queue, Worker } from 'bullmq';
import { Redis } from 'ioredis';

const redis = new Redis({
  host: 'redis',
  port: 6379
});

// Создание очереди
const publishQueue = new Queue('publishing', { connection: redis });

// Добавление задачи
await publishQueue.add('publish-post', {
  postId: 'post-123',
  platform: 'telegram',
  scheduledAt: Date.now() + 3600000  // Через 1 час
}, {
  delay: 3600000,
  attempts: 3,
  backoff: {
    type: 'exponential',
    delay: 5000
  }
});

// Worker
const worker = new Worker('publishing', async job => {
  const { postId, platform } = job.data;
  
  const publisher = getPublisher(platform);
  const result = await publisher.publish(postId);
  
  return result;
}, { connection: redis });
```

---

## Retry Mechanism

```typescript
class PublishingService {
  async publishWithRetry(
    postId: string,
    platform: string,
    maxAttempts: number = 3
  ) {
    let lastError: Error;
    
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const result = await this.publish(postId, platform);
        return result;
      } catch (error) {
        lastError = error;
        
        if (this.isRetriable(error)) {
          const delay = this.calculateBackoff(attempt);
          await this.sleep(delay);
          continue;
        }
        
        throw error;
      }
    }
    
    throw lastError;
  }
  
  private calculateBackoff(attempt: number): number {
    return Math.min(1000 * Math.pow(2, attempt), 30000);
  }
}
```

---

## Deployment

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: publishing-service
spec:
  replicas: 3
  template:
    spec:
      containers:
      - name: publishing-service
        image: ai-newsmaker/publishing-service:latest
        ports:
        - containerPort: 50054
        env:
        - name: REDIS_URL
          value: "redis://redis-service:6379"
```

---

**См. также:**
- [Social Platform APIs](../integrations/social-platforms.md)
- [Job Queue](../infrastructure/redis.md)

