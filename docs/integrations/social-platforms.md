# Интеграция с социальными платформами

## Обзор

Подробное руководство по интеграции с социальными сетями для публикации контента и сбора метрик.

---

## 1. Telegram Bot API

### 1.1 Подключение бота

#### Создание бота

1. Найти [@BotFather](https://t.me/botfather) в Telegram
2. Отправить команду `/newbot`
3. Следовать инструкциям для получения токена
4. Сохранить токен формата: `123456789:ABCdefGHIjklMNOpqrsTUVwxyz`

#### Добавление бота в канал

1. Создать канал (или использовать существующий)
2. Добавить бота как администратора
3. Дать права на публикацию сообщений

### 1.2 Публикация контента

#### Основная реализация

```typescript
// integrations/telegram/publisher.ts
import TelegramBot from 'node-telegram-bot-api';
import FormData from 'form-data';
import axios from 'axios';

interface TelegramPublishOptions {
  channelId: string;        // @channel_name или -100123456789
  content: string;
  mediaUrls?: string[];
  disableNotification?: boolean;
  disableLinkPreview?: boolean;
  parseMode?: 'HTML' | 'Markdown' | 'MarkdownV2';
}

export class TelegramPublisher {
  private bot: TelegramBot;
  private token: string;

  constructor(token: string) {
    this.token = token;
    this.bot = new TelegramBot(token);
  }

  async publish(options: TelegramPublishOptions): Promise<TelegramPublishResult> {
    try {
      const {
        channelId,
        content,
        mediaUrls = [],
        disableNotification = false,
        disableLinkPreview = false,
        parseMode = 'HTML'
      } = options;

      let message;

      if (mediaUrls.length === 0) {
        // Текстовое сообщение
        message = await this.bot.sendMessage(channelId, content, {
          parse_mode: parseMode,
          disable_notification: disableNotification,
          disable_web_page_preview: disableLinkPreview
        });
      } else if (mediaUrls.length === 1) {
        // Одно изображение с подписью
        message = await this.bot.sendPhoto(channelId, mediaUrls[0], {
          caption: content,
          parse_mode: parseMode,
          disable_notification: disableNotification
        });
      } else {
        // Несколько изображений (медиа-группа)
        const media = mediaUrls.map((url, index) => ({
          type: 'photo' as const,
          media: url,
          caption: index === 0 ? content : undefined,
          parse_mode: index === 0 ? parseMode : undefined
        }));

        const messages = await this.bot.sendMediaGroup(channelId, media, {
          disable_notification: disableNotification
        });
        
        message = messages[0];
      }

      return {
        success: true,
        messageId: message.message_id,
        externalId: `${message.chat.id}_${message.message_id}`,
        externalUrl: this.buildMessageUrl(channelId, message.message_id),
        publishedAt: new Date(message.date * 1000)
      };
    } catch (error) {
      throw new TelegramPublishError(error.message, error);
    }
  }

  async publishScheduled(
    options: TelegramPublishOptions,
    scheduledAt: Date
  ): Promise<string> {
    // Telegram Bot API не поддерживает отложенную публикацию напрямую
    // Используем внутреннюю очередь задач (BullMQ)
    const job = await publishQueue.add('telegram-publish', {
      ...options,
      token: this.token
    }, {
      delay: scheduledAt.getTime() - Date.now()
    });

    return job.id;
  }

  async editMessage(
    channelId: string,
    messageId: number,
    content: string
  ): Promise<void> {
    await this.bot.editMessageText(content, {
      chat_id: channelId,
      message_id: messageId,
      parse_mode: 'HTML'
    });
  }

  async deleteMessage(channelId: string, messageId: number): Promise<void> {
    await this.bot.deleteMessage(channelId, messageId);
  }

  private buildMessageUrl(channelId: string, messageId: number): string {
    // Для публичных каналов
    if (channelId.startsWith('@')) {
      const username = channelId.substring(1);
      return `https://t.me/${username}/${messageId}`;
    }
    // Для приватных каналов возвращаем пустую строку
    return '';
  }
}
```

### 1.3 Сбор метрик

#### Получение статистики

```typescript
// integrations/telegram/metrics.ts
export class TelegramMetricsCollector {
  private bot: TelegramBot;

  constructor(token: string) {
    this.bot = new TelegramBot(token);
  }

  async getPostMetrics(
    channelId: string,
    messageId: number
  ): Promise<TelegramMetrics> {
    try {
      // Telegram Bot API не предоставляет статистику напрямую
      // Используем Telegram API (MTProto) для получения детальной статистики
      
      const stats = await this.getMessageStatistics(channelId, messageId);

      return {
        views: stats.views || 0,
        forwards: stats.forwards || 0,
        reactions: this.countReactions(stats.reactions),
        // Лайки/комментарии недоступны через Bot API
        likes: 0,
        comments: 0,
        reach: stats.views || 0,
        engagement: this.calculateEngagement(stats)
      };
    } catch (error) {
      console.error('Error fetching Telegram metrics:', error);
      return this.getEmptyMetrics();
    }
  }

  // Использование MTProto API для получения детальной статистики
  private async getMessageStatistics(
    channelId: string,
    messageId: number
  ): Promise<any> {
    // Требует использования библиотеки telegram (MTProto)
    // npm install telegram
    
    const { TelegramClient } = require('telegram');
    const { StringSession } = require('telegram/sessions');

    const client = new TelegramClient(
      new StringSession(process.env.TELEGRAM_SESSION),
      parseInt(process.env.TELEGRAM_API_ID!),
      process.env.TELEGRAM_API_HASH!,
      { connectionRetries: 5 }
    );

    await client.connect();

    const stats = await client.invoke(
      new Api.stats.GetMessageStats({
        channel: channelId,
        msgId: messageId
      })
    );

    return {
      views: stats.viewsGraph?.value || 0,
      forwards: stats.forwardsGraph?.value || 0,
      reactions: stats.reactionsGraph || []
    };
  }

  private countReactions(reactions: any[]): number {
    if (!reactions || !Array.isArray(reactions)) return 0;
    return reactions.reduce((sum, r) => sum + (r.count || 0), 0);
  }

  private calculateEngagement(stats: any): number {
    const { views, forwards, reactions } = stats;
    if (!views || views === 0) return 0;
    
    const interactions = (forwards || 0) + (reactions?.length || 0);
    return (interactions / views) * 100;
  }

  private getEmptyMetrics(): TelegramMetrics {
    return {
      views: 0,
      forwards: 0,
      reactions: 0,
      likes: 0,
      comments: 0,
      reach: 0,
      engagement: 0
    };
  }
}
```

#### Webhook для уведомлений

```typescript
// integrations/telegram/webhook.ts
import express from 'express';

export class TelegramWebhook {
  private bot: TelegramBot;

  constructor(token: string) {
    this.bot = new TelegramBot(token);
  }

