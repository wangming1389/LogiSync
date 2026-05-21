# Master Test Suite Directory (LogiSync)

This document maps exactly **99 automated test cases** found in the codebase to their Business Rules (BR) and Quality Attribute Requirements (QAR).

## 1. IAM Module Test Cases

| ID | Test Scenario | BR Mapping | Expected Result | Test Level |
| :--- | :--- | :--- | :--- | :--- |
 | **TC-IAM-01** | Tax ID Validation | BR-01 | Reject Tax IDs not matching `^[0-9]{10,13}$`. | **Unit** | 
 | **TC-IAM-02** | Password Complexity | BR-03 | Password complexity | **Unit** | 
 | **TC-IAM-03** | Identity Uniqueness | BR-05 | Return 409 Conflict if Tax ID or Email already exists. | **Unit** | 
 | **TC-IAM-04** | Account Lockout | BR-39 | Lock account for 15 mins after 5 failed attempts. | **Unit** | 
 | **TC-IAM-05** | Workspace Suspension | BR-21 | All active sessions invalidated in < 5s upon suspension. | **Unit** | 
 | **TC-IAM-06** | Revocation Guardrail | BR-26 | Require exact company name match for revocation. | **E2E** | 
 | **TC-IAM-07** | Response Time (Login) | ADD 1.1 | Login to dashboard response < 3 seconds. | **E2E** | 
 | **TC-IAM-08** | Token Blacklisting | ADD 1.2 | Password change invalidates all other tokens in < 15s. | **E2E** | 
 | **TC-IAM-09** | Multi-tenancy Isolation | ADD 1.7 | No cross-tenant data leakage via Repository filters. | **Unit** | 
 | **TC-IAM-10** | Audit Log Immutability | ADD QAR-18 | Ensure `UPDATE` or `DELETE` on `Audit_Logs` fails. | **E2E** | 
 | **TC-IAM-11** | Password Hashing | ADD 1.3 | Use Bcrypt with cost factor 12; raw password never logged. | **Unit** | 
 | **TC-IAM-12** | Suspended Workspace Rejection | BR-21 | Strategy rejects a token when the workspace is suspended. | **Unit** | 
 | **TC-IAM-13** | rejects requests without a token | BR-21 | Rejects requests without a token | **E2E** | 
 | **TC-IAM-14** | rejects requests with a malformed token | BR-21 | Rejects requests with a malformed token | **E2E** | 
 | **TC-IAM-15** | rejects requests with an expired or invalid token | BR-21 | Rejects requests with an expired or invalid token | **E2E** | 
 | **TC-IAM-16** | rejects a token after the workspace is suspended in the database | BR-21 | Rejects a token after the workspace is suspended in the database | **E2E** | 

---

## 2. Catalog Module Test Cases

| ID | Test Scenario | BR Mapping | Expected Result | Test Level |
| :--- | :--- | :--- | :--- | :--- |
 | **TC-CAT-01** | Unique SKU Check | BR-162 | Prevent creating two products with same SKU in one workspace. | **Unit** | 
 | **TC-CAT-02** | SKU Immutability | BR-167 | `PATCH /products/:id` must ignore or reject `sku` field. | **Unit** | 
 | **TC-CAT-03** | Product Deletion Guard | BR-173 | Only allow deleting products in `draft` status. | **Unit** | 
 | **TC-CAT-04** | Price History Record | BR-170 | Updating price must insert old price into `product_price_history`. | **Unit** | 
 | **TC-CAT-05** | Unpublish Warning | BR-175 | Return warning if unpublishing a product in an open RFQ. | **Unit** | 
 | **TC-CAT-06** | Signed Media URLs | ADD QAR-17 | `image_urls` must be converted to 1h Signed URLs in responses. | **Unit** | 
 | **TC-CAT-07** | Tenant Isolation | ADD 1.7 | Tenant isolation | **Unit, E2E** | 
 | **TC-CAT-08** | Pagination Limit | ADD QAR-05 | `GET /products` must not return more than 25 items per page. | **Unit** | 
 | **TC-CAT-09** | Audit Log Capture | ADD 5.1 | All price changes and status transitions must be logged. | **Unit** | 

---

## 3. Sourcing Module Test Cases

| ID | Test Scenario | BR Mapping | Expected Result | Test Level |
| :--- | :--- | :--- | :--- | :--- |
 | **TC-SRC-01** | Duplicate Item Merge | BR-387 | Adding same product to RFQ twice merges quantities. | **Unit** | 
 | **TC-SRC-02** | RFQ Item Cap | QAR | Reject adding more than 200 items to a single RFQ. | **Unit** | 
 | **TC-SRC-03** | Negotiation Turn Guard | BR-206 | Prevent same party from submitting two consecutive rounds. | **Unit** | 
 | **TC-SRC-04** | Mutation Lock | BR-395, BR-401 | Mutation lock | **Unit** | 
 | **TC-SRC-05** | PO Snapshot Integrity | BR-212 | PO must use static values from Quotation, not live refs. | **Unit** | 
 | **TC-SRC-06** | Search Performance | ADD 1.1 | Cross-tenant search returns in < 3 seconds. | **E2E** | 
 | **TC-SRC-07** | Reputation Source | ADD 1.1 | Reputation data MUST come from Redis, not direct DB. | **Unit** | 
 | **TC-SRC-08** | Atomic Selection | ADD QAR-25 | Atomic selection | **Unit, E2E** | 
 | **TC-SRC-09** | Tenant Search Guard | ADD 1.7 | Users cannot search for products within their own workspace. | **Unit** | 

