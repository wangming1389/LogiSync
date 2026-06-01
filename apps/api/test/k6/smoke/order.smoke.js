import { check, sleep } from 'k6';
import http from 'k6/http';
import { BASE_URL, smokeOptions } from '../config/options.js';
import {
	authHeaders,
	login,
	parseJson,
	responseData,
} from '../helpers/auth.js';

export const options = smokeOptions;

export function setup() {
	const token = login();
	if (!token) throw new Error('Cannot login - check credentials / server');
	return { token };
}

export default function (data) {
	const headers = authHeaders(data.token);

	{
		const res = http.get(`${BASE_URL}/orders?limit=5&offset=0`, { headers });
		check(res, {
			'GET /orders: status 200': (r) => r.status === 200,
			'GET /orders: body is obj': (r) => {
				const b = parseJson(r.body);
				return b !== null && typeof b === 'object';
			},
		});

		if (res.status === 200) {
			const body = parseJson(res.body);
			const orders = (body && (body.data ?? body)) || [];
			if (Array.isArray(orders) && orders.length > 0) {
				const orderId = orders[0].id;

				sleep(0.3);

				const detailRes = http.get(`${BASE_URL}/orders/${orderId}`, {
					headers,
				});
				check(detailRes, {
					'GET /orders/:id: status 200': (r) => r.status === 200,
					'GET /orders/:id: has id': (r) => {
						const d = parseJson(r.body);
						return d?.id === orderId || responseData(d)?.id === orderId;
					},
				});
			}
		}
	}

	sleep(0.5);

	{
		const res = http.get(`${BASE_URL}/orders?status=pending&limit=5`, {
			headers,
		});
		check(res, {
			'GET /orders?status=pending: not 500': (r) => r.status !== 500,
		});
	}

	sleep(1);
}
