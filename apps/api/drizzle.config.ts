import { defineConfig } from 'drizzle-kit';

export default defineConfig({
	schema: './src/database/schema.ts',
	out: './src/drizzle/migrations',
	dialect: 'postgresql',
	dbCredentials: {
		url: process.env.DATABASE_URL || '',
	},
	migrations: {
		table: '__drizzle_migrations__',
		schema: 'public',
	},
	verbose: true,
	strict: true,
});
