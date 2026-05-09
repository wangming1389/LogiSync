export type ApiClientOptions = {
	baseUrl: string;
	getToken?: () => string | undefined;
};

export type ApiError = {
	status: number;
	message: string;
	details?: unknown;
};

export async function apiFetch<T>(
	path: string,
	init: RequestInit = {},
	options: ApiClientOptions,
): Promise<T> {
	const url = new URL(path, options.baseUrl).toString();
	const headers = new Headers(init.headers);

	const token = options.getToken?.();
	if (token) {
		headers.set('Authorization', `Bearer ${token}`);
	}

	if (!headers.has('Content-Type') && init.body) {
		headers.set('Content-Type', 'application/json');
	}

	const response = await fetch(url, { ...init, headers });

	if (!response.ok) {
		const message = await response.text();
		throw { status: response.status, message } satisfies ApiError;
	}

	return (await response.json()) as T;
}
