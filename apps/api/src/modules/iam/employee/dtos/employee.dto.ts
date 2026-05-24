import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { WORKSPACE_ENABLEABLE_ROLES } from '../../workspace/enums/workspace.enums';

const ADD_EMPLOYEE_ROLES = WORKSPACE_ENABLEABLE_ROLES.filter(
	(role) => role !== 'company_admin',
);

export const AddEmployeeSchema = z.object({
	email: z
		.string()
		.email('Invalid employee email')
		.max(255)
		.transform((v) => v.toLowerCase().trim()),
	firstName: z.string().min(1).max(100),
	lastName: z.string().min(1).max(100),
	role: z.enum(ADD_EMPLOYEE_ROLES as [string, ...string[]], {
		errorMap: () => ({
			message: `Role must be one of: ${ADD_EMPLOYEE_ROLES.join(', ')}`,
		}),
	}),
	department: z.string().max(100).optional(),
});

export class AddEmployeeDto extends createZodDto(AddEmployeeSchema) {}

export const AddEmployeeResponseSchema = z.object({
	id: z.string().uuid(),
	email: z.string().email(),
	firstName: z.string().nullable(),
	lastName: z.string().nullable(),
	role: z.string(),
	workspaceId: z.string().uuid(),
	mustChangePassword: z.boolean(),
});

export class AddEmployeeResponseDto extends createZodDto(
	AddEmployeeResponseSchema,
) {}
