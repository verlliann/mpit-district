export enum Platform {
  TELEGRAM = 'TELEGRAM',
  VK = 'VK',
  INSTAGRAM = 'INSTAGRAM',
  FACEBOOK = 'FACEBOOK',
  LINKEDIN = 'LINKEDIN',
  TWITTER = 'TWITTER',
}

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

export interface PublishResult {
  success: boolean;
  error?: string;
  errorCode?: string;
  externalId?: string;
  externalUrl?: string;
  publishedAt?: Date;
}
