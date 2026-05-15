# Catalog Module (Supplier Catalog)

## 1. Overview
The Catalog module allows suppliers to manage their product offerings, categories, and pricing. It features real-time validation for SKUs and names, multi-step publishing workflows, and integrated price history tracking.

## 2. Implemented Features & Mapping

### 2.1 Supplier Category Management
| Feature | Use Case | Business Rules | Implementation Status |
| :--- | :--- | :--- | :--- |
| **Create Category** | US-19 | BR-152 (Unique Name) | Implemented |
| **Update Category** | US-20 | - | Implemented |
| **Soft Delete Category** | - | - | Implemented (Blocked if products exist) |

### 2.2 Product Management
| Feature | Use Case | Business Rules | Implementation Status |
| :--- | :--- | :--- | :--- |
| **Add Product** | US-21 | BR-167 (Unique SKU) | Implemented (Default status: Draft) |
| **Update Product** | US-22 | - | Implemented (SKU/Status immutable) |
| **Manage Visibility** | US-23 | BR-175 (RFQ Warning) | Implemented (Publish/Unpublish) |
| **Search Catalog** | US-24 | ADD QAR-05 | Implemented (Pagination max 25) |
| **Price History** | - | - | Implemented (Atomic update + history) |

## 3. Test Cases Mapping

### 3.1 Functional Test Cases (SRS Mapping)
| ID | Test Scenario | BR Mapping | Expected Result |
| :--- | :--- | :--- | :--- |
| **TC-CAT-01** | Unique SKU Check | BR-167 | Prevent creating two products with same SKU in one workspace. |
| **TC-CAT-02** | SKU Immutability | BR-167 | `PATCH /products/:id` must ignore or reject `sku` field. |
| **TC-CAT-03** | Product Deletion Guard | - | Only allow deleting products in `draft` status. |
| **TC-CAT-04** | Price History Record | - | Updating price must insert old price into `product_price_history`. |
| **TC-CAT-05** | Unpublish Warning | BR-175 | Return warning if unpublishing a product in an open RFQ. |

### 3.2 Architectural & Security Test Cases (ADD/SAD Mapping)
| ID | Test Scenario | ADD/SAD Reference | Expected Result |
| :--- | :--- | :--- | :--- |
| **TC-CAT-06** | Signed Media URLs | ADD QAR-17 | `image_urls` must be converted to 1h Signed URLs in responses. |
| **TC-CAT-07** | Tenant Isolation | ADD 1.7 | Search results must never include products from other workspaces. |
| **TC-CAT-08** | Pagination Limit | ADD QAR-05 | `GET /products` must not return more than 25 items per page. |
| **TC-CAT-09** | Audit Log Capture | ADD 5.1 | All price changes and status transitions must be logged. |

## 4. Technical Constraints
- **Images**: Maximum 5MB per file, stored in MinIO with private access.
- **Transactions**: Price updates and status transitions must be atomic.
- **Indexing**: Composite index on `(workspace_id, status)` for performance.
