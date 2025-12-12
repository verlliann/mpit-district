import TelegramBot from 'node-telegram-bot-api';
import { BasePlatformBot } from './base.bot';
import { Platform, PublishingJob, PublishResult } from '../queue/types';
import { logger } from '../utils/logger';
import { withRetry } from '../utils/retry';

export class TelegramPlatformBot extends BasePlatformBot {
  readonly platform = Platform.TELEGRAM;
  private bots: Map<string, TelegramBot> = new Map();

  private getBot(accessToken: string): TelegramBot {
    if (!this.bots.has(accessToken)) {
      this.bots.set(accessToken, new TelegramBot(accessToken, { polling: false }));
    }
    return this.bots.get(accessToken)!;
  }

  async publish(job: PublishingJob): Promise<PublishResult> {
    try {
      const bot = this.getBot(job.accessToken);
      const chatId = job.options?.platformSpecific?.chatId || job.socialAccountId;

      if (!chatId) {
        throw new Error('Chat ID is required for Telegram');
      }

      logger.info({ postId: job.postId, chatId }, 'Publishing to Telegram');

      const result = await withRetry(async () => {
        // If has images, send as photo with caption
        if (job.imageUrls && job.imageUrls.length > 0) {
          if (job.imageUrls.length === 1) {
            // Single photo
            return await bot.sendPhoto(chatId, job.imageUrls[0], {
              caption: job.content,
              parse_mode: 'HTML',
              disable_notification: job.options?.disableNotifications,
            });
          } else {
            // Media group
            const media = job.imageUrls.map((url, index) => ({
              type: 'photo' as const,
              media: url,
              caption: index === 0 ? job.content : undefined,
              parse_mode: 'HTML' as const,
            }));
            
            const messages = await bot.sendMediaGroup(chatId, media, {
              disable_notification: job.options?.disableNotifications,
            });
            return messages[0];
          }
        } else {
          // Text only
          return await bot.sendMessage(chatId, job.content, {
            parse_mode: 'HTML',
            disable_notification: job.options?.disableNotifications,
            disable_web_page_preview: !job.options?.linkPreviewUrl,
          });
        }
      });

      const messageUrl = `https://t.me/${chatId.replace('@', '')}/${result.message_id}`;

      return {
        success: true,
        externalId: result.message_id.toString(),
        externalUrl: messageUrl,
        publishedAt: new Date(result.date * 1000),
      };
    } catch (error: any) {
      logger.error({ error, postId: job.postId }, 'Telegram publish failed');
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

      const bot = this.getBot(accessToken);
      const [chatId, messageId] = externalId.split(':');

      if (!chatId || !messageId) {
        throw new Error('Invalid external ID format. Expected: chatId:messageId');
      }

      await withRetry(async () => {
        await bot.editMessageText(content, {
          chat_id: chatId,
          message_id: parseInt(messageId),
          parse_mode: 'HTML',
        });
      });

      return {
        success: true,
        externalId,
      };
    } catch (error: any) {
      logger.error({ error, externalId }, 'Telegram update failed');
      return this.handleError(error, 'update');
    }
  }

  async delete(externalId: string, accessToken?: string): Promise<boolean> {
    try {
      if (!accessToken) {
        throw new Error('Access token is required');
      }

      const bot = this.getBot(accessToken);
      const [chatId, messageId] = externalId.split(':');

      if (!chatId || !messageId) {
        throw new Error('Invalid external ID format');
      }

      await withRetry(async () => {
        await bot.deleteMessage(chatId, messageId);
      });

      return true;
    } catch (error: any) {
      logger.error({ error, externalId }, 'Telegram delete failed');
      return false;
    }
  }

  async testConnection(accessToken: string): Promise<{
    isValid: boolean;
    error?: string;
    accountInfo?: any;
  }> {
    try {
      const bot = this.getBot(accessToken);
      const me = await bot.getMe();

      return {
        isValid: true,
        accountInfo: {
          id: me.id,
          username: me.username,
          firstName: me.first_name,
          isBot: me.is_bot,
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
      maxTextLength: 4096,
      maxImages: 10,
      maxVideos: 1,
      supportsEditing: true,
      supportsScheduling: false, // Telegram Bot API doesn't support native scheduling
    };
  }
}


