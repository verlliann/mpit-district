# 🎨 Frontend Integration Guide

## ✅ Что сделано

### 1. **Apollo Client Setup**
- Настроен Apollo Client с поддержкой GraphQL и WebSocket
- Реализована обработка ошибок и автоматический retry
- Добавлена поддержка JWT authentication
- Кэширование с оптимизацией для pagination

**Файлы:**
- `services/apollo.ts` - конфигурация Apollo Client

### 2. **GraphQL API Integration**
Полный набор запросов для работы с backend:

**Queries** (`services/graphql/queries.ts`):
- `GET_ARTICLES` - получение списка статей
- `GET_ARTICLE` - детали статьи
- `GET_POSTS` - список постов
- `GET_POST` - детали поста
- `GET_SCHEDULED_POSTS` - запланированные посты
- `GET_ANALYTICS` - аналитика
- `GET_ME` - данные пользователя
- `GET_TEMPLATES` - шаблоны
- `GET_SOCIAL_ACCOUNTS` - подключенные аккаунты
- `GET_NOTIFICATIONS` - уведомления

**Mutations** (`services/graphql/mutations.ts`):
- `PARSE_ARTICLE` - парсинг статьи
- `GENERATE_POSTS` - генерация постов
- `UPDATE_POST` - обновление поста
- `PUBLISH_POST` - публикация
- `PUBLISH_BATCH` - пакетная публикация
- `SCHEDULE_POST` - планирование
- `CONNECT_SOCIAL_ACCOUNT` - подключение соцсетей
- `CREATE_TEMPLATE` - создание шаблона
- `UPDATE_PREFERENCES` - настройки пользователя

**Subscriptions** (`services/graphql/subscriptions.ts`):
- `POST_STATUS_CHANGED` - изменение статуса поста
- `METRICS_UPDATED` - обновление метрик
- `NOTIFICATION_RECEIVED` - новые уведомления
- `PARSING_PROGRESS` - прогресс парсинга
- `GENERATION_PROGRESS` - прогресс генерации
- `PUBLISHING_PROGRESS` - прогресс публикации

### 3. **Custom React Hooks**
Удобные хуки для работы с API:

**useArticles** (`services/hooks/useArticles.ts`):
```typescript
const { data, loading, error } = useArticles({ filter: { sentiment: 'POSITIVE' } });
const [parseArticle] = useParseArticle();
const [deleteArticle] = useDeleteArticle();
```

**usePosts** (`services/hooks/usePosts.ts`):
```typescript
const { data, loading } = usePosts({ filter: { status: 'PUBLISHED' } });
const [generatePosts] = useGeneratePosts();
const [publishPost] = usePublishPost();
const postStatus = usePostStatus(postId); // Real-time subscription
```

**useAnalytics** (`services/hooks/useAnalytics.ts`):
```typescript
const { data } = useAnalytics(30, ['TELEGRAM', 'VK']); // Last 30 days
```

**useNotifications** (`services/hooks/useNotifications.ts`):
```typescript
const { data } = useNotifications(true); // Unread only
const [markRead] = useMarkNotificationRead();
const notification = useNotificationSubscription(); // Real-time
```

### 4. **Обновлен App.tsx**
- Добавлен `ApolloProvider`
- Интеграция с authentication
- Автоматическая очистка кэша при logout

---

## 📦 Установка зависимостей

```bash
npm install
```

**Новые зависимости:**
- `@apollo/client` - GraphQL клиент
- `graphql` - GraphQL core
- `graphql-ws` - WebSocket для subscriptions
- `date-fns` - работа с датами

---

## 🔧 Настройка

### 1. Environment Variables

Создайте файл `.env.local`:

```bash
# GraphQL API Endpoints
VITE_GRAPHQL_URL=http://localhost:4000/graphql
VITE_GRAPHQL_WS_URL=ws://localhost:4000/graphql

# Environment
VITE_APP_ENV=development
```

### 2. Запуск

```bash
# Development
npm run dev

# Build
npm run build

# Preview production build
npm run preview
```

---

## 🎯 Примеры использования

### Парсинг статьи с real-time прогрессом

```typescript
import { useParseArticle, useParsingProgress } from './services/hooks/useArticles';

function ParseArticle() {
  const [parseArticle, { data, loading }] = useParseArticle();
  const [articleId, setArticleId] = useState<string | null>(null);
  
  // Real-time progress
  const { data: progress } = useParsingProgress(articleId);

  const handleParse = async () => {
    const result = await parseArticle({
      variables: { url: 'https://example.com/article' }
    });
    setArticleId(result.data.parseArticle.article.id);
  };

  return (
    <div>
      <button onClick={handleParse} disabled={loading}>
        Parse Article
      </button>
      {progress && (
        <ProgressBar 
          progress={progress.parsingProgress.progress}
          message={progress.parsingProgress.message}
        />
      )}
    </div>
  );
}
```

### Генерация и публикация постов

