# GraphQL Schema

## Обзор

GraphQL API предоставляет единую точку входа для всех клиентских запросов. Схема строго типизирована и поддерживает queries, mutations и subscriptions.

---

## Scalar Types

```graphql
scalar DateTime
scalar JSON
scalar Upload
```

---

## Enums

### Platform

```graphql
enum Platform {
  TELEGRAM
  VK
  INSTAGRAM
  FACEBOOK
  LINKEDIN
  TWITTER
  TIKTOK
  DZEN
  OK
}
```

### PostStatus

```graphql
enum PostStatus {
  DRAFT          # Черновик
  REVIEW         # На проверке
  APPROVED       # Одобрено
  SCHEDULED      # Запланировано
  PUBLISHING     # Публикуется
  PUBLISHED      # Опубликовано
  FAILED         # Ошибка публикации
  CANCELLED      # Отменено
}
```

### Style

```graphql
enum Style {
  INFORMATIONAL  # Информационный (сухие факты)
  ENGAGING       # Вовлекающий (призыв к дискуссии)
  EXPERT         # Экспертный (с анализом)
  EMOTIONAL      # Эмоциональный (усиление позитива/негатива)
}
```

### Sentiment

```graphql
enum Sentiment {
  POSITIVE
  NEUTRAL
  NEGATIVE
}
```

### UserRole

```graphql
enum UserRole {
  ADMIN      # Полный доступ
  EDITOR     # Создание и редактирование
  PUBLISHER  # Публикация
  VIEWER     # Только просмотр
}
```

---

## Core Types

### User

```graphql
type User {
  id: ID!
  email: String!
  name: String!
  role: UserRole!
  avatar: String
  createdAt: DateTime!
  team: Team
  preferences: UserPreferences
}
```

### Team

```graphql
type Team {
  id: ID!
  name: String!
  members: [TeamMember!]!
  socialAccounts: [SocialAccount!]!
  createdAt: DateTime!
}

type TeamMember {
  user: User!
  role: UserRole!
  joinedAt: DateTime!
}
```

### Article

```graphql
type Article {
  id: ID!
  url: String!
  title: String!
  content: String!
  excerpt: String
  source: String!
  author: String
  publishedAt: DateTime!
  parsedAt: DateTime!
  sentiment: Sentiment!
  sentimentScore: Float!
  facts: [Fact!]!
  entities: [Entity!]!
  quotes: [Quote!]!
  images: [Image!]!
  posts: [Post!]!
  user: User!
}
```

### Fact

```graphql
type Fact {
  id: ID!
  text: String!
  importance: Float!  # 0.0 - 1.0
}
```

### Entity

```graphql
type Entity {
  id: ID!
  name: String!
  type: String!       # PERSON, ORGANIZATION, LOCATION, etc.
  mentions: Int!
}
```

### Quote

```graphql
type Quote {
  id: ID!
  text: String!
  author: String
}
```

### Image

```graphql
type Image {
  id: ID!
  url: String!
  thumbnailUrl: String
  width: Int
  height: Int
  altText: String
  size: Int           # bytes
  format: String      # jpg, png, webp
}
```

### Post

```graphql
type Post {
  id: ID!
  article: Article!
  platform: Platform!
  content: String!
  style: Style!
  status: PostStatus!
  scheduledAt: DateTime
  publishedAt: DateTime
  externalId: String
  externalUrl: String
  images: [Image!]!
  metrics: Metrics
  user: User!
  createdAt: DateTime!
  updatedAt: DateTime!
}
```

### Metrics

```graphql
type Metrics {
  views: Int!
  likes: Int!
  comments: Int!
  shares: Int!
  clicks: Int!
  engagement: Float!   # Engagement rate
  reach: Int!
  impressions: Int!
  updatedAt: DateTime!
}
```

### SocialAccount

```graphql
type SocialAccount {
  id: ID!
  platform: Platform!
  username: String!
  displayName: String
  avatar: String
  isActive: Boolean!
  connectedAt: DateTime!
  expiresAt: DateTime
  tokenStatus: TokenStatus!
}

enum TokenStatus {
  VALID
  EXPIRING_SOON    # < 7 days
  EXPIRED
  INVALID
}
```

### Template

```graphql
type Template {
  id: ID!
  name: String!
  description: String
  platform: Platform
  style: Style
  content: String!
  tags: [String!]!
  variables: [TemplateVariable!]!
  usageCount: Int!
  createdBy: User!
  createdAt: DateTime!
}

type TemplateVariable {
  name: String!
  description: String
  required: Boolean!
  defaultValue: String
}
```

### Analytics

