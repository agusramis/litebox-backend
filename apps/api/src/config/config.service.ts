import { Injectable } from '@nestjs/common';
import { ConfigService as NestConfigService } from '@nestjs/config';

@Injectable()
export class AppConfigService {
  constructor(private configService: NestConfigService) {}

  // App Configuration
  get port(): number {
    return this.configService.get<number>('PORT', 3001);
  }

  get nodeEnv(): string {
    return this.configService.get<string>('NODE_ENV', 'development');
  }

  get corsOrigin(): string {
    return this.configService.get<string>('CORS_ORIGIN', 'http://localhost:3000');
  }

  get isDevelopment(): boolean {
    return this.nodeEnv === 'development';
  }

  get isProduction(): boolean {
    return this.nodeEnv === 'production';
  }

  // Database Configuration
  get databaseUrl(): string {
    const url = this.configService.get<string>('DATABASE_URL');
    if (!url) {
      throw new Error('DATABASE_URL is not defined');
    }
    return url;
  }

  // AWS Configuration
  get awsRegion(): string {
    const region = this.configService.get<string>('AWS_REGION');
    if (!region) {
      throw new Error('AWS_REGION is not defined');
    }
    return region;
  }

  get awsAccessKeyId(): string | undefined {
    return this.configService.get<string>('AWS_ACCESS_KEY_ID');
  }

  get awsSecretAccessKey(): string | undefined {
    return this.configService.get<string>('AWS_SECRET_ACCESS_KEY');
  }

  // S3 Configuration
  get s3Bucket(): string {
    const bucket = this.configService.get<string>('S3_BUCKET');
    if (!bucket) {
      throw new Error('S3_BUCKET is not defined');
    }
    return bucket;
  }

  get s3BasePath(): string | undefined {
    return this.configService.get<string>('AWS_S3_BASE_PATH');
  }

  get s3PublicBaseUrl(): string | undefined {
    return this.configService.get<string>('S3_PUBLIC_BASE_URL');
  }

  // File Upload Configuration
  get maxFileSize(): number {
    return this.configService.get<number>('MAX_FILE_SIZE', 5 * 1024 * 1024); // 5MB default
  }
}
