# Module 3 — Supplier Catalog

**Use Cases:** US-19, 20, 21, 22, 23, 24  
**Sprint:** Sprint 4 (Supplier Catalog)

---

## Directory Structure

```
modules/catalog/
├── catalog.module.ts
├── supplier-category/
│   ├── supplier-category.controller.ts
│   ├── supplier-category.service.ts
│   └── supplier-category.dto.ts
└── product/
    ├── product.controller.ts
    ├── product.service.ts
    └── product.dto.ts
```

---

## API Endpoints

### Supplier Category — `SUPPLIER_STAFF` only

| Method   | Path                                   | Description                                                        |
| -------- | -------------------------------------- | ------------------------------------------------------------------ |
| `POST`   | `/catalog/categories`                  | Create a supplier category (US-19)                                 |
| `GET`    | `/catalog/categories`                  | List categories in the caller's workspace                          |
| `GET`    | `/catalog/categories/:id`              | Get category detail                                                |
| `GET`    | `/catalog/categories/check-name?name=` | Real-time unique name check (UX, BR-152)                           |
| `PATCH`  | `/catalog/categories/:id`              | Update name / description (US-20)                                  |
| `DELETE` | `/catalog/categories/:id`              | Soft-delete — sets `is_active = false` (blocked if products exist) |

### Product — `SUPPLIER_STAFF` only

| Method   | Path                                  | Description                                                               |
| -------- | ------------------------------------- | ------------------------------------------------------------------------- |
| `POST`   | `/catalog/products`                   | Create a product — status defaults to `draft` (US-21)                     |
| `GET`    | `/catalog/products`                   | List products in the caller's workspace with filters + pagination (US-24) |
| `GET`    | `/catalog/products/:id`               | Get product detail                                                        |
| `GET`    | `/catalog/products/check-sku?sku=`    | Real-time unique SKU check (on-the-fly UX)                                |
| `GET`    | `/catalog/products/:id/price-history` | Retrieve price change history from `product_price_history`                |
| `PATCH`  | `/catalog/products/:id`               | Update product details — omits `sku` and `status` (US-22)                 |
| `PATCH`  | `/catalog/products/:id/publish`       | Transition `draft → active`                                               |
| `PATCH`  | `/catalog/products/:id/unpublish`     | Transition `active → inactive` (US-23)                                    |
| `DELETE` | `/catalog/products/:id`               | Hard delete — only allowed when `status = 'draft'`                        |

---

## Business Rules

### Workspace Isolation

`workspace_id` is always extracted from the JWT. It must **never** be accepted from the request body. All queries must include `WHERE workspace_id = :workspaceId` to prevent cross-tenant data access.

### Uniqueness

- **Category name** must be unique per workspace: enforced by DB constraint `UNIQUE(workspace_id, name)` (BR-152).
- **SKU** must be unique per workspace: enforced by DB constraint `UNIQUE(workspace_id, sku)`.
- Both `/check-name` and `/check-sku` endpoints execute a lightweight existence query and return `{ available: true | false }` for real-time UX validation without submitting the full form.

### Cross-module Reference Integrity

Before creating a supplier category, the service must verify that the provided `catalogCategoryId` exists in the `catalog_categories` table (Module 2) **and** has `is_active = true`. Reject with `400 Bad Request` if not.

Before creating a product, the service must verify that the provided `uomId` exists in the `units_of_measure` table (Module 2) **and** has `is_active = true`. Reject with `400 Bad Request` if not.

### Product State Machine

```
         ┌──────────(publish)──────────┐
         │                             ▼
draft ───┴──(publish)──▶ active ──(unpublish)──▶ inactive
                                       ▲              │
                                       └───(publish)──┘
```

- All products are created with `status = 'draft'`.
- `PATCH /:id/publish` is callable from both `draft` and `inactive`. It sets `status = 'active'` in both cases. This allows suppliers to re-list a previously unpublished product without creating a new record.
- `PATCH /:id/unpublish` sets `status = 'inactive'`. Only callable when current status is `active`.
- There is no direct `inactive → draft` transition. Re-publishing goes straight to `active`.
- The SRS term `is_visible` does not exist in the DB schema. Map it as: `PUBLISHED → active`, `HIDDEN → inactive`. Never add an `is_visible` column.
- Buyer-facing search queries (US-61) must filter `WHERE status = 'active'`.

### SKU Immutability (BR-167)

SKU must never be modified after creation. `UpdateProductDto` must use `.omit({ sku: true })`. If a request body contains `sku`, return `400 Bad Request`.

### Status Field Protection

`PATCH /:id` (general update) must **never** accept or modify `status`. Status transitions are exclusively handled by `/publish` and `/unpublish`. The `UpdateProductDto` must explicitly omit `status`.

### Price Update — Atomic Transaction

When `PATCH /:id` includes a changed `unitPrice`, the service must wrap the following in a single database transaction:

1. Check that the new price differs from the current price.
2. `INSERT INTO product_price_history (product_id, unit_price, changed_by)` with the **old** price.
3. `UPDATE products SET unit_price = :newPrice WHERE id = :id`.

