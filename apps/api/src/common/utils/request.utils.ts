import type { Request } from 'express';

export function getClientIp(request: Request): string {
	return (
		(request.headers['x-forwarded-for'] as string)?.split(',')[0] ||
		request.socket.remoteAddress ||
		'unknown'
	);
}
