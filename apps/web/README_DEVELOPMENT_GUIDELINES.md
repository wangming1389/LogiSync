# Web Development Guidelines

## Server And Client Components

Default to Server Components for `app/**/page.tsx`. Move interaction,
browser APIs, React Query, Zustand, and event handlers into sibling Client
Components under `components/`.

Example:

```txt
app/platform-admin/page.tsx
app/platform-admin/components/PlatformAdminClient.tsx
```

## API Calls

Do not call `fetch` in UI components. Put endpoint-specific code in
`src/services/api/*`, then expose it through React Query hooks in
`src/services/queries/*` or `src/services/mutations/*`.

Allowed low-level `fetch` location:

```txt
src/lib/api.ts
```

## React Query

- Use `useQuery` for reads.
- Use `useMutation` for writes/actions.
- Use stable query keys such as `['platform-admin', 'health']`.
- Prefer `refetchInterval` for polling instead of manual `setInterval`.
- Keep previous data visible while refetching when the UX benefits from it.

## Zustand

Use Zustand for shared or persisted client state. Use `persist` only when
state should survive reloads. Avoid manual `localStorage` reads/writes in UI
components.

## Auth

Auth tokens are managed by `src/lib/auth.ts` using cookies. Components should
call auth helpers or mutations, not directly access token storage.

## Zod

Use schemas under `src/schemas` for important forms and API payloads. Keep the
schema close to the domain, for example:

```txt
src/schemas/auth.ts
src/schemas/health.ts
src/schemas/sourcing.ts
```

## Formatting

Run Biome or the web lint command before handing off changes:

```bash
pnpm --filter @logisync/web lint
```
