import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const PASSWORD_COMPLEXITY_REGEX =
	/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).+$/;

export interface JwtPayload {
	sub: string; // userId
	workspaceId: string;
	workspaceType: string;
	role: string;
	sessionId: string;
	jti: string; // jwtId used for blacklist on logout
	iat: number; // issued at
	exp: number;
}

export const LoginSchema = z.object({
	email: z
		.string()
		.email('Invalid email')
		.max(255)
		.transform((v) => v.toLowerCase().trim()),
	password: z.string().min(8, 'Password must be at least 8 characters'),
});

export class LoginDto extends createZodDto(LoginSchema) {}

export const LoginAccessTokenResponseSchema = z.object({
	accessToken: z.string(),
	expiresIn: z.number().describe('Token expiration (seconds)'),
	sessionWarningAt: z
		.number()
		.describe('Time to show warning (seconds remaining)'),
});

export const LoginChangePasswordResponseSchema = z.object({
	requiresPasswordChange: z.literal(true),
	changeToken: z
		.string()
		.describe('Short-lived JWT scoped to POST /auth/complete-registration'),
	expiresIn: z
		.number()
		.describe('Change token expiration in seconds (typically 900)'),
});

export const LoginResponseSchema = z.union([
	LoginAccessTokenResponseSchema,
	LoginChangePasswordResponseSchema,
]);

export class LoginResponseDto extends createZodDto(
	LoginAccessTokenResponseSchema,
) {}

export const ChangePasswordSchema = z
	.object({
		currentPassword: z.string().min(1, 'Current password cannot be empty'),
		newPassword: z
			.string()
			.min(8, 'New password must be at least 8 characters')
			.regex(
				PASSWORD_COMPLEXITY_REGEX,
				'New password must include uppercase, lowercase, number, and special character',
			),
	})
	.refine((data) => data.currentPassword !== data.newPassword, {
		message: 'New password must differ from current password',
		path: ['newPassword'],
	});

export class ChangePasswordDto extends createZodDto(ChangePasswordSchema) {}

// Me (Current User)
export const MeResponseSchema = z.object({
	id: z.string().uuid(),
	email: z.string().email(),
	firstName: z.string().nullable(),
	lastName: z.string().nullable(),
	role: z.string(),
	workspaceId: z.string().uuid(),
	lastLoginAt: z.string().nullable(),
});

export class MeResponseDto extends createZodDto(MeResponseSchema) {}
