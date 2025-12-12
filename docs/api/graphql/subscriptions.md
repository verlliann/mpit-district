# GraphQL Subscriptions

## Обзор

GraphQL Subscriptions обеспечивают real-time обновления через WebSocket соединение. Клиент подписывается на события и получает уведомления при их возникновении.

---

## Subscriptions Schema

```graphql
type Subscription {
  # Изменение статуса поста
  postStatusChanged(postId: ID!): Post!
  
  # Обновление метрик поста
  metricsUpdated(postId: ID!): Metrics!
  
  # Новое уведомление
  notificationReceived: Notification!
  
  # Прогресс парсинга статьи
  parsingProgress(articleId: ID!): ParsingProgress!
  
  # Прогресс генерации постов
  generationProgress(jobId: ID!): GenerationProgress!
  
  # Прогресс публикации
  publishingProgress(postId: ID!): PublishingProgress!
}
```

---

## 1. Post Status Changed

### Описание
Получение уведомлений об изменении статуса поста (DRAFT → REVIEW → APPROVED → SCHEDULED → PUBLISHING → PUBLISHED).

### Subscription

```graphql
subscription OnPostStatusChanged($postId: ID!) {
  postStatusChanged(postId: $postId) {
    id
    status
    publishedAt
    externalId
    externalUrl
    error
    updatedAt
  }
}
```

### Variables

```json
{
  "postId": "post-123"
}
```

### Пример события

```json
{
  "data": {
    "postStatusChanged": {
      "id": "post-123",
      "status": "PUBLISHED",
      "publishedAt": "2025-12-12T18:00:00Z",
      "externalId": "123456789",
      "externalUrl": "https://t.me/channel/123",
      "error": null,
      "updatedAt": "2025-12-12T18:00:05Z"
    }
  }
}
```

### Use Case

```typescript
// React + Apollo Client
const { data, loading } = useSubscription(ON_POST_STATUS_CHANGED, {
  variables: { postId: "post-123" }
});

useEffect(() => {
  if (data?.postStatusChanged.status === 'PUBLISHED') {
    toast.success('Post published successfully!');
  }
}, [data]);
```

---

## 2. Metrics Updated

### Описание
Real-time обновление метрик опубликованного поста (просмотры, лайки, комментарии).

### Subscription

```graphql
subscription OnMetricsUpdated($postId: ID!) {
  metricsUpdated(postId: $postId) {
    views
    likes
    comments
    shares
    clicks
    engagement
    reach
    impressions
    updatedAt
  }
}
```

### Variables

```json
{
  "postId": "post-123"
}
```

### Пример события

```json
{
  "data": {
    "metricsUpdated": {
      "views": 1523,
      "likes": 87,
      "comments": 12,
      "shares": 5,
      "clicks": 45,
      "engagement": 4.8,
      "reach": 3200,
      "impressions": 3800,
      "updatedAt": "2025-12-12T19:30:00Z"
    }
  }
}
```

### Use Case

```typescript
const { data } = useSubscription(ON_METRICS_UPDATED, {
  variables: { postId: "post-123" }
});

// Обновление UI с новыми метриками в реальном времени
```

---

## 3. Notification Received

### Описание
Получение новых уведомлений для пользователя (без необходимости polling).

### Subscription

```graphql
subscription OnNotificationReceived {
  notificationReceived {
    id
    type
    title
    message
    data
    read
    createdAt
  }
}
```

### Пример события

```json
{
  "data": {
    "notificationReceived": {
      "id": "notif-456",
      "type": "POST_PUBLISHED",
      "title": "Post Published",
      "message": "Your Telegram post has been published successfully",
      "data": {
        "postId": "post-123",
        "platform": "TELEGRAM",
        "url": "https://t.me/channel/123"
      },
      "read": false,
      "createdAt": "2025-12-12T18:00:05Z"
    }
  }
}
```

### Use Case

```typescript
const { data } = useSubscription(ON_NOTIFICATION_RECEIVED);

useEffect(() => {
  if (data?.notificationReceived) {
    // Показать toast notification
    showNotification(data.notificationReceived);
    // Обновить счетчик непрочитанных
    incrementUnreadCount();
  }
}, [data]);
```

---

## 4. Parsing Progress

### Описание
Отслеживание прогресса парсинга статьи.

### Subscription

```graphql
subscription OnParsingProgress($articleId: ID!) {
  parsingProgress(articleId: $articleId) {
    status
    progress
    message
    currentStep
    totalSteps
    error
  }
}
```

### Variables

```json
{
  "articleId": "article-789"
}
```

