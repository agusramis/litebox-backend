import { Test, TestingModule } from '@nestjs/testing';
import { S3Service } from './s3.service';
import { AppConfigService } from '../../config/config.service';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

jest.mock('@aws-sdk/s3-request-presigner');

describe('S3Service', () => {
  let service: S3Service;
  let configService: AppConfigService;

  const mockConfigService = {
    awsRegion: 'us-east-2',
    awsAccessKeyId: 'test-key',
    awsSecretAccessKey: 'test-secret',
    s3Bucket: 'test-bucket',
    s3BasePath: 'lite-box',
    maxFileSize: 5242880,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        S3Service,
        {
          provide: AppConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<S3Service>(S3Service);
    configService = module.get<AppConfigService>(AppConfigService);

    // Clear cache before each test
    jest.clearAllMocks();
  });

  describe('getPresignedGetUrl', () => {
    it('should generate a presigned URL', async () => {
      const mockUrl = 'https://s3.us-east-2.amazonaws.com/test-bucket/key?X-Amz-Expires=600';
      (getSignedUrl as jest.Mock).mockResolvedValue(mockUrl);

      const url = await service.getPresignedGetUrl('lite-box/2025-10-21/test.jpg', 600);

      expect(url).toBe(mockUrl);
      expect(getSignedUrl).toHaveBeenCalled();
    });

    it('should use cache for repeated calls', async () => {
      const mockUrl = 'https://s3.us-east-2.amazonaws.com/test-bucket/key';
      (getSignedUrl as jest.Mock).mockResolvedValue(mockUrl);

      const url1 = await service.getPresignedGetUrl('lite-box/test.jpg', 600);
      const url2 = await service.getPresignedGetUrl('lite-box/test.jpg', 600);

      expect(url1).toBe(url2);
      // Should only call getSignedUrl once due to cache
      expect(getSignedUrl).toHaveBeenCalledTimes(1);
    });

    it('should regenerate URL after cache expires', async () => {
      jest.useFakeTimers();
      const mockUrl = 'https://s3.us-east-2.amazonaws.com/test-bucket/key';
      (getSignedUrl as jest.Mock).mockResolvedValue(mockUrl);

      // First call
      const url1 = await service.getPresignedGetUrl('lite-box/test.jpg', 600);
      expect(getSignedUrl).toHaveBeenCalledTimes(1);

      // Advance time past expiration (cache expires after 600s, mock expiration after 601s)
      jest.advanceTimersByTime(601000);

      // Second call should regenerate
      const url2 = await service.getPresignedGetUrl('lite-box/test.jpg', 600);
      expect(getSignedUrl).toHaveBeenCalledTimes(2);

      jest.useRealTimers();
    });

    it('should throw error for invalid key with directory traversal', async () => {
      await expect(service.getPresignedGetUrl('../escape', 600)).rejects.toThrow(
        'directory traversal characters',
      );
    });

    it('should throw error for key outside base path', async () => {
      await expect(service.getPresignedGetUrl('other-prefix/test.jpg', 600)).rejects.toThrow(
        'key must start with base path',
      );
    });

    it('should handle missing imageKey gracefully', async () => {
      const url = await service.getPresignedGetUrl('lite-box/2025-10-21/test.jpg', 600);
      expect(url).toBeDefined();
      expect(typeof url).toBe('string');
    });
  });

  describe('uploadBuffer', () => {
    it('should upload buffer and return key with presigned URL', async () => {
      const mockPresignedUrl = 'https://s3...';
      (getSignedUrl as jest.Mock).mockResolvedValue(mockPresignedUrl);

      // Mock S3 client
      const buffer = Buffer.from('test');
      const key = 'lite-box/2025-10-21/test.jpg';

      // This would normally upload to S3, but we're mocking the presigned URL generation
      const result = await service.uploadBuffer(buffer, key, 'image/jpeg');

      expect(result.key).toBe(key);
      expect(result.url).toBeDefined();
    });

    it('should validate key before upload', async () => {
      const buffer = Buffer.from('test');

      await expect(service.uploadBuffer(buffer, '../invalid', 'image/jpeg')).rejects.toThrow(
        'directory traversal characters',
      );
    });
  });

  describe('generateKey', () => {
    it('should generate valid S3 key', () => {
      const key = service.generateKey('lite-box', 'test.jpg');
      expect(key).toBe('lite-box/test.jpg');
    });

    it('should sanitize filename', () => {
      const key = service.generateKey('lite-box', 'path/../test.jpg');
      expect(key).toBe('lite-box/path---test.jpg');
    });
  });
});