  async setupWebhook(url: string): Promise<void> {
    await this.bot.setWebHook(`${url}/webhook/telegram/${this.bot.token}`);
  }

  handleWebhook(app: express.Application): void {
    app.post(`/webhook/telegram/${this.bot.token}`, async (req, res) => {
      const update = req.body;
      
      // Обработка новых сообщений
      if (update.message) {
        await this.handleMessage(update.message);
      }
      
      // Обработка реакций
      if (update.message_reaction) {
        await this.handleReaction(update.message_reaction);
      }

      res.sendStatus(200);
    });
  }

  private async handleMessage(message: any): Promise<void> {
    // Обработка новых комментариев или ответов
    console.log('New message:', message);
  }

  private async handleReaction(reaction: any): Promise<void> {
    // Обработка новых реакций
    console.log('New reaction:', reaction);
  }
}
```

---

## 2. VK (ВКонтакте) API

### 2.1 Подключение

#### Создание приложения

1. Перейти на [vk.com/apps?act=manage](https://vk.com/apps?act=manage)
2. Создать standalone приложение
3. Получить:
   - **App ID**
   - **Secure key**
4. Настроить OAuth redirect URI

#### Получение токена доступа

```typescript
// integrations/vk/auth.ts
import { VK } from 'vk-io';

export class VKAuth {
  async getAuthUrl(clientId: string, redirectUri: string): Promise<string> {
    const scope = [
      'wall',      // Публикация на стене
      'photos',    // Загрузка фото
      'video',     // Загрузка видео
      'stats',     // Статистика
      'groups'     // Управление группами
    ].join(',');

    return `https://oauth.vk.com/authorize?` +
      `client_id=${clientId}&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `scope=${scope}&` +
      `response_type=code&` +
      `v=5.131`;
  }

  async exchangeCodeForToken(
    clientId: string,
    clientSecret: string,
    code: string,
    redirectUri: string
  ): Promise<VKTokenResponse> {
    const response = await fetch(
      `https://oauth.vk.com/access_token?` +
      `client_id=${clientId}&` +
      `client_secret=${clientSecret}&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `code=${code}`
    );

    const data = await response.json();

    if (data.error) {
      throw new Error(`VK OAuth error: ${data.error_description}`);
    }

    return {
      accessToken: data.access_token,
      expiresIn: data.expires_in,
      userId: data.user_id
    };
  }
}
```

### 2.2 Публикация контента

```typescript
// integrations/vk/publisher.ts
import { VK, MessageContext } from 'vk-io';
import FormData from 'form-data';
import axios from 'axios';

interface VKPublishOptions {
  ownerId: number;          // ID группы (отрицательное) или пользователя
  content: string;
  mediaUrls?: string[];
  attachments?: string[];   // Готовые вложения (photo123_456)
  publishDate?: Date;       // Отложенная публикация
  signedPost?: boolean;     // Подпись автора
  closeComments?: boolean;
}

export class VKPublisher {
  private vk: VK;

  constructor(token: string) {
    this.vk = new VK({ token });
  }

  async publish(options: VKPublishOptions): Promise<VKPublishResult> {
    try {
      const {
        ownerId,
        content,
        mediaUrls = [],
        attachments = [],
        publishDate,
        signedPost = true,
        closeComments = false
      } = options;

      // Загрузка медиа-файлов
      let uploadedAttachments = [...attachments];
      
      if (mediaUrls.length > 0) {
        const uploaded = await this.uploadPhotos(ownerId, mediaUrls);
        uploadedAttachments.push(...uploaded);
      }

      // Публикация поста
      const post = await this.vk.api.wall.post({
        owner_id: ownerId,
        message: content,
        attachments: uploadedAttachments.join(','),
        publish_date: publishDate ? Math.floor(publishDate.getTime() / 1000) : undefined,
        signed: signedPost ? 1 : 0,
        close_comments: closeComments ? 1 : 0
      });

      return {
        success: true,
        postId: post.post_id,
        externalId: `${ownerId}_${post.post_id}`,
        externalUrl: `https://vk.com/wall${ownerId}_${post.post_id}`,
        publishedAt: new Date()
      };
    } catch (error) {
      throw new VKPublishError(error.message, error);
    }
  }

  private async uploadPhotos(
    ownerId: number,
    photoUrls: string[]
  ): Promise<string[]> {
    const attachments: string[] = [];

    for (const url of photoUrls) {
      try {
        // 1. Получить URL для загрузки
        const uploadServer = await this.vk.api.photos.getWallUploadServer({
          group_id: ownerId < 0 ? Math.abs(ownerId) : undefined
        });

        // 2. Загрузить фото на сервер VK
        const photoResponse = await axios.get(url, { responseType: 'arraybuffer' });
        const photoBuffer = Buffer.from(photoResponse.data);

        const form = new FormData();
        form.append('photo', photoBuffer, {
          filename: 'photo.jpg',
          contentType: 'image/jpeg'
        });

        const uploadResponse = await axios.post(uploadServer.upload_url, form, {
          headers: form.getHeaders()
        });

        // 3. Сохранить фото
        const savedPhoto = await this.vk.api.photos.saveWallPhoto({
          group_id: ownerId < 0 ? Math.abs(ownerId) : undefined,
          photo: uploadResponse.data.photo,
          server: uploadResponse.data.server,
          hash: uploadResponse.data.hash
        });

        if (savedPhoto.length > 0) {
          const photo = savedPhoto[0];
          attachments.push(`photo${photo.owner_id}_${photo.id}`);
        }
      } catch (error) {
        console.error('Error uploading photo to VK:', error);
      }
    }

    return attachments;
  }

  async editPost(
    ownerId: number,
    postId: number,
    content: string,
    attachments?: string[]
  ): Promise<void> {
    await this.vk.api.wall.edit({
      owner_id: ownerId,
      post_id: postId,
      message: content,
      attachments: attachments?.join(',')
    });
  }

  async deletePost(ownerId: number, postId: number): Promise<void> {
    await this.vk.api.wall.delete({
      owner_id: ownerId,
      post_id: postId
    });
  }

  async pinPost(ownerId: number, postId: number): Promise<void> {
    await this.vk.api.wall.pin({
      owner_id: ownerId,
      post_id: postId
    });
  }

  async unpinPost(ownerId: number, postId: number): Promise<void> {
    await this.vk.api.wall.unpin({
      owner_id: ownerId,
      post_id: postId
    });
  }
}
```

### 2.3 Сбор метрик

```typescript
// integrations/vk/metrics.ts
export class VKMetricsCollector {
  private vk: VK;

  constructor(token: string) {
    this.vk = new VK({ token });
  }

