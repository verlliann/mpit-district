# GraphQL Queries & Mutations

## Queries

### User & Authentication

#### Получить текущего пользователя

```graphql
query Me {
  me {
    id
    email
    name
    role
    avatar
    team {
      id
      name
      members {
        user {
          name
          email
        }
        role
      }
    }
    preferences {
      defaultPlatforms
      defaultStyle
      formalityLevel
      autoPublish
    }
  }
}
```

---

### Articles

#### Получить список статей

```graphql
query GetArticles(
  $limit: Int = 20
  $offset: Int = 0
  $filter: ArticleFilter
) {
  articles(limit: $limit, offset: $offset, filter: $filter) {
    nodes {
      id
      url
      title
      excerpt
      source
      publishedAt
      sentiment
      sentimentScore
      images {
        url
        thumbnailUrl
      }
      posts {
        id
        platform
        status
      }
    }
    totalCount
    pageInfo {
      hasNextPage
      hasPreviousPage
    }
  }
}
```

**Variables:**
```json
{
  "limit": 20,
  "offset": 0,
  "filter": {
    "sentiment": "POSITIVE",
    "from": "2025-12-01T00:00:00Z",
    "to": "2025-12-31T23:59:59Z"
  }
}
```

#### Получить статью по ID

```graphql
query GetArticle($id: ID!) {
  article(id: $id) {
    id
    url
    title
    content
    excerpt
    source
    author
    publishedAt
    sentiment
    sentimentScore
    facts {
      text
      importance
    }
    entities {
      name
      type
      mentions
    }
    quotes {
      text
      author
    }
    images {
      url
      thumbnailUrl
      width
      height
    }
    posts {
      id
      platform
      content
      status
      scheduledAt
      publishedAt
      metrics {
        views
        likes
        engagement
      }
    }
  }
}
```

---

### Posts

#### Получить список постов

```graphql
query GetPosts(
  $limit: Int = 20
  $offset: Int = 0
  $filter: PostFilter
) {
  posts(limit: $limit, offset: $offset, filter: $filter) {
    nodes {
      id
      platform
      content
      style
      status
      scheduledAt
      publishedAt
      externalUrl
      images {
        url
        thumbnailUrl
      }
      metrics {
        views
        likes
        comments
        shares
        engagement
      }
      article {
        title
        source
      }
    }
    totalCount
    pageInfo {
      hasNextPage
    }
  }
}
```

**Variables:**
```json
{
  "filter": {
    "platforms": ["TELEGRAM", "VK"],
    "status": "PUBLISHED",
    "from": "2025-12-01T00:00:00Z"
  }
}
```

#### Получить пост по ID

```graphql
query GetPost($id: ID!) {
  post(id: $id) {
    id
    platform
    content
    style
    status
    scheduledAt
    publishedAt
    externalId
    externalUrl
    images {
      url
      width
      height
    }
    metrics {
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
    article {
      id
      title
      url
    }
    user {
      name
      email
    }
    createdAt
    updatedAt
  }
}
```

#### Получить запланированные посты

```graphql
query GetScheduledPosts($from: DateTime, $to: DateTime) {
  scheduledPosts(from: $from, to: $to) {
    id
    platform
    content
    scheduledAt
    status
    article {
      title
    }
    images {
      thumbnailUrl
    }
  }
}
```

---

### Analytics

#### Получить аналитику

```graphql
query GetAnalytics(
  $from: DateTime!
  $to: DateTime!
  $platforms: [Platform!]
) {
  analytics(from: $from, to: $to, platforms: $platforms) {
    totalPosts
    totalReach
    totalEngagement
    averageEngagement
    topPosts {
      id
      content
      platform
      metrics {
        views
        likes
        engagement
      }
    }
    platformBreakdown {
      platform
      posts
      reach
      engagement
      avgViews
      avgLikes
    }
    timeline {
      date
      posts
      reach
      engagement
      views
      likes
    }
  }
}
```

