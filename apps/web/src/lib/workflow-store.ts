'use client';

import { useEffect, useState } from 'react';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import {
	buyerComplaints,
	buyerOrders,
	buyerProducts,
	buyerRFQList,
	buyerThreeWayMatching,
	drivers,
	ePODData,
	freightQuotations,
	freightQuotesBuyer,
	negotiations,
	rfqList,
	shipments,
	tariffs,
	vehicles,
} from '@/app/data/mockData';
import { isDemoWorkspaceSession } from '@/lib/workspace-mode';

type BuyerRfq = (typeof buyerRFQList)[number] & {
	items?: { product: string; qty: number; unit: string; productId?: string }[];
	childRfqs?: { id: string; supplierWorkspaceId?: string; status?: string }[];
	product?: string;
	qty?: number;
	unit?: string;
	receivedAt?: string;
	note?: string;
	deliveryDate?: string;
	suppliers?: string[];
	createdAt?: string;
	deadline?: string;
};

type SupplierRfq = (typeof rfqList)[number] & {
	items?: {
		id?: string;
		product: string;
		qty: number;
		unit: string;
		productId?: string;
		deliveryDate?: string;
		notes?: string;
	}[];
	quotation?: {
		id?: string;
		price: number;
		terms: string;
		notes: string;
		submittedAt: string;
	};
};

type Negotiation = (typeof negotiations)[number];
type Shipment = (typeof shipments)[number];
type Tariff = (typeof tariffs)[number];
type FreightQuotation = (typeof freightQuotations)[number];
type BuyerOrder = (typeof buyerOrders)[number];
type BuyerComplaint = (typeof buyerComplaints)[number];
type BuyerMatching = (typeof buyerThreeWayMatching)[number];
type FreightQuoteBuyer = (typeof freightQuotesBuyer)[number];

export type WorkflowState = {
	drivers: typeof drivers;
	vehicles: typeof vehicles;
	buyerRfqs: BuyerRfq[];
	supplierRfqs: SupplierRfq[];
	negotiations: Negotiation[];
	shipments: Shipment[];
	tariffs: Tariff[];
	freightQuotations: FreightQuotation[];
	buyerOrders: BuyerOrder[];
	buyerComplaints: BuyerComplaint[];
	buyerMatching: BuyerMatching[];
	freightQuotesBuyer: FreightQuoteBuyer[];
	epodStatus: 'accepted' | 'disputed' | null;
	confirmedCarrierId: string | null;
	finalizedNegotiationIds: string[];
	disputeReason: string;
};

const STORAGE_KEY = 'logisync.workflow-state.v1';

function clone<T>(value: T): T {
	return JSON.parse(JSON.stringify(value)) as T;
}

export function createEmptyWorkflowState(): WorkflowState {
	return {
		drivers: [],
		vehicles: [],
		buyerRfqs: [],
		supplierRfqs: [],
		negotiations: [],
		shipments: [],
		tariffs: [],
		freightQuotations: [],
		buyerOrders: [],
		buyerComplaints: [],
		buyerMatching: [],
		freightQuotesBuyer: [],
		epodStatus: null,
		confirmedCarrierId: null,
		finalizedNegotiationIds: [],
		disputeReason: '',
	};
}

export function createDemoWorkflowState(): WorkflowState {
	return {
		drivers: clone(drivers),
		vehicles: clone(vehicles),
		buyerRfqs: clone(buyerRFQList),
		supplierRfqs: clone(rfqList),
		negotiations: clone(negotiations),
		shipments: clone(shipments),
		tariffs: clone(tariffs),
		freightQuotations: clone(freightQuotations),
		buyerOrders: clone(buyerOrders),
		buyerComplaints: clone(buyerComplaints),
		buyerMatching: clone(buyerThreeWayMatching),
		freightQuotesBuyer: clone(freightQuotesBuyer),
		epodStatus: null,
		confirmedCarrierId: null,
		finalizedNegotiationIds: [],
		disputeReason: '',
	};
}

// Demo-mode workflow store. Backed by `localStorage` via the `persist`
// middleware. Used by sourcing/RFQ/negotiation/orders pages while the
// workspace is in demo mode. State shape is `WorkflowState` directly,
// with no in-store actions — callers use the helpers below.
export const useWorkflowStore = create<WorkflowState>()(
	persist(() => createEmptyWorkflowState(), {
		name: STORAGE_KEY,
		storage: createJSONStorage(() => localStorage),
	}),
);

export function loadWorkflowState(): WorkflowState {
	if (typeof window === 'undefined') {
		return createEmptyWorkflowState();
	}
	return useWorkflowStore.getState();
}

export function useWorkflowState() {
	const [state, setState] = useState<WorkflowState>(createEmptyWorkflowState());

	useEffect(() => {
		if (!isDemoWorkspaceSession()) {
			useWorkflowStore.setState(createEmptyWorkflowState(), true);
			setState(createEmptyWorkflowState());
			return;
		}

		setState(useWorkflowStore.getState());
		return useWorkflowStore.subscribe((next) => {
			setState(next);
		});
	}, []);

	return [state, setState] as const;
}

export function saveWorkflowState(nextState: WorkflowState) {
	if (typeof window === 'undefined') return;
	useWorkflowStore.setState(nextState, true);
}

export function updateWorkflowState(
	updater: (currentState: WorkflowState) => WorkflowState,
) {
	const nextState = updater(useWorkflowStore.getState());
	saveWorkflowState(nextState);
	return nextState;
}

export function getWorkflowClone() {
	return clone(useWorkflowStore.getState());
}

export function makeWorkflowId(prefix: string, existingIds: string[]) {
	let counter = existingIds.length + 1;
	let candidate = `${prefix}${String(counter).padStart(3, '0')}`;
	while (existingIds.includes(candidate)) {
		counter += 1;
		candidate = `${prefix}${String(counter).padStart(3, '0')}`;
	}
	return candidate;
}

export type BuyerRfqItem = NonNullable<BuyerRfq['items']>[number];

export const workflowCatalog = {
	buyerProducts,
	ePODData,
	drivers,
	vehicles,
};
