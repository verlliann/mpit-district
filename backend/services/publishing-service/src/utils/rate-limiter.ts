import Redis from 'ioredis';
import { config } from '../config';
import { logger } from './logger';

export class RateLimiter {
  private redis: Redis;
  private keyPrefix: string = 'rate_limit:';

  constructor(redis: Redis) {
    this.redis = redis;
  }

  async checkLimit(
    key: string,
    maxRequests: number = config.rateLimit.maxRequests,
    windowMs: number = config.rateLimit.windowMs
  ): Promise<{ allowed: boolean; remaining: number; resetAt: Date }> {
    const redisKey = `${this.keyPrefix}${key}`;
    const now = Date.now();
    const windowStart = now - windowMs;

    try {
      // Remove old entries
      await this.redis.zremrangebyscore(redisKey, 0, windowStart);

      // Count current requests
      const currentCount = await this.redis.zcard(redisKey);

      if (currentCount >= maxRequests) {
        const oldestEntry = await this.redis.zrange(redisKey, 0, 0, 'WITHSCORES');
        const resetAt = new Date(parseInt(oldestEntry[1]) + windowMs);

        return {
          allowed: false,
          remaining: 0,
          resetAt,
        };
      }

      // Add current request
      await this.redis.zadd(redisKey, now, `${now}:${Math.random()}`);
      await this.redis.pexpire(redisKey, windowMs);

      return {
        allowed: true,
        remaining: maxRequests - currentCount - 1,
        resetAt: new Date(now + windowMs),
      };
    } catch (error) {
      logger.error({ error, key }, 'Rate limit check failed');
      // Fail open in case of Redis error
      return {
        allowed: true,
        remaining: maxRequests,
        resetAt: new Date(now + windowMs),
      };
    }
  }

  async reset(key: string): Promise<void> {
    const redisKey = `${this.keyPrefix}${key}`;
    await this.redis.del(redisKey);
  }
}


