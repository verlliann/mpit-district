import { GraphQLScalarType, Kind } from 'graphql';
import { StorageClient } from '../clients/storage';
import { ParserClient } from '../clients/parser';
import { AIEngineClient } from '../clients/ai-engine';
import { PublishingClient } from '../clients/publishing';
import { PubSub } from 'graphql-subscriptions';
import { pool } from '../clients/postgres';

const pubsub = new PubSub();

// Custom scalar for DateTime
const DateTimeScalar = new GraphQLScalarType({
  name: 'DateTime',
  description: 'DateTime custom scalar type',
  serialize(value: any) {
    if (value instanceof Date) {
      return value.toISOString();
    }
    return value;
  },
  parseValue(value: any) {
    return new Date(value);
  },
  parseLiteral(ast) {
    if (ast.kind === Kind.STRING) {
      return new Date(ast.value);
    }
    return null;
  },
});

// Custom scalar for JSON
const JSONScalar = new GraphQLScalarType({
  name: 'JSON',
  description: 'JSON custom scalar type',
  serialize(value: any) {
    return value;
  },
  parseValue(value: any) {
    return value;
  },
  parseLiteral(ast) {
    if (ast.kind === Kind.OBJECT) {
      return ast;
    }
    return null;
  },
});

interface Context {
  storageClient: StorageClient;
  parserClient: ParserClient;
  aiEngineClient: AIEngineClient;
  publishingClient: PublishingClient;
  userId?: string;
  user?: any;
}

