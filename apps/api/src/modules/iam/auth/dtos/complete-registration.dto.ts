import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import {
	CHANGE_TOKEN_TYPE,
	PASSWORD_COMPLEXITY_REGEX,
} from '../constants/auth.constants';

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

export interface ChangeTokenPayload {
	sub: string;
	workspaceId: string;
	type: typeof CHANGE_TOKEN_TYPE;
	jti: string;
	iat?: number;
	exp?: number;
}
