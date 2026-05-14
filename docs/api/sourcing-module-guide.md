# Module 4 — Sourcing (RFQ & Quotation)

**Use Cases:** US-61, 62, 63, 32, 64, UC30, UC31  
**Sprint:** Sprint 5 (Sourcing)

---

## Directory Structure

```
modules/sourcing/
├── sourcing.module.ts
├── rfq/
│   ├── rfq.controller.ts
│   ├── rfq.service.ts
│   └── rfq.dto.ts
├── quotation/
│   ├── quotation.controller.ts
│   ├── quotation.service.ts
│   └── quotation.dto.ts
└── search/
    ├── product-search.controller.ts
    └── product-search.service.ts
```

---

## Schema Requirements

### Table: `rfqs` — Additional Columns Required

The following columns **must be added** to the existing `rfqs` table before implementation:

| Column                  | Type           | Default | Purpose                                                                              |
| ----------------------- | -------------- | ------- | ------------------------------------------------------------------------------------ |
| `parent_rfq_id`         | `uuid \| null` | `null`  | Links a Child RFQ to its parent Draft RFQ. `null` = top-level draft.                 |
| `supplier_workspace_id` | `uuid \| null` | `null`  | The Supplier this Child RFQ is addressed to. Required for Supplier-side RLS queries. |
| `is_locked`             | `boolean`      | `false` | Set to `true` on submit. Blocks all further mutations to the RFQ and its items.      |

> Without `supplier_workspace_id`, Suppliers cannot query which RFQs are addressed to them. Without `is_locked`, there is no physical lock preventing item edits after submission.

### Table: `purchase_orders` — Snapshot Columns Required

The following columns **must be added** to `purchase_orders` to satisfy QAR-25 (Immutable PO Generation). These snapshot the exact agreed terms at the moment of quotation selection, so the PO remains valid even if the source Quotation is later altered or corrupted:

| Column                | Type        | Purpose                                   |
| --------------------- | ----------- | ----------------------------------------- |
| `final_unit_price`    | `integer`   | Snapshot of agreed unit price (BR-212)    |
| `final_payment_terms` | `text`      | Snapshot of agreed payment terms (BR-212) |
| `final_delivery_date` | `timestamp` | Snapshot of agreed delivery date (BR-212) |

> Never reference `quotation.unitPrice` from a PO at runtime. Always use the snapshot columns.

### Table: `quotations` — Column Rename Required (BR-217, BR-212)

The existing `quotations` table has a naming mismatch that will break the PO snapshot flow. Apply these changes before implementation:

| Action | Old Column                | New Column                | Type        |
| ------ | ------------------------- | ------------------------- | ----------- |
| Rename | `delivery_days` (integer) | `estimated_delivery_date` | `timestamp` |
| Add    | —                         | `delivery_terms`          | `text`      |

When executing `selectQuotation()` (US-64), map directly:

- `quotation.estimatedDeliveryDate` → `purchase_orders.final_delivery_date`
- `quotation.deliveryTerms` → `purchase_orders.final_payment_terms`

> The SRS term `delivery_terms` and the PO snapshot field `final_payment_terms` represent the same agreed terms. Map them explicitly — do not leave this implicit.

---

### Table: `negotiation_rounds` — New Table Required

This table is append-only. `UPDATE` and `DELETE` must be blocked at the database layer (trigger or policy). Each row represents one turn in a price negotiation round (UC30, BR-206).

