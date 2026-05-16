import { apiFetch } from '@logisync/api-client';
import { env } from '../config/env';
import { getStoredAccessToken } from './auth';

const baseOptions = {
	baseUrl: env.NEXT_PUBLIC_API_BASE_URL,
	getToken: getStoredAccessToken,
};

export const api = {
	get: <T>(path: string) => apiFetch<T>(path, { method: 'GET' }, baseOptions),
	post: <T>(path: string, body: unknown) =>
		apiFetch<T>(
			path,
			{ method: 'POST', body: JSON.stringify(body) },
			baseOptions,
		),
	put: <T>(path: string, body: unknown) =>
		apiFetch<T>(
			path,
			{ method: 'PUT', body: JSON.stringify(body) },
			baseOptions,
		),
	patch: <T>(path: string, body: unknown) =>
		apiFetch<T>(
			path,
			{ method: 'PATCH', body: JSON.stringify(body) },
			baseOptions,
		),
	delete: <T>(path: string) =>
		apiFetch<T>(path, { method: 'DELETE' }, baseOptions),
};
