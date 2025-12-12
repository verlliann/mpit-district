import { BasePlatformBot } from './base.bot';
import { Platform, PublishingJob, PublishResult } from '../queue/types';
import { logger } from '../utils/logger';

/**
 * Yandex Zen бот (заглушка).
 * У Яндекс Дзен нет открытого публичного API для прямой публикации.
 * Реализация возвращает осмысленную ошибку.
 */
export class YandexZenPlatformBot extends BasePlatformBot {
  readonly platform = Platform.YANDEX_ZEN;

  async publish(job: PublishingJob): Promise<PublishResult> {
    logger.warn({ postId: job.postId }, 'Yandex Zen publish not supported (no public API)');
    return {
      success: false,
      error: 'Yandex Zen API недоступен: используйте RSS/фид импорта или браузерную автоматизацию',
      errorCode: 'NOT_SUPPORTED',
    };
  }

  async update(): Promise<PublishResult> {
    return {
      success: false,
      error: 'Редактирование в Яндекс Дзен не поддерживается',
      errorCode: 'NOT_SUPPORTED',
    };
  }

  async delete(): Promise<boolean> {
    return false;
  }

  async testConnection(): Promise<{
    isValid: boolean;
    error?: string;
    accountInfo?: any;
  }> {
    return {
      isValid: false,
      error: 'Yandex Zen API недоступен',
    };
  }

  getPlatformLimits() {
    return {
      maxTextLength: 10000,
      maxImages: 10,
      maxVideos: 0,
      supportsEditing: false,
      supportsScheduling: false,
    };
  }
}


