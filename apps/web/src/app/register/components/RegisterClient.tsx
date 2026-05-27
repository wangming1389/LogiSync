'use client';

import { ArrowRight, Building2, Eye, EyeOff, Lock, Mail } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { getApiErrorMessage } from '@/lib/api';
import {
	type RegisterWorkspaceFormValues,
	RegisterWorkspaceSchema,
} from '@/schemas/auth';
import { useRegisterWorkspaceMutation } from '@/services/mutations/useAuthMutations';

const MARITIME_SHADOW_LG = '0px 24px 64px rgba(15,76,138,0.22)';
const ACCEPTED_TERMS_VERSION = '1.0';

function slugify(value: string) {
	return value
		.toLowerCase()
		.trim()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '')
		.slice(0, 255);
}

type FieldErrors = Partial<Record<keyof RegisterWorkspaceFormValues, string>>;

export default function RegisterClient() {
	const router = useRouter();
	const registerWorkspace = useRegisterWorkspaceMutation();
	const [step, setStep] = useState<1 | 2>(1);
	const [workspaceName, setWorkspaceName] = useState('');
	const [workspaceTypes, setWorkspaceTypes] = useState<
		RegisterWorkspaceFormValues['workspaceTypes']
	>(['supplier']);
	const [taxId, setTaxId] = useState('');
	const [adminEmail, setAdminEmail] = useState('');
	const [password, setPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
	const [acceptedTerms, setAcceptedTerms] = useState(false);
	const [submitError, setSubmitError] = useState('');
	const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

	const formValues = useMemo<RegisterWorkspaceFormValues>(
		() => ({
			workspaceName,
			workspaceTypes,
			taxId,
			adminEmail,
			password,
			confirmPassword,
			acceptedTerms,
		}),
		[
			workspaceName,
			workspaceTypes,
			taxId,
			adminEmail,
			password,
			confirmPassword,
			acceptedTerms,
		],
	);

	function collectFieldErrors() {
		const parsed = RegisterWorkspaceSchema.safeParse(formValues);
		if (parsed.success) return {};
		const flattened = parsed.error.flatten().fieldErrors;
		return Object.fromEntries(
			Object.entries(flattened).map(([key, messages]) => [key, messages?.[0]]),
		) as FieldErrors;
	}

	function showStepErrors() {
		const nextErrors = collectFieldErrors();
		setFieldErrors(nextErrors);
		return nextErrors;
	}

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		setSubmitError('');

		if (step === 1) {
			const errors = showStepErrors();
			if (errors.workspaceName || errors.workspaceTypes || errors.taxId) return;
			setStep(2);
			return;
		}

		const parsed = RegisterWorkspaceSchema.safeParse(formValues);
		if (!parsed.success) {
			showStepErrors();
			return;
		}

		const payload = {
			name: parsed.data.workspaceName.trim(),
			slug: slugify(parsed.data.workspaceName),
			taxId: parsed.data.taxId.trim(),
			types: parsed.data.workspaceTypes,
			adminEmail: parsed.data.adminEmail.trim(),
			adminPassword: parsed.data.password,
			acceptedTermsVersion: ACCEPTED_TERMS_VERSION,
		};

		registerWorkspace.mutate(payload, {
			onSuccess: () => {
				router.push('/login?registered=1');
			},
			onError: (error) => {
				setSubmitError(
					getApiErrorMessage(error, 'Failed to register workspace.'),
				);
			},
		});
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

				<form
					onSubmit={handleSubmit}
					noValidate
					className="px-8 pb-8 flex flex-col gap-6"
				>
					{submitError && (
						<div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
							{submitError}
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
										onChange={(e) => {
											setWorkspaceName(e.target.value);
											setFieldErrors((current) => ({
												...current,
												workspaceName: undefined,
											}));
										}}
										className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 text-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-colors"
									/>
								</div>
								{fieldErrors.workspaceName && (
									<p className="mt-1 text-xs text-red-600">
										{fieldErrors.workspaceName}
									</p>
								)}
							</div>
							<div>
								<label className="block text-sm font-medium text-slate-600 mb-1.5">
									Tax ID
								</label>
								<input
									type="text"
									required
									value={taxId}
									onChange={(e) => {
										setTaxId(e.target.value.replace(/\s+/g, ''));
										setFieldErrors((current) => ({
											...current,
											taxId: undefined,
										}));
									}}
									placeholder="10 or 13 digits"
									className="w-full px-4 py-2 bg-slate-50 border border-slate-200 text-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-colors"
								/>
								{fieldErrors.taxId && (
									<p className="mt-1 text-xs text-red-600">
										{fieldErrors.taxId}
									</p>
								)}
							</div>
							<div>
								<label className="block text-sm font-medium text-slate-600 mb-1.5">
									Workspace Types
								</label>
								<div className="grid grid-cols-3 gap-2">
									{[
										{ value: 'supplier', label: 'Supplier' },
										{ value: 'buyer', label: 'Buyer' },
										{ value: 'carrier', label: 'Carrier' },
									].map((type) => {
										const value =
											type.value as RegisterWorkspaceFormValues['workspaceTypes'][number];
										const selected = workspaceTypes.includes(value);
										return (
											<label
												key={type.value}
												className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors ${selected ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-slate-200 bg-slate-50 text-slate-700'}`}
											>
												<input
													type="checkbox"
													checked={selected}
													onChange={(e) => {
														setWorkspaceTypes((current) =>
															e.target.checked
																? [...current, value]
																: current.filter((item) => item !== value),
														);
														setFieldErrors((current) => ({
															...current,
															workspaceTypes: undefined,
														}));
													}}
													className="h-4 w-4 rounded border-slate-300"
												/>
												{type.label}
											</label>
										);
									})}
								</div>
								{fieldErrors.workspaceTypes && (
									<p className="mt-1 text-xs text-red-600">
										{fieldErrors.workspaceTypes}
									</p>
								)}
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
										onChange={(e) => {
											setAdminEmail(e.target.value);
											setFieldErrors((current) => ({
												...current,
												adminEmail: undefined,
											}));
										}}
										placeholder="admin@company.com"
										className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 text-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-colors"
									/>
								</div>
								{fieldErrors.adminEmail && (
									<p className="mt-1 text-xs text-red-600">
										{fieldErrors.adminEmail}
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
										type={showPassword ? 'text' : 'password'}
										required
										value={password}
										onChange={(e) => {
											setPassword(e.target.value);
											setFieldErrors((current) => ({
												...current,
												password: undefined,
											}));
										}}
										placeholder="At least 8 chars, uppercase and number"
										className="w-full pl-10 pr-10 py-2 bg-slate-50 border border-slate-200 text-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-colors"
									/>
									<button
										type="button"
										onClick={() => setShowPassword((value) => !value)}
										className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
										aria-label={
											showPassword ? 'Hide password' : 'Show password'
										}
									>
										{showPassword ? (
											<EyeOff className="w-4 h-4" />
										) : (
											<Eye className="w-4 h-4" />
										)}
									</button>
								</div>
								{fieldErrors.password && (
									<p className="mt-1 text-xs text-red-600">
										{fieldErrors.password}
									</p>
								)}
							</div>
							<div>
								<label className="block text-sm font-medium text-slate-600 mb-1.5">
									Confirm Password
								</label>
								<div className="relative">
									<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
										<Lock className="w-4 h-4 text-slate-400" />
									</div>
									<input
										type={showConfirmPassword ? 'text' : 'password'}
										required
										value={confirmPassword}
										onChange={(e) => {
											setConfirmPassword(e.target.value);
											setFieldErrors((current) => ({
												...current,
												confirmPassword: undefined,
											}));
										}}
										placeholder="Re-enter password"
										className="w-full pl-10 pr-10 py-2 bg-slate-50 border border-slate-200 text-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-colors"
									/>
									<button
										type="button"
										onClick={() => setShowConfirmPassword((value) => !value)}
										className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
										aria-label={
											showConfirmPassword
												? 'Hide password confirmation'
												: 'Show password confirmation'
										}
									>
										{showConfirmPassword ? (
											<EyeOff className="w-4 h-4" />
										) : (
											<Eye className="w-4 h-4" />
										)}
									</button>
								</div>
								{fieldErrors.confirmPassword && (
									<p className="mt-1 text-xs text-red-600">
										{fieldErrors.confirmPassword}
									</p>
								)}
							</div>
							<label className="flex items-start gap-2 pt-1 cursor-pointer">
								<input
									type="checkbox"
									checked={acceptedTerms}
									onChange={(e) => {
										setAcceptedTerms(e.target.checked);
										setFieldErrors((current) => ({
											...current,
											acceptedTerms: undefined,
										}));
									}}
									className="mt-1 w-4 h-4 rounded border-slate-300"
								/>
								<span className="text-sm text-slate-600">
									I accept the terms and privacy policy.
								</span>
							</label>
							{fieldErrors.acceptedTerms && (
								<p className="text-xs text-red-600">
									{fieldErrors.acceptedTerms}
								</p>
							)}
						</div>
					)}

					<div className="pt-2 flex gap-3">
						{step === 2 && (
							<button
								type="button"
								onClick={() => setStep(1)}
								disabled={registerWorkspace.isPending}
								className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg transition-all"
							>
								Back
							</button>
						)}
						<button
							type="submit"
							disabled={registerWorkspace.isPending}
							className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-sm shadow-blue-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
						>
							{step === 1
								? 'Next Step'
								: registerWorkspace.isPending
									? 'Submitting...'
									: 'Register Workspace'}
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
