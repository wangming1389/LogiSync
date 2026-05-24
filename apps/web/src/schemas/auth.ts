import { z } from 'zod';

export const WorkspaceTypeSchema = z.enum(['supplier', 'buyer', 'carrier']);

export const RegisterWorkspaceSchema = z
	.object({
		workspaceName: z.string().trim().min(1, 'Workspace name is required.'),
		workspaceType: WorkspaceTypeSchema,
		taxId: z
			.string()
			.trim()
			.regex(/^\d{10}(?:\d{3})?$/, 'Tax ID must be 10 or 13 digits.'),
		adminEmail: z.string().trim().email('Please enter a valid email address.'),
		password: z
			.string()
			.min(8, 'Password must be at least 8 characters.')
			.regex(/[a-z]/, 'Password must include 1 lowercase letter.')
			.regex(/[A-Z]/, 'Password must include 1 uppercase letter.')
			.regex(/\d/, 'Password must include 1 number.')
			.regex(/[^A-Za-z0-9]/, 'Password must include 1 special character.'),
		confirmPassword: z.string().min(1, 'Please confirm your password.'),
		acceptedTerms: z.boolean().refine(Boolean, {
			message: 'You must accept the terms and privacy policy.',
		}),
	})
	.refine((data) => data.password === data.confirmPassword, {
		path: ['confirmPassword'],
		message: 'Password confirmation does not match.',
	});

export type RegisterWorkspaceFormValues = z.infer<
	typeof RegisterWorkspaceSchema
>;
