import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Health')
@Controller()
export class HealthController {
  @Get('/health')
  @ApiOperation({
    summary: 'Health check',
    description: 'Returns the health status of the API',
  })
  @ApiResponse({
    status: 200,
    description: 'API is healthy',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'ok' },
        timestamp: { type: 'string', example: '2025-10-21T10:30:00.000Z' },
        uptime: { type: 'number', example: 123.456 },
      },
    },
  })
  health() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  }

  @Get('/')
  @ApiOperation({
    summary: 'Root endpoint',
    description: 'Welcome message',
  })
  @ApiResponse({
    status: 200,
    description: 'Welcome message',
  })
  root() {
    return {
      message: 'Lite-box Related Posts API',
      version: '1.0.0',
      documentation: '/docs',
    };
  }
}




