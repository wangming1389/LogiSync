import {
	CanActivate,
	ExecutionContext,
	HttpException,
	HttpStatus,
	Injectable,
	OnModuleDestroy,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request, Response } from 'express';
import {
	RATE_LIMIT_KEY,
	RateLimitOptions,
} from '../../common/decorators/rate-limit.decorator';
import { getClientIp } from '../../common/utils/request.utils';

const CLEANUP_INTERVAL_MS = 5 * 60 * 1000;

interface RateLimitBucket {
	count: number;
	resetAt: number;
}

@Injectable()
export class RateLimitGuard implements CanActivate, OnModuleDestroy {
	private readonly buckets = new Map<string, RateLimitBucket>();
	private readonly cleanupTimer: NodeJS.Timeout;

	constructor(private readonly reflector: Reflector) {
		this.cleanupTimer = setInterval(
			() => this.pruneExpiredBuckets(),
			CLEANUP_INTERVAL_MS,
		);
		this.cleanupTimer.unref();
	}

	onModuleDestroy(): void {
		clearInterval(this.cleanupTimer);
	}

	canActivate(context: ExecutionContext): boolean {
		const options = this.reflector.getAllAndOverride<RateLimitOptions>(
			RATE_LIMIT_KEY,
			[context.getHandler(), context.getClass()],
		);

		if (!options) {
			return true;
		}

		const request = context.switchToHttp().getRequest<Request>();
		const response = context.switchToHttp().getResponse<Response>();
		const key = this.createBucketKey(options, request);
		const now = Date.now();
		const bucket = this.buckets.get(key);

		if (!bucket || bucket.resetAt <= now) {
			this.buckets.set(key, {
				count: 1,
				resetAt: now + options.windowMs,
			});
			return true;
		}

		if (bucket.count >= options.limit) {
			const retryAfterSeconds = Math.max(
				1,
				Math.ceil((bucket.resetAt - now) / 1000),
			);
			response.setHeader('Retry-After', retryAfterSeconds.toString());
			throw new HttpException(
				`Too many requests. Try again in ${retryAfterSeconds} seconds.`,
				HttpStatus.TOO_MANY_REQUESTS,
			);
		}

		bucket.count += 1;
		return true;
	}

	private createBucketKey(options: RateLimitOptions, request: Request): string {
		const ip = getClientIp(request);
		if (options.keyBy === 'user') {
			const userId = this.getAuthenticatedUserId(request);
			return `${options.name}:user:${userId}`;
		}

		return `${options.name}:${ip}`;
	}

	private getAuthenticatedUserId(request: Request): string {
		const user = (request as { user?: { id?: unknown; sub?: unknown } }).user;
		const userId = user?.sub ?? user?.id;
		if (typeof userId !== 'string' || userId.length === 0) {
			throw new HttpException(
				'Authenticated user is required',
				HttpStatus.UNAUTHORIZED,
			);
		}

		return userId;
	}

	private pruneExpiredBuckets(): void {
		const now = Date.now();
		for (const [key, bucket] of this.buckets.entries()) {
			if (bucket.resetAt <= now) {
				this.buckets.delete(key);
			}
		}
	}
}
