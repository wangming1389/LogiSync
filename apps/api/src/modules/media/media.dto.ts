import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const UploadFromUrlSchema = z.object({
	url: z.string().url('Must be a valid URL'),
	folder: z.string().optional(),
});

export class UploadFromUrlDto extends createZodDto(UploadFromUrlSchema) {}
