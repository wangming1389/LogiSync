import {
	CallHandler,
	ExecutionContext,
	Injectable,
	NestInterceptor,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { map, Observable } from 'rxjs';

interface PaginatedPayload {
	items: unknown[];
	meta: Record<string, unknown>;
	[key: string]: unknown;
}

@Injectable()
export class ResponseEnvelopeInterceptor implements NestInterceptor {
	intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
		const http = context.switchToHttp();
		const request = http.getRequest<Request>();
		const response = http.getResponse<Response>();

		return next.handle().pipe(
			map((payload: unknown) => {
				if (this.shouldBypass(response, payload)) {
					return payload;
				}

				const { data, meta } = this.normalizePayload(payload);

				return {
					success: true,
					data,
					error: null,
					meta: {
						...meta,
						path: request.path,
						method: request.method,
						timestamp: new Date().toISOString(),
					},
				};
			}),
		);
	}

	private shouldBypass(response: Response, payload: unknown) {
		if (response.headersSent) return true;
		if (Buffer.isBuffer(payload)) return true;
		if (response.getHeader('content-disposition')) return true;

		const contentType = response.getHeader('content-type');
		return (
			typeof contentType === 'string' &&
			!contentType.includes('application/json') &&
			!contentType.includes('+json')
		);
	}

	private normalizePayload(payload: unknown) {
		if (this.isPaginatedPayload(payload)) {
			const { items, meta, ...extraMeta } = payload;
			return {
				data: items,
				meta: { ...meta, ...extraMeta },
			};
		}

		return {
			data: payload ?? null,
			meta: {},
		};
	}

	private isPaginatedPayload(payload: unknown): payload is PaginatedPayload {
		return (
			!!payload &&
			typeof payload === 'object' &&
			Array.isArray((payload as { items?: unknown }).items) &&
			!!(payload as { meta?: unknown }).meta &&
			typeof (payload as { meta?: unknown }).meta === 'object'
		);
	}
}
