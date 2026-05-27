'use client';

import { AlertTriangle, Building2, Eye, EyeOff, Lock } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
	clearPasswordChangeState,
	getPasswordChangeState,
	saveRoleSelectionState,
} from '@/lib/auth-flow';
import {
	parseJwtClaims,
	resolveAuthDestination,
	setAuthSession,
} from '@/lib/auth';
import {
	completeRegistration,
	isAccessTokenResponse,
	isRoleSelectionRequired,
} from '@/services/api/auth';

const MARITIME_SHADOW_LG = '0px 24px 64px rgba(15,76,138,0.22)';

function isStrongPassword(value: string) {
	return (
		value.length >= 8 &&
		/[a-z]/.test(value) &&
		/[A-Z]/.test(value) &&
		/\d/.test(value) &&
		/[^A-Za-z0-9]/.test(value)
	);
}

export default function CompleteRegistrationClient() {
	const router = useRouter();
	const [changeToken, setChangeToken] = useState('');
	const [email, setEmail] = useState('');
	const [newPassword, setNewPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');
	const [showPassword, setShowPassword] = useState(false);
	const [error, setError] = useState('');
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		const state = getPasswordChangeState();
		if (!state?.changeToken) {
			router.replace('/login');
			return;
		}

		setChangeToken(state.changeToken);
		setEmail(state.email ?? '');
	}, [router]);

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		setError('');

		if (!isStrongPassword(newPassword)) {
			setError(
				'Password must include uppercase, lowercase, number, and special character.',
			);
			return;
		}

		if (newPassword !== confirmPassword) {
			setError('Password confirmation does not match.');
			return;
		}

		setLoading(true);
		try {
			const res = await completeRegistration({ changeToken, newPassword });
			clearPasswordChangeState();

			if (isRoleSelectionRequired(res)) {
				saveRoleSelectionState({
					roleSelectionToken: res.roleSelectionToken,
					roles: res.roles,
					expiresIn: res.expiresIn,
				});
				router.replace('/select-role');
				return;
			}

			if (!isAccessTokenResponse(res)) {
				throw new Error('Unexpected registration response from server.');
			}

			const claims = parseJwtClaims(res.accessToken);
			const destination = resolveAuthDestination(claims);
			if (!destination) {
				throw new Error('Invalid role in token');
			}

			setAuthSession(res.accessToken);
			router.replace(destination);
		} catch (err) {
			const message =
				err && typeof err === 'object' && 'message' in err
					? String(err.message)
					: 'Unable to complete registration.';
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
							First Login
						</p>
					</div>
				</div>

				<h2 className="text-xl font-semibold text-slate-900">
					Set your new password
				</h2>
				{email && <p className="mt-1 text-sm text-slate-500">{email}</p>}

				{error && (
					<div className="mt-4 flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700">
						<AlertTriangle className="h-4 w-4 shrink-0" />
						{error}
					</div>
				)}

				<form onSubmit={handleSubmit} className="mt-6 space-y-4">
					<div>
						<label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-500">
							New Password
						</label>
						<div className="relative">
							<Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
							<input
								type={showPassword ? 'text' : 'password'}
								value={newPassword}
								onChange={(e) => setNewPassword(e.target.value)}
								disabled={loading}
								className="h-12 w-full rounded-t-md bg-slate-200 pl-10 pr-10 text-sm text-slate-900 outline-none"
							/>
							<button
								type="button"
								onClick={() => setShowPassword((value) => !value)}
								className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500"
								aria-label={showPassword ? 'Hide password' : 'Show password'}
							>
								{showPassword ? (
									<EyeOff className="h-4 w-4" />
								) : (
									<Eye className="h-4 w-4" />
								)}
							</button>
						</div>
					</div>

					<div>
						<label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-500">
							Confirm Password
						</label>
						<input
							type={showPassword ? 'text' : 'password'}
							value={confirmPassword}
							onChange={(e) => setConfirmPassword(e.target.value)}
							disabled={loading}
							className="h-12 w-full rounded-t-md bg-slate-200 px-4 text-sm text-slate-900 outline-none"
						/>
					</div>

					<button
						type="submit"
						disabled={loading || !changeToken}
						className="h-12 w-full rounded-md bg-blue-700 text-sm font-semibold uppercase tracking-wider text-white transition-colors hover:bg-blue-800 disabled:opacity-60"
					>
						{loading ? 'Updating...' : 'Complete Registration'}
					</button>
				</form>
			</div>
		</div>
	);
}
