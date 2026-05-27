import Cookies from 'js-cookie';

export const ACCESS_TOKEN_KEY = 'access_token';
export const REFRESH_TOKEN_KEY = 'refresh_token';

// Auth tokens are stored exclusively in browser cookies.
// They cannot be HttpOnly because the SPA reads them client-side
// to attach an Authorization header. We still rely on `Secure` (in
// production) and `SameSite=Lax` to mitigate CSRF and downgrade attacks.
const SEVEN_DAYS = 7;
const BASE_COOKIE_OPTIONS: Cookies.CookieAttributes = {
	path: '/',
	sameSite: 'lax',
	secure:
		typeof window !== 'undefined' && window.location.protocol === 'https:',
};

export type AuthClaims = {
	role?: string;
	userRole?: string;
	workspaceTypes?: string[];
	workspaceType?: string;
	workspace_type?: string;
	workspace?: { type?: string };
	[key: string]: unknown;
};

export function setAuthSession(accessToken: string, refreshToken?: string) {
	if (typeof window === 'undefined') return;

	Cookies.set(ACCESS_TOKEN_KEY, accessToken, {
		...BASE_COOKIE_OPTIONS,
		expires: SEVEN_DAYS,
	});

	if (refreshToken) {
		Cookies.set(REFRESH_TOKEN_KEY, refreshToken, {
			...BASE_COOKIE_OPTIONS,
			expires: SEVEN_DAYS,
		});
	}
}

export function clearAuthSession() {
	if (typeof window === 'undefined') return;

	Cookies.remove(ACCESS_TOKEN_KEY, { path: '/' });
	Cookies.remove(REFRESH_TOKEN_KEY, { path: '/' });
}

export function getStoredAccessToken() {
	if (typeof window === 'undefined') return undefined;
	return Cookies.get(ACCESS_TOKEN_KEY);
}

export function getStoredRefreshToken() {
	if (typeof window === 'undefined') return undefined;
	return Cookies.get(REFRESH_TOKEN_KEY);
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

export function getClaimsWorkspaceTypes(claims: AuthClaims | null | undefined) {
	if (
		Array.isArray(claims?.workspaceTypes) &&
		claims.workspaceTypes.length > 0
	) {
		return claims.workspaceTypes;
	}

	const legacyType = getClaimsWorkspaceType(claims);
	return typeof legacyType === 'string' ? [legacyType] : [];
}

export function resolveAuthDestination(claims: AuthClaims | null | undefined) {
	const role = getClaimsRole(claims);
	const workspaceTypes = getClaimsWorkspaceTypes(claims);
	const primaryWorkspaceType = workspaceTypes[0];

	switch (role) {
		case 'platform_admin':
			return '/platform-admin';
		case 'supplier':
		case 'supplier_manager':
		case 'supplier_staff':
		case 'supplier_accountant':
			return '/supplier/catalog';
		case 'carrier':
		case 'carrier_dispatcher':
		case 'driver':
			return '/carrier/fleet';
		case 'buyer':
		case 'buyer_manager':
		case 'buyer_staff':
			return '/buyer/sourcing';
		case 'hr':
		case 'hr_manager':
			return '/hr/management';
		case 'company_admin':
			switch (primaryWorkspaceType) {
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
	const workspaceTypes = getClaimsWorkspaceTypes(claims);

	if (!role) return false;

	if (role === 'company_admin') {
		if (pathname.startsWith('/company-admin')) return true;

		if (
			workspaceTypes.includes('supplier') &&
			pathname.startsWith('/supplier')
		) {
			return true;
		}
		if (workspaceTypes.includes('buyer') && pathname.startsWith('/buyer')) {
			return true;
		}
		if (workspaceTypes.includes('carrier') && pathname.startsWith('/carrier')) {
			return true;
		}

		return false;
	}

	if (
		role === 'supplier' ||
		role === 'supplier_manager' ||
		role === 'supplier_staff' ||
		role === 'supplier_accountant'
	) {
		return pathname.startsWith('/supplier');
	}

	if (role === 'buyer' || role === 'buyer_manager' || role === 'buyer_staff') {
		return pathname.startsWith('/buyer');
	}

	if (
		role === 'carrier' ||
		role === 'carrier_dispatcher' ||
		role === 'driver'
	) {
		return pathname.startsWith('/carrier');
	}

	if (role === 'hr' || role === 'hr_manager') {
		return pathname.startsWith('/hr');
	}

	const destination = resolveAuthDestination(claims);
	if (!destination) return false;

	return pathname === destination || pathname.startsWith(`${destination}/`);
}
