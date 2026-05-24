export const IMAGE_UPLOAD_LIMIT_BYTES = 5 * 1024 * 1024;
export const DOCUMENT_UPLOAD_LIMIT_BYTES = 10 * 1024 * 1024;

export const IMAGE_UPLOAD_FOLDERS = [
	'employees/avatars',
	'products',
	'media',
] as const;

export const IMAGE_MIME_TYPES = [
	'image/jpeg',
	'image/png',
	'image/webp',
] as const;
export const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp'] as const;
export const LEGAL_DOCUMENT_EXTENSIONS = [
	'.pdf',
	'.jpg',
	'.jpeg',
	'.png',
] as const;

export const IMAGE_UPLOAD_ALLOWED_TYPES_MESSAGE =
	'Only .jpg, .jpeg, .png, or .webp image files are allowed';

export const LEGAL_DOCUMENT_ALLOWED_TYPES_MESSAGE =
	'Legal documents must be .pdf, .jpg, .jpeg, or .png';

export const IMAGE_UPLOAD_SIZE_MESSAGE = 'Images must not exceed 5MB';
export const DOCUMENT_UPLOAD_SIZE_MESSAGE = 'Documents must not exceed 10MB';
