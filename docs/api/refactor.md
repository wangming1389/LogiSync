# LogiSync API Refactor Plan

This plan keeps the current API root structure intact while reorganizing internal
module folders in small, verifiable commits. The guiding rule is simple: do not
mix folder moves with behavior changes unless the phase explicitly requires it.

## Scope

Keep these locations stable:

- `src/app.*`
- `src/main.ts`
- `src/drizzle`
- `src/infrastructure`

Apply the standard folder layout only inside feature/core domains such as:

- `src/core/audit`
- `src/core/health`
- `src/modules/order`
- `src/modules/catalog/product`

## Standard Domain Layout

Use only the folders that a domain actually needs:

- `controllers/`
- `services/`
- `repositories/`
- `dtos/`
- `enums/`
- `constants/`
- `interceptors/`
- `workers/`

Keep each Nest module file at the domain root, for example
`src/core/health/health.module.ts`.

Example target for `src/core/audit`:

```text
src/core/audit/
|-- controllers/
|   `-- audit-log.controller.ts
|-- services/
|   |-- audit-log-query.service.ts
|   `-- audit-logger.service.ts
|-- dtos/
|   `-- audit-log-query.dto.ts
|-- interceptors/
|   |-- audit.interceptor.ts
|   `-- audit.interceptor.spec.ts
|-- enums/
|   `-- audit.enums.ts
|-- audit.schema.ts
`-- audit.module.ts
```

Example target for `src/core/health`:

```text
src/core/health/
|-- controllers/
|   |-- health.controller.ts
|   `-- health.controller.spec.ts
|-- services/
|   |-- health-check.service.ts
|   `-- health-check.service.spec.ts
|-- dtos/
|   `-- health.dto.ts
`-- health.module.ts
```

## Guardrails

### Circular Dependencies

The API already has Nest circular dependencies around IAM and Security. During
folder moves:

- Avoid adding barrel `index.ts` files inside `src/core` or `src/modules`.
- Prefer explicit imports from concrete files.
- Do not centralize shared enums/constants until structural moves are stable.
- Keep existing `forwardRef()` usage, but do not add new `forwardRef()` unless a
  real module cycle appears.

### BaseRepository and `isActive`

Do not implement generic `isActive` filtering during folder reorganization.
Drizzle table types are schema-specific, so a central helper must first prove
that the provided table has an `isActive` column.

When this phase starts, design one of these explicitly:

- A constrained table type for repositories that support soft-delete.
- A per-repository helper that calls shared utilities only with known columns.
- A small base class/mixin for active-record-style tables only.

### CLS Unit of Work

`nestjs-cls` is already mounted globally, but transactions are still passed
manually in many services and repositories. Moving to CLS-managed transactions is
a behavior change and must be isolated from structural commits.

The future Unit of Work phase should:

- Store the active transaction in CLS inside a dedicated transaction helper.
- Make `BaseRepository.db` return the CLS transaction when present.
- Keep manual `tx` support temporarily during migration.
- Add tests that prove nested repository calls share the same transaction.

### Jest and Path Mapping

The API currently relies mostly on relative imports and Jest only has a custom
mapper for `uuid`. If path aliases are introduced:

- Add `baseUrl` and `paths` to `apps/api/tsconfig.json`.
- Mirror aliases in the Jest config inside `apps/api/package.json`.
- Mirror aliases in `apps/api/test/jest-e2e.json`.
- Run unit tests and e2e tests after the alias change.

## Execution Roadmap

Commit after every phase. Each commit must build and test before continuing.

1. **Documentation and guardrails**
   - Fix this plan.
   - Record risks and verification commands.

2. **Bulk Core Service Reorganization**
   - Simultaneously migrate `src/core/health` and `src/core/audit` into the new layout.
   - Keep audit-specific enums local to the audit module to limit ripple effects across other modules.

3. **Infrastructure helpers**
   - Add pagination helpers.
   - Add health registry if still needed after reviewing current health service.
   - Do not change transaction behavior in this commit.

4. **Bulk Functional Module Reorganization**
   - Migrate all domain modules (`media`, `master-data`, `catalog`, `order`, `sourcing`, etc) at once.
   - Ensure that all associated unit test specs (\*.spec.ts) are moved into the corresponding folders (services/, controllers/, etc.) to maintain colocation integrity.

5. **Unit of Work with CLS**
   - Refactor transaction handling separately.
   - Keep compatibility with existing manual `tx` arguments until all callers are
     migrated.

6. **Order module critical fix**
   - Extract pure state-transition logic.
   - Move large export/rendering work to background processing and object
     storage.
   - Apply strategy pattern only where it reduces real branching complexity.

7. **Auth security and global filters**
   - Add rate limiting.
   - Review global filters/guards/interceptors.
   - Keep security changes isolated from folder moves.

## Verification Commands

Run these before each commit:

```powershell
pnpm --filter @logisync/api build
pnpm --filter @logisync/api test -- --runInBand
```

Run these when the phase touches API routes, auth, database setup, or app wiring:

```powershell
pnpm test:api
pnpm test:api:e2e
pnpm lint:api
```

## Commit Policy

- Commit 1: documentation only.
- Structural commits: move files and update imports only.
- Behavioral commits: change runtime behavior only.
- Never combine path alias changes with a large domain move.
- Never combine CLS transaction changes with module reorganization.
