# LogiSync Backend Development Guidelines

This document outlines the strict conventions, architecture rules, and development workflows for the LogiSync Backend API. These rules are designed from the perspectives of Project Management (PM), Business Analysis (BA), System Architecture, and Software Engineering.

---

## 1. System Mindset & Perspectives

### 🎯 Project Manager (PM) & Business Analyst (BA)

- **Ubiquitous Language:** Code must speak the business language. If a business requirement talks about a "Quotation", the code must use `Quotation`, not `PriceEstimate`.
- **Traceability:** Every new feature must be fully documented via Swagger in the Controllers.
- **Feature Completeness:** A feature is only "Done" when it includes Zod validation, Audit Logs for critical actions, and strict RBAC authorization.

### 🏗 System Designer / Architect

- **Modular Monolith Architecture:** The system is divided into strict business domains (e.g., `iam`, `catalog`, `order`, `sourcing`).
- **Separation of Concerns:**
  - `src/core/`: Application-wide core configurations (Health, Audit, Security).
  - `src/infrastructure/`: Technical implementations (DB connections, AWS S3, Redis, MQ).
  - `src/modules/`: Pure business logic. **No technical configurations should be placed here.**
- **Domain Boundaries:** A module (e.g., `order`) **MUST NOT** directly query the database schema of another module (e.g., `iam`). Cross-module communication must happen via exposed Services or Message Queues.

### 💻 Developer

- **Strict Multi-tenant Isolation:** The platform serves multiple B2B companies (Workspaces). Cross-tenant data leakage is a critical vulnerability.
- **Transaction Safety:** Data consistency is paramount. Multi-step database mutations must be wrapped in a transaction (`tx`).

---

## 2. Global Coding Standards

### 🌐 Language Policy

- **English-Only Rule:** All variable names, function names, commit messages, and **in-code comments** MUST be written in English.
- _Why?_ To maintain international professional standards and ensure the codebase is approachable by global team members.

### 🚫 Forbidden Patterns

1. **NO Direct Database Calls in Services:** You must NEVER call `db.select()` or `getDatabase()` directly inside a `.service.ts` or `.controller.ts`. **Always use Repositories.**
2. **NO Hardcoded Strings:** Use Constants or Enums for statuses (e.g., `OrderStatus.PENDING`).
3. **NO Any Type:** Avoid `any` at all costs. Utilize Zod schemas to infer exact TypeScript types.

---

## 3. The Development Flow (Step-by-Step)

When implementing a new feature/domain, strictly follow this flow:

### Step 1: Database Schema (`*.schema.ts`)

Define the tables in the specific module folder (e.g., `src/modules/catalog/catalog.schema.ts`).

- Include `workspaceId` (Tenant ID) for all tenant-owned data.
- Apply `unique()` constraints scoped to the workspace (e.g., unique SKU per workspace).

### Step 2: DTOs & Validation (`*.dto.ts`)

Declare inputs using `nestjs-zod`.

```typescript
import { createZodDto } from 'nestjs-zod';
import { z } from 'nestjs-zod/z';

export const CreateProductSchema = z.object({
  name: z.string().min(1),
  price: z.number().int().positive(),
});
export class CreateProductDto extends createZodDto(CreateProductSchema) {}
```

### Step 3: Strict Repository (`*.repository.ts`)

Create a repository extending `BaseRepository`. All data access goes here.

- **Rule:** Pass an optional `tx?: any` parameter to all methods to support transactions.
- **Rule:** Use `this.getRequiredWorkspaceId()` for any queries related to tenant-isolated data.

```typescript
@Injectable()
export class ProductRepository extends BaseRepository {
  async findById(id: string, tx?: any) {
    const workspaceId = this.getRequiredWorkspaceId(); // Automatic Tenant Isolation
    const runner = tx || this.db;

    const [product] = await runner
      .select()
      .from(schema.products)
      .where(
        and(eq(schema.products.id, id), eq(schema.products.workspaceId, workspaceId)),
      );

    return product;
  }
}
```

### Step 4: Business Service (`*.service.ts`)

Inject the Repositories here. Manage business flow, validation, and Transaction borders.

```typescript
export class ProductService {
  constructor(private readonly productRepo: ProductRepository) {}

  async createProduct(dto: CreateProductDto) {
    // 1. Business Logic / Validation
    // 2. Wrap in transaction if multiple steps are needed
    // 3. Delegate to Repository
  }
}
```

### Step 5: Controller (`*.controller.ts`)

Expose the HTTP endpoints.

- **Rule:** MUST include Swagger decorators.
- **Rule:** MUST secure the route using appropriate Guards.

```typescript
  @Post()
  @UseGuards(JwtAuthGuard, RbacGuard)
  @Roles('company_admin', 'supplier_manager') // Strict RBAC
  @ApiOperation({ summary: 'Create a new product' })
  async create(@Body() dto: CreateProductDto) {
    return this.productService.createProduct(dto);
  }
```

---

## 4. Multi-Tenant Context & Security Rules

### The ALS (Async Local Storage) Lifeline

We use `nestjs-cls` to pass the `workspaceId` globally during an HTTP Request lifecycle.

1. The user sends a JWT.
2. `JwtAuthGuard` validates the token and writes the `workspaceId` into the CLS context.
3. The `BaseRepository` reads this context via `this.getRequiredWorkspaceId()`.

**Golden Rule:** If you are writing a background worker (Cronjob) or a Message Queue consumer, there is no HTTP Request and thus no JWT. You MUST manually wrap your background execution in a CLS context or use a System-level bypass.

### Audit Logging

Any action modifying critical resources (Approval, Rejection, Price Change, User Creation) MUST be appended to the Audit Log.
Use the injected `AuditLoggerService`:

```typescript
await this.auditLoggerService.logInTx(tx, {
  actorId: userId,
  workspaceId: workspaceId,
  action: 'PRODUCT_CREATE',
  resourceType: 'product',
  resourceId: product.id,
  changes: dto,
  ipAddress,
  status: 'success',
});
```

---

_By following these guidelines, we ensure the backend remains scalable, highly secure against Tenant Data leaks, and fully aligned with standard Enterprise Modular Monolith patterns._
