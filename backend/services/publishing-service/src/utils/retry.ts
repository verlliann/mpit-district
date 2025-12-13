import { config } from '../config';
import { logger } from './logger';

export interface RetryOptions {
  maxAttempts?: number;
  delayMs?: number;
  backoffMultiplier?: number;
  onRetry?: (error: Error, attempt: number) => void;
}

export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxAttempts = config.retry.maxAttempts,
    delayMs = config.retry.delayMs,
    backoffMultiplier = config.retry.backoffMultiplier,
    onRetry,
  } = options;

  let lastError: Error;
  let currentDelay = delayMs;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      if (attempt === maxAttempts) {
        break;
      }

      logger.warn(
        { error, attempt, maxAttempts, delay: currentDelay },
        'Retrying operation'
      );

      if (onRetry) {
        onRetry(lastError, attempt);
      }

      await sleep(currentDelay);
      currentDelay *= backoffMultiplier;
    }
  }

  throw lastError!;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}


