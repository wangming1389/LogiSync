# Audit Logging System

## 1. Overview
The Audit Logging system provides an immutable, append-only record of all critical activities within the LogiSync platform. It ensures compliance with Decree 356/2025 regarding electronic audit trails and enterprise security standards.

## 2. Key Components

### 2.1 Audit Logger Service
Located at `apps/api/src/core/audit/audit-logger.service.ts`.
- **`log()`**: Asynchronous logging for non-critical flows.
- **`logInTx()`**: Atomic logging within a database transaction. If the business transaction rolls back, the audit log also rolls back (preserving data integrity).

### 2.2 Audit Interceptor
Located at `apps/api/src/core/audit/audit.interceptor.ts`.
- Automatically captures request metadata (Actor, Workspace, IP, User Agent).
- Logs API responses and outcomes without manual code in every controller.

## 3. Data Schema
Logs are stored in the `audit_logs` table with the following fields:
- `id`: Unique UUID.
- `actorId`: User who performed the action.
- `workspaceId`: Tenant context.
- `action`: Type of activity (e.g., `ORDER_APPROVED`, `PRODUCT_CREATE`).
- `resourceType`: Affected entity (e.g., `purchase_order`).
- `resourceId`: Specific entity ID.
- `changes`: JSONB diff of old/new values.
- `ipAddress`: Client IP.
- `status`: SUCCESS or FAILURE.
- `timestamp`: UTC creation time.

## 4. Test Cases Mapping

### 4.1 Functional Test Cases
| ID | Test Scenario | Expected Result |
| :--- | :--- | :--- |
| **TC-AUD-01** | Mandatory Logging | Every write operation (POST/PATCH/DELETE) must generate an audit entry. |
| **TC-AUD-02** | Transaction Rollback | If a PO approval fails, NO audit log should be persisted. |
| **TC-AUD-03** | Error Capture | Failed login attempts must log the `errorMessage` and `status: FAILURE`. |

### 4.2 Security Test Cases
| ID | Test Scenario | Expected Result |
| :--- | :--- | :--- |
| **TC-AUD-04** | Immutability | SQL `UPDATE` or `DELETE` on `audit_logs` table must be blocked. |
| **TC-AUD-05** | Workspace Isolation | Logs must only be queryable by users within the same workspace (unless Platform Admin). |

## 5. Technical Constraints
- **Atomic**: `logInTx` is mandatory for financial and status-changing operations.
- **Performance**: Audit logging adds < 50ms overhead per request.
