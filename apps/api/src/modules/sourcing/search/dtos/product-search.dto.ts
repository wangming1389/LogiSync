import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import {
	PRODUCT_SEARCH_SORT_FIELDS,
	PRODUCT_SEARCH_SORT_ORDERS,
} from '../enums/product-search.enums';

export const ProductSearchQuerySchema = z.object({
	keyword: z.string().trim().optional(),
	catalogCategoryId: z.string().uuid().optional(),
	minPrice: z.coerce.number().int().nonnegative().optional(),
	maxPrice: z.coerce.number().int().nonnegative().optional(),
	supplierWorkspaceIds: z
		.union([z.string(), z.array(z.string().uuid())])
		.optional()
		.transform((v) => {
			if (v === undefined) return undefined;
			if (Array.isArray(v)) return v;
			return v
				.split(',')
				.map((s) => s.trim())
				.filter(Boolean);
		}),
	sortBy: z.enum(PRODUCT_SEARCH_SORT_FIELDS).optional(),
	order: z.enum(PRODUCT_SEARCH_SORT_ORDERS).optional(),
	// QAR-05: max 25 items per page
	limit: z.coerce.number().int().positive().max(25).optional().default(25),
	offset: z.coerce.number().int().min(0).optional().default(0),
});

export class ProductSearchQueryDto extends createZodDto(
	ProductSearchQuerySchema,
) {}