  async getPostMetrics(
    ownerId: number,
    postId: number
  ): Promise<VKMetrics> {
    try {
      // Получить информацию о посте
      const posts = await this.vk.api.wall.getById({
        posts: [`${ownerId}_${postId}`],
        extended: 1
      });

      if (posts.items.length === 0) {
        return this.getEmptyMetrics();
      }

      const post = posts.items[0];

      // Получить статистику (для групп)
      let stats = null;
      if (ownerId < 0) {
        try {
          stats = await this.vk.api.stats.getPostReach({
            owner_id: ownerId,
            post_ids: [postId]
          });
        } catch (error) {
          console.warn('Stats not available:', error.message);
        }
      }

      return {
        views: post.views?.count || 0,
        likes: post.likes?.count || 0,
        comments: post.comments?.count || 0,
        reposts: post.reposts?.count || 0,
        reach: stats?.[0]?.reach_total || post.views?.count || 0,
        impressions: stats?.[0]?.reach_total || 0,
        engagement: this.calculateEngagement(post),
        clicks: stats?.[0]?.links || 0
      };
    } catch (error) {
      console.error('Error fetching VK metrics:', error);
      return this.getEmptyMetrics();
    }
  }

  async getGroupStatistics(
    groupId: number,
    dateFrom: Date,
    dateTo: Date
  ): Promise<VKGroupStats> {
    const stats = await this.vk.api.stats.get({
      group_id: groupId,
      date_from: this.formatDate(dateFrom),
      date_to: this.formatDate(dateTo)
    });

    return {
      reach: stats.reduce((sum, day) => sum + (day.reach || 0), 0),
      visitors: stats.reduce((sum, day) => sum + (day.visitors || 0), 0),
      views: stats.reduce((sum, day) => sum + (day.views || 0), 0)
    };
  }

  private calculateEngagement(post: any): number {
    const { views, likes, comments, reposts } = post;
    const viewsCount = views?.count || 0;
    
    if (viewsCount === 0) return 0;

    const likesCount = likes?.count || 0;
    const commentsCount = comments?.count || 0;
    const repostsCount = reposts?.count || 0;

    const totalInteractions = likesCount + commentsCount + repostsCount;
    return (totalInteractions / viewsCount) * 100;
  }

  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  private getEmptyMetrics(): VKMetrics {
    return {
      views: 0,
      likes: 0,
      comments: 0,
      reposts: 0,
      reach: 0,
      impressions: 0,
      engagement: 0,
      clicks: 0
    };
  }
}
```

#### Callback API для real-time уведомлений

```typescript
// integrations/vk/callback.ts
import express from 'express';
import crypto from 'crypto';

export class VKCallbackAPI {
  private vk: VK;
  private confirmationToken: string;
  private secretKey: string;

  constructor(token: string, confirmationToken: string, secretKey: string) {
    this.vk = new VK({ token });
    this.confirmationToken = confirmationToken;
    this.secretKey = secretKey;
  }

  async setupCallbackAPI(groupId: number, serverUrl: string): Promise<void> {
    // Добавить сервер
    const server = await this.vk.api.groups.addCallbackServer({
      group_id: groupId,
      url: `${serverUrl}/webhook/vk`,
      title: 'AI Newsmaker',
      secret_key: this.secretKey
    });

    // Настроить события
    await this.vk.api.groups.setCallbackSettings({
      group_id: groupId,
      server_id: server.server_id,
      wall_post_new: 1,
      wall_repost: 1,
      wall_reply_new: 1,
      wall_reply_edit: 1,
      wall_reply_delete: 1,
      like_add: 1,
      like_remove: 1
    });
  }

  handleCallback(app: express.Application): void {
    app.post('/webhook/vk', async (req, res) => {
      const data = req.body;

      // Проверка подписи
      if (!this.verifySignature(req)) {
        return res.status(403).send('Invalid signature');
      }

      // Подтверждение сервера
      if (data.type === 'confirmation') {
        return res.send(this.confirmationToken);
      }

      // Обработка событий
      switch (data.type) {
        case 'wall_post_new':
          await this.handleNewPost(data.object);
          break;
        case 'wall_reply_new':
          await this.handleNewComment(data.object);
          break;
        case 'like_add':
          await this.handleLike(data.object);
          break;
      }

      res.send('ok');
    });
  }

  private verifySignature(req: express.Request): boolean {
    const sign = req.headers['x-vk-callback-signature'];
    const body = JSON.stringify(req.body);
    
    const hash = crypto
      .createHmac('sha256', this.secretKey)
      .update(body)
      .digest('hex');

    return hash === sign;
  }

  private async handleNewPost(post: any): Promise<void> {
    console.log('New post:', post);
    // Обновить метрики в БД
  }

  private async handleNewComment(comment: any): Promise<void> {
    console.log('New comment:', comment);
    // Инкрементировать счетчик комментариев
  }

  private async handleLike(like: any): Promise<void> {
    console.log('New like:', like);
    // Инкрементировать счетчик лайков
  }
}
```

---

## 3. Meta Business API (Facebook / Instagram)

### 3.1 Подключение

#### Создание приложения

1. Перейти на [developers.facebook.com](https://developers.facebook.com)
2. Создать приложение типа "Business"
3. Добавить продукты: "Facebook Login", "Instagram Basic Display"
4. Получить:
   - **App ID**
   - **App Secret**

#### OAuth 2.0 Flow

```typescript
// integrations/meta/auth.ts
import axios from 'axios';

export class MetaAuth {
  private appId: string;
  private appSecret: string;
  private redirectUri: string;

  constructor(appId: string, appSecret: string, redirectUri: string) {
    this.appId = appId;
    this.appSecret = appSecret;
    this.redirectUri = redirectUri;
  }

  getAuthUrl(platform: 'facebook' | 'instagram'): string {
    const scope = platform === 'facebook'
      ? ['pages_manage_posts', 'pages_read_engagement', 'pages_show_list']
      : ['instagram_basic', 'instagram_content_publish', 'pages_show_list'];

    return `https://www.facebook.com/v18.0/dialog/oauth?` +
      `client_id=${this.appId}&` +
      `redirect_uri=${encodeURIComponent(this.redirectUri)}&` +
      `scope=${scope.join(',')}&` +
      `response_type=code`;
  }

  async exchangeCodeForToken(code: string): Promise<MetaTokenResponse> {
    const response = await axios.get(
      `https://graph.facebook.com/v18.0/oauth/access_token`,
      {
        params: {
          client_id: this.appId,
          client_secret: this.appSecret,
          redirect_uri: this.redirectUri,
          code
        }
      }
    );

    return {
      accessToken: response.data.access_token,
      tokenType: response.data.token_type
    };
  }

  async getLongLivedToken(shortLivedToken: string): Promise<string> {
    const response = await axios.get(
      `https://graph.facebook.com/v18.0/oauth/access_token`,
      {
        params: {
          grant_type: 'fb_exchange_token',
          client_id: this.appId,
          client_secret: this.appSecret,
          fb_exchange_token: shortLivedToken
        }
      }
    );

    return response.data.access_token;
  }

