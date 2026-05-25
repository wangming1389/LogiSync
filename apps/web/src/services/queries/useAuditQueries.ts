'use client';

import { useQuery } from '@tanstack/react-query';
import { getAuditLogs } from '@/services/api/audit';

export function useAuditLogsQuery(limit = 25) {
	return useQuery({
		queryKey: ['platform-admin', 'audit-logs', limit],
		queryFn: () => getAuditLogs(limit),
	});
}
