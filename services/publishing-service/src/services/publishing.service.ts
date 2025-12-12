import { sendUnaryData, ServerUnaryCall } from '@grpc/grpc-js';
import { getPublishingQueue } from '../queue';
import { botFactory } from '../bots';
import { logger } from '../utils/logger';
import { Platform, PublishingJob } from '../queue/types';

export class PublishingServiceImpl {
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

      const job: PublishingJob = {
        postId: request.post_id,
        socialAccountId: request.social_account_id,
        platform: request.platform as Platform,
        content: request.content,
        imageUrls: request.image_urls || [],
        videoUrls: request.video_urls || [],
        options: request.options,
        accessToken: request.social_account_id, // This should be fetched from storage
      };

      // Add to queue
      const queueJob = await getPublishingQueue().add(
        `publish-${request.post_id}`,
        job,
        {
          attempts: 3,
        }
      );

      // Wait for job completion (with timeout)
      const result = await queueJob.waitUntilFinished(
        getPublishingQueue().events,
        30000 // 30 seconds timeout
      );

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
                seconds: Math.floor(result.publishedAt!.getTime() / 1000),
              },
              platform: request.platform,
            }
          : undefined,
        metadata: {
          attempt_number: queueJob.attemptsMade,
          processing_time_ms: Date.now() - queueJob.timestamp,
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
            getPublishingQueue().events,
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
        platform_supports_edit: limits.supportsEditing,
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
      const result = await bot.testConnection(request.access_token);

      callback(null, {
        success: result.isValid,
        error: result.error || '',
        connection_info: result.isValid
          ? {
              is_valid: true,
              token_expired: false,
              account_info: result.accountInfo,
              permissions: [],
            }
          : undefined,
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
    try {
      const request = call.request;

      const bot = botFactory.getBot(request.platform as Platform);
      const limits = bot.getPlatformLimits();

      callback(null, {
        platform: request.platform,
        content_limits: {
          max_text_length: limits.maxTextLength,
          max_hashtags: 30,
          max_mentions: 10,
          max_links: 5,
          supports_markdown: false,
          supports_html: false,
        },
        media_limits: {
          max_images: limits.maxImages,
          max_videos: limits.maxVideos,
          max_image_size_bytes: 10 * 1024 * 1024, // 10MB
          max_video_size_bytes: 100 * 1024 * 1024, // 100MB
          supported_image_formats: ['jpg', 'jpeg', 'png', 'gif'],
          supported_video_formats: ['mp4', 'mov'],
        },
        posting_limits: {
          posts_per_hour: 20,
          posts_per_day: 100,
          min_interval_seconds: 30,
          supports_scheduling: limits.supportsScheduling,
          supports_editing: limits.supportsEditing,
          edit_time_limit_minutes: 60,
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


