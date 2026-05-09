import { BadRequestException } from '@nestjs/common';
import { ZodError, ZodSchema } from 'zod';

/**
 * Validates data against a Zod schema
 * @param schema - Zod schema to validate against
 * @param data - Data to validate
 * @returns Validated data
 * @throws BadRequestException if validation fails
 */
export function validateWithZod<T>(schema: ZodSchema, data: unknown): T {
	try {
		return schema.parse(data) as T;
	} catch (error) {
		if (error instanceof ZodError) {
			const formattedErrors = error.errors.map((err) => ({
				path: err.path.join('.') || 'root',
				message: err.message,
				code: err.code,
			}));

			throw new BadRequestException({
				statusCode: 400,
				message: 'Validation failed',
				errors: formattedErrors,
			});
		}
		throw error;
	}
}

/**
 * Safely validates data without throwing
 * @param schema - Zod schema to validate against
 * @param data - Data to validate
 * @returns Object with success flag and either parsed data or errors
 */
export function safeValidateWithZod<T>(schema: ZodSchema, data: unknown) {
	const result = schema.safeParse(data);

	if (!result.success) {
		return {
			success: false,
			errors: result.error.errors.map((err) => ({
				path: err.path.join('.') || 'root',
				message: err.message,
				code: err.code,
			})),
		};
	}

	return {
		success: true,
		data: result.data as T,
	};
}

/**
 * Creates a reusable validator function for a schema
 * @param schema - Zod schema
 * @returns Function that validates data
 */
export function createValidator<T>(schema: ZodSchema) {
	return (data: unknown): T => validateWithZod<T>(schema, data);
}

/**
 * Creates a reusable safe validator function for a schema
 * @param schema - Zod schema
 * @returns Function that safely validates data
 */
export function createSafeValidator<T>(schema: ZodSchema) {
	return (data: unknown) => safeValidateWithZod<T>(schema, data);
}
