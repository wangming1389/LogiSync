import type { Request } from 'express';

export function getClientIp(request: Request): string {
	return (
		(request.headers['x-forwarded-for'] as string)?.split(',')[0] ||
		request.socket.remoteAddress ||
		'unknown'
	);
}

export function getRequestUser<TUser>(request: Request): TUser {
	return (request as Request & { user: TUser }).user;
}