| Column                   | Type        | Constraints             | Description                                                                                                    |
| ------------------------ | ----------- | ----------------------- | -------------------------------------------------------------------------------------------------------------- |
| `id`                     | `uuid`      | PK                      |                                                                                                                |
| `quotation_id`           | `uuid`      | FK → quotations         | The quotation this round belongs to                                                                            |
| `role`                   | `varchar`   | `'BUYER' \| 'SUPPLIER'` | Who submitted this round — used to enforce turn-based alternation                                              |
| `proposed_price`         | `integer`   | positive                | Price proposed in this round                                                                                   |
| `proposed_delivery_days` | `integer`   | positive                | Delivery days proposed (used in negotiation context only — does not map directly to `estimated_delivery_date`) |
| `note`                   | `text`      | nullable                | Optional message from the submitting party                                                                     |
| `is_accepted`            | `boolean`   | default `false`         | Set to `true` only via `accept-round` endpoint                                                                 |
| `submitted_by`           | `uuid`      | FK → users              | Actor who submitted                                                                                            |
| `submitted_at`           | `timestamp` | not null                | Immutable timestamp — the legal anchor for this round                                                          |

---

## API Endpoints

### Product Search — `BUYER_STAFF` only

| Method | Path               | Description                                                                                     |
| ------ | ------------------ | ----------------------------------------------------------------------------------------------- |
| `GET`  | `/products/search` | Cross-tenant product search (US-61). Constraints: pagination ≤ 25, reputation from Redis cache. |

### RFQ — role per row

| Method   | Path                      | Role                             | Description                                  |
| -------- | ------------------------- | -------------------------------- | -------------------------------------------- |
| `POST`   | `/rfqs`                   | `BUYER_STAFF`                    | Create a Draft RFQ (US-62)                   |
| `GET`    | `/rfqs`                   | `BUYER_STAFF` / `SUPPLIER_STAFF` | RLS-filtered list — see rules below          |
| `GET`    | `/rfqs/:id`               | `BUYER_STAFF` / `SUPPLIER_STAFF` | Get RFQ detail + items                       |
| `POST`   | `/rfqs/:id/items`         | `BUYER_STAFF`                    | Add item to a Draft RFQ                      |
| `PATCH`  | `/rfqs/:id/items/:itemId` | `BUYER_STAFF`                    | Update item quantity / notes                 |
| `DELETE` | `/rfqs/:id/items/:itemId` | `BUYER_STAFF`                    | Remove item from Draft RFQ                   |
| `POST`   | `/rfqs/:id/submit`        | `BUYER_STAFF`                    | Submit Draft → split into Child RFQs (US-63) |
| `DELETE` | `/rfqs/:id`               | `BUYER_STAFF`                    | Delete RFQ — only when `status = 'draft'`    |
| `GET`    | `/rfqs/:rfqId/quotations` | `BUYER_STAFF`                    | List quotations received for an RFQ          |

### Quotation — role per row

| Method  | Path                           | Role                             | Description                                                  |
| ------- | ------------------------------ | -------------------------------- | ------------------------------------------------------------ |
| `POST`  | `/rfqs/:rfqId/quotations`      | `SUPPLIER_STAFF`                 | Submit a quotation for a Child RFQ (US-32)                   |
| `GET`   | `/quotations/:id`              | `BUYER_STAFF` / `SUPPLIER_STAFF` | Get quotation detail                                         |
| `POST`  | `/quotations/:id/negotiate`    | `BUYER_STAFF` / `SUPPLIER_STAFF` | Submit a new negotiation round (UC30, append-only)           |
| `PATCH` | `/quotations/:id/accept-round` | `BUYER_STAFF` / `SUPPLIER_STAFF` | Accept the latest negotiation round to finalize terms (UC31) |
| `POST`  | `/quotations/:id/select`       | `BUYER_STAFF`                    | Select quotation → atomic PO creation (US-64, < 2s)          |

---

## Business Rules

### Product Search — `product-search.service.ts` (US-61)

Query: `products JOIN supplier_categories JOIN workspaces`

Mandatory filters:

- `products.status = 'active'`
- `workspaces.status = 'active'`
- `products.workspace_id != :buyerWorkspaceId` — Buyers must not see their own workspace's products

Sorting: `relevance | price | reputation_score`

Reputation score constraint: **must not** be calculated in real-time from the DB. Always read the pre-computed score from **Redis cache**. Computing reputation on-the-fly per request will breach the 2–3 second response SLA.

