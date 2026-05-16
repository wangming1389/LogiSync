# LogiSync Backend API

The `apps/api` backend is the operational core of LogiSync, built with **NestJS** following a **Modular Monolith** architecture. This design allows for seamless transition to microservices in the future while maintaining high-speed in-memory communication today.

## Core Objectives
- **Multi-tenancy**: Strict isolation of data at the application and database layers.
- **Security**: Robust authentication, authorization, and tenant protection.
- **Compliance**: Immutable, append-only audit logging (Decree 356/2025).
- **Session Management**: Stateless JWT authentication with real-time Redis backing.
- **Enterprise Ready**: Health monitoring, background workers, and automated backups.

## Architecture Overview

### 1. Modular Monolith
The system is partitioned into domain-specific modules (IAM, Catalog, Order, Sourcing, etc.). Each module encapsulates its own business logic, schema, and controllers, communicating via shared services or event buses.

### 2. Multi-tenancy Isolation
Data isolation is enforced via a **Strict Repository Pattern** combined with `nestjs-cls`. The `workspaceId` is automatically propagated from the JWT context to every database query, preventing cross-tenant leakage.

### 3. Identity & Access Management (IAM)
- **Authentication**: JWT-based with short-lived tokens.
- **Session Registry**: Redis-backed session tracking for real-time invalidation and account lockout.
- **RBAC**: Role-Based Access Control enforced at the controller and service layers.
- **Security**: Bcrypt hashing (cost factor 12) and 15-minute account lockout after 5 failed attempts.

### 4. Audit Logging
- **Immutable**: All critical administrative and financial actions are recorded in an append-only `audit_logs` table.
- **Automatic**: Global interceptors capture request metadata and outcomes.
- **Traceability**: Every log entry includes actor ID, workspace ID, action, IP address, and value diffs.

## System Components

- **[IAM Module](./iam/README.md)**: User auth, workspace management, and security policies.
- **[Catalog Module](./catalog/README.md)**: Product management with SKU uniqueness and price history.
- **[Order Module](./order/README.md)**: PO lifecycle, assignment history, and auto-confirm workers.
- **[Sourcing Module](./sourcing/README.md)**: RFQ, turn-based negotiation, and PO snapshots.
- **[Core Services](./core/README.md)**: Audit logging, health checks, and session registry.

## Operational Features

### Health Monitoring
- Endpoints: `/health`, `/health/ready`, `/health/live`.
- Real-time monitoring of PostgreSQL, Redis, MinIO, and RabbitMQ.
- Automated email alerts on system degradation.

### Background Workers
- **Auto-Confirm**: Automatically settle orders after 48 hours of inactivity.
- **Cleanup**: Daily purge of expired sessions and temporary files.
- **Reputation**: (Planned) Periodic calculation of supplier scores.

### Database Backups
- **Daily Snapshots**: Automated `pg_dump` snapshots uploaded to MinIO.
- **PITR**: WAL archiving enabled for Point-in-Time Recovery.
- **Retention**: Automated cleanup of backups older than 7 days.

## Development & Deployment

### Local Setup
1. **Install dependencies**: `pnpm install`
2. **Infrastructure**: `docker compose up -d`
3. **Database Setup**:
   ```bash
   pnpm --filter @logisync/api db:setup:local
   # Apply Row-Level Security (RLS)
   psql $DATABASE_URL < apps/api/src/database/rls-setup.sql
   ```
4. **Database Replica Setup (Optional)**:
   Ensure your main PostgreSQL and Replica containers are running, then initialize logical replication:
   ```bash
   docker compose up -d --force-recreate postgres
   docker compose up -d postgres_replica
   # On Windows (PowerShell):
   powershell -ExecutionPolicy Bypass -File docker/postgres/setup-audit-log-replica.ps1
   ```
   *Verify Replication*:
   ```bash
   docker exec -it logisync-db-replica psql -U logisync_user -d logisync_db -c "select * from pg_stat_subscription;"
   # Check replicated data
   docker exec -it logisync-db-replica psql -U logisync_user -d logisync_db -c "select count(*) from audit_logs;"
   ```
5. **Run dev server**: `pnpm --filter @logisync/api dev`

### Testing
- **Unit & E2E Tests**: `pnpm --filter @logisync/api test`
- **Security Tests**: Specialized suites for audit logs and tenant isolation.
- **CI/CD**: GitHub Actions pipeline for linting, testing, and Docker builds.

### Deployment
- **Containerization**: Multi-stage Docker builds using `Dockerfile.api`.
- **Orchestration**: Production-ready `docker-compose.prod.yml` configuration.