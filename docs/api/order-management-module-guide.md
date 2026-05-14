# Module 5 — Order Management

**Use Cases:** US-25, US-26, US-29, US-73, UC27, UC65, UC69  
**Sprint:** Sprint 6 (Order Management)

---

## Directory Structure

```
modules/order/
├── order.module.ts
├── order.controller.ts
├── order.service.ts
└── order.dto.ts
```

---

## Schema Requirements

### Table: `purchase_orders` — Additional Columns Required

| Column             | Type                | Default | Purpose                                                            |
| ------------------ | ------------------- | ------- | ------------------------------------------------------------------ |
| `assigned_to`      | `uuid \| null`      | `null`  | User ID currently responsible for this order                       |
| `rejection_reason` | `text \| null`      | `null`  | Required when `status = 'rejected'`                                |
| `auto_confirm_at`  | `timestamp \| null` | `null`  | Set to `NOW() + 48h` on approval; triggers background auto-confirm |

### Table: `goods_receipts` — Must Be Populated (UC73)

This table already exists in the schema but is never written to in the original blueprint. Every receipt confirmation — whether manual or automatic — **must** insert a row here. Without it, 3-way matching for accounting is impossible.

| Column              | Type           | Constraints          | Description                                     |
| ------------------- | -------------- | -------------------- | ----------------------------------------------- |
| `id`                | `uuid`         | PK                   |                                                 |
| `order_id`          | `uuid`         | FK → purchase_orders |                                                 |
| `confirmation_type` | `varchar`      | `'MANUAL' \| 'AUTO'` | Manual = Buyer action; Auto = background worker |
| `confirmed_by`      | `uuid \| null` | FK → users, nullable | `null` when `confirmation_type = 'AUTO'`        |
| `confirmed_at`      | `timestamp`    | not null             |                                                 |

### Table: `order_status_history` — New Table Required (BR-427)

Append-only. Every status transition on a `purchase_order` must insert a row here. `UPDATE` and `DELETE` are prohibited.

| Column         | Type           | Constraints          | Description                             |
| -------------- | -------------- | -------------------- | --------------------------------------- |
| `id`           | `uuid`         | PK                   |                                         |
| `order_id`     | `uuid`         | FK → purchase_orders |                                         |
| `status_value` | `varchar`      | not null             | The new status after the transition     |
| `changed_by`   | `uuid \| null` | FK → users           | `null` for system-triggered transitions |
| `changed_at`   | `timestamp`    | not null             |                                         |

### Table: `order_assignment_history` — New Table Required (BR-197, BR-416)

When an order is reassigned, the previous assignment must not be overwritten. Every assignment and reassignment inserts a new row.

| Column          | Type                | Constraints          | Description                            |
| --------------- | ------------------- | -------------------- | -------------------------------------- |
| `id`            | `uuid`              | PK                   |                                        |
| `order_id`      | `uuid`              | FK → purchase_orders |                                        |
| `assigned_to`   | `uuid`              | FK → users           | User assigned                          |
| `assigned_by`   | `uuid`              | FK → users           | Manager who made the assignment        |
| `assigned_at`   | `timestamp`         | not null             |                                        |
| `unassigned_at` | `timestamp \| null` |                      | Set when this assignment is superseded |

---

## API Endpoints

| Method  | Path                          | Role                                                                    | Description                                             |
| ------- | ----------------------------- | ----------------------------------------------------------------------- | ------------------------------------------------------- |
| `GET`   | `/orders`                     | `BUYER_STAFF` / `BUYER_MANAGER` / `SUPPLIER_STAFF` / `SUPPLIER_MANAGER` | List orders — filtered by role scope (see RLS rules)    |
| `GET`   | `/orders/:id`                 | Authenticated                                                           | Get order detail including status history               |
| `GET`   | `/orders/export`              | `BUYER_MANAGER` / `SUPPLIER_MANAGER`                                    | Export order history as XLSX or PDF (UC69)              |
| `PATCH` | `/orders/:id/approve`         | `SUPPLIER_STAFF`                                                        | Approve PO (US-25)                                      |
| `PATCH` | `/orders/:id/reject`          | `SUPPLIER_STAFF`                                                        | Reject PO with mandatory reason (US-26)                 |
| `PATCH` | `/orders/:id/confirm-receipt` | `BUYER_STAFF`                                                           | Confirm goods received (US-73)                          |
| `PATCH` | `/orders/:id/assign`          | `BUYER_MANAGER` / `SUPPLIER_MANAGER`                                    | Assign or reassign order to a staff member (UC27, UC65) |

---

## Business Rules

### GET /orders — Role-Based Data Scope (BR-200, BR-419)

The query filter applied depends strictly on the caller's role. This **must be enforced at the service layer**, not the frontend:

- **`BUYER_STAFF` / `SUPPLIER_STAFF`**: `WHERE workspace_id = :workspaceId AND assigned_to = :currentUserId`
  Staff see only orders explicitly assigned to them.
