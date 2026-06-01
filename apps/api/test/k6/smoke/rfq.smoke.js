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
		const res = http.get(`${BASE_URL}/rfqs?limit=5&offset=0`, { headers });
		check(res, {
			'GET /rfqs: status 200 or 403': (r) =>
				r.status === 200 || r.status === 403,
			'GET /rfqs: not 500': (r) => r.status !== 500,
		});

		if (res.status === 200) {
			const body = parseJson(res.body);
			const rfqs = (body && (body.data ?? body)) || [];
			if (Array.isArray(rfqs) && rfqs.length > 0) {
				const rfqId = rfqs[0].id;

				sleep(0.3);

				const detailRes = http.get(`${BASE_URL}/rfqs/${rfqId}`, { headers });
				check(detailRes, {
					'GET /rfqs/:id: status 200': (r) => r.status === 200,
					'GET /rfqs/:id: has id': (r) => {
						const d = parseJson(r.body);
						return d?.id === rfqId || responseData(d)?.id === rfqId;
					},
				});

				sleep(0.3);

				const quoteRes = http.get(`${BASE_URL}/rfqs/${rfqId}/quotations`, {
					headers,
				});
				check(quoteRes, {
					'GET /rfqs/:id/quotations: not 500': (r) => r.status !== 500,
					'GET /rfqs/:id/quotations: 200 or 403 or 404': (r) =>
						[200, 403, 404].includes(r.status),
				});
			}
		}
	}

	sleep(0.5);

	{
		const res = http.get(`${BASE_URL}/rfqs?status=draft&limit=5`, { headers });
		check(res, {
			'GET /rfqs?status=draft: not 500': (r) => r.status !== 500,
		});
	}

	sleep(1);
}