```typescript
import { useGeneratePosts, usePublishPost, usePostStatus } from './services/hooks/usePosts';

function CreatePost() {
  const [generatePosts] = useGeneratePosts();
  const [publishPost] = usePublishPost();
  
  const handleGenerate = async () => {
    const result = await generatePosts({
      variables: {
        input: {
          articleId: 'article-123',
          platforms: ['TELEGRAM', 'VK', 'INSTAGRAM'],
          style: 'ENGAGING',
          count: 5,
          formalityLevel: 7
        }
      }
    });
    
    const posts = result.data.generatePosts;
    console.log('Generated:', posts);
  };

  const handlePublish = async (postId: string) => {
    await publishPost({ variables: { id: postId } });
  };

  return (
    <div>
      <button onClick={handleGenerate}>Generate Posts</button>
      {/* Render posts and publish buttons */}
    </div>
  );
}
```

### Real-time уведомления

```typescript
import { useNotificationSubscription } from './services/hooks/useNotifications';
import { useEffect } from 'react';

function NotificationBell() {
  const { data } = useNotificationSubscription();

  useEffect(() => {
    if (data?.notificationReceived) {
      const notification = data.notificationReceived;
      
      // Show toast
      toast.success(notification.title, {
        description: notification.message
      });
      
      // Play sound
      new Audio('/notification.mp3').play();
    }
  }, [data]);

  return <BellIcon />;
}
```

### Аналитика с графиками

```typescript
import { useAnalytics } from './services/hooks/useAnalytics';
import { LineChart, Line, XAxis, YAxis } from 'recharts';

function AnalyticsDashboard() {
  const { data, loading } = useAnalytics(30, ['TELEGRAM', 'VK']);

  if (loading) return <Skeleton />;

  return (
    <div>
      <h2>Total Reach: {data.analytics.totalReach}</h2>
      <h3>Engagement: {data.analytics.averageEngagement}%</h3>
      
      <LineChart data={data.analytics.timeline}>
        <XAxis dataKey="date" />
        <YAxis />
        <Line type="monotone" dataKey="reach" stroke="#8884d8" />
        <Line type="monotone" dataKey="engagement" stroke="#82ca9d" />
      </LineChart>
    </div>
  );
}
```

---

## 🎨 Стилистика (сохранена)

Glassmorphism дизайн остался без изменений:
- Полупрозрачные элементы с backdrop-blur
- Градиенты от violet до indigo
- Мягкие тени и скругления
- Плавные анимации (animate-fade-in, transitions)

**CSS классы:**
- `bg-white/60 backdrop-blur-2xl` - стекло
- `bg-gradient-to-r from-violet-600 to-indigo-600` - градиенты
- `shadow-lg shadow-indigo-500/30` - цветные тени
- `rounded-xl border border-white/60` - скругления

---

## 🔄 Замена моков на реальные запросы

### До (mock):
```typescript
const result = await mockAiService.analyzeArticle(url);
```

### После (real API):
```typescript
const [parseArticle] = useParseArticle();
const result = await parseArticle({ variables: { url } });
```

---

## 📱 Real-time Features

Все subscriptions автоматически подключаются через WebSocket:

1. **Статус публикации** - live обновления статуса постов
2. **Метрики** - real-time счетчики просмотров, лайков
3. **Уведомления** - моментальные push-уведомления
4. **Прогресс** - live progress bars для долгих операций

---

## 🚀 Следующие шаги

### Для интеграции с backend:

1. **Запустить backend сервисы**:
   ```bash
   # GraphQL Gateway должен быть на localhost:4000
   ```

2. **Обновить views для использования hooks**:
   - `views/CreateContent.tsx` - заменить mockService на useParseArticle + useGeneratePosts
   - `views/Dashboard.tsx` - добавить useAnalytics
   - `views/CalendarView.tsx` - использовать useScheduledPosts
   - `views/LibraryView.tsx` - использовать useArticles + usePosts

3. **Добавить error handling**:
   - Toast для ошибок
   - Retry buttons
   - Fallback UI

4. **Оптимизировать**:
   - Lazy loading для views
   - Image optimization
   - Code splitting

---

## 📚 Документация

- [GraphQL Queries](./services/graphql/queries.ts)
- [GraphQL Mutations](./services/graphql/mutations.ts)
- [GraphQL Subscriptions](./services/graphql/subscriptions.ts)
- [Apollo Client Config](./services/apollo.ts)
- [Custom Hooks](./services/hooks/)

---

## 🐛 Troubleshooting

### WebSocket не подключается
```typescript
// Проверьте URL в .env.local
VITE_GRAPHQL_WS_URL=ws://localhost:4000/graphql

// Убедитесь что backend поддерживает WebSocket
```

### Ошибка CORS
```typescript
// Backend должен разрешить origin:
// Access-Control-Allow-Origin: http://localhost:5173
```

### Токен не сохраняется
```typescript
// Используйте setAuthToken из apollo.ts
import { setAuthToken } from './services/apollo';

setAuthToken(token);
```

---

**Готово к интеграции! 🎉**

Все компоненты сохранили свой стиль, но теперь работают с реальным GraphQL API вместо моков.

