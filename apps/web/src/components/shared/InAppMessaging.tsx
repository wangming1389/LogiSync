'use client';
import { Paperclip, Send } from 'lucide-react';
import { useState } from 'react';
import { messages as initialMessages } from '@/app/data/mockData';

const SHADOW = '0px 8px 24px rgba(15,76,138,0.08)';

const contextStyle: Record<string, { bg: string; color: string }> = {
	RFQ: { bg: '#C8F0D8', color: '#1B6B3A' },
	Shipment: { bg: '#FFEFC6', color: '#7A4F00' },
	Order: { bg: '#D3E4F5', color: '#0F4C8A' },
	Dispute: { bg: '#FFDAD6', color: '#BA1A1A' },
};

export function InAppMessaging() {
	const [threads, setThreads] = useState(initialMessages);
	const [selectedId, setSelectedId] = useState(initialMessages[0].id);
	const [newMsg, setNewMsg] = useState('');

	const selected = threads.find((t) => t.id === selectedId)!;

	function sendMessage() {
		if (!newMsg.trim()) return;
		setThreads(
			threads.map((t) =>
				t.id === selectedId
					? {
							...t,
							thread: [
								...t.thread,
								{
									from: 'You',
									avatar: 'Y',
									message: newMsg,
									timestamp: new Date().toLocaleString('vi-VN'),
								},
							],
						}
					: t,
			),
		);
		setNewMsg('');
	}

	return (
		<div className="flex" style={{ height: 'calc(100vh - 64px)' }}>
			{/* Conversation List */}
			<div
				className="w-72 flex flex-col shrink-0"
				style={{ background: '#FFFFFF', borderRight: '1px solid #E0E4EB' }}
			>
				<div
					className="px-4 py-4"
					style={{ borderBottom: '1px solid #E0E4EB' }}
				>
					<h4 style={{ color: '#191C1E' }}>Messages</h4>
					<p
						style={{ fontSize: 12, color: 'rgba(25,28,30,0.5)', marginTop: 2 }}
					>
						In-app transaction messaging
					</p>
				</div>
				<div className="flex-1 overflow-y-auto">
					{threads.map((t) => {
						const s = contextStyle[t.context] ?? {
							bg: '#E0E4EB',
							color: '#191C1E',
						};
						const isActive = selectedId === t.id;
						return (
							<button
								key={t.id}
								onClick={() => setSelectedId(t.id)}
								className="w-full text-left p-4 transition-colors"
								style={{
									background: isActive ? '#F2F4F7' : 'transparent',
									borderLeft: isActive
										? '3px solid #0F4C8A'
										: '3px solid transparent',
									borderBottom: '1px solid #F2F4F7',
								}}
							>
								<div className="flex items-center gap-2 mb-1">
									<span
										className="px-2 py-0.5 rounded-full"
										style={{
											background: s.bg,
											color: s.color,
											fontSize: 11,
											fontWeight: 500,
											letterSpacing: '0.04em',
										}}
									>
										{t.context}: {t.contextId}
									</span>
								</div>
								<p
									style={{
										fontSize: 12,
										color: 'rgba(25,28,30,0.65)',
										marginBottom: 2,
									}}
									className="truncate"
								>
									{t.participants.join(', ')}
								</p>
								<p
									style={{ fontSize: 12, color: 'rgba(25,28,30,0.4)' }}
									className="truncate"
								>
									{t.thread[t.thread.length - 1]?.message}
								</p>
							</button>
						);
					})}
				</div>
			</div>

			{/* Chat Area */}
			<div className="flex-1 flex flex-col" style={{ background: '#F7F9FC' }}>
				{/* Chat Header */}
				<div
					className="px-6 py-4"
					style={{
						background: '#FFFFFF',
						borderBottom: '1px solid #E0E4EB',
						boxShadow: SHADOW,
					}}
				>
					{(() => {
						const s = contextStyle[selected.context] ?? {
							bg: '#E0E4EB',
							color: '#191C1E',
						};
						return (
							<div className="flex items-center gap-3">
								<span
									className="px-3 py-1 rounded-full"
									style={{
										background: s.bg,
										color: s.color,
										fontSize: 11,
										fontWeight: 500,
										letterSpacing: '0.04em',
									}}
								>
									{selected.context}: {selected.contextId}
								</span>
							</div>
						);
					})()}
					<p
						style={{ fontSize: 13, color: 'rgba(25,28,30,0.55)', marginTop: 4 }}
					>
						{selected.participants.join(' · ')}
					</p>
				</div>

				{/* Messages */}
				<div className="flex-1 overflow-y-auto px-6 py-6 space-y-4">
					{selected.thread.map((msg, i) => {
						const isMe = msg.from === 'You';
						return (
							<div
								key={i}
								className={`flex items-end gap-3 ${isMe ? 'flex-row-reverse' : ''}`}
							>
								<div
									className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
									style={{
										background: isMe
											? 'linear-gradient(135deg, #1A6EC4 0%, #00559F 100%)'
											: '#E0E4EB',
										color: isMe ? '#fff' : '#191C1E',
										fontSize: 13,
										fontWeight: 600,
									}}
								>
									{msg.avatar}
								</div>
								<div
									className={`max-w-[65%] flex flex-col ${isMe ? 'items-end' : ''}`}
								>
									<p
										style={{
											fontSize: 11,
											color: 'rgba(25,28,30,0.5)',
											marginBottom: 4,
										}}
									>
										{msg.from}
									</p>
									<div
										className="px-4 py-2.5 rounded-2xl"
										style={{
											background: isMe
												? 'linear-gradient(135deg, #1A6EC4 0%, #00559F 100%)'
												: '#FFFFFF',
											color: isMe ? '#FFFFFF' : '#191C1E',
											fontSize: 14,
											boxShadow: isMe ? 'none' : SHADOW,
											borderRadius: isMe
												? '18px 18px 4px 18px'
												: '18px 18px 18px 4px',
										}}
									>
										{msg.message}
									</div>
									<p
										style={{
											fontSize: 11,
											color: 'rgba(25,28,30,0.4)',
											marginTop: 4,
										}}
									>
										{msg.timestamp}
									</p>
								</div>
							</div>
						);
					})}
				</div>

				{/* Input */}
				<div
					className="px-6 py-4"
					style={{ background: '#FFFFFF', borderTop: '1px solid #E0E4EB' }}
				>
					<div className="flex items-center gap-3">
						<button
							className="text-[rgba(25,28,30,0.4)] hover:text-[rgba(25,28,30,0.7)]"
							title="Attach file"
						>
							<Paperclip className="w-5 h-5" />
						</button>
						<input
							value={newMsg}
							onChange={(e) => setNewMsg(e.target.value)}
							onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
							placeholder="Type a message..."
							className="flex-1 px-4 py-2 rounded-full focus:outline-none"
							style={{
								background: '#F2F4F7',
								color: '#191C1E',
								fontSize: 14,
								border: '1.5px solid transparent',
							}}
							onFocus={(e) => {
								e.target.style.borderColor = '#00559F';
							}}
							onBlur={(e) => {
								e.target.style.borderColor = 'transparent';
							}}
						/>
						<button
							onClick={sendMessage}
							className="w-10 h-10 rounded-full flex items-center justify-center text-white transition-all hover:brightness-110 shrink-0"
							style={{
								background: 'linear-gradient(135deg, #1A6EC4 0%, #00559F 100%)',
							}}
						>
							<Send className="w-4 h-4" />
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}
