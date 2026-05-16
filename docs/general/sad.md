# Software Architecture Document

**Authors:** Pham Ngoc Quang Minh, Ha Nguyen Viet Anh  

---

## Table of Contents

1. [Solution Overview](#1-solution-overview)
2. [Overall Architecture](#2-overall-architecture)
3. [Quality Attribute Requirements](#3-quality-attribute-requirements)
4. [Architectural Representation](#4-architectural-representation)
5. [Security & Scalability](#5-security--scalability)
6. [Data Immutability & Tenant Isolation](#6-data-immutability--tenant-isolation)
7. [Risks and Mitigations](#7-risks-and-mitigations)
8. [Glossary](#8-glossary)

---

## 1. Solution Overview

### 1.1 Solution Objectives

LogiSync is a comprehensive B2B logistics management platform designed to digitize and centralize the entire supply-chain workflow for Vietnamese enterprises. It provides a unified multi-tenant hub connecting Suppliers, Buyers, and Carriers within a single, secure platform environment. Core objectives:

- **Streamline the full order lifecycle** — from RFQ creation and supplier quotation through purchase order approval, carrier selection, dispatch, last-mile delivery confirmation, and financial reconciliation, eliminating fragmented tools across the Vietnamese logistics sector.
- **Enforce legal compliance and data immutability** for all critical business records (confirmed orders, quotations, invoices, e-POD), ensuring traceability aligned with Vietnamese regulations (Decree 10/2020/ND-CP, Law 91/2025).
- **Support real-time fleet tracking and offline-capable driver workflows**, enabling uninterrupted field operations and GPS-based dispute resolution for up to 24 hours without network connectivity.
- **Deliver actionable operational analytics** through KPI dashboards, reputation scoring, and executive reporting.
- **Provide a secure, auditable, multi-tenant environment** with RBAC, append-only audit logs, and strict workspace isolation.

### 1.2 System Scope

**In-Scope:**

- Platform Administration: Workspace onboarding, approval, suspension, revocation; shared master data management; system health dashboards; audit log monitoring
- Identity & Access Management: JWT-based stateless authentication, RBAC at API boundary, account lockout, global session invalidation, multi-tenant RLS
- Supplier Domain: Product catalog and SKU management, RFQ response and multi-round negotiation, PO approval/denial, credit limit governance, 3-way matching, accounts receivable
- Buyer Domain: Product search with reputation ranking, RFQ lifecycle, quotation comparison and selection, carrier selection with credit validation, goods receipt, 3-way matching, payment processing
- Carrier Domain: Fleet and driver profile management, freight rate card versioning, Decree 10/2020-compliant transport order issuance, real-time GPS fleet tracking, offline e-POD collection, freight invoicing with adjustment protocol
- HR Module: Employee lifecycle management, role assignment, KPI target setting, performance tracking with configurable formula weights
- Cross-Cutting Infrastructure: Append-only immutable audit logging, secure private object storage with signed URL access, priority-queue notification dispatch (push < 15s for drivers), background worker pool, reputation scoring engine

**Out-of-Scope:**

- ERP integration or legacy system data migration
- AI-based demand forecasting, route optimization, or intelligent recommendations
- B2C portals, loyalty programs, or public marketplace features
- Direct bank payment API execution (payment intent recorded and matched, not executed via banking APIs in v1.0)

### 1.3 Key Stakeholders

| Stakeholder              | Role               | Primary Concerns                                                |
| ------------------------ | ------------------ | --------------------------------------------------------------- |
| Platform Admin           | LogiSync Operator  | System health, regulatory compliance, tenant dispute mediation  |
| Company Admin            | Workspace Owner    | Onboarding, role configuration, workspace lifecycle management  |
| Supplier Staff / Manager | Seller             | Catalog management, RFQ responses, order fulfillment, invoicing |
| Buyer Staff / Manager    | Purchaser          | Product sourcing, order tracking, 3-way matching, payment       |
| Carrier Dispatcher       | Logistics Operator | Fleet dispatch, transport order compliance, freight invoicing   |
| Driver                   | Field Operator     | Offline e-POD collection, trip expense submission, GPS tracking |
| HR Manager               | People Operations  | Employee lifecycle, role assignment, KPI management             |
| Chief Accountant         | Finance            | Credit limit governance, 3-way matching, payment execution      |
| Dev Team / Scrum Master  | Delivery           | Architecture compliance, sprint velocity, CI/CD quality gates   |

### 1.4 Business and Technical Context

**Business Context:**

The Vietnamese B2B logistics market operates in a fragmented environment with four critical problems LogiSync addresses:

1. **Lack of digital audit trail:** No tamper-proof record of negotiation rounds, quotation terms, or delivery evidence
2. **Credit and payment opacity:** Supplier credit limits and accounts receivable tracked manually, creating risk of double-spending and delayed reconciliation
3. **Regulatory exposure:** Transport operations must comply with Decree 10/2020/ND-CP and Law 91/2025, both requiring automated system enforcement
4. **Real-time visibility gap:** Buyers and dispatchers lack live GPS-based shipment tracking and proof-of-delivery confirmation

**Technology Stack:**

| Technology Component         | Role in System                                    | Key Rationale                                                                                                                                                                                                     |
| ---------------------------- | ------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| NestJS (Modular Monolith)    | Primary backend framework                         | In-process module communication eliminates network latency; module boundaries are explicitly typed and interface-driven for future microservices extraction; decorator-driven RBAC; < 500ms internal API response |
| Next.js                      | Web frontend for all portal roles                 | SSR provides fast initial page load; internal page-level caching reduces DB load for catalog and search pages                                                                                                     |
| React Native                 | Driver mobile application                         | Single codebase for iOS/Android; supports local offline state machine with encrypted device storage for 24h offline e-POD workflows                                                                               |
| PostgreSQL + TimescaleDB     | Primary relational DB + GPS time-series           | ACID transactions, RLS for tenant isolation, optimistic locking; TimescaleDB adds automatic time-based partitioning for GPS ingestion with 5-year retention                                                       |
| Redis                        | Session store, distributed cache, priority queues | Sub-15s JWT blacklist enforcement; distributed cache for reputation scores and SKU index; message broker for priority notification queues (driver push < 15s)                                                     |
| MinIO (Self-hosted S3)       | Private object storage                            | S3-compatible API (future AWS migration with zero code changes); self-hosted for Vietnamese regulatory data sovereignty; all access via signed URLs (1h TTL)                                                      |
| RabbitMQ (Priority Queues)   | Async message broker                              | Separates high-priority driver dispatch (< 15s) from standard alerts (< 1 min) and low-priority background jobs                                                                                                   |
| Docker Compose (Self-hosted) | Container orchestration                           | Deterministic deployments on Vietnamese VPS infrastructure; Docker bridge network isolates all containers; CI/CD enforces cross-tenant isolation tests on every build                                             |

**Modular Monolith vs. Microservices Decision:**

| Criterion              | Modular Monolith (Chosen)                                         | Microservices (Rejected for v1.0)                                     |
| ---------------------- | ----------------------------------------------------------------- | --------------------------------------------------------------------- |
| Internal latency       | In-process function calls — effectively 0ms overhead              | Network hops add 5–50ms per call, compounds across boundaries         |
| Operational complexity | Single deployment unit, Docker Compose, single log stream         | Service mesh, distributed tracing, health checks per service required |
| Team size fit          | Optimal for 2 engineers with clear module ownership               | Requires dedicated DevOps and per-service CI/CD maturity              |
| Domain boundaries      | TypeScript typed interfaces and NestJS module system              | API contracts and schema registries                                   |
| Future migration       | Module boundaries designed for extraction — migration is additive | Already at destination                                                |

---

## 2. Overall Architecture

### 2.1 Architecture Model

LogiSync adopts a **Modular Monolith** architecture with NestJS. All five domain modules co-deployed as a single process, communicating via in-process typed function calls. Delivers sub-500ms internal API response times while maintaining explicit module boundaries for future microservices decomposition.

**Four horizontal layers:**

1. **Clients Layer:** Role-specific web portals (Next.js SSR) and Driver mobile app (React Native, offline-capable)
2. **API Gateway & Security Layer:** Single entry point — JWT validation, RBAC enforcement, rate limiting, tenant isolation middleware — all enforced before any business logic
3. **Core Business Modules Layer:** Five domain modules + cross-cutting services (Notification, Background Worker Pool, Audit Logger, GPS Ingestion Pipeline, Reputation Engine)
4. **Persistence Layer:** PostgreSQL + TimescaleDB, Redis, MinIO

### 2.2 Main Components and Relationships

| Module / Component      | Core Responsibility                                                           | Key External Interactions                                               |
| ----------------------- | ----------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| Workspace / IAM         | User auth, RBAC, tenant isolation, workspace lifecycle, session management    | All modules (auth context), Redis (session blacklist, cache)            |
| Sourcing & Order        | RFQ lifecycle, multi-round negotiation, quotation locking, PO generation      | Finance (credit check), Notification Service, Audit Logger              |
| Dispatch & Fleet        | Vehicle/driver management, Decree 10/2020-compliant transport order issuance  | GPS Ingestion, Notification (push < 15s), Audit Logger                  |
| Delivery & e-POD        | 4-step linear e-POD workflow, offline sync, geofence check-in validation      | MinIO (file storage), Notification, Sourcing (order lock), Audit Logger |
| Finance & Credit Ledger | 3-way matching, credit restoration, payment matching, freight invoicing       | Sourcing (order reference), Notification, Audit Logger                  |
| Notification Service    | Priority-queue push (FCM/APNs), email (SMTP) dispatch by urgency tier         | All domain modules (event publisher); Redis (priority queues)           |
| Background Worker Pool  | e-POD image compression, PDF report generation, 48h auto-confirm scheduler    | Finance, Delivery, MinIO                                                |
| Audit Logger            | Append-only immutable forensic trail for all state-changing actions           | All domain modules, dedicated DB schema                                 |
| GPS Ingestion Pipeline  | High-throughput GPS ping reception (1 ping/30s/driver) into TimescaleDB       | TimescaleDB, Dispatch module                                            |
| Reputation Engine       | Async background scoring of supplier/carrier reputation after business events | Sourcing, Dispatch, Redis (score cache), Configuration Store            |

### 2.3 Key Architectural Decisions

| Decision ID | Decision Statement                               | Rationale                                                                                                                                                                                                                                          | Trade-off Accepted                                                                                                                                               |
| ----------- | ------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| AD-01       | Modular Monolith over Microservices              | Eliminates inter-service network latency; in-process calls achieve < 500ms API response; reduces operational overhead for current team size; typed-interface contracts enable future extraction                                                    | Single deployment unit requires vertical scaling before horizontal service decomposition; resource isolation between modules is logical, not physical            |
| AD-02       | JWT Stateless Auth + Redis Blacklist             | Stateless tokens eliminate session DB queries on every request; Redis blacklist enforces near-instant revocation (< 15s) for password changes, workspace suspension, and deactivation                                                              | Redis becomes a critical availability dependency; blacklist TTL must be carefully managed; clock skew tolerance of 30s required across nodes                     |
| AD-03       | Database-Level Append-Only Audit Log             | DB triggers unconditionally reject UPDATE/DELETE on audit tables for all users including DBAs; business transactions roll back entirely if audit write fails — eliminates silent non-compliant actions                                             | Higher write amplification; audit writes add up to 50ms overhead per transaction; dedicated storage volume required                                              |
| AD-04       | Row-Level Security (RLS) for Tenant Isolation    | PostgreSQL RLS enforces `workspace_id` filtering at DB engine level independent of application code; defense-in-depth even if application-layer filter is bypassed; automated injection tests block CI/CD on any isolation failure                 | RLS policy management adds complexity to schema migrations; 3–5ms overhead per query; requires disciplined schema design                                         |
| AD-05       | Signed URLs (1h TTL) for All File Access         | MinIO buckets configured as fully private — direct URLs return 403/404; JIT-signed URLs prevent permanent link sharing of sensitive documents; every URL generation logged atomically                                                              | URL generation requires server-side cryptographic signing on every file access; clients must handle URL expiry and request renewal                               |
| AD-06       | Priority Queues for Notification Dispatch        | Three-tier priority: High (driver dispatch push < 15s via pre-authenticated FCM/APNs), Standard (order/workspace alerts < 1 min), Low (reports/auto-confirmations); prevents GPS or report load from blocking safety-critical driver notifications | RabbitMQ operational overhead and monitoring required; queue backlog must be monitored with < 30s alert threshold                                                |
| AD-07       | TimescaleDB for GPS Time-Series                  | PostgreSQL extension — automatic time-based partitioning; optimized append for 1 ping/30s/driver; sub-2s query on 24h route windows across 5 years; append-only for legally defensible route replay                                                | Increased operational complexity due to PostgreSQL extension management; requires custom scheduled jobs for hot/archive retention                                |
| AD-08       | Offline-First e-POD State Machine (React Native) | Drivers operate in areas with zero connectivity; local encrypted state machine tracks 4-step workflow; cryptographic tagging maintains audit integrity for later sync; delta-sync within 5–15s on reconnect                                        | Complex server-side reconciliation for offline sync conflicts; client storage bounded to 200MB; sequence-number-based sync requires careful idempotency handling |

### 2.4 Technical Constraints

- **Regulatory Compliance:** Decree 10/2020/ND-CP requires transport orders to contain mandatory fields (contract info, driver details, vehicle specifications, route). Law 91/2025 requires IP address, acceptance timestamp, and terms version persisted immutably at registration.
- **Technology Stack:** NestJS (backend), Next.js (web frontend), React Native (mobile), PostgreSQL + TimescaleDB, Redis, MinIO, RabbitMQ/Kafka, Docker Compose. No components negotiable without full architectural review.
- **Performance Targets:** >= 95% uptime; MTTR < 2h; RPO < 24h; RTO < 24h. Critical action response 3–5s, product search 2–3s, driver push < 15s, standard notifications < 1 min.
- **Security Baseline:** bcrypt password hashing with salt; JWT stateless tokens with expiration; account lockout after 5 failures for 15 min; global session invalidation on password change; all sensitive documents served exclusively via signed URLs (1h TTL).
- **Spare Capacity:** All services provisioned to sustain 80% peak utilization with 20% spare headroom. Admin alerts triggered at the 80% threshold.
- **Deployment:** Docker Compose on self-hosted bare-metal. All containers communicate via private Docker bridge network. No public-facing database, cache, or storage ports.

### 2.5 Design Principles

- **Security by Design:** RBAC enforced exclusively at the API middleware layer, never at the UI level. UI restrictions are secondary UX hints. Authorization holds even if frontend is bypassed via direct API calls.
- **Immutability by Default:** Finalized business records protected by database-level write locks. Corrections handled exclusively via append-only adjustment records — never by modifying historical data.
- **Atomic Transactions:** Every critical operation involving multiple state changes must succeed entirely or roll back entirely. Partial completion is never permitted.
- **Fail-Fast Consistency:** Business transactions that require an audit log write roll back if the audit write fails. No silent non-compliant actions ever finalized.
- **Offline Resilience:** Driver mobile app must support uninterrupted field operations for at least 24 hours without network connectivity, with zero data loss and automatic delta-sync within 5–15s of reconnection.
- **Tenant-First Data Design:** `workspace_id` is a mandatory, non-nullable column on all tenant-scoped tables, enforced at both application Repository layer and PostgreSQL RLS layer.

---

## 3. Quality Attribute Requirements

> This section provides a condensed summary of each QAR. Full scenario tables are in the ADD document.

### 3.1 Performance

#### 3.1.1 Response Time

**QAR-01: User Authentication & Dashboard Access**

- Login to dashboard: 2–3s. Token blacklisting within 5–15s of password change/deactivation. Sub-second UI feedback.

**QAR-02: Workspace Registration Processing**

- Tax ID validated client-side < 100ms (no network round-trip). Duplicate detection server-side within 1–2s. Record creation < 5s. Compliance fields (IP, timestamp, `accepted_terms_version`) persisted atomically per Law 91/2025. File limits: images <= 5MB, documents <= 10MB.

**QAR-03: Purchase Order Approval / Denial**

- RBAC validates Supplier domain. Atomic state transition + audit record within 4–5s. Append-only status change. Notification enqueued asynchronously. Supplier confirmation within 3–5s; Buyer notification < 1 min.

**QAR-04: Transport Order Issuance & Driver Push Notification**

- Decree 10/2020 mandatory field validation before `Issued` state transition. Atomic DB transaction within 4–5s. Order-Before-Signal pattern. Driver push notification < 15s via high-priority worker pool.

**QAR-05: Product Search with Reputation Ranking**

- Pre-calculated reputation scores from Redis cache (no real-time computation). Results paginated <= 25 items/page. Filtered, ranked results returned within 2–3s. 0% cross-tenant leakage for private entities.

**QAR-06: Payment Receipt Matching & Credit Restoration**

- Single synchronous in-process transaction (no background jobs). Row-level locking prevents double-restoration. Unique `payment_id` idempotency key. Credit limit restored and reflected in UI < 3s.

#### 3.1.2 Throughput

**QAR-07: Peak Load Concurrency & SLA Isolation**

- Dedicated isolated worker pools for GPS ingestion and notification. GPS ingestion sustains 1 ping/30s/driver. 100% of critical order confirmations maintain 3–5s. 100% of driver push notifications < 15s. HTTP 503 rate <= 0.1%.

#### 3.1.3 Latency

**QAR-08: e-POD Offline Synchronization**

- Delta-sync with sequence numbering (exactly-once delivery). Offline data synced within 5–15s of reconnect. 0% data loss for 24h offline window. Local storage bounded <= 200MB/device.

---

### 3.2 Availability

#### 3.2.1 Session & Access Management

**QAR-09: Workspace Suspension & Session Invalidation**

- Admin break-glass access logged before action proceeds. Workspace status updated atomically within 4–5s. All JWTs for target `tenant_id` blacklisted in Redis. Sessions invalidated within 10–30s; token blacklisting across all instances within 5–15s. 0% impact on other tenants.

**QAR-10: Employee Account Deactivation**

- Atomic cascade: account status update + vehicle de-assignment (if Driver) + audit log within 4–5s. Sessions invalidated within 10–30s. Vehicle removed from operational queues within < 5s.

#### 3.2.2 Fault Detection

**QAR-11: System Fault Detection & Alerting**

- Monitoring agent polls health endpoints every 15s on dedicated infrastructure. Admin receives critical failure alert within 1–2 min. Supports MTTR < 2h and >= 95% uptime.

#### 3.2.3 Resilience

**QAR-12: Offline e-POD Collection**

- Local state machine tracks 4-step progress with atomic writes after each step. Captures cryptographically tagged with Driver ID + device timestamp. 0% data loss for up to 24h offline. 100% resume-from-last-step on app crash.

---

### 3.3 Security

#### 3.3.1 Authentication

**QAR-13: Account Lockout & Brute-Force Protection**

- Atomic Redis counter scoped by `tenant_id`. Account locked after exactly 5 failures for exactly 15 min (server-side TTL). 0% client-side bypass.

**QAR-14: Password Change & Global Session Invalidation**

- Atomic bcrypt hash + session generation ID rotation within 4–5s. Global Redis broadcast blacklists all existing tokens. Global invalidation across all instances within 5–15s.

#### 3.3.2 Authorization

**QAR-15: RBAC Enforcement & Role Management**

- All authorization enforced exclusively at API layer via stateless middleware. Company Admin claim required to enable workspace roles; HR Manager claim required to assign employee roles. Role change + audit trail in single atomic transaction. 100% of unauthorized attempts return HTTP 403.

**QAR-16: Driver Privacy & Data Masking**

- Driver real phone number never mapped to Buyer-facing DTOs. Server-side masking at Serialization layer (e.g., `0912345678 → 09*****78`) before payload leaves server. 0% leakage in API payloads or system logs.

#### 3.3.3 Data Protection

**QAR-17: Secure Document Access via Signed URLs**

- All MinIO buckets private — direct URLs return 403/404. JIT-signed URLs with 1h TTL. 0% exposure of direct/public storage URLs. Signed URL generation adds < 200ms; total response < 2s.

#### 3.3.4 Auditing

**QAR-18: Immutable Audit Trail Enforcement**

- DB triggers unconditionally reject UPDATE and DELETE for all users including DBAs. Every entry contains `actor_id`, `ip_address`, `timestamp`, `outcome` as non-nullable fields. Audit record persisted in same atomic transaction as originating event — failure triggers full rollback. Audit write adds <= 50ms overhead.

---

### 3.4 Usability

**QAR-19: Real-Time Duplicate SKU Detection**

- Authoritative server-side validation with mandatory `workspace_id` filter. Inline feedback delivered < 2s. 100% SKU uniqueness enforced at DB level.

**QAR-20: Proximity-Based Delivery Check-in Validation**

- Server-side geofence validation (500m radius) using spatial indexing — anti-GPS-spoofing. Geofence validation < 1s, total driver feedback within 3–5s. 100% of attempts logged with verifiable GPS metadata.

**QAR-21: Strict Linear e-POD Workflow Enforcement**

- Server tracks `current_step` linearly; out-of-sequence requests rejected with HTTP 400. Offline: progress tracked via local encrypted storage; final `Completed` transition held in sync queue until all 4 steps server-verified. 0% successful step skipping.

---

### 3.5 Modifiability

**QAR-22: Global Master Data Synchronization**

- Changes committed to centralized config store → broadcast invalidation via Pub/Sub to all tenant caches. All service instances refresh in-process without restart (hot-swap < 1s). 0 service restarts required. 100% of changes recorded with forensic Old/New diff.

**QAR-23: Temporal Freight Rate Card Management**

- Every update creates new immutable record with `effective_timestamp`; existing entries physically preserved. Confirmed shipments maintain immutable FK to specific rate version ID. Rate lookup <= 50ms; total standard query < 2s.

---

### 3.6 Data Integrity

#### 3.6.1 Consistency

**QAR-24: Automated 3-Way Matching Workflow**

- Matching logic (quantity, unit price, SKU) executed server-side; discrepancy lines explicitly flagged. Dashboard retrieves from Read Replicas (zero write contention). On confirmation: PO, Goods Receipt Note, and Invoice transitioned to Immutable in same transaction. Discrepancy overrides require mandatory text justification. Dashboard loads < 5s.

#### 3.6.2 Immutability

**QAR-25: Quotation Selection & Immutable PO Generation**

- Single atomic transaction: selected quotation → `Locked`, competing quotations → `Rejected`, PO instantiated. PO generated from immutable snapshot of locked quotation pricing. DB-level constraint prevents subsequent UPDATE on locked quotation — HTTP 409 returned. Complex orchestration confirmed < 2s.

---

### 3.7 Scalability

**QAR-26: High-Frequency GPS Ingestion & Long-Term Retention**

- Dedicated append-only TimescaleDB container isolated from main transactional DB. Sustains >= 1 ping/30s/driver with 20% spare capacity. Hot storage 90 days, archival >= 5 years. 24h route window query < 2s.

**QAR-27: Strict Multi-Tenant Isolation**

- Every DB query parameterized with `workspace_id` as mandatory filter at both application (Repository) and DB (RLS) layers. Exception: public product catalogs (`status = 'active'`). Automated cross-tenant injection tests block CI/CD build on any isolation failure. 0 cross-tenant data leaks. Isolation logic adds <= 5ms/query.

---

## 4. Architectural Representation

### 4.1 Logical View

**Level 1: System Context**

LogiSync connects four primary external actor groups — Supplier, Buyer, Carrier, and Platform Admin — through a unified multi-tenant platform, integrating with external gateways: FCM/APNs (push notifications), SMTP (email), and GPS telemetry from driver mobile devices.

**Level 2: Container & Component Architecture**

**Clients Layer:**

- Web Application (Next.js): SSR-powered portals for Supplier, Buyer, Carrier, Admin, and HR roles; role-based dashboard routing; page-level caching for product catalog and search
- Driver Mobile App (React Native): Offline state machine with local encrypted storage (bounded <= 200MB); supports uninterrupted e-POD workflow for up to 24h; automatic delta-sync on reconnect

**API Gateway & Security Layer:**

- API Gateway: Single entry point — request routing, rate limiting, global middleware execution. All requests pass through before any business logic.
- JWT Authenticator: Stateless identity verification via token signature validation against Redis session store — no DB queries for standard requests. Clock skew tolerance 30s.
- RBAC & Tenant Isolation Middleware: Enforces Role-Based Access Control and `workspace_id` scoping at API boundary. UI-level restrictions are secondary UX hints only.

**Core Business Modules:**

- IAM & Workspace Module: Organization onboarding, user lifecycle, RBAC configuration, centralized session revocation via Redis blacklist
- Sourcing & Order Module: Full RFQ-to-PO lifecycle — RFQ creation, supplier response with multi-round negotiation, quotation selection with atomic locking, PO generation. Records immutable after finalization.
- Dispatch & Fleet Module: Vehicle and driver profile management, Decree 10/2020-compliant transport order issuance, real-time fleet status via WebSocket for dispatchers
- Delivery & e-POD Module: 4-step linear delivery workflow (geofence check-in → photo capture → digital signature → final submit), offline data collection, server-side sync, break-glass protocol for Platform Admin e-POD access
- Finance & Credit Ledger Module: Credit limit governance, 3-way matching (PO + Goods Receipt Note + Invoice), payment receipt matching, atomic credit restoration, 48h auto-confirmation scheduler, freight invoice management with adjustment-only correction protocol

**Cross-Cutting & Infrastructure Services:**

- Notification Service: Priority-queue dispatch — High Priority (driver push < 15s via FCM/APNs), Standard Priority (order/workspace/dispute alerts < 1 min)
- Background Worker Pool: e-POD image compression, PDF report generation, 48h auto-confirmation logic, reputation score recalculation — isolated from main API response path
- Audit Logger: Permanent append-only forensic trail of every state-changing action. DB-level triggers reject UPDATE/DELETE.
- GPS Ingestion Pipeline: Dedicated high-throughput container receiving GPS pings into TimescaleDB — isolated from transactional DB
- Reputation Scoring Engine: Async background consumer recalculating supplier and carrier reputation scores. Weights configurable via Configuration Store without code deployment.

### 4.2 Implementation View

**Backend (NestJS Modular Monolith):**

- Domain-driven modules: Finance, Dispatch, Sourcing, Delivery, IAM — each encapsulated as NestJS module with typed service interfaces
- Internal communication via in-memory typed function calls, eliminating network overhead; total internal API response target: < 500ms
- Module boundaries enable extraction of any domain into a standalone microservice with minimal refactoring

**Frontend & Mobile:**

- Next.js: SSR for fast initial load, role-based routing, page-level cache invalidation on relevant data changes
- React Native Driver App: Offline state machine manages 4-step e-POD workflow on-device; local encrypted storage (bounded <= 200MB); sequence-number-based conflict resolution on delta-sync

**Asynchronous Messaging:**

- Message Broker (RabbitMQ/Kafka): Three-tier priority queues — High (driver dispatch push < 15s), Standard (order/workspace/dispute < 1 min), Low (reports/reputation recalc/48h auto-confirms)
- Background Worker Pool: Dedicated workers for e-POD image compression, PDF report generation, scheduled auto-confirmation logic — isolated from main API container

**CI/CD & Automated Quality Gates:**

- GitHub Actions: Cross-tenant injection test suite mandatory on every pull request — builds failing isolation tests blocked from merging
- Static analysis, unit testing, and contract testing: ensures Buyer-facing endpoints never return raw PII or internal storage paths (S3 keys)

### 4.3 Deployment View

Docker Compose on bare-metal server for complete data sovereignty, predictable cost, and zero cloud provider dependency.

| Container                   | Role                                                                            | Key Constraints                                                                     |
| --------------------------- | ------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| Backend API Container       | Synchronous transactional requests — Sourcing, Finance, IAM, Dispatch, Delivery | Internal response target < 500ms; 20% spare capacity headroom                       |
| Background Worker Container | Async tasks — report generation, e-POD image compression, notification dispatch | SLA: driver push < 15s; isolated from main API to prevent resource contention       |
| GPS Ingestion Container     | High-throughput GPS ping reception and TimescaleDB ingestion                    | 1 ping/30s/driver sustained; isolated I/O prevents contention with transactional DB |
| MinIO Container             | Local S3-compatible private object storage                                      | Private buckets only; signed URL serving (1h TTL); data sovereignty                 |

**Persistence & Caching Layer:**

- PostgreSQL + TimescaleDB: Primary relational engine with RLS for tenant isolation; TimescaleDB extension manages GPS time-series with automatic time-based partitioning for >= 5 year retention
- Redis: In-memory session store and distributed cache; workspace suspension enforced globally within 5–30s; priority queuing; reputation score cache for sub-2s product search
- MinIO: Self-hosted S3-compatible within Docker network; all access via signed URLs (1h TTL)

**Networking & Health Management:**

- All containers communicate via private Docker bridge network — no public-facing DB, cache, or storage ports
- Health-check endpoints polled every 15s; resource usage > 80% triggers admin alerts within 1–2 min; MTTR target: < 2h

### 4.4 Data View

**Relational Database (PostgreSQL):**

- Tenant isolation via RLS: `workspace_id` filtering at DB engine level — defense-in-depth independent of application code. Exception: public product catalogs (`status = 'active'`)
- Append-only audit store: DB-level triggers for all critical tables (Finance, Dispatch, Sourcing) — strictly forbids UPDATE or DELETE; forensic retention >= 5 years
- Business record immutability: status-based `is_locked` flag; DB triggers reject UPDATE on locked records regardless of user role
- Optimistic concurrency control: version-based locking for financial entities (credit limits, payment ledger) prevents race conditions

**TimescaleDB (Time-Series):**

- High-frequency GPS ingestion (1 ping/30s per active driver)
- Automatic time-based partitioning: stable query performance across 5-year retention history
- Append-only — UPDATE/DELETE rejected; legally defensible route history
- Tiered lifecycle: 90-day hot storage for instant playback → auto-archive >= 5 years

**MinIO (Object Storage):**

- Image assets: e-POD proof photos and driver ID images (enforced 5MB limit)
- Document management: electronic transport orders, invoices, ID cards (up to 10MB)
- All buckets Private: backend generates presigned URLs with 1h TTL; direct URL access returns 403/404; URL generation events logged atomically

**Redis (Distributed Cache):**

- Session blacklists and real-time deactivation flags — workspace suspension enforced within 5–30s
- Reputation score cache (pre-calculated ranks) for sub-2s product search
- SKU index cache for real-time duplicate detection (< 2s feedback)
- Priority message queues for notification dispatch tier management

### 4.5 Process View

**Synchronous Execution (Critical Financial Logic):**

- 3-way matching, credit restoration, carrier selection + credit check processed synchronously on main thread
- Row-level locking in PostgreSQL; atomic transactions complete within 3–5s
- Idempotency keys on all critical financial operations (`payment_id`, `match_id`) for safe retries

**Asynchronous Messaging (Three-Tier Priority Queuing):**

- **High Priority:** Transport Order push to drivers (guaranteed < 15s via FCM/APNs pre-authenticated connections; queue backlog > 30s triggers immediate alert)
- **Standard Priority:** Order approval/rejection, workspace result emails, dispute escalation alerts (< 1 min SLA)
- **Low Priority:** 48h auto-confirmations, reputation scoring recalculations, PDF report generation

**Resource Isolation Boundaries:**

- GPS Ingestion Container isolated from main transactional DB (prevents I/O contention during fleet tracking peaks)
- Background Worker Container isolated from main API container (heavy tasks cannot delay synchronous user requests)
- MinIO I/O monitored to prevent large file uploads from bottlenecking PostgreSQL transaction logs

### 4.6 Scenario View

**Scenario 1: Transport Order Issuance & Instant Driver Notification**

1. Dispatcher issues order; RBAC Middleware validates Carrier domain permissions
2. API validates all Decree 10/2020 mandatory fields server-side before state transition
3. Atomic transaction commits order to PostgreSQL with `is_locked = true` + audit log entry (Order-Before-Signal pattern)
4. High-priority worker pool enqueues push notification event; pre-authenticated FCM/APNs delivers driver push within < 15s
5. Dispatcher receives UI confirmation within 3–5s

**Scenario 2: Offline e-POD Collection & Synchronization**

1. **Offline:** Driver app → local state machine tracks 4-step progress; photos/signatures written to local encrypted storage (bounded <= 200MB) via atomic writes; cryptographic tagging with Driver ID + device timestamp
2. **Sync:** App detects connectivity, initiates delta-sync using sequence numbering; server validates sequence integrity and retroactively validates geofence check-in coordinates
3. **Storage:** Validated files streamed to MinIO Container; e-POD records written to PostgreSQL with `is_locked = true`; audit log committed atomically
4. Signed URL (1h TTL) generated for dispatcher review; shipment order status atomically set to `Completed`; full sync completed within 5–15s of reconnection

**Scenario 3: Automated Credit Limit Restoration**

1. Accountant matches payment receipt against invoice
2. Finance module initiates synchronous in-process reconciliation with row-level locking on Credit Ledger
3. Atomic transaction: append-only payment record + credit balance restoration + audit log (old balance, new balance, invoice reference, actor, IP, timestamp)
4. Idempotency key prevents double-restoration on retry
5. Credit limit restored and visible to Buyer within < 3s; 100% rollback on any partial failure

**Scenario 4: 3-Way Matching & Payment Clearance**

1. Chief Accountant opens 3-way matching dashboard; server aggregates PO, Goods Receipt Note, and Invoice from Read Replicas within < 5s
2. Server-side computation explicitly flags discrepancy lines; Accountant confirms (mandatory text justification required for any discrepancy override)
3. Atomic transaction locks all three documents as Immutable + creates accounts payable entry
4. 100% of confirmation events recorded with actor, IP, timestamp, and justification content; overrides flagged for compliance review

**Scenario 5: Workspace Suspension & Session Revocation**

1. Platform Admin initiates suspension via two-phase confirmation (automated risk assessment → exact company name text match); break-glass access logged before action proceeds
2. Atomic action: workspace status set to `Suspended`, event written to audit log within 4–5s
3. High-priority Redis broadcast blacklists all active JWTs for target `workspace_id` within 5–15s
4. All users force-logged out on next API request within 10–30s; zero impact on other tenant sessions

---

## 5. Security & Scalability

### 5.1 Authentication

- **Password Storage:** bcrypt with salt; plain-text passwords never stored or logged
- **Token Issuance:** JWT stateless tokens with short expiration; validated by signature verification — no DB query per request
- **Brute-Force Protection:** Accounts locked for exactly 15 min after 5 consecutive failed attempts; atomic Redis counter scoped by `tenant_id`; lockout effective across all instances
- **Global Session Invalidation:** Password changes and admin actions (workspace suspension, account deactivation) trigger immediate Redis blacklist broadcast; all affected sessions invalidated within 5–15s globally
- **Compliance Fields:** Registration records include IP address, exact timestamp, and `accepted_terms_version` as immutable, non-nullable fields — enforced per Law 91/2025

### 5.2 Authorization

Authorization enforced exclusively at the **API boundary (RBAC Middleware layer)**, never at the UI level. UI restrictions are UX hints only and are never the authoritative security control.

**RBAC Security Matrix:**

| Role               | Domain        | Core Permission                                                                                                                                                      |
| ------------------ | ------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Platform Admin     | Platform-wide | Workspace lifecycle management (approve/suspend/revoke), shared master data, audit log access, system health monitoring, break-glass e-POD access, dispute mediation |
| Company Admin      | Own Workspace | Enable additional workspace roles, manage workspace configuration, invite users                                                                                      |
| Supplier Manager   | Supplier      | Approve/deny purchase orders, manage credit limits per buyer, view supplier analytics, reassign staff tasks                                                          |
| Supplier Staff     | Supplier      | Add/edit catalog products and SKUs, submit RFQ responses and quotations, record payment receipts, manage freight invoices                                            |
| Buyer Manager      | Buyer         | Approve sourcing strategies, confirm carrier selection, execute 3-way matching, manage buyer-side team assignments                                                   |
| Buyer Staff        | Buyer         | Create RFQs, compare and select quotations, search product catalog, submit goods receipts, file disputes                                                             |
| Carrier Dispatcher | Carrier       | Issue Decree 10/2020-compliant transport orders, manage fleet assignments, monitor real-time GPS tracking                                                            |
| Carrier Staff      | Carrier       | Manage vehicle and driver profiles, manage freight rate cards, issue and adjust freight invoices                                                                     |
| Driver             | Carrier       | Receive transport orders (push notification), complete 4-step e-POD workflow (offline-capable), submit trip expenses                                                 |
| HR Manager         | Own Workspace | Manage employee lifecycle, assign roles, set KPI targets and enter performance results                                                                               |
| Chief Accountant   | Own Workspace | Set/modify buyer credit limits, execute payment matching, authorize 3-way matching confirmations                                                                     |

### 5.3 Data Protection & Privacy

- **Document Access:** All sensitive documents (e-POD proofs, transport orders, invoices, driver ID cards) served exclusively via JIT-signed URLs with 1h TTL. Raw storage paths (MinIO/S3 keys) never exposed in any API response.
- **Driver PII Masking:** Driver real phone numbers stored in secure DB only. Server-side masking applied at Serialization layer (NestJS Interceptors) before any payload leaves server — Buyer-facing endpoints receive masked format (`09*****78`) only.
- **Multi-Tenant Isolation:** PostgreSQL RLS enforces `workspace_id` filtering at DB engine level. Application-layer Repository enforces the same filter independently (defense-in-depth). Automated CI tests attempt cross-tenant injection on every build.
- **Transport Security:** All API traffic encrypted via HTTPS/TLS. Internal Docker container communication via private bridge network.

### 5.4 Performance & Spare Capacity

All services provisioned to maintain mandatory **20% spare capacity** headroom (80% utilization threshold) monitored via automated alerts.

| Performance Target                                     | SLA                         | Architectural Mechanism                                                                                    |
| ------------------------------------------------------ | --------------------------- | ---------------------------------------------------------------------------------------------------------- |
| Critical action response (approvals, orders, matching) | 3–5s                        | In-process Modular Monolith calls; atomic DB transactions; no blocking background jobs on critical path    |
| Product search with reputation ranking                 | 2–3s                        | Redis reputation score cache; pre-calculated ranks; paginated results (<= 25/page); workspace-scoped index |
| Driver push notification (transport order issuance)    | < 15s                       | High-priority worker pool; pre-authenticated FCM/APNs connections; Order-Before-Signal pattern             |
| Standard notifications (order/workspace/dispute)       | < 1 min                     | Standard-priority message broker queue; async decoupled from primary request path                          |
| Login to dashboard                                     | 2–3s                        | JWT stateless validation (no DB query); SSR cached dashboard payload; RBAC in-memory evaluation            |
| GPS ingestion                                          | 1 ping/30s/driver (0% loss) | Dedicated GPS Ingestion Container with isolated I/O; TimescaleDB append-optimized; 20% spare throughput    |
| e-POD offline sync                                     | 5–15s after reconnect       | Delta-sync with sequence numbering; server-side idempotency; atomic per-e-POD transactions                 |
| Audit log query                                        | ~5s                         | Read replicas for audit queries; composite indexing; pagination (<= 25 records/page)                       |

---

## 6. Data Immutability & Tenant Isolation

### 6.1 Business Record Immutability

| Record Type            | Trigger Event                              | Enforcement Mechanism                                                             | Correction Protocol                                              |
| ---------------------- | ------------------------------------------ | --------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| Supplier Quotation     | 'Submitted' state reached                  | DB write-lock, API returns HTTP 409 on modification attempt                       | Not permitted — quotation must be withdrawn and re-submitted     |
| Purchase Order         | Generated from locked quotation            | Immutable data snapshot, DB-level `is_locked` flag, DB trigger rejects UPDATE     | Formal cancellation and re-issuance required                     |
| Transport Order        | Issued state, Decree 10/2020 fields locked | Write-once policy on critical fields (driver, vehicle, time, rate) via DB trigger | Formal cancellation, new order required                          |
| e-POD Record           | Final Submit step completed                | Atomic status transition to `Completed` + `is_locked = true` in same transaction  | Break-glass access for Admin only, with mandatory justification  |
| Freight Invoice        | Finalized by Carrier Accountant            | DB UPDATE/DELETE rejected at engine level                                         | New Adjustment Invoice record with mandatory `correction_reason` |
| Payment Receipt Ledger | Payment recorded against invoice           | Append-only ledger table, DB rejects UPDATE/DELETE for all roles                  | Reversal record referencing original `receipt_id`                |
| Audit Log Entry        | Any state-changing action                  | DB trigger unconditionally rejects UPDATE/DELETE for all users including DBA      | Cannot be corrected — immutable by design                        |
| Negotiation Round      | Bid submitted in negotiation thread        | Monotonically increasing sequence number; DB rejects UPDATE/DELETE                | Not permitted — new round must be submitted                      |

**Implementation Mechanism — Defense-in-Depth:**

1. **Database-Level Triggers:** PostgreSQL triggers unconditionally reject UPDATE and DELETE operations on audit log and critical business tables for all roles including DBAs. Cannot be bypassed via application code.
2. **Status-Based Write Locks:** Finalized records carry `is_locked` flag. Complementary DB trigger rejects UPDATE on records where `is_locked = true`, regardless of which column is being modified.
3. **API Layer Enforcement:** Business modules validate record state before executing any modification. Requests to modify locked records return HTTP 409 Conflict immediately with structured error.

### 6.2 Strict Multi-Tenant Data Isolation

| Layer                    | Isolation Mechanism                                                                                         | What It Prevents                                                  |
| ------------------------ | ----------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| API Boundary             | RBAC Middleware validates `workspace_id` claim from JWT before any business logic executes                  | Requests targeting another workspace's resources blocked at entry |
| Application (Repository) | Mandatory `workspace_id` predicate injected into every DB query — client-supplied IDs ignored for filtering | Cross-tenant access even if RBAC middleware is bypassed           |
| Database (RLS)           | PostgreSQL Row-Level Security enforces `workspace_id` filtering at DB engine level for all connections      | Cross-tenant access even if application code has a bug            |
| Session Store            | JWT blacklisting scoped strictly by `workspace_id` namespace in Redis                                       | Suspended workspace session leaking into other workspaces         |
| File Storage             | MinIO bucket-level access control; signed URLs scoped to authenticated tenant context                       | Cross-tenant document access via URL guessing or sharing          |
| CI/CD                    | Automated cross-tenant injection tests on every build — any isolation failure blocks production deployment  | Regression in isolation logic reaching production                 |

**Workspace Lifecycle Isolation Timeline:**

- **Step 1 (0–5s):** RBAC-validated admin action; workspace status updated atomically in DB; break-glass access logged
- **Step 2 (5–15s):** High-priority Redis broadcast blacklists all active JWTs for target `workspace_id` namespace
- **Step 3 (10–30s):** All active web and mobile sessions reject API requests with 401 Unauthorized on next interaction
- **Tenant Insulation:** 0% performance or session impact on other active workspaces throughout

### 6.3 High-Frequency Data Integrity Strategy (GPS)

**GPS Ingestion Pipeline Design:**

- **Dedicated Infrastructure:** GPS Ingestion Container with dedicated I/O, connecting to separate TimescaleDB instance/schema — GPS I/O never contends with Business API Container transactional writes
- **Ingestion Rate:** Sustained >= 1 GPS ping per 30 seconds per active driver; 20% spare throughput capacity for fleet growth
- **Append-Only Persistence:** Every GPS record immutable once written — DB-level enforcement rejects UPDATE/DELETE; legally defensible route history
- **Time-Series Optimization:** TimescaleDB automatic time-based partitioning; composite spatial-temporal indexing enables sub-2s query for 24h route window across 5 years of history

**Storage Tier Strategy:**

| Storage Tier    | Data Age          | Access Pattern                                                    | Strategy                                                                                         |
| --------------- | ----------------- | ----------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| Hot Storage     | 0–90 days         | Instant playback, real-time monitoring, active dispute resolution | Standard TimescaleDB partitions, full-scan query support                                         |
| Archive         | 90 days – 5 years | Infrequent historical audit, route replay for legal cases         | Automated migration to archival partitions, query-accessible with higher latency                 |
| Purge Threshold | > 5 years         | N/A (regulatory minimum satisfied)                                | Configurable retention policy — default: never purge; compliance review required before deletion |

---

## 7. Risks and Mitigations

| Risk                          | Description                                                                                                   | Impact   | Mitigation                                                                                                                                                                     | Response Plan                                                                                                             |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------- |
| Redis Unavailability          | Redis failure causes loss of session blacklist enforcement, priority queues, and reputation cache             | High     | Redis Cluster with failover; application fallback to DB-based session validation (degraded performance); Docker health-check with auto-restart; independent monitoring channel | Fallback to DB auth validation; alert admins immediately; scale Redis vertically or restore cluster                       |
| GPS Pipeline Overload         | Fleet growth causes GPS ingestion to exceed pipeline capacity, resulting in GPS data loss                     | High     | Dedicated GPS container with 20% spare throughput; TimescaleDB auto-partitioning; ingestion backpressure circuit breaker; I/O usage alerts at 80% threshold                    | Throttle non-critical GPS clients; alert operations team; scale GPS container vertically                                  |
| Audit Log Write Failure       | DB disk full or connection loss prevents audit writes, blocking all critical business transactions            | Critical | Fail-fast: business transactions roll back if audit write fails; independent monitoring channel; read path isolated via read replicas; admin alerted within 1–2 min            | All audit-dependent endpoints return 503; immediately alert admins via independent channel; no silent data loss permitted |
| Offline Sync Conflict         | Driver submits e-POD data conflicting with server state (e.g., order already cancelled during offline period) | Medium   | Server-side sequence validation on sync; 409 Conflict for finalized record re-sync; delta-sync uses sequence numbers for exactly-once delivery                                 | Return structured conflict error to driver app; escalate to dispatcher for manual resolution                              |
| Multi-Tenant Data Leak        | Application bug bypasses `workspace_id` filter, exposing one tenant's data to another                         | Critical | Defense-in-depth: application-layer filter + DB-layer RLS + automated cross-tenant injection tests blocking CI/CD on any isolation failure                                     | Immediate incident declaration; block affected tenant; emergency patch deployment; full audit trail forensic review       |
| Decree 10/2020 Non-Compliance | Transport order issued without all mandatory fields                                                           | High     | Server-side state machine validates completeness before `Issued` state transition; HTTP 400 returned with specific missing fields                                              | Order blocked from issuance; dispatcher alerted with precise field-level error messages                                   |
| Signed URL Leakage            | Time-limited signed URL shared externally beyond intended recipient before TTL expiration                     | Medium   | 1-hour TTL minimizes exposure; URL generation logged with requesting identity; rate limiting on URL generation endpoint; break-glass access separately logged                  | Rotate signing keys for compromised documents; audit access log for anomalous pattern; notify affected parties            |
| Driver App Offline Data Loss  | Device crash or storage exhaustion during offline e-POD collection                                            | Medium   | Atomic writes to local encrypted storage after each step; storage bounded <= 200MB with proactive warnings at 80% capacity; cryptographic tagging of offline captures          | Recovery from last persisted step; driver re-captures lost steps; supervisor notified                                     |

---

## 8. Glossary

| Term       | Definition                                                                                                                                                    |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| RBAC       | Role-Based Access Control — authorization model restricting system access based on user roles, enforced at the API middleware layer                           |
| JWT        | JSON Web Token — compact, stateless token for user authentication and authorization; validated by signature verification without a DB query per request       |
| RLS        | Row-Level Security — PostgreSQL feature that enforces data access policies per row at the DB engine level, based on session attributes (e.g., `workspace_id`) |
| e-POD      | Electronic Proof of Delivery — digital record (GPS check-in, photos, digital signature) confirming physical delivery of goods                                 |
| RFQ        | Request for Quotation — formal document sent by a Buyer to Suppliers requesting pricing, terms, and specifications                                            |
| PO         | Purchase Order — commercial document issued by a Buyer to a Supplier authorizing a specific purchase at agreed terms                                          |
| GRN        | Goods Receipt Note — document confirming goods received by the Buyer; used in 3-way matching                                                                  |
| MTTR       | Mean Time to Recovery — average time to restore service after a failure. LogiSync target: < 2h                                                                |
| RPO        | Recovery Point Objective — maximum acceptable data loss window. LogiSync target: < 24h                                                                        |
| RTO        | Recovery Time Objective — maximum acceptable downtime window. LogiSync target: < 24h                                                                          |
| FCM / APNs | Firebase Cloud Messaging (Android) / Apple Push Notification service (iOS) — push notification delivery gateways for driver app notifications (< 15s SLA)     |
