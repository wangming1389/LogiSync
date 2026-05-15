# Master Data Module (Shared Platform Catalog)

## 1. Overview
The Master Data module manages the global data shared across all workspaces, including Catalog Categories and Units of Measure (UoM). These are controlled by Platform Admins and consumed by all tenants.

## 2. Implemented Features & Mapping

### 2.1 Shared Data Management
| Feature | Use Case | Business Rules | Implementation Status |
| :--- | :--- | :--- | :--- |
| **Manage Shared Data** | UC11 | BR-67, BR-68 (Uniqueness) | Implemented (Catalog & UoM) |
| **Soft Disable/Enable** | - | BR-70, BR-71 | Implemented |
| **Cache Sync** | - | BR-73 | Implemented (Redis Pub/Sub) |
| **Audit Logging** | - | BR-75 | Implemented |

## 3. Test Cases Mapping

### 3.1 Functional Test Cases (SRS Mapping)
| ID | Test Scenario | BR Mapping | Expected Result |
| :--- | :--- | :--- | :--- |
| **TC-MD-01** | Name/Code Uniqueness | BR-67, BR-68 | Prevent duplicates for both Name and Code in Master Data. |
| **TC-MD-02** | Soft Disable Persistence | BR-70 | Records are never deleted; only `is_active` is toggled. |
| **TC-MD-03** | Visibility Filter | BR-76 | Tenants see ONLY active records; Admins see all. |
| **TC-MD-04** | Status Guard | - | `PATCH /:id` must not be able to modify `is_active` status. |

### 3.2 Architectural & Security Test Cases (ADD/SAD Mapping)
| ID | Test Scenario | ADD/SAD Reference | Expected Result |
| :--- | :--- | :--- | :--- |
| **TC-MD-05** | Write Performance | BR-78 | Admin write operations respond in < 500ms. |
| **TC-MD-06** | Cache Update SLA | BR-73 | Changes reflect across all nodes in < 1 second. |
| **TC-MD-07** | Admin RBAC Guard | ADD 1.3 | All `/admin/*` routes reject non-PLATFORM_ADMIN users. |
| **TC-MD-08** | Audit Diff Integrity | BR-75 | Audit logs must contain old/new value diffs for updates. |

## 4. Technical Constraints
- **Performance**: High-speed Redis Pub/Sub for configuration updates.
- **Data Integrity**: Global shared data must be immutable in historical references even when disabled.
