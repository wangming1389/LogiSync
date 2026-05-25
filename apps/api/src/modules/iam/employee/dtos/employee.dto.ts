import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { WORKSPACE_ENABLEABLE_ROLES } from '../../workspace/enums/workspace.enums';

const ADD_EMPLOYEE_ROLES = WORKSPACE_ENABLEABLE_ROLES.filter(
	(role) => role !== 'company_admin',
);
const ADD_EMPLOYEE_ROLE_MESSAGE = `Invalid employee role. Allowed roles: ${ADD_EMPLOYEE_ROLES.join(', ')}`;

const optionalText = (max: number) =>
	z.preprocess(
		(value) => (value === '' ? undefined : value),
		z.string().min(1).max(max).optional(),
	);

export const AddEmployeeSchema = z.object({
	fullName: z.string().min(1, 'Full name is required').max(255),
	email: z
		.string()
		.email('Invalid employee email')
		.max(255)
		.transform((v) => v.toLowerCase().trim()),
	phoneNumber: z.string().min(1, 'Phone number is required').max(30),
	idCard: z.string().min(1, 'National ID is required').max(50),
	role: z.enum(ADD_EMPLOYEE_ROLES as [string, ...string[]], {
		errorMap: () => ({ message: ADD_EMPLOYEE_ROLE_MESSAGE }),
	}),
	department: z.string().min(1, 'Department is required').max(100),
	dateOfBirth: z.coerce.date(),
	vehicleTypePreference: optionalText(100),
	firstName: optionalText(100),
	lastName: optionalText(100),
});

export class AddEmployeeDto extends createZodDto(AddEmployeeSchema) {}

export const AddEmployeeResponseSchema = z.object({
	id: z.string().uuid(),
	fullName: z.string().nullable(),
	email: z.string().email(),
	firstName: z.string().nullable(),
	lastName: z.string().nullable(),
	phoneNumber: z.string().nullable(),
	idCard: z.string().nullable(),
	avatarUrl: z.string().nullable(),
	role: z.string(),
	department: z.string().nullable(),
	dateOfBirth: z.string().nullable(),
	vehicleTypePreference: z.string().nullable(),
	workspaceId: z.string().uuid(),
	mustChangePassword: z.boolean(),
});

export class AddEmployeeResponseDto extends createZodDto(
	AddEmployeeResponseSchema,
) {}
