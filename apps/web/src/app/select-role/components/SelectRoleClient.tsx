'use client';

import { AlertTriangle, Building2, CheckCircle2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
	clearRoleSelectionState,
	getRoleSelectionState,
} from '@/lib/auth-flow';
import {
	parseJwtClaims,
	resolveAuthDestination,
	setAuthSession,
} from '@/lib/auth';
import { getRoleLabel } from '@/lib/roles';
import { selectRole } from '@/services/api/auth';

const MARITIME_SHADOW_LG = '0px 24px 64px rgba(15,76,138,0.22)';

export default function SelectRoleClient() {
	const router = useRouter();
	const [roleSelectionToken, setRoleSelectionToken] = useState('');
	const [roles, setRoles] = useState<string[]>([]);
	const [selectedRole, setSelectedRole] = useState('');
	const [error, setError] = useState('');
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		const state = getRoleSelectionState();
		if (!state?.roleSelectionToken || state.roles.length === 0) {
			router.replace('/login');
			return;
		}

		setRoleSelectionToken(state.roleSelectionToken);
		setRoles(state.roles);
		setSelectedRole(state.roles[0] ?? '');
	}, [router]);

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		setError('');

		if (!selectedRole) {
			setError('Please select a role.');
			return;
		}

		setLoading(true);
		try {
			const res = await selectRole({ roleSelectionToken, role: selectedRole });
			const claims = parseJwtClaims(res.accessToken);
			const destination = resolveAuthDestination(claims);
			if (!destination) {
				throw new Error('Invalid role in token');
			}

			clearRoleSelectionState();
			setAuthSession(res.accessToken);
			router.replace(destination);
		} catch (err) {
			const message =
				err && typeof err === 'object' && 'message' in err
					? String(err.message)
					: 'Unable to select role.';
			setError(message);
		} finally {
			setLoading(false);
		}
	}

	return (
		<div
			className="min-h-screen flex items-center justify-center p-4"
			style={{
				background:
					'radial-gradient(ellipse at 60% 40%, #1A6EC4 0%, #0F4C8A 50%, #0A3A6E 100%)',
			}}
		>
			<div
				className="w-full max-w-md rounded-xl bg-white p-8"
				style={{ boxShadow: MARITIME_SHADOW_LG }}
			>
				<div className="mb-6 flex items-center gap-3">
					<div className="flex h-11 w-11 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
						<Building2 className="h-5 w-5" />
					</div>
					<div>
						<h1 className="text-2xl font-bold text-slate-900">LogiSync</h1>
						<p className="text-xs font-semibold uppercase tracking-widest text-blue-600">
							Role Selection
						</p>
					</div>
				</div>

				<h2 className="text-xl font-semibold text-slate-900">
					Choose your active role
				</h2>

				{error && (
					<div className="mt-4 flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700">
						<AlertTriangle className="h-4 w-4 shrink-0" />
						{error}
					</div>
				)}

				<form onSubmit={handleSubmit} className="mt-6 space-y-3">
					{roles.map((role) => {
						const selected = selectedRole === role;
						return (
							<label
								key={role}
								className={`flex cursor-pointer items-center justify-between rounded-lg border px-4 py-3 transition-colors ${selected ? 'border-blue-600 bg-blue-50 text-blue-800' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'}`}
							>
								<span className="font-medium">{getRoleLabel(role)}</span>
								<input
									type="radio"
									name="role"
									value={role}
									checked={selected}
									onChange={() => setSelectedRole(role)}
									className="sr-only"
								/>
								{selected && <CheckCircle2 className="h-5 w-5 text-blue-600" />}
							</label>
						);
					})}

					<button
						type="submit"
						disabled={loading || !roleSelectionToken}
						className="mt-3 h-12 w-full rounded-md bg-blue-700 text-sm font-semibold uppercase tracking-wider text-white transition-colors hover:bg-blue-800 disabled:opacity-60"
					>
						{loading ? 'Continuing...' : 'Continue'}
					</button>
				</form>
			</div>
		</div>
	);
}
