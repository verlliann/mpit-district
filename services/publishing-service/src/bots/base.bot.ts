import { 
  Platform, 
  PublishingJob, 
  PublishResult,
  ConnectionInfo,
  PlatformLimits,
  PublishingErrorCode
} from '../queue/types';

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
  testConnection(accessToken: string): Promise<ConnectionInfo>;
  
  /**
   * Get platform-specific limits (detailed)
   */
  getPlatformLimits(): PlatformLimits;
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
  
  abstract testConnection(accessToken: string): Promise<ConnectionInfo>;
  
  abstract getPlatformLimits(): PlatformLimits;

  /**
   * Handle errors and convert to standardized format
   */
  protected handleError(error: any, operation: string): PublishResult {
    let errorCode = PublishingErrorCode.PLATFORM_ERROR;
    
    // Map common errors to error codes
    if (error.message?.includes('token') || error.message?.includes('auth')) {
      errorCode = PublishingErrorCode.INVALID_TOKEN;
    } else if (error.message?.includes('rate limit') || error.message?.includes('too many requests')) {
      errorCode = PublishingErrorCode.RATE_LIMIT;
    } else if (error.message?.includes('network') || error.message?.includes('timeout')) {
      errorCode = PublishingErrorCode.NETWORK_ERROR;
    } else if (error.message?.includes('too long') || error.message?.includes('exceeds')) {
      errorCode = PublishingErrorCode.CONTENT_TOO_LONG;
    } else if (error.message?.includes('permission')) {
      errorCode = PublishingErrorCode.PERMISSION_DENIED;
    } else if (error.message?.includes('not found')) {
      errorCode = PublishingErrorCode.POST_NOT_FOUND;
    }

    return {
      success: false,
      error: error.message || 'Unknown error',
      errorCode: error.code || errorCode,
    };
  }

  /**
   * Download image from URL
   */
  protected async downloadImage(url: string): Promise<Buffer> {
    const axios = require('axios');
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    return Buffer.from(response.data);
  }

  /**
   * Validate content length
   */
  protected validateContentLength(content: string): void {
    const limits = this.getPlatformLimits();
    if (content.length > limits.contentLimits.maxTextLength) {
      throw new Error(
        `Content too long: ${content.length} > ${limits.contentLimits.maxTextLength}`
      );
    }
  }

  /**
   * Validate media count
   */
  protected validateMediaCount(imageUrls: string[], videoUrls: string[]): void {
    const limits = this.getPlatformLimits();
    
    if (imageUrls.length > limits.mediaLimits.maxImages) {
      throw new Error(
        `Too many images: ${imageUrls.length} > ${limits.mediaLimits.maxImages}`
      );
    }
    
    if (videoUrls.length > limits.mediaLimits.maxVideos) {
      throw new Error(
        `Too many videos: ${videoUrls.length} > ${limits.mediaLimits.maxVideos}`
      );
    }
  }
}


