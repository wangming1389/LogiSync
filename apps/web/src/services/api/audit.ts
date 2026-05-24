import { api } from '@/lib/api';

export type AuditLogRow = {
	id: string;
	timestamp: string;
	actorId: string;
	workspaceId: string;
	action: string;
	resourceType: string;
	resourceId?: string | null;
	ipAddress: string;
	status: 'success' | 'failure' | string;
	errorMessage?: string | null;
	changes?: unknown;
};

function unwrapAuditItems(response: unknown): AuditLogRow[] {
	const payload =
		(response as any)?.data?.data ?? (response as any)?.data ?? response;
	if (Array.isArray(payload)) return payload;
	if (Array.isArray((payload as any)?.items)) return (payload as any).items;
	return [];
}

export async function getAuditLogs(limit = 25) {
	const response = await api.get(`/admin/audit-logs?limit=${limit}`);
	return unwrapAuditItems(response);
}
