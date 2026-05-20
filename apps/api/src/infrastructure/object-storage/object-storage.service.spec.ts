import { ConfigService } from '@nestjs/config';
import { ObjectStorageService } from './object-storage.service';

describe('ObjectStorageService', () => {
	const configService = {
		get: jest.fn((key: string, fallback?: string) =>
			key === 'MINIO_BUCKET_NAME' ? 'private-bucket' : fallback,
		),
	};
	const minioClient = {
		presignedGetObject: jest.fn(),
	};

	let service: ObjectStorageService;

	beforeEach(() => {
		jest.clearAllMocks();
		minioClient.presignedGetObject.mockResolvedValue(
			'https://storage.test/private-bucket/media/file.pdf?signature=1',
		);
		service = new ObjectStorageService(
			configService as unknown as ConfigService,
		);
		(service as unknown as { minioClient: typeof minioClient }).minioClient =
			minioClient;
		(service as unknown as { isConnected: boolean }).isConnected = true;
	});

	it('TC-MED-05 Signed URL Expiration', async () => {
		await service.generateSignedUrl('media/file.pdf');

		expect(minioClient.presignedGetObject).toHaveBeenCalledWith(
			'private-bucket',
			'media/file.pdf',
			3600,
		);
	});
});
