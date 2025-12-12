export enum Platform {
  TELEGRAM = 'TELEGRAM',
  VK = 'VK',
  INSTAGRAM = 'INSTAGRAM',
  LINKEDIN = 'LINKEDIN',
  FACEBOOK = 'FACEBOOK',
  TWITTER = 'TWITTER'
}

export enum Sentiment {
  POSITIVE = 'POSITIVE',
  NEUTRAL = 'NEUTRAL',
  NEGATIVE = 'NEGATIVE'
}

export enum PostStatus {
  DRAFT = 'DRAFT',
  SCHEDULED = 'SCHEDULED',
  PUBLISHED = 'PUBLISHED'
}

export interface Fact {
  id: string;
  text: string;
  confidence: number;
}

export interface Entity {
  name: string;
  type: string; // PERSON, ORG, LOC
}

export interface ArticleAnalysis {
  sentiment: Sentiment;
  sentimentScore: number;
  facts: Fact[];
  entities: Entity[];
  summary: string;
  title: string;
  source: string;
  publishedAt: string;
}

export interface Post {
  id: string;
  platform: Platform;
  content: string;
  imageUrl?: string;
  status: PostStatus;
  scheduledAt?: Date;
  hashtags: string[];
}

export interface AnalyticsMetric {
  date: string;
  reach: number;
  engagement: number;
}

export interface PlatformStat {
  platform: Platform;
  reach: number;
  percentage: number;
}