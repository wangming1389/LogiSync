export const ACCESS_TOKEN_KEY = 'access_token';
export const REFRESH_TOKEN_KEY = 'refresh_token';

export type AuthClaims = {
	role?: string;
	userRole?: string;
	workspaceType?: string;
	workspace_type?: string;
	workspace?: { type?: string };
	[key: string]: unknown;
};

function setCookie(name: string, value: string, maxAgeSeconds: number) {
	if (typeof document === 'undefined') return;
	document.cookie = `${name}=${encodeURIComponent(value)}; Path=/; Max-Age=${maxAgeSeconds}; SameSite=Lax`;
}

function clearCookie(name: string) {
	if (typeof document === 'undefined') return;
	document.cookie = `${name}=; Path=/; Max-Age=0; SameSite=Lax`;
}

export function setAuthSession(accessToken: string, refreshToken?: string) {
	if (typeof window === 'undefined') return;

	localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
	setCookie(ACCESS_TOKEN_KEY, accessToken, 60 * 60 * 24 * 7);

	if (refreshToken) {
		localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
		setCookie(REFRESH_TOKEN_KEY, refreshToken, 60 * 60 * 24 * 7);
	}
}

export function clearAuthSession() {
	if (typeof window === 'undefined') return;

	localStorage.removeItem(ACCESS_TOKEN_KEY);
	localStorage.removeItem(REFRESH_TOKEN_KEY);
	clearCookie(ACCESS_TOKEN_KEY);
	clearCookie(REFRESH_TOKEN_KEY);
}

export function getStoredAccessToken() {
	if (typeof window === 'undefined') return undefined;
	return localStorage.getItem(ACCESS_TOKEN_KEY) ?? undefined;
}

export function parseJwtClaims(token: string): AuthClaims | null {
	try {
		const payloadSegment = token.split('.')[1];
		if (!payloadSegment) return null;

		const normalized = payloadSegment.replace(/-/g, '+').replace(/_/g, '/');
		const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=');
		const binary = atob(padded);
		const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
		return JSON.parse(new TextDecoder().decode(bytes)) as AuthClaims;
	} catch {
		return null;
	}
}

export function getClaimsRole(claims: AuthClaims | null | undefined) {
	return claims?.role ?? claims?.userRole ?? undefined;
}

export function getClaimsWorkspaceType(claims: AuthClaims | null | undefined) {
	return (
		claims?.workspaceType ?? claims?.workspace_type ?? claims?.workspace?.type
	);
}

export function resolveAuthDestination(claims: AuthClaims | null | undefined) {
	const role = getClaimsRole(claims);
	const workspaceType = getClaimsWorkspaceType(claims);

	switch (role) {
		case 'platform_admin':
			return '/platform-admin';
		case 'supplier':
			return '/supplier/catalog';
		case 'carrier':
			return '/carrier/fleet';
		case 'buyer':
			return '/buyer/sourcing';
		case 'hr':
			return '/hr/management';
		case 'company_admin':
			switch (workspaceType) {
				case 'supplier':
					return '/supplier';
				case 'buyer':
					return '/buyer';
				case 'carrier':
					return '/carrier';
				default:
					return '/company-admin';
			}
		default:
			return null;
	}
}

export function isAllowedPathForClaims(
	pathname: string,
	claims: AuthClaims | null | undefined,
) {
	const role = getClaimsRole(claims);
	const workspaceType = getClaimsWorkspaceType(claims);

	if (!role) return false;

	if (role === 'company_admin') {
		if (pathname.startsWith('/company-admin')) return true;

		if (workspaceType === 'supplier') return pathname.startsWith('/supplier');
		if (workspaceType === 'buyer') return pathname.startsWith('/buyer');
		if (workspaceType === 'carrier') return pathname.startsWith('/carrier');

		return false;
	}

	const destination = resolveAuthDestination(claims);
	if (!destination) return false;

	return pathname === destination || pathname.startsWith(`${destination}/`);
}
