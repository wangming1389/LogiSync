# Order Module (Order Management)

## 1. Overview
The Order module handles the complete lifecycle of Purchase Orders (PO), from approval and task assignment to goods receipt and 3-way matching. It includes automated background processes for receipt confirmation and detailed status/assignment history tracking.

## 2. Implemented Features & Mapping

### 2.1 Order Lifecycle
| Feature | Use Case | Business Rules | Implementation Status |
| :--- | :--- | :--- | :--- |
| **Approve Order** | US-25 | - | Implemented (Atomic TX + Audit) |
| **Reject Order** | US-26 | BR-187 (Reason Required) | Implemented (Atomic TX + Guard) |
| **Confirm Goods Receipt** | US-73 | BR-452 (Reputation) | Implemented (Manual & Auto) |
| **Auto-Confirm Receipt** | - | - | Implemented (Background Worker) |

### 2.2 Task Management
| Feature | Use Case | Business Rules | Implementation Status |
| :--- | :--- | :--- | :--- |
| **Assign Order Task** | UC27, UC65 | BR-197, BR-416 | Implemented (Assignment History) |
| **Reassign Order Task** | UC28, UC66 | - | Implemented (Closes previous assignment) |
| **View Assigned Tasks** | UC29, UC67 | BR-200, BR-419 | Implemented (Role-based filtering) |

### 2.3 Reporting & History
| Feature | Use Case | Business Rules | Implementation Status |
| :--- | :--- | :--- | :--- |
| **Export Order History** | UC69 | BR-431, BR-433 | Implemented (XLSX/PDF, Max 366 days) |
| **Status History** | - | BR-427 | Implemented (Append-only tracking) |

## 3. Test Cases Mapping

### 3.1 Functional Test Cases (SRS Mapping)
| ID | Test Scenario | BR Mapping | Expected Result |
| :--- | :--- | :--- | :--- |
| **TC-ORD-01** | Role-Based Filtering | BR-200 | Staff see only assigned orders; Managers see all. |
| **TC-ORD-02** | Rejection Reason | BR-187 | `PATCH /reject` returns 400 if reason is empty. |
| **TC-ORD-03** | Status History Immutability | BR-427 | Verify `order_status_history` is append-only. |
| **TC-ORD-04** | Export Range Validation | BR-433 | Return 400 if export range > 366 days. |
| **TC-ORD-05** | Auto-Confirm Logic | - | Background worker processes orders after 48h. |

### 3.2 Architectural & Security Test Cases (ADD/SAD Mapping)
| ID | Test Scenario | ADD/SAD Reference | Expected Result |
| :--- | :--- | :--- | :--- |
| **TC-ORD-06** | Atomic Transactions | ADD QAR-03 | Status update + history + audit must rollback on failure. |
| **TC-ORD-07** | Post-Commit Notifications | ADD QAR-03 | Notification enqueued ONLY after successful commit. |
| **TC-ORD-08** | Worker Idempotency | ADD 1.6 | Use `SKIP LOCKED` to prevent double-processing. |
| **TC-ORD-09** | Tenant Isolation | ADD 1.7 | Ensure no cross-workspace order access. |
| **TC-ORD-10** | Approval Pure Transition | ADD QAR-03 | Build approval transition data without side effects. |
| **TC-ORD-11** | Receipt Pure Transition | ADD QAR-03 | Build receipt confirmation transition data. |

## 4. Technical Constraints
- **Concurrency**: `FOR UPDATE SKIP LOCKED` used in background workers.
- **Reporting**: Export responses must be delivered in < 10 seconds.
- **Finance Integration**: (Planned Phase 2) Credit check and Payables integration.
