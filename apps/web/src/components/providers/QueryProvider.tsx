'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { type ReactNode, useState } from 'react';

// Lazily instantiate a single QueryClient per browser session.
// Defaults are deliberately conservative: a 30s `staleTime` so that
// repeated route transitions don't refetch the same data, and a single
// retry to avoid masking real backend failures behind retries.
function makeQueryClient() {
	return new QueryClient({
		defaultOptions: {
			queries: {
				staleTime: 30_000,
				retry: 1,
				refetchOnWindowFocus: false,
			},
			mutations: {
				retry: 0,
			},
		},
	});
}

export function QueryProvider({ children }: { children: ReactNode }) {
	const [client] = useState(makeQueryClient);
	return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
