import { makeCounterProvider } from '@willsoto/nestjs-prometheus';

export const METRIC_LOGIN_FAILED = 'logisync_login_failed_total';
export const METRIC_RFQ_CREATED = 'logisync_rfq_created_total';
export const METRIC_ORDER_APPROVED = 'logisync_order_approved_total';
export const METRIC_ORDER_REJECTED = 'logisync_order_rejected_total';

export const loginFailedProvider = makeCounterProvider({
	name: METRIC_LOGIN_FAILED,
	help: 'Total failed login attempts (wrong password or account locked)',
	labelNames: ['reason'],
});

export const rfqCreatedProvider = makeCounterProvider({
	name: METRIC_RFQ_CREATED,
	help: 'Total RFQ drafts created',
});

export const orderApprovedProvider = makeCounterProvider({
	name: METRIC_ORDER_APPROVED,
	help: 'Total purchase orders approved by suppliers',
});

export const orderRejectedProvider = makeCounterProvider({
	name: METRIC_ORDER_REJECTED,
	help: 'Total purchase orders rejected by suppliers',
});
