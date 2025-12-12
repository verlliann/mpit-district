import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import path from 'path';

const PROTO_PATH = path.join(__dirname, '../../../../proto/storage.proto');

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
  includeDirs: [path.join(__dirname, '../../../../proto')],
});

const storageProto = grpc.loadPackageDefinition(packageDefinition) as any;

export class StorageClient {
  private client: any;

  constructor(serverAddress: string) {
    this.client = new storageProto.storage.StorageService(
      serverAddress,
      grpc.credentials.createInsecure()
    );
  }

  // Articles
  async saveArticle(data: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this.client.SaveArticle(data, (error: any, response: any) => {
        if (error) reject(error);
        else resolve(response);
      });
    });
  }

  async getArticle(id: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.client.GetArticle({ id }, (error: any, response: any) => {
        if (error) reject(error);
        else resolve(response);
      });
    });
  }

  async listArticles(limit: number, offset: number, filter?: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this.client.ListArticles(
        {
          pagination: { limit, offset },
          ...filter,
        },
        (error: any, response: any) => {
          if (error) reject(error);
          else resolve(response);
        }
      );
    });
  }

  async updateArticle(id: string, updates: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this.client.UpdateArticle({ id, ...updates }, (error: any, response: any) => {
        if (error) reject(error);
        else resolve(response);
      });
    });
  }

  async deleteArticle(id: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.client.DeleteArticle({ id }, (error: any, response: any) => {
        if (error) reject(error);
        else resolve(response);
      });
    });
  }

  // Posts
  async savePost(data: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this.client.SavePost(data, (error: any, response: any) => {
        if (error) reject(error);
        else resolve(response);
      });
    });
  }

  async getPost(id: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.client.GetPost({ id }, (error: any, response: any) => {
        if (error) reject(error);
        else resolve(response);
      });
    });
  }

  async listPosts(limit: number, offset: number, filter?: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this.client.ListPosts(
        {
          pagination: { limit, offset },
          ...filter,
        },
        (error: any, response: any) => {
          if (error) reject(error);
          else resolve(response);
        }
      );
    });
  }

  async updatePost(id: string, updates: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this.client.UpdatePost({ id, ...updates }, (error: any, response: any) => {
        if (error) reject(error);
        else resolve(response);
      });
    });
  }

  async deletePost(id: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.client.DeletePost({ id }, (error: any, response: any) => {
        if (error) reject(error);
        else resolve(response);
      });
    });
  }

  async listScheduledPosts(from: Date, to: Date): Promise<any> {
    return new Promise((resolve, reject) => {
      this.client.ListScheduledPosts(
        {
          from_date: { seconds: Math.floor(from.getTime() / 1000) },
          to_date: { seconds: Math.floor(to.getTime() / 1000) },
        },
        (error: any, response: any) => {
          if (error) reject(error);
          else resolve(response);
        }
      );
    });
  }

  // Templates
  async saveTemplate(data: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this.client.SaveTemplate(data, (error: any, response: any) => {
        if (error) reject(error);
        else resolve(response);
      });
    });
  }

  async listTemplates(filter?: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this.client.ListTemplates(filter || {}, (error: any, response: any) => {
        if (error) reject(error);
        else resolve(response);
      });
    });
  }

  // Social Accounts
  async listSocialAccounts(userId: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.client.ListSocialAccounts({ user_id: userId }, (error: any, response: any) => {
        if (error) reject(error);
        else resolve(response);
      });
    });
  }

  async saveSocialAccount(data: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this.client.SaveSocialAccount(data, (error: any, response: any) => {
        if (error) reject(error);
        else resolve(response);
      });
    });
  }

  async deleteSocialAccount(id: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.client.DeleteSocialAccount({ id }, (error: any, response: any) => {
        if (error) reject(error);
        else resolve(response);
      });
    });
  }

  // Metrics
  async saveMetrics(data: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this.client.SaveMetrics(data, (error: any, response: any) => {
        if (error) reject(error);
        else resolve(response);
      });
    });
  }

  async getLatestMetrics(postId: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.client.GetLatestMetrics({ post_id: postId }, (error: any, response: any) => {
        if (error) reject(error);
        else resolve(response);
      });
    });
  }
}

