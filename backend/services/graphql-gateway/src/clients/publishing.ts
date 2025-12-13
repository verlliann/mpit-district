import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import path from 'path';

// In Docker: /app/proto/publishing.proto (from dist/clients/ -> ../../proto)
// Locally: from src/clients/ -> ../../../../proto
const PUBLISHING_PROTO_PATH = process.env.NODE_ENV === 'production' 
  ? path.join(__dirname, '../../proto/publishing.proto')
  : path.join(__dirname, '../../../../proto/publishing.proto');

const PROTO_DIR = process.env.NODE_ENV === 'production'
  ? path.join(__dirname, '../../proto')
  : path.join(__dirname, '../../../../proto');

const PUBLISHING_GRPC_URL = process.env.PUBLISHING_GRPC_URL || 'localhost:50054';

const packageDefinition = protoLoader.loadSync(PUBLISHING_PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
  includeDirs: [PROTO_DIR],
});

const protoDescriptor = grpc.loadPackageDefinition(packageDefinition) as any;
const PublishingService = protoDescriptor.publishing.PublishingService;

// Platform enum mapping (same as ai-engine.ts)
export const PlatformEnum = {
  TELEGRAM: 1,
  VK: 2,
  INSTAGRAM: 3,
  LINKEDIN: 4,
  TWITTER: 5,
  FACEBOOK: 6,
};

export class PublishingClient {
  private client: any;

  constructor(url: string = PUBLISHING_GRPC_URL) {
    this.client = new PublishingService(
      url,
      grpc.credentials.createInsecure()
    );
  }

  async healthCheck(): Promise<boolean> {
    return new Promise((resolve) => {
      this.client.HealthCheck({}, (error: any, response: any) => {
        if (error) {
          console.error('Publishing Service health check failed:', error.message);
          resolve(false);
        } else {
          resolve(response?.status === 'serving');
        }
      });
    });
  }

  async publishPost(
    postId: string,
    socialAccountId: string,
    platform: string,
    content: string,
    imageUrls?: string[],
    options?: any
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      const platformKey = platform.toUpperCase() as keyof typeof PlatformEnum;
      const platformEnum = PlatformEnum[platformKey] || 1;

      const request = {
        post_id: postId,
        social_account_id: socialAccountId,
        platform: platformEnum,
        content,
        image_urls: imageUrls || [],
        video_urls: [],
        options: {
          disable_comments: options?.disableComments ?? false,
          disable_notifications: options?.disableNotifications ?? false,
          link_preview_url: options?.linkPreviewUrl || '',
          hashtags: options?.hashtags || [],
          mentions: options?.mentions || [],
        },
      };

      this.client.PublishPost(request, (error: any, response: any) => {
        if (error) {
          reject(error);
        } else {
          resolve(response);
        }
      });
    });
  }

  async schedulePost(
    postId: string,
    scheduledAt: Date,
    publishRequest: any
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      const request = {
        post_id: postId,
        scheduled_at: {
          seconds: Math.floor(scheduledAt.getTime() / 1000),
          nanos: 0,
        },
        publish_request: publishRequest,
      };

      this.client.SchedulePost(request, (error: any, response: any) => {
        if (error) {
          reject(error);
        } else {
          resolve(response);
        }
      });
    });
  }

  async cancelScheduledPost(postId: string, jobId?: string): Promise<any> {
    return new Promise((resolve, reject) => {
      const request = {
        post_id: postId,
        job_id: jobId || '',
      };

      this.client.CancelScheduledPost(request, (error: any, response: any) => {
        if (error) {
          reject(error);
        } else {
          resolve(response);
        }
      });
    });
  }

  async collectMetrics(postId: string, externalId: string, platform: string, socialAccountId: string): Promise<any> {
    return new Promise((resolve, reject) => {
      const platformKey = platform.toUpperCase() as keyof typeof PlatformEnum;
      const platformEnum = PlatformEnum[platformKey] || 1;

      const request = {
        post_id: postId,
        external_id: externalId,
        platform: platformEnum,
        social_account_id: socialAccountId,
      };

      this.client.CollectMetrics(request, (error: any, response: any) => {
        if (error) {
          reject(error);
        } else {
          resolve(response);
        }
      });
    });
  }

  async testConnection(socialAccountId: string, platform: string, accessToken: string): Promise<any> {
    return new Promise((resolve, reject) => {
      const platformKey = platform.toUpperCase() as keyof typeof PlatformEnum;
      const platformEnum = PlatformEnum[platformKey] || 1;

      const request = {
        social_account_id: socialAccountId,
        platform: platformEnum,
        access_token: accessToken,
      };

      this.client.TestConnection(request, (error: any, response: any) => {
        if (error) {
          reject(error);
        } else {
          resolve(response);
        }
      });
    });
  }

  async getPlatformLimits(platform: string): Promise<any> {
    return new Promise((resolve, reject) => {
      const platformKey = platform.toUpperCase() as keyof typeof PlatformEnum;
      const platformEnum = PlatformEnum[platformKey] || 1;

      this.client.GetPlatformLimits({ platform: platformEnum }, (error: any, response: any) => {
        if (error) {
          reject(error);
        } else {
          resolve(response);
        }
      });
    });
  }
}

