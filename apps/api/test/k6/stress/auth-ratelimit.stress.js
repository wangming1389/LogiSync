import { check, sleep } from 'k6';
import http from 'k6/http';
import { Counter, Rate } from 'k6/metrics';
import { BASE_URL, stressOptions } from '../config/options.js';

export const options = {
	...stressOptions,
	thresholds: {
		http_req_duration: ['p(99)<3000'],
		rate_limit_triggered: ['rate>0'],
	},
};

const rateLimitTriggered = new Rate('rate_limit_triggered');
const loginSuccess = new Counter('login_success');
const loginRateLimited = new Counter('login_rate_limited');

export default function () {
	const res = http.post(
		`${BASE_URL}/auth/login`,
		JSON.stringify({
			email: `testuser_${__VU}@example.com`,
			password: 'WrongPassword123',
		}),
		{ headers: { 'Content-Type': 'application/json' } },
	);

	if (res.status === 429) {
		rateLimitTriggered.add(1);
		loginRateLimited.add(1);
		check(res, {
			'rate limit: status 429': (r) => r.status === 429,
		});
	} else if (res.status === 401) {
		check(res, {
			'auth: wrong password returns 401': (r) => r.status === 401,
		});
	} else if (res.status === 200) {
		loginSuccess.add(1);
		rateLimitTriggered.add(0);
	} else {
		rateLimitTriggered.add(0);
	}

	sleep(0.1);
}
