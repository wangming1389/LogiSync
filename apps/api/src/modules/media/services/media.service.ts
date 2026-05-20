import {
	BadRequestException,
	Injectable,
	Logger,
	Optional,
} from '@nestjs/common';
import { AuditStatus } from '../../../core/audit/enums/audit.enums';
import { AuditLoggerService } from '../../../core/audit/services/audit-logger.service';
import { ObjectStorageService } from '../../../infrastructure/object-storage/object-storage.service';

export interface IMulterFile {
	fieldname: string;
	originalname: string;
	encoding: string;
	mimetype: string;
	size: number;
	buffer: Buffer;
}

@Injectable()
export class MediaService {
	private readonly logger = new Logger(MediaService.name);

	constructor(
		private readonly objectStorageService: ObjectStorageService,
		@Optional() private readonly auditLoggerService?: AuditLoggerService,
	) {}

	async uploadFile(file: IMulterFile, folder?: string) {
		this.validateUpload(file, folder);

		const objectName = await this.objectStorageService.uploadFileWithExtension(
			file.buffer,
			file.originalname,
			folder || 'media',
		);
		this.logger.log(`File uploaded: ${objectName}`);
		return { url: objectName };
	}

	async uploadFromUrl(url: string, folder?: string) {
		const objectName = await this.objectStorageService.uploadFromUrl(
			url,
			folder || 'media',
		);
		this.logger.log(`URL uploaded: ${objectName}`);
		return { url: objectName };
	}

	async generateSignedUrl(
		objectName: string,
		actorId: string,
		workspaceId: string,
		ipAddress: string,
	) {
		const signedUrl = await this.objectStorageService.generateSignedUrl(
			objectName,
			60 * 60,
		);

		await this.auditLoggerService?.log({
			actorId,
			workspaceId,
			action: 'MEDIA_SIGNED_URL_GENERATE',
			resourceType: 'media',
			resourceId: objectName,
			changes: { expiresInSeconds: 60 * 60 },
			ipAddress,
			status: AuditStatus.SUCCESS,
		});

		return { url: signedUrl };
	}

	private validateUpload(file: IMulterFile, folder?: string) {
		const folderValue = typeof folder === 'string' ? folder : undefined;
		const isLegalFolder = folderValue?.includes('legal') ?? false;
		const isImage = file.mimetype.startsWith('image/');
		const isDocument = file.mimetype === 'application/pdf' || isLegalFolder;
		const imageLimit = 5 * 1024 * 1024;
		const documentLimit = 10 * 1024 * 1024;

		if (isImage && file.size > imageLimit) {
			throw new BadRequestException('Images must not exceed 5MB');
		}

		if (isDocument && file.size > documentLimit) {
			throw new BadRequestException('Documents must not exceed 10MB');
		}

		if (isLegalFolder) {
			const allowedExtensions = ['.pdf', '.jpg', '.png'];
			const lowerName = file.originalname.toLowerCase();
			if (
				!allowedExtensions.some((extension) => lowerName.endsWith(extension))
			) {
				throw new BadRequestException(
					'Legal documents must be .pdf, .jpg, or .png',
				);
			}
		}
	}
}
