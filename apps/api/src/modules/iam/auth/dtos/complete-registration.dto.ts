import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const PASSWORD_COMPLEXITY_REGEX =
	/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).+$/;

export const CompleteRegistrationSchema = z.object({
	newPassword: z
		.string()
		.min(8, 'New password must be at least 8 characters')
		.regex(
			PASSWORD_COMPLEXITY_REGEX,
			'New password must include uppercase, lowercase, number, and special character',
		),
});

export class CompleteRegistrationDto extends createZodDto(
	CompleteRegistrationSchema,
) {}

export const CHANGE_TOKEN_TYPE = 'complete-registration';
export const CHANGE_TOKEN_TTL_SECONDS = 15 * 60;

export interface ChangeTokenPayload {
	sub: string;
	workspaceId: string;
	type: typeof CHANGE_TOKEN_TYPE;
	jti: string;
	iat?: number;
	exp?: number;
}
