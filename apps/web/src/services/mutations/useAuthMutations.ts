'use client';

import { useMutation } from '@tanstack/react-query';
import {
	type RegisterWorkspacePayload,
	registerWorkspace,
} from '@/services/api/workspaces';

export function useRegisterWorkspaceMutation() {
	return useMutation({
		mutationKey: ['auth', 'register-workspace'],
		mutationFn: (payload: RegisterWorkspacePayload) =>
			registerWorkspace(payload),
	});
}
