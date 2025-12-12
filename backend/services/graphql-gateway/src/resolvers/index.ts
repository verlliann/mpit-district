import { GraphQLScalarType, Kind } from 'graphql';
import { StorageClient } from '../clients/storage';
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

    // Analytics (mock for now)
    analytics: async (_: any, { from, to, platforms }: any, context: Context) => {
      // TODO: Implement analytics aggregation
      return {
        totalPosts: 0,
        totalReach: 0,
        totalEngagement: 0,
        averageEngagement: 0,
        topPosts: [],
        platformBreakdown: [],
        timeline: [],
      };
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
        // TODO: Call parser service
        // For now, return mock error
        return {
          article: null,
          error: 'Parser service not available yet',
        };
      } catch (error: any) {
        return {
          article: null,
          error: error.message,
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
        // TODO: Call AI engine service
        return [];
      } catch (error) {
        throw new Error('AI Engine service not available yet');
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
        // TODO: Call publishing service
        return {
          post: null,
          success: false,
          error: 'Publishing service not available yet',
        };
      } catch (error: any) {
        return {
          post: null,
          success: false,
          error: error.message,
        };
      }
    },

    publishBatch: async (_: any, { ids }: { ids: string[] }, context: Context) => {
      // TODO: Implement batch publishing
      return ids.map((id) => ({
        post: null,
        success: false,
        error: 'Publishing service not available yet',
      }));
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

    deletePost: async (_: any, { id }: { id: string }, context: Context) => {
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

    updateTemplate: async (_: any, { id, content }: any, context: Context) => {
      // TODO: Implement template update
      throw new Error('Not implemented');
    },

    deleteTemplate: async (_: any, { id }: { id: string }, context: Context) => {
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
    updatePreferences: async (_: any, { preferences }: any, context: Context) => {
      if (!context.userId) {
        throw new Error('Unauthorized');
      }
      // TODO: Update user preferences
      return context.user;
    },

    // Notifications
    markNotificationRead: async (_: any, { id }: { id: string }) => {
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

