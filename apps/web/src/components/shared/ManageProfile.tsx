'use client';
// Mocks
import { Camera, CheckCircle, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { api } from '@/lib/api';
import { clearAuthSession } from '@/lib/auth';

const SHADOW = '0px 8px 24px rgba(15,76,138,0.08)';

const inputStyle = {
	background: '#D5DAE3',
	borderBottom: '2px solid transparent',
	color: '#191C1E',
	fontSize: 14,
};

export function ManageProfile() {
	const router = useRouter();
	const user: any = {
		name: 'Admin User',
		email: 'admin@logisync.com',
		phone: '+1 234 567 8900',
		currentRole: 'platform_admin',
		company: 'LogiSync',
	};
	const [tab, setTab] = useState<'personal' | 'security' | 'notifications'>(
		'personal',
	);
	const [name, setName] = useState(user?.name ?? '');
	const [email, setEmail] = useState(user?.email ?? '');
	const [phone, setPhone] = useState(user?.phone ?? '');
	const [saved, setSaved] = useState(false);
	const [showOtpModal, setShowOtpModal] = useState(false);
	const [newEmail, setNewEmail] = useState('');
	const [otp, setOtp] = useState('');
	const [pwStep, setPwStep] = useState(false);
	const [currentPw, setCurrentPw] = useState('');
	const [newPw, setNewPw] = useState('');
	const [confirmPw, setConfirmPw] = useState('');
	const [pwSaved, setPwSaved] = useState(false);
	const [timeout, setTimeoutVal] = useState('30');

	const TABS = [
		{ key: 'personal' as const, label: 'Personal Info' },
		{ key: 'security' as const, label: 'Security' },
		{ key: 'notifications' as const, label: 'Notifications' },
	];

	function handleSave(e: React.FormEvent) {
		e.preventDefault();
		if (newEmail && newEmail !== email) {
			setShowOtpModal(true);
			return;
		}
		setSaved(true);
		setTimeout(() => setSaved(false), 2000);
	}

	function handleOtpConfirm() {
		setEmail(newEmail);
		setNewEmail('');
		setShowOtpModal(false);
		setSaved(true);
		setTimeout(() => setSaved(false), 2000);
	}

	async function handlePwSave(e: React.FormEvent) {
		e.preventDefault();
		if (newPw !== confirmPw) return;

		try {
			await api.patch('/auth/change-password', {
				currentPassword: currentPw,
				newPassword: newPw,
			});
			setPwSaved(true);
			setPwStep(false);
			setCurrentPw('');
			setNewPw('');
			setConfirmPw('');
			setTimeout(() => {
				clearAuthSession();
				router.push('/login');
			}, 900);
		} catch (error: any) {
			alert(error?.message || 'Failed to change password.');
		}
	}

	return (
		<div className="p-6">
			<div className="max-w-4xl mx-auto">
				<h1 className="mb-6" style={{ color: '#191C1E' }}>
					Manage Profile
				</h1>

				<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
					{/* Avatar Card */}
					<div
						className="rounded-xl p-6 flex flex-col items-center"
						style={{ background: '#FFFFFF', boxShadow: SHADOW }}
					>
						<div className="relative mb-4">
							<div
								className="w-24 h-24 rounded-full flex items-center justify-center text-white"
								style={{
									background:
										'linear-gradient(135deg, #1A6EC4 0%, #00559F 100%)',
									fontSize: 32,
									fontWeight: 700,
								}}
							>
								{user?.name?.[0] ?? 'U'}
							</div>
							<button
								className="absolute bottom-0 right-0 w-8 h-8 rounded-full flex items-center justify-center text-white"
								style={{ background: '#0F4C8A' }}
							>
								<Camera className="w-4 h-4" />
							</button>
						</div>
						<h4 style={{ color: '#191C1E', textAlign: 'center' }}>
							{user?.name}
						</h4>
						<div
							className="mt-2 px-3 py-1 rounded-full"
							style={{
								background: '#D3E4F5',
								color: '#0F4C8A',
								fontSize: 12,
								fontWeight: 500,
							}}
						>
							{(user?.currentRole ?? '').replace('_', ' ').toUpperCase()}
						</div>
						<p
							style={{
								fontSize: 13,
								color: 'rgba(25,28,30,0.55)',
								marginTop: 8,
							}}
						>
							{user?.email}
						</p>
						<p
							style={{
								fontSize: 13,
								color: 'rgba(25,28,30,0.55)',
								marginTop: 2,
							}}
						>
							{user?.company}
						</p>
					</div>

					{/* Tabbed Content */}
					<div className="lg:col-span-2">
						<div
							className="rounded-xl overflow-hidden"
							style={{ background: '#FFFFFF', boxShadow: SHADOW }}
						>
							{/* Tab Bar */}
							<div
								className="flex"
								style={{ borderBottom: '1px solid #E0E4EB' }}
							>
								{TABS.map((t) => (
									<button
										key={t.key}
										onClick={() => setTab(t.key)}
										className="px-5 py-3 transition-all"
										style={{
											borderBottom:
												tab === t.key
													? '2px solid #0F4C8A'
													: '2px solid transparent',
											color: tab === t.key ? '#0F4C8A' : 'rgba(25,28,30,0.55)',
											fontWeight: tab === t.key ? 600 : 400,
											fontSize: 14,
										}}
									>
										{t.label}
									</button>
								))}
							</div>

							{/* Personal Info */}
							{tab === 'personal' && (
								<form onSubmit={handleSave} className="p-6 space-y-4">
									{saved && (
										<div
											className="flex items-center gap-2 p-3 rounded-lg"
											style={{
												background: '#C8F0D8',
												fontSize: 13,
												color: '#1B6B3A',
											}}
										>
											<CheckCircle className="w-4 h-4" /> Changes saved
											successfully.
										</div>
									)}
									<div className="grid grid-cols-2 gap-4">
										<div>
											<label
												className="block mb-1"
												style={{
													fontSize: 11,
													fontWeight: 500,
													letterSpacing: '0.05em',
													textTransform: 'uppercase',
													color: 'rgba(25,28,30,0.6)',
												}}
											>
												FULL NAME
											</label>
											<input
												value={name}
												onChange={(e) => setName(e.target.value)}
												className="w-full px-3 h-10 rounded-t-[6px] focus:outline-none"
												style={inputStyle}
												onFocus={(e) => {
													e.target.style.borderBottomColor = '#00559F';
												}}
												onBlur={(e) => {
													e.target.style.borderBottomColor = 'transparent';
												}}
											/>
										</div>
										<div>
											<label
												className="block mb-1"
												style={{
													fontSize: 11,
													fontWeight: 500,
													letterSpacing: '0.05em',
													textTransform: 'uppercase',
													color: 'rgba(25,28,30,0.6)',
												}}
											>
												PHONE
											</label>
											<input
												value={phone}
												onChange={(e) => setPhone(e.target.value)}
												className="w-full px-3 h-10 rounded-t-[6px] focus:outline-none"
												style={inputStyle}
												onFocus={(e) => {
													e.target.style.borderBottomColor = '#00559F';
												}}
												onBlur={(e) => {
													e.target.style.borderBottomColor = 'transparent';
												}}
											/>
										</div>
									</div>
									<div>
										<label
											className="block mb-1"
											style={{
												fontSize: 11,
												fontWeight: 500,
												letterSpacing: '0.05em',
												textTransform: 'uppercase',
												color: 'rgba(25,28,30,0.6)',
											}}
										>
											EMAIL ADDRESS (OTP REQUIRED TO CHANGE)
										</label>
										<input
											value={email}
											onChange={(e) => setEmail(e.target.value)}
											type="email"
											className="w-full px-3 h-10 rounded-t-[6px] focus:outline-none"
											style={inputStyle}
											onFocus={(e) => {
												e.target.style.borderBottomColor = '#00559F';
											}}
											onBlur={(e) => {
												e.target.style.borderBottomColor = 'transparent';
											}}
										/>
										<p
											style={{
												fontSize: 11,
												color: 'rgba(25,28,30,0.4)',
												marginTop: 4,
											}}
										>
											Enter a new email to trigger OTP verification.
										</p>
									</div>
									<div className="pt-2 flex justify-end">
										<button
											type="submit"
											className="px-6 py-2.5 text-white rounded-[6px] transition-all hover:brightness-105"
											style={{
												background:
													'linear-gradient(135deg, #1A6EC4 0%, #00559F 100%)',
												fontWeight: 600,
												fontSize: 12,
												letterSpacing: '0.06em',
											}}
										>
											SAVE CHANGES
										</button>
									</div>
								</form>
							)}

							{/* Security */}
							{tab === 'security' && (
								<div className="p-6">
									{pwSaved && (
										<div
											className="flex items-center gap-2 p-3 rounded-lg mb-4"
											style={{
												background: '#C8F0D8',
												fontSize: 13,
												color: '#1B6B3A',
											}}
										>
											<CheckCircle className="w-4 h-4" /> Password updated
											successfully. You will be signed out on other devices.
										</div>
									)}
									<h4 className="mb-4" style={{ color: '#191C1E' }}>
										Change Password
									</h4>
									<form onSubmit={handlePwSave} className="space-y-4">
										{[
											'CURRENT PASSWORD',
											'NEW PASSWORD',
											'CONFIRM NEW PASSWORD',
										].map((lbl, idx) => {
											const vals = [currentPw, newPw, confirmPw];
											const setters = [setCurrentPw, setNewPw, setConfirmPw];
											return (
												<div key={lbl}>
													<label
														className="block mb-1"
														style={{
															fontSize: 11,
															fontWeight: 500,
															letterSpacing: '0.05em',
															textTransform: 'uppercase',
															color: 'rgba(25,28,30,0.6)',
														}}
													>
														{lbl}
													</label>
													<input
														type="password"
														value={vals[idx]}
														onChange={(e) => setters[idx](e.target.value)}
														className="w-full px-3 h-10 rounded-t-[6px] focus:outline-none"
														style={inputStyle}
														onFocus={(e) => {
															e.target.style.borderBottomColor = '#00559F';
														}}
														onBlur={(e) => {
															e.target.style.borderBottomColor = 'transparent';
														}}
													/>
												</div>
											);
										})}
										{newPw && confirmPw && newPw !== confirmPw && (
											<p style={{ fontSize: 12, color: '#BA1A1A' }}>
												Passwords do not match.
											</p>
										)}
										<div className="pt-2">
											<div className="mb-4">
												<label
													className="block mb-1"
													style={{
														fontSize: 11,
														fontWeight: 500,
														letterSpacing: '0.05em',
														textTransform: 'uppercase',
														color: 'rgba(25,28,30,0.6)',
													}}
												>
													SESSION TIMEOUT (MINUTES)
												</label>
												<input
													type="number"
													value={timeout}
													onChange={(e) => setTimeoutVal(e.target.value)}
													className="w-32 px-3 h-10 rounded-t-[6px] focus:outline-none"
													style={inputStyle}
													onFocus={(e) => {
														e.target.style.borderBottomColor = '#00559F';
													}}
													onBlur={(e) => {
														e.target.style.borderBottomColor = 'transparent';
													}}
												/>
											</div>
											<button
												type="submit"
												disabled={!currentPw || !newPw || newPw !== confirmPw}
												className="px-6 py-2.5 text-white rounded-[6px] transition-all disabled:opacity-40 hover:brightness-105"
												style={{
													background:
														'linear-gradient(135deg, #1A6EC4 0%, #00559F 100%)',
													fontWeight: 600,
													fontSize: 12,
													letterSpacing: '0.06em',
												}}
											>
												UPDATE PASSWORD
											</button>
										</div>
									</form>
								</div>
							)}

							{/* Notifications */}
							{tab === 'notifications' && (
								<div className="p-6 space-y-4">
									<h4 style={{ color: '#191C1E' }}>Notification Preferences</h4>
									{[
										{ key: 'email_orders', label: 'Order updates via Email' },
										{ key: 'email_rfq', label: 'RFQ responses via Email' },
										{ key: 'sms_dispatch', label: 'Dispatch alerts via SMS' },
										{ key: 'inapp_all', label: 'All in-app notifications' },
									].map((pref) => (
										<div
											key={pref.key}
											className="flex items-center justify-between py-3"
											style={{ borderBottom: '1px solid #F2F4F7' }}
										>
											<span style={{ fontSize: 14, color: '#191C1E' }}>
												{pref.label}
											</span>
											<button
												className="w-11 h-6 rounded-full transition-colors relative"
												style={{
													background:
														'linear-gradient(135deg, #1A6EC4 0%, #00559F 100%)',
												}}
											>
												<span className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full" />
											</button>
										</div>
									))}
								</div>
							)}
						</div>
					</div>
				</div>
			</div>

			{/* OTP Modal */}
			{showOtpModal && (
				<div
					className="fixed inset-0 flex items-center justify-center z-50"
					style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }}
				>
					<div
						className="rounded-xl p-6 w-full max-w-sm"
						style={{
							background: 'rgba(255,255,255,0.92)',
							backdropFilter: 'blur(20px)',
							boxShadow: SHADOW,
						}}
					>
						<div className="flex items-center justify-between mb-4">
							<h3 style={{ color: '#191C1E' }}>Verify Email Change</h3>
							<button onClick={() => setShowOtpModal(false)}>
								<X
									className="w-5 h-5"
									style={{ color: 'rgba(25,28,30,0.4)' }}
								/>
							</button>
						</div>
						<p
							className="mb-4"
							style={{ fontSize: 14, color: 'rgba(25,28,30,0.6)' }}
						>
							Enter the 6-digit OTP sent to your current email to confirm this
							change.
						</p>
						<label
							className="block mb-1"
							style={{
								fontSize: 11,
								fontWeight: 500,
								letterSpacing: '0.05em',
								textTransform: 'uppercase',
								color: 'rgba(25,28,30,0.6)',
							}}
						>
							OTP CODE
						</label>
						<input
							value={otp}
							onChange={(e) => setOtp(e.target.value)}
							maxLength={6}
							className="w-full px-3 h-10 rounded-t-[6px] font-mono focus:outline-none mb-4"
							style={{
								background: '#D5DAE3',
								borderBottom: '2px solid #00559F',
								color: '#191C1E',
								fontSize: 18,
								letterSpacing: '0.2em',
							}}
						/>
						<div className="flex gap-2">
							<button
								onClick={handleOtpConfirm}
								disabled={otp.length < 6}
								className="flex-1 py-2.5 text-white rounded-[6px] disabled:opacity-40 transition-all hover:brightness-105"
								style={{
									background:
										'linear-gradient(135deg, #1A6EC4 0%, #00559F 100%)',
									fontWeight: 600,
									fontSize: 13,
								}}
							>
								Confirm
							</button>
							<button
								onClick={() => setShowOtpModal(false)}
								className="flex-1 py-2.5 rounded-[6px]"
								style={{
									background: '#D5DAE3',
									color: '#191C1E',
									fontWeight: 500,
									fontSize: 13,
								}}
							>
								Cancel
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
