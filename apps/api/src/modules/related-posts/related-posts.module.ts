import { Module } from '@nestjs/common';
import { RelatedPostsController } from './related-posts.controller';
import { RelatedPostsService } from './related-posts.service';
import { RelatedPostsRepository } from './related-posts.repository';

@Module({
  controllers: [RelatedPostsController],
  providers: [RelatedPostsService, RelatedPostsRepository],
  exports: [RelatedPostsService],
})
export class RelatedPostsModule {}




