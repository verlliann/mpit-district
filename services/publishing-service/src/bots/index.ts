import { IPlatformBot } from './base.bot';
import { TelegramPlatformBot } from './telegram.bot';
import { VKPlatformBot } from './vk.bot';
import { InstagramPlatformBot } from './instagram.bot';
import { FacebookPlatformBot } from './facebook.bot';
import { LinkedInPlatformBot } from './linkedin.bot';
import { TwitterPlatformBot } from './twitter.bot';
import { YandexZenPlatformBot } from './yandexzen.bot';
import { Platform } from '../queue/types';

class BotFactory {
  private bots: Map<Platform, IPlatformBot> = new Map();

  constructor() {
    // Initialize all bots
    this.bots.set(Platform.TELEGRAM, new TelegramPlatformBot());
    this.bots.set(Platform.VK, new VKPlatformBot());
    this.bots.set(Platform.INSTAGRAM, new InstagramPlatformBot());
    this.bots.set(Platform.FACEBOOK, new FacebookPlatformBot());
    this.bots.set(Platform.LINKEDIN, new LinkedInPlatformBot());
    this.bots.set(Platform.TWITTER, new TwitterPlatformBot());
    this.bots.set(Platform.YANDEX_ZEN, new YandexZenPlatformBot());
  }

  getBot(platform: Platform): IPlatformBot {
    const bot = this.bots.get(platform);
    
    if (!bot) {
      throw new Error(`Bot not found for platform: ${platform}`);
    }
    
    return bot;
  }

  getAllBots(): IPlatformBot[] {
    return Array.from(this.bots.values());
  }

  getSupportedPlatforms(): Platform[] {
    return Array.from(this.bots.keys());
  }
}

// Singleton instance
export const botFactory = new BotFactory();

export {
  IPlatformBot,
  TelegramPlatformBot,
  VKPlatformBot,
  InstagramPlatformBot,
  FacebookPlatformBot,
  LinkedInPlatformBot,
  TwitterPlatformBot,
  YandexZenPlatformBot,
};


