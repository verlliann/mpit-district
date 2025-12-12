// ============================================================
// ENUMS
// ============================================================

export enum Platform {
  TELEGRAM = 'TELEGRAM',
  VK = 'VK',
  INSTAGRAM = 'INSTAGRAM',
  FACEBOOK = 'FACEBOOK',
  LINKEDIN = 'LINKEDIN',
  TWITTER = 'TWITTER',
}

export enum PublishingErrorCode {
  UNSPECIFIED = 'PUBLISHING_ERROR_CODE_UNSPECIFIED',
  INVALID_TOKEN = 'PUBLISHING_ERROR_CODE_INVALID_TOKEN',
  TOKEN_EXPIRED = 'PUBLISHING_ERROR_CODE_TOKEN_EXPIRED',
  RATE_LIMIT = 'PUBLISHING_ERROR_CODE_RATE_LIMIT',
  CONTENT_TOO_LONG = 'PUBLISHING_ERROR_CODE_CONTENT_TOO_LONG',
  INVALID_MEDIA = 'PUBLISHING_ERROR_CODE_INVALID_MEDIA',
  NETWORK_ERROR = 'PUBLISHING_ERROR_CODE_NETWORK_ERROR',
  PLATFORM_ERROR = 'PUBLISHING_ERROR_CODE_PLATFORM_ERROR',
  PERMISSION_DENIED = 'PUBLISHING_ERROR_CODE_PERMISSION_DENIED',
  POST_NOT_FOUND = 'PUBLISHING_ERROR_CODE_POST_NOT_FOUND',
  ACCOUNT_SUSPENDED = 'PUBLISHING_ERROR_CODE_ACCOUNT_SUSPENDED',
  SPAM_DETECTED = 'PUBLISHING_ERROR_CODE_SPAM_DETECTED',
}

// ============================================================
// REQUEST/JOB TYPES
// ============================================================

export interface PublishingJob {
  postId: string;
  socialAccountId: string;
  platform: Platform;
  content: string;
  imageUrls?: string[];
  videoUrls?: string[];
  options?: PublishOptions;
  accessToken: string;
  scheduledAt?: string;
}

export interface PublishOptions {
  disableComments?: boolean;
  disableNotifications?: boolean;
  linkPreviewUrl?: string;
  hashtags?: string[];
  mentions?: string[];
  location?: LocationData;
  platformSpecific?: Record<string, string>;
}

export interface LocationData {
  latitude: number;
  longitude: number;
  name: string;
}

// ============================================================
// RESPONSE TYPES
// ============================================================

export interface PublishResult {
  success: boolean;
  error?: string;
  errorCode?: PublishingErrorCode | string;
  externalId?: string;
  externalUrl?: string;
  publishedAt?: Date;
}

export interface PublishedPostInfo {
  postId: string;
  externalId: string;
  externalUrl: string;
  publishedAt: Date;
  platform: Platform;
}

export interface PublishingMetadata {
  attemptNumber: number;
  processingTimeMs: number;
  usedFallback: boolean;
  apiVersion: string;
}

// ============================================================
// CONNECTION & ACCOUNT INFO
// ============================================================

export interface ConnectionInfo {
  isValid: boolean;
  tokenExpired: boolean;
  tokenExpiresAt?: Date;
  accountInfo?: AccountInfo;
  permissions: string[];
  rateLimit?: RateLimitInfo;
}

export interface AccountInfo {
  externalId: string;
  username: string;
  displayName: string;
  avatarUrl?: string;
  followersCount?: number;
  isVerified: boolean;
}

export interface RateLimitInfo {
  limit: number;
  remaining: number;
  resetAt: Date;
}

// ============================================================
// PLATFORM LIMITS
// ============================================================

export interface PlatformLimits {
  contentLimits: ContentLimits;
  mediaLimits: MediaLimits;
  postingLimits: PostingLimits;
}

export interface ContentLimits {
  maxTextLength: number;
  maxHashtags: number;
  maxMentions: number;
  maxLinks: number;
  supportsMarkdown: boolean;
  supportsHtml: boolean;
}

export interface MediaLimits {
  maxImages: number;
  maxVideos: number;
  maxImageSizeBytes: number;
  maxVideoSizeBytes: number;
  supportedImageFormats: string[];
  supportedVideoFormats: string[];
  recommendedImageDimensions?: ImageDimensions;
}

export interface ImageDimensions {
  minWidth: number;
  minHeight: number;
  maxWidth: number;
  maxHeight: number;
  aspectRatio: string;
}

export interface PostingLimits {
  postsPerHour: number;
  postsPerDay: number;
  minIntervalSeconds: number;
  supportsScheduling: boolean;
  supportsEditing: boolean;
  editTimeLimitMinutes: number;
}
