import { check } from 'k6';
import http from 'k6/http';
import { BASE_URL } from '../config/options.js';

const ADMIN_EMAIL = __ENV.ADMIN_EMAIL || 'admin@logisync.dev';
const ADMIN_PASSWORD = __ENV.ADMIN_PASSWORD || 'Admin@123456';

export function parseJson(body) {
	try {
		return JSON.parse(body);
	} catch {
		return null;
	}
}

export function responseData(body) {
	return body?.data ?? body;
}

export function accessTokenFrom(body) {
	const data = responseData(body);
	return data?.accessToken;
}

export function login(email = ADMIN_EMAIL, password = ADMIN_PASSWORD) {
	const res = http.post(
		`${BASE_URL}/auth/login`,
		JSON.stringify({ email, password }),
		{ headers: { 'Content-Type': 'application/json' } },
	);

	const ok = check(res, {
		'login: status 200': (r) => r.status === 200,
		'login: has accessToken': (r) => {
			return accessTokenFrom(parseJson(r.body)) !== undefined;
		},
	});

	if (!ok) {
		console.error(`[login] FAILED - status=${res.status} body=${res.body}`);
		return null;
	}

	return accessTokenFrom(parseJson(res.body));
}

export function authHeaders(token) {
	return {
		'Content-Type': 'application/json',
		Authorization: `Bearer ${token}`,
	};
}

export function checkOk(res, tag = '') {
	return check(res, {
		[`${tag}: status 2xx`]: (r) => r.status >= 200 && r.status < 300,
	});
}

export function checkUnauthorized(res, tag = '') {
	return check(res, {
		[`${tag}: status 401`]: (r) => r.status === 401,
	});
}