#### Catalog Session Persistence (BR-384)

`GET /products/search` must persist the Buyer's selected supplier filter in Redis:

- If the request includes a `supplier_workspace_ids` array: save it to Redis under key `session:search:{userId}` with a reasonable TTL (e.g. 24h).
- If the request omits `supplier_workspace_ids`: load the previously saved array from Redis and apply it as the default filter automatically.

This allows the Buyer's catalog selection to survive page reloads without re-selecting from scratch.

Pagination: max **25 items/page** (QAR-05). Required DB composite indexes:

- `(workspace_id, status, name)`
- `(workspace_id, status, sku)`

---

### RFQ Item Rules — `POST /rfqs/:id/items`

#### Auto-Merge Duplicate Products (BR-387)

If a Buyer adds the same product twice to a Draft RFQ, the system must **merge** the quantities rather than creating a duplicate row. Use Drizzle ORM upsert:

```sql
INSERT INTO rfq_items (rfq_id, product_id, quantity, ...)
VALUES (:rfqId, :productId, :quantity, ...)
ON CONFLICT (rfq_id, product_id)
DO UPDATE SET quantity = rfq_items.quantity + EXCLUDED.quantity;
```

The DB constraint `unique('uq_rfq_items_rfq_product')` on `(rfq_id, product_id)` must be present in the schema to back this upsert.

#### 200-Item Cap Per RFQ (ADD QAR)

Before executing the upsert, the service must check the current item count:

```sql
SELECT COUNT(*) FROM rfq_items WHERE rfq_id = :rfqId
```

If `count >= 200`, return `400 Bad Request` with message: `"RFQ cannot exceed 200 items"`. This cap ensures RFQ detail and quotation response payloads stay under 2MB and within the 2-second SLA.

---

### RFQ — Row-Level Security (RLS)

`GET /rfqs` applies different filters based on the caller's role:

- **`BUYER_STAFF`**: `WHERE buyer_workspace_id = :workspaceId` — sees all RFQs their workspace created
- **`SUPPLIER_STAFF`**: `WHERE supplier_workspace_id = :workspaceId AND parent_rfq_id IS NOT NULL` — sees only Child RFQs explicitly addressed to their workspace

> This is why `supplier_workspace_id` is required on the `rfqs` table. Without it, Suppliers have no way to query their incoming RFQs.

---

### Submit RFQ — `rfq.service.submitRfq()` (US-63)

This is a multi-step operation. All steps must execute within a single database transaction:

