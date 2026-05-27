import { api } from '@/lib/api';

export type AccessTokenResponse = {
	accessToken: string;
	expiresIn: number;
	sessionWarningAt: number;
};

export type PasswordChangeRequiredResponse = {
	requiresPasswordChange: true;
	changeToken: string;
	expiresIn: number;
};

export type RoleSelectionRequiredResponse = {
	requiresRoleSelection: true;
	roleSelectionToken: string;
	roles: string[];
	expiresIn: number;
};

export type LoginResponse =
	| AccessTokenResponse
	| PasswordChangeRequiredResponse
	| RoleSelectionRequiredResponse;

type ApiEnvelope<T> = T | { data?: T | { data?: T } };

export function unwrapApiData<T>(response: ApiEnvelope<T>): T {
	const first =
		response && typeof response === 'object' && 'data' in response
			? response.data
			: response;
	if (first && typeof first === 'object' && 'data' in first) {
		return first.data as T;
	}

	return first as T;
}

export async function login(payload: { email: string; password: string }) {
	const response = await api.post<ApiEnvelope<LoginResponse>>(
		'/auth/login',
		payload,
	);
	return unwrapApiData<LoginResponse>(response);
}

export async function completeRegistration(payload: {
	changeToken: string;
	newPassword: string;
}) {
	const response = await api.postWithBearer<ApiEnvelope<LoginResponse>>(
		'/auth/complete-registration',
		{ newPassword: payload.newPassword },
		payload.changeToken,
	);
	return unwrapApiData<LoginResponse>(response);
}

export async function selectRole(payload: {
	roleSelectionToken: string;
	role: string;
}) {
	const response = await api.post<ApiEnvelope<AccessTokenResponse>>(
		'/auth/select-role',
		payload,
	);
	return unwrapApiData<AccessTokenResponse>(response);
}

export function isPasswordChangeRequired(
	response: LoginResponse,
): response is PasswordChangeRequiredResponse {
	return 'requiresPasswordChange' in response;
}

export function isRoleSelectionRequired(
	response: LoginResponse,
): response is RoleSelectionRequiredResponse {
	return 'requiresRoleSelection' in response;
}

export function isAccessTokenResponse(
	response: LoginResponse,
): response is AccessTokenResponse {
	return 'accessToken' in response;
}
