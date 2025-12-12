import { Job } from 'bullmq';
import { PublishingJob, PublishResult } from '../types';
import { botFactory } from '../../bots';
import { logger } from '../../utils/logger';

export async function processPublishingJob(
  job: Job<PublishingJob>
): Promise<PublishResult> {
  const { postId, platform, content } = job.data;

  logger.info(
    { jobId: job.id, postId, platform },
    'Processing publishing job'
  );

  try {
    // Get the appropriate bot for the platform
    const bot = botFactory.getBot(platform);

    // Publish the post
    const result = await bot.publish(job.data);

    if (result.success) {
      logger.info(
        {
          jobId: job.id,
          postId,
          platform,
          externalId: result.externalId,
        },
        'Post published successfully'
      );
    } else {
      logger.error(
        {
          jobId: job.id,
          postId,
          platform,
          error: result.error,
          errorCode: result.errorCode,
        },
        'Post publishing failed'
      );
    }

    return result;
  } catch (error: any) {
    logger.error(
      {
        error,
        jobId: job.id,
        postId,
        platform,
      },
      'Unexpected error during publishing'
    );

    return {
      success: false,
      error: error.message || 'Unknown error occurred',
      errorCode: 'UNKNOWN_ERROR',
    };
  }
}


