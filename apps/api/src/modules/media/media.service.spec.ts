import { BadRequestException } from '@nestjs/common';
import { AuditStatus } from '../../core/audit/enums/audit.enums';
import type { IMulterFile } from './media.service';
import { MediaService } from './media.service';

describe('MediaService', () => {
	const objectStorageService = {
		uploadFileWithExtension: jest.fn(),
		uploadFromUrl: jest.fn(),
		generateSignedUrl: jest.fn(),
	};
	const auditLoggerService = {
		log: jest.fn(),
	};

	let service: MediaService;

	const createFile = (overrides: Partial<IMulterFile>): IMulterFile => ({
		fieldname: 'file',
		originalname: 'document.pdf',
		encoding: '7bit',
		mimetype: 'application/pdf',
		size: 1024,
		buffer: Buffer.from('file'),
		...overrides,
	});

	beforeEach(() => {
		jest.clearAllMocks();
		objectStorageService.uploadFileWithExtension.mockResolvedValue(
			'media/file.pdf',
		);
		objectStorageService.generateSignedUrl.mockResolvedValue(
			'https://storage.test/signed-url',
		);
		auditLoggerService.log.mockResolvedValue(undefined);
		service = new MediaService(
			objectStorageService as never,
			auditLoggerService as never,
		);
	});

	it('TC-MED-01 File Size Enforcement', async () => {
		await expect(
			service.uploadFile(
				createFile({
					originalname: 'image.png',
					mimetype: 'image/png',
					size: 5 * 1024 * 1024 + 1,
				}),
			),
		).rejects.toThrow(BadRequestException);

		await expect(
			service.uploadFile(
				createFile({
					originalname: 'legal.pdf',
					mimetype: 'application/pdf',
					size: 10 * 1024 * 1024 + 1,
				}),
				'legal-documents',
			),
		).rejects.toThrow(BadRequestException);
	});

	it('TC-MED-02 File Format Validation', async () => {
		await expect(
			service.uploadFile(
				createFile({
					originalname: 'legal.exe',
					mimetype: 'application/octet-stream',
				}),
				'legal-documents',
			),
		).rejects.toThrow(BadRequestException);

		await expect(
			service.uploadFile(
				createFile({
					originalname: 'legal.pdf',
					mimetype: 'application/pdf',
				}),
				'legal-documents',
			),
		).resolves.toEqual({ url: 'media/file.pdf' });
	});

	it('TC-MED-03 Audit Log (Signed URL)', async () => {
		await service.generateSignedUrl(
			'legal-documents/file.pdf',
			'user-1',
			'workspace-1',
			'127.0.0.1',
		);

		expect(auditLoggerService.log).toHaveBeenCalledWith(
			expect.objectContaining({
				actorId: 'user-1',
				workspaceId: 'workspace-1',
				action: 'MEDIA_SIGNED_URL_GENERATE',
				resourceType: 'media',
				resourceId: 'legal-documents/file.pdf',
				changes: { expiresInSeconds: 3600 },
				ipAddress: '127.0.0.1',
				status: AuditStatus.SUCCESS,
			}),
		);
	});
});
