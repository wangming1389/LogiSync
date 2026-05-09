import { z } from 'zod';

/**
 * Workspace Validation Schemas
 */
export const createWorkspaceSchema = z.object({
	name: z.string().min(1, 'Workspace name is required').max(255),
	slug: z
		.string()
		.min(1, 'Workspace slug is required')
		.max(255)
		.regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens'),
	type: z.enum(['supplier', 'buyer', 'carrier'], {
		errorMap: () => ({ message: 'Type must be supplier, buyer, or carrier' }),
	}),
});

export type CreateWorkspaceInput = z.infer<typeof createWorkspaceSchema>;

export const updateWorkspaceSchema = createWorkspaceSchema.partial();
export type UpdateWorkspaceInput = z.infer<typeof updateWorkspaceSchema>;

/**
 * User Validation Schemas
 */
export const createUserSchema = z.object({
	email: z
		.string()
		.email('Invalid email address')
		.max(255, 'Email is too long'),
	passwordHash: z
		.string()
		.min(8, 'Password must be at least 8 characters')
		.max(255),
	firstName: z.string().min(1, 'First name is required').max(100),
	lastName: z.string().min(1, 'Last name is required').max(100),
	role: z.enum(['admin', 'manager', 'user'], {
		errorMap: () => ({ message: 'Role must be admin, manager, or user' }),
	}),
	workspaceId: z.string().uuid('Invalid workspace ID'),
	isActive: z.boolean().default(true),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;

export const updateUserSchema = createUserSchema.partial();
export type UpdateUserInput = z.infer<typeof updateUserSchema>;

/**
 * Login Validation Schema
 */
export const loginSchema = z.object({
	email: z.string().email('Invalid email address'),
	password: z.string().min(1, 'Password is required'),
});

export type LoginInput = z.infer<typeof loginSchema>;

/**
 * Audit Log Validation Schema
 */
export const auditLogSchema = z.object({
	actorId: z.string().uuid('Invalid actor ID'),
	workspaceId: z.string().uuid('Invalid workspace ID'),
	action: z.string().min(1, 'Action is required').max(255),
	resourceType: z.string().min(1, 'Resource type is required').max(100),
	resourceId: z.string().uuid('Invalid resource ID').optional(),
	ipAddress: z.string().ip({ version: 'v4' }).optional(),
	status: z.enum(['success', 'failure'], {
		errorMap: () => ({ message: 'Status must be success or failure' }),
	}),
	metadata: z.record(z.any()).optional(),
});

export type AuditLogInput = z.infer<typeof auditLogSchema>;

/**
 * Pagination Schema
 */
export const paginationSchema = z.object({
	page: z.number().int().min(1).default(1),
	limit: z.number().int().min(1).max(100).default(10),
	sortBy: z.string().optional(),
	sortOrder: z.enum(['asc', 'desc']).default('asc'),
});

export type PaginationInput = z.infer<typeof paginationSchema>;

/**
 * Query Filters Schema
 */
export const workspaceFilterSchema = z.object({
	search: z.string().optional(),
	type: z.enum(['supplier', 'buyer', 'carrier']).optional(),
	isActive: z.boolean().optional(),
	...paginationSchema.shape,
});

export type WorkspaceFilterInput = z.infer<typeof workspaceFilterSchema>;

export const userFilterSchema = z.object({
	search: z.string().optional(),
	role: z.enum(['admin', 'manager', 'user']).optional(),
	isActive: z.boolean().optional(),
	workspaceId: z.string().uuid().optional(),
	...paginationSchema.shape,
});

export type UserFilterInput = z.infer<typeof userFilterSchema>;
