import { check, group, sleep } from 'k6';
import http from 'k6/http';
import { Counter, Rate } from 'k6/metrics';
import { BASE_URL } from '../config/options.js';
import { authHeaders, login, parseJson } from '../helpers/auth.js';

http.setResponseCallback(
	http.expectedStatuses({ min: 200, max: 399 }, 401, 403, 404),
);

export const options = {
	vus: 1,
	duration: '2m',
	thresholds: {
		cross_tenant_blocked: ['rate==1'],
		http_req_failed: ['rate<0.01'],
		cross_tenant_leak: ['count==0'],
	},
};

const crossTenantBlocked = new Rate('cross_tenant_blocked');
const crossTenantLeak = new Counter('cross_tenant_leak');
const unauthBlocked = new Rate('unauth_blocked');

export function setup() {
	const tokenA = login(
		__ENV.WORKSPACE_A_EMAIL || __ENV.ADMIN_EMAIL || 'admin@logisync.dev',
		__ENV.WORKSPACE_A_PASSWORD || __ENV.ADMIN_PASSWORD || 'Admin@123456',
	);
	if (!tokenA) throw new Error('Cannot login as Workspace A');

	const tokenB = login(
		__ENV.WORKSPACE_B_EMAIL || __ENV.ADMIN_EMAIL || 'admin@logisync.dev',
		__ENV.WORKSPACE_B_PASSWORD || __ENV.ADMIN_PASSWORD || 'Admin@123456',
	);
	if (!tokenB) throw new Error('Cannot login as Workspace B');

	const headersA = authHeaders(tokenA);

	const resourceIds = {
		orderIds: [],
		productIds: [],
		rfqIds: [],
		workspaceId: null,
	};

	const meRes = http.get(`${BASE_URL}/auth/me`, { headers: headersA });
	if (meRes.status === 200) {
		const me = parseJson(meRes.body);
		resourceIds.workspaceId = me?.workspaceId ?? null;
	}

	const ordersRes = http.get(`${BASE_URL}/orders?limit=5`, {
		headers: headersA,
	});
	if (ordersRes.status === 200) {
		const body = parseJson(ordersRes.body);
		const orders = (body && (body.data ?? body)) || [];
		if (Array.isArray(orders)) {
			resourceIds.orderIds = orders
				.map((o) => o.id)
				.filter(Boolean)
				.slice(0, 3);
		}
	}

	const productsRes = http.get(`${BASE_URL}/catalog/products?limit=5`, {
		headers: headersA,
	});
	if (productsRes.status === 200) {
		const body = parseJson(productsRes.body);
		const products = (body && (body.data ?? body)) || [];
		if (Array.isArray(products)) {
			resourceIds.productIds = products
				.map((p) => p.id)
				.filter(Boolean)
				.slice(0, 3);
		}
	}

	const rfqsRes = http.get(`${BASE_URL}/rfqs?limit=5`, { headers: headersA });
	if (rfqsRes.status === 200) {
		const body = parseJson(rfqsRes.body);
		const rfqs = (body && (body.data ?? body)) || [];
		if (Array.isArray(rfqs)) {
			resourceIds.rfqIds = rfqs
				.map((r) => r.id)
				.filter(Boolean)
				.slice(0, 3);
		}
	}

	console.log(`[setup] Workspace A resources collected:`);
	console.log(`  Orders:   ${resourceIds.orderIds.length} IDs`);
	console.log(`  Products: ${resourceIds.productIds.length} IDs`);
	console.log(`  RFQs:     ${resourceIds.rfqIds.length} IDs`);
	console.log(`  WS ID:    ${resourceIds.workspaceId}`);

	return { tokenA, tokenB, resourceIds };
}

