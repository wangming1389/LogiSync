import { SetMetadata } from '@nestjs/common';

export const RATE_LIMIT_KEY = 'rate-limit';

export type RateLimitKeyBy = 'ip' | 'user';

export interface RateLimitOptions {
	name: string;
	limit: number;
	windowMs: number;
	keyBy?: RateLimitKeyBy;
}

export const RateLimit = (options: RateLimitOptions) =>
	SetMetadata(RATE_LIMIT_KEY, options);
