import { check, group, sleep } from 'k6';
import http from 'k6/http';
import { Counter, Trend } from 'k6/metrics';
import { BASE_URL, loadOptions } from '../config/options.js';
import { authHeaders, checkOk, login } from '../helpers/auth.js';

export const options = loadOptions;

const orderListDuration = new Trend('order_list_duration');
const orderDetailDuration = new Trend('order_detail_duration');
const orderErrors = new Counter('order_errors');

export function setup() {
	const token = login();
	if (!token) throw new Error('Cannot login - check credentials / server');
	return { token };
}

export default function (data) {
	const headers = authHeaders(data.token);

	group('Order List', () => {
		const params = '?limit=20&offset=0';
		const res = http.get(`${BASE_URL}/orders${params}`, { headers });
		orderListDuration.add(res.timings.duration);

		const ok = check(res, {
			'GET /orders: status 200': (r) => r.status === 200,
			'GET /orders: has data': (r) => {
				try {
					const body = JSON.parse(r.body);
					return Array.isArray(body.data) || Array.isArray(body);
				} catch {
					return false;
				}
			},
		});
		if (!ok) orderErrors.add(1);
	});

	sleep(0.3);

	group('Order List - with status filter', () => {
		const res = http.get(`${BASE_URL}/orders?status=pending&limit=10`, {
			headers,
		});
		orderListDuration.add(res.timings.duration);

		check(res, {
			'GET /orders?status=pending: 200 or 404': (r) =>
				r.status === 200 || r.status === 404,
		});
	});

	sleep(0.5);

	group('Order Detail', () => {
		const orderId = __ENV.SAMPLE_ORDER_ID;
		if (!orderId) {
			return;
		}

		const res = http.get(`${BASE_URL}/orders/${orderId}`, { headers });
		orderDetailDuration.add(res.timings.duration);

		check(res, {
			'GET /orders/:id: status 200': (r) => r.status === 200,
			'GET /orders/:id: has id': (r) => {
				try {
					return JSON.parse(r.body).id === orderId;
				} catch {
					return false;
				}
			},
		});
	});

	sleep(1);
}

export function teardown(data) {
	console.log('Order load test finished.');
}
