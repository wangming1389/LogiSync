import type { Metadata } from 'next';
import { Nunito_Sans, Space_Mono, Work_Sans } from 'next/font/google';
import { QueryProvider } from '@/components/providers/QueryProvider';
import './globals.css';

const nunitoSans = Nunito_Sans({
	variable: '--font-nunito-sans',
	subsets: ['latin'],
	weight: ['200', '300', '400', '500', '600', '700', '800', '900'],
});

const workSans = Work_Sans({
	variable: '--font-work-sans',
	subsets: ['latin'],
	weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
});

const spaceMono = Space_Mono({
	variable: '--font-space-mono',
	subsets: ['latin'],
	weight: ['400', '700'],
});

export const metadata: Metadata = {
	title: 'LogiSync',
	description: 'Multi-tenant logistics & sourcing platform.',
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html
			lang="en"
			className={`${nunitoSans.variable} ${workSans.variable} ${spaceMono.variable} h-full antialiased`}
		>
			<body className="min-h-full flex flex-col">
				<QueryProvider>{children}</QueryProvider>
			</body>
		</html>
	);
}
