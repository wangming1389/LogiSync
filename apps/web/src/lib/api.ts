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
	postWithBearer: <T>(path: string, body: unknown, token: string) =>
		apiFetch<T>(
			path,
			{
				method: 'POST',
				body: JSON.stringify(body),
				headers: { Authorization: `Bearer ${token}` },
			},
			{ baseUrl: env.NEXT_PUBLIC_API_BASE_URL },
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
	form: async <T>(
		path: string,
		formData: FormData,
		init: Omit<RequestInit, 'body' | 'method'> & { method?: string } = {},
	) => {
		const url = new URL(path, env.NEXT_PUBLIC_API_BASE_URL).toString();
		const headers = new Headers(init.headers);
		const token = getStoredAccessToken();
		if (token) {
			headers.set('Authorization', `Bearer ${token}`);
		}

		const response = await fetch(url, {
			...init,
			method: init.method ?? 'POST',
			headers,
			body: formData,
		});

		if (!response.ok) {
			const message = await response.text();
			throw { status: response.status, message };
		}

		return { data: await response.json() } as T;
	},
};

export function getApiErrorMessage(error: unknown, fallback: string) {
	if (!error || typeof error !== 'object') return fallback;
	const message = (error as { message?: unknown }).message;
	if (typeof message !== 'string' || !message.trim()) return fallback;

	try {
		const parsed = JSON.parse(message) as {
			message?: unknown;
			error?: unknown;
			errors?: { message?: unknown }[];
		};
		if (typeof parsed.message === 'string') return parsed.message;
		if (typeof parsed.error === 'string') return parsed.error;
		if (
			parsed.error &&
			typeof parsed.error === 'object' &&
			typeof (parsed.error as { message?: unknown }).message === 'string'
		) {
			return (parsed.error as { message: string }).message;
		}
		const firstError = parsed.errors?.find(
			(item) => typeof item.message === 'string',
		);
		if (typeof firstError?.message === 'string') return firstError.message;
	} catch {
		// Plain-text error from the API client.
	}

	return message;
}