  async getPageAccessToken(
    userAccessToken: string,
    pageId: string
  ): Promise<string> {
    const response = await axios.get(
      `https://graph.facebook.com/v18.0/${pageId}`,
      {
        params: {
          fields: 'access_token',
          access_token: userAccessToken
        }
      }
    );

    return response.data.access_token;
  }

  async getInstagramBusinessAccount(
    pageAccessToken: string,
    pageId: string
  ): Promise<string> {
    const response = await axios.get(
      `https://graph.facebook.com/v18.0/${pageId}`,
      {
        params: {
          fields: 'instagram_business_account',
          access_token: pageAccessToken
        }
      }
    );

    return response.data.instagram_business_account.id;
  }
}
```

### 3.2 Публикация в Facebook

```typescript
// integrations/meta/facebook-publisher.ts
import axios from 'axios';

export class FacebookPublisher {
  private pageAccessToken: string;

  constructor(pageAccessToken: string) {
    this.pageAccessToken = pageAccessToken;
  }

  async publishPost(
    pageId: string,
    content: string,
    options?: FacebookPublishOptions
  ): Promise<FacebookPublishResult> {
    try {
      const { mediaUrls = [], link, published = true } = options || {};

      let endpoint = `https://graph.facebook.com/v18.0/${pageId}`;
      let data: any = {
        message: content,
        access_token: this.pageAccessToken,
        published
      };

      if (link) {
        data.link = link;
      }

      // Публикация с одним изображением
      if (mediaUrls.length === 1) {
        endpoint += '/photos';
        data.url = mediaUrls[0];
        data.caption = content;
        delete data.message;
      }
      // Публикация с несколькими изображениями
      else if (mediaUrls.length > 1) {
        return await this.publishMediaGroup(pageId, content, mediaUrls);
      }
      // Текстовый пост
      else {
        endpoint += '/feed';
      }

      const response = await axios.post(endpoint, data);

      return {
        success: true,
        postId: response.data.id || response.data.post_id,
        externalId: response.data.id || response.data.post_id,
        externalUrl: `https://facebook.com/${response.data.id || response.data.post_id}`,
        publishedAt: new Date()
      };
    } catch (error) {
      throw new FacebookPublishError(error.message, error);
    }
  }

  private async publishMediaGroup(
    pageId: string,
    content: string,
    mediaUrls: string[]
  ): Promise<FacebookPublishResult> {
    // 1. Загрузить все изображения без публикации
    const mediaIds: string[] = [];

    for (const url of mediaUrls) {
      const response = await axios.post(
        `https://graph.facebook.com/v18.0/${pageId}/photos`,
        {
          url,
          published: false,
          access_token: this.pageAccessToken
        }
      );
      mediaIds.push(response.data.id);
    }

    // 2. Создать пост с прикрепленными медиа
    const response = await axios.post(
      `https://graph.facebook.com/v18.0/${pageId}/feed`,
      {
        message: content,
        attached_media: mediaIds.map(id => ({ media_fbid: id })),
        access_token: this.pageAccessToken
      }
    );

    return {
      success: true,
      postId: response.data.id,
      externalId: response.data.id,
      externalUrl: `https://facebook.com/${response.data.id}`,
      publishedAt: new Date()
    };
  }

  async schedulePost(
    pageId: string,
    content: string,
    scheduledTime: Date,
    options?: FacebookPublishOptions
  ): Promise<string> {
    const unixTimestamp = Math.floor(scheduledTime.getTime() / 1000);

    const response = await axios.post(
      `https://graph.facebook.com/v18.0/${pageId}/feed`,
      {
        message: content,
        published: false,
        scheduled_publish_time: unixTimestamp,
        access_token: this.pageAccessToken,
        ...options
      }
    );

    return response.data.id;
  }

  async deletePost(postId: string): Promise<void> {
    await axios.delete(
      `https://graph.facebook.com/v18.0/${postId}`,
      {
        params: { access_token: this.pageAccessToken }
      }
    );
  }
}
```

### 3.3 Публикация в Instagram

```typescript
// integrations/meta/instagram-publisher.ts
export class InstagramPublisher {
  private accessToken: string;

  constructor(accessToken: string) {
    this.accessToken = accessToken;
  }

  async publishPost(
    igUserId: string,
    content: string,
    mediaUrl: string,
    options?: InstagramPublishOptions
  ): Promise<InstagramPublishResult> {
    try {
      // Instagram требует двухэтапный процесс:
      // 1. Создать медиа-контейнер
      // 2. Опубликовать контейнер

      const { mediaType = 'IMAGE', children = [] } = options || {};

      let containerId: string;

      if (children.length > 0) {
        // Карусель (несколько изображений)
        containerId = await this.createCarouselContainer(
          igUserId,
          content,
          children
        );
      } else {
        // Одно изображение
        containerId = await this.createMediaContainer(
          igUserId,
          content,
          mediaUrl,
          mediaType
        );
      }

      // Публикация
      const response = await axios.post(
        `https://graph.facebook.com/v18.0/${igUserId}/media_publish`,
        {
          creation_id: containerId,
          access_token: this.accessToken
        }
      );

      return {
        success: true,
        postId: response.data.id,
        externalId: response.data.id,
        externalUrl: `https://www.instagram.com/p/${this.getShortcode(response.data.id)}`,
        publishedAt: new Date()
      };
    } catch (error) {
      throw new InstagramPublishError(error.message, error);
    }
  }

  private async createMediaContainer(
    igUserId: string,
    caption: string,
    imageUrl: string,
    mediaType: 'IMAGE' | 'VIDEO'
  ): Promise<string> {
    const params: any = {
      caption,
      access_token: this.accessToken
    };

    if (mediaType === 'IMAGE') {
      params.image_url = imageUrl;
    } else {
      params.video_url = imageUrl;
      params.media_type = 'VIDEO';
    }

    const response = await axios.post(
      `https://graph.facebook.com/v18.0/${igUserId}/media`,
      params
    );

    return response.data.id;
  }

  private async createCarouselContainer(
    igUserId: string,
    caption: string,
    children: string[]
  ): Promise<string> {
    // 1. Создать контейнеры для каждого изображения
    const childrenIds: string[] = [];

    for (const imageUrl of children) {
      const response = await axios.post(
        `https://graph.facebook.com/v18.0/${igUserId}/media`,
        {
          image_url: imageUrl,
          is_carousel_item: true,
          access_token: this.accessToken
        }
      );
      childrenIds.push(response.data.id);
    }

    // 2. Создать контейнер карусели
    const response = await axios.post(
      `https://graph.facebook.com/v18.0/${igUserId}/media`,
      {
        caption,
        media_type: 'CAROUSEL',
        children: childrenIds.join(','),
        access_token: this.accessToken
      }
    );

    return response.data.id;
  }

