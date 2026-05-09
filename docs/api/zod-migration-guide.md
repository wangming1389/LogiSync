# Zod Validation Migration Guide

## Overview

This project has migrated from `class-validator` to `zod` for data validation. Zod provides better TypeScript support, more flexible validation, and cleaner API.

## Installation

Zod is already installed in `package.json`. No additional installation needed.

## Basic Usage

### 1. Using Validation Schemas in Controllers

```typescript
import { Controller, Post, Body } from "@nestjs/common";
import { createUserSchema } from "@/common/schemas/validation.schemas";
import { validateWithZod } from "@/common/utils/validation.utils";

@Controller("users")
export class UsersController {
  @Post()
  createUser(@Body() body: unknown) {
    // Validate and parse the body
    const validatedData = validateWithZod(createUserSchema, body);

    return {
      message: "User created successfully",
      user: validatedData,
    };
  }
}
```

### 2. Using Safe Validation (No Throwing)

```typescript
import { safeValidateWithZod } from '@/common/utils/validation.utils';

@Post()
createUser(@Body() body: unknown) {
  const result = safeValidateWithZod(createUserSchema, body);

  if (!result.success) {
    return {
      statusCode: 400,
      message: 'Validation failed',
      errors: result.errors,
    };
  }

  return {
    message: 'User created successfully',
    user: result.data,
  };
}
```

### 3. Creating Custom Validation Schemas

```typescript
import { z } from "zod";

// Basic schema
export const createProductSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  price: z.number().min(0, "Price must be positive"),
  description: z.string().optional(),
  category: z.enum(["electronics", "clothing", "books"]),
});

// Type from schema (fully typed!)
export type CreateProductInput = z.infer<typeof createProductSchema>;

// Partial update schema
export const updateProductSchema = createProductSchema.partial();

// Array schema
export const productsListSchema = z.array(createProductSchema);

// With custom validation
export const emailSchema = z
  .string()
  .email("Invalid email format")
  .transform((val) => val.toLowerCase());
```

### 4. Validation in DTOs (Alternative Approach)

Instead of class-validator decorators, you can use zod directly:

```typescript
// Before: class-validator
// export class CreateUserDto {
//   @IsEmail()
//   email: string;
//
//   @IsString()
//   @MinLength(8)
//   password: string;
// }

// After: zod
export const createUserDtoSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export type CreateUserDto = z.infer<typeof createUserDtoSchema>;
```

### 5. Common Schema Patterns

```typescript
// Pagination
const paginationSchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(10),
});

// Filters with AND/OR logic
const userFiltersSchema = z.object({
  role: z.enum(["admin", "user"]).optional(),
  isActive: z.boolean().optional(),
  createdAfter: z.date().optional(),
});

// Conditional validation
const orderSchema = z
  .object({
    paymentMethod: z.enum(["card", "bank"]),
    cardNumber: z.string().optional(),
    bankAccount: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.paymentMethod === "card" && !data.cardNumber) return false;
      if (data.paymentMethod === "bank" && !data.bankAccount) return false;
      return true;
    },
    { message: "Invalid payment details for selected method" },
  );

// Discriminated unions
const responseSchema = z.discriminatedUnion("status", [
  z.object({ status: z.literal("success"), data: z.any() }),
  z.object({ status: z.literal("error"), error: z.string() }),
]);
```

## API Error Response Format

When validation fails using `validateWithZod`, the error response format is:

```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "errors": [
    {
      "path": "email",
      "message": "Invalid email address",
      "code": "invalid_string"
    },
    {
      "path": "password",
      "message": "String must contain at least 8 character(s)",
      "code": "too_small"
    }
  ]
}
```

## Migration Checklist

- [x] Remove `class-validator` from package.json
- [x] Add `zod` to package.json
- [x] Create ZodValidationPipe
- [x] Create validation schemas
- [x] Create validation utilities
- [ ] Update existing controllers to use zod
- [ ] Update tests to use zod schemas
- [ ] Update module documentation

## Common Zod Methods

```typescript
// String validations
z.string().email()
z.string().url()
z.string().uuid()
z.string().min(5)
z.string().max(100)
z.string().regex(/^[a-z]+$/)
z.string().startsWith('prefix')
z.string().endsWith('suffix')
z.string().toLowerCase()
z.string().toUpperCase()

// Number validations
z.number().int()
z.number().positive()
z.number().negative()
z.number().min(0)
z.number().max(100)
z.number().multipleOf(5)

// Array validations
z.array(z.string()).min(1)
z.array(z.string()).max(10)
z.array(z.string()).nonempty()

// Boolean and enums
z.boolean()
z.enum(['a', 'b', 'c'])

// Custom validations
z.string().refine(val => val.length > 5, 'Too short')
z.object({...}).refine(obj => obj.password === obj.passwordConfirm)

// Optional and nullable
z.string().optional()
z.string().nullable()
z.string().default('default value')
```

## References

- [Zod Documentation](https://zod.dev)
- [NestJS Validation](https://docs.nestjs.com/techniques/validation)
- [Zod Error Handling](https://zod.dev/ERROR_HANDLING)

## Questions or Issues?

Contact the team or refer to the validation examples in the codebase.
