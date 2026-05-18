# IAM Module (Identity and Access Management)

## 1. Overview
The IAM module is the core security and multi-tenancy layer of the LogiSync platform. It manages user authentication, authorization, workspace (tenant) lifecycles, and ensures compliance with data protection laws (Decree 91/2025) and audit logging standards (Decree 356/2025).

## 2. Implemented Features & Mapping

### 2.1 Workspace Lifecycle
| Feature | Use Case | Business Rules | Implementation Status |
| :--- | :--- | :--- | :--- |
| **Register Workspace** | UC1 | BR-01 to BR-08 | Implemented (Auth Service + Workspace Service) |
| **Approve Workspace** | UC2 | BR-09 to BR-14 | Implemented (Workspace Controller/Service) |
| **Reject Workspace** | UC3 | BR-15 to BR-19 | Implemented (Workspace Controller/Service) |
| **Suspend Workspace** | UC4 | BR-20 to BR-24 | Implemented (Workspace Service + Redis Invalidation) |
| **Revoke Workspace** | UC5 | BR-25 to BR-30 | Implemented (Workspace Service + Permanent Lock) |
| **Role Management** | UC6 | BR-31 to BR-36 | Implemented (Permission Service) |

### 2.2 User Authentication & Authorization
| Feature | Use Case | Business Rules | Implementation Status |
| :--- | :--- | :--- | :--- |
| **Login** | UC7 | BR-37 to BR-42 | Implemented (Auth Service + JWT Strategy) |
| **Change Password** | UC8 | BR-43 to BR-51 | Implemented (Auth Service + Bcrypt) |
| **Forgot Password** | UC9 | BR-52 to BR-58 | Implemented (Token-based reset) |
| **Session Management** | UC10 | BR-59 to BR-65 | Implemented (Redis session tracking) |

## 3. Test Cases Mapping

### 3.1 Functional Test Cases (SRS Mapping)
| ID | Test Scenario | BR Mapping | Expected Result |
| :--- | :--- | :--- | :--- |
| **TC-IAM-01** | Tax ID Validation | BR-01 | Reject Tax IDs not matching `^[0-9]{10,13}$`. |
| **TC-IAM-02** | Password Complexity | BR-03 | Enforce uppercase, lowercase, number, and special char. |
| **TC-IAM-03** | Identity Uniqueness | BR-05 | Return 409 Conflict if Tax ID or Email already exists. |
| **TC-IAM-04** | Account Lockout | BR-39 | Lock account for 15 mins after 5 failed attempts. |
| **TC-IAM-05** | Workspace Suspension | BR-21 | All active sessions invalidated in < 5s upon suspension. |
| **TC-IAM-06** | Revocation Guardrail | BR-26 | Require exact company name match for revocation. |

### 3.2 Architectural & Security Test Cases (ADD/SAD Mapping)
| ID | Test Scenario | ADD/SAD Reference | Expected Result |
| :--- | :--- | :--- | :--- |
| **TC-IAM-07** | Response Time (Login) | ADD 1.1 | Login to dashboard response < 3 seconds. |
| **TC-IAM-08** | Token Blacklisting | ADD 1.2 | Password change invalidates all other tokens in < 15s. |
| **TC-IAM-09** | Multi-tenancy Isolation | ADD 1.7 | No cross-tenant data leakage via Repository filters. |
| **TC-IAM-10** | Audit Log Immutability | ADD 5.1 / SAD | Ensure `UPDATE` or `DELETE` on `Audit_Logs` fails. |
| **TC-IAM-11** | Password Hashing | ADD 1.3 | Use Bcrypt with cost factor 12; raw password never logged. |
| **TC-IAM-12** | Suspended Workspace Rejection | BR-21 | Strategy rejects a token when the workspace is suspended. |

## 4. Technical Constraints
- **Architecture**: Domain-driven design with strict repository pattern for multi-tenancy.
- **Session Store**: Redis (AWS ElastiCache equivalent) for real-time invalidation.
- **Context**: `nestjs-cls` for propagating `workspaceId` and `userId` across the call stack.