If either step fails, the transaction must roll back entirely.

`unitPrice` validation: `z.number().int().positive()` (positive integer only). Use `unitPrice` consistently across DTO and DB schema — ignore the SRS term `reference_price`.

### Soft Delete — Category

`DELETE /catalog/categories/:id` must **never** execute a SQL `DELETE`. Execute instead:

```sql
UPDATE supplier_categories
SET is_active = false
WHERE id = :id AND workspace_id = :workspaceId
```

Before soft-deleting, the service must check:

```sql
SELECT COUNT(*) FROM products WHERE supplier_category_id = :id
```

If count > 0, reject with `409 Conflict` — cannot delete a category that has linked products.

All `GET` queries for categories must automatically append `WHERE is_active = true`.

### Product Delete

Hard delete is only allowed when `status = 'draft'`. If `status` is `active` or `inactive`, return `409 Conflict`. Users who no longer want to sell a product must call `PATCH /:id/unpublish` instead.

### Unpublish — Open RFQ Warning (BR-175)

When `PATCH /:id/unpublish` is called, check whether the product is referenced in any RFQ with `status = 'pending_response'`. Do **not** block the operation, but include a warning in the response:

```json
{
  "data": { ... },
  "warning": "This product is referenced in one or more open RFQs."
}
```

### Image Upload (BR-163)

All product and category image uploads must be validated at the Gateway layer: `file size <= 5MB`.

**Flow:**

1. Frontend uploads file directly to MinIO.
2. MinIO returns the internal object key (e.g. `products/abc123.jpg`).
3. Frontend sends the array of keys to the API (`image_urls` field, stored as `JSONB`).

**Serialization (mandatory):** Before returning any product or category response, `product.service.ts` must call `SignedUrlService` to convert every internal key in `image_urls` into a Signed URL with **1-hour TTL**. Never return raw internal paths to the frontend — all MinIO buckets are private (ADD QAR-17, BR-539). Broken images will result if this step is skipped.

### Pagination — GET /catalog/products (ADD QAR-05)

Pagination is mandatory. Maximum page size is **25 items**. Use `limit` and `offset` in Drizzle ORM queries.

The database must have a composite index on `(workspace_id, status)`.

Supported query parameters:

| Parameter    | Type                          | Description                      |
| ------------ | ----------------------------- | -------------------------------- |
| `keyword`    | `string`                      | Search against `name` or `sku`   |
| `categoryId` | `uuid`                        | Filter by `supplier_category_id` |
| `status`     | `draft \| active \| inactive` | Filter by product status         |
| `minPrice`   | `integer`                     | Minimum `unit_price`             |
| `maxPrice`   | `integer`                     | Maximum `unit_price`             |
| `sortBy`     | `name \| price \| updatedAt`  | Sort field                       |
| `order`      | `asc \| desc`                 | Sort direction                   |
| `limit`      | `integer`                     | Page size, max 25                |
| `offset`     | `integer`                     | Pagination offset                |

### Audit Logging

Every write operation (create, update, publish, unpublish, delete, soft-delete) must call `auditLogger.log()` with: actor ID, action type, old/new value diff, IP address, and timestamp.

---

## Implementation Checklist

### Supplier Category

- [ ] `POST /catalog/categories`: validate `catalogCategoryId` is active in Module 2 before insert
- [ ] `GET /catalog/categories`: always filter `WHERE is_active = true`
- [ ] `GET /catalog/categories/check-name`: lightweight existence query, return `{ available: bool }`
- [ ] `DELETE /catalog/categories/:id`: check for linked products before soft-delete; execute `UPDATE is_active = false`, never SQL DELETE
- [ ] `UpdateSupplierCategoryDto`: omit `is_active` and all status fields

### Product

- [ ] `POST /catalog/products`: default `status = 'draft'`; validate `uomId` is active in Module 2
- [ ] `GET /catalog/products`: enforce pagination (max 25); apply all filters; composite index on `(workspace_id, status)`
- [ ] `GET /catalog/products/check-sku`: lightweight existence query, return `{ available: bool }`
- [ ] `GET /catalog/products/:id/price-history`: query `product_price_history` by `product_id`
- [ ] `PATCH /catalog/products/:id`: `UpdateProductDto` must omit `sku` and `status`; wrap price change in atomic transaction (insert history → update price)
- [ ] `PATCH /catalog/products/:id/publish`: accept `status = 'draft'` **or** `status = 'inactive'`; set `status = 'active'`
- [ ] `PATCH /catalog/products/:id/unpublish`: guard `current status = 'active'`; set `status = 'inactive'`; check open RFQs and return warning if found
- [ ] `DELETE /catalog/products/:id`: only allow when `status = 'draft'`; reject otherwise with `409`
- [ ] All GET responses: call `SignedUrlService` to convert `image_urls` keys to 1h Signed URLs before returning
- [ ] All write operations: call `auditLogger.log()`
- [ ] Guards: `SUPPLIER_STAFF` role guard on all `/catalog/*` routes
- [ ] `workspace_id` sourced exclusively from JWT — never from request body
