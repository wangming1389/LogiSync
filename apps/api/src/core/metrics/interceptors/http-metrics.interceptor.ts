import {
	CallHandler,
	ExecutionContext,
	HttpException,
	Injectable,
	NestInterceptor,
} from '@nestjs/common';
import { InjectMetric } from '@willsoto/nestjs-prometheus';
import type { Request, Response } from 'express';
import type { Counter, Histogram } from 'prom-client';
import { catchError, Observable, tap, throwError } from 'rxjs';
import {
	METRIC_HTTP_REQUEST_DURATION,
	METRIC_HTTP_REQUESTS_TOTAL,
} from '../metrics.providers';

/**
 * Route-prefix → module mapping.
 *
 * Order matters: more specific prefixes must come before generic ones
 * (e.g. /admin/audit-logs before /admin).
 */
const MODULE_PREFIX_MAP: ReadonlyArray<readonly [string, string]> = [
	['/auth', 'iam'],
	['/workspaces', 'iam'],
	['/admin/audit-logs', 'audit'],
	['/catalog', 'catalog'],
	['/products', 'sourcing'],
	['/rfqs', 'sourcing'],
	['/quotations', 'sourcing'],
	['/orders', 'order'],
	['/media', 'media'],
	['/health', 'health'],
	['/metrics', 'metrics'],
] as const;

/**
 * HttpMetricsInterceptor — Global cross-cutting interceptor for Prometheus metrics.
 *
 * Automatically instruments every HTTP request with:
 *  - http_requests_total (Counter)
 *  - http_request_duration_seconds (Histogram)
 *
 * Uses `req.route?.path` (route template) instead of `req.url` (raw URL)
 * to prevent label explosion from UUIDs and query strings.
 */
@Injectable()
export class HttpMetricsInterceptor implements NestInterceptor {
	constructor(
		@InjectMetric(METRIC_HTTP_REQUESTS_TOTAL)
		private readonly requestCounter: Counter<string>,

		@InjectMetric(METRIC_HTTP_REQUEST_DURATION)
		private readonly durationHistogram: Histogram<string>,
	) {}

	intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
		const httpContext = context.switchToHttp();
		const request = httpContext.getRequest<Request>();
		const response = httpContext.getResponse<Response>();

		const method = request.method;
		// Use route template to avoid UUID label explosion
		const route = request.route?.path ?? request.path;
		const module = this.resolveModuleFromPath(request.path);

		const stopTimer = this.durationHistogram.startTimer();

		return next.handle().pipe(
			tap(() => {
				const labels = {
					method,
					route,
					status_code: String(response.statusCode),
					module,
				};

				this.requestCounter.inc(labels);
				stopTimer(labels);
			}),
			catchError((error: unknown) => {
				// Extract status code from HttpException since response.statusCode
				// hasn't been set by ExceptionFilter yet at this point
				const statusCode =
					error instanceof HttpException ? error.getStatus() : 500;

				const labels = {
					method,
					route,
					status_code: String(statusCode),
					module,
				};

				this.requestCounter.inc(labels);
				stopTimer(labels);

				return throwError(() => error);
			}),
		);
	}

	/**
	 * Resolve business module from the request path prefix.
	 *
	 * Iterates the MODULE_PREFIX_MAP in order, returning the first match.
	 * Falls back to 'unknown' for unmapped routes.
	 */
	private resolveModuleFromPath(path: string): string {
		for (const [prefix, moduleName] of MODULE_PREFIX_MAP) {
			if (path.startsWith(prefix)) return moduleName;
		}
		return 'unknown';
	}
}
