import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import path from 'path';

// In Docker: /app/proto/ai_engine.proto (from dist/clients/ -> ../../proto)
// Locally: from src/clients/ -> ../../../../proto
const AI_ENGINE_PROTO_PATH = process.env.NODE_ENV === 'production' 
  ? path.join(__dirname, '../../proto/ai_engine.proto')
  : path.join(__dirname, '../../../../proto/ai_engine.proto');

const PROTO_DIR = process.env.NODE_ENV === 'production'
  ? path.join(__dirname, '../../proto')
  : path.join(__dirname, '../../../../proto');

const AI_ENGINE_GRPC_URL = process.env.AI_ENGINE_GRPC_URL || 'localhost:50052';

const packageDefinition = protoLoader.loadSync(AI_ENGINE_PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
  includeDirs: [PROTO_DIR],
});

const protoDescriptor = grpc.loadPackageDefinition(packageDefinition) as any;
const AIEngineService = protoDescriptor.ai_engine.AIEngineService;

// Platform enum mapping
export const PlatformEnum = {
  TELEGRAM: 1,
  VK: 2,
  INSTAGRAM: 3,
  LINKEDIN: 4,
  TWITTER: 5,
  FACEBOOK: 6,
};

// PostStyle enum mapping
export const PostStyleEnum = {
  NEUTRAL: 1,
  FORMAL: 2,
  ENGAGING: 3,
  INFORMAL: 4,
  BUSINESS: 5,
  CREATIVE: 6,
};

export class AIEngineClient {
  private client: any;

  constructor(url: string = AI_ENGINE_GRPC_URL) {
    this.client = new AIEngineService(
      url,
      grpc.credentials.createInsecure()
    );
  }

  async healthCheck(): Promise<boolean> {
    return new Promise((resolve) => {
      this.client.HealthCheck({}, (error: any, response: any) => {
        if (error) {
          console.error('AI Engine health check failed:', error.message);
          resolve(false);
        } else {
          resolve(response?.status === 'serving');
        }
      });
    });
  }

  async analyzeContent(articleId: string, content: string, title: string, options?: any): Promise<any> {
    return new Promise((resolve, reject) => {
      const request = {
        article_id: articleId,
        content,
        title,
        options: {
          extract_facts: options?.extractFacts ?? true,
          extract_entities: options?.extractEntities ?? true,
          extract_quotes: options?.extractQuotes ?? true,
          analyze_sentiment: options?.analyzeSentiment ?? true,
          generate_summary: options?.generateSummary ?? true,
          max_facts: options?.maxFacts ?? 10,
          min_fact_importance: options?.minFactImportance ?? 5,
        },
      };

      this.client.AnalyzeContent(request, (error: any, response: any) => {
        if (error) {
          reject(error);
        } else {
          resolve(response);
        }
      });
    });
  }

  async generatePosts(
    articleId: string,
    platforms: string[],
    style: string = 'NEUTRAL',
    formalityLevel: number = 5,
    keyFacts?: any[],
    customInstructions?: string
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      // Map platform strings to enum values
      const platformEnums = platforms.map(p => {
        const key = p.toUpperCase() as keyof typeof PlatformEnum;
        return PlatformEnum[key] || 1;
      });

      // Map style string to enum value
      const styleKey = style.toUpperCase() as keyof typeof PostStyleEnum;
      const styleEnum = PostStyleEnum[styleKey] || 1;

      const request = {
        article_id: articleId,
        platforms: platformEnums,
        style: styleEnum,
        formality_level: formalityLevel,
        key_facts: keyFacts || [],
        custom_instructions: customInstructions || '',
      };

      this.client.GeneratePosts(request, (error: any, response: any) => {
        if (error) {
          reject(error);
        } else {
          resolve(response);
        }
      });
    });
  }

  async generatePost(
    articleId: string,
    platform: string,
    style: string = 'NEUTRAL',
    formalityLevel: number = 5,
    keyFacts?: any[],
    customInstructions?: string
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      const platformKey = platform.toUpperCase() as keyof typeof PlatformEnum;
      const platformEnum = PlatformEnum[platformKey] || 1;

      const styleKey = style.toUpperCase() as keyof typeof PostStyleEnum;
      const styleEnum = PostStyleEnum[styleKey] || 1;

      const request = {
        article_id: articleId,
        platform: platformEnum,
        style: styleEnum,
        formality_level: formalityLevel,
        key_facts: keyFacts || [],
        custom_instructions: customInstructions || '',
      };

      this.client.GeneratePost(request, (error: any, response: any) => {
        if (error) {
          reject(error);
        } else {
          resolve(response);
        }
      });
    });
  }

  async extractFacts(content: string, title: string, maxFacts: number = 10, minImportance: number = 5): Promise<any> {
    return new Promise((resolve, reject) => {
      const request = {
        content,
        title,
        max_facts: maxFacts,
        min_importance: minImportance,
      };

      this.client.ExtractFacts(request, (error: any, response: any) => {
        if (error) {
          reject(error);
        } else {
          resolve(response);
        }
      });
    });
  }

  async analyzeSentiment(content: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.client.AnalyzeSentiment({ content }, (error: any, response: any) => {
        if (error) {
          reject(error);
        } else {
          resolve(response);
        }
      });
    });
  }

  async summarize(content: string, maxLength: number = 100, style: string = 'normal'): Promise<any> {
    return new Promise((resolve, reject) => {
      const styleMap: Record<string, number> = {
        brief: 1,
        normal: 2,
        detailed: 3,
        bullet: 4,
      };

      const request = {
        content,
        max_length: maxLength,
        style: styleMap[style.toLowerCase()] || 2,
      };

      this.client.Summarize(request, (error: any, response: any) => {
        if (error) {
          reject(error);
        } else {
          resolve(response);
        }
      });
    });
  }
}

