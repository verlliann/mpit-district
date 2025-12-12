import { IgApiClient } from 'instagram-private-api';
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
import axios from 'axios';

export class InstagramPlatformBot extends BasePlatformBot {
  readonly platform = Platform.INSTAGRAM;
  private clients: Map<string, IgApiClient> = new Map();

  private async getClient(username: string, password: string): Promise<IgApiClient> {
    const key = `${username}:${password}`;
    
    if (!this.clients.has(key)) {
      const ig = new IgApiClient();
      ig.state.generateDevice(username);
      
      await withRetry(async () => {
        await ig.account.login(username, password);
      });
      
      this.clients.set(key, ig);
    }
    
    return this.clients.get(key)!;
  }

  async publish(job: PublishingJob): Promise<PublishResult> {
    try {
      const username = job.options?.platformSpecific?.username;
      const password = job.options?.platformSpecific?.password;

      if (!username || !password) {
        throw new Error('Instagram username and password are required');
      }

      logger.info({ postId: job.postId, username }, 'Publishing to Instagram');

      const ig = await this.getClient(username, password);

      // Instagram requires at least one image
      if (!job.imageUrls || job.imageUrls.length === 0) {
        throw new Error('At least one image is required for Instagram posts');
      }

      const result = await withRetry(async () => {
        // Download image
        const imageBuffer = await this.downloadImage(job.imageUrls![0]);

        // Publish photo
        const publishResult = await ig.publish.photo({
          file: imageBuffer,
          caption: job.content,
        });

        return publishResult;
      });

      const postUrl = `https://www.instagram.com/p/${result.media.code}/`;

      return {
        success: true,
        externalId: result.media.id,
        externalUrl: postUrl,
        publishedAt: new Date(result.media.taken_at * 1000),
      };
    } catch (error: any) {
      logger.error({ error, postId: job.postId }, 'Instagram publish failed');
      return this.handleError(error, 'publish');
    }
  }

  async update(
    externalId: string,
    content: string,
    imageUrls?: string[],
    accessToken?: string
  ): Promise<PublishResult> {
    // Instagram doesn't support editing posts
    return {
      success: false,
      error: 'Instagram does not support editing posts',
      errorCode: 'NOT_SUPPORTED',
    };
  }

  async delete(externalId: string, accessToken?: string): Promise<boolean> {
    try {
      const username = accessToken?.split(':')[0];
      const password = accessToken?.split(':')[1];

      if (!username || !password) {
        throw new Error('Instagram credentials are required');
      }

      const ig = await this.getClient(username, password);

      await withRetry(async () => {
        await ig.media.delete({
          mediaId: externalId,
        });
      });

      return true;
    } catch (error: any) {
      logger.error({ error, externalId }, 'Instagram delete failed');
      return false;
    }
  }

  async testConnection(accessToken: string): Promise<ConnectionInfo> {
    try {
      const [username, password] = accessToken.split(':');

      if (!username || !password) {
        throw new Error('Invalid access token format. Expected: username:password');
      }

      const ig = await this.getClient(username, password);
      const account = await ig.account.currentUser();

      return {
        isValid: true,
        tokenExpired: false,
        accountInfo: {
          externalId: account.pk.toString(),
          username: account.username,
          displayName: account.full_name,
          avatarUrl: account.profile_pic_url,
          followersCount: account.follower_count,
          isVerified: account.is_verified,
        },
        permissions: ['read_profile', 'publish_content'],
      };
    } catch (error: any) {
      return {
        isValid: false,
        tokenExpired: error.message?.includes('login') || error.message?.includes('auth'),
        permissions: [],
      };
    }
  }

  getPlatformLimits(): PlatformLimits {
    return {
      contentLimits: {
        maxTextLength: 2200,
        maxHashtags: 30,
        maxMentions: 20,
        maxLinks: 1,
        supportsMarkdown: false,
        supportsHtml: false,
      },
      mediaLimits: {
        maxImages: 10, // for carousel posts
        maxVideos: 1,
        maxImageSizeBytes: 8 * 1024 * 1024, // 8 MB
        maxVideoSizeBytes: 100 * 1024 * 1024, // 100 MB
        supportedImageFormats: ['jpg', 'jpeg', 'png'],
        supportedVideoFormats: ['mp4', 'mov'],
        recommendedImageDimensions: {
          minWidth: 320,
          minHeight: 320,
          maxWidth: 1080,
          maxHeight: 1350,
          aspectRatio: '4:5',
        },
      },
      postingLimits: {
        postsPerHour: 5,
        postsPerDay: 25,
        minIntervalSeconds: 60,
        supportsScheduling: false,
        supportsEditing: false,
        editTimeLimitMinutes: 0,
      },
    };
  }
}


