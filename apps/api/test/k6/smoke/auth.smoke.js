import { check, sleep } from 'k6';
import http from 'k6/http';
import { BASE_URL, smokeOptions } from '../config/options.js';
import {
	accessTokenFrom,
	authHeaders,
	parseJson,
	responseData,
} from '../helpers/auth.js';

export const options = smokeOptions;

let currentToken;

export function setup() {
	const res = http.post(
		`${BASE_URL}/auth/login`,
		JSON.stringify({
			email: __ENV.ADMIN_EMAIL || 'admin@logisync.dev',
			password: __ENV.ADMIN_PASSWORD || 'Admin@123456',
		}),
		{ headers: { 'Content-Type': 'application/json' } },
	);

	check(res, {
		'setup/login: status 200': (r) => r.status === 200,
	});

	const token = accessTokenFrom(parseJson(res.body));
	if (!token) {
		throw new Error(`Cannot read accessToken from login response: ${res.body}`);
	}
	return { token };
}

export default function (data) {
	currentToken = currentToken || data.token;
	let headers = authHeaders(currentToken);

	{
		const res = http.get(`${BASE_URL}/auth/me`, { headers });
		check(res, {
			'GET /auth/me: status 200': (r) => r.status === 200,
			'GET /auth/me: has email field': (r) => {
				return responseData(parseJson(r.body))?.email !== undefined;
			},
		});
	}

	sleep(0.5);

	{
		const res = http.post(`${BASE_URL}/auth/refresh`, null, { headers });
		check(res, {
			'POST /auth/refresh: status 200': (r) => r.status === 200,
			'POST /auth/refresh: new token issued': (r) => {
				return accessTokenFrom(parseJson(r.body)) !== undefined;
			},
		});
		if (res.status === 200) {
			const newToken = accessTokenFrom(parseJson(res.body));
			if (newToken) {
				currentToken = newToken;
				headers = authHeaders(currentToken);
			}
		}
	}

	sleep(0.5);

	{
		const res = http.get(`${BASE_URL}/auth/me`, { headers });
		check(res, {
			'GET /auth/me (after refresh): status 200': (r) => r.status === 200,
		});
	}

	sleep(1);
}