  private getShortcode(mediaId: string): string {
    // Преобразование Instagram media ID в shortcode
    // Это упрощенная версия, реальная реализация сложнее
    return Buffer.from(mediaId).toString('base64').substring(0, 11);
  }

  async publishStory(
    igUserId: string,
    mediaUrl: string,
    mediaType: 'IMAGE' | 'VIDEO' = 'IMAGE'
  ): Promise<string> {
    const response = await axios.post(
      `https://graph.facebook.com/v18.0/${igUserId}/media`,
      {
        image_url: mediaType === 'IMAGE' ? mediaUrl : undefined,
        video_url: mediaType === 'VIDEO' ? mediaUrl : undefined,
        media_type: 'STORIES',
        access_token: this.accessToken
      }
    );

    const publishResponse = await axios.post(
      `https://graph.facebook.com/v18.0/${igUserId}/media_publish`,
      {
        creation_id: response.data.id,
        access_token: this.accessToken
      }
    );

    return publishResponse.data.id;
  }
}
```

### 3.4 Сбор метрик Meta

```typescript
// integrations/meta/metrics.ts
export class MetaMetricsCollector {
  private accessToken: string;

  constructor(accessToken: string) {
    this.accessToken = accessToken;
  }

  async getFacebookPostMetrics(postId: string): Promise<FacebookMetrics> {
    try {
      const response = await axios.get(
        `https://graph.facebook.com/v18.0/${postId}`,
        {
          params: {
            fields: 'reactions.summary(true),comments.summary(true),shares,insights',
            access_token: this.accessToken
          }
        }
      );

      const insights = await this.getPostInsights(postId);

      return {
        likes: response.data.reactions?.summary?.total_count || 0,
        comments: response.data.comments?.summary?.total_count || 0,
        shares: response.data.shares?.count || 0,
        reach: insights.reach || 0,
        impressions: insights.impressions || 0,
        clicks: insights.clicks || 0,
        engagement: insights.engagement || 0
      };
    } catch (error) {
      console.error('Error fetching Facebook metrics:', error);
      return this.getEmptyFacebookMetrics();
    }
  }

  private async getPostInsights(postId: string): Promise<any> {
    try {
      const response = await axios.get(
        `https://graph.facebook.com/v18.0/${postId}/insights`,
        {
          params: {
            metric: [
              'post_impressions',
              'post_impressions_unique',
              'post_engaged_users',
              'post_clicks'
            ].join(','),
            access_token: this.accessToken
          }
        }
      );

      const data = response.data.data;
      return {
        impressions: data.find((m: any) => m.name === 'post_impressions')?.values[0]?.value || 0,
        reach: data.find((m: any) => m.name === 'post_impressions_unique')?.values[0]?.value || 0,
        engagement: data.find((m: any) => m.name === 'post_engaged_users')?.values[0]?.value || 0,
        clicks: data.find((m: any) => m.name === 'post_clicks')?.values[0]?.value || 0
      };
    } catch (error) {
      return {};
    }
  }

  async getInstagramPostMetrics(mediaId: string): Promise<InstagramMetrics> {
    try {
      const response = await axios.get(
        `https://graph.facebook.com/v18.0/${mediaId}/insights`,
        {
          params: {
            metric: [
              'impressions',
              'reach',
              'engagement',
              'saved',
              'video_views'
            ].join(','),
            access_token: this.accessToken
          }
        }
      );

      const data = response.data.data;

      // Получить лайки и комментарии
      const mediaResponse = await axios.get(
        `https://graph.facebook.com/v18.0/${mediaId}`,
        {
          params: {
            fields: 'like_count,comments_count',
            access_token: this.accessToken
          }
        }
      );

      return {
        impressions: data.find((m: any) => m.name === 'impressions')?.values[0]?.value || 0,
        reach: data.find((m: any) => m.name === 'reach')?.values[0]?.value || 0,
        engagement: data.find((m: any) => m.name === 'engagement')?.values[0]?.value || 0,
        likes: mediaResponse.data.like_count || 0,
        comments: mediaResponse.data.comments_count || 0,
        saves: data.find((m: any) => m.name === 'saved')?.values[0]?.value || 0,
        videoViews: data.find((m: any) => m.name === 'video_views')?.values[0]?.value || 0
      };
    } catch (error) {
      console.error('Error fetching Instagram metrics:', error);
      return this.getEmptyInstagramMetrics();
    }
  }

  private getEmptyFacebookMetrics(): FacebookMetrics {
    return { likes: 0, comments: 0, shares: 0, reach: 0, impressions: 0, clicks: 0, engagement: 0 };
  }

  private getEmptyInstagramMetrics(): InstagramMetrics {
    return { impressions: 0, reach: 0, engagement: 0, likes: 0, comments: 0, saves: 0, videoViews: 0 };
  }
}
```

---

## 4. LinkedIn API

### 4.1 Подключение

#### Создание приложения

1. Перейти на [LinkedIn Developers](https://www.linkedin.com/developers/apps)
2. Создать приложение
3. Получить:
   - **Client ID**
   - **Client Secret**
4. Настроить OAuth 2.0 redirect URLs

#### OAuth 2.0

```typescript
// integrations/linkedin/auth.ts
export class LinkedInAuth {
  private clientId: string;
  private clientSecret: string;
  private redirectUri: string;

  constructor(clientId: string, clientSecret: string, redirectUri: string) {
    this.clientId = clientId;
    this.clientSecret = clientSecret;
    this.redirectUri = redirectUri;
  }

  getAuthUrl(): string {
    const scope = ['w_member_social', 'r_basicprofile', 'r_organization_social'];
    
    return `https://www.linkedin.com/oauth/v2/authorization?` +
      `response_type=code&` +
      `client_id=${this.clientId}&` +
      `redirect_uri=${encodeURIComponent(this.redirectUri)}&` +
      `scope=${scope.join('%20')}`;
  }

  async exchangeCodeForToken(code: string): Promise<LinkedInTokenResponse> {
    const response = await axios.post(
      'https://www.linkedin.com/oauth/v2/accessToken',
      new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: this.redirectUri,
        client_id: this.clientId,
        client_secret: this.clientSecret
      }),
      {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      }
    );

    return {
      accessToken: response.data.access_token,
      expiresIn: response.data.expires_in
    };
  }

  async getOrganizationId(accessToken: string): Promise<string> {
    const response = await axios.get(
      'https://api.linkedin.com/v2/organizationAcls',
      {
        params: {
          q: 'roleAssignee',
          projection: '(elements*(organization~(localizedName),roleAssignee~(localizedFirstName)))'
        },
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'X-Restli-Protocol-Version': '2.0.0'
        }
      }
    );

    return response.data.elements[0]?.['organization~']?.id;
  }
}
```

### 4.2 Публикация контента

```typescript
// integrations/linkedin/publisher.ts
export class LinkedInPublisher {
  private accessToken: string;