**Variables:**
```json
{
  "from": "2025-12-01T00:00:00Z",
  "to": "2025-12-31T23:59:59Z",
  "platforms": ["TELEGRAM", "VK", "INSTAGRAM"]
}
```

---

### Templates

#### Получить шаблоны

```graphql
query GetTemplates($platform: Platform) {
  templates(platform: $platform) {
    id
    name
    description
    platform
    style
    content
    tags
    variables {
      name
      description
      required
      defaultValue
    }
    usageCount
    createdBy {
      name
    }
    createdAt
  }
}
```

---

### Social Accounts

#### Получить подключенные аккаунты

```graphql
query GetSocialAccounts {
  socialAccounts {
    id
    platform
    username
    displayName
    avatar
    isActive
    connectedAt
    expiresAt
    tokenStatus
  }
}
```

---

### Notifications

#### Получить уведомления

```graphql
query GetNotifications(
  $limit: Int = 20
  $offset: Int = 0
  $unreadOnly: Boolean = false
) {
  notifications(
    limit: $limit
    offset: $offset
    unreadOnly: $unreadOnly
  ) {
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

---

## Mutations

### Article Operations

#### Парсинг статьи

```graphql
mutation ParseArticle($url: String!) {
  parseArticle(url: $url) {
    article {
      id
      url
      title
      excerpt
      sentiment
      facts {
        text
        importance
      }
    }
    error
    progress
  }
}
```

**Variables:**
```json
{
  "url": "https://example.com/news/article"
}
```

#### Удалить статью

```graphql
mutation DeleteArticle($id: ID!) {
  deleteArticle(id: $id)
}
```

---

### Post Generation

#### Генерация постов

```graphql
mutation GeneratePosts($input: GeneratePostsInput!) {
  generatePosts(input: $input) {
    id
    platform
    content
    style
    scheduledAt
    images {
      url
    }
  }
}
```

**Variables:**
```json
{
  "input": {
    "articleId": "123",
    "platforms": ["TELEGRAM", "VK", "INSTAGRAM"],
    "style": "ENGAGING",
    "count": 5,
    "formalityLevel": 7,
    "strategy": {
      "type": "EVEN",
      "days": 7
    }
  }
}
```

---

### Post Operations

#### Обновить пост

```graphql
mutation UpdatePost($id: ID!, $input: UpdatePostInput!) {
  updatePost(id: $id, input: $input) {
    id
    content
    scheduledAt
    status
    updatedAt
  }
}
```

**Variables:**
```json
{
  "id": "post-123",
  "input": {
    "content": "Обновленный текст поста",
    "scheduledAt": "2025-12-15T18:00:00Z"
  }
}
```

#### Удалить пост

```graphql
mutation DeletePost($id: ID!) {
  deletePost(id: $id)
}
```

#### Дублировать пост

```graphql
mutation DuplicatePost($id: ID!) {
  duplicatePost(id: $id) {
    id
    content
    platform
    status
  }
}
```

---

### Publishing

#### Опубликовать пост

```graphql
mutation PublishPost($id: ID!) {
  publishPost(id: $id) {
    post {
      id
      status
      publishedAt
      externalId
      externalUrl
    }
    success
    error
  }
}
```

#### Пакетная публикация

```graphql
mutation PublishBatch($ids: [ID!]!) {
  publishBatch(ids: $ids) {
    successful {
      post {
        id
        platform
        externalUrl
      }
      success
    }
    failed {
      post {
        id
        platform
      }
      error
    }
    totalCount
  }
}
```

#### Запланировать пост

```graphql
mutation SchedulePost($id: ID!, $scheduledAt: DateTime!) {
  schedulePost(id: $id, scheduledAt: $scheduledAt) {
    id
    status
    scheduledAt
  }
}
```

#### Отменить публикацию

```graphql
mutation CancelScheduledPost($id: ID!) {
  cancelScheduledPost(id: $id)
}
```

---

### Social Accounts

#### Подключить аккаунт

```graphql
mutation ConnectSocialAccount($input: ConnectSocialAccountInput!) {
  connectSocialAccount(input: $input) {
    id
    platform
    username
    displayName
    isActive
    tokenStatus
  }
}
```

**Variables:**
```json
{
  "input": {
    "platform": "TELEGRAM",
    "accessToken": "bot123456:ABC-DEF...",
    "username": "@my_channel"
  }
}
```

#### Отключить аккаунт

```graphql
mutation DisconnectSocialAccount($id: ID!) {
  disconnectSocialAccount(id: $id)
}
```

---

### Templates

#### Создать шаблон

```graphql
mutation CreateTemplate($input: CreateTemplateInput!) {
  createTemplate(input: $input) {
    id
    name
    description
    platform
    content
    tags
  }
}
```

**Variables:**
```json
{
  "input": {
    "name": "Product Launch Template",
    "description": "Template for product announcements",
    "platform": "TELEGRAM",
    "style": "ENGAGING",
    "content": "🚀 {{product_name}} is now live! {{description}} #ProductLaunch",
    "tags": ["product", "launch", "announcement"],
    "variables": [
      {
        "name": "product_name",
        "description": "Name of the product",
        "required": true
      },
      {
        "name": "description",
        "description": "Product description",
        "required": false,
        "defaultValue": "Check it out!"
      }
    ]
  }
}
```

#### Обновить шаблон

```graphql
mutation UpdateTemplate($id: ID!, $content: String!) {
  updateTemplate(id: $id, content: $content) {
    id
    content
    updatedAt
  }
}
```

#### Удалить шаблон

```graphql
mutation DeleteTemplate($id: ID!) {
  deleteTemplate(id: $id)
}
```

---

### User Preferences

#### Обновить настройки

```graphql
mutation UpdatePreferences($preferences: JSON!) {
  updatePreferences(preferences: $preferences) {
    id
    preferences {
      defaultPlatforms
      defaultStyle
      formalityLevel
      autoPublish
      notifications {
        email
        push
        publishSuccess
      }
    }
  }
}
```

**Variables:**
```json
{
  "preferences": {
    "defaultPlatforms": ["TELEGRAM", "VK"],
    "defaultStyle": "ENGAGING",
    "formalityLevel": 7,
    "autoPublish": false,
    "notifications": {
      "email": true,
      "push": true,
      "publishSuccess": true,
      "publishFailure": true
    }
  }
}
```

---

### Notifications

#### Отметить уведомление как прочитанное

```graphql
mutation MarkNotificationRead($id: ID!) {
  markNotificationRead(id: $id)
}
```

#### Отметить все уведомления как прочитанные

```graphql
mutation MarkAllNotificationsRead {
  markAllNotificationsRead
}
```

---

## Error Handling

### Примеры ошибок

```graphql
{
  "errors": [
    {
      "message": "Article not found",
      "extensions": {
        "code": "NOT_FOUND",
        "field": "id",
        "details": {
          "articleId": "123"
        }
      }
    }
  ]
}
```

```graphql
{
  "errors": [
    {
      "message": "Rate limit exceeded",
      "extensions": {
        "code": "RATE_LIMIT_EXCEEDED",
        "details": {
          "limit": 100,
          "window": "1h",
          "retryAfter": 3600
        }
      }
    }
  ]
}
```

---

## Best Practices

### 1. Использование фрагментов

```graphql
fragment PostFields on Post {
  id
  platform
  content
  status
  scheduledAt
  publishedAt
}

query GetPosts {
  posts {
    nodes {
      ...PostFields
      article {
        title
      }
    }
  }
}
```

### 2. Pagination

```graphql
query GetArticlesWithPagination($cursor: String) {
  articles(first: 20, after: $cursor) {
    nodes {
      id
      title
    }
    pageInfo {
      hasNextPage
      endCursor
    }
  }
}
```

### 3. Batch Queries

```graphql
query BatchQuery {
  articles { ... }
  posts { ... }
  analytics { ... }
  notifications { ... }
}
```

---

**См. также:**
- [GraphQL Schema](./schema.md)
- [Subscriptions](./subscriptions.md)
- [Frontend Integration](../../frontend/state-management.md)

