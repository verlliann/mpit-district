import { TwitterApi } from 'twitter-api-v2';
import { BasePlatformBot } from './base.bot';
import { 
  Platform, 
  PublishingJob, 
  PublishResult,
  ConnectionInfo,
  PlatformLimits
} from '../queue/types';
import { logger } from '../utils/logger';
import { withRetry } from '../utils/retry';

export class TwitterPlatformBot extends BasePlatformBot {
  readonly platform = Platform.TWITTER;
  private clients: Map<string, TwitterApi> = new Map();

  private getClient(accessToken: string, accessSecret: string): TwitterApi {
    const key = `${accessToken}:${accessSecret}`;
    
    if (!this.clients.has(key)) {
      this.clients.set(
        key,
        new TwitterApi({
          appKey: process.env.TWITTER_API_KEY!,
          appSecret: process.env.TWITTER_API_SECRET!,
          accessToken,
          accessSecret,
        })
      );
    }
    
    return this.clients.get(key)!;
  }

  async publish(job: PublishingJob): Promise<PublishResult> {
    try {
      const accessSecret = job.options?.platformSpecific?.accessSecret;

      if (!accessSecret) {
        throw new Error('Twitter access secret is required');
      }

      logger.info({ postId: job.postId }, 'Publishing to Twitter');

      const client = this.getClient(job.accessToken, accessSecret);

      let mediaIds: string[] = [];

      // Upload media if present
      if (job.imageUrls && job.imageUrls.length > 0) {
        mediaIds = await Promise.all(
          job.imageUrls.slice(0, 4).map(async (imageUrl) => {
            const imageBuffer = await this.downloadImage(imageUrl);
            return await client.v1.uploadMedia(imageBuffer, {
              mimeType: 'image/jpeg',
            });
          })
        );
      }

      const result = await withRetry(async () => {
        return await client.v2.tweet({
          text: job.content,
          media: mediaIds.length > 0 ? { media_ids: mediaIds as any } : undefined,
        });
      });

      const tweetId = result.data.id;
      const tweetUrl = `https://twitter.com/i/web/status/${tweetId}`;

      return {
        success: true,
        externalId: tweetId,
        externalUrl: tweetUrl,
        publishedAt: new Date(),
      };
    } catch (error: any) {
      logger.error({ error, postId: job.postId }, 'Twitter publish failed');
      return this.handleError(error, 'publish');
    }
  }

  async update(
    externalId: string,
    content: string,
    imageUrls?: string[],
    accessToken?: string
  ): Promise<PublishResult> {
    // Twitter doesn't support editing tweets (except for Twitter Blue subscribers with limited time)
    return {
      success: false,
      error: 'Twitter does not support editing tweets',
      errorCode: 'NOT_SUPPORTED',
    };
  }

  async delete(externalId: string, accessToken?: string): Promise<boolean> {
    try {
      const accessSecret = accessToken?.split(':')[1];

      if (!accessToken || !accessSecret) {
        throw new Error('Twitter access token and secret are required');
      }

      const client = this.getClient(accessToken.split(':')[0], accessSecret);

      await withRetry(async () => {
        await client.v2.deleteTweet(externalId);
      });

      return true;
    } catch (error: any) {
      logger.error({ error, externalId }, 'Twitter delete failed');
      return false;
    }
  }

  async testConnection(accessToken: string): Promise<ConnectionInfo> {
    try {
      const accessSecret = accessToken.split(':')[1];

      if (!accessSecret) {
        throw new Error('Invalid access token format. Expected: token:secret');
      }

      const client = this.getClient(accessToken.split(':')[0], accessSecret);
      const user = await client.v2.me({
        'user.fields': ['profile_image_url', 'verified', 'public_metrics'],
      });

      return {
        isValid: true,
        tokenExpired: false,
        accountInfo: {
          externalId: user.data.id,
          username: user.data.username,
          displayName: user.data.name,
          avatarUrl: user.data.profile_image_url,
          followersCount: (user.data as any).public_metrics?.followers_count,
          isVerified: user.data.verified || false,
        },
        permissions: ['tweet.read', 'tweet.write', 'users.read'],
      };
    } catch (error: any) {
      return {
        isValid: false,
        tokenExpired: error.message?.includes('token') || error.code === 401,
        permissions: [],
      };
    }
  }

  getPlatformLimits(): PlatformLimits {
    return {
      contentLimits: {
        maxTextLength: 280,
        maxHashtags: 10,
        maxMentions: 10,
        maxLinks: 4,
        supportsMarkdown: false,
        supportsHtml: false,
      },
      mediaLimits: {
        maxImages: 4,
        maxVideos: 1,
        maxImageSizeBytes: 5 * 1024 * 1024, // 5 MB
        maxVideoSizeBytes: 512 * 1024 * 1024, // 512 MB
        supportedImageFormats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
        supportedVideoFormats: ['mp4', 'mov'],
        recommendedImageDimensions: {
          minWidth: 600,
          minHeight: 335,
          maxWidth: 1200,
          maxHeight: 675,
          aspectRatio: '16:9',
        },
      },
      postingLimits: {
        postsPerHour: 50,
        postsPerDay: 300,
        minIntervalSeconds: 5,
        supportsScheduling: false,
        supportsEditing: false, // Only for Twitter Blue with limitations
        editTimeLimitMinutes: 0,
      },
    };
  }
}


