import axios from 'axios';
import FormData from 'form-data';
import { BasePlatformBot } from './base.bot';
import { Platform, PublishingJob, PublishResult } from '../queue/types';
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

  async testConnection(accessToken: string): Promise<{
    isValid: boolean;
    error?: string;
    accountInfo?: any;
  }> {
    try {
      const response = await axios.get(`${this.baseUrl}/me`, {
        params: {
          fields: 'id,name,picture',
          access_token: accessToken,
        },
      });

      return {
        isValid: true,
        accountInfo: {
          id: response.data.id,
          name: response.data.name,
          picture: response.data.picture?.data?.url,
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
      maxTextLength: 63206,
      maxImages: 10,
      maxVideos: 1,
      supportsEditing: true,
      supportsScheduling: true,
    };
  }
}