  constructor(accessToken: string) {
    this.accessToken = accessToken;
  }

  async publishPost(
    authorUrn: string,  // urn:li:person:{personId} или urn:li:organization:{orgId}
    content: string,
    options?: LinkedInPublishOptions
  ): Promise<LinkedInPublishResult> {
    try {
      const { mediaUrls = [], articleUrl, visibility = 'PUBLIC' } = options || {};

      let shareData: any = {
        author: authorUrn,
        lifecycleState: 'PUBLISHED',
        specificContent: {
          'com.linkedin.ugc.ShareContent': {
            shareCommentary: {
              text: content
            },
            shareMediaCategory: mediaUrls.length > 0 ? 'IMAGE' : 'NONE'
          }
        },
        visibility: {
          'com.linkedin.ugc.MemberNetworkVisibility': visibility
        }
      };

      // Добавление изображений
      if (mediaUrls.length > 0) {
        const uploadedMedia = await this.uploadImages(authorUrn, mediaUrls);
        
        shareData.specificContent['com.linkedin.ugc.ShareContent'].media = uploadedMedia.map(media => ({
          status: 'READY',
          media: media.asset,
          title: {
            text: 'Image'
          }
        }));
      }

      // Добавление ссылки на статью
      if (articleUrl) {
        shareData.specificContent['com.linkedin.ugc.ShareContent'].shareMediaCategory = 'ARTICLE';
        shareData.specificContent['com.linkedin.ugc.ShareContent'].media = [{
          status: 'READY',
          originalUrl: articleUrl
        }];
      }

      const response = await axios.post(
        'https://api.linkedin.com/v2/ugcPosts',
        shareData,
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json',
            'X-Restli-Protocol-Version': '2.0.0'
          }
        }
      );

      const postId = response.headers['x-restli-id'];

      return {
        success: true,
        postId,
        externalId: postId,
        externalUrl: `https://www.linkedin.com/feed/update/${postId}`,
        publishedAt: new Date()
      };
    } catch (error) {
      throw new LinkedInPublishError(error.message, error);
    }
  }

  private async uploadImages(
    authorUrn: string,
    imageUrls: string[]
  ): Promise<any[]> {
    const uploadedImages = [];

    for (const imageUrl of imageUrls) {
      try {
        // 1. Зарегистрировать загрузку
        const registerResponse = await axios.post(
          'https://api.linkedin.com/v2/assets?action=registerUpload',
          {
            registerUploadRequest: {
              recipes: ['urn:li:digitalmediaRecipe:feedshare-image'],
              owner: authorUrn,
              serviceRelationships: [
                {
                  relationshipType: 'OWNER',
                  identifier: 'urn:li:userGeneratedContent'
                }
              ]
            }
          },
          {
            headers: {
              'Authorization': `Bearer ${this.accessToken}`,
              'Content-Type': 'application/json',
              'X-Restli-Protocol-Version': '2.0.0'
            }
          }
        );

        const uploadUrl = registerResponse.data.value.uploadMechanism[
          'com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest'
        ].uploadUrl;
        
        const asset = registerResponse.data.value.asset;

        // 2. Загрузить изображение
        const imageResponse = await axios.get(imageUrl, { responseType: 'arraybuffer' });
        const imageBuffer = Buffer.from(imageResponse.data);

        await axios.put(uploadUrl, imageBuffer, {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/octet-stream'
          }
        });

        uploadedImages.push({ asset });
      } catch (error) {
        console.error('Error uploading image to LinkedIn:', error);
      }
    }

    return uploadedImages;
  }

  async deletePost(postId: string): Promise<void> {
    await axios.delete(
      `https://api.linkedin.com/v2/ugcPosts/${postId}`,
      {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'X-Restli-Protocol-Version': '2.0.0'
        }
      }
    );
  }
}
```

### 4.3 Сбор метрик

```typescript
// integrations/linkedin/metrics.ts
export class LinkedInMetricsCollector {
  private accessToken: string;

  constructor(accessToken: string) {
    this.accessToken = accessToken;
  }

  async getPostMetrics(shareUrn: string): Promise<LinkedInMetrics> {
    try {
      // LinkedIn предоставляет ограниченную статистику через UGC API
      const response = await axios.get(
        `https://api.linkedin.com/v2/socialActions/${encodeURIComponent(shareUrn)}`,
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'X-Restli-Protocol-Version': '2.0.0'
          }
        }
      );

      return {
        likes: response.data.likesSummary?.totalLikes || 0,
        comments: response.data.commentsSummary?.totalComments || 0,
        shares: response.data.sharesSummary?.totalShares || 0,
        clicks: 0, // Недоступно через публичный API
        impressions: 0, // Требует доступ к Analytics API
        engagement: 0
      };
    } catch (error) {
      console.error('Error fetching LinkedIn metrics:', error);
      return this.getEmptyMetrics();
    }
  }

  async getOrganizationStatistics(
    organizationId: string,
    timeRange: { start: Date; end: Date }
  ): Promise<LinkedInOrgStats> {
    // Требует LinkedIn Marketing Developer Platform доступ
    const response = await axios.get(
      'https://api.linkedin.com/v2/organizationalEntityShareStatistics',
      {
        params: {
          q: 'organizationalEntity',
          organizationalEntity: `urn:li:organization:${organizationId}`,
          timeIntervals: {
            timeGranularityType: 'DAY',
            timeRange: {
              start: timeRange.start.getTime(),
              end: timeRange.end.getTime()
            }
          }
        },
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'X-Restli-Protocol-Version': '2.0.0'
        }
      }
    );

    return this.parseOrgStatistics(response.data);
  }

  private parseOrgStatistics(data: any): LinkedInOrgStats {
    const elements = data.elements || [];
    
    return {
      impressions: elements.reduce((sum: number, el: any) => 
        sum + (el.totalShareStatistics?.impressionCount || 0), 0),
      clicks: elements.reduce((sum: number, el: any) => 
        sum + (el.totalShareStatistics?.clickCount || 0), 0),
      engagement: elements.reduce((sum: number, el: any) => 
        sum + (el.totalShareStatistics?.engagement || 0), 0)
    };
  }

  private getEmptyMetrics(): LinkedInMetrics {
    return {
      likes: 0,
      comments: 0,
      shares: 0,
      clicks: 0,
      impressions: 0,
      engagement: 0
    };
  }
}
```

---

## 5. OK.ru (Одноклассники)

### 5.1 Подключение и публикация

```typescript
// integrations/ok/publisher.ts
import axios from 'axios';
import crypto from 'crypto';

export class OKPublisher {
  private accessToken: string;
  private applicationKey: string;
  private applicationSecretKey: string;

