'use client';

import { ArrowRight, Building2, Lock, Mail } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { api } from '@/lib/api';

const MARITIME_SHADOW_LG = '0px 24px 64px rgba(15,76,138,0.22)';
const ACCEPTED_TERMS_VERSION = '1.0';

function isValidEmail(value: string) {
	return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isStrongPassword(value: string) {
	return /^(?=.*[A-Z])(?=.*\d).{8,}$/.test(value);
}

function isValidTaxId(value: string) {
	return /^\d{10}(?:\d{3})?$/.test(value);
}

function slugify(value: string) {
	return value
		.toLowerCase()
		.trim()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '')
		.slice(0, 255);
}

export default function RegisterWorkspace() {
	const router = useRouter();
	const [step, setStep] = useState<1 | 2>(1);
	const [workspaceName, setWorkspaceName] = useState('');
	const [workspaceType, setWorkspaceType] = useState('supplier');
	const [taxId, setTaxId] = useState('');
	const [adminEmail, setAdminEmail] = useState('');
	const [password, setPassword] = useState('');
	const [acceptedTerms, setAcceptedTerms] = useState(false);
	const [submitError, setSubmitError] = useState('');
	const [submitSuccess, setSubmitSuccess] = useState('');
	const [submitting, setSubmitting] = useState(false);

	const stepOneValid =
		workspaceName.trim().length > 0 &&
		workspaceType.trim().length > 0 &&
		isValidTaxId(taxId);

	const stepTwoValid =
		isValidEmail(adminEmail) && isStrongPassword(password) && acceptedTerms;

	const canContinue = useMemo(
		() => (step === 1 ? stepOneValid : stepTwoValid),
		[step, stepOneValid, stepTwoValid],
	);

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		setSubmitError('');
		setSubmitSuccess('');

		if (step === 1) {
			if (!stepOneValid) return;
			setStep(2);
			return;
		}

		if (!stepTwoValid) return;

		setSubmitting(true);
		try {
				const payload = {
					name: workspaceName.trim(),
					slug: slugify(workspaceName),
					taxId: taxId.trim(),
					type: workspaceType,
					adminEmail: adminEmail.trim(),
					adminPassword: password,
					acceptedTermsVersion: ACCEPTED_TERMS_VERSION,
				};

				await api.post('/workspaces', payload);

			setSubmitSuccess(
				'Workspace submitted successfully. Status is now pending approval.',
			);
			setStep(1);
			setWorkspaceName('');
			setWorkspaceType('supplier');
			setTaxId('');
			setAdminEmail('');
			setPassword('');
			setAcceptedTerms(false);
		} catch (error: any) {
			if (error?.status === 409) {
				setSubmitError(
					error?.message || 'Workspace email or tax ID already exists.',
				);
			} else {
				setSubmitError(error?.message || 'Failed to register workspace.');
			}
		} finally {
			setSubmitting(false);
		}
	}

	return (
		<div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
			<div
				className="w-full max-w-md bg-white rounded-xl overflow-hidden flex flex-col relative"
				style={{ boxShadow: MARITIME_SHADOW_LG }}
			>
				<div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 to-cyan-500" />
				<div className="p-8 pb-6">
					<div className="flex items-center gap-3 mb-2">
						<div className="w-10 h-10 bg-blue-50 text-blue-700 rounded-lg flex items-center justify-center shadow-sm">
							<Building2 className="w-5 h-5 stroke-[2.5]" />
						</div>
						<div>
							<h1 className="text-2xl font-bold text-slate-800 tracking-tight">
								LogiSync
							</h1>
							<p className="text-xs font-semibold text-blue-600 uppercase tracking-widest">
								Register Workspace
							</p>
						</div>
					</div>
				</div>

				<form onSubmit={handleSubmit} className="px-8 pb-8 flex flex-col gap-6">
					{submitError && (
						<div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
							{submitError}
						</div>
					)}
					{submitSuccess && (
						<div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
							{submitSuccess}
						</div>
					)}

					{step === 1 && (
						<div className="space-y-4">
							<h2 className="text-lg font-semibold text-slate-700">
								Workspace Information
							</h2>
							<div>
								<label className="block text-sm font-medium text-slate-600 mb-1.5">
									Workspace Name
								</label>
								<div className="relative">
									<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
										<Building2 className="w-4 h-4 text-slate-400" />
									</div>
									<input
										type="text"
										required
										value={workspaceName}
										onChange={(e) => setWorkspaceName(e.target.value)}
										className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 text-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-colors"
									/>
								</div>
							</div>
							<div>
								<label className="block text-sm font-medium text-slate-600 mb-1.5">
									Tax ID
								</label>
								<input
									type="text"
									required
									value={taxId}
									onChange={(e) => setTaxId(e.target.value.replace(/\s+/g, ''))}
									placeholder="10 or 13 digits"
									className="w-full px-4 py-2 bg-slate-50 border border-slate-200 text-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-colors"
								/>
								{taxId && !isValidTaxId(taxId) && (
									<p className="mt-1 text-xs text-red-600">
										Tax ID must be 10 or 13 digits.
									</p>
								)}
							</div>
							<div>
								<label className="block text-sm font-medium text-slate-600 mb-1.5">
									Workspace Type
								</label>
								<select
									value={workspaceType}
									onChange={(e) => setWorkspaceType(e.target.value)}
									className="w-full px-4 py-2 bg-slate-50 border border-slate-200 text-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-colors"
								>
									<option value="supplier">Supplier</option>
									<option value="buyer">Buyer</option>
									<option value="carrier">Carrier</option>
								</select>
							</div>
						</div>
					)}

					{step === 2 && (
						<div className="space-y-4">
							<h2 className="text-lg font-semibold text-slate-700">
								Admin Account
							</h2>
							<div>
								<label className="block text-sm font-medium text-slate-600 mb-1.5">
									Email
								</label>
								<div className="relative">
									<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
										<Mail className="w-4 h-4 text-slate-400" />
									</div>
									<input
										type="email"
										required
										value={adminEmail}
										onChange={(e) => setAdminEmail(e.target.value)}
										placeholder="admin@company.com"
										className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 text-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-colors"
									/>
								</div>
								{adminEmail && !isValidEmail(adminEmail) && (
									<p className="mt-1 text-xs text-red-600">
										Please enter a valid email address.
									</p>
								)}
							</div>
							<div>
								<label className="block text-sm font-medium text-slate-600 mb-1.5">
									Password
								</label>
								<div className="relative">
									<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
										<Lock className="w-4 h-4 text-slate-400" />
									</div>
									<input
										type="password"
										required
										value={password}
										onChange={(e) => setPassword(e.target.value)}
										placeholder="At least 8 chars, uppercase and number"
										className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 text-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-colors"
									/>
								</div>
								{password && !isStrongPassword(password) && (
									<p className="mt-1 text-xs text-red-600">
										Password must be at least 8 characters with 1 uppercase letter and 1 number.
									</p>
								)}
							</div>
							<label className="flex items-start gap-2 pt-1 cursor-pointer">
								<input
									type="checkbox"
									checked={acceptedTerms}
									onChange={(e) => setAcceptedTerms(e.target.checked)}
									className="mt-1 w-4 h-4 rounded border-slate-300"
								/>
								<span className="text-sm text-slate-600">
									I accept the terms and privacy policy.
								</span>
							</label>
						</div>
					)}

					<div className="pt-2 flex gap-3">
						{step === 2 && (
							<button
								type="button"
								onClick={() => setStep(1)}
								className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg transition-all"
							>
								Back
							</button>
						)}
						<button
							type="submit"
							disabled={!canContinue || submitting}
							className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-sm shadow-blue-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
						>
							{step === 1 ? 'Next Step' : submitting ? 'Submitting...' : 'Register Workspace'}
							<ArrowRight className="w-4 h-4" />
						</button>
					</div>
				</form>

				<div className="px-8 pb-6 text-center">
					<p className="text-sm text-slate-600">
						Already have a workspace?{' '}
						<button
							onClick={() => router.push('/login')}
							className="text-blue-600 hover:underline font-medium"
						>
							Sign in here
						</button>
					</p>
				</div>
			</div>
		</div>
	);
}