```graphql
type Analytics {
  totalPosts: Int!
  totalReach: Int!
  totalEngagement: Float!
  averageEngagement: Float!
  topPosts: [Post!]!
  platformBreakdown: [PlatformMetrics!]!
  timeline: [TimelineMetrics!]!
}

type PlatformMetrics {
  platform: Platform!
  posts: Int!
  reach: Int!
  engagement: Float!
  avgViews: Float!
  avgLikes: Float!
}

type TimelineMetrics {
  date: DateTime!
  posts: Int!
  reach: Int!
  engagement: Float!
  views: Int!
  likes: Int!
}
```

### Notification

```graphql
type Notification {
  id: ID!
  type: NotificationType!
  title: String!
  message: String!
  data: JSON
  read: Boolean!
  createdAt: DateTime!
}

enum NotificationType {
  NEW_MENTION
  POST_PUBLISHED
  POST_FAILED
  TEAM_INVITATION
  TOKEN_EXPIRING
  SYSTEM_UPDATE
}
```

### UserPreferences

```graphql
type UserPreferences {
  defaultPlatforms: [Platform!]!
  defaultStyle: Style!
  formalityLevel: Int!         # 1-10
  autoPublish: Boolean!
  notifications: NotificationSettings!
  brandSettings: BrandSettings
}

type NotificationSettings {
  email: Boolean!
  push: Boolean!
  newMentions: Boolean!
  publishSuccess: Boolean!
  publishFailure: Boolean!
  teamActivity: Boolean!
}

type BrandSettings {
  brandName: String
  brandColors: [String!]
  logo: String
  toneOfVoice: String
}
```

---

## Input Types

### ArticleFilter

```graphql
input ArticleFilter {
  search: String
  sentiment: Sentiment
  from: DateTime
  to: DateTime
  source: String
}
```

### PostFilter

```graphql
input PostFilter {
  platforms: [Platform!]
  status: PostStatus
  from: DateTime
  to: DateTime
  search: String
}
```

### GeneratePostsInput

```graphql
input GeneratePostsInput {
  articleId: ID!
  platforms: [Platform!]!
  style: Style!
  count: Int = 5
  formalityLevel: Int = 7
  strategy: DistributionStrategy
  customInstructions: String
}

input DistributionStrategy {
  type: StrategyType!
  days: Int
  customSchedule: [DateTime!]
}

enum StrategyType {
  QUICK              # Все в течение 24 часов
  EVEN               # Равномерно по дням
  WAVE               # 2 волны с интервалом
  SMART              # ML-based оптимизация
  CUSTOM             # Пользовательское расписание
}
```

### UpdatePostInput

```graphql
input UpdatePostInput {
  content: String
  scheduledAt: DateTime
  images: [ID!]
  status: PostStatus
}
```

### ConnectSocialAccountInput

```graphql
input ConnectSocialAccountInput {
  platform: Platform!
  accessToken: String!
  refreshToken: String
  username: String
}
```

### CreateTemplateInput

```graphql
input CreateTemplateInput {
  name: String!
  description: String
  platform: Platform
  style: Style
  content: String!
  tags: [String!]
  variables: [TemplateVariableInput!]
}

input TemplateVariableInput {
  name: String!
  description: String
  required: Boolean!
  defaultValue: String
}
```

---

## Connection Types (Pagination)

```graphql
type ArticlesConnection {
  nodes: [Article!]!
  totalCount: Int!
  pageInfo: PageInfo!
}

type PostsConnection {
  nodes: [Post!]!
  totalCount: Int!
  pageInfo: PageInfo!
}

type PageInfo {
  hasNextPage: Boolean!
  hasPreviousPage: Boolean!
  startCursor: String
  endCursor: String
}
```

---

## Union Types

```graphql
union SearchResult = Article | Post | Template

type SearchResultsConnection {
  nodes: [SearchResult!]!
  totalCount: Int!
  pageInfo: PageInfo!
}
```

---

## Interface Types

```graphql
interface Node {
  id: ID!
}

interface Timestamped {
  createdAt: DateTime!
  updatedAt: DateTime!
}
```

---

## Response Types

### ParseArticleResult

```graphql
type ParseArticleResult {
  article: Article
  error: String
  progress: Float
}
```

### PublishResult

```graphql
type PublishResult {
  post: Post!
  success: Boolean!
  error: String
  externalId: String
  externalUrl: String
}
```

### BatchPublishResult

```graphql
type BatchPublishResult {
  successful: [PublishResult!]!
  failed: [PublishResult!]!
  totalCount: Int!
}
```

---

## Error Types

```graphql
type Error {
  message: String!
  code: ErrorCode!
  field: String
  details: JSON
}

enum ErrorCode {
  VALIDATION_ERROR
  AUTHENTICATION_ERROR
  AUTHORIZATION_ERROR
  NOT_FOUND
  RATE_LIMIT_EXCEEDED
  EXTERNAL_API_ERROR
  INTERNAL_ERROR
}
```

---

**См. также:**
- [Queries и Mutations](./operations.md)
- [Subscriptions](./subscriptions.md)
- [gRPC Schema](../grpc/protobuf.md)

