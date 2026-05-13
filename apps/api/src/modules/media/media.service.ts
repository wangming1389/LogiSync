import { Injectable, Logger } from '@nestjs/common';
import { ObjectStorageService } from '../../infrastructure/object-storage/object-storage.service';

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

	constructor(private readonly objectStorageService: ObjectStorageService) {}

	async uploadFile(file: IMulterFile, folder?: string) {
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
}
