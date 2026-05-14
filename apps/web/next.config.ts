import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
	reactCompiler: true,
	env: {
		NEXT_PUBLIC_API_BASE_URL: 'http://localhost:9751',
		NEXT_PUBLIC_WS_URL: 'ws://localhost:9751',
		NEXT_PUBLIC_SIGNED_URL_TTL_SECONDS: '3600',
		NEXT_PUBLIC_SESSION_IDLE_MINUTES: '30',
		NEXT_PUBLIC_SESSION_GRACE_MINUTES: '5',
		NEXT_PUBLIC_UPLOAD_MAX_MB: '10',
	},
};

export default nextConfig;
