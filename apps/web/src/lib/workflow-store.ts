import { useEffect, useState } from 'react';
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
	quotation?: {
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

export function loadWorkflowState(): WorkflowState {
	if (typeof window === 'undefined') {
		return createEmptyWorkflowState();
	}

	try {
		const raw = window.localStorage.getItem(STORAGE_KEY);
		if (!raw) return createEmptyWorkflowState();
		const parsed = JSON.parse(raw) as Partial<WorkflowState>;
		return {
			...createEmptyWorkflowState(),
			...parsed,
			drivers: Array.isArray(parsed.drivers)
				? parsed.drivers
				: createEmptyWorkflowState().drivers,
			vehicles: Array.isArray(parsed.vehicles)
				? parsed.vehicles
				: createEmptyWorkflowState().vehicles,
		};
	} catch {
		return createEmptyWorkflowState();
	}
}

export function useWorkflowState() {
	const [state, setState] = useState<WorkflowState>(createEmptyWorkflowState());

	useEffect(() => {
		if (!isDemoWorkspaceSession()) {
			setState(createEmptyWorkflowState());
			return;
		}

		setState(loadWorkflowState());
	}, []);

	return [state, setState] as const;
}

export function saveWorkflowState(nextState: WorkflowState) {
	if (typeof window === 'undefined') return;
	window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextState));
}

export function updateWorkflowState(
	updater: (currentState: WorkflowState) => WorkflowState,
) {
	const nextState = updater(loadWorkflowState());
	saveWorkflowState(nextState);
	return nextState;
}

export function getWorkflowClone() {
	return loadWorkflowState();
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
