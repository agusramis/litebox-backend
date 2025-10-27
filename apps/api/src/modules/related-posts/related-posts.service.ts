import { Injectable, Logger } from '@nestjs/common';
import { RelatedPostsRepository } from './related-posts.repository';
import { S3Service } from '../../providers/s3/s3.service';
import { CreateRelatedPostDto } from './dto/create-related-post.dto';
import { RelatedPostEntity } from './entities/related-post.entity';
import { randomUUID, randomInt } from 'crypto';
import { extname } from 'path';

@Injectable()
export class RelatedPostsService {
  private readonly logger = new Logger(RelatedPostsService.name);

  private readonly TOPICS = [
    'Diversity & Inclusion',
    'Tech Companies',
    'security',
    'Global',
    'Leaks',
    'Crypto',
  ];

  private readonly AUTHORS = [
    'Rick Sanchez',
    'Morty Smith',
    'Beth Smith',
    'Jerry Smith',
    'Summer Smith',
    'Mr. Meeseeks',
    'Birdperson',
    'Squanchy',
    'Mr. Poopybutthole',
    'Tammy',
    'Evil Morty',
    'Abradolf Lincler',
  ];

  constructor(
    private readonly repository: RelatedPostsRepository,
    private readonly s3Service: S3Service,
  ) {}

  private getRandomTopic(): string {
    return this.TOPICS[randomInt(0, this.TOPICS.length)];
  }

  private getRandomAuthor(): string {
    return this.AUTHORS[randomInt(0, this.AUTHORS.length)];
  }

  private getRandomReadTime(): number {
    return randomInt(4, 16); // Returns a random integer between 4 and 15
  }

  /**
   * Get list of related posts
   * @param limit - Maximum number of posts to return
   * @returns List of related posts ordered by creation date (newest first)
   */
  async list(limit = 3): Promise<RelatedPostEntity[]> {
    this.logger.log(`Fetching ${limit} related posts`);

    const posts = await this.repository.findMany(limit);

    // Generate presigned URLs for each post's image
    const postsWithUrls = await Promise.all(
      posts.map(async (post) => {
        let imageUrl: string | null = null;
        if (post.imageKey) {
          try {
            imageUrl = await this.s3Service.getPresignedGetUrl(post.imageKey, 600);
          } catch (error: any) {
            this.logger.warn(
              `Failed to generate presigned URL for ${post.imageKey}: ${error.message}`,
            );
          }
        }

        return {
          ...post,
          imageUrl,
        };
      }),
    );

    return postsWithUrls.map((post) => new RelatedPostEntity(post));
  }

  /**
   * Create a new related post with image upload
   * @param dto - Post data
   * @param file - Uploaded image file
   * @returns Created post
   */
  async create(dto: CreateRelatedPostDto, file: Express.Multer.File): Promise<RelatedPostEntity> {
    this.logger.log(`Creating related post: ${dto.title}`);

    const ext = extname(file.originalname) || '.jpg';
    const timestamp = new Date().toISOString().slice(0, 10);
    const uniqueId = randomUUID();
    const filename = `${uniqueId}${ext}`;

    const key = this.s3Service.generateKey(`lite-box/${timestamp}`, filename);

    const uploadResult = await this.s3Service.uploadBuffer(file.buffer, key, file.mimetype);

    this.logger.log(`Image uploaded to S3: ${uploadResult.key}`);

    const topic = this.getRandomTopic();
    const author = this.getRandomAuthor();
    const readTime = this.getRandomReadTime();

    const post = await this.repository.create({
      title: dto.title,
      imageKey: uploadResult.key,
      topic,
      author,
      readTime,
    });

    this.logger.log(
      `Related post created with ID: ${post.id} (Topic: ${topic}, Author: ${author}, Read Time: ${readTime}min)`,
    );

    let imageUrl: string | null = null;
    if (post.imageKey) {
      try {
        imageUrl = await this.s3Service.getPresignedGetUrl(post.imageKey, 600);
      } catch (error: any) {
        this.logger.warn(`Failed to generate presigned URL for ${post.imageKey}: ${error.message}`);
      }
    }

    return new RelatedPostEntity({
      ...post,
      imageUrl,
    });
  }
}
