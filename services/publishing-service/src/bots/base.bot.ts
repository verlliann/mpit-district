import { Platform, PublishingJob, PublishResult } from '../queue/types';

export interface IPlatformBot {
  readonly platform: Platform;
  
  /**
   * Publish a post to the platform
   */
  publish(job: PublishingJob): Promise<PublishResult>;
  
  /**
   * Update an existing post
   */
  update(
    externalId: string,
    content: string,
    imageUrls?: string[],
    accessToken?: string
  ): Promise<PublishResult>;
  
  /**
   * Delete a post from the platform
   */
  delete(externalId: string, accessToken?: string): Promise<boolean>;
  
  /**
   * Test connection to the platform
   */
  testConnection(accessToken: string): Promise<{
    isValid: boolean;
    error?: string;
    accountInfo?: any;
  }>;
  
  /**
   * Get platform-specific limits
   */
  getPlatformLimits(): {
    maxTextLength: number;
    maxImages: number;
    maxVideos: number;
    supportsEditing: boolean;
    supportsScheduling: boolean;
  };
}

export abstract class BasePlatformBot implements IPlatformBot {
  abstract readonly platform: Platform;
  
  abstract publish(job: PublishingJob): Promise<PublishResult>;
  abstract update(
    externalId: string,
    content: string,
    imageUrls?: string[],
    accessToken?: string
  ): Promise<PublishResult>;
  abstract delete(externalId: string, accessToken?: string): Promise<boolean>;
  abstract testConnection(accessToken: string): Promise<{
    isValid: boolean;
    error?: string;
    accountInfo?: any;
  }>;
  abstract getPlatformLimits(): {
    maxTextLength: number;
    maxImages: number;
    maxVideos: number;
    supportsEditing: boolean;
    supportsScheduling: boolean;
  };

  protected handleError(error: any, operation: string): PublishResult {
    return {
      success: false,
      error: error.message || 'Unknown error',
      errorCode: error.code || 'UNKNOWN_ERROR',
    };
  }

  protected async downloadImage(url: string): Promise<Buffer> {
    const axios = require('axios');
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    return Buffer.from(response.data);
  }
}


