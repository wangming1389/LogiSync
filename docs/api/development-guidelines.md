# LogiSync Backend Development Guidelines

This document outlines the strict conventions, architecture rules, and development workflows for the LogiSync Backend API (Node.js / NestJS / Drizzle ORM). It is designed to maintain a clean, scalable, and highly secure Enterprise Modular Monolith.

---

## 1. Core Architecture & Mindset

### 1.1. Modular Monolith & Domain Boundaries
- The system is divided into strict business domains (e.g., `iam`, `catalog`, `order`, `sourcing`).
- A module **MUST NOT** directly query the database schema of another module. Cross-module communication must happen via exposed Services or Message Queues.
- **Separation of Concerns:**
  - `src/core/`: Application-wide core configurations (Health, Audit, Security, CLS, Background Workers).
  - `src/infrastructure/`: Technical implementations (DB connections, AWS S3 / MinIO, Redis, RabbitMQ).
  - `src/modules/`: Pure business logic. **No technical infrastructure configurations should be placed here.**

### 1.2. Strict Multi-Tenant Isolation
- The platform serves multiple B2B companies (Workspaces). Cross-tenant data leakage is a critical vulnerability.
- We use `nestjs-cls` (Continuation Local Storage) to pass the `workspaceId` globally throughout the lifecycle of an HTTP Request.
- The `BaseRepository` automatically intercepts queries and enforces tenant isolation using `this.getRequiredWorkspaceId()`.

### 1.3. Clean Code & Programming Paradigms
- **Functional Core, Imperative Shell**: Favor functional programming (pure functions, immutability) for core business logic and state calculations. Keep procedural/imperative code (DB calls, state mutations) strictly at the outer edges (the "shell").
- **SOLID Principles**: Apply SOLID principles consistently. Use Design Patterns when they solve a real problem, but **do not over-engineer**. Keep abstractions simple.
- **Separation of Abstraction Levels**: Do not mix high-level business logic with low-level technical implementation details in the same method (e.g., manipulating byte streams directly inside an order pricing algorithm).

---

## 2. Universal Anti-Patterns & Code Smells (The "Don'ts")

To prevent painful technical debt, developers MUST avoid the following anti-patterns:

### 2.1. The "God Class" Prevention
- **The Smell**: Services like `order.service.ts` or `product.service.ts` growing beyond 500 lines of code.
- **The Cure**: Apply **CQRS** (split Read/Write operations) or the **Facade Pattern** (delegate sub-tasks like calculating totals or sending notifications to smaller, specialized domain services).

### 2.2. Eliminating the `any` Type
- **The Smell**: Using `data: any` to bypass the TypeScript compiler.
- **The Cure**: Use exact types inferred from Drizzle schema (`typeof schema.products.$inferSelect`) or Zod DTOs.
- *Exception*: Using `tx?: any` in Repository parameters is an acceptable compromise due to Drizzle ORM's complex generic transaction types, but MUST be strictly confined to Repositories.

### 2.3. Asynchronous Bottlenecks
- **The Smell**: Processing large files (e.g., Exporting Excel with huge datasets) directly inside an HTTP Controller/Service.
- **The Cure**: Node.js is single-threaded. Heavy I/O or CPU tasks MUST be offloaded to **RabbitMQ** and processed by a Background Worker. The API should return `202 Accepted`.

### 2.4. General Clean Code Rules
- **Ambiguous Code**: Code must clearly state its intent. If it needs a long comment to explain *what* it does, rewrite it.
- **Long Methods**: Break down long functions into smaller, testable private methods.
- **Magic Constants**: Never use raw numbers or hardcoded strings (`status === 2`). Extract them to descriptive Enums (`status === OrderStatus.COMPLETED`).
- **Unexpressive Naming**: Variables must be descriptive (`calculateTotalOrderValue()` instead of `calcVal()`).
- **Direct DB Calls**: NEVER call `db.select()` inside a `.service.ts` or `.controller.ts`. Always use Repositories.

---

## 3. The Standard Development Flow

When implementing a new feature, strictly follow this step-by-step flow:

### Step 1: Database Schema (`*.schema.ts`)
Define the tables in the specific module folder.
- Include `workspaceId` (Tenant ID) for all tenant-owned data.
- Apply `unique()` constraints scoped to the workspace (e.g., unique SKU per workspace).

### Step 2: DTOs & Validation (`*.dto.ts`)
Declare inputs using `nestjs-zod`.
```typescript
export const CreateProductSchema = z.object({
  name: z.string().min(1),
  price: z.number().int().positive(),
});
export class CreateProductDto extends createZodDto(CreateProductSchema) {}
```

### Step 3: Strict Repository (`*.repository.ts`)
Create a repository extending `BaseRepository`. All data access goes here.
- Pass an optional `tx?: any` parameter to all methods to support transactions.
- Use `this.getRequiredWorkspaceId()` for tenant-isolated queries.

```typescript
@Injectable()
export class ProductRepository extends BaseRepository {
  async findById(id: string, tx?: any) {
    const workspaceId = this.getRequiredWorkspaceId();
    const runner = tx || this.db;
    return runner.select().from(schema.products).where(...);
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
    // 2. Wrap in transaction via repo.runInTransaction()
    // 3. Delegate to Repository
  }
}
```

### Step 5: Controller (`*.controller.ts`)
Expose the HTTP endpoints.
- MUST include Swagger decorators (`@ApiOperation`).
- MUST secure the route using `@UseGuards(JwtAuthGuard)` and `@Roles(...)`.

---

## 4. Security & Operational Rules

### 4.1. Background Contexts
**Golden Rule:** If you are writing a background worker (Cronjob) or a Message Queue consumer, there is no HTTP Request and thus no JWT. You MUST manually wrap your background execution in a CLS context to bypass or simulate tenant isolation.

### 4.2. Immutable Audit Logging
Any action modifying critical resources (Approval, Rejection, Price Change, User Creation) MUST be appended to the Audit Log.
```typescript
await this.auditLoggerService.logInTx(tx, {
  actorId: userId,
  workspaceId: workspaceId,
  action: 'PRODUCT_CREATE',
  resourceType: 'product',
  // ...
});
```

### 4.3. Test Traceability
Every new feature or security rule MUST map directly to a Unit or E2E test case, tagged with a standard ID (e.g., `TC-ORD-12`). These mappings must be maintained in the module's `README.md`.

---

*By rigorously following these guidelines, the LogiSync Backend will remain scalable, maintainable, and highly secure against enterprise-level vulnerabilities.*