---

## 4. Order Module Test Cases

| ID | Test Scenario | BR Mapping | Expected Result | Test Level |
| :--- | :--- | :--- | :--- | :--- |
 | **TC-ORD-01** | Role-Based Filtering | BR-200 | Staff see only assigned orders; Managers see all. | **Unit** | 
 | **TC-ORD-02** | Rejection Reason | BR-187 | `PATCH /reject` returns 400 if reason is empty. | **Unit** | 
 | **TC-ORD-03** | Status History Immutability | BR-427 | Verify `order_status_history` is append-only. | **E2E** | 
 | **TC-ORD-04** | Export Range Validation | BR-433 | Return 400 if export range > 366 days. | **Unit** | 
 | **TC-ORD-05** | Auto-Confirm Logic | BR-450 | Background worker processes orders after 48h. | **Unit** | 
 | **TC-ORD-06** | Atomic Transactions | ADD QAR-03 | Atomic transactions | **Unit, E2E** | 
 | **TC-ORD-07** | Post-Commit Notifications | ADD QAR-03 | Notification enqueued ONLY after successful commit. | **Unit** | 
 | **TC-ORD-08** | Worker Idempotency | ADD 1.6 | Use `SKIP LOCKED` to prevent double-processing. | **Unit** | 
 | **TC-ORD-09** | Tenant Isolation | ADD 1.7 | Tenant isolation | **Unit, E2E** | 
 | **TC-ORD-10** | Approval Pure Transition | ADD QAR-03 | Build approval transition data without side effects. | **Unit** | 
 | **TC-ORD-11** | Receipt Pure Transition | ADD QAR-03 | Build receipt confirmation transition data. | **Unit** | 
 | **TC-ORD-12** | Supplier Export Authorization | BR-431 | Supplier company admins can successfully export their order history via `/orders/export`. | **E2E** | 
 | **TC-ORD-13** | scopes company admins to either buyer or supplier workspace orders | BR-431 / ADD 1.7 | Scopes company admins to either buyer or supplier workspace orders | **Unit** | 
 | **TC-ORD-14** | allows company admins to export order history | BR-431 / ADD 1.7 | Allows company admins to export order history | **Unit** | 

---

## 5. Master Data Module Test Cases

| ID | Test Scenario | BR Mapping | Expected Result | Test Level |
| :--- | :--- | :--- | :--- | :--- |
 | **TC-MD-01** | Name/Code Uniqueness | BR-67, BR-68 | Name/code uniqueness | **Unit** | 
 | **TC-MD-02** | Soft Disable Persistence | BR-70 | Soft disable persistence | **Unit** | 
 | **TC-MD-03** | Visibility Filter | BR-76 | Visibility filter | **Unit** | 
 | **TC-MD-04** | Status Guard | BR-70, BR-71 | Status guard | **Unit** | 
 | **TC-MD-05** | Write Performance | BR-78 | Admin write operations respond in < 500ms. | **E2E** | 
 | **TC-MD-06** | Cache Update SLA | BR-73 | Changes reflect across all nodes in < 1 second. | **E2E** | 
 | **TC-MD-07** | Admin RBAC Guard | ADD 1.3 | All `/admin/*` routes reject non-PLATFORM_ADMIN users. | **E2E** | 
 | **TC-MD-08** | Audit Diff Integrity | BR-75 | Audit diff integrity | **Unit** | 

---

## 6. Media Module Test Cases

| ID | Test Scenario | BR Mapping | Expected Result | Test Level |
| :--- | :--- | :--- | :--- | :--- |
 | **TC-MED-01** | File Size Enforcement | BR-04 | Reject uploads > 5MB for images / 10MB for documents. | **Unit** | 
 | **TC-MED-02** | File Format Validation | BR-537 / BR-04 | Only allow .pdf, .jpg, .png for legal documents. | **Unit** | 
 | **TC-MED-03** | Audit Log (Signed URL) | BR-547 | Every request to generate a signed URL must be logged. | **Unit** | 
 | **TC-MED-04** | Private Bucket Policy | ADD 1.3 | Direct public access to storage bucket returns 403 Forbidden. | **Integration** | 
 | **TC-MED-05** | Signed URL Expiration | ADD QAR-17 | Generated URLs must expire exactly after 1 hour. | **Unit** | 
 | **TC-MED-06** | JIT Generation Overhead | ADD 2.3.3 | Signed URL generation adds < 200ms to API response. | **Integration** | 

---

## 7. Security Infrastructure Test Cases

