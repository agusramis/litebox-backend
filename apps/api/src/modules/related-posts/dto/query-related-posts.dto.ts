import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class QueryRelatedPostsDto {
  @ApiProperty({
    description: 'Number of posts to return',
    required: false,
    type: Number,
    minimum: 1,
    maximum: 12,
    example: 3,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(12)
  limit?: number;
}

