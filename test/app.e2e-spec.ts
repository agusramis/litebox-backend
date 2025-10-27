import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../apps/api/src/app.module';

describe('RelatedPostsController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    
    // Apply the same global pipes as in main.ts
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
      }),
    );
    
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/api/posts/related (GET)', () => {
    it('should return an array of related posts', () => {
      return request(app.getHttpServer())
        .get('/api/posts/related')
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });

    it('should respect the limit query parameter', () => {
      return request(app.getHttpServer())
        .get('/api/posts/related?limit=1')
        .expect(200)
        .expect((res) => {
          expect(res.body.length).toBeLessThanOrEqual(1);
        });
    });
  });

  describe('/api/post/related (POST)', () => {
    it('should reject requests without an image', () => {
      return request(app.getHttpServer())
        .post('/api/post/related')
        .field('title', 'Test Post')
        .expect(400);
    });

    it('should reject requests without a title', () => {
      return request(app.getHttpServer())
        .post('/api/post/related')
        .attach('image', Buffer.from('fake-image'), 'test.jpg')
        .expect(400);
    });
  });
});




