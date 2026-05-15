# Sourcing Module (RFQ & Quotation)

## 1. Overview
The Sourcing module facilitates the product discovery and negotiation process. It includes cross-tenant product search, multi-supplier RFQ submission, turn-based price negotiation, and automated Purchase Order generation with immutable price snapshots.

## 2. Implemented Features & Mapping

### 2.1 Product Discovery
| Feature | Use Case | Business Rules | Implementation Status |
| :--- | :--- | :--- | :--- |
| **Product Search** | US-61 | BR-384 (Persistence) | Implemented (Cross-tenant) |
| **Reputation Cache** | - | ADD 1.1 | Implemented (Redis-based) |

### 2.2 Request for Quotation (RFQ)
| Feature | Use Case | Business Rules | Implementation Status |
| :--- | :--- | :--- | :--- |
| **Create Draft RFQ** | US-62 | BR-387 (Auto-Merge) | Implemented |
| **Submit RFQ** | US-63 | QAR (200-item cap) | Implemented (Split into Child RFQs) |
| **Manage Items** | - | IsLocked Guard | Implemented |

### 2.3 Quotation & Negotiation
| Feature | Use Case | Business Rules | Implementation Status |
| :--- | :--- | :--- | :--- |
| **Submit Quotation** | US-32 | - | Implemented |
| **Negotiate Price** | UC30 | BR-206 (Turn-based) | Implemented (Append-only rounds) |
| **Finalize Terms** | UC31 | - | Implemented |
| **Select Quotation** | US-64 | BR-212 (PO Snapshot) | Implemented (Atomic PO creation) |

## 3. Test Cases Mapping

### 3.1 Functional Test Cases (SRS Mapping)
| ID | Test Scenario | BR Mapping | Expected Result |
| :--- | :--- | :--- | :--- |
| **TC-SRC-01** | Duplicate Item Merge | BR-387 | Adding same product to RFQ twice merges quantities. |
| **TC-SRC-02** | RFQ Item Cap | QAR | Reject adding more than 200 items to a single RFQ. |
| **TC-SRC-03** | Negotiation Turn Guard | BR-206 | Prevent same party from submitting two consecutive rounds. |
| **TC-SRC-04** | Mutation Lock | - | Return 409 if modifying a submitted/locked RFQ or Quotation. |
| **TC-SRC-05** | PO Snapshot Integrity | BR-212 | PO must use static values from Quotation, not live refs. |

### 3.2 Architectural & Security Test Cases (ADD/SAD Mapping)
| ID | Test Scenario | ADD/SAD Reference | Expected Result |
| :--- | :--- | :--- | :--- |
| **TC-SRC-06** | Search Performance | ADD 1.1 | Cross-tenant search returns in < 3 seconds. |
| **TC-SRC-07** | Reputation Source | ADD 1.1 | Reputation data MUST come from Redis, not direct DB. |
| **TC-SRC-08** | Atomic Selection | SAD | Selection must update RFQ, Quote, and insert PO in one TX. |
| **TC-SRC-09** | Tenant Search Guard | ADD 1.7 | Users cannot search for products within their own workspace. |

## 4. Technical Constraints
- **Search**: Max 25 items per page. Filter persistence in Redis (24h TTL).
- **Negotiation**: `negotiation_rounds` table is append-only (DB level enforcement).
- **Performance**: `selectQuotation()` must complete in < 2 seconds.
