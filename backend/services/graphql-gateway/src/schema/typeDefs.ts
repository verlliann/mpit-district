export const typeDefs = `#graphql
  # Scalars
  scalar DateTime
  scalar JSON

  # Enums
  enum Sentiment {
    POSITIVE
    NEUTRAL
    NEGATIVE
  }

  enum Platform {
    TELEGRAM
    VK
    FACEBOOK
    INSTAGRAM
    LINKEDIN
    TWITTER
    TIKTOK
    YANDEX_ZEN
    OK_RU
  }

  enum PostStatus {
    DRAFT
    PENDING
    SCHEDULED
    PUBLISHED
    FAILED
    CANCELLED
  }

  enum PostStyle {
    NEUTRAL
    FORMAL
    ENGAGING
    INFORMAL
    BUSINESS
    CREATIVE
  }

  enum EntityType {
    PERSON
    ORGANIZATION
    LOCATION
    EVENT
    PRODUCT
    OTHER
  }

  enum UserRole {
    ADMIN
    EDITOR
    VIEWER
  }

  # Types
  type Article {
    id: ID!
    url: String!
    title: String!
    content: String!
    excerpt: String
    source: String!
    author: String
    publishedAt: DateTime
    parsedAt: DateTime
    sentiment: Sentiment
    sentimentScore: Float
    language: String
    wordCount: Int
    readingTimeMinutes: Int
    isArchived: Boolean
    createdAt: DateTime!
    updatedAt: DateTime!
    facts: [Fact!]
    entities: [Entity!]
    quotes: [Quote!]
    images: [Image!]
    posts: [Post!]
  }

  type Fact {
    id: ID!
    text: String!
    importance: Int!
    orderIndex: Int!
  }

  type Entity {
    name: String!
    type: EntityType!
    mentions: Int
    confidence: Float
  }

  type Quote {
    id: ID!
    text: String!
    author: String
    orderIndex: Int!
  }

  type Image {
    id: ID!
    url: String!
    thumbnailUrl: String
    originalUrl: String
    width: Int
    height: Int
    isGenerated: Boolean
    altText: String
    caption: String
  }

  type Post {
    id: ID!
    platform: Platform!
    content: String!
    style: PostStyle!
    status: PostStatus!
    scheduledAt: DateTime
    publishedAt: DateTime
    externalId: String
    externalUrl: String
    article: Article
    images: [Image!]
    metrics: Metrics
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type Metrics {
    views: Int
    likes: Int
    comments: Int
    shares: Int
    saves: Int
    clicks: Int
    reach: Int
    impressions: Int
    engagement: Float
    updatedAt: DateTime
  }

  type Template {
    id: ID!
    name: String!
    description: String
    platform: Platform
    style: PostStyle
    content: String!
    tags: [String!]
    usageCount: Int
    createdAt: DateTime!
  }

  type SocialAccount {
    id: ID!
    platform: Platform!
    username: String
    displayName: String
    avatar: String
    isActive: Boolean!
    connectedAt: DateTime!
    expiresAt: DateTime
  }

  type User {
    id: ID!
    email: String!
    name: String!
    role: UserRole!
    avatar: String
    preferences: UserPreferences
    createdAt: DateTime!
  }

  type UserPreferences {
    defaultPlatforms: [Platform!]
    defaultStyle: PostStyle
    formalityLevel: Int
    autoPublish: Boolean
    notifications: NotificationSettings
  }

  type NotificationSettings {
    email: Boolean
    push: Boolean
    newMentions: Boolean
    publishSuccess: Boolean
    publishFailure: Boolean
  }

  type Notification {
    id: ID!
    type: String!
    title: String!
    message: String!
    read: Boolean!
    createdAt: DateTime!
  }

  # Pagination
  type PageInfo {
    hasNextPage: Boolean!
    hasPreviousPage: Boolean!
    totalCount: Int!
  }

  type ArticlesConnection {
    nodes: [Article!]!
    pageInfo: PageInfo!
    totalCount: Int!
  }

  type PostsConnection {
    nodes: [Post!]!
    pageInfo: PageInfo!
    totalCount: Int!
  }

  # Analytics
  type Analytics {
    totalPosts: Int!
    totalReach: Int!
    totalEngagement: Int!
    averageEngagement: Float!
    topPosts: [Post!]!
    platformBreakdown: [PlatformStats!]!
    timeline: [TimelinePoint!]!
  }

  type PlatformStats {
    platform: Platform!
    posts: Int!
    reach: Int!
    engagement: Float!
  }

  type TimelinePoint {
    date: DateTime!
    posts: Int!
    reach: Int!
    engagement: Float!
  }

  # Input types
  input ArticleFilter {
    source: String
    sentiment: Sentiment
    isArchived: Boolean
    fromDate: DateTime
    toDate: DateTime
  }

  input PostFilter {
    platform: Platform
    status: PostStatus
    fromDate: DateTime
    toDate: DateTime
  }

  input GeneratePostsInput {
    articleId: ID!
    platforms: [Platform!]!
    style: PostStyle!
    formalityLevel: Int
    customInstructions: String
  }

  input CreatePostInput {
    platform: Platform!
    content: String!
    style: PostStyle
    status: PostStatus
    scheduledAt: DateTime
  }

  input UpdatePostInput {
    content: String
    scheduledAt: DateTime
    images: [ID!]
  }

  input ConnectSocialAccountInput {
    platform: Platform!
    accessToken: String!
    refreshToken: String
  }

  # Queries
  type Query {
    # Articles
    article(id: ID!): Article
    articles(limit: Int, offset: Int, filter: ArticleFilter): ArticlesConnection!
    
    # Posts
    post(id: ID!): Post
    posts(limit: Int, offset: Int, filter: PostFilter): PostsConnection!
    scheduledPosts(from: DateTime, to: DateTime): [Post!]!
    
    # Analytics
    analytics(from: DateTime!, to: DateTime!, platforms: [Platform!]): Analytics!
    
    # Templates
    templates(platform: Platform): [Template!]!
    
    # Social Accounts
    socialAccounts: [SocialAccount!]!
    
    # User
    me: User!
    
    # Notifications
    notifications(limit: Int, offset: Int, unreadOnly: Boolean): [Notification!]!
  }

  # Mutations
  type Mutation {
    # Articles
    parseArticle(url: String!): ParseArticleResult!
    deleteArticle(id: ID!): Boolean!
    
    # Posts
    createPost(input: CreatePostInput!): Post!
    generatePosts(input: GeneratePostsInput!): [Post!]!
    updatePost(id: ID!, input: UpdatePostInput!): Post!
    publishPost(id: ID!): PublishResult!
    publishBatch(ids: [ID!]!): [PublishResult!]!
    schedulePost(id: ID!, scheduledAt: DateTime!): Post!
    cancelScheduledPost(id: ID!): Boolean!
    deletePost(id: ID!): Boolean!
    
    # Templates
    createTemplate(
      name: String!
      description: String
      platform: Platform
      style: PostStyle
      content: String!
      tags: [String!]
    ): Template!
    updateTemplate(id: ID!, content: String!): Template!
    deleteTemplate(id: ID!): Boolean!
    
    # Social Accounts
    connectSocialAccount(input: ConnectSocialAccountInput!): SocialAccount!
    disconnectSocialAccount(id: ID!): Boolean!
    
    # User
    updatePreferences(preferences: JSON!): User!
    
    # Notifications
    markNotificationRead(id: ID!): Boolean!
    markAllNotificationsRead: Boolean!
  }

  # Subscriptions
  type Subscription {
    # Post status changes
    postStatusChanged(postId: ID!): Post!
    
    # Metrics updates
    metricsUpdated(postId: ID!): Metrics!
    
    # Notifications
    notificationReceived: Notification!
    
    # Parsing progress
    parsingProgress(articleId: ID!): ParsingProgress!
  }

  # Response types
  type ParseArticleResult {
    article: Article
    error: String
  }

  type PublishResult {
    post: Post
    success: Boolean!
    error: String
  }

  type ParsingProgress {
    status: String!
    progress: Int!
    message: String
  }
`;

