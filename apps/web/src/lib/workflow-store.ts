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

type BuyerRfq = (typeof buyerRFQList)[number] & {
	items?: { product: string; qty: number; unit: string; productId?: string }[];
	note?: string;
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

function createDefaultState(): WorkflowState {
	return {
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
		return createDefaultState();
	}

	try {
		const raw = window.localStorage.getItem(STORAGE_KEY);
		if (!raw) return createDefaultState();
		const parsed = JSON.parse(raw) as Partial<WorkflowState>;
		return {
			...createDefaultState(),
			...parsed,
		};
	} catch {
		return createDefaultState();
	}
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
