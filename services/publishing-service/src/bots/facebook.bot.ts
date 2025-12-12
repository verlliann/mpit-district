import axios from 'axios';
import FormData from 'form-data';
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

export class FacebookPlatformBot extends BasePlatformBot {
  readonly platform = Platform.FACEBOOK;
  private readonly apiVersion = 'v18.0';
  private readonly baseUrl = `https://graph.facebook.com/${this.apiVersion}`;

  async publish(job: PublishingJob): Promise<PublishResult> {
    try {
      const pageId = job.options?.platformSpecific?.pageId || job.socialAccountId;

      if (!pageId) {
        throw new Error('Facebook page ID is required');
      }

      logger.info({ postId: job.postId, pageId }, 'Publishing to Facebook');

      let publishedId: string;
      let publishedUrl: string;

      if (job.imageUrls && job.imageUrls.length > 0) {
        // Publish with photo
        if (job.imageUrls.length === 1) {
          // Single photo
          const result = await withRetry(async () => {
            const response = await axios.post(
              `${this.baseUrl}/${pageId}/photos`,
              {
                url: job.imageUrls![0],
                caption: job.content,
                access_token: job.accessToken,
              }
            );
            return response.data;
          });

          publishedId = result.id;
          publishedUrl = `https://www.facebook.com/${publishedId}`;
        } else {
          // Multiple photos - create album
          const photoIds = await Promise.all(
            job.imageUrls.map(async (imageUrl) => {
              const response = await axios.post(
                `${this.baseUrl}/${pageId}/photos`,
                {
                  url: imageUrl,
                  published: false,
                  access_token: job.accessToken,
                }
              );
              return response.data.id;
            })
          );

          const result = await withRetry(async () => {
            const response = await axios.post(
              `${this.baseUrl}/${pageId}/feed`,
              {
                message: job.content,
                attached_media: photoIds.map((id) => ({ media_fbid: id })),
                access_token: job.accessToken,
              }
            );
            return response.data;
          });

          publishedId = result.id;
          publishedUrl = `https://www.facebook.com/${publishedId}`;
        }
      } else {
        // Text only post
        const result = await withRetry(async () => {
          const response = await axios.post(
            `${this.baseUrl}/${pageId}/feed`,
            {
              message: job.content,
              link: job.options?.linkPreviewUrl,
              access_token: job.accessToken,
            }
          );
          return response.data;
        });

        publishedId = result.id;
        publishedUrl = `https://www.facebook.com/${publishedId}`;
      }

      return {
        success: true,
        externalId: publishedId,
        externalUrl: publishedUrl,
        publishedAt: new Date(),
      };
    } catch (error: any) {
      logger.error({ error, postId: job.postId }, 'Facebook publish failed');
      return this.handleError(error, 'publish');
    }
  }

  async update(
    externalId: string,
    content: string,
    imageUrls?: string[],
    accessToken?: string
  ): Promise<PublishResult> {
    try {
      if (!accessToken) {
        throw new Error('Access token is required');
      }

      await withRetry(async () => {
        await axios.post(
          `${this.baseUrl}/${externalId}`,
          {
            message: content,
            access_token: accessToken,
          }
        );
      });

      return {
        success: true,
        externalId,
      };
    } catch (error: any) {
      logger.error({ error, externalId }, 'Facebook update failed');
      return this.handleError(error, 'update');
    }
  }

  async delete(externalId: string, accessToken?: string): Promise<boolean> {
    try {
      if (!accessToken) {
        throw new Error('Access token is required');
      }

      await withRetry(async () => {
        await axios.delete(`${this.baseUrl}/${externalId}`, {
          params: {
            access_token: accessToken,
          },
        });
      });

      return true;
    } catch (error: any) {
      logger.error({ error, externalId }, 'Facebook delete failed');
      return false;
    }
  }

  async testConnection(accessToken: string): Promise<ConnectionInfo> {
    try {
      const response = await axios.get(`${this.baseUrl}/me`, {
        params: {
          fields: 'id,name,picture',
          access_token: accessToken,
        },
      });

      return {
        isValid: true,
        tokenExpired: false,
        accountInfo: {
          externalId: response.data.id,
          username: response.data.id,
          displayName: response.data.name,
          avatarUrl: response.data.picture?.data?.url,
          isVerified: false,
        },
        permissions: ['pages_read_engagement', 'pages_manage_posts'],
      };
    } catch (error: any) {
      return {
        isValid: false,
        tokenExpired: error.message?.includes('token') || error.response?.status === 401,
        permissions: [],
      };
    }
  }

  getPlatformLimits(): PlatformLimits {
    return {
      contentLimits: {
        maxTextLength: 63206,
        maxHashtags: 30,
        maxMentions: 50,
        maxLinks: 10,
        supportsMarkdown: false,
        supportsHtml: false,
      },
      mediaLimits: {
        maxImages: 10,
        maxVideos: 1,
        maxImageSizeBytes: 10 * 1024 * 1024, // 10 MB
        maxVideoSizeBytes: 4 * 1024 * 1024 * 1024, // 4 GB
        supportedImageFormats: ['jpg', 'jpeg', 'png', 'gif', 'bmp'],
        supportedVideoFormats: ['mp4', 'mov'],
        recommendedImageDimensions: {
          minWidth: 600,
          minHeight: 315,
          maxWidth: 1200,
          maxHeight: 630,
          aspectRatio: '1.91:1',
        },
      },
      postingLimits: {
        postsPerHour: 25,
        postsPerDay: 200,
        minIntervalSeconds: 30,
        supportsScheduling: true,
        supportsEditing: true,
        editTimeLimitMinutes: 60,
      },
    };
  }
}


