import { sendUnaryData, ServerUnaryCall } from '@grpc/grpc-js';
import { getPublishingQueue } from '../queue';
import { botFactory } from '../bots';
import { logger } from '../utils/logger';
import { Platform, PublishingJob } from '../queue/types';

export class PublishingServiceImpl {
  [key: string]: any; // Index signature for gRPC compatibility

  // Health check
  async HealthCheck(
    call: ServerUnaryCall<any, any>,
    callback: sendUnaryData<any>
  ): Promise<void> {
    callback(null, {
      status: 'SERVING',
      timestamp: Date.now(),
    });
  }

  // Publish single post
  async PublishPost(
    call: ServerUnaryCall<any, any>,
    callback: sendUnaryData<any>
  ): Promise<void> {
    try {
      const request = call.request;
      
      logger.info({ postId: request.post_id }, 'Publishing post');

      // Нормализуем platform (убираем PLATFORM_ префикс)
      const normalizePlatform = (p: string): string => {
        return p.replace('PLATFORM_', '').toUpperCase();
      };
      
      const platform = normalizePlatform(request.platform);
      
      // Получаем токен из конфига по платформе
      const getAccessToken = (): string => {
        if (platform === 'TELEGRAM') return process.env.TELEGRAM_BOT_TOKEN || '';
        if (platform === 'VK') return process.env.VK_ACCESS_TOKEN || '';
        return '';
      };
      
      // Получаем chatId/groupId из конфига
      const getChatId = (): string => {
        if (platform === 'TELEGRAM') return process.env.TELEGRAM_DEFAULT_CHAT_ID || process.env.TELEGRAM_CHANNEL_ID || '';
        if (platform === 'VK') return process.env.VK_GROUP_ID || '';
        return request.social_account_id;
      };
      
      logger.info({ platform, token: getAccessToken() ? 'SET' : 'EMPTY', chatId: getChatId() }, 'Platform config');

      const job: PublishingJob = {
        postId: request.post_id,
        socialAccountId: getChatId(),
        platform: platform as Platform,
        content: request.content,
        imageUrls: request.image_urls || [],
        videoUrls: request.video_urls || [],
        options: {
          ...request.options,
          platformSpecific: {
            chatId: getChatId(),
          },
        },
        accessToken: getAccessToken(),
      };

      logger.info({ job }, 'Publishing job created, sending directly...');

      // Прямая отправка без очереди
      const bot = botFactory.getBot(platform as Platform);
      const result = await bot.publish(job);

      logger.info({ result }, 'Publish result');

      callback(null, {
        success: result.success,
        error: result.error || '',
        error_code: result.errorCode || '',
        post_info: result.success
          ? {
              post_id: request.post_id,
              external_id: result.externalId,
              external_url: result.externalUrl,
              published_at: {
                seconds: Math.floor((result.publishedAt || new Date()).getTime() / 1000),
              },
              platform: request.platform,
            }
          : undefined,
        metadata: {
          attempt_number: 1,
          processing_time_ms: 0,
          used_fallback: false,
          api_version: 'v1',
        },
      });
    } catch (error: any) {
      logger.error({ error }, 'PublishPost failed');
      callback(null, {
        success: false,
        error: error.message,
        error_code: 'INTERNAL_ERROR',
      });
    }
  }

  // Publish batch
  async PublishBatch(call: any): Promise<void> {
    try {
      const request = call.request;
      const posts = request.posts || [];

      logger.info({ count: posts.length }, 'Publishing batch');

      for (const postRequest of posts) {
        try {
          const job: PublishingJob = {
            postId: postRequest.post_id,
            socialAccountId: postRequest.social_account_id,
            platform: postRequest.platform as Platform,
            content: postRequest.content,
            imageUrls: postRequest.image_urls || [],
            videoUrls: postRequest.video_urls || [],
            options: postRequest.options,
            accessToken: postRequest.social_account_id,
          };

          const queueJob = await getPublishingQueue().add(
            `publish-${postRequest.post_id}`,
            job
          );

          const result = await queueJob.waitUntilFinished(
            (getPublishingQueue() as any).queueEvents || getPublishingQueue(),
            30000
          );

          call.write({
            success: result.success,
            error: result.error || '',
            error_code: result.errorCode || '',
            post_info: result.success
              ? {
                  post_id: postRequest.post_id,
                  external_id: result.externalId,
                  external_url: result.externalUrl,
                  published_at: {
                    seconds: Math.floor(result.publishedAt!.getTime() / 1000),
                  },
                  platform: postRequest.platform,
                }
              : undefined,
          });
        } catch (error: any) {
          logger.error({ error, postId: postRequest.post_id }, 'Batch publish failed for post');
          
          call.write({
            success: false,
            error: error.message,
            error_code: 'INTERNAL_ERROR',
          });

          if (!request.continue_on_error) {
            break;
          }
        }
      }

      call.end();
    } catch (error: any) {
      logger.error({ error }, 'PublishBatch failed');
      call.end();
    }
  }