### Пример событий

**Шаг 1: Начало**
```json
{
  "data": {
    "parsingProgress": {
      "status": "STARTED",
      "progress": 0,
      "message": "Starting to parse article...",
      "currentStep": 1,
      "totalSteps": 5,
      "error": null
    }
  }
}
```

**Шаг 2: В процессе**
```json
{
  "data": {
    "parsingProgress": {
      "status": "IN_PROGRESS",
      "progress": 40,
      "message": "Extracting content...",
      "currentStep": 2,
      "totalSteps": 5,
      "error": null
    }
  }
}
```

**Шаг 3: Завершено**
```json
{
  "data": {
    "parsingProgress": {
      "status": "COMPLETED",
      "progress": 100,
      "message": "Article parsed successfully",
      "currentStep": 5,
      "totalSteps": 5,
      "error": null
    }
  }
}
```

### Use Case

```typescript
const { data } = useSubscription(ON_PARSING_PROGRESS, {
  variables: { articleId }
});

// Отображение progress bar
<ProgressBar 
  value={data?.parsingProgress.progress} 
  label={data?.parsingProgress.message}
/>
```

---

## 5. Generation Progress

### Описание
Отслеживание прогресса генерации постов (AI генерация может занимать 20-30 секунд).

### Subscription

```graphql
subscription OnGenerationProgress($jobId: ID!) {
  generationProgress(jobId: $jobId) {
    status
    progress
    message
    completedPosts
    totalPosts
    currentPlatform
    error
  }
}
```

### Variables

```json
{
  "jobId": "job-abc123"
}
```

### Пример событий

```json
{
  "data": {
    "generationProgress": {
      "status": "IN_PROGRESS",
      "progress": 60,
      "message": "Generating VK post...",
      "completedPosts": 3,
      "totalPosts": 5,
      "currentPlatform": "VK",
      "error": null
    }
  }
}
```

### Use Case

```typescript
const { data } = useSubscription(ON_GENERATION_PROGRESS, {
  variables: { jobId }
});

// Показать прогресс генерации
<div>
  Generating posts: {data?.generationProgress.completedPosts} / {data?.generationProgress.totalPosts}
  <ProgressBar value={data?.generationProgress.progress} />
</div>
```

---

## 6. Publishing Progress

### Описание
Отслеживание процесса публикации на внешних платформах.

### Subscription

```graphql
subscription OnPublishingProgress($postId: ID!) {
  publishingProgress(postId: $postId) {
    status
    progress
    message
    attempt
    maxAttempts
    error
  }
}
```

### Variables

```json
{
  "postId": "post-123"
}
```

### Пример событий

```json
{
  "data": {
    "publishingProgress": {
      "status": "UPLOADING_MEDIA",
      "progress": 50,
      "message": "Uploading images to Telegram...",
      "attempt": 1,
      "maxAttempts": 3,
      "error": null
    }
  }
}
```

---

## Implementation Details

### WebSocket Connection

#### Apollo Client Setup

```typescript
import { split, HttpLink, ApolloClient, InMemoryCache } from '@apollo/client';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { getMainDefinition } from '@apollo/client/utilities';
import { createClient } from 'graphql-ws';

// HTTP link для queries и mutations
const httpLink = new HttpLink({
  uri: 'https://api.ai-newsmaker.com/graphql',
  headers: {
    authorization: `Bearer ${token}`
  }
});

// WebSocket link для subscriptions
const wsLink = new GraphQLWsLink(
  createClient({
    url: 'wss://api.ai-newsmaker.com/graphql',
    connectionParams: {
      authorization: `Bearer ${token}`
    },
    retryAttempts: 5,
    shouldRetry: () => true
  })
);

// Split между HTTP и WS
const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    return (
      definition.kind === 'OperationDefinition' &&
      definition.operation === 'subscription'
    );
  },
  wsLink,
  httpLink
);

const client = new ApolloClient({
  link: splitLink,
  cache: new InMemoryCache()
});
```

### React Hook Example

```typescript
import { useSubscription, gql } from '@apollo/client';

const POST_STATUS_CHANGED = gql`
  subscription OnPostStatusChanged($postId: ID!) {
    postStatusChanged(postId: $postId) {
      id
      status
      publishedAt
      externalUrl
    }
  }
`;

function PostStatus({ postId }) {
  const { data, loading, error } = useSubscription(
    POST_STATUS_CHANGED,
    { variables: { postId } }
  );

  if (loading) return <div>Connecting...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      Status: {data?.postStatusChanged.status}
      {data?.postStatusChanged.externalUrl && (
        <a href={data.postStatusChanged.externalUrl}>View Post</a>
      )}
    </div>
  );
}
```