- **`BUYER_MANAGER` / `SUPPLIER_MANAGER`**: `WHERE workspace_id = :workspaceId`
  Managers see all orders in their workspace.

Never return orders outside the caller's workspace regardless of role.

---

### Approve Order — `order.service.approveOrder()` (US-25)

All steps must run inside a single `db.transaction()`. Notification fires **after** commit — never inside the transaction.

```typescript
await db.transaction(async (tx) => {
  // 1. Guard: ownership + status
  const order = await tx
    .select()
    .from(purchaseOrders)
    .where(
      and(
        eq(purchaseOrders.id, orderId),
        eq(purchaseOrders.supplierWorkspaceId, supplierWorkspaceId),
        eq(purchaseOrders.status, 'pending_approval'),
      ),
    )
    .for('update')
    .execute();

  if (!order) throw new ConflictException();

  // TODO: Phase 2 — Integrate Finance (Credit Check: outstanding_balance + order_value <= credit_limit)

  // 2. Update order
  await tx
    .update(purchaseOrders)
    .set({
      status: 'approved',
      approvedAt: new Date(),
      autoConfirmAt: new Date(Date.now() + 48 * 60 * 60 * 1000),
    })
    .where(eq(purchaseOrders.id, orderId));

  // 3. Status history (append-only)
  await tx.insert(orderStatusHistory).values({
    orderId,
    statusValue: 'approved',
    changedBy: actorId,
    changedAt: new Date(),
  });

  // 4. Audit log
  await auditLogger.logInTx(tx, { action: 'ORDER_APPROVED', actorId, orderId, ip });
});

// 5. Notify Buyer via RabbitMQ — only after transaction commits (SLA < 30s)
await notificationQueue.enqueue({ event: 'ORDER_APPROVED', orderId, buyerWorkspaceId });
```

---

### Reject Order — `order.service.rejectOrder()` (US-26, BR-187)

`RejectOrderDto` must require `rejectionReason: z.string().min(1)`. If empty or absent, return `400 Bad Request` before entering the service.

```typescript
await db.transaction(async (tx) => {
  // Guard: status must be 'pending_approval' — prevents race condition
  await tx
    .update(purchaseOrders)
    .set({
      status: 'rejected',
      rejectionReason: dto.rejectionReason,
    })
    .where(
      and(
        eq(purchaseOrders.id, orderId),
        eq(purchaseOrders.supplierWorkspaceId, supplierWorkspaceId),
        eq(purchaseOrders.status, 'pending_approval'),
      ),
    );

  await tx.insert(orderStatusHistory).values({
    orderId,
    statusValue: 'rejected',
    changedBy: actorId,
    changedAt: new Date(),
  });

  await auditLogger.logInTx(tx, { action: 'ORDER_REJECTED', actorId, orderId, ip });
});
```

---

### Confirm Receipt — `order.service.confirmReceipt()` (US-73)

Used by both the manual API endpoint and the background worker. Accepts `confirmationType: 'MANUAL' | 'AUTO'` and `confirmedBy: userId | null`.

```typescript
await db.transaction(async (tx) => {
  // Guard
  const order = await tx
    .select()
    .from(purchaseOrders)
    .where(and(eq(purchaseOrders.id, orderId), eq(purchaseOrders.status, 'approved')))
    .for('update')
    .execute();

  if (!order) throw new ConflictException();

  // 1. Update order
  await tx
    .update(purchaseOrders)
    .set({
      status: 'goods_received',
      goodsReceivedAt: new Date(),
    })
    .where(eq(purchaseOrders.id, orderId));

  // 2. Insert goods receipt record (required for 3-way matching)
  await tx.insert(goodsReceipts).values({
    orderId,
    confirmationType, // 'MANUAL' or 'AUTO'
    confirmedBy, // user.id for MANUAL, null for AUTO
    confirmedAt: new Date(),
  });

  // 3. Status history
  await tx.insert(orderStatusHistory).values({
    orderId,
    statusValue: 'goods_received',
    changedBy: confirmedBy,
    changedAt: new Date(),
  });

  // 4. Audit log
  await auditLogger.logInTx(tx, {
    action: 'GOODS_RECEIPT_CONFIRMED',
    actorId: confirmedBy ?? 'SYSTEM_SCHEDULER',
    orderId,
    ip,
  });

  // TODO: Phase 2 — Integrate Finance (INSERT INTO payables)
});

// 5. Publish event for Reputation Service — after commit
await eventBus.publish('EVENT_GOODS_RECEIPT_CONFIRMED', { orderId, supplierWorkspaceId });
```

> `EVENT_GOODS_RECEIPT_CONFIRMED` is consumed by the Reputation Service to recalculate the Supplier's score (BR-452). Publish only after the transaction commits.

---

### Assign Order — `order.service.assignOrder()` (UC27, UC65)

When reassigning, the previous assignment must be closed before the new one is written.

