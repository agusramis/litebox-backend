import {
  Controller,
  Get,
  Post,
  Query,
  Body,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  UnsupportedMediaTypeException,
  HttpCode,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiConsumes,
  ApiBody,
  ApiQuery,
} from '@nestjs/swagger';
import { RelatedPostsService } from './related-posts.service';
import { CreateRelatedPostDto } from './dto/create-related-post.dto';
import { QueryRelatedPostsDto } from './dto/query-related-posts.dto';
import { RelatedPostEntity } from './entities/related-post.entity';
import { AppConfigService } from '../../config/config.service';

@ApiTags('Related Posts')
@Controller('/api')
export class RelatedPostsController {
  private readonly logger = new Logger(RelatedPostsController.name);

  constructor(
    private readonly service: RelatedPostsService,
    private readonly config: AppConfigService,
  ) { }

  @Get('/posts/related')
  @ApiOperation({
    summary: 'Get related posts',
    description: 'Retrieve a list of related posts ordered by creation date (newest first)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Number of posts to return (1-12, default: 3)',
    example: 3,
  })
  @ApiResponse({
    status: 200,
    description: 'List of related posts',
    type: [RelatedPostEntity],
  })
  async list(@Query() query: QueryRelatedPostsDto): Promise<RelatedPostEntity[]> {
    const limit = query.limit || 3;
    this.logger.log(`GET /api/posts/related?limit=${limit}`);
    return this.service.list(limit);
  }

  @Post('/post/related')
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(
    FileInterceptor('image', {
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
      },
    }),
  )
  @ApiOperation({
    summary: 'Create a related post',
    description: 'Upload an image and create a new related post',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['title', 'image'],
      properties: {
        title: {
          type: 'string',
          description: 'Title of the post',
          example: 'Getting Started with AWS Lambda',
          minLength: 2,
          maxLength: 200,
        },
        image: {
          type: 'string',
          format: 'binary',
          description: 'Image file (max 5MB, image/* only)',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Related post created successfully',
    type: RelatedPostEntity,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - missing or invalid data',
  })
  @ApiResponse({
    status: 415,
    description: 'Unsupported media type - file is not an image',
  })
  async create(
    @Body() dto: CreateRelatedPostDto,
    @UploadedFile() file?: Express.Multer.File,
  ): Promise<RelatedPostEntity> {
    this.logger.log(`POST /api/post/related - Title: ${dto.title}`);

    // Validate file presence
    if (!file) {
      throw new BadRequestException('Image file is required');
    }

    // Validate file is an image
    if (!file.mimetype.startsWith('image/')) {
      throw new UnsupportedMediaTypeException(
        'Invalid file type. Only image files are allowed',
      );
    }

    // Additional size check (redundant with multer config, but explicit)
    const maxSize = this.config.maxFileSize;
    if (file.size > maxSize) {
      throw new BadRequestException(
        `File size exceeds maximum allowed size of ${maxSize / (1024 * 1024)}MB`,
      );
    }

    this.logger.log(
      `Uploading image: ${file.originalname} (${file.size} bytes, ${file.mimetype})`,
    );

    return this.service.create(dto, file);
  }
}






