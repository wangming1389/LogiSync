import { check, group, sleep } from 'k6';
import http from 'k6/http';
import { Counter, Trend } from 'k6/metrics';
import { BASE_URL, soakOptions } from '../config/options.js';
import {
	authHeaders,
	login,
	parseJson,
	responseData,
} from '../helpers/auth.js';

http.setResponseCallback(http.expectedStatuses({ min: 200, max: 399 }, 403));

export const options = soakOptions;

const authDuration = new Trend('soak_auth_duration');
const ordersDuration = new Trend('soak_orders_duration');
const catalogDuration = new Trend('soak_catalog_duration');
const rfqDuration = new Trend('soak_rfq_duration');
const soakErrors = new Counter('soak_errors');

export function setup() {
	const token = login();
	if (!token) throw new Error('Cannot login - check credentials / server');
	console.log('Soak test started - running for 30 minutes...');
	return { token };
}

export default function (data) {
	const headers = authHeaders(data.token);

	group('Auth: /auth/me', () => {
		const res = http.get(`${BASE_URL}/auth/me`, { headers });
		authDuration.add(res.timings.duration);

		const ok = check(res, {
			'[soak] GET /auth/me: status 200': (r) => r.status === 200,
		});
		if (!ok) soakErrors.add(1, { endpoint: '/auth/me' });
	});

	sleep(0.5);

	group('Orders: /orders', () => {
		const res = http.get(`${BASE_URL}/orders?limit=10&offset=0`, { headers });
		ordersDuration.add(res.timings.duration);

		const ok = check(res, {
			'[soak] GET /orders: status 200': (r) => r.status === 200,
			'[soak] GET /orders: body valid': (r) => {
				const b = parseJson(r.body);
				return b !== null && typeof b === 'object';
			},
		});
		if (!ok) soakErrors.add(1, { endpoint: '/orders' });

		if (res.status === 200) {
			const body = parseJson(res.body);
			const orders = (body && (body.data ?? body)) || [];
			if (Array.isArray(orders) && orders.length > 0) {
				const orderId = orders[__VU % orders.length]?.id;
				if (orderId) {
					sleep(0.2);
					const detailRes = http.get(`${BASE_URL}/orders/${orderId}`, {
						headers,
					});
					ordersDuration.add(detailRes.timings.duration);
					check(detailRes, {
						'[soak] GET /orders/:id: status 200': (r) => r.status === 200,
					});
				}
			}
		}
	});

	sleep(0.5);

	group('Catalog: /catalog/products', () => {
		const res = http.get(`${BASE_URL}/catalog/products?limit=10`, { headers });
		catalogDuration.add(res.timings.duration);

		const ok = check(res, {
			'[soak] GET /catalog/products: not 500': (r) => r.status !== 500,
		});
		if (!ok) soakErrors.add(1, { endpoint: '/catalog/products' });
	});

	sleep(0.5);

	group('Sourcing: /rfqs', () => {
		const res = http.get(`${BASE_URL}/rfqs?limit=10`, { headers });
		rfqDuration.add(res.timings.duration);

		check(res, {
			'[soak] GET /rfqs: not 500': (r) => r.status !== 500,
			'[soak] GET /rfqs: 200 or 403': (r) =>
				r.status === 200 || r.status === 403,
		});
	});

	sleep(0.5);

	group('Health: /health', () => {
		const res = http.get(`${BASE_URL}/health`);
		check(res, {
			'[soak] GET /health: status 200': (r) => r.status === 200,
		});
	});

	sleep(1);
}

export function teardown() {
	console.log('Soak test completed.');
	console.log('Check Grafana/Prometheus for:');
	console.log('  - soak_auth_duration trend (should be flat, not increasing)');
	console.log('  - soak_orders_duration trend');
	console.log('  - soak_catalog_duration trend');
	console.log('  - soak_rfq_duration trend');
	console.log('  - soak_errors counter (should be 0 or near 0)');
}
