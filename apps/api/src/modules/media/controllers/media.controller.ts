import {
	Body,
	Controller,
	Post,
	UploadedFile,
	UseGuards,
	UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
	ApiBearerAuth,
	ApiBody,
	ApiConsumes,
	ApiOperation,
	ApiResponse,
	ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../iam/auth/guards/jwt-auth.guard';
import { UploadFromUrlDto } from '../dtos/media.dto';
import type { IMulterFile } from '../services/media.service';
import { MediaService } from '../services/media.service';

@ApiTags('Media')
@Controller('media')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
export class MediaController {
	constructor(private readonly mediaService: MediaService) {}

	@Post('upload')
	@ApiOperation({ summary: 'Upload image file' })
	@ApiConsumes('multipart/form-data')
	@ApiBody({
		schema: {
			type: 'object',
			properties: {
				file: {
					type: 'string',
					format: 'binary',
				},
				folder: {
					type: 'string',
					description: 'Optional folder name',
				},
			},
		},
	})
	@ApiResponse({ status: 201, description: 'File uploaded successfully' })
	@UseInterceptors(FileInterceptor('file'))
	async uploadFile(
		@UploadedFile() file: IMulterFile,
		@Body('folder') folder?: string,
	) {
		return this.mediaService.uploadFile(file, folder);
	}

	@Post('upload-url')
	@ApiOperation({ summary: 'Upload image url' })
	@ApiBody({ type: UploadFromUrlDto })
	@ApiResponse({
		status: 201,
		description: 'Image uploaded successfully from URL',
	})
	async uploadFromUrl(@Body() dto: UploadFromUrlDto) {
		return this.mediaService.uploadFromUrl(dto.url, dto.folder);
	}
}
