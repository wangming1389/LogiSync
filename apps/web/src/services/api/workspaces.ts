import { api } from '@/lib/api';

export type RegisterWorkspacePayload = {
	name: string;
	slug: string;
	taxId: string;
	types: ('supplier' | 'buyer' | 'carrier')[];
	adminEmail: string;
	adminPassword: string;
	acceptedTermsVersion: string;
};

export function registerWorkspace(payload: RegisterWorkspacePayload) {
	return api.post('/workspaces', payload);
}