  constructor(accessToken: string, appKey: string, secretKey: string) {
    this.accessToken = accessToken;
    this.applicationKey = appKey;
    this.applicationSecretKey = secretKey;
  }

  async publishPost(
    groupId: string,
    content: string,
    options?: OKPublishOptions
  ): Promise<OKPublishResult> {
    const { mediaUrls = [], attachment = {} } = options || {};

    // Загрузка медиа
    let mediaIds: string[] = [];
    if (mediaUrls.length > 0) {
      mediaIds = await this.uploadPhotos(mediaUrls);
    }

    const params: any = {
      type: 'GROUP_THEME',
      gid: groupId,
      attachment: {
        media: mediaIds.map(id => ({ type: 'photo', list: [{ id }] })),
        ...attachment
      }
    };

    if (content) {
      params.text = content;
    }

    const response = await this.callAPI('mediatopic.post', params);

    return {
      success: true,
      postId: response.topic_id,
      externalId: response.topic_id,
      externalUrl: `https://ok.ru/group/${groupId}/topic/${response.topic_id}`,
      publishedAt: new Date()
    };
  }

  private async uploadPhotos(photoUrls: string[]): Promise<string[]> {
    const photoIds: string[] = [];

    for (const url of photoUrls) {
      // 1. Получить URL для загрузки
      const uploadInfo = await this.callAPI('photosV2.getUploadUrl', {
        gid: groupId
      });

      // 2. Загрузить фото
      const photoResponse = await axios.get(url, { responseType: 'arraybuffer' });
      const formData = new FormData();
      formData.append('photo', Buffer.from(photoResponse.data), 'photo.jpg');

      const uploadResponse = await axios.post(uploadInfo.upload_url, formData);

      // 3. Сохранить фото
      const savedPhoto = await this.callAPI('photosV2.commit', {
        photo_id: uploadResponse.data.photos[0].token
      });

      photoIds.push(savedPhoto.photo_id);
    }

    return photoIds;
  }

  private async callAPI(method: string, params: any): Promise<any> {
    const requestParams = {
      application_key: this.applicationKey,
      format: 'json',
      method,
      ...params
    };

    const sig = this.calculateSignature(requestParams);

    const response = await axios.post(
      'https://api.ok.ru/fb.do',
      new URLSearchParams({
        ...requestParams,
        access_token: this.accessToken,
        sig
      })
    );

    if (response.data.error_code) {
      throw new Error(`OK API error: ${response.data.error_msg}`);
    }

    return response.data;
  }

  private calculateSignature(params: any): string {
    const sortedKeys = Object.keys(params).sort();
    const paramString = sortedKeys
      .map(key => `${key}=${params[key]}`)
      .join('');

    const signString = paramString + this.applicationSecretKey;
    
    return crypto.createHash('md5').update(signString).digest('hex');
  }
}
```

---

## 6. Универсальный Publisher Manager

### Управление всеми платформами из одного места

```typescript
// integrations/publisher-manager.ts
export class PublisherManager {
  private publishers: Map<Platform, any>;
  private metricsCollectors: Map<Platform, any>;

  constructor() {
    this.publishers = new Map();
    this.metricsCollectors = new Map();
  }

  registerPublisher(platform: Platform, publisher: any, metricsCollector: any) {
    this.publishers.set(platform, publisher);
    this.metricsCollectors.set(platform, metricsCollector);
  }

  async publish(
    platform: Platform,
    accountId: string,
    post: PostData
  ): Promise<PublishResult> {
    const publisher = this.publishers.get(platform);
    
    if (!publisher) {
      throw new Error(`Publisher for ${platform} not found`);
    }

    try {
      switch (platform) {
        case Platform.TELEGRAM:
          return await publisher.publish({
            channelId: accountId,
            content: post.content,
            mediaUrls: post.mediaUrls
          });

        case Platform.VK:
          return await publisher.publish({
            ownerId: parseInt(accountId),
            content: post.content,
            mediaUrls: post.mediaUrls
          });

        case Platform.FACEBOOK:
          return await publisher.publishPost(
            accountId,
            post.content,
            { mediaUrls: post.mediaUrls }
          );

        case Platform.INSTAGRAM:
          return await publisher.publishPost(
            accountId,
            post.content,
            post.mediaUrls[0],
            { children: post.mediaUrls.slice(1) }
          );

        case Platform.LINKEDIN:
          return await publisher.publishPost(
            accountId,
            post.content,
            { mediaUrls: post.mediaUrls }
          );

        default:
          throw new Error(`Unsupported platform: ${platform}`);
      }
    } catch (error) {
      console.error(`Error publishing to ${platform}:`, error);
      throw new PublishError(platform, error.message);
    }
  }

  async getMetrics(
    platform: Platform,
    postId: string,
    externalId: string
  ): Promise<UnifiedMetrics> {
    const collector = this.metricsCollectors.get(platform);
    
    if (!collector) {
      throw new Error(`Metrics collector for ${platform} not found`);
    }

    try {
      let platformMetrics: any;

      switch (platform) {
        case Platform.TELEGRAM:
          const [channelId, messageId] = externalId.split('_');
          platformMetrics = await collector.getPostMetrics(channelId, parseInt(messageId));
          break;

        case Platform.VK:
          const [ownerId, vkPostId] = externalId.split('_');
          platformMetrics = await collector.getPostMetrics(parseInt(ownerId), parseInt(vkPostId));
          break;

        case Platform.FACEBOOK:
          platformMetrics = await collector.getFacebookPostMetrics(externalId);
          break;

        case Platform.INSTAGRAM:
          platformMetrics = await collector.getInstagramPostMetrics(externalId);
          break;

        case Platform.LINKEDIN:
          platformMetrics = await collector.getPostMetrics(externalId);
          break;

        default:
          return this.getEmptyMetrics();
      }

      return this.normalizeMetrics(platform, platformMetrics);
    } catch (error) {
      console.error(`Error fetching metrics from ${platform}:`, error);
      return this.getEmptyMetrics();
    }
  }

  private normalizeMetrics(platform: Platform, metrics: any): UnifiedMetrics {
    // Нормализация метрик из разных платформ в единый формат
    return {
      views: metrics.views || metrics.impressions || 0,
      likes: metrics.likes || metrics.reactions || 0,
      comments: metrics.comments || 0,
      shares: metrics.shares || metrics.reposts || metrics.forwards || 0,
      clicks: metrics.clicks || 0,
      reach: metrics.reach || metrics.views || 0,
      impressions: metrics.impressions || metrics.views || 0,
      engagement: metrics.engagement || this.calculateEngagement(metrics),
      saves: metrics.saves || 0
    };
  }

  private calculateEngagement(metrics: any): number {
    const interactions = (metrics.likes || 0) + 
                        (metrics.comments || 0) + 
                        (metrics.shares || 0);
    const views = metrics.views || metrics.impressions || metrics.reach || 0;
    
    return views > 0 ? (interactions / views) * 100 : 0;
  }

