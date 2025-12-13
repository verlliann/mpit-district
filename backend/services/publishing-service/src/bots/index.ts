import { IPlatformBot } from './base.bot';
import { TelegramPlatformBot } from './telegram.bot';
import { VKPlatformBot } from './vk.bot';
import { InstagramPlatformBot } from './instagram.bot';
import { FacebookPlatformBot } from './facebook.bot';
import { LinkedInPlatformBot } from './linkedin.bot';
import { TwitterPlatformBot } from './twitter.bot';
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
  }

  getBot(platform: Platform | string): IPlatformBot {
    // Маппинг из proto формата в наш enum
    const platformMap: Record<string, Platform> = {
      'PLATFORM_TELEGRAM': Platform.TELEGRAM,
      'PLATFORM_VK': Platform.VK,
      'PLATFORM_INSTAGRAM': Platform.INSTAGRAM,
      'PLATFORM_FACEBOOK': Platform.FACEBOOK,
      'PLATFORM_LINKEDIN': Platform.LINKEDIN,
      'PLATFORM_TWITTER': Platform.TWITTER,
      'TELEGRAM': Platform.TELEGRAM,
      'VK': Platform.VK,
      'INSTAGRAM': Platform.INSTAGRAM,
      'FACEBOOK': Platform.FACEBOOK,
      'LINKEDIN': Platform.LINKEDIN,
      'TWITTER': Platform.TWITTER,
      '1': Platform.TELEGRAM,
      '2': Platform.VK,
      '3': Platform.INSTAGRAM,
      '4': Platform.LINKEDIN,
      '5': Platform.TWITTER,
      '6': Platform.FACEBOOK,
    };
    
    const mappedPlatform = platformMap[String(platform)] || platform as Platform;
    const bot = this.bots.get(mappedPlatform);
    
    if (!bot) {
      throw new Error(`Bot not found for platform: ${platform} (mapped: ${mappedPlatform})`);
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
};


