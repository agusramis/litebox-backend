import { Injectable, Logger } from '@nestjs/common';
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { AppConfigService } from '../../config/config.service';

export interface UploadResult {
  url: string;
  key: string;
}

interface CacheEntry {
  url: string;
  exp: number;
}

@Injectable()
export class S3Service {
  private readonly logger = new Logger(S3Service.name);
  private readonly client: S3Client;
  private readonly cache = new Map<string, CacheEntry>();

  constructor(private readonly config: AppConfigService) {
    const clientConfig: any = {
      region: this.config.awsRegion,
    };

    if (this.config.awsAccessKeyId && this.config.awsSecretAccessKey) {
      clientConfig.credentials = {
        accessKeyId: this.config.awsAccessKeyId,
        secretAccessKey: this.config.awsSecretAccessKey,
      };
    }

    this.client = new S3Client(clientConfig);
    this.logger.log(`S3 Client initialized for region: ${this.config.awsRegion}`);

    setInterval(() => this.cleanCache(), 10 * 60 * 1000);
  }

  /**
   * Upload a buffer to S3
   * @param buffer - File buffer
   * @param key - S3 object key (path)
   * @param contentType - MIME type of the file
   * @returns Upload result with URL and key
   */
  async uploadBuffer(buffer: Buffer, key: string, contentType: string): Promise<UploadResult> {
    try {
      this.validateKey(key);

      const command = new PutObjectCommand({
        Bucket: this.config.s3Bucket,
        Key: key,
        Body: buffer,
        ContentType: contentType,
      });

      await this.client.send(command);

      this.logger.log(`File uploaded successfully: ${key}`);

      const url = await this.getPresignedGetUrl(key, 600);

      return { url, key };
    } catch (error) {
      this.logger.error(`Failed to upload file to S3: ${error.message}`, error);
      throw new Error(`Failed to upload file: ${error.message}`);
    }
  }

  /**
   * Generate a presigned GET URL for an S3 object
   * @param key - S3 object key
   * @param expiresInSec - Time in seconds until URL expires (default 600 = 10 minutes)
   * @returns Presigned URL
   */
  async getPresignedGetUrl(key: string, expiresInSec = 600): Promise<string> {
    // Check cache first
    const cacheKey = `${key}:${expiresInSec}`;
    const cached = this.cache.get(cacheKey);

    if (cached && cached.exp > Date.now()) {
      this.logger.debug(`Cache hit for key: ${key}`);
      return cached.url;
    }

    // Validate key doesn't escape the base path
    this.validateKey(key);

    try {
      const command = new GetObjectCommand({
        Bucket: this.config.s3Bucket,
        Key: key,
      });

      const url = await getSignedUrl(this.client, command, { expiresIn: expiresInSec });

      // Cache the URL
      this.cache.set(cacheKey, {
        url,
        exp: Date.now() + expiresInSec * 1000,
      });

      this.logger.debug(`Generated presigned URL for key: ${key}`);
      return url;
    } catch (error) {
      this.logger.error(`Failed to generate presigned URL: ${error.message}`, error);
      throw new Error(`Failed to generate presigned URL: ${error.message}`);
    }
  }

  /**
   * Validate S3 key doesn't escape the base path
   * @param key - S3 object key
   */
  private validateKey(key: string): void {
    const basePath = this.config.s3BasePath || '';
    if (basePath && !key.startsWith(basePath)) {
      throw new Error(`Invalid S3 key: key must start with base path: ${basePath}`);
    }

    // Prevent directory traversal
    if (key.includes('..') || key.includes('//')) {
      throw new Error('Invalid S3 key: contains directory traversal characters');
    }
  }

  /**
   * Clean up expired cache entries
   */
  private cleanCache(): void {
    const now = Date.now();
    let cleaned = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (entry.exp <= now) {
        this.cache.delete(key);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      this.logger.debug(`Cleaned ${cleaned} expired cache entries`);
    }
  }

  /**
   * Generate a unique S3 key for a file
   * @param prefix - Folder prefix (e.g., 'lite-box')
   * @param filename - Original filename or generated name
   * @returns S3 key
   */
  generateKey(prefix: string, filename: string): string {
    // Remove any path separators from filename for security
    const sanitizedFilename = filename.replace(/[/\\]/g, '-');
    return `${prefix}/${sanitizedFilename}`;
  }
}