  private getEmptyMetrics(): UnifiedMetrics {
    return {
      views: 0,
      likes: 0,
      comments: 0,
      shares: 0,
      clicks: 0,
      reach: 0,
      impressions: 0,
      engagement: 0,
      saves: 0
    };
  }
}
```

---

## 7. Управление токенами

### Token Storage

```typescript
// integrations/token-manager.ts
export class TokenManager {
  async saveToken(
    userId: string,
    platform: Platform,
    accountId: string,
    tokenData: TokenData
  ): Promise<void> {
    // Шифрование токена перед сохранением
    const encryptedToken = this.encrypt(tokenData.accessToken);
    const encryptedRefreshToken = tokenData.refreshToken 
      ? this.encrypt(tokenData.refreshToken) 
      : null;

    await db.socialAccounts.upsert({
      where: {
        userId_platform_accountId: { userId, platform, accountId }
      },
      update: {
        accessToken: encryptedToken,
        refreshToken: encryptedRefreshToken,
        expiresAt: tokenData.expiresAt,
        isActive: true
      },
      create: {
        userId,
        platform,
        accountId,
        accessToken: encryptedToken,
        refreshToken: encryptedRefreshToken,
        expiresAt: tokenData.expiresAt
      }
    });
  }

  async getToken(
    userId: string,
    platform: Platform,
    accountId: string
  ): Promise<string> {
    const account = await db.socialAccounts.findUnique({
      where: {
        userId_platform_accountId: { userId, platform, accountId }
      }
    });

    if (!account) {
      throw new Error('Account not found');
    }

    // Проверка срока действия
    if (account.expiresAt && new Date() >= account.expiresAt) {
      // Обновить токен если есть refresh token
      if (account.refreshToken) {
        return await this.refreshToken(userId, platform, accountId);
      }
      throw new TokenExpiredError('Token expired');
    }

    return this.decrypt(account.accessToken);
  }

  async refreshToken(
    userId: string,
    platform: Platform,
    accountId: string
  ): Promise<string> {
    const account = await db.socialAccounts.findUnique({
      where: { userId_platform_accountId: { userId, platform, accountId } }
    });

    if (!account?.refreshToken) {
      throw new Error('No refresh token available');
    }

    const refreshToken = this.decrypt(account.refreshToken);

    // Обновить токен в зависимости от платформы
    let newTokenData: TokenData;

    switch (platform) {
      case Platform.VK:
        // VK tokens не истекают
        newTokenData = {
          accessToken: this.decrypt(account.accessToken),
          expiresAt: null
        };
        break;

      case Platform.FACEBOOK:
      case Platform.INSTAGRAM:
        const metaAuth = new MetaAuth(
          process.env.META_APP_ID!,
          process.env.META_APP_SECRET!,
          ''
        );
        const newToken = await metaAuth.getLongLivedToken(refreshToken);
        newTokenData = {
          accessToken: newToken,
          expiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000) // 60 days
        };
        break;

      default:
        throw new Error(`Token refresh not implemented for ${platform}`);
    }

    await this.saveToken(userId, platform, accountId, newTokenData);
    return newTokenData.accessToken;
  }

  private encrypt(text: string): string {
    const cipher = crypto.createCipheriv(
      'aes-256-gcm',
      Buffer.from(process.env.ENCRYPTION_KEY!, 'hex'),
      crypto.randomBytes(16)
    );
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    return encrypted;
  }

  private decrypt(encrypted: string): string {
    const decipher = crypto.createDecipheriv(
      'aes-256-gcm',
      Buffer.from(process.env.ENCRYPTION_KEY!, 'hex'),
      Buffer.from(encrypted.split(':')[0], 'hex')
    );
    
    let decrypted = decipher.update(encrypted.split(':')[1], 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }
}
```

---

## 8. Error Handling

```typescript
// integrations/errors.ts
export class PublishError extends Error {
  constructor(
    public platform: Platform,
    message: string,
    public originalError?: any
  ) {
    super(`[${platform}] ${message}`);
    this.name = 'PublishError';
  }
}

export class TokenExpiredError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TokenExpiredError';
  }
}

export class RateLimitError extends Error {
  constructor(
    public platform: Platform,
    public retryAfter: number
  ) {
    super(`Rate limit exceeded for ${platform}. Retry after ${retryAfter}s`);
    this.name = 'RateLimitError';
  }
}
```

---

## 9. Rate Limiting

```typescript
// integrations/rate-limiter.ts
export class PlatformRateLimiter {
  private limits = new Map<Platform, RateLimitConfig>();
  private usage = new Map<string, RequestLog[]>();

  constructor() {
    // Настройка лимитов для каждой платформы
    this.limits.set(Platform.TELEGRAM, {
      requestsPerSecond: 30,
      requestsPerMinute: 20
    });
    
    this.limits.set(Platform.VK, {
      requestsPerSecond: 3,
      requestsPerMinute: 100
    });
    
    this.limits.set(Platform.FACEBOOK, {
      requestsPerHour: 200
    });
  }

  async acquire(platform: Platform, accountId: string): Promise<void> {
    const key = `${platform}:${accountId}`;
    const limit = this.limits.get(platform);
    
    if (!limit) return;

    const now = Date.now();
    const logs = this.usage.get(key) || [];
    
    // Очистка старых записей
    const validLogs = logs.filter(log => now - log.timestamp < 60000);
    
    // Проверка лимитов
    if (limit.requestsPerMinute && validLogs.length >= limit.requestsPerMinute) {
      const oldestLog = validLogs[0];
      const waitTime = 60000 - (now - oldestLog.timestamp);
      
      throw new RateLimitError(platform, Math.ceil(waitTime / 1000));
    }

    // Добавление записи
    validLogs.push({ timestamp: now });
    this.usage.set(key, validLogs);
  }
}
```

---

## 10. Testing

### Unit Tests

```typescript
// integrations/__tests__/telegram-publisher.test.ts
describe('TelegramPublisher', () => {
  let publisher: TelegramPublisher;

  beforeEach(() => {
    publisher = new TelegramPublisher('test-token');
  });

  it('should publish text post', async () => {
    const result = await publisher.publish({
      channelId: '@test_channel',
      content: 'Test post'
    });

    expect(result.success).toBe(true);
    expect(result.externalId).toBeDefined();
  });

  it('should publish post with image', async () => {
    const result = await publisher.publish({
      channelId: '@test_channel',
      content: 'Test with image',
      mediaUrls: ['https://example.com/image.jpg']
    });

    expect(result.success).toBe(true);
  });
});
```

---

**См. также:**
- [Publishing Service](../services/publishing-service.md)
- [API Security](../security/api-security.md)
- [Error Handling](../development/error-handling.md)
