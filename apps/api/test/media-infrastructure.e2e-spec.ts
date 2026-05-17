import { INestApplication } from '@nestjs/common';

import { ObjectStorageService } from '../src/infrastructure/object-storage/object-storage.service';
import { MediaService } from '../src/modules/media/services/media.service';
import { createE2eApp, unique } from './e2e-helpers';

describe('Media infrastructure test cases from docs/api/media', () => {
	let app: INestApplication;

	beforeAll(async () => {
		app = await createE2eApp();
	});

	afterAll(async () => {
		await app.close();
	});

	it('TC-MED-04 Private Bucket Policy', async () => {
		const storage = app.get(ObjectStorageService);
		expect(storage.isReady()).toBe(true);

		const objectName = `e2e-private/${unique('object')}.txt`;
		await storage.uploadFile(objectName, 'private e2e payload');

		const directUrl = `http://localhost:9000/${storage.getBucketName()}/${objectName}`;
		const response = await fetch(directUrl);

		expect([403, 404]).toContain(response.status);
	});

	it('TC-MED-06 JIT Generation Overhead', async () => {
		const storage = app.get(ObjectStorageService);
		expect(storage.isReady()).toBe(true);

		const objectName = `e2e-signed/${unique('object')}.txt`;
		await storage.uploadFile(objectName, 'signed url e2e payload');

		const startedAt = performance.now();
		const signedUrl = await app
			.get(MediaService)
			.generateSignedUrl(
				objectName,
				'00000000-0000-4000-8000-000000000001',
				'00000000-0000-4000-8000-000000000002',
				'127.0.0.1',
			);

		expect(performance.now() - startedAt).toBeLessThan(200);
		expect(signedUrl.url).toContain(storage.getBucketName());
		expect(signedUrl.url).toContain(objectName);
	});
});
