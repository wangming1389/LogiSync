export const BASE_URL = __ENV.BASE_URL || 'http://localhost:9751';

export const defaultThresholds = {
	http_req_duration: ['p(95)<500', 'p(99)<1000'],
	http_req_failed: ['rate<0.01'],
	checks: ['rate>0.99'],
};

export const strictThresholds = {
	http_req_duration: ['p(95)<300', 'p(99)<600'],
	http_req_failed: ['rate<0.005'],
	checks: ['rate>0.995'],
};

export const smokeOptions = {
	vus: 1,
	duration: '30s',
	thresholds: defaultThresholds,
};

export const loadOptions = {
	stages: [
		{ duration: '1m', target: 10 },
		{ duration: '3m', target: 50 },
		{ duration: '1m', target: 100 },
		{ duration: '2m', target: 50 },
		{ duration: '1m', target: 0 },
	],
	thresholds: defaultThresholds,
};

export const stressOptions = {
	stages: [
		{ duration: '2m', target: 50 },
		{ duration: '3m', target: 100 },
		{ duration: '3m', target: 150 },
		{ duration: '3m', target: 200 },
		{ duration: '2m', target: 0 },
	],
	thresholds: {
		http_req_duration: ['p(99)<2000'],
		http_req_failed: ['rate<0.05'],
	},
};

export const spikeOptions = {
	stages: [
		{ duration: '10s', target: 10 },
		{ duration: '30s', target: 500 },
		{ duration: '1m', target: 10 },
		{ duration: '10s', target: 0 },
	],
	thresholds: {
		http_req_duration: ['p(99)<3000'],
		http_req_failed: ['rate<0.10'],
	},
};

export const soakOptions = {
	stages: [
		{ duration: '2m', target: 50 },
		{ duration: '26m', target: 50 },
		{ duration: '2m', target: 0 },
	],
	thresholds: defaultThresholds,
};
