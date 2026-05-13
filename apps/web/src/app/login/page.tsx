'use client';

import {
	AlertTriangle,
	Building2,
	Eye,
	EyeOff,
	Lock,
	Mail,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { api } from '@/lib/api';

const MARITIME_SHADOW_LG = '0px 24px 64px rgba(15,76,138,0.22)';

export type UserRole =
	| 'platform_admin'
	| 'supplier'
	| 'carrier'
	| 'buyer'
	| 'hr';

const ROLES: { value: UserRole; label: string; description: string }[] = [
	{
		value: 'platform_admin',
		label: 'Platform Admin',
		description: 'Manage workspaces, catalog, disputes',
	},
	{
		value: 'supplier',
		label: 'Supplier',
		description: 'Catalog, orders, RFQ, finance',
	},
	{
		value: 'carrier',
		label: 'Carrier',
		description: 'Fleet, dispatch, tracking, finance',
	},
	{
		value: 'buyer',
		label: 'Buyer',
		description: 'Sourcing, orders, logistics, payment',
	},
	{ value: 'hr', label: 'HR', description: 'Employee and KPI management' },
];

const ROLE_INITIAL_PATH: Record<UserRole, string> = {
	platform_admin: '/platform-admin',
	supplier: '/supplier/catalog',
	carrier: '/carrier/fleet',
	buyer: '/buyer/sourcing',
	hr: '/hr/management',
};

export default function LoginPage() {
	const [step, setStep] = useState<'login' | 'locked'>('login');
	const [email, setEmail] = useState('admin@logisync.vn');
	const [password, setPassword] = useState('password');
	const [showPass, setShowPass] = useState(false);
	const [failCount, setFailCount] = useState(0);
	const [error, setError] = useState('');
	const [loading, setLoading] = useState(false);

	const router = useRouter();

	// Giải mã JWT payload (không cần xác thực signature)
	function decodeJWT(token: string): { role: UserRole; [key: string]: any } {
		try {
			const base64Url = token.split('.')[1];
			const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
			const jsonPayload = decodeURIComponent(
				atob(base64)
					.split('')
					.map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
					.join('')
			);
			return JSON.parse(jsonPayload);
		} catch (error) {
			console.error('Failed to decode JWT:', error);
			throw new Error('Invalid token format');
		}
	}

	async function handleLogin(e: React.FormEvent) {
		e.preventDefault();
		if (failCount >= 5) {
			setStep('locked');
			return;
		}
		if (!email || !password) {
			setError('Please enter email and password.');
			return;
		}

		setLoading(true);
		setError('');
		try {
			const res: any = await api.post('/auth/login', { email, password });
			const token = res?.data?.accessToken;
			if (!token) {
				throw new Error('No access token received from server');
			}
			
			localStorage.setItem('access_token', token);
			
			// Giải mã JWT để lấy role
			const payload = decodeJWT(token);
			const role = payload.role as UserRole;
			
			// Auto-route dựa trên role
			if (role && ROLE_INITIAL_PATH[role]) {
				router.push(ROLE_INITIAL_PATH[role]);
			} else {
				throw new Error('Invalid role in token');
			}
		} catch (err: any) {
			const f = failCount + 1;
			setFailCount(f);
			if (f >= 5) {
				setStep('locked');
			} else {
				setError(err.message || 'Invalid credentials.');
			}
		} finally {
			setLoading(false);
		}
	}

	if (step === 'locked') {
		return (
			<div
				className="min-h-screen flex items-center justify-center p-4 w-full"
				style={{ background: '#0F4C8A' }}
			>
				<div
					className="w-full max-w-md rounded-xl p-8 text-center"
					style={{ background: '#FFFFFF', boxShadow: MARITIME_SHADOW_LG }}
				>
					<div
						className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
						style={{ background: '#FFDAD6' }}
					>
						<Lock className="w-8 h-8" style={{ color: '#BA1A1A' }} />
					</div>
					<h2
						style={{ color: '#191C1E', fontSize: '1.5rem', fontWeight: 'bold' }}
					>
						Account Locked
					</h2>
					<p
						className="mt-2 mb-6"
						style={{ fontSize: 14, color: 'rgba(25,28,30,0.6)' }}
					>
						Your account has been temporarily locked after 5 failed login
						attempts. Please contact your administrator or try again after 30
						minutes.
					</p>
					<button
						onClick={() => {
							setStep('login');
							setFailCount(0);
							setError('');
						}}
						className="px-6 py-2.5 text-white rounded-[6px] transition-all"
						style={{
							background: 'linear-gradient(135deg, #1A6EC4 0%, #00559F 100%)',
							fontWeight: 600,
							letterSpacing: '0.05em',
						}}
					>
						BACK TO LOGIN
					</button>
				</div>
			</div>
		);
	}



	return (
		<div
			className="min-h-screen flex items-center justify-center p-4 relative w-full"
			style={{
				background:
					'radial-gradient(ellipse at 60% 40%, #1A6EC4 0%, #0F4C8A 50%, #0A3A6E 100%)',
			}}
		>
			<div className="w-full max-w-md">
				<div className="text-center mb-8">
					<div
						className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
						style={{
							background: 'rgba(255,255,255,0.15)',
							backdropFilter: 'blur(8px)',
						}}
					>
						<Building2 className="w-8 h-8 text-white" />
					</div>
					<h1
						style={{
							color: '#FFFFFF',
							letterSpacing: '-0.02em',
							fontSize: '2rem',
							fontWeight: 'bold',
						}}
					>
						LogiSync
					</h1>
					<p
						className="mt-1"
						style={{
							color: 'rgba(255,255,255,0.55)',
							fontSize: 11,
							fontWeight: 500,
							letterSpacing: '0.08em',
							textTransform: 'uppercase',
						}}
					>
						LOGISTICS SUPPLY CHAIN PLATFORM
					</p>
				</div>

				<div
					className="rounded-xl p-8"
					style={{ background: '#FFFFFF', boxShadow: MARITIME_SHADOW_LG }}
				>
					<h2
						className="mb-1"
						style={{
							color: '#191C1E',
							letterSpacing: '-0.01em',
							fontSize: '1.5rem',
							fontWeight: 'bold',
						}}
					>
						Welcome Back
					</h2>
					<p
						className="mb-6"
						style={{
							fontSize: 11,
							fontWeight: 500,
							letterSpacing: '0.06em',
							textTransform: 'uppercase',
							color: 'rgba(25,28,30,0.5)',
						}}
					>
						SIGN IN TO CONTINUE
					</p>

					{error && (
						<div
							className="flex items-center gap-2 p-3 rounded-lg mb-4"
							style={{ background: '#FFDAD6' }}
						>
							<AlertTriangle
								className="w-4 h-4 shrink-0"
								style={{ color: '#BA1A1A' }}
							/>
							<p style={{ fontSize: 13, color: '#BA1A1A' }}>{error}</p>
						</div>
					)}

					<form onSubmit={handleLogin} className="space-y-4">
						<div>
							<label
								className="block mb-1"
								style={{
									fontSize: 11,
									fontWeight: 500,
									letterSpacing: '0.06em',
									textTransform: 'uppercase',
									color: 'rgba(25,28,30,0.6)',
								}}
							>
								EMAIL ADDRESS
							</label>
							<div className="relative">
								<Mail
									className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
									style={{ color: 'rgba(25,28,30,0.4)' }}
								/>
								<input
									type="email"
									value={email}
									disabled={loading}
									onChange={(e) => setEmail(e.target.value)}
									className="w-full pl-10 pr-4 h-12 rounded-t-[6px] focus:outline-none transition-all"
									style={{
										background: '#D5DAE3',
										borderBottom: '2px solid transparent',
										color: '#191C1E',
										fontSize: 14,
									}}
									placeholder="you@company.vn"
								/>
							</div>
						</div>

						<div>
							<label
								className="block mb-1"
								style={{
									fontSize: 11,
									fontWeight: 500,
									letterSpacing: '0.06em',
									textTransform: 'uppercase',
									color: 'rgba(25,28,30,0.6)',
								}}
							>
								PASSWORD
							</label>
							<div className="relative">
								<Lock
									className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
									style={{ color: 'rgba(25,28,30,0.4)' }}
								/>
								<input
									type={showPass ? 'text' : 'password'}
									value={password}
									disabled={loading}
									onChange={(e) => setPassword(e.target.value)}
									className="w-full pl-10 pr-10 h-12 rounded-t-[6px] focus:outline-none transition-all"
									style={{
										background: '#D5DAE3',
										borderBottom: '2px solid transparent',
										color: '#191C1E',
										fontSize: 14,
									}}
									placeholder="••••••••"
								/>
								<button
									type="button"
									onClick={() => setShowPass(!showPass)}
									className="absolute right-3 top-1/2 -translate-y-1/2"
								>
									{showPass ? (
										<EyeOff
											className="w-4 h-4"
											style={{ color: 'rgba(25,28,30,0.4)' }}
										/>
									) : (
										<Eye
											className="w-4 h-4"
											style={{ color: 'rgba(25,28,30,0.4)' }}
										/>
									)}
								</button>
							</div>
						</div>

						<div className="flex items-center justify-between pt-2">
							<label className="flex items-center gap-2 cursor-pointer">
								<input
									type="checkbox"
									className="w-4 h-4 rounded border-gray-300"
									style={{ accentColor: '#1A6EC4' }}
								/>
								<span style={{ fontSize: 13, color: 'rgba(25,28,30,0.8)' }}>
									Remember me
								</span>
							</label>
							<a
								href="#"
								style={{
									fontSize: 13,
									color: '#1A6EC4',
									fontWeight: 500,
									textDecoration: 'none',
								}}
							>
								Forgot Password?
							</a>
						</div>

						<button
							type="submit"
							disabled={loading}
							className="w-full h-12 text-white rounded-[6px] transition-all flex items-center justify-center gap-2 mt-6"
							style={{
								background: loading
									? '#9ECAE9'
									: 'linear-gradient(135deg, #1A6EC4 0%, #00559F 100%)',
								fontWeight: 600,
								letterSpacing: '0.05em',
							}}
						>
							{loading ? 'SIGNING IN...' : 'SIGN IN'}
						</button>
					</form>
					<div className="text-center mt-6">
						<p style={{ fontSize: 13, color: '#191C1E' }}>
							Need a workplace?{' '}
							<button
								onClick={() => router.push('/register')}
								className="text-blue-600 hover:underline font-medium"
							>
								Register new Workspace
							</button>
						</p>
					</div>
				</div>

				<div className="text-center mt-8">
					<p style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>
						&copy; 2026 LogiSync. All rights reserved.
					</p>
				</div>
			</div>
		</div>
	);
}