export const resolvers = {
  DateTime: DateTimeScalar,
  JSON: JSONScalar,

  Query: {
    // Articles
    article: async (_: any, { id }: { id: string }, context: Context) => {
      const article = await context.storageClient.getArticle(id);
      return article;
    },

    articles: async (
      _: any,
      { limit = 20, offset = 0, filter }: any,
      context: Context
    ) => {
      const response = await context.storageClient.listArticles(limit, offset, filter);
      return {
        nodes: response.articles || [],
        pageInfo: {
          hasNextPage: response.pagination?.has_next_page || false,
          hasPreviousPage: response.pagination?.has_previous_page || false,
          totalCount: response.pagination?.total_count || 0,
        },
        totalCount: response.pagination?.total_count || 0,
      };
    },

    // Posts
    post: async (_: any, { id }: { id: string }, context: Context) => {
      const post = await context.storageClient.getPost(id);
      return post;
    },

    posts: async (
      _: any,
      { limit = 20, offset = 0, filter }: any,
      context: Context
    ) => {
      try {
        // Прямой запрос к PostgreSQL (временно, до реализации Storage Service)
        const result = await pool.query(`
          SELECT 
            p.id, p.platform, p.content, p.style, p.status,
            p.scheduled_at, p.published_at, p.created_at, p.updated_at,
            a.id as article_id, a.title as article_title, a.source as article_source,
            (SELECT json_agg(json_build_object(
              'id', i.id, 
              'url', i.url, 
              'thumbnailUrl', i.thumbnail_url
            )) FROM images i 
            JOIN post_images pi ON i.id = pi.image_id 
            WHERE pi.post_id = p.id) as images,
            (SELECT row_to_json(m) FROM (
              SELECT views, likes, comments, shares, reach, engagement_rate as engagement
              FROM metrics WHERE post_id = p.id 
              ORDER BY collected_at DESC LIMIT 1
            ) m) as metrics
          FROM posts p
          LEFT JOIN articles a ON p.article_id = a.id
          ORDER BY p.created_at DESC
          LIMIT $1 OFFSET $2
        `, [limit, offset]);

        const countResult = await pool.query('SELECT COUNT(*) FROM posts');
        const totalCount = parseInt(countResult.rows[0].count);

        return {
          nodes: result.rows.map((row: any) => ({
            id: row.id,
            platform: row.platform,
            content: row.content,
            style: row.style,
            status: row.status,
            scheduledAt: row.scheduled_at,
            publishedAt: row.published_at,
            createdAt: row.created_at,
            updatedAt: row.updated_at,
            article: row.article_id ? {
              id: row.article_id,
              title: row.article_title,
              source: row.article_source,
            } : null,
            images: row.images || [],
            metrics: row.metrics,
          })),
          pageInfo: {
            hasNextPage: offset + limit < totalCount,
            hasPreviousPage: offset > 0,
            totalCount,
          },
          totalCount,
        };
      } catch (error) {
        console.error('Error fetching posts:', error);
        return {
          nodes: [],
          pageInfo: { hasNextPage: false, hasPreviousPage: false, totalCount: 0 },
          totalCount: 0,
        };
      }
    },

    scheduledPosts: async (_: any, { from, to }: any, context: Context) => {
      try {
        const fromDate = from ? new Date(from) : new Date();
        const toDate = to ? new Date(to) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
        
        const result = await pool.query(`
          SELECT 
            p.id, p.platform, p.content, p.status, p.scheduled_at,
            (SELECT json_agg(json_build_object('id', i.id, 'thumbnailUrl', i.thumbnail_url))
             FROM images i 
             JOIN post_images pi ON i.id = pi.image_id 
             WHERE pi.post_id = p.id) as images,
            a.id as article_id, a.title as article_title
          FROM posts p
          LEFT JOIN articles a ON p.article_id = a.id
          WHERE p.status = 'SCHEDULED'
            AND p.scheduled_at >= $1
            AND p.scheduled_at <= $2
          ORDER BY p.scheduled_at ASC
        `, [fromDate, toDate]);

        return result.rows.map((row: any) => ({
          id: row.id,
          platform: row.platform,
          content: row.content,
          status: row.status,
          scheduledAt: row.scheduled_at,
          images: row.images || [],
          article: row.article_id ? {
            id: row.article_id,
            title: row.article_title
          } : null
        }));
      } catch (error: any) {
        console.error('Error fetching scheduled posts:', error);
        return [];
      }
    },

    // Analytics - реальные данные из БД
    analytics: async (_: any, { from, to, platforms }: any, _context: Context) => {
      try {
        const fromDate = from ? new Date(from) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const toDate = to ? new Date(to) : new Date();
        
        // Получаем статистику постов
        const postsResult = await pool.query(`
          SELECT 
            COUNT(*) as total_posts,
            COALESCE(SUM(m.views), 0) as total_reach,
            COALESCE(SUM(m.likes + m.comments + m.shares), 0) as total_engagement
          FROM posts p
          LEFT JOIN metrics m ON p.id = m.post_id
          WHERE p.created_at >= $1 AND p.created_at <= $2
        `, [fromDate, toDate]);
        
        const stats = postsResult.rows[0];
        const totalPosts = parseInt(stats.total_posts) || 0;
        const totalReach = parseInt(stats.total_reach) || 0;
        const totalEngagement = parseInt(stats.total_engagement) || 0;
        
        // Топ посты по вовлеченности
        const topPostsResult = await pool.query(`
          SELECT p.id, p.platform, p.content, 
                 COALESCE(m.views, 0) as views,
                 COALESCE(m.likes, 0) as likes,
                 COALESCE(m.engagement_rate, 0) as engagement_rate
          FROM posts p
          LEFT JOIN metrics m ON p.id = m.post_id
          WHERE p.created_at >= $1 AND p.created_at <= $2
          ORDER BY m.engagement_rate DESC NULLS LAST
          LIMIT 5
        `, [fromDate, toDate]);
        
        // Разбивка по платформам
        const platformResult = await pool.query(`
          SELECT 
            p.platform,
            COUNT(*) as post_count,
            COALESCE(SUM(m.views), 0) as total_views,
            COALESCE(AVG(m.engagement_rate), 0) as avg_engagement
          FROM posts p
          LEFT JOIN metrics m ON p.id = m.post_id
          WHERE p.created_at >= $1 AND p.created_at <= $2
          GROUP BY p.platform
        `, [fromDate, toDate]);
        
        // Получаем данные для timeline
        const timelineResult = await pool.query(`
          SELECT 
            DATE(p.created_at) as date,
            COUNT(*) as posts,
            COALESCE(SUM(m.views), 0) as views,
            COALESCE(SUM(m.likes), 0) as likes,
            COALESCE(SUM(m.views), 0) as reach,
            COALESCE(AVG(m.engagement_rate), 0) as engagement
          FROM posts p
          LEFT JOIN metrics m ON p.id = m.post_id
          WHERE p.created_at >= $1 AND p.created_at <= $2
          GROUP BY DATE(p.created_at)
          ORDER BY DATE(p.created_at) ASC
        `, [fromDate, toDate]);
        
        return {
          totalPosts,
          totalReach,
          totalEngagement,
          averageEngagement: totalPosts > 0 ? totalEngagement / totalPosts : 0,
          topPosts: topPostsResult.rows.map((row: any) => ({
            id: row.id,
            platform: row.platform,
            content: row.content?.substring(0, 100) || '',
            status: 'PUBLISHED',
            style: 'NEUTRAL',
            createdAt: new Date(),
            updatedAt: new Date(),
            metrics: {
              views: parseInt(row.views) || 0,
              likes: parseInt(row.likes) || 0,
              comments: 0,
              shares: 0,
              engagement: parseFloat(row.engagement_rate) || 0,
            },
          })),
          platformBreakdown: platformResult.rows.map((row: any) => ({
            platform: row.platform,
            posts: parseInt(row.post_count) || 0,
            reach: parseInt(row.total_views) || 0,
            engagement: parseFloat(row.avg_engagement) || 0,
            avgViews: parseInt(row.total_views) / Math.max(parseInt(row.post_count), 1) || 0,
            avgLikes: 0,
          })),
          timeline: timelineResult.rows.map((row: any) => ({
            date: row.date,
            posts: parseInt(row.posts) || 0,
            reach: parseInt(row.reach) || 0,
            engagement: parseFloat(row.engagement) || 0,
            views: parseInt(row.views) || 0,
            likes: parseInt(row.likes) || 0,
          })),
        };
      } catch (error: any) {
        console.error('Error fetching analytics:', error);
        return {
          totalPosts: 0,
          totalReach: 0,
          totalEngagement: 0,
          averageEngagement: 0,
          topPosts: [],
          platformBreakdown: [],
          timeline: [],
        };
      }
    },

    // Templates
    templates: async (_: any, { platform }: any, context: Context) => {
      const response = await context.storageClient.listTemplates({ platform });
      return response.templates || [];
    },

    // Social Accounts
    socialAccounts: async (_: any, __: any, context: Context) => {
      if (!context.userId) {
        throw new Error('Unauthorized');
      }
      const response = await context.storageClient.listSocialAccounts(context.userId);
      return response.accounts || [];
    },

    // User (mock for now)
    me: async (_: any, __: any, context: Context) => {
      if (!context.userId) {
        throw new Error('Unauthorized');
      }
      // TODO: Get user from database
      return {
        id: context.userId,
        email: 'admin@newsmaker.dev',
        name: 'Admin User',
        role: 'ADMIN',
        avatar: null,
        preferences: {
          defaultPlatforms: ['TELEGRAM', 'VK'],
          defaultStyle: 'NEUTRAL',
          formalityLevel: 5,
          autoPublish: false,
          notifications: {
            email: true,
            push: false,
            newMentions: true,
            publishSuccess: true,
            publishFailure: true,
          },
        },
        createdAt: new Date(),
      };
    },

    // Notifications (mock for now)
    notifications: async (_: any, { limit = 20, offset = 0, unreadOnly = false }: any) => {
      // TODO: Implement notifications
      return [];
    },
  },

  Mutation: {
    // Articles
    parseArticle: async (_: any, { url }: { url: string }, context: Context) => {
      try {
        console.log(`Parsing article: ${url}`);
        const result = await context.parserClient.parseArticle(url);
        
        if (result.error) {
          return {
            article: null,
            error: result.error,
            progress: 0,
          };
        }
        
        // Сохраняем статью в базу
        if (result.article) {
          const articleData = result.article;
          
          // Маппинг sentiment из proto в PostgreSQL enum
          const mapSentiment = (s: string): string => {
            if (!s || s === 'SENTIMENT_UNSPECIFIED') return 'NEUTRAL';
            if (s === 'SENTIMENT_POSITIVE' || s === 'POSITIVE') return 'POSITIVE';
            if (s === 'SENTIMENT_NEGATIVE' || s === 'NEGATIVE') return 'NEGATIVE';
            if (s === 'SENTIMENT_NEUTRAL' || s === 'NEUTRAL') return 'NEUTRAL';
            return 'NEUTRAL';
          };
          
          const insertResult = await pool.query(`
            INSERT INTO articles (url, title, content, excerpt, source, author, published_at, sentiment, sentiment_score)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            ON CONFLICT (url) DO UPDATE SET
              title = EXCLUDED.title,
              content = EXCLUDED.content,
              updated_at = NOW()
            RETURNING *
          `, [
            url,
            articleData.title || 'Без названия',
            articleData.content || '',
            articleData.excerpt || articleData.content?.substring(0, 200) || '',
            articleData.source || new URL(url).hostname,
            articleData.author || null,
            articleData.published_at || new Date(),
            mapSentiment(articleData.sentiment),
            articleData.sentiment_score || 0.5
          ]);
          
          const savedArticle = insertResult.rows[0];
          
          // Добавляем id к entities, если их нет
          const entitiesWithIds = (articleData.entities || []).map((e: any, idx: number) => ({
            id: e.id || `entity-${savedArticle.id}-${idx}`,
            name: e.name,
            type: e.type || 'OTHER',
            mentions: e.mentions || 1,
            confidence: e.confidence || 0.8
          }));
          
          // Добавляем id к facts, если их нет
          const factsWithIds = (articleData.facts || []).map((f: any, idx: number) => ({
            id: f.id || `fact-${savedArticle.id}-${idx}`,
            text: f.text || f.content,
            importance: f.importance || 5,
            orderIndex: idx
          }));
          
          // Добавляем id к quotes, если их нет
          const quotesWithIds = (articleData.quotes || []).map((q: any, idx: number) => ({
            id: q.id || `quote-${savedArticle.id}-${idx}`,
            text: q.text,
            author: q.author,
            orderIndex: idx
          }));
          
          return {
            article: {
              id: savedArticle.id,
              url: savedArticle.url,
              title: savedArticle.title,
              content: savedArticle.content,
              excerpt: savedArticle.excerpt,
              source: savedArticle.source,
              author: savedArticle.author,
              publishedAt: savedArticle.published_at,
              sentiment: savedArticle.sentiment,
              sentimentScore: savedArticle.sentiment_score,
              facts: factsWithIds,
              entities: entitiesWithIds,
              quotes: quotesWithIds,
              images: []
            },
            error: null,
            progress: 100,
          };
        }
        
        return {
          article: null,
          error: 'No article data returned from parser',
          progress: 0,
        };
      } catch (error: any) {
        console.error('Parse article error:', error);
        return {
          article: null,
          error: error.message || 'Failed to parse article',
          progress: 0,
        };
      }
    },

    deleteArticle: async (_: any, { id }: { id: string }, context: Context) => {
      await context.storageClient.deleteArticle(id);
      return true;
    },

    // Posts
    createPost: async (_: any, { input }: any, context: Context) => {
      try {
        const { platform, content, style, status, scheduledAt } = input;
        
        const result = await pool.query(`
          INSERT INTO posts (platform, content, style, status, scheduled_at)
          VALUES ($1, $2, $3, $4, $5)
          RETURNING id, platform, content, style, status, scheduled_at, created_at
        `, [platform, content, style || 'NEUTRAL', status || 'DRAFT', scheduledAt]);

        const row = result.rows[0];
        return {
          id: row.id,
          platform: row.platform,
          content: row.content,
          style: row.style,
          status: row.status,
          scheduledAt: row.scheduled_at,
          createdAt: row.created_at
        };
      } catch (error: any) {
        console.error('Error creating post:', error);
        throw new Error('Не удалось создать пост: ' + error.message);
      }
    },

    generatePosts: async (_: any, { input }: any, context: Context) => {
      try {
        const { articleId, platforms, style, formalityLevel, customInstructions } = input;
        
        // Получаем статью для генерации
        let articleContent = '';
        let articleTitle = '';
        
        if (articleId) {
          const articleResult = await pool.query(
            'SELECT title, content FROM articles WHERE id = $1',
            [articleId]
          );
          if (articleResult.rows.length > 0) {
            articleContent = articleResult.rows[0].content;
            articleTitle = articleResult.rows[0].title;
          }
        }
        
        if (!articleContent) {
          throw new Error('Статья не найдена или не содержит контента');
        }
        
        console.log(`Generating posts for article ${articleId}, platforms: ${platforms}`);
        
        // Формируем инструкции с контентом статьи
        const fullInstructions = `
СТАТЬЯ ДЛЯ АДАПТАЦИИ:
Заголовок: ${articleTitle}

Текст статьи:
${articleContent.substring(0, 8000)}

${customInstructions ? `Дополнительные инструкции: ${customInstructions}` : ''}
`.trim();
        
        // Вызов AI Engine для генерации постов
        const response = await context.aiEngineClient.generatePosts(
          articleId,
          platforms || ['TELEGRAM', 'VK'],
          style || 'NEUTRAL',
          formalityLevel || 5,
          [],
          fullInstructions
        );
        
        if (!response.success) {
          throw new Error(response.error || 'Ошибка генерации постов');
        }
        
        // Маппинг platform enum к строке
        const platformMap: Record<number, string> = {
          1: 'TELEGRAM',
          2: 'VK',
          3: 'INSTAGRAM',
          4: 'LINKEDIN',
          5: 'TWITTER',
          6: 'FACEBOOK',
        };
        
        const styleMap: Record<number, string> = {
          1: 'NEUTRAL',
          2: 'FORMAL',
          3: 'ENGAGING',
          4: 'INFORMAL',
          5: 'BUSINESS',
          6: 'CREATIVE',
        };
        
        // Функция генерации изображения через Pollinations.ai
        const generateImageUrl = (content: string): string => {
          // Создаём промпт на основе контента
          const cleanContent = content.replace(/[#@\n]/g, ' ').substring(0, 200);
          const prompt = encodeURIComponent(`Modern digital illustration for social media post about: ${cleanContent}, vibrant colors, professional, clean design`);
          return `https://image.pollinations.ai/prompt/${prompt}?width=1080&height=1080&nologo=true`;
        };
        
        // Сохраняем сгенерированные посты в БД
        const savedPosts = [];
        for (const post of response.posts || []) {
          const platform = platformMap[post.platform] || 'TELEGRAM';
          const postStyle = styleMap[post.style] || 'NEUTRAL';
          
          // Генерируем изображение для поста
          const imageUrl = generateImageUrl(post.content);
          
          // Используем дефолтный user_id для демо
          const defaultUserId = '00000000-0000-0000-0000-000000000001';
          const insertResult = await pool.query(`
            INSERT INTO posts (user_id, article_id, platform, content, style, status)
            VALUES ($1, $2, $3, $4, $5, 'DRAFT')
            RETURNING id, platform, content, style, status, created_at
          `, [defaultUserId, articleId, platform, post.content, postStyle]);
          
          const savedPost = insertResult.rows[0];
          savedPosts.push({
            id: savedPost.id,
            platform: savedPost.platform,
            content: savedPost.content,
            style: savedPost.style,
            status: savedPost.status,
            createdAt: savedPost.created_at,
            article: {
              id: articleId,
              title: articleTitle,
            },
            qualityScore: post.quality_score,
            estimatedReach: post.estimated_reach,
            hashtags: post.hashtags || [],
            images: [{ id: `img-${savedPost.id}`, url: imageUrl, thumbnailUrl: imageUrl }],
          });
        }
        
        console.log(`Generated ${savedPosts.length} posts with images`);
        return savedPosts;
      } catch (error: any) {
        console.error('Error generating posts:', error);
        throw new Error(`Ошибка генерации постов: ${error.message}`);
      }
    },

    updatePost: async (_: any, { id, input }: any, context: Context) => {
      try {
        const updates: string[] = [];
        const values: any[] = [id];
        let paramIndex = 2;

        if (input.content !== undefined) {
          updates.push(`content = $${paramIndex++}`);
          values.push(input.content);
        }
        if (input.scheduledAt !== undefined) {
          updates.push(`scheduled_at = $${paramIndex++}`);
          values.push(input.scheduledAt);
        }

        if (updates.length === 0) {
          throw new Error('Нет данных для обновления');
        }

        updates.push(`updated_at = NOW()`);

        const query = `
          UPDATE posts 
          SET ${updates.join(', ')}
          WHERE id = $1
          RETURNING id, platform, content, status, created_at, updated_at
        `;

        const result = await pool.query(query, values);
        
        if (result.rows.length === 0) {
          throw new Error('Пост не найден');
        }

        return result.rows[0];
      } catch (error: any) {
        console.error('Error updating post:', error);
        throw new Error(error.message || 'Не удалось обновить пост');
      }
    },

    publishPost: async (_: any, { id }: { id: string }, context: Context) => {
      try {
        console.log('Publishing post:', id);
        
        // Получаем пост из БД
        const postResult = await pool.query(`
          SELECT p.*, a.title as article_title
          FROM posts p
          LEFT JOIN articles a ON p.article_id = a.id
          WHERE p.id = $1
        `, [id]);
        
        if (postResult.rows.length === 0) {
          return {
            post: null,
            success: false,
            error: 'Пост не найден',
          };
        }
        
        const post = postResult.rows[0];
        
        // Генерируем URL изображения для поста
        const cleanContent = post.content.replace(/[#@\n]/g, ' ').substring(0, 150);
        const imagePrompt = encodeURIComponent(`Modern illustration for: ${cleanContent}, vibrant, professional`);
        const imageUrl = `https://image.pollinations.ai/prompt/${imagePrompt}?width=1080&height=1080&nologo=true`;
        
        // Вызов Publishing Service
        const response = await context.publishingClient.publishPost(
          id,
          'default-account',
          post.platform,
          post.content,
          [imageUrl] // Передаём сгенерированное изображение
        );
        
        if (!response.success) {
          // Обновляем статус поста на FAILED
          await pool.query(
            `UPDATE posts SET status = 'FAILED', updated_at = NOW() WHERE id = $1`,
            [id]
          );
          
          return {
            post: null,
            success: false,
            error: response.error || 'Ошибка публикации',
          };
        }
        
        // Обновляем статус поста на PUBLISHED
        const updateResult = await pool.query(`
          UPDATE posts 
          SET status = 'PUBLISHED', 
              published_at = NOW(),
              updated_at = NOW()
          WHERE id = $1
          RETURNING *
        `, [id]);
        
        const updatedPost = updateResult.rows[0];
        
        // Публикуем событие для подписчиков
        pubsub.publish(`POST_STATUS_${id}`, {
          postStatusChanged: {
            id: updatedPost.id,
            status: 'PUBLISHED',
            publishedAt: updatedPost.published_at,
          },
        });
        
        return {
          post: {
            id: updatedPost.id,
            platform: updatedPost.platform,
            content: updatedPost.content,
            status: 'PUBLISHED',
            publishedAt: updatedPost.published_at,
          },
          success: true,
          error: null,
        };
      } catch (error: any) {
        console.error('Error publishing post:', error);
        return {
          post: null,
          success: false,
          error: error.message || 'Ошибка публикации',
        };
      }
    },

    publishBatch: async (_: any, { ids }: { ids: string[] }, context: Context) => {
      const results = [];
      
      for (const id of ids) {
        try {
          // Получаем пост из БД
          const postResult = await pool.query(
            'SELECT * FROM posts WHERE id = $1',
            [id]
          );
          
          if (postResult.rows.length === 0) {
            results.push({
              post: null,
              success: false,
              error: `Пост ${id} не найден`,
            });
            continue;
          }
          
          const post = postResult.rows[0];
          
          // Вызов Publishing Service
          const response = await context.publishingClient.publishPost(
            id,
            'default-account',
            post.platform,
            post.content
          );
          
          if (response.success) {
            await pool.query(`
              UPDATE posts 
              SET status = 'PUBLISHED', published_at = NOW(), updated_at = NOW()
              WHERE id = $1
            `, [id]);
            
            results.push({
              post: { id, platform: post.platform, status: 'PUBLISHED' },
              success: true,
              error: null,
            });
          } else {
            results.push({
              post: null,
              success: false,
              error: response.error || 'Ошибка публикации',
            });
          }
        } catch (error: any) {
          results.push({
            post: null,
            success: false,
            error: error.message,
          });
        }
      }
      
      return results;
    },

    schedulePost: async (_: any, { id, scheduledAt }: any, context: Context) => {
      const post = await context.storageClient.updatePost(id, {
        status: 'SCHEDULED',
        scheduled_at: scheduledAt,
      });
      return post;
    },

    cancelScheduledPost: async (_: any, { id }: { id: string }, context: Context) => {
      await context.storageClient.updatePost(id, {
        status: 'CANCELLED',
      });
      return true;
    },

    deletePost: async (_: any, { id }: { id: string }, _context: Context) => {
      try {
        await pool.query('DELETE FROM posts WHERE id = $1', [id]);
        return true;
      } catch (error) {
        console.error('Error deleting post:', error);
        throw new Error('Не удалось удалить пост');
      }
    },

    // Templates
    createTemplate: async (_: any, args: any, context: Context) => {
      if (!context.userId) {
        throw new Error('Unauthorized');
      }
      const template = await context.storageClient.saveTemplate({
        user_id: context.userId,
        ...args,
      });
      return template;
    },

    updateTemplate: async (_: any, { id: _id, content: _content }: any, _context: Context) => {
      // TODO: Implement template update
      throw new Error('Not implemented');
    },

    deleteTemplate: async (_: any, { id: _id }: { id: string }, _context: Context) => {
      // TODO: Implement template deletion
      return true;
    },

    // Social Accounts
    connectSocialAccount: async (_: any, { input }: any, context: Context) => {
      if (!context.userId) {
        throw new Error('Unauthorized');
      }
      const account = await context.storageClient.saveSocialAccount({
        user_id: context.userId,
        ...input,
      });
      return account;
    },

    disconnectSocialAccount: async (_: any, { id }: { id: string }, context: Context) => {
      await context.storageClient.deleteSocialAccount(id);
      return true;
    },

    // User
    updatePreferences: async (_: any, { preferences: _preferences }: any, context: Context) => {
      if (!context.userId) {
        throw new Error('Unauthorized');
      }
      // TODO: Update user preferences
      return context.user;
    },

    // Notifications
    markNotificationRead: async (_: any, { id: _id }: { id: string }) => {
      // TODO: Implement
      return true;
    },

    markAllNotificationsRead: async () => {
      // TODO: Implement
      return true;
    },
  },

  Subscription: {
    postStatusChanged: {
      subscribe: (_: any, { postId }: { postId: string }) => {
        return pubsub.asyncIterator(`POST_STATUS_${postId}`);
      },
    },

    metricsUpdated: {
      subscribe: (_: any, { postId }: { postId: string }) => {
        return pubsub.asyncIterator(`METRICS_${postId}`);
      },
    },

    notificationReceived: {
      subscribe: () => {
        return pubsub.asyncIterator('NOTIFICATION_RECEIVED');
      },
    },

    parsingProgress: {
      subscribe: (_: any, { articleId }: { articleId: string }) => {
        return pubsub.asyncIterator(`PARSING_PROGRESS_${articleId}`);
      },
    },
  },
};

export { pubsub };

