import { z } from 'zod';

const envSchema = z.object({
	NEXT_PUBLIC_APP_ENV: z.string().default('development'),
	NEXT_PUBLIC_API_BASE_URL: z.string().url(),
	NEXT_PUBLIC_WS_URL: z.string().url(),
	NEXT_PUBLIC_SIGNED_URL_TTL_SECONDS: z.coerce.number().int().positive(),
	NEXT_PUBLIC_SESSION_IDLE_MINUTES: z.coerce.number().int().positive(),
	NEXT_PUBLIC_SESSION_GRACE_MINUTES: z.coerce.number().int().positive(),
	NEXT_PUBLIC_UPLOAD_MAX_MB: z.coerce.number().int().positive(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
	throw new Error(
		`Invalid web environment configuration: ${parsed.error.message}`,
	);
}

export const env = parsed.data;
