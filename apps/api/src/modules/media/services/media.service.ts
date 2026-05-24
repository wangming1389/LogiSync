import {
	BadRequestException,
	Injectable,
	Logger,
	Optional,
} from '@nestjs/common';
import { AuditStatus } from '../../../core/audit/enums/audit.enums';
import { AuditLoggerService } from '../../../core/audit/services/audit-logger.service';
import { ObjectStorageService } from '../../../infrastructure/object-storage/object-storage.service';
import {
	DOCUMENT_UPLOAD_LIMIT_BYTES,
	DOCUMENT_UPLOAD_SIZE_MESSAGE,
	IMAGE_EXTENSIONS,
	IMAGE_MIME_TYPES,
	IMAGE_UPLOAD_ALLOWED_TYPES_MESSAGE,
	IMAGE_UPLOAD_FOLDERS,
	IMAGE_UPLOAD_LIMIT_BYTES,
	IMAGE_UPLOAD_SIZE_MESSAGE,
	LEGAL_DOCUMENT_ALLOWED_TYPES_MESSAGE,
	LEGAL_DOCUMENT_EXTENSIONS,
} from '../constants/media.constants';

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
		const isImage = file.mimetype.startsWith('image/');
		const isDocument =
			file.mimetype === 'application/pdf' || folder?.includes('legal');
		const targetFolder = folder || 'media';
		const lowerName = file.originalname.toLowerCase();

		if (
			this.requiresImage(targetFolder) &&
			(!this.includes(IMAGE_MIME_TYPES, file.mimetype) ||
				!IMAGE_EXTENSIONS.some((extension) => lowerName.endsWith(extension)))
		) {
			throw new BadRequestException(IMAGE_UPLOAD_ALLOWED_TYPES_MESSAGE);
		}

		if (isImage && file.size > IMAGE_UPLOAD_LIMIT_BYTES) {
			throw new BadRequestException(IMAGE_UPLOAD_SIZE_MESSAGE);
		}

		if (isDocument && file.size > DOCUMENT_UPLOAD_LIMIT_BYTES) {
			throw new BadRequestException(DOCUMENT_UPLOAD_SIZE_MESSAGE);
		}

		if (folder?.includes('legal')) {
			if (
				!LEGAL_DOCUMENT_EXTENSIONS.some((extension) =>
					lowerName.endsWith(extension),
				)
			) {
				throw new BadRequestException(LEGAL_DOCUMENT_ALLOWED_TYPES_MESSAGE);
			}
		}
	}

	private requiresImage(folder: string): boolean {
		return IMAGE_UPLOAD_FOLDERS.some(
			(prefix) => folder === prefix || folder.startsWith(`${prefix}/`),
		);
	}

	private includes(values: readonly string[], value: string): boolean {
		return values.includes(value);
	}
}
