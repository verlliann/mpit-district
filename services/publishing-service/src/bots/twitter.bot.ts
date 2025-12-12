import { TwitterApi } from 'twitter-api-v2';
import { BasePlatformBot } from './base.bot';
import { Platform, PublishingJob, PublishResult } from '../queue/types';
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

      const typedMediaIds =
        mediaIds.length === 0
          ? undefined
          : (mediaIds.slice(0, 4) as
              | [string]
              | [string, string]
              | [string, string, string]
              | [string, string, string, string]);

      const result = await withRetry(async () => {
        return await client.v2.tweet({
          text: job.content,
          media: typedMediaIds ? { media_ids: typedMediaIds } : undefined,
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
    _externalId: string,
    _content: string,
    _imageUrls?: string[],
    _accessToken?: string
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

  async testConnection(accessToken: string): Promise<{
    isValid: boolean;
    error?: string;
    accountInfo?: any;
  }> {
    try {
      const accessSecret = accessToken.split(':')[1];

      if (!accessSecret) {
        throw new Error('Invalid access token format. Expected: token:secret');
      }

      const client = this.getClient(accessToken.split(':')[0], accessSecret);
      const user = await client.v2.me({
        'user.fields': ['profile_image_url', 'verified'],
      });

      return {
        isValid: true,
        accountInfo: {
          id: user.data.id,
          username: user.data.username,
          name: user.data.name,
          profileImageUrl: user.data.profile_image_url,
          isVerified: user.data.verified,
        },
      };
    } catch (error: any) {
      return {
        isValid: false,
        error: error.message,
      };
    }
  }

  getPlatformLimits() {
    return {
      maxTextLength: 280,
      maxImages: 4,
      maxVideos: 1,
      supportsEditing: false, // Only for Twitter Blue with limitations
      supportsScheduling: false,
    };
  }
}


