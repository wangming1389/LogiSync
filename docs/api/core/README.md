# Core Services

This folder contains documentation for the cross-cutting services that support the entire LogiSync platform.

## Contents
- **[Audit Logging](./audit.md)** - Immutable, append-only activity tracking.
- **[Health Monitoring](./health.md)** - System availability and automated alerting.
- **[Security & Sessions](./security.md)** - Account lockout, session management, and auth policies.

## Role of Core Services
Core services are designed to be domain-agnostic. They provide the infrastructure and security foundations that enable domain modules (like Order or Sourcing) to focus strictly on business logic while remaining compliant and secure.
