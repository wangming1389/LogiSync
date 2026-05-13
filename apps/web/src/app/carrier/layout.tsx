import AppLayout from '@/components/layout/AppLayout';

export default function Layout({ children }: { children: React.ReactNode }) {
	return <AppLayout currentRole="carrier">{children}</AppLayout>;
}
