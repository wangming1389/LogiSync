import { z } from 'zod';

// Zod schemas for the sourcing domain. They mirror the API contract
// exposed by `@logisync/api` and are used both for runtime validation
// of network responses and for typing the React Query hooks.

export const ProductSchema = z.object({
	id: z.string(),
	sku: z.string().nullish(),
	name: z.string(),
	workspaceId: z.string().optional(),
	uomId: z.string().nullish(),
	uomCode: z.string().nullish(),
	uomName: z.string().nullish(),
	supplierWorkspaceName: z.string().nullish(),
	supplierWorkspaceSlug: z.string().nullish(),
	unitPrice: z.number(),
	minOrderQty: z.number().nullish(),
	catalogCategoryName: z.string().nullish(),
	reputationScore: z.number().nullish(),
});

export type Product = z.infer<typeof ProductSchema>;

export const RfqItemSchema = z.object({
	id: z.string().optional(),
	productId: z.string().optional(),
	quantity: z.number().optional(),
	qty: z.number().optional(),
	unit: z.string().optional(),
	deliveryDate: z.string().nullish(),
	notes: z.string().nullish(),
});

export type RfqItem = z.infer<typeof RfqItemSchema>;

export const RfqSchema = z.object({
	id: z.string(),
	parentRfqId: z.string().nullish(),
	buyerWorkspaceId: z.string().optional(),
	supplierWorkspaceId: z.string().nullish(),
	status: z.string().optional(),
	note: z.string().nullish(),
	submittedAt: z.string().nullish(),
	createdAt: z.string().nullish(),
	updatedAt: z.string().nullish(),
	items: z.array(RfqItemSchema).optional(),
});

export type Rfq = z.infer<typeof RfqSchema>;

export const QuotationItemSchema = z.object({
	quantity: z.number().nullish(),
	unitPrice: z.number().nullish(),
});

export const QuotationSchema = z.object({
	id: z.string(),
	rfqId: z.string(),
	supplierWorkspaceId: z.string().nullish(),
	status: z.string().optional(),
	totalPrice: z.number().nullish(),
	unitPrice: z.number().nullish(),
	estimatedDeliveryDate: z.number().nullish(),
	deliveryTerms: z.string().nullish(),
	note: z.string().nullish(),
	submittedAt: z.string().nullish(),
	createdAt: z.string().nullish(),
	items: z.array(QuotationItemSchema).optional(),
});

export type Quotation = z.infer<typeof QuotationSchema>;

// Input schemas for mutation hooks.
export const SubmitRfqInputSchema = z.object({
	items: z
		.array(
			z.object({
				productId: z.string(),
				quantity: z.number().int().positive(),
			}),
		)
		.min(1),
	deliveryDate: z.string().optional(),
	note: z.string().optional(),
	supplierWorkspaceIds: z.array(z.string()).optional(),
});

export type SubmitRfqInput = z.infer<typeof SubmitRfqInputSchema>;

export const SelectQuotationInputSchema = z.object({
	rfqId: z.string(),
	quotationId: z.string(),
});

export type SelectQuotationInput = z.infer<typeof SelectQuotationInputSchema>;
