import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength, MaxLength } from 'class-validator';

export class CreateRelatedPostDto {
  @ApiProperty({
    description: 'Title of the related post',
    example: 'Getting Started with AWS Lambda',
    minLength: 2,
    maxLength: 200,
  })
  @IsString()
  @MinLength(2, { message: 'Title must be at least 2 characters long' })
  @MaxLength(200, { message: 'Title must not exceed 200 characters' })
  title!: string;
}



