import { check, group, sleep } from 'k6';
import http from 'k6/http';
import { Counter, Trend } from 'k6/metrics';
import { BASE_URL, loadOptions } from '../config/options.js';
import { authHeaders, login, parseJson } from '../helpers/auth.js';

export const options = loadOptions;

const rfqListDuration = new Trend('rfq_list_duration');
const rfqDetailDuration = new Trend('rfq_detail_duration');
const rfqErrors = new Counter('rfq_errors');

const STATUS_FILTERS = [
	'',
	'?status=draft',
	'?status=submitted',
	'?status=closed',
];

export function setup() {
	const token = login();
	if (!token) throw new Error('Cannot login - check credentials / server');

	const headers = authHeaders(token);
	const res = http.get(`${BASE_URL}/rfqs?limit=20&offset=0`, { headers });
	let rfqIds = [];
	if (res.status === 200) {
		const body = parseJson(res.body);
		const rfqs = (body && (body.data ?? body)) || [];
		if (Array.isArray(rfqs)) {
			rfqIds = rfqs
				.map((r) => r.id)
				.filter(Boolean)
				.slice(0, 10);
		}
	}

	return { token, rfqIds };
}

export default function (data) {
	const headers = authHeaders(data.token);
	const filter = STATUS_FILTERS[__ITER % STATUS_FILTERS.length];

	group('RFQ List', () => {
		const listQuery = filter ? `${filter}&limit=20` : '?limit=20';
		const res = http.get(`${BASE_URL}/rfqs${listQuery}`, { headers });
		rfqListDuration.add(res.timings.duration);

		const ok = check(res, {
			'GET /rfqs: status 200 or 403': (r) =>
				r.status === 200 || r.status === 403,
			'GET /rfqs: not 500': (r) => r.status !== 500,
		});
		if (!ok) rfqErrors.add(1);
	});

	sleep(0.3);

	if (data.rfqIds && data.rfqIds.length > 0) {
		group('RFQ Detail', () => {
			const idx = __ITER % data.rfqIds.length;
			const rfqId = data.rfqIds[idx];

			const res = http.get(`${BASE_URL}/rfqs/${rfqId}`, { headers });
			rfqDetailDuration.add(res.timings.duration);

			check(res, {
				'GET /rfqs/:id: 200 or 403 or 404': (r) =>
					[200, 403, 404].includes(r.status),
				'GET /rfqs/:id: not 500': (r) => r.status !== 500,
			});
		});

		sleep(0.3);

		group('RFQ Quotations List', () => {
			const idx = (__ITER + 1) % data.rfqIds.length;
			const rfqId = data.rfqIds[idx];

			const res = http.get(`${BASE_URL}/rfqs/${rfqId}/quotations`, { headers });
			check(res, {
				'GET /rfqs/:id/quotations: not 500': (r) => r.status !== 500,
			});
		});
	}

	sleep(1);
}

export function teardown() {
	console.log('RFQ load test finished.');
}
