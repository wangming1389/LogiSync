# Catalog Module (Supplier Catalog)

## 1. Overview
The Catalog module allows suppliers to manage their product offerings, categories, and pricing. It features real-time validation for SKUs and names, multi-step publishing workflows, and integrated price history tracking.

## 2. Implemented Features & Mapping

### 2.1 Supplier Category Management
| Feature | Use Case | Business Rules | Implementation Status |
| :--- | :--- | :--- | :--- |
| **Create Category** | UC19 | BR-152 to BR-156 | Implemented |
| **Update Category** | UC20 | BR-157 to BR-161 | Implemented |
| **Soft Delete Category** | UC20 | BR-70, BR-157 | Implemented (Blocked if products exist) |

### 2.2 Product Management
| Feature | Use Case | Business Rules | Implementation Status |
| :--- | :--- | :--- | :--- |
| **Add Product** | UC21 | BR-162 to BR-166 | Implemented (Default status: Draft) |
| **Update Product** | UC22 | BR-167 to BR-171 | Implemented (SKU/Status immutable) |
| **Manage Visibility** | UC23 | BR-172 to BR-176 | Implemented (Publish/Unpublish) |
| **Search Catalog** | UC24 | BR-177 to BR-180 | Implemented (Pagination max 25) |
| **Price History** | UC22 | BR-170 | Implemented (Atomic update + history) |

## 3. Test Cases Mapping

### 3.1 Functional Test Cases (SRS Mapping)
| ID | Test Scenario | BR Mapping | Expected Result |
| :--- | :--- | :--- | :--- |
| **TC-CAT-01** | Unique SKU Check | BR-162 | Prevent creating two products with same SKU in one workspace. |
| **TC-CAT-02** | SKU Immutability | BR-167 | `PATCH /products/:id` must ignore or reject `sku` field. |
| **TC-CAT-03** | Product Deletion Guard | BR-173 | Only allow deleting products in `draft` status. |
| **TC-CAT-04** | Price History Record | BR-170 | Updating price must insert old price into `product_price_history`. |
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
