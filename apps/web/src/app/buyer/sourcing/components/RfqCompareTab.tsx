'use client';

import { useState } from 'react';
import { useSelectQuotation } from '@/services/mutations/useSourcingMutations';
import { useQuotations, useRfqs } from '@/services/queries/useSourcingQueries';

// Reference implementation that pairs `useRfqs` + `useQuotations`
// with `useSelectQuotation`. Mirrors `ProductSearchTab` and is the
// template for the rest of the sourcing UI to migrate to.

export function RfqCompareTab() {
	const {
		data: rfqs = [],
		isLoading: rfqsLoading,
		error: rfqsError,
	} = useRfqs();
	const [selectedRfqId, setSelectedRfqId] = useState<string | null>(null);
	const { data: quotations = [], isLoading: quotationsLoading } =
		useQuotations(selectedRfqId);
	const selectQuotation = useSelectQuotation();

	return (
		<section className="grid gap-4 lg:grid-cols-[1fr_2fr]">
			<aside className="rounded-lg border border-neutral-200 p-3">
				<h2 className="text-sm font-semibold">My RFQs</h2>
				{rfqsLoading ? (
					<p className="mt-2 text-xs text-neutral-500">Loading RFQs…</p>
				) : rfqsError ? (
					<p className="mt-2 text-xs text-red-600">Failed to load RFQs.</p>
				) : rfqs.length === 0 ? (
					<p className="mt-2 text-xs text-neutral-500">No RFQs yet.</p>
				) : (
					<ul className="mt-2 flex flex-col gap-1">
						{rfqs.map((rfq) => (
							<li key={rfq.id}>
								<button
									type="button"
									onClick={() => setSelectedRfqId(rfq.id)}
									className={`w-full rounded px-2 py-1 text-left text-xs ${
										selectedRfqId === rfq.id
											? 'bg-neutral-900 text-white'
											: 'hover:bg-neutral-100'
									}`}
								>
									{rfq.id} — {rfq.status ?? 'unknown'}
								</button>
							</li>
						))}
					</ul>
				)}
			</aside>

			<div className="rounded-lg border border-neutral-200 p-3">
				<h2 className="text-sm font-semibold">Quotations</h2>
				{!selectedRfqId ? (
					<p className="mt-2 text-xs text-neutral-500">
						Select an RFQ to view supplier quotations.
					</p>
				) : quotationsLoading ? (
					<p className="mt-2 text-xs text-neutral-500">Loading quotations…</p>
				) : quotations.length === 0 ? (
					<p className="mt-2 text-xs text-neutral-500">
						No quotations have been submitted for this RFQ yet.
					</p>
				) : (
					<ul className="mt-2 flex flex-col gap-2">
						{quotations.map((quotation) => (
							<li
								key={quotation.id}
								className="flex items-center justify-between rounded border border-neutral-200 px-3 py-2 text-xs"
							>
								<div>
									<p className="font-medium">{quotation.id}</p>
									<p className="text-neutral-500">
										{quotation.totalPrice
											? `₫${quotation.totalPrice.toLocaleString('vi-VN')}`
											: '—'}{' '}
										· {quotation.status ?? 'submitted'}
									</p>
								</div>
								<button
									type="button"
									disabled={selectQuotation.isPending}
									onClick={() =>
										selectQuotation.mutate({
											rfqId: selectedRfqId,
											quotationId: quotation.id,
										})
									}
									className="rounded bg-neutral-900 px-2 py-1 text-white disabled:opacity-50"
								>
									{selectQuotation.isPending ? 'Selecting…' : 'Select'}
								</button>
							</li>
						))}
					</ul>
				)}
			</div>
		</section>
	);
}