export default function (data) {
	const { tokenA, tokenB, resourceIds } = data;
	const headersB = authHeaders(tokenB);
	const noHeaders = { 'Content-Type': 'application/json' };

	group('Unauthenticated: protected endpoints must return 401', () => {
		const endpoints = [
			`${BASE_URL}/auth/me`,
			`${BASE_URL}/orders`,
			`${BASE_URL}/catalog/products`,
			`${BASE_URL}/rfqs`,
		];

		for (const url of endpoints) {
			const res = http.get(url, { headers: noHeaders });
			const blocked = res.status === 401 || res.status === 403;
			unauthBlocked.add(blocked ? 1 : 0);

			if (!blocked) {
				crossTenantLeak.add(1);
				console.error(
					`[SECURITY FAIL] Unauthenticated access allowed: GET ${url} -> ${res.status}`,
				);
			}

			check(res, {
				[`unauth: ${url} returns 401/403`]: (r) =>
					r.status === 401 || r.status === 403,
			});

			sleep(0.1);
		}
	});

	sleep(0.5);

	group('Invalid JWT: must return 401', () => {
		const fakeHeaders = {
			'Content-Type': 'application/json',
			Authorization:
				'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmYWtlLXVzZXIifQ.FAKESIGNATURE',
		};

		const res = http.get(`${BASE_URL}/auth/me`, { headers: fakeHeaders });
		const blocked = res.status === 401;
		unauthBlocked.add(blocked ? 1 : 0);

		if (!blocked) {
			crossTenantLeak.add(1);
			console.error(
				`[SECURITY FAIL] Fake JWT accepted: GET /auth/me -> ${res.status}`,
			);
		}

		check(res, {
			'fake JWT: /auth/me returns 401': (r) => r.status === 401,
		});
	});

	sleep(0.5);

	group('Cross-Tenant: Workspace B accessing Workspace A Orders', () => {
		for (const orderId of resourceIds.orderIds) {
			const res = http.get(`${BASE_URL}/orders/${orderId}`, {
				headers: headersB,
			});

			const blocked = res.status === 403 || res.status === 404;
			crossTenantBlocked.add(blocked ? 1 : 0);

			if (res.status === 200) {
				crossTenantLeak.add(1);
				console.error(
					`[SECURITY FAIL] Cross-tenant order leak! ` +
						`Workspace B accessed order ${orderId} of Workspace A -> status 200`,
				);
			}

			check(res, {
				[`cross-tenant: order ${orderId} blocked for WS-B`]: (r) =>
					r.status === 403 || r.status === 404,
			});

			sleep(0.2);
		}

		if (resourceIds.orderIds.length === 0) {
			const fakeId = '00000000-0000-0000-0000-000000000001';
			const res = http.get(`${BASE_URL}/orders/${fakeId}`, {
				headers: headersB,
			});
			check(res, {
				'cross-tenant: fake order ID returns 404 or 403': (r) =>
					r.status === 404 || r.status === 403,
			});
		}
	});

	sleep(0.5);

	group('Cross-Tenant: Workspace B accessing Workspace A Products', () => {
		for (const productId of resourceIds.productIds) {
			const res = http.get(`${BASE_URL}/catalog/products/${productId}`, {
				headers: headersB,
			});
			const blocked = res.status === 403 || res.status === 404;
			crossTenantBlocked.add(blocked ? 1 : 0);

			if (res.status === 200) {
				crossTenantLeak.add(1);
				console.error(
					`[SECURITY FAIL] Cross-tenant product leak! ` +
						`Workspace B accessed product ${productId} -> status 200`,
				);
			}

			check(res, {
				[`cross-tenant: product ${productId} blocked for WS-B`]: (r) =>
					r.status === 403 || r.status === 404,
			});

			sleep(0.2);
		}

		if (resourceIds.productIds.length === 0) {
			const fakeId = '00000000-0000-0000-0000-000000000002';
			const res = http.get(`${BASE_URL}/catalog/products/${fakeId}`, {
				headers: headersB,
			});
			check(res, {
				'cross-tenant: fake product ID returns 404 or 403': (r) =>
					r.status === 404 || r.status === 403,
			});
		}
	});

	sleep(0.5);

	group('Cross-Tenant: Workspace B accessing Workspace A RFQs', () => {
		for (const rfqId of resourceIds.rfqIds) {
			const res = http.get(`${BASE_URL}/rfqs/${rfqId}`, { headers: headersB });
			const blocked = res.status === 403 || res.status === 404;
			crossTenantBlocked.add(blocked ? 1 : 0);

			if (res.status === 200) {
				crossTenantLeak.add(1);
				console.error(
					`[SECURITY FAIL] Cross-tenant RFQ leak! ` +
						`Workspace B accessed RFQ ${rfqId} -> status 200`,
				);
			}

			check(res, {
				[`cross-tenant: RFQ ${rfqId} blocked for WS-B`]: (r) =>
					r.status === 403 || r.status === 404,
			});

			sleep(0.2);
		}

		if (resourceIds.rfqIds.length === 0) {
			const fakeId = '00000000-0000-0000-0000-000000000003';
			const res = http.get(`${BASE_URL}/rfqs/${fakeId}`, { headers: headersB });
			check(res, {
				'cross-tenant: fake RFQ ID returns 404 or 403': (r) =>
					r.status === 404 || r.status === 403,
			});
		}
	});

	sleep(0.5);

	group('Cross-Tenant: Non-platform-admin accessing workspace details', () => {
		if (resourceIds.workspaceId) {
			const res = http.get(
				`${BASE_URL}/workspaces/${resourceIds.workspaceId}`,
				{
					headers: headersB,
				},
			);

			const blocked = res.status === 403 || res.status === 404;
			crossTenantBlocked.add(blocked ? 1 : 0);

			if (res.status === 200) {
				crossTenantLeak.add(1);
				console.error(
					`[SECURITY FAIL] Non-platform-admin accessed workspace detail -> status 200`,
				);
			}

			check(res, {
				'cross-tenant: workspace detail blocked for non-admin': (r) =>
					r.status === 403 || r.status === 404,
			});
		} else {
			const fakeWsId = '00000000-0000-0000-0000-000000000004';
			const res = http.get(`${BASE_URL}/workspaces/${fakeWsId}`, {
				headers: headersB,
			});
			check(res, {
				'cross-tenant: fake workspace ID blocked': (r) =>
					r.status === 403 || r.status === 404,
			});
		}
	});

	sleep(1);
}

export function teardown() {
	console.log('\n=== CROSS-TENANT SECURITY TEST SUMMARY ===');
	console.log('Expected metrics:');
	console.log('  cross_tenant_blocked rate: must be 1.0 (100%)');
	console.log('  cross_tenant_leak count:   must be 0');
	console.log('  unauth_blocked rate:       must be 1.0 (100%)');
	console.log(
		'\nIf cross_tenant_leak > 0, the system has a critical security issue.',
	);
}
