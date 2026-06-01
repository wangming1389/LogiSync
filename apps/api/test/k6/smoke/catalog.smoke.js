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
		const res = http.get(`${BASE_URL}/catalog/products?limit=5&offset=0`, {
			headers,
		});
		check(res, {
			'GET /catalog/products: status 200': (r) => r.status === 200,
			'GET /catalog/products: body is obj': (r) => parseJson(r.body) !== null,
		});

		if (res.status === 200) {
			const body = parseJson(res.body);
			const products = (body && (body.data ?? body)) || [];
			if (Array.isArray(products) && products.length > 0) {
				const productId = products[0].id;

				sleep(0.3);

				const detailRes = http.get(
					`${BASE_URL}/catalog/products/${productId}`,
					{ headers },
				);
				check(detailRes, {
					'GET /catalog/products/:id: status 200': (r) => r.status === 200,
					'GET /catalog/products/:id: has id': (r) => {
						const d = parseJson(r.body);
						return d?.id === productId || responseData(d)?.id === productId;
					},
				});

				sleep(0.3);

				const histRes = http.get(
					`${BASE_URL}/catalog/products/${productId}/price-history`,
					{ headers },
				);
				check(histRes, {
					'GET /catalog/products/:id/price-history: not 500': (r) =>
						r.status !== 500,
					'GET /catalog/products/:id/price-history: 200 or 404': (r) =>
						r.status === 200 || r.status === 404,
				});
			}
		}
	}

	sleep(0.5);

	{
		const res = http.get(
			`${BASE_URL}/catalog/products/check-sku?sku=TEST-SKU-${__VU}`,
			{ headers },
		);
		check(res, {
			'GET /catalog/products/check-sku: not 500': (r) => r.status !== 500,
		});
	}

	sleep(0.5);

	{
		const res = http.get(
			`${BASE_URL}/catalog/products?status=active&sortBy=name&order=asc&limit=10`,
			{ headers },
		);
		check(res, {
			'GET /catalog/products?status=active: not 500': (r) => r.status !== 500,
		});
	}

	sleep(1);
}