1. Validate the Draft RFQ has at least one item.
2. **Group** `rfqItems` by `supplier_workspace_id` (from the linked product's workspace).
3. For each Supplier group:
   - `INSERT INTO rfqs` a new Child RFQ with `parent_rfq_id = :draftRfqId`, `supplier_workspace_id = :supplierId`, `status = 'pending_response'`
   - `INSERT INTO rfq_items` cloned from the draft, linked to the new Child RFQ
4. **Lock the parent Draft RFQ**: `UPDATE rfqs SET status = 'pending_response', is_locked = true, submitted_at = NOW() WHERE id = :draftRfqId`
5. Fire push + email notifications to each addressed Supplier.
6. Write audit log: actor ID, IP, timestamp, list of generated Child RFQ IDs.

After `is_locked = true`, any `POST /rfqs/:id/items`, `PATCH /rfqs/:id/items/:itemId`, or `DELETE /rfqs/:id/items/:itemId` must return `409 Conflict`.

---

### Respond to RFQ — `quotation.service.respondToRfq()` (US-32)

1. Verify the RFQ is a Child RFQ addressed to the caller's `workspace_id` (`supplier_workspace_id = :workspaceId`).
2. Verify `rfq.status = 'pending_response'`.
3. Allow save as `draft` or `submit`.
4. On `submit`:
   - Set `quotation.status = 'submitted'`
   - Set `quotation.is_locked = false` (not yet selected, but immutable — no further edits)
   - `UPDATE rfqs SET status = 'responded' WHERE id = :rfqId`
5. Write audit log.

---

### Negotiation Rounds — `quotation.service` (UC30, BR-206)

#### `POST /quotations/:id/negotiate`

1. Verify `quotation.status = 'submitted'` and `is_locked = false`.
2. Determine caller's `role` (`BUYER` or `SUPPLIER`).
3. **Turn-based enforcement**: query the latest row in `negotiation_rounds` for this quotation. If `latest.role = callerRole`, return `409 Conflict` — the same party cannot submit two consecutive rounds.
4. `INSERT INTO negotiation_rounds` with `role`, `proposed_price`, `proposed_delivery_days`, `note`, `submitted_by`, `submitted_at = NOW()`, `is_accepted = false`.
5. This table is **append-only**. Never issue `UPDATE` or `DELETE` against `negotiation_rounds`.

#### `PATCH /quotations/:id/accept-round`

1. Verify it is the opposing party's turn (cannot accept your own proposal).
2. `UPDATE negotiation_rounds SET is_accepted = true WHERE id = :roundId`.
3. Update the parent quotation with the accepted `proposed_price` and `proposed_delivery_days` as the finalized terms.
4. Write audit log.

---

### Select Quotation — `quotation.service.selectQuotation()` (US-64)

This is the most critical operation in the system. The entire function must complete in **< 2 seconds**. All steps must be wrapped in a single atomic database transaction:

```typescript
await db.transaction(async (tx) => {
  // Step 1 — Pessimistic lock
  const quotation = await tx
    .select()
    .from(quotations)
    .where(eq(quotations.id, quotationId))
    .for('update') // SELECT FOR UPDATE — blocks concurrent selects
    .execute();

  // Step 2 — Guard conditions
  if (quotation.status !== 'submitted') throw new ConflictException();
  if (quotation.isLocked) throw new ConflictException();

  // Step 3 — Lock selected quotation
  await tx
    .update(quotations)
    .set({ status: 'selected', isLocked: true })
    .where(eq(quotations.id, quotationId));

  // Step 4 — Reject all other quotations for the same RFQ
  await tx
    .update(quotations)
    .set({ status: 'rejected' })
    .where(and(eq(quotations.rfqId, quotation.rfqId), ne(quotations.id, quotationId)));

  // Step 5 — Cancel Child RFQs from non-selected Suppliers (BR-403)
  await tx
    .update(rfqs)
    .set({ status: 'cancelled' })
    .where(
      and(
        eq(rfqs.parentRfqId, parentRfqId),
        ne(rfqs.supplierWorkspaceId, quotation.supplierWorkspaceId),
      ),
    );

  // Step 6 — Close the parent RFQ
  await tx.update(rfqs).set({ status: 'closed' }).where(eq(rfqs.id, parentRfqId));

  // Step 7 — Insert PO with price snapshot (QAR-25, BR-212)
  // NEVER reference quotation fields at runtime from the PO.
  // Copy all agreed values as static columns now.
  await tx.insert(purchaseOrders).values({
    id: uuid(),
    rfqId: quotation.rfqId,
    quotationId: quotation.id,
    buyerWorkspaceId: buyerWorkspaceId,
    supplierWorkspaceId: quotation.supplierWorkspaceId,
    finalUnitPrice: quotation.unitPrice, // snapshot
    finalPaymentTerms: quotation.deliveryTerms, // snapshot — map from quotations.delivery_terms
    finalDeliveryDate: quotation.estimatedDeliveryDate, // snapshot — map from quotations.estimated_delivery_date
    totalPrice: quotation.unitPrice * quotation.quantity,
    isLocked: true,
    status: 'pending_approval',
  });

  // Step 8 — Audit log (inside transaction)
  await auditLogger.logInTx(tx, {
    action: 'QUOTATION_SELECTED',
    actorId: actorId,
    quotationId: quotationId,
    ip: ipAddress,
    timestamp: new Date(),
  });
});
```

Any API call that attempts to modify a Quotation where `is_locked = true` must return `409 Conflict` immediately, before entering any transaction.

---

### RFQ / Item Mutation Guard

Before executing any write on `rfq_items` (add, update, delete), the service must check:

```sql
SELECT is_locked FROM rfqs WHERE id = :rfqId AND workspace_id = :workspaceId
```

If `is_locked = true`, return `409 Conflict`. This prevents item edits after submission regardless of `status`.

---

### Audit Logging

Every write operation must call `auditLogger.log()` (or `auditLogger.logInTx()` inside transactions) with: actor ID, action type, old/new value diff, IP address, timestamp.

Actions to log: `RFQ_CREATED`, `RFQ_SUBMITTED`, `QUOTATION_SUBMITTED`, `NEGOTIATION_ROUND_SUBMITTED`, `NEGOTIATION_ROUND_ACCEPTED`, `QUOTATION_SELECTED`.

---

## Implementation Checklist

### Schema (do first)

- [ ] Add `parent_rfq_id`, `supplier_workspace_id`, `is_locked` to `rfqs` table
- [ ] Rename `delivery_days` → `estimated_delivery_date` (timestamp) on `quotations` table; add `delivery_terms` (text) column
- [ ] Add `final_unit_price`, `final_payment_terms`, `final_delivery_date` to `purchase_orders` table
- [ ] Create `negotiation_rounds` table with all columns listed above
- [ ] Add DB-level append-only constraint on `negotiation_rounds` (block `UPDATE`/`DELETE` via trigger or RLS policy)
- [ ] Add composite indexes: `(workspace_id, status, name)` and `(workspace_id, status, sku)` on `products`

### Product Search

- [ ] Filter `products.status = 'active'`, `workspaces.status = 'active'`, exclude buyer's own workspace
- [ ] Load reputation score from Redis cache — never compute from DB at request time
- [ ] Enforce pagination max 25 items
- [ ] Persist `supplier_workspace_ids` filter to Redis on each search; load from Redis when param is absent (BR-384)

### RFQ

- [ ] `POST /rfqs`: create draft with `status = 'draft'`, `is_locked = false`
- [ ] `GET /rfqs`: apply RLS — Buyer sees own drafts, Supplier sees only Child RFQs with matching `supplier_workspace_id`
- [ ] `POST /rfqs/:id/items`: check `is_locked` first; then check item count < 200; then upsert with `ON CONFLICT DO UPDATE SET quantity += EXCLUDED.quantity` (BR-387)
- [ ] Other item mutation endpoints (`PATCH`, `DELETE`): check `is_locked` before any write; return `409` if locked
- [ ] `POST /rfqs/:id/submit`: group items by supplier → create Child RFQs → lock parent (`is_locked = true`) → notify Suppliers — all in one transaction
- [ ] `DELETE /rfqs/:id`: only allow when `status = 'draft'` and `is_locked = false`

### Quotation

- [ ] `POST /rfqs/:rfqId/quotations`: verify RFQ is a Child RFQ addressed to caller's workspace; verify `status = 'pending_response'`
- [ ] On quotation submit: set `status = 'submitted'`; update RFQ to `status = 'responded'`
- [ ] `POST /quotations/:id/negotiate`: enforce turn-based alternation by checking last round's `role`; append-only insert
- [ ] `PATCH /quotations/:id/accept-round`: verify opposing party is accepting; update round + quotation terms
- [ ] `POST /quotations/:id/select`: full atomic transaction per pseudocode above; complete in < 2s; snapshot all final\_\* fields into PO; reject competing quotations; cancel non-selected Child RFQs; audit log inside transaction
- [ ] Any mutation on a locked quotation (`is_locked = true`) returns `409 Conflict`
