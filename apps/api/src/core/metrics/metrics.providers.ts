import {
	makeCounterProvider,
	makeHistogramProvider,
} from '@willsoto/nestjs-prometheus';

/* Labels:
 *  - method:      HTTP method (GET, POST, PUT, DELETE, PATCH)
 *  - route:       Route template (e.g. /catalog/products/:id) — NOT the raw URL
 *  - status_code: HTTP status code as string
 *  - module:      Business module derived from the route prefix
 */

export const METRIC_HTTP_REQUESTS_TOTAL = 'http_requests_total';
export const METRIC_HTTP_REQUEST_DURATION = 'http_request_duration_seconds';

const HTTP_METRIC_LABELS = [
	'method',
	'route',
	'status_code',
	'module',
] as const;

export const httpRequestsTotalProvider = makeCounterProvider({
	name: METRIC_HTTP_REQUESTS_TOTAL,
	help: 'Total number of HTTP requests',
	labelNames: [...HTTP_METRIC_LABELS],
});

export const httpRequestDurationProvider = makeHistogramProvider({
	name: METRIC_HTTP_REQUEST_DURATION,
	help: 'HTTP request duration in seconds',
	labelNames: [...HTTP_METRIC_LABELS],
	buckets: [0.01, 0.05, 0.1, 0.3, 0.5, 1, 2, 5],
});
