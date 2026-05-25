'use client';

import { useQuery } from '@tanstack/react-query';
import {
	buyerProducts,
	buyerRFQList,
	freightQuotations,
} from '@/app/data/mockData';
import { isDemoWorkspaceSession } from '@/lib/workspace-mode';
import {
	type Product,
	ProductSchema,
	type Quotation,
	QuotationSchema,
	type Rfq,
	RfqSchema,
} from '@/schemas/sourcing';
import {
	fetchProducts,
	fetchQuotations,
	fetchRfqs,
} from '@/services/api/sourcing';

// Repository-pattern React Query hooks for the sourcing domain.
// In demo mode we synthesise responses from `mockData`; in real-API
// mode we delegate to the typed fetchers in `services/api/sourcing.ts`.
// UI components should call these hooks instead of inspecting
// `isDemoWorkspaceSession()` themselves.

export const sourcingQueryKeys = {
	all: ['sourcing'] as const,
	products: (params?: { query?: string; limit?: number }) =>
		[...sourcingQueryKeys.all, 'products', params] as const,
	rfqs: () => [...sourcingQueryKeys.all, 'rfqs'] as const,
	quotations: (rfqId: string) =>
		[...sourcingQueryKeys.all, 'quotations', rfqId] as const,
};

function adaptMockProduct(product: (typeof buyerProducts)[number]): Product {
	const candidate = {
		id: product.id,
		name: product.name,
		unitPrice: product.basePrice,
		minOrderQty: product.minQty,
		supplierWorkspaceName: product.supplier,
		uomCode: product.unit,
		catalogCategoryName: product.category,
		reputationScore: product.supplierScore,
	};
	return ProductSchema.parse(candidate);
}

function adaptMockRfq(rfq: (typeof buyerRFQList)[number]): Rfq {
	return RfqSchema.parse({
		id: rfq.id,
		status: rfq.status,
		createdAt: 'createdAt' in rfq ? rfq.createdAt : undefined,
	});
}

function adaptMockQuotation(
	rfqId: string,
	quotation: (typeof freightQuotations)[number],
): Quotation {
	return QuotationSchema.parse({
		id: quotation.id,
		rfqId,
		totalPrice: 'price' in quotation ? quotation.price : null,
		status: 'status' in quotation ? quotation.status : 'submitted',
	});
}

export function useProducts(params?: { query?: string; limit?: number }) {
	const demo = isDemoWorkspaceSession();
	return useQuery({
		queryKey: sourcingQueryKeys.products(params),
		queryFn: async (): Promise<Product[]> => {
			if (demo) {
				return buyerProducts.map(adaptMockProduct);
			}
			return fetchProducts(params);
		},
		staleTime: 30_000,
	});
}

export function useRfqs() {
	const demo = isDemoWorkspaceSession();
	return useQuery({
		queryKey: sourcingQueryKeys.rfqs(),
		queryFn: async (): Promise<Rfq[]> => {
			if (demo) {
				return buyerRFQList.map(adaptMockRfq);
			}
			return fetchRfqs();
		},
		staleTime: 30_000,
	});
}

export function useQuotations(rfqId: string | null | undefined) {
	const demo = isDemoWorkspaceSession();
	return useQuery({
		queryKey: sourcingQueryKeys.quotations(rfqId ?? ''),
		queryFn: async (): Promise<Quotation[]> => {
			if (!rfqId) return [];
			if (demo) {
				return freightQuotations.map((quotation) =>
					adaptMockQuotation(rfqId, quotation),
				);
			}
			return fetchQuotations(rfqId);
		},
		enabled: Boolean(rfqId),
		staleTime: 30_000,
	});
}
