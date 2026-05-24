'use client';

import { useQuery } from '@tanstack/react-query';
import {
	getHealthStatus,
	getLiveStatus,
	getReadyStatus,
} from '@/services/api/health';

export function usePlatformHealthQuery() {
	return useQuery({
		queryKey: ['platform-admin', 'health'],
		queryFn: async () => {
			const [health, ready, live] = await Promise.all([
				getHealthStatus(),
				getReadyStatus(),
				getLiveStatus(),
			]);
			return { health, ready, live, fetchedAt: new Date() };
		},
		refetchInterval: 15_000,
	});
}

export function useLiveHealthQuery() {
	return useQuery({
		queryKey: ['platform-admin', 'live-health'],
		queryFn: getLiveStatus,
		refetchInterval: 15_000,
	});
}
