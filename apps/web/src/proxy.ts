import { NextRequest, NextResponse } from 'next/server';
import {
	isAllowedPathForClaims,
	parseJwtClaims,
	resolveAuthDestination,
} from './lib/auth';

const PUBLIC_PATHS = ['/login', '/register'];
const PROTECTED_PREFIXES = [
	'/platform-admin',
	'/company-admin',
	'/supplier',
	'/buyer',
	'/carrier',
	'/hr',
];

function clearAuthCookies(response: NextResponse) {
	response.cookies.set('access_token', '', {
		path: '/',
		maxAge: 0,
	});
	response.cookies.set('refresh_token', '', {
		path: '/',
		maxAge: 0,
	});
}

export function proxy(request: NextRequest) {
	const { pathname } = request.nextUrl;
	const token = request.cookies.get('access_token')?.value;
	const isPublicPath = PUBLIC_PATHS.includes(pathname);
	const isProtectedPath = PROTECTED_PREFIXES.some(
		(prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
	);

	if (!token) {
		if (isProtectedPath) {
			return NextResponse.redirect(new URL('/login', request.url));
		}

		return NextResponse.next();
	}

	const claims = parseJwtClaims(token);
	if (!claims) {
		const response = NextResponse.redirect(new URL('/login', request.url));
		clearAuthCookies(response);
		return response;
	}

	if (isPublicPath) {
		return NextResponse.redirect(
			new URL(resolveAuthDestination(claims) ?? '/login', request.url),
		);
	}

	if (isProtectedPath && !isAllowedPathForClaims(pathname, claims)) {
		return NextResponse.redirect(
			new URL(resolveAuthDestination(claims) ?? '/login', request.url),
		);
	}

	return NextResponse.next();
}

export const config = {
	matcher: ['/((?!_next/static|_next/image|favicon.ico|api).*)'],
};
