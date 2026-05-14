'use client';
import { ArrowRight, Building2, Lock, Mail, User } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { api } from '@/lib/api';

const MARITIME_SHADOW_LG = '0px 24px 64px rgba(15,76,138,0.22)';

export default function RegisterWorkspace() {
	const router = useRouter();
	const [step, setStep] = useState<1 | 2>(1);
	const [workspaceName, setWorkspaceName] = useState('');
	const [workspaceType, setWorkspaceType] = useState('supplier');
	const [adminName, setAdminName] = useState('');
	const [adminEmail, setAdminEmail] = useState('');
	const [password, setPassword] = useState('');

	const handleRegister = async (e: React.FormEvent) => {
		e.preventDefault();
		if (step === 1) {
			setStep(2);
			return;
		}
		try {
			await api.post('/workspaces', {
				name: workspaceName,
				slug:
					workspaceName
						.toLowerCase()
						.replace(/[^a-z0-9]+/g, '-')
						.replace(/^-+|-+$/g, '') || 'ws-' + crypto.randomUUID().slice(0, 8),
				type: workspaceType,
				taxId: '1234567890',
				acceptedTermsVersion: '1.0',
				adminEmail,
				adminPassword: password,
				adminFirstName: adminName.split(' ')[0] || 'Admin',
				adminLastName: adminName.split(' ').slice(1).join(' ') || 'User',
			});
			alert(
				'Workspace Registered Successfully! Waiting for Platform Admin approval.',
			);
			router.push('/login');
		} catch (err: any) {
			alert(err.message || 'Failed to register workspace.');
		}
	};

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
					onSubmit={handleRegister}
					className="px-8 pb-8 flex flex-col gap-6"
				>
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
									Full Name
								</label>
								<div className="relative">
									<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
										<User className="w-4 h-4 text-slate-400" />
									</div>
									<input
										type="text"
										required
										value={adminName}
										onChange={(e) => setAdminName(e.target.value)}
										className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 text-slate-800 rounded-lg focus:outline-none"
									/>
								</div>
							</div>
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
										className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 text-slate-800 rounded-lg focus:outline-none"
									/>
								</div>
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
										className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 text-slate-800 rounded-lg focus:outline-none"
									/>
								</div>
							</div>
						</div>
					)}

					<div className="pt-2">
						<button
							type="submit"
							className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-sm shadow-blue-600/20 transition-all flex items-center justify-center gap-2"
						>
							{step === 1 ? 'Next Step' : 'Register Workspace'}
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
