# LogiSync Web (Next.js)

## Overview

Web frontend for LogiSync managed by the root pnpm workspace and Turbo.

## Prerequisites

- Node.js and pnpm (see root workspace requirements)

## Install dependencies

Run from the repo root so pnpm workspace links are created:

```bash
pnpm install
```

## Environment

Create a local env file from the template:

```bash
copy apps\web\.env.example apps\web\.env.local
```

## Development

From the repo root:

```bash
pnpm dev:web
```

This runs `turbo dev --filter @logisync/web` and starts the Next.js dev server
on http://localhost:3000 by default.

You can also run directly with Turbo:

```bash
pnpm turbo dev --filter @logisync/web
```

## Build

From the repo root:

```bash
pnpm turbo build --filter @logisync/web
```

## Lint

From the repo root:

```bash
pnpm lint
```

## Structure

- `src/app` for routes (Next.js App Router)
- `src/features` for domain modules (Platform, Supplier, Carrier, Buyer, HR, Infrastructure)
- `src/lib` for API and client utilities
- `src/config/env.ts` for runtime env validation
