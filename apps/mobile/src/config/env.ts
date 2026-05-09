import { z } from 'zod';

const envSchema = z.object({
  EXPO_PUBLIC_APP_ENV: z.string().default('development'),
  EXPO_PUBLIC_API_BASE_URL: z.string().url(),
  EXPO_PUBLIC_WS_URL: z.string().url(),
  EXPO_PUBLIC_SIGNED_URL_TTL_SECONDS: z.coerce.number().int().positive(),
  EXPO_PUBLIC_SESSION_IDLE_MINUTES: z.coerce.number().int().positive(),
  EXPO_PUBLIC_SESSION_GRACE_MINUTES: z.coerce.number().int().positive(),
  EXPO_PUBLIC_UPLOAD_MAX_MB: z.coerce.number().int().positive(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  throw new Error(`Invalid mobile environment configuration: ${parsed.error.message}`);
}

export const env = parsed.data;
