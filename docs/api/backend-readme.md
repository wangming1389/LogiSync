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

## 5. Roles & Permissions Matrix

The system enforces strict Role-Based Access Control (RBAC) across all modules using the `@Roles()` decorator.

| Role | Scope | Applicable Modules & Functions |
| :--- | :--- | :--- |
| **`platform_admin`** | System | **Master Data**: Full control over UOMs, Global Categories.<br>**IAM**: Approve/Suspend Workspaces, System Audit Logs. |
| **`company_admin`** | Tenant | **IAM**: Manage own workspace, users, and roles.<br>**All Modules**: Full read/write access to all domain data within their tenant. |
| **`buyer_manager`** | Tenant | **Order**: Approve POs, View all orders.<br>**Sourcing**: Manage RFQs, Select winning Quotations.<br>**Catalog**: Search products. |
| **`buyer_staff`** | Tenant | **Order**: Draft POs, View assigned orders.<br>**Sourcing**: Create RFQs.<br>**Catalog**: Search products. |
| **`supplier_manager`** | Tenant | **Catalog**: Full control over Supplier Catalog & Products.<br>**Sourcing**: Submit Quotations.<br>**Order**: Process and Confirm all assigned Orders. |
| **`supplier_staff`** | Tenant | **Catalog**: Add/Edit Products.<br>**Sourcing**: Draft Quotations.<br>**Order**: Process assigned Orders. |
| **`supplier_accountant`** | Tenant | *(Planned)* Invoicing and payment reconciliation. |
| **`carrier_dispatcher`** | Tenant | *(Planned)* Shipment dispatching and logistics. |
| **`driver`** | Logistics | *(Planned)* Delivery execution and proof of delivery. |
| **`hr_manager`** | Tenant | *(Planned)* Employee management. |

## 6. Design Patterns Applied

The project leverages several established software design patterns to maintain clean, scalable, and testable code:

| Pattern | Where it is used | Purpose & Implementation |
| :--- | :--- | :--- |
| **Strict Repository Pattern** | `src/modules/**/repositories/` | Encapsulates all Drizzle ORM database queries. Enforces multi-tenant isolation by automatically injecting `workspaceId` into queries via `BaseRepository`. |
| **Strategy Pattern** | `src/modules/iam/auth/strategies/` | Used via Passport.js (`JwtStrategy`) to decouple the authentication mechanism from the core business logic. Allows easy swapping or adding of new auth methods (e.g., OAuth). |
| **Registry Pattern** | `src/core/health/` | `HealthRegistryService` dynamically registers and executes various system health checks (Postgres, Redis, MinIO) without tightly coupling the controller to the individual check implementations. |
| **Decorator Pattern** | Global (NestJS) | Extensively used for declarative routing (`@Get()`), input validation (Zod DTOs), and RBAC security (`@Roles()`), keeping business logic clean of boilerplate infrastructure code. |
| **Unit of Work (Implicit)** | `src/core/database/` | Utilizes `nestjs-cls` (Continuation Local Storage) to propagate active database transactions across service boundaries, ensuring atomic operations without deep prop-drilling. |

## 7. System Components

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

#### Infrastructure Test Cases Mapping
| ID | Test Scenario | Expected Result |
| :--- | :--- | :--- |
| **TC-INFRA-01** | Active CLS Transaction Priority | Repository uses the active CLS transaction before the root database. |
| **TC-INFRA-02** | Root Database Fallback | Repository falls back to the root database without an active transaction. |
| **TC-INFRA-03** | Nested Unit-of-Work CLS | Database service reuses the active CLS transaction for nested unit-of-work calls. |
| **TC-INFRA-04** | Unbound Transaction CLS Creation | Database service creates a CLS context when a transaction starts outside one. |

### Deployment
- **Containerization**: Multi-stage Docker builds using `Dockerfile.api`.
- **Orchestration**: Production-ready `docker-compose.prod.yml` configuration.