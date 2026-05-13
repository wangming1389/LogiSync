import AppLayout from '@/components/layout/AppLayout';

export default function PlatformAdminLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return <AppLayout currentRole="platform_admin">{children}</AppLayout>;
}
