import fs from 'fs';
import path from 'path';
import { BasePlatformBot } from './base.bot';
import { Platform, PublishingJob, PublishResult } from '../queue/types';
import { logger } from '../utils/logger';

type ZenPost = {
  id: string;
  title: string;
  summary: string;
  link: string;
  image?: string;
  publishedAt: string; // ISO
};

/**
 * Yandex Zen через RSS:
 * - Дописываем пост в zen/posts.json
 * - Пересобираем zen/zen-feed.xml
 * Это поддерживает публикацию в Дзен через импорт RSS.
 */
export class YandexZenPlatformBot extends BasePlatformBot {
  readonly platform = Platform.YANDEX_ZEN;

  private readonly maxItems =
    parseInt(process.env.ZEN_FEED_MAX_ITEMS || '50', 10) || 50;
  private readonly feedTitle =
    process.env.ZEN_FEED_TITLE || 'Telegram → Яндекс Дзен';
  private readonly feedLink =
    process.env.ZEN_FEED_LINK || 'https://t.me/your_channel';
  private readonly feedDescription =
    process.env.ZEN_FEED_DESCRIPTION ||
    'Автогенерация RSS для Яндекс Дзен из Telegram.';
  private readonly feedLanguage = process.env.ZEN_FEED_LANGUAGE || 'ru-RU';

  private getPaths() {
    // dist/bots -> dist/zen
    const base = path.resolve(__dirname, '..', 'zen');
    return {
      postsPath: path.join(base, 'posts.json'),
      feedPath: path.join(base, 'zen-feed.xml'),
    };
  }

  private ensureDir() {
    const base = path.resolve(__dirname, '..', 'zen');
    if (!fs.existsSync(base)) {
      fs.mkdirSync(base, { recursive: true });
    }
  }

  private escapeXml(str = '') {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }

  private rssDate(iso: string) {
    return new Date(iso).toUTCString();
  }

  private loadPosts(postsPath: string): ZenPost[] {
    if (!fs.existsSync(postsPath)) return [];
    try {
      const raw = fs.readFileSync(postsPath, 'utf8');
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];
      return parsed.filter(
        (p) => p && p.id && p.title && p.link && p.publishedAt
      );
    } catch {
      return [];
    }
  }

  private buildItem(p: ZenPost): string {
    const enclosure = p.image
    ? `<enclosure url="${this.escapeXml(p.image)}" type="image/jpeg"/>`
    : '';
    return `
  <item>
    <title>${this.escapeXml(p.title)}</title>
    <link>${this.escapeXml(p.link)}</link>
    <description>${this.escapeXml(p.summary || '')}</description>
    <guid isPermaLink="false">${this.escapeXml(p.id)}</guid>
    <pubDate>${this.rssDate(p.publishedAt)}</pubDate>
    ${enclosure}
  </item>`;
  }

  private buildFeed(posts: ZenPost[]): string {
    const items = posts.map((p) => this.buildItem(p)).join('\n');
    return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
<channel>
  <title>${this.escapeXml(this.feedTitle)}</title>
  <link>${this.escapeXml(this.feedLink)}</link>
  <description>${this.escapeXml(this.feedDescription)}</description>
  <language>${this.escapeXml(this.feedLanguage)}</language>
${items}
</channel>
</rss>`;
  }

  private truncate(str: string, max: number) {
    if (!str) return '';
    if (str.length <= max) return str;
    return str.slice(0, max - 1).trimEnd() + '…';
  }

  private deriveFields(job: PublishingJob): ZenPost {
    const content = job.content || '';
    const lines = content.split('\n').map((l) => l.trim()).filter(Boolean);
    const title = this.truncate(lines[0] || content, 120);
    const summary = this.truncate(content, 800);

    // Пытаемся составить ссылку: предпочтительно linkPreviewUrl, иначе platformSpecific.link
    const link =
      job.options?.linkPreviewUrl ||
      job.options?.platformSpecific?.link ||
      `https://t.me/${job.socialAccountId}/${job.postId}`;

    const image = job.imageUrls && job.imageUrls.length > 0 ? job.imageUrls[0] : undefined;

    return {
      id: job.postId,
      title,
      summary,
      link,
      image,
      publishedAt: new Date().toISOString(),
    };
  }

  private saveFeed(posts: ZenPost[]) {
    const { feedPath } = this.getPaths();
    const xml = this.buildFeed(posts);
    fs.writeFileSync(feedPath, xml, 'utf8');
  }

  private savePosts(posts: ZenPost[]) {
    const { postsPath } = this.getPaths();
    fs.writeFileSync(postsPath, JSON.stringify(posts, null, 2), 'utf8');
  }

  async publish(job: PublishingJob): Promise<PublishResult> {
    try {
      this.ensureDir();
      const { postsPath } = this.getPaths();

      const posts = this.loadPosts(postsPath);
      const newPost = this.deriveFields(job);

      const updated = [newPost, ...posts]
        // remove duplicates by id
        .filter(
          (p, idx, arr) => idx === arr.findIndex((q) => q.id === p.id)
        )
        .slice(0, this.maxItems);

      this.savePosts(updated);
      this.saveFeed(updated);

      const feedUrl =
        process.env.ZEN_FEED_URL ||
        'https://your-host/zen/zen-feed.xml'; // подсказка для пользователя

      logger.info(
        { postId: job.postId, feedUrl },
        'Yandex Zen RSS updated'
      );

      return {
        success: true,
        externalId: newPost.id,
        externalUrl: feedUrl,
        publishedAt: new Date(newPost.publishedAt),
      };
    } catch (error: any) {
      logger.error({ error, postId: job.postId }, 'Yandex Zen publish failed');
      return this.handleError(error, 'publish');
    }
  }

  async update(): Promise<PublishResult> {
    return {
      success: false,
      error: 'Редактирование в Яндекс Дзен через RSS не поддерживается',
      errorCode: 'NOT_SUPPORTED',
    };
  }

  async delete(): Promise<boolean> {
    // Не реализуем удаление, так как RSS — поток только на добавление
    return false;
  }

  async testConnection(): Promise<{
    isValid: boolean;
    error?: string;
    accountInfo?: any;
  }> {
    const { feedPath } = this.getPaths();
    const exists = fs.existsSync(feedPath);
    return {
      isValid: exists,
      error: exists ? undefined : 'Файл RSS ещё не сгенерирован (запустите публикацию или rss:build)',
      accountInfo: {
        feedPath,
        feedUrl: process.env.ZEN_FEED_URL || 'https://your-host/zen/zen-feed.xml',
      },
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


