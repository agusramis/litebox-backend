import { Module } from '@nestjs/common';
import { AppConfigModule } from './config/config.module';
import { S3Module } from './providers/s3/s3.module';
import { RelatedPostsModule } from './modules/related-posts/related-posts.module';
import { HealthModule } from './modules/health/health.module';

@Module({
  imports: [AppConfigModule, S3Module, RelatedPostsModule, HealthModule],
})
export class AppModule {}

