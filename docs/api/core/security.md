# Security & Session Management

## 1. Overview
The Security system protects the platform from unauthorized access, brute-force attacks, and cross-tenant data leakage. It combines stateless JWT authentication with stateful session tracking in Redis.

## 2. Key Features

### 2.1 Account Lockout
Located at `apps/api/src/core/security/security.service.ts`.
- **Threshold**: 5 consecutive failed login attempts.
- **Duration**: 15 minutes lockout.
- **Mechanism**: Redis-based counters with automated TTL expiration.

### 2.2 Session Registry
Located at `apps/api/src/core/session/session-registry.service.ts`.
- **Stateless + Stateful**: JWTs contain a `sessionId`. Redis tracks the `sessionId` for real-time revocation.
- **Revocation**: Admins can revoke a specific session or all sessions for a workspace (e.g., during a security breach).
- **Timeout**: Sessions expire after 30 minutes of inactivity (configurable via `SESSION_TTL_SECONDS`).

### 2.3 Password Security
- **Hashing**: Bcrypt with cost factor 12.
- **Complexity**: Enforced at the Zod validation layer (min 8 chars, mixed case, symbols).
- **Invalidation**: Changing a password automatically invalidates all existing sessions for that user across all devices.

## 3. Test Cases Mapping

### 3.1 Security Test Cases
| ID | Test Scenario | Expected Result |
| :--- | :--- | :--- |
| **TC-SEC-01** | Brute Force Protection | After 5th failed login, the 6th attempt must return 403 Forbidden even if credentials are correct. |
| **TC-SEC-02** | Session Revocation | Revoking a session in Redis must make the corresponding JWT invalid immediately (next request). |
| **TC-SEC-03** | Password Change | Changing password via `PATCH /auth/password` must empty the user's session list in Redis. |
| **TC-SEC-04** | JWT Claims Leakage | Ensure JWT payload does not contain PII (only `sub`, `workspaceId`, `role`, `sessionId`). |
| **TC-SEC-05** | Bypass Unprotected Routes | Rate limit guard should allow routes without a rate limit policy. |
| **TC-SEC-06** | IP Rate Limit Enforcement | Guard rejects public requests over the configured IP limit. |
| **TC-SEC-07** | User Rate Limit Isolation | Tracks authenticated user buckets separately when configured. |
| **TC-SEC-08** | Missing Context Rejection | Guard requires an authenticated user for user-scoped policies. |

## 4. Technical Constraints
- **Performance**: Security checks (lockout/session) add < 10ms to each authenticated request.
- **Reliability**: Redis is the source of truth for sessions. If Redis is down, the system defaults to "Degraded" mode (accepting valid JWTs but losing real-time revocation).
