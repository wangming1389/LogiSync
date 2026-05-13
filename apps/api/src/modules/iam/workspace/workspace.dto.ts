import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

// Vietnam Tax ID: 10 or 13 digits
const TAX_ID_REGEX = /^\d{10}(\d{3})?$/;

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
	type: z.enum(['supplier', 'buyer', 'carrier'], {
		errorMap: () => ({ message: 'Type must be supplier, buyer, or carrier' }),
	}),
	taxId: z.string().regex(TAX_ID_REGEX, 'Invalid tax ID (10 or 13 digits)'),
	acceptedTermsVersion: z.string().min(1, 'Must accept terms of service'),
	// Admin user for new workspace
	adminEmail: z
		.string()
		.email('Invalid admin email')
		.max(255)
		.transform((v) => v.toLowerCase().trim()),
	adminPassword: z
		.string()
		.min(8, 'Admin password must be at least 8 characters'),
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

export const EnableRoleSchema = z.object({
	role: z.enum(
		[
			'company_admin',
			'supplier_manager',
			'supplier_staff',
			'supplier_accountant',
			'buyer_manager',
			'buyer_staff',
			'carrier_dispatcher',
			'driver',
			'hr_manager',
		],
		{
			errorMap: () => ({ message: 'Invalid role' }),
		},
	),
});

export class EnableRoleDto extends createZodDto(EnableRoleSchema) {}

// Filter/Pagination
export const WorkspaceFilterSchema = z.object({
	status: z.enum(['pending', 'active', 'suspended', 'revoked']).optional(),
	page: z.coerce.number().int().min(1).default(1),
	limit: z.coerce.number().int().min(1).max(100).default(20),
});

export class WorkspaceFilterDto extends createZodDto(WorkspaceFilterSchema) {}
