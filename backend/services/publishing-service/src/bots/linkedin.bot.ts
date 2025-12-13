import axios from 'axios';
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

export class LinkedInPlatformBot extends BasePlatformBot {
  readonly platform = Platform.LINKEDIN;
  private readonly baseUrl = 'https://api.linkedin.com/v2';

  async publish(job: PublishingJob): Promise<PublishResult> {
    try {
      const authorId = job.options?.platformSpecific?.authorId || job.socialAccountId;

      if (!authorId) {
        throw new Error('LinkedIn author ID (person or organization URN) is required');
      }

      logger.info({ postId: job.postId, authorId }, 'Publishing to LinkedIn');

      // Prepare the post content
      const shareData: any = {
        author: authorId,
        lifecycleState: 'PUBLISHED',
        specificContent: {
          'com.linkedin.ugc.ShareContent': {
            shareCommentary: {
              text: job.content,
            },
            shareMediaCategory: job.imageUrls?.length ? 'IMAGE' : 'NONE',
          },
        },
        visibility: {
          'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC',
        },
      };

      // If images are provided, upload them first
      if (job.imageUrls && job.imageUrls.length > 0) {
        const mediaAssets = await Promise.all(
          job.imageUrls.map(async (imageUrl) => {
            // Register upload
            const registerResponse = await axios.post(
              `${this.baseUrl}/assets?action=registerUpload`,
              {
                registerUploadRequest: {
                  recipes: ['urn:li:digitalmediaRecipe:feedshare-image'],
                  owner: authorId,
                  serviceRelationships: [
                    {
                      relationshipType: 'OWNER',
                      identifier: 'urn:li:userGeneratedContent',
                    },
                  ],
                },
              },
              {
                headers: {
                  Authorization: `Bearer ${job.accessToken}`,
                  'Content-Type': 'application/json',
                },
              }
            );

            const asset = registerResponse.data.value.asset;
            const uploadUrl =
              registerResponse.data.value.uploadMechanism[
                'com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest'
              ].uploadUrl;

            // Download and upload image
            const imageBuffer = await this.downloadImage(imageUrl);
            await axios.put(uploadUrl, imageBuffer, {
              headers: {
                Authorization: `Bearer ${job.accessToken}`,
                'Content-Type': 'application/octet-stream',
              },
            });

            return {
              status: 'READY',
              media: asset,
            };
          })
        );

        shareData.specificContent['com.linkedin.ugc.ShareContent'].media = mediaAssets;
      }

      const result = await withRetry(async () => {
        const response = await axios.post(`${this.baseUrl}/ugcPosts`, shareData, {
          headers: {
            Authorization: `Bearer ${job.accessToken}`,
            'Content-Type': 'application/json',
            'X-Restli-Protocol-Version': '2.0.0',
          },
        });
        return response.data;
      });

      const postId = result.id;
      const postUrl = `https://www.linkedin.com/feed/update/${postId}/`;

      return {
        success: true,
        externalId: postId,
        externalUrl: postUrl,
        publishedAt: new Date(),
      };
    } catch (error: any) {
      logger.error({ error, postId: job.postId }, 'LinkedIn publish failed');
      return this.handleError(error, 'publish');
    }
  }

  async update(
    externalId: string,
    content: string,
    imageUrls?: string[],
    accessToken?: string
  ): Promise<PublishResult> {
    // LinkedIn doesn't support editing posts via API
    return {
      success: false,
      error: 'LinkedIn does not support editing posts via API',
      errorCode: 'NOT_SUPPORTED',
    };
  }

  async delete(externalId: string, accessToken?: string): Promise<boolean> {
    try {
      if (!accessToken) {
        throw new Error('Access token is required');
      }

      await withRetry(async () => {
        await axios.delete(`${this.baseUrl}/ugcPosts/${externalId}`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
      });

      return true;
    } catch (error: any) {
      logger.error({ error, externalId }, 'LinkedIn delete failed');
      return false;
    }
  }

  async testConnection(accessToken: string): Promise<ConnectionInfo> {
    try {
      const response = await axios.get(`${this.baseUrl}/me`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      return {
        isValid: true,
        tokenExpired: false,
        accountInfo: {
          externalId: response.data.id,
          username: response.data.id,
          displayName: `${response.data.localizedFirstName} ${response.data.localizedLastName}`,
          isVerified: false,
        },
        permissions: ['w_member_social', 'r_basicprofile'],
      };
    } catch (error: any) {
      return {
        isValid: false,
        tokenExpired: error.response?.status === 401,
        permissions: [],
      };
    }
  }

  getPlatformLimits(): PlatformLimits {
    return {
      contentLimits: {
        maxTextLength: 3000,
        maxHashtags: 3,
        maxMentions: 10,
        maxLinks: 5,
        supportsMarkdown: false,
        supportsHtml: false,
      },
      mediaLimits: {
        maxImages: 9,
        maxVideos: 1,
        maxImageSizeBytes: 10 * 1024 * 1024, // 10 MB
        maxVideoSizeBytes: 5 * 1024 * 1024 * 1024, // 5 GB
        supportedImageFormats: ['jpg', 'jpeg', 'png', 'gif'],
        supportedVideoFormats: ['mp4', 'mov', 'avi'],
        recommendedImageDimensions: {
          minWidth: 552,
          minHeight: 276,
          maxWidth: 1200,
          maxHeight: 627,
          aspectRatio: '1.91:1',
        },
      },
      postingLimits: {
        postsPerHour: 25,
        postsPerDay: 100,
        minIntervalSeconds: 30,
        supportsScheduling: false,
        supportsEditing: false,
        editTimeLimitMinutes: 0,
      },
    };
  }
}