| ID | Test Scenario | BR Mapping | Expected Result | Test Level |
| :--- | :--- | :--- | :--- | :--- |
 | **TC-SEC-02** | Session Revocation | BR-21, BR-28 / QAR-09 / ADD 1.2 | Session revocation | **Unit, E2E** | 
 | **TC-SEC-03** | Password Change | BR-49 / QAR-14 / ADD 1.3 | Changing password via `PATCH /auth/password` must empty the user's session list in Redis. | **E2E** | 
 | **TC-SEC-04** | JWT Claims Leakage | BR-42 / QAR-27 / ADD 1.3 | Ensure JWT payload does not contain PII (only `sub`, `workspaceId`, `role`, `sessionId`). | **Unit** | 
 | **TC-SEC-05** | Bypass Unprotected Routes | BR-63 / QAR-15 / ADD 1.3 | Rate limit guard should allow routes without a rate limit policy. | **Unit** | 
 | **TC-SEC-06** | IP Rate Limit Enforcement | BR-52 / QAR-07 / ADD 1.3 | Guard rejects public requests over the configured IP limit. | **Unit** | 
 | **TC-SEC-07** | User Rate Limit Isolation | BR-52 / QAR-07, QAR-27 / ADD 1.3 | Tracks authenticated user buckets separately when configured. | **Unit** | 
 | **TC-SEC-08** | Missing Context Rejection | BR-63 / QAR-27 / ADD 1.3 | Guard requires an authenticated user for user-scoped policies. | **Unit** | 
 | **TC-SEC-09** | keeps product reads and writes scoped to the caller workspace | ADD 1.7 / QAR-27 | Keeps product reads and writes scoped to the caller workspace | **E2E** | 
 | **TC-SEC-10** | keeps buyer RFQs hidden from another buyer workspace | ADD 1.7 / QAR-27 | Keeps buyer rfqs hidden from another buyer workspace | **E2E** | 
 | **TC-SEC-11** | blocks buyer users from supplier product writes and supplier users from buyer RFQ writes | ADD 1.7 / QAR-27 | Blocks buyer users from supplier product writes and supplier users from buyer rfq writes | **E2E** | 

---

## 8. Audit Logging Test Cases

| ID | Test Scenario | BR Mapping | Expected Result | Test Level |
| :--- | :--- | :--- | :--- | :--- |
 | **TC-AUD-01** | Mandatory Logging | BR-75 / Decree 356 | Every write operation (POST/PATCH/DELETE) must generate an audit entry. | **Unit** | 
 | **TC-AUD-02** | Transaction Rollback | QAR-18 / AD-03 | If a PO approval fails, NO audit log should be persisted. | **E2E** | 
 | **TC-AUD-03** | Error Capture | BR-39 / Decree 356 | Failed login attempts must log the `errorMessage` and `status: FAILURE`. | **Unit** | 
 | **TC-AUD-04** | Immutability | QAR-18 / AD-03 | SQL `UPDATE` or `DELETE` on `audit_logs` table must be blocked. | **E2E** | 
 | **TC-AUD-05** | Workspace Isolation | QAR-27 / AD-04 | Logs must only be queryable by users within the same workspace (unless Platform Admin). | **E2E** | 

---

## 9. Health Monitoring Test Cases

| ID | Test Scenario | BR Mapping | Expected Result | Test Level |
| :--- | :--- | :--- | :--- | :--- |
 | **TC-HLT-01** | Database Outage | ADD QAR-11 | `/health/ready` must return 503 Service Unavailable. | **Unit** | 
 | **TC-HLT-02** | Redis Degraded | ADD QAR-11 | `/health` returns `degraded: true`, but `/health/ready` still returns 200. | **Unit** | 
 | **TC-HLT-03** | Alert Trigger | ADD QAR-11 | Killing MinIO service should trigger an email alert within 15-30 seconds. | **E2E** | 
 | **TC-HLT-04** | Alert Cooldown | ADD QAR-11 | Repeated failures within 2 minutes must NOT send duplicate emails. | **Unit** | 
 | **TC-HLT-05** | Check Execution | ADD QAR-11 | Registry runs registered health checks correctly. | **Unit** | 
 | **TC-HLT-06** | Optional Check Failure | ADD QAR-11 | Registry returns failed optional checks without throwing. | **Unit** | 

---

## 10. Infrastructure Core Test Cases

| ID | Test Scenario | BR Mapping | Expected Result | Test Level |
| :--- | :--- | :--- | :--- | :--- |
 | **TC-INFRA-01** | Active CLS Transaction Priority | AD-03 / QAR-18 | Repository uses the active CLS transaction before the root database. | **Unit** | 
 | **TC-INFRA-02** | Root Database Fallback | AD-01 | Repository falls back to the root database without an active transaction. | **Unit** | 
 | **TC-INFRA-03** | Nested Unit-of-Work CLS | AD-01 / AD-03 / QAR-25 | Database service reuses the active CLS transaction for nested unit-of-work calls. | **Unit** | 
 | **TC-INFRA-04** | Unbound Transaction CLS Creation | AD-01 / AD-03 | Database service creates a CLS context when a transaction starts outside one. | **Unit** | 

---