```typescript
await db.transaction(async (tx) => {
  // 1. Close current open assignment
  await tx
    .update(orderAssignmentHistory)
    .set({
      unassignedAt: new Date(),
    })
    .where(
      and(
        eq(orderAssignmentHistory.orderId, orderId),
        isNull(orderAssignmentHistory.unassignedAt),
      ),
    );

  // 2. Update assigned_to on the order
  await tx
    .update(purchaseOrders)
    .set({ assignedTo: dto.userId })
    .where(eq(purchaseOrders.id, orderId));

  // 3. Insert new assignment history row
  await tx.insert(orderAssignmentHistory).values({
    orderId,
    assignedTo: dto.userId,
    assignedBy: actorId,
    assignedAt: new Date(),
  });

  await auditLogger.logInTx(tx, { action: 'ORDER_ASSIGNED', actorId, orderId, ip });
});
```

---

### Export Orders — `GET /orders/export` (UC69, BR-431, BR-433)

- Accepted query params: `start_date`, `end_date` (both required), `format: 'xlsx' | 'pdf'`
- Maximum date range: **366 days**. Reject with `400 Bad Request` if exceeded.
- Response must be delivered in **< 10 seconds**.
- Only accessible by `BUYER_MANAGER` or `SUPPLIER_MANAGER`.

---

### Background Worker — `BackgroundWorkersService.settleConfirmations()`

Runs on a schedule (e.g. every 5 minutes). Processes orders where `auto_confirm_at <= NOW()`.

```typescript
const orders = await db
  .select()
  .from(purchaseOrders)
  .where(
    and(
      eq(purchaseOrders.status, 'approved'),
      lte(purchaseOrders.autoConfirmAt, new Date()),
    ),
  )
  .for('update')
  .skipLocked(); // idempotent — skip rows locked by concurrent workers

for (const order of orders) {
  await confirmReceipt({
    orderId: order.id,
    confirmationType: 'AUTO',
    confirmedBy: null,
    supplierWorkspaceId: order.supplierWorkspaceId,
  });
}
```

`SELECT FOR UPDATE SKIP LOCKED` is mandatory to prevent double-processing across concurrent worker instances.

---

### Architectural Constraints (ADD QAR-03)

- **Atomic Transaction**: Every service method that writes to `purchase_orders` must also write to `order_status_history` and `audit_logs` within the **same** `db.transaction()`. If any step fails, the entire operation rolls back.
- **Order-Before-Signal**: RabbitMQ/event bus calls must only execute **after** the DB transaction has committed. Never enqueue inside a transaction block. Violating this causes ghost notifications on rollback.
- **Notification SLA**: Push notifications to Buyer after approval must be delivered within **30 seconds** of the transaction commit.

---

### Audit Logging

Every write operation calls `auditLogger.logInTx()` inside the transaction. Actions to log:

`ORDER_APPROVED`, `ORDER_REJECTED`, `GOODS_RECEIPT_CONFIRMED`, `ORDER_ASSIGNED`

Each entry includes: actor ID (`'SYSTEM_SCHEDULER'` for background jobs), action type, old/new values, IP address, timestamp.

---

## Implementation Checklist

### Schema (do first)

- [ ] Add `assigned_to`, `rejection_reason`, `auto_confirm_at` to `purchase_orders`
- [ ] Verify `goods_receipts` table exists with `confirmation_type` and `confirmed_by` columns
- [ ] Create `order_status_history` table (append-only; block `UPDATE`/`DELETE`)
- [ ] Create `order_assignment_history` table

### Endpoints

- [ ] `GET /orders`: apply role-based scope — Staff filters by `assigned_to = currentUserId`; Manager filters by `workspace_id` only
- [ ] `GET /orders/:id`: include `order_status_history` rows in response
- [ ] `GET /orders/export`: validate date range ≤ 366 days; respond in < 10s; Manager role only
- [ ] `PATCH /orders/:id/approve`: atomic tx — update order + insert status history + audit log; enqueue RabbitMQ notification after commit; include `// TODO: Phase 2 - Integrate Finance (Credit Check & Payables)` comment
- [ ] `PATCH /orders/:id/reject`: require non-empty `rejectionReason` in DTO; atomic tx with race-condition guard on `status = 'pending_approval'`
- [ ] `PATCH /orders/:id/confirm-receipt`: call `confirmReceipt()` with `confirmationType = 'MANUAL'`; atomic tx — update order + insert `goods_receipts` + insert status history + audit log; publish `EVENT_GOODS_RECEIPT_CONFIRMED` after commit; include `// TODO: Phase 2 - Integrate Finance (Credit Check & Payables)` comment
- [ ] `PATCH /orders/:id/assign`: close previous open assignment in `order_assignment_history`; update `assigned_to` on order; insert new history row — all in one tx

### Background Worker

- [ ] Query `WHERE status = 'approved' AND auto_confirm_at <= NOW()` with `SELECT FOR UPDATE SKIP LOCKED`
- [ ] Call shared `confirmReceipt()` with `confirmationType = 'AUTO'`, `confirmedBy = null`
- [ ] Publish `EVENT_GOODS_RECEIPT_CONFIRMED` after each successful confirmation
