import { getStoredAccessToken, parseJwtClaims } from '@/lib/auth';

const DEMO_WORKSPACE_SLUGS = new Set([
	'platform-admin',
	'demo-supplier',
	'demo-buyer',
	'demo-carrier',
	'demo-hr',
]);

export function getCurrentWorkspaceSlug() {
	if (typeof window === 'undefined') return undefined;
	const token = getStoredAccessToken();
	if (!token) return undefined;
	const claims = parseJwtClaims(token);
	return typeof claims?.workspaceSlug === 'string'
		? claims.workspaceSlug
		: undefined;
}

export function isDemoWorkspaceSlug(slug?: string) {
	if (!slug) return false;
	return DEMO_WORKSPACE_SLUGS.has(slug);
}

export function isDemoWorkspaceSession() {
	return isDemoWorkspaceSlug(getCurrentWorkspaceSlug());
}
