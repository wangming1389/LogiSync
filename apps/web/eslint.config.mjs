// Flat ESLint config for the Next.js web app.
// Uses the native flat config exports of `eslint-config-next` v16+
// instead of the deprecated `FlatCompat` bridge.
import nextCoreWebVitals from 'eslint-config-next/core-web-vitals';
import nextTypescript from 'eslint-config-next/typescript';

const eslintConfig = [
	{
		ignores: [
			'.next/**',
			'out/**',
			'build/**',
			'dist/**',
			'next-env.d.ts',
			'node_modules/**',
		],
	},
	...nextCoreWebVitals,
	...nextTypescript,
];

export default eslintConfig;
