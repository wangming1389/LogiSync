import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { PASSWORD_COMPLEXITY_REGEX } from '../../auth/constants/auth.constants';
import {
	WORKSPACE_ENABLEABLE_ROLES,
	WORKSPACE_STATUSES,
	WORKSPACE_TYPES,
} from '../enums/workspace.enums';

const TAX_ID_REGEX = /^\d{10,13}$/;

export const RegisterWorkspaceSchema = z.object({
	name: z
		.string()
		.min(2, 'Workspace name must be at least 2 characters')
		.max(255),
	slug: z
		.string()
		.min(2)
		.max(255)
		.regex(
			/^[a-z0-9]+(?:-[a-z0-9]+)*$/,
			'Slug can only contain lowercase letters, numbers, and hyphens',
		),
	types: z
		.array(
			z.enum(WORKSPACE_TYPES, {
				errorMap: () => ({
					message: 'Each type must be supplier, buyer, or carrier',
				}),
			}),
		)
		.min(1, 'At least one workspace type is required'),
	taxId: z.string().regex(TAX_ID_REGEX, 'Invalid tax ID (10 to 13 digits)'),
	acceptedTermsVersion: z.string().min(1, 'Must accept terms of service'),
	// Admin user for new workspace
	adminEmail: z
		.string()
		.email('Invalid admin email')
		.max(255)
		.transform((v) => v.toLowerCase().trim()),
	adminPassword: z
		.string()
		.min(8, 'Admin password must be at least 8 characters')
		.regex(
			PASSWORD_COMPLEXITY_REGEX,
			'Admin password must include uppercase, lowercase, number, and special character',
		),
	adminFirstName: z.string().max(100).optional(),
	adminLastName: z.string().max(100).optional(),
});

export class RegisterWorkspaceDto extends createZodDto(
	RegisterWorkspaceSchema,
) {}

export const UpdateWorkspaceSchema = z.object({
	name: z
		.string()
		.min(2, 'Workspace name must be at least 2 characters')
		.max(255)
		.optional(),
});

export class UpdateWorkspaceDto extends createZodDto(UpdateWorkspaceSchema) {}

export const RejectWorkspaceSchema = z.object({
	rejectionReason: z
		.string()
		.min(1, 'Rejection reason cannot be empty')
		.max(2000),
});

export class RejectWorkspaceDto extends createZodDto(RejectWorkspaceSchema) {}

export const RevokeWorkspaceSchema = z.object({
	companyNameConfirmation: z
		.string()
		.min(1, 'Company name confirmation cannot be empty')
		.max(255),
});

export class RevokeWorkspaceDto extends createZodDto(RevokeWorkspaceSchema) {}

export const EnableRoleSchema = z.object({
	role: z.enum(WORKSPACE_ENABLEABLE_ROLES, {
		errorMap: () => ({ message: 'Invalid role' }),
	}),
});

export class EnableRoleDto extends createZodDto(EnableRoleSchema) {}

// Filter/Pagination
export const WorkspaceFilterSchema = z.object({
	status: z.enum(WORKSPACE_STATUSES).optional(),
	page: z.coerce.number().int().min(1).default(1),
	limit: z.coerce.number().int().min(1).max(100).default(20),
});

export class WorkspaceFilterDto extends createZodDto(WorkspaceFilterSchema) {}