  // Schedule post
  async SchedulePost(
    call: ServerUnaryCall<any, any>,
    callback: sendUnaryData<any>
  ): Promise<void> {
    try {
      const request = call.request;
      const publishRequest = request.publish_request;

      logger.info(
        { postId: request.post_id, scheduledAt: request.scheduled_at },
        'Scheduling post'
      );

      const job: PublishingJob = {
        postId: publishRequest.post_id,
        socialAccountId: publishRequest.social_account_id,
        platform: publishRequest.platform as Platform,
        content: publishRequest.content,
        imageUrls: publishRequest.image_urls || [],
        videoUrls: publishRequest.video_urls || [],
        options: publishRequest.options,
        accessToken: publishRequest.social_account_id,
        scheduledAt: new Date(request.scheduled_at.seconds * 1000).toISOString(),
      };

      // Schedule job with delay
      const scheduledTime = new Date(request.scheduled_at.seconds * 1000);
      const delay = scheduledTime.getTime() - Date.now();

      const queueJob = await getPublishingQueue().add(
        `scheduled-${request.post_id}`,
        job,
        {
          delay: Math.max(0, delay),
          jobId: request.post_id,
        }
      );

      callback(null, {
        success: true,
        error: '',
        job_id: queueJob.id,
        scheduled_at: request.scheduled_at,
      });
    } catch (error: any) {
      logger.error({ error }, 'SchedulePost failed');
      callback(null, {
        success: false,
        error: error.message,
        job_id: '',
      });
    }
  }

  // Cancel scheduled post
  async CancelScheduledPost(
    call: ServerUnaryCall<any, any>,
    callback: sendUnaryData<any>
  ): Promise<void> {
    try {
      const request = call.request;
      const jobId = request.job_id || request.post_id;

      logger.info({ jobId }, 'Canceling scheduled post');

      const job = await getPublishingQueue().getJob(jobId);

      if (!job) {
        throw new Error('Job not found');
      }

      await job.remove();

      callback(null, {
        success: true,
        message: 'Scheduled post canceled successfully',
      });
    } catch (error: any) {
      logger.error({ error }, 'CancelScheduledPost failed');
      callback(null, {
        success: false,
        message: error.message,
      });
    }
  }

  // Update published post
  async UpdatePublishedPost(
    call: ServerUnaryCall<any, any>,
    callback: sendUnaryData<any>
  ): Promise<void> {
    try {
      const request = call.request;

      logger.info(
        { postId: request.post_id, externalId: request.external_id },
        'Updating published post'
      );

      const bot = botFactory.getBot(request.platform as Platform);

      const result = await bot.update(
        request.external_id,
        request.new_content,
        request.new_image_urls || [],
        request.social_account_id
      );

      const limits = bot.getPlatformLimits();

      callback(null, {
        success: result.success,
        error: result.error || '',
        platform_supports_edit: limits.postingLimits.supportsEditing,
        updated_at: result.success
          ? {
              seconds: Math.floor(Date.now() / 1000),
            }
          : undefined,
      });
    } catch (error: any) {
      logger.error({ error }, 'UpdatePublishedPost failed');
      callback(null, {
        success: false,
        error: error.message,
        platform_supports_edit: false,
      });
    }
  }

  // Delete published post
  async DeletePublishedPost(
    call: ServerUnaryCall<any, any>,
    callback: sendUnaryData<any>
  ): Promise<void> {
    try {
      const request = call.request;

      logger.info(
        { postId: request.post_id, externalId: request.external_id },
        'Deleting published post'
      );

      const bot = botFactory.getBot(request.platform as Platform);

      const success = await bot.delete(
        request.external_id,
        request.social_account_id
      );

      callback(null, {
        success,
        message: success
          ? 'Post deleted successfully'
          : 'Failed to delete post',
      });
    } catch (error: any) {
      logger.error({ error }, 'DeletePublishedPost failed');
      callback(null, {
        success: false,
        message: error.message,
      });
    }
  }

