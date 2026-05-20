import {
	ArgumentsHost,
	Catch,
	ExceptionFilter,
	HttpException,
	HttpStatus,
} from '@nestjs/common';
import type { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
	catch(exception: unknown, host: ArgumentsHost): void {
		const context = host.switchToHttp();
		const request = context.getRequest<Request>();
		const response = context.getResponse<Response>();
		if (response.headersSent) {
			return;
		}

		const statusCode =
			exception instanceof HttpException
				? exception.getStatus()
				: HttpStatus.INTERNAL_SERVER_ERROR;
		const exceptionResponse =
			exception instanceof HttpException ? exception.getResponse() : null;
		const { message, details } = this.normalizeExceptionResponse(
			exception,
			exceptionResponse,
		);

		response.status(statusCode).json({
			success: false,
			data: null,
			error: {
				statusCode,
				code: this.toErrorCode(statusCode, exception),
				message,
				...(details === undefined ? {} : { details }),
			},
			meta: {
				path: request.path,
				method: request.method,
				timestamp: new Date().toISOString(),
			},
		});
	}

	private normalizeExceptionResponse(
		exception: unknown,
		exceptionResponse: string | object | null,
	) {
		if (typeof exceptionResponse === 'string') {
			return { message: exceptionResponse, details: undefined };
		}

		if (exceptionResponse && typeof exceptionResponse === 'object') {
			const payload = exceptionResponse as {
				message?: string | string[];
				error?: string;
				[key: string]: unknown;
			};
			return {
				message: Array.isArray(payload.message)
					? payload.message.join('; ')
					: (payload.message ?? payload.error ?? 'Request failed'),
				details: Array.isArray(payload.message) ? payload.message : undefined,
			};
		}

		if (exception instanceof Error) {
			return { message: exception.message, details: undefined };
		}

		return { message: 'Internal server error', details: undefined };
	}

	private toErrorCode(statusCode: number, exception: unknown) {
		if (exception instanceof HttpException) {
			return exception.constructor.name
				.replace(/Exception$/, '')
				.replace(/([a-z])([A-Z])/g, '$1_$2')
				.toUpperCase();
		}

		return statusCode >= 500 ? 'INTERNAL_SERVER_ERROR' : 'REQUEST_ERROR';
	}
}
