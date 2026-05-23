'use client';

import {
	Activity,
	AlertTriangle,
	BarChart2,
	Bell,
	Building2,
	ChevronRight,
	ClipboardList,
	Clock,
	Database,
	DollarSign,
	FileText,
	Layers,
	LayoutDashboard,
	LogOut,
	MapPin,
	Menu,
	MessageSquare,
	Navigation,
	Package,
	Receipt,
	Search,
	Settings,
	ShieldCheck,
	ShoppingCart,
	Star,
	Truck,
	User,
	Users,
	X,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import {
	clearAuthSession,
	getStoredAccessToken,
	isAllowedPathForClaims,
	parseJwtClaims,
	resolveAuthDestination,
} from '@/lib/auth';

const NAV_CONFIG: Record<
	string,
	{
		label: string;
		items: { label: string; path: string; icon: React.ReactNode }[];
	}
> = {
	platform_admin: {
		label: 'Platform Admin',
		items: [
			{
				label: 'System Health',
				path: '/platform-admin',
				icon: <Activity className="w-5 h-5" />,
			},
			{
				label: 'Workspace Approvals',
				path: '/platform-admin/workspaces',
				icon: <ClipboardList className="w-5 h-5" />,
			},
			{
				label: 'Workspace Mgmt',
				path: '/platform-admin/workspace-mgmt',
				icon: <Building2 className="w-5 h-5" />,
			},
			{
				label: 'Audit Log',
				path: '/platform-admin/audit-log',
				icon: <ShieldCheck className="w-5 h-5" />,
			},
			// { label: 'Data Catalog',         path: '/platform-admin/data-catalog', icon: <Database className="w-5 h-5" /> },
			// { label: 'Dispute Management',   path: '/platform-admin/disputes',   icon: <AlertTriangle className="w-5 h-5" /> },
			// { label: 'Reputation Scores',    path: '/platform-admin/reputation', icon: <Star className="w-5 h-5" /> },
		],
	},
	supplier: {
		label: 'Supplier',
		items: [
			{
				label: 'Catalog Management',
				path: '/supplier/catalog',
				icon: <Package className="w-5 h-5" />,
			},
			// { label: 'Order Management',   path: '/supplier/orders',     icon: <ClipboardList className="w-5 h-5" /> },
			{
				label: 'Negotiation',
				path: '/supplier/negotiation',
				icon: <MessageSquare className="w-5 h-5" />,
			},
			{
				label: 'RFQ',
				path: '/supplier/rfq',
				icon: <FileText className="w-5 h-5" />,
			},
			{
            label: 'Orders',                          // ← thêm mới
            path: '/supplier/orders',
            icon: <ClipboardList className="w-5 h-5" />,
        	},
			// {
			// 	label: 'Pricing & Credit',
			// 	path: '/supplier/pricing',
			// 	icon: <DollarSign className="w-5 h-5" />,
			// },
			// {
			// 	label: 'Finance',
			// 	path: '/supplier/finance',
			// 	icon: <Receipt className="w-5 h-5" />,
			// },
		],
	},
	carrier: {
		label: 'Carrier',
		items: [
			// { label: 'Fleet Management',    path: '/carrier/fleet',    icon: <Truck className="w-5 h-5" /> },
			// { label: 'Driver Management',   path: '/carrier/drivers',  icon: <Users className="w-5 h-5" /> },
			{
				label: 'Dispatch',
				path: '/carrier/dispatch',
				icon: <Navigation className="w-5 h-5" />,
			},
			{
				label: 'ePOD & Incidents',
				path: '/carrier/epod',
				icon: <AlertTriangle className="w-5 h-5" />,
			},
			{
				label: 'Finance',
				path: '/carrier/finance',
				icon: <DollarSign className="w-5 h-5" />,
			},
		],
	},
	buyer: {
    label: 'Buyer/Shipper',
    items: [
        {
            label: 'Sourcing/Procurement',
            path: '/buyer/sourcing',
            icon: <ShoppingCart className="w-5 h-5" />,
        },
        {
            label: 'Negotiation',
            path: '/buyer/negotiation',
            icon: <MessageSquare className="w-5 h-5" />,
        },
        {
            label: 'Orders Tracking',
            path: '/buyer/orders',
            icon: <MapPin className="w-5 h-5" />,
        },
    ],
},
	hr: {
		label: 'HR Team',
		items: [
			{
				label: 'Employee Mgmt',
				path: '/hr/management',
				icon: <Users className="w-5 h-5" />,
			},
		],
	},
	company_admin: {
		label: 'Company Admin',
		items: [
			{
				label: 'Workspace Dashboard',
				path: '/company-admin/workspace',
				icon: <Activity className="w-5 h-5" />,
			},
			{
				label: 'User Roles',
				path: '/company-admin/users',
				icon: <Users className="w-5 h-5" />,
			},
		],
	},
};

export default function AppLayout({
	children,
	currentRole,
}: {
	children: React.ReactNode;
	currentRole: string;
}) {
	const pathname = usePathname();
	const router = useRouter();

	const [userDropdown, setUserDropdown] = useState(false);
	const [authReady, setAuthReady] = useState(false);

	const navConfig = NAV_CONFIG[currentRole] || NAV_CONFIG['platform_admin'];

	useEffect(() => {
		const token = getStoredAccessToken();
		const claims = token ? parseJwtClaims(token) : null;

		if (!token || !claims) {
			clearAuthSession();
			router.replace('/login');
			return;
		}

		if (!isAllowedPathForClaims(pathname ?? '', claims)) {
			router.replace(resolveAuthDestination(claims) ?? '/login');
			return;
		}

		setAuthReady(true);
	}, [pathname, router]);

	const handleLogout = async () => {
		try {
			await api.post('/auth/logout', {});
		} catch {
			// Local session cleanup is still required if the server session is gone.
		}
		clearAuthSession();
		router.replace('/login');
	};

	if (!authReady) {
		return (
			<div
				className="min-h-screen flex items-center justify-center text-sm"
				style={{ background: '#F7F9FC', color: 'rgba(25,28,30,0.65)' }}
			>
				Checking session...
			</div>
		);
	}

	return (
		<div
			className="flex h-screen overflow-hidden"
			style={{ background: '#F7F9FC' }}
		>
			<aside
				className="w-60 flex flex-col shrink-0 relative z-20"
				style={{ background: '#0F4C8A' }}
			>
				<div className="flex items-center gap-3 px-5 h-16 shrink-0">
					<div
						className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
						style={{ background: 'rgba(255,255,255,0.18)' }}
					>
						<Building2 className="w-5 h-5 text-white" />
					</div>
					<span
						className="text-white tracking-wide"
						style={{ fontWeight: 600 }}
					>
						LogiSync
					</span>
				</div>

				<div className="px-3 pb-3">
					<div
						className="w-full flex items-center px-3 py-2 rounded-lg"
						style={{ background: 'rgba(255,255,255,0.10)' }}
					>
						<div className="flex items-center gap-2 flex-1">
							<div className="w-2 h-2 rounded-full bg-white/70" />
							<span className="text-white/90" style={{ fontSize: 13 }}>
								{navConfig.label}
							</span>
						</div>
					</div>
				</div>

				<nav className="flex-1 overflow-y-auto px-3 space-y-0.5 pb-3">
					{navConfig.items.map((item) => {
						const isActive =
							pathname === item.path || pathname?.startsWith(item.path + '/');
						return (
							<Link
								key={item.path}
								href={item.path}
								className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors relative ${isActive ? 'text-white bg-white/10' : 'text-white/60 hover:bg-white/5 hover:text-white/90'}`}
							>
								{isActive && (
									<span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 bg-white rounded-r-full" />
								)}
								<span className="ml-0.5">{item.icon}</span>
								<span style={{ fontWeight: 500 }}>{item.label}</span>
							</Link>
						);
					})}
				</nav>
			</aside>

			<div className="flex-1 flex flex-col min-w-0">
				<header
					className="h-16 shrink-0 bg-white flex items-center justify-between px-6 z-10"
					style={{ borderBottom: '1px solid #E0E4EB' }}
				>
					<div
						className="flex items-center text-sm"
						style={{ color: '#191C1E' }}
					>
						<span style={{ color: 'rgba(25,28,30,0.5)' }}>Dashboard</span>
						<ChevronRight className="w-4 h-4 mx-2 text-gray-400" />
						<span style={{ fontWeight: 500 }}>
							{navConfig.items.find(
								(i) =>
									i.path === pathname || pathname?.startsWith(i.path + '/'),
							)?.label || 'Overview'}
						</span>
					</div>

					<div className="flex items-center gap-4">
						<button
							onClick={() => router.push(`/${currentRole}/messages`)}
							className="relative w-10 h-10 rounded-full flex items-center justify-center transition-colors hover:bg-gray-100"
						>
							<MessageSquare className="w-5 h-5 text-gray-600" />
						</button>
						<button
							onClick={() => router.push(`/${currentRole}/notifications`)}
							className="relative w-10 h-10 rounded-full flex items-center justify-center transition-colors hover:bg-gray-100"
						>
							<Bell className="w-5 h-5 text-gray-600" />
						</button>
						<button
							type="button"
							onClick={handleLogout}
							aria-label="Sign out"
							title="Sign out"
							className="relative w-10 h-10 rounded-full flex items-center justify-center transition-colors hover:bg-red-50"
						>
							<LogOut className="w-5 h-5 text-red-600" />
						</button>
						<div className="w-px h-6 bg-gray-200" />

						<div className="relative">
							<button
								type="button"
								aria-label="Open user menu"
								className="flex items-center gap-3 cursor-pointer"
								onClick={() => setUserDropdown(!userDropdown)}
							>
								<div className="text-right hidden sm:block">
									<div className="text-sm font-medium text-gray-900">
										Admin User
									</div>
									<div className="text-xs text-gray-500 capitalize">
										{currentRole.replace('_', ' ')}
									</div>
								</div>
								<div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold">
									A
								</div>
							</button>

							{userDropdown && (
								<div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-30">
									<button
										onClick={() => {
											setUserDropdown(false);
											router.push(`/${currentRole}/profile`);
										}}
										className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
									>
										<User className="w-4 h-4" /> Manage Profile
									</button>
									<button
										onClick={() => {
											setUserDropdown(false);
											router.push(`/${currentRole}/settings`);
										}}
										className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
									>
										<Settings className="w-4 h-4" /> Settings
									</button>
									<div className="h-px bg-gray-100 my-1" />
									<button
										onClick={handleLogout}
										className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
									>
										<LogOut className="w-4 h-4" /> Sign out
									</button>
								</div>
							)}
						</div>
					</div>
				</header>

				<main className="flex-1 overflow-auto p-6 relative">{children}</main>
			</div>
		</div>
	);
}