  // Test platform connection
  async TestConnection(
    call: ServerUnaryCall<any, any>,
    callback: sendUnaryData<any>
  ): Promise<void> {
    try {
      const request = call.request;

      logger.info({ platform: request.platform }, 'Testing connection');

      const bot = botFactory.getBot(request.platform as Platform);
      const connectionInfo = await bot.testConnection(request.access_token);

      callback(null, {
        success: connectionInfo.isValid,
        error: '',
        connection_info: {
          is_valid: connectionInfo.isValid,
          token_expired: connectionInfo.tokenExpired,
          token_expires_at: connectionInfo.tokenExpiresAt 
            ? { seconds: Math.floor(connectionInfo.tokenExpiresAt.getTime() / 1000) }
            : undefined,
          account_info: connectionInfo.accountInfo
            ? {
                external_id: connectionInfo.accountInfo.externalId,
                username: connectionInfo.accountInfo.username,
                display_name: connectionInfo.accountInfo.displayName,
                avatar_url: connectionInfo.accountInfo.avatarUrl || '',
                followers_count: connectionInfo.accountInfo.followersCount || 0,
                is_verified: connectionInfo.accountInfo.isVerified,
              }
            : undefined,
          permissions: connectionInfo.permissions,
          rate_limit: connectionInfo.rateLimit
            ? {
                limit: connectionInfo.rateLimit.limit,
                remaining: connectionInfo.rateLimit.remaining,
                reset_at: { seconds: Math.floor(connectionInfo.rateLimit.resetAt.getTime() / 1000) },
              }
            : undefined,
        },
      });
    } catch (error: any) {
      logger.error({ error }, 'TestConnection failed');
      callback(null, {
        success: false,
        error: error.message,
      });
    }
  }

  // Get platform limits
  async GetPlatformLimits(
    call: ServerUnaryCall<any, any>,
    callback: sendUnaryData<any>
  ): Promise<void> {
    const request = call.request;
    try {
      const bot = botFactory.getBot(request.platform as Platform);
      const limits = bot.getPlatformLimits();

      callback(null, {
        platform: request.platform,
        content_limits: {
          max_text_length: limits.contentLimits.maxTextLength,
          max_hashtags: limits.contentLimits.maxHashtags,
          max_mentions: limits.contentLimits.maxMentions,
          max_links: limits.contentLimits.maxLinks,
          supports_markdown: limits.contentLimits.supportsMarkdown,
          supports_html: limits.contentLimits.supportsHtml,
        },
        media_limits: {
          max_images: limits.mediaLimits.maxImages,
          max_videos: limits.mediaLimits.maxVideos,
          max_image_size_bytes: limits.mediaLimits.maxImageSizeBytes,
          max_video_size_bytes: limits.mediaLimits.maxVideoSizeBytes,
          supported_image_formats: limits.mediaLimits.supportedImageFormats,
          supported_video_formats: limits.mediaLimits.supportedVideoFormats,
          recommended_image_dimensions: limits.mediaLimits.recommendedImageDimensions
            ? {
                min_width: limits.mediaLimits.recommendedImageDimensions.minWidth,
                min_height: limits.mediaLimits.recommendedImageDimensions.minHeight,
                max_width: limits.mediaLimits.recommendedImageDimensions.maxWidth,
                max_height: limits.mediaLimits.recommendedImageDimensions.maxHeight,
                aspect_ratio: limits.mediaLimits.recommendedImageDimensions.aspectRatio,
              }
            : undefined,
        },
        posting_limits: {
          posts_per_hour: limits.postingLimits.postsPerHour,
          posts_per_day: limits.postingLimits.postsPerDay,
          min_interval_seconds: limits.postingLimits.minIntervalSeconds,
          supports_scheduling: limits.postingLimits.supportsScheduling,
          supports_editing: limits.postingLimits.supportsEditing,
          edit_time_limit_minutes: limits.postingLimits.editTimeLimitMinutes,
        },
      });
    } catch (error: any) {
      logger.error({ error }, 'GetPlatformLimits failed');
      callback(null, {
        platform: request.platform,
        content_limits: {},
        media_limits: {},
        posting_limits: {},
      });
    }
  }
}


