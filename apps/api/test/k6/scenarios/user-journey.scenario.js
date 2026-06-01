import { check, group, sleep } from 'k6';
import http from 'k6/http';
import { BASE_URL } from '../config/options.js';
import { authHeaders, login } from '../helpers/auth.js';

export const options = {
	scenarios: {
		buyer_flow: {
			executor: 'ramping-vus',
			startVUs: 0,
			stages: [
				{ duration: '1m', target: 20 },
				{ duration: '3m', target: 20 },
				{ duration: '1m', target: 0 },
			],
			gracefulRampDown: '30s',
			exec: 'buyerFlow',
		},
		supplier_flow: {
			executor: 'ramping-vus',
			startVUs: 0,
			stages: [
				{ duration: '1m', target: 10 },
				{ duration: '3m', target: 10 },
				{ duration: '1m', target: 0 },
			],
			gracefulRampDown: '30s',
			exec: 'supplierFlow',
		},
		api_constant_load: {
			executor: 'constant-arrival-rate',
			rate: 10,
			timeUnit: '1s',
			duration: '5m',
			preAllocatedVUs: 20,
			maxVUs: 50,
			exec: 'healthCheck',
		},
	},
	thresholds: {
		'http_req_duration{scenario:buyer_flow}': ['p(95)<500'],
		'http_req_duration{scenario:supplier_flow}': ['p(95)<500'],
		'http_req_duration{scenario:api_constant_load}': ['p(99)<200'],
		http_req_failed: ['rate<0.01'],
	},
};

export function setup() {
	const buyerToken = login(
		__ENV.BUYER_EMAIL || 'admin@logisync.dev',
		__ENV.BUYER_PASSWORD || 'Admin@123456',
	);
	const supplierToken = login(
		__ENV.SUPPLIER_EMAIL || 'admin@logisync.dev',
		__ENV.SUPPLIER_PASSWORD || 'Admin@123456',
	);
	return { buyerToken, supplierToken };
}

export function buyerFlow(data) {
	const headers = authHeaders(data.buyerToken);

	group('Buyer: View Orders', () => {
		const res = http.get(`${BASE_URL}/orders?limit=10&offset=0`, { headers });
		check(res, {
			'buyer/orders: status 200': (r) => r.status === 200,
		});

		if (res.status === 200) {
			try {
				const body = JSON.parse(res.body);
				const orders = body.data || body;
				if (Array.isArray(orders) && orders.length > 0) {
					const orderId = orders[0].id;
					const detailRes = http.get(`${BASE_URL}/orders/${orderId}`, {
						headers,
					});
					check(detailRes, {
						'buyer/order detail: status 200': (r) => r.status === 200,
					});
				}
			} catch (_) {}
		}
	});

	sleep(2);

	group('Buyer: View Profile', () => {
		const res = http.get(`${BASE_URL}/auth/me`, { headers });
		check(res, {
			'buyer/me: status 200': (r) => r.status === 200,
		});
	});

	sleep(1);
}

export function supplierFlow(data) {
	const headers = authHeaders(data.supplierToken);

	group('Supplier: View Pending Orders', () => {
		const res = http.get(`${BASE_URL}/orders?status=pending_approval&limit=5`, {
			headers,
		});
		check(res, {
			'supplier/pending orders: 200 or 403': (r) =>
				r.status === 200 || r.status === 403,
		});
	});

	sleep(3);
}

export function healthCheck() {
	const res = http.get(`${BASE_URL}/health`);
	check(res, {
		'health: status 200': (r) => r.status === 200,
	});
}
