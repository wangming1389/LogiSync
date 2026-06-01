import { check, group, sleep } from 'k6';
import http from 'k6/http';
import { Counter, Rate, Trend } from 'k6/metrics';
import { BASE_URL, loadOptions } from '../config/options.js';
import { authHeaders, login, parseJson } from '../helpers/auth.js';

export const options = loadOptions;

const productListDuration = new Trend('catalog_product_list_duration');
const productDetailDuration = new Trend('catalog_product_detail_duration');
const catalogErrors = new Counter('catalog_errors');
const skuCheckRate = new Rate('catalog_sku_check_success');

const FILTERS = [
	'',
	'?status=active',
	'?status=draft',
	'?sortBy=name&order=asc',
	'?sortBy=price&order=desc',
	'?keyword=test',
];

export function setup() {
	const token = login();
	if (!token) throw new Error('Cannot login - check credentials / server');

	const headers = authHeaders(token);
	const res = http.get(`${BASE_URL}/catalog/products?limit=20&offset=0`, {
		headers,
	});
	let productIds = [];
	if (res.status === 200) {
		const body = parseJson(res.body);
		const products = (body && (body.data ?? body)) || [];
		if (Array.isArray(products)) {
			productIds = products
				.map((p) => p.id)
				.filter(Boolean)
				.slice(0, 10);
		}
	}

	return { token, productIds };
}

export default function (data) {
	const headers = authHeaders(data.token);

	const filter = FILTERS[Math.floor(Math.random() * FILTERS.length)];
	const listQuery = filter ? `${filter}&limit=20` : '?limit=20';

	group('Product List', () => {
		const res = http.get(`${BASE_URL}/catalog/products${listQuery}`, {
			headers,
		});
		productListDuration.add(res.timings.duration);

		const ok = check(res, {
			'GET /catalog/products: status 200': (r) => r.status === 200,
		});
		if (!ok) catalogErrors.add(1);
	});

	sleep(0.3);

	if (data.productIds && data.productIds.length > 0) {
		group('Product Detail', () => {
			const idx = __ITER % data.productIds.length;
			const productId = data.productIds[idx];

			const res = http.get(`${BASE_URL}/catalog/products/${productId}`, {
				headers,
			});
			productDetailDuration.add(res.timings.duration);

			check(res, {
				'GET /catalog/products/:id: status 200': (r) => r.status === 200,
			});
		});

		sleep(0.2);

		group('Product Price History', () => {
			const idx = (__ITER + 1) % data.productIds.length;
			const productId = data.productIds[idx];

			const res = http.get(
				`${BASE_URL}/catalog/products/${productId}/price-history`,
				{ headers },
			);
			check(res, {
				'GET /catalog/products/:id/price-history: not 500': (r) =>
					r.status !== 500,
			});
		});
	}

	sleep(0.3);

	group('SKU Availability Check', () => {
		const sku = `SKU-LOAD-${__VU}-${__ITER}`;
		const res = http.get(`${BASE_URL}/catalog/products/check-sku?sku=${sku}`, {
			headers,
		});
		skuCheckRate.add(res.status === 200);

		check(res, {
			'GET /catalog/products/check-sku: not 500': (r) => r.status !== 500,
		});
	});

	sleep(1);
}

export function teardown() {
	console.log('Catalog load test finished.');
}
