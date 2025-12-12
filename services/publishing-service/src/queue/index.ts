import { Queue, Worker, QueueEvents } from 'bullmq';
import IORedis from 'ioredis';
import { config } from '../config';
import { logger } from '../utils/logger';
import { PublishingJob } from './types';
import { processPublishingJob } from './processors/publishing.processor';

let publishingQueue: Queue<PublishingJob>;
let redisConnection: IORedis;

export function getRedisConnection(): IORedis {
  if (!redisConnection) {
    redisConnection = new IORedis({
      host: config.redis.host,
      port: config.redis.port,
      password: config.redis.password,
      db: config.redis.db,
      maxRetriesPerRequest: null,
    });
  }
  return redisConnection;
}

export async function initializeQueue(): Promise<void> {
  const connection = getRedisConnection();

  // Publishing Queue
  publishingQueue = new Queue<PublishingJob>('publishing', {
    connection,
    defaultJobOptions: {
      attempts: config.retry.maxAttempts,
      backoff: {
        type: 'exponential',
        delay: config.retry.delayMs,
      },
      removeOnComplete: 100,
      removeOnFail: 500,
    },
  });

  // Publishing Worker
  new Worker<PublishingJob>(
    'publishing',
    async (job) => {
      logger.info({ jobId: job.id, data: job.data }, 'Processing publishing job');
      return await processPublishingJob(job);
    },
    {
      connection,
      concurrency: 5,
    }
  );

  // Publishing Queue Events
  const publishingQueueEvents = new QueueEvents('publishing', { connection });
  
  publishingQueueEvents.on('completed', ({ jobId }) => {
    logger.info({ jobId }, 'Publishing job completed');
  });

  publishingQueueEvents.on('failed', ({ jobId, failedReason }) => {
    logger.error({ jobId, failedReason }, 'Publishing job failed');
  });

  logger.info('Queues initialized successfully');
}

export function getPublishingQueue(): Queue<PublishingJob> {
  return publishingQueue;
}
