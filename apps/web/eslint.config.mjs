import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { FlatCompat } from '@eslint/eslintrc';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const compat = new FlatCompat({
	baseDirectory: __dirname,
});

const eslintConfig = [
	// Khai báo các folder cần bỏ qua
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

	// Kế thừa cấu hình của Next.js
	...compat.extends('next/core-web-vitals', 'next/typescript'),

	// Cấu hình riêng cho project (Nếu cần)
	{
		rules: {
			// Ví dụ: "no-unused-vars": "warn"
		},
	},
];

export default eslintConfig;
