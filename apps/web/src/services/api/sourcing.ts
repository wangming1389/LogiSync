import { z } from 'zod';
import { api } from '@/lib/api';
import { unwrapApiEnvelope, unwrapApiList } from '@/lib/order-store';
import {
	type Product,
	ProductSchema,
	type Quotation,
	QuotationSchema,
	type Rfq,
	RfqSchema,
	type SelectQuotationInput,
	type SubmitRfqInput,
} from '@/schemas/sourcing';

// Raw API access for sourcing endpoints. These functions never touch
// React state — they exist so React Query hooks (and tests) can mock
// the network layer independently of any UI concerns.

function parseList<T>(schema: z.ZodType<T>, response: unknown): T[] {
	const items = unwrapApiList<unknown>(response);
	return items
		.map((item) => schema.safeParse(item))
		.filter((result): result is z.SafeParseSuccess<T> => result.success)
		.map((result) => result.data);
}

function parseOne<T>(schema: z.ZodType<T>, response: unknown): T | null {
	const payload = unwrapApiEnvelope<unknown>(response);
	const result = schema.safeParse(payload);
	return result.success ? result.data : null;
}

export async function fetchProducts(
	params: { limit?: number; query?: string } = {},
): Promise<Product[]> {
	const search = new URLSearchParams();
	if (params.limit) search.set('limit', String(params.limit));
	if (params.query) search.set('q', params.query);
	const qs = search.toString();
	const response = await api.get<unknown>(
		`/products/search${qs ? `?${qs}` : ''}`,
	);
	return parseList(ProductSchema, response);
}

export async function fetchRfqs(): Promise<Rfq[]> {
	const response = await api.get<unknown>('/rfqs');
	return parseList(RfqSchema, response);
}

export async function fetchQuotations(rfqId: string): Promise<Quotation[]> {
	const response = await api.get<unknown>(
		`/quotations?rfqId=${encodeURIComponent(rfqId)}`,
	);
	return parseList(QuotationSchema, response);
}

export async function submitRfq(input: SubmitRfqInput): Promise<Rfq | null> {
	const response = await api.post<unknown>('/rfqs', input);
	return parseOne(RfqSchema, response);
}

export async function selectQuotation(
	input: SelectQuotationInput,
): Promise<Quotation | null> {
	const response = await api.post<unknown>(
		`/rfqs/${encodeURIComponent(input.rfqId)}/select-quotation`,
		{ quotationId: input.quotationId },
	);
	return parseOne(QuotationSchema, response);
}
