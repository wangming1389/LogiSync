'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
	getWorkflowClone,
	makeWorkflowId,
	saveWorkflowState,
} from '@/lib/workflow-store';
import { isDemoWorkspaceSession } from '@/lib/workspace-mode';
import type {
	Quotation,
	Rfq,
	SelectQuotationInput,
	SubmitRfqInput,
} from '@/schemas/sourcing';
import {
	selectQuotation as selectQuotationApi,
	submitRfq as submitRfqApi,
} from '@/services/api/sourcing';
import { sourcingQueryKeys } from '@/services/queries/useSourcingQueries';

// Mutation hooks that mirror the queries. Demo mode mutates the
// Zustand workflow store; real-API mode POSTs to the backend and
// invalidates the React Query cache so the next read is fresh.

export function useSubmitRfq() {
	const client = useQueryClient();
	const demo = isDemoWorkspaceSession();

	return useMutation({
		mutationFn: async (input: SubmitRfqInput): Promise<Rfq | null> => {
			if (demo) {
				const workflow = getWorkflowClone();
				const id = makeWorkflowId(
					'BRFQ',
					workflow.buyerRfqs.map((rfq) => rfq.id),
				);
				const items = input.items.map((item) => ({
					product: item.productId,
					productId: item.productId,
					qty: item.quantity,
					unit: 'unit',
				}));
				const next = {
					...workflow,
					buyerRfqs: [
						...workflow.buyerRfqs,
						{
							id,
							status: 'submitted' as const,
							items,
							deliveryDate: input.deliveryDate,
							note: input.note,
							createdAt: new Date().toISOString(),
						} as (typeof workflow.buyerRfqs)[number],
					],
				};
				saveWorkflowState(next);
				return {
					id,
					status: 'submitted',
					items: items.map((item) => ({
						productId: item.productId,
						quantity: item.qty,
					})),
				};
			}
			return submitRfqApi(input);
		},
		onSuccess: () => {
			client.invalidateQueries({ queryKey: sourcingQueryKeys.rfqs() });
		},
	});
}

export function useSelectQuotation() {
	const client = useQueryClient();
	const demo = isDemoWorkspaceSession();

	return useMutation({
		mutationFn: async (
			input: SelectQuotationInput,
		): Promise<Quotation | null> => {
			if (demo) {
				const workflow = getWorkflowClone();
				const next = {
					...workflow,
					finalizedNegotiationIds: [
						...new Set([
							...workflow.finalizedNegotiationIds,
							input.quotationId,
						]),
					],
				};
				saveWorkflowState(next);
				return {
					id: input.quotationId,
					rfqId: input.rfqId,
					status: 'selected',
				};
			}
			return selectQuotationApi(input);
		},
		onSuccess: (_data, variables) => {
			client.invalidateQueries({
				queryKey: sourcingQueryKeys.quotations(variables.rfqId),
			});
			client.invalidateQueries({ queryKey: sourcingQueryKeys.rfqs() });
		},
	});
}
