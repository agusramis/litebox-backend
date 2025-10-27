import { ApiProperty } from '@nestjs/swagger';

export class RelatedPostEntity {
  @ApiProperty({
    description: 'Unique identifier',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: 'Title of the related post',
    example: 'Getting Started with AWS Lambda',
  })
  title: string;

  @ApiProperty({
    description: 'Presigned URL of the post image (expires in 10 minutes)',
    example: 'https://s3.us-east-2.amazonaws.com/bucket/key?X-Amz-Algorithm=...&X-Amz-Expires=600',
  })
  imageUrl: string | null;

  @ApiProperty({
    description: 'Topic of the related post',
    example: 'Tech Companies',
  })
  topic: string;

  @ApiProperty({
    description: 'Author of the related post',
    example: 'Rick Sanchez',
  })
  author: string;

  @ApiProperty({
    description: 'Reading time in minutes',
    example: 7,
  })
  readTime: number;

  @ApiProperty({
    description: 'Creation timestamp',
    example: '2025-10-21T10:30:00.000Z',
  })
  createdAt: Date;

  constructor(partial: Partial<RelatedPostEntity>) {
    Object.assign(this, partial);
  }
}