---

## Authentication

### Token-based Authentication

WebSocket соединения требуют JWT token:

```typescript
connectionParams: {
  authorization: `Bearer ${token}`
}
```

### Token Refresh

При истечении токена:
1. Subscription автоматически отключается
2. Клиент обновляет токен
3. Переподключение с новым токеном

---

## Error Handling

### Connection Errors

```typescript
const wsLink = new GraphQLWsLink(
  createClient({
    url: 'wss://api.ai-newsmaker.com/graphql',
    on: {
      connected: () => console.log('Connected to WebSocket'),
      error: (error) => console.error('WebSocket error:', error),
      closed: () => console.log('WebSocket closed')
    },
    retryAttempts: 5,
    shouldRetry: (error) => {
      // Не пытаемся переподключиться при auth ошибках
      if (error.message.includes('authentication')) {
        return false;
      }
      return true;
    }
  })
);
```

### Subscription Errors

```typescript
const { data, error } = useSubscription(SUBSCRIPTION, {
  onError: (error) => {
    console.error('Subscription error:', error);
    // Показать пользователю
    toast.error('Connection lost. Reconnecting...');
  },
  onComplete: () => {
    console.log('Subscription completed');
  }
});
```

---

## Performance Considerations

### 1. Selective Subscriptions

Подписывайтесь только на нужные события:

```typescript
// ❌ Плохо: подписка на все посты
useSubscription(ALL_POSTS_CHANGED);

// ✅ Хорошо: подписка на конкретный пост
useSubscription(POST_STATUS_CHANGED, { 
  variables: { postId: activePostId },
  skip: !activePostId // Пропустить если нет активного поста
});
```

### 2. Cleanup

Отписывайтесь при размонтировании:

```typescript
useEffect(() => {
  const subscription = client.subscribe({
    query: POST_STATUS_CHANGED,
    variables: { postId }
  }).subscribe({
    next: (data) => console.log(data)
  });

  return () => subscription.unsubscribe();
}, [postId]);
```

### 3. Batching

Группируйте события на сервере для уменьшения трафика.

---

## Server-Side Implementation (Apollo Server)

### Subscription Resolver

```typescript
import { PubSub } from 'graphql-subscriptions';

const pubsub = new PubSub();

const resolvers = {
  Mutation: {
    publishPost: async (_, { id }, context) => {
      // Публикация поста
      const post = await publishPostLogic(id);
      
      // Emit событие
      pubsub.publish('POST_STATUS_CHANGED', {
        postStatusChanged: post
      });
      
      return post;
    }
  },
  Subscription: {
    postStatusChanged: {
      subscribe: withFilter(
        () => pubsub.asyncIterator('POST_STATUS_CHANGED'),
        (payload, variables) => {
          return payload.postStatusChanged.id === variables.postId;
        }
      )
    }
  }
};
```

### With Redis PubSub (for multiple servers)

```typescript
import { RedisPubSub } from 'graphql-redis-subscriptions';
import Redis from 'ioredis';

const options = {
  host: 'redis-server',
  port: 6379,
  retryStrategy: times => Math.min(times * 50, 2000)
};

const pubsub = new RedisPubSub({
  publisher: new Redis(options),
  subscriber: new Redis(options)
});
```

---

## Best Practices

### 1. Use Subscriptions for Real-time Updates Only

- ✅ Post status changes
- ✅ Live metrics
- ✅ Notifications
- ❌ Initial data loading (use Query)
- ❌ CRUD operations (use Mutation)

### 2. Implement Reconnection Logic

```typescript
const wsLink = new GraphQLWsLink(
  createClient({
    url: 'wss://api.ai-newsmaker.com/graphql',
    lazy: true, // Ленивое подключение
    retryAttempts: 5,
    retryWait: async (retries) => {
      await new Promise(resolve => 
        setTimeout(resolve, Math.min(1000 * 2 ** retries, 10000))
      );
    }
  })
);
```

### 3. Handle Connection States

```typescript
function useConnectionStatus() {
  const [status, setStatus] = useState('connecting');
  
  useEffect(() => {
    const client = getApolloClient();
    // Track WebSocket status
    // Update UI accordingly
  }, []);
  
  return status;
}
```

---

**См. также:**
- [GraphQL Schema](./schema.md)
- [Queries & Mutations](./operations.md)
- [Frontend State Management](../../frontend/state-management.md)

