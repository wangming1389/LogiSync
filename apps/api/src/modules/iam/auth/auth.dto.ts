import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export interface JwtPayload {
	sub: string; // userId
	workspaceId: string;
	workspaceType?: string;
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

export const LoginResponseSchema = z.object({
	accessToken: z.string(),
	expiresIn: z.number().describe('Token expiration (seconds)'),
	sessionWarningAt: z
		.number()
		.describe('Time to show warning (seconds remaining)'),
});

export class LoginResponseDto extends createZodDto(LoginResponseSchema) {}

export const ChangePasswordSchema = z
	.object({
		currentPassword: z.string().min(1, 'Current password cannot be empty'),
		newPassword: z
			.string()
			.min(8, 'New password must be at least 8 characters'),
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
