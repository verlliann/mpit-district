import { VK } from 'vk-io';
import { BasePlatformBot } from './base.bot';
import { Platform, PublishingJob, PublishResult } from '../queue/types';
import { logger } from '../utils/logger';
import { withRetry } from '../utils/retry';

export class VKPlatformBot extends BasePlatformBot {
  readonly platform = Platform.VK;
  private clients: Map<string, VK> = new Map();

  private getClient(accessToken: string): VK {
    if (!this.clients.has(accessToken)) {
      this.clients.set(accessToken, new VK({ token: accessToken }));
    }
    return this.clients.get(accessToken)!;
  }

  async publish(job: PublishingJob): Promise<PublishResult> {
    try {
      const vk = this.getClient(job.accessToken);
      const ownerId = job.options?.platformSpecific?.ownerId || job.socialAccountId;

      if (!ownerId) {
        throw new Error('Owner ID is required for VK');
      }

      logger.info({ postId: job.postId, ownerId }, 'Publishing to VK');

      // Upload photos if present
      let attachments: string[] = [];
      const images = job.imageUrls ?? [];
      
      if (images.length > 0) {
        const uploadedPhotos = await withRetry(async () => {
          const photos = [];
          
          for (const imageUrl of images) {
            const upload = await vk.upload.wallPhoto({
              source: {
                value: imageUrl,
              },
              group_id: ownerId.startsWith('-') ? parseInt(ownerId.substring(1)) : undefined,
            });
            
            photos.push(`photo${upload.ownerId}_${upload.id}`);
          }
          
          return photos;
        });
        
        attachments = uploadedPhotos;
      }

      // Publish post
      const result = await withRetry(async () => {
        return await vk.api.wall.post({
          owner_id: parseInt(ownerId),
          message: job.content,
          attachments: attachments.join(','),
          from_group: ownerId.startsWith('-') ? 1 : undefined,
          close_comments: job.options?.disableComments ? 1 : 0,
        });
      });

      const postUrl = `https://vk.com/wall${ownerId}_${result.post_id}`;

      return {
        success: true,
        externalId: `${ownerId}_${result.post_id}`,
        externalUrl: postUrl,
        publishedAt: new Date(),
      };
    } catch (error: any) {
      logger.error({ error, postId: job.postId }, 'VK publish failed');
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

      const vk = this.getClient(accessToken);
      const [ownerId, postId] = externalId.split('_');

      if (!ownerId || !postId) {
        throw new Error('Invalid external ID format. Expected: ownerId_postId');
      }

      // Upload new photos if provided
      let attachments: string[] = [];
      
      if (imageUrls && imageUrls.length > 0) {
        const uploadedPhotos = await withRetry(async () => {
          const photos = [];
          
          for (const imageUrl of imageUrls) {
            const upload = await vk.upload.wallPhoto({
              source: {
                value: imageUrl,
              },
              group_id: ownerId.startsWith('-') ? parseInt(ownerId.substring(1)) : undefined,
            });
            
            photos.push(`photo${upload.ownerId}_${upload.id}`);
          }
          
          return photos;
        });
        
        attachments = uploadedPhotos;
      }

      await withRetry(async () => {
        await vk.api.wall.edit({
          owner_id: parseInt(ownerId),
          post_id: parseInt(postId),
          message: content,
          attachments: attachments.length > 0 ? attachments.join(',') : undefined,
        });
      });

      return {
        success: true,
        externalId,
      };
    } catch (error: any) {
      logger.error({ error, externalId }, 'VK update failed');
      return this.handleError(error, 'update');
    }
  }

  async delete(externalId: string, accessToken?: string): Promise<boolean> {
    try {
      if (!accessToken) {
        throw new Error('Access token is required');
      }

      const vk = this.getClient(accessToken);
      const [ownerId, postId] = externalId.split('_');

      if (!ownerId || !postId) {
        throw new Error('Invalid external ID format');
      }

      await withRetry(async () => {
        await vk.api.wall.delete({
          owner_id: parseInt(ownerId),
          post_id: parseInt(postId),
        });
      });

      return true;
    } catch (error: any) {
      logger.error({ error, externalId }, 'VK delete failed');
      return false;
    }
  }

  async testConnection(accessToken: string): Promise<{
    isValid: boolean;
    error?: string;
    accountInfo?: any;
  }> {
    try {
      const vk = this.getClient(accessToken);
      const [user] = await vk.api.users.get({});

      return {
        isValid: true,
        accountInfo: {
          id: user.id,
          firstName: user.first_name,
          lastName: user.last_name,
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
      maxTextLength: 16384, // ~16k characters for wall posts
      maxImages: 10,
      maxVideos: 10,
      supportsEditing: true,
      supportsScheduling: true,
    };
  }
}


