# @logisync/web

Next.js App Router frontend for LogiSync. The app serves the buyer,
supplier, carrier, HR, company-admin, and platform-admin dashboards from
one multi-tenant codebase.

## Quick Start

```bash
pnpm install
pnpm --filter @logisync/web dev
```

Open <http://localhost:3000>. The web app expects the API at
`http://localhost:9751` unless `NEXT_PUBLIC_API_BASE_URL` is set.

## Project Layout

```txt
apps/web
├── src/app/                  Next.js App Router routes
├── src/app/**/components/    Client components for interactive screens
├── src/components/providers/ React Query provider
├── src/lib/                  API, auth, date, and store helpers
├── src/schemas/              Zod schemas and shared frontend types
├── src/services/api/         Repository functions that know endpoints
├── src/services/queries/     React Query read hooks
├── src/services/mutations/   React Query mutation hooks
└── src/proxy.ts              Cookie-based route guard for protected routes
```

## Runtime Patterns

- Pages should stay Server Components when possible.
- Interactive logic lives in sibling `components/*Client.tsx` files.
- Components use React Query hooks for remote data, not raw `fetch`.
- Auth uses cookie helpers in `src/lib/auth.ts`; UI does not read or write
  auth tokens directly.
- Persisted client state uses Zustand `persist` stores.
- Important form/API shapes live in Zod schemas under `src/schemas`.

## Verification

```bash
pnpm --filter @logisync/web lint
pnpm --filter @logisync/web build
```
