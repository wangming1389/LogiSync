# Module 2 — Master Data (Platform Admin Catalog)

**Use Case:** US-11 — Manage Shared Data  
**Sprint:** Sprint 3 (Master Data + Catalog)  
**Scope:** `catalog_categories` and `units_of_measure`

---

## Directory Structure

```
modules/master-data/
├── master-data.module.ts
├── catalog-category/
│   ├── catalog-category.controller.ts
│   ├── catalog-category.service.ts
│   └── catalog-category.dto.ts
└── uom/
    ├── uom.controller.ts
    └── uom.service.ts
```

---

## API Endpoints

### Admin Endpoints — `PLATFORM_ADMIN` only

#### Catalog Categories

| Method  | Path                                    | Description                                                                       |
| ------- | --------------------------------------- | --------------------------------------------------------------------------------- |
| `POST`  | `/admin/catalog-categories`             | Create a new catalog category                                                     |
| `GET`   | `/admin/catalog-categories`             | List all categories (including inactive)                                          |
| `GET`   | `/admin/catalog-categories/:id`         | Get a single category by ID                                                       |
| `PATCH` | `/admin/catalog-categories/:id`         | Update name / description / code                                                  |
| `PATCH` | `/admin/catalog-categories/:id/disable` | Soft-disable a category — sets `is_active = false`, `disabled_at = NOW()` (BR-70) |
| `PATCH` | `/admin/catalog-categories/:id/enable`  | Re-enable a disabled category — sets `is_active = true`, clears `disabled_at`     |

#### Units of Measure

| Method  | Path                     | Description                                                                  |
| ------- | ------------------------ | ---------------------------------------------------------------------------- |
| `POST`  | `/admin/uom`             | Create a new unit of measure                                                 |
| `GET`   | `/admin/uom`             | List all UoM (including inactive)                                            |
| `GET`   | `/admin/uom/:id`         | Get a single UoM by ID                                                       |
| `PATCH` | `/admin/uom/:id`         | Update name / code                                                           |
| `PATCH` | `/admin/uom/:id/disable` | Soft-disable a UoM — sets `is_active = false`, `disabled_at = NOW()` (BR-70) |
| `PATCH` | `/admin/uom/:id/enable`  | Re-enable a disabled UoM — sets `is_active = true`, clears `disabled_at`     |

### Authenticated Endpoints — any logged-in user

| Method | Path                  | Description                                      |
| ------ | --------------------- | ------------------------------------------------ |
| `GET`  | `/catalog-categories` | List **active** categories (for dropdowns)       |
| `GET`  | `/uom`                | List **active** units of measure (for dropdowns) |

> Admin `GET` endpoints return all records including inactive ones. Authenticated `GET` endpoints enforce `WHERE is_active = 1` at the API layer (BR-76). There are no public single-record or write endpoints.

---

## Business Rules

### Uniqueness (BR-67, BR-68)

Each record must have a unique `name` **and** `code` across the entire platform. The uniqueness check runs on both fields simultaneously:

```sql
SELECT COUNT(*)
FROM [table]
WHERE (name = @name OR code = @code)
  AND id != @id
```

This validation applies to both `catalog_categories` and `units_of_measure`.

### Soft Disable / Re-enable (BR-70, BR-71)

Physical deletion of master data is strictly prohibited to preserve the integrity of historical transactions.

Disable:

```sql
UPDATE [table] SET is_active = false, disabled_at = NOW() WHERE id = @id
```

Re-enable:

```sql
UPDATE [table] SET is_active = true, disabled_at = NULL WHERE id = @id
```

Disabled records disappear from tenant dropdowns but remain referenced in existing orders and products without error.

> **Important:** The general `PATCH /:id` (update name / description / code) must **never** accept or modify `is_active`, `disabled_at`, or any status-related field. Status transitions are exclusively controlled by the `/disable` and `/enable` endpoints. The DTO for `PATCH /:id` must explicitly omit these fields.

### Cache Invalidation (BR-73)

After any create, update, disable, or re-enable action, the service must invalidate the Redis cache key `master-data:catalog-categories` via Redis Pub/Sub. All tenants must see the updated dropdown data within **< 1 second** — no service restart required.

The Pub/Sub cluster must maintain **≥ 20% spare capacity** below peak load (i.e., operate at ≤ 80% utilization). Synchronization bottlenecks must be detected and alerted within 1–2 minutes.

### Audit Logging (BR-75)

Every create, update, disable, and re-enable action must be written to the `audit_logs` table. Each log entry must include:

- Actor ID (user performing the action)
- Action type (create / update / disable / enable)
- Full old/new value diff
- IP address
- Timestamp

### Performance (BR-78)

Admin write operations (create, update, disable, re-enable) must respond in under **500ms**.

---

## Implementation Checklist

- [ ] `CatalogCategoryService`: full CRUD — create, list (all), get by ID, update, soft-disable, re-enable
- [ ] `CatalogCategoryService`: uniqueness check on both `name` and `code` before create/update
- [ ] `CatalogCategoryService`: `PATCH /:id` DTO must omit `is_active`, `disabled_at`, and all status fields
- [ ] `CatalogCategoryService`: soft-disable sets `is_active = false`, `disabled_at = NOW()`; re-enable sets `is_active = true`, `disabled_at = NULL`
- [ ] `CatalogCategoryService`: invalidate Redis cache key after every write (including re-enable)
- [ ] `UomService`: full CRUD — create, list (all), get by ID, update, soft-disable, re-enable
- [ ] `UomService`: uniqueness check on both `name` and `code` before create/update
- [ ] `UomService`: `PATCH /:id` DTO must omit `is_active`, `disabled_at`, and all status fields
- [ ] `UomService`: soft-disable sets `is_active = false`, `disabled_at = NOW()`; re-enable sets `is_active = true`, `disabled_at = NULL`
- [ ] Both services: write audit log entry on every create, update, disable, and re-enable
- [ ] Both controllers: authenticated `GET` dropdown endpoints filter `is_active = true`
- [ ] Guards: `PLATFORM_ADMIN` role guard applied to all `/admin/*` routes
