# Implementation Plan: Admin Notifications & HR First-Login Flow

## Codebase Audit — Vấn đề của plan cũ

Sau khi audit toàn bộ codebase, tôi tìm được **12 vấn đề** cần điều chỉnh trong plan cũ:

### 🔴 Vấn đề nghiêm trọng (sẽ gây lỗi runtime)

| # | Vấn đề | Giải thích |
|---|--------|-----------|
| 1 | **changeToken bị JwtStrategy reject ngay lập tức** | [jwt.strategy.ts](file:///d:/uit/nam3-ky2/do-an-2/logisync/apps/api/src/modules/iam/auth/strategies/jwt.strategy.ts#L53-L56) yêu cầu `payload.sessionId` tồn tại trong Redis. Nếu changeToken không có sessionId hoặc không có Redis session → JwtStrategy throw 401. Không thể dùng `JwtAuthGuard` cho endpoint `/auth/complete-registration`. |
| 2 | **MessageQueueModule không phải Global** | [message-queue.module.ts](file:///d:/uit/nam3-ky2/do-an-2/logisync/apps/api/src/infrastructure/message-queue/message-queue.module.ts) không có `@Global()`. [IamModule](file:///d:/uit/nam3-ky2/do-an-2/logisync/apps/api/src/modules/iam/iam.module.ts) hiện không import `MessageQueueModule`. Nếu inject `MessageQueueService` vào WorkspaceService mà không import module → NestJS DI sẽ crash. |
| 3 | **Schema barrel file thiếu notification** | [schema.ts](file:///d:/uit/nam3-ky2/do-an-2/logisync/apps/api/src/infrastructure/database/schema.ts) là file re-export tất cả schema cho Drizzle ORM. Nếu tạo `notification.schema.ts` mà không thêm vào file này → Drizzle migration sẽ không nhận bảng mới. |
| 4 | **Notification Repository + CLS context conflict** | Consumer chạy từ RabbitMQ không có HTTP request → không có `workspaceId` trong CLS. Nếu NotificationRepository extends `BaseRepository` và gọi `getRequiredWorkspaceId()` → throw `UnauthorizedException`. Platform Admin notifications là cross-tenant, không nên bị workspace isolation. |

### 🟡 Vấn đề thiết kế (sẽ gây inconsistency hoặc tech debt)

| # | Vấn đề | Giải thích |
|---|--------|-----------|
| 5 | **EmailService nên ở `infrastructure/` không phải `modules/notification/`** | Theo [development-guidelines.md](file:///d:/uit/nam3-ky2/do-an-2/logisync/docs/api/development-guidelines.md#L14-L15): `infrastructure/` = technical implementations, `modules/` = pure business logic. Email delivery (SMTP) là technical infrastructure. |
| 6 | **nanoid chưa được install** | `nanoid` không có trong `package.json`. Codebase chỉ dùng `crypto.randomBytes` cho session ID generation ([session-registry.service.ts:268](file:///d:/uit/nam3-ky2/do-an-2/logisync/apps/api/src/core/session/session-registry.service.ts#L267-L268)). Nên dùng `crypto` cho nhất quán, tránh thêm dependency. |
| 7 | **Employee module structure thiếu** | Plan chỉ đề cập `services/employee.service.ts` mà thiếu controller, DTOs, repository theo đúng pattern sub-domain của project: `auth/` và `workspace/` đều có đầy đủ `controllers/`, `dtos/`, `repositories/`, `services/`. |
| 8 | **AuditAction enum thiếu actions mới** | [audit.enums.ts](file:///d:/uit/nam3-ky2/do-an-2/logisync/apps/api/src/core/audit/enums/audit.enums.ts) chưa có `EMPLOYEE_CREATE_*` hay `FIRST_LOGIN_PASSWORD_CHANGED`. Cần bổ sung. |
| 9 | **Email uniqueness check cho employee** | `email` trong [iam.schema.ts](file:///d:/uit/nam3-ky2/do-an-2/logisync/apps/api/src/modules/iam/iam.schema.ts#L47) có `.unique()` globally. Khi HR tạo employee, cần check email trùng cross-workspace. Method `findByEmailForAuth()` đã bypass workspace isolation → có thể tái sử dụng. |
| 10 | **UserRepository.update() enforce workspace isolation** | [user.repository.ts:55](file:///d:/uit/nam3-ky2/do-an-2/logisync/apps/api/src/modules/iam/auth/repositories/user.repository.ts#L50-L65) gọi `getRequiredWorkspaceId()`. Khi `completeRegistration()` chạy, CLS context sẽ không có workspaceId (vì changeToken không đi qua JwtAuthGuard). Cần thêm method `updateWithoutWorkspaceIsolation()` hoặc truyền workspaceId vào guard rồi set CLS. |
| 11 | **Publish event PHẢI nằm ngoài transaction** | `workspace.service.ts register()` dùng `databaseService.withTransaction()`. Nếu publish RabbitMQ event bên trong transaction → event bị publish trước khi commit → consumer có thể đọc data chưa tồn tại. Event phải publish sau khi transaction commit thành công. |
| 12 | **DLQ config ảnh hưởng toàn bộ queue** | Nếu sửa `publishMessage` / `consumeMessage` thêm DLQ args vào `assertQueue`, mọi queue (kể cả healthcheck) đều bị ảnh hưởng. Cần method riêng hoặc optional config. |

---

## Proposed Changes (Đã fix 12 vấn đề)

### Phase 0: Infrastructure & Shared Code

#### [NEW] `apps/api/src/infrastructure/email/email.service.ts`
- Tách logic nodemailer từ [health-check.service.ts](file:///d:/uit/nam3-ky2/do-an-2/logisync/apps/api/src/core/health/services/health-check.service.ts#L106-L133) ra thành service riêng.
- Đặt trong `infrastructure/` theo đúng convention (**fix issue #5**).
- Inject `ConfigService` để lấy SMTP config (đã có trong `.env.example`: `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`).
- Export method: `sendMail(to, subject, text, html?)`.

#### [NEW] `apps/api/src/infrastructure/email/email.module.ts`
- Module export `EmailService`, available for import by business modules.

#### [MODIFY] `apps/api/src/infrastructure/message-queue/message-queue.service.ts`
- Thêm method `publishWithDLQ(queue, message, dlqQueue)` (**fix issue #12**):
  - Assert queue với `x-dead-letter-exchange: ''` và `x-dead-letter-routing-key: dlqQueue`.
  - Assert DLQ queue riêng.
  - Send persistent message.
- Thêm method `consumeWithRetry(queue, callback, maxRetries, dlqQueue)`:
  - Track retry count via message headers (`x-retry-count`).
  - Exponential backoff (1s, 2s, 4s) bằng cách re-publish với delay header rồi ack message gốc.
  - Khi vượt `maxRetries` → publish vào DLQ, ack message gốc.
- Giữ nguyên `publishMessage` / `consumeMessage` hiện tại (backward compatible).

#### [MODIFY] `apps/api/src/core/audit/enums/audit.enums.ts`
- Thêm actions mới (**fix issue #8**):
```typescript
EMPLOYEE_CREATE_SUCCESS = 'EMPLOYEE_CREATE_SUCCESS',
EMPLOYEE_CREATE_FAILED = 'EMPLOYEE_CREATE_FAILED',
AUTH_FIRST_LOGIN_PASSWORD_CHANGED = 'AUTH_FIRST_LOGIN_PASSWORD_CHANGED',
AUTH_FIRST_LOGIN_PASSWORD_CHANGE_FAILED = 'AUTH_FIRST_LOGIN_PASSWORD_CHANGE_FAILED',
```

---

### Phase 1: Database Schema

#### [MODIFY] `apps/api/src/modules/iam/iam.schema.ts`
- Thêm `mustChangePassword` vào bảng `users`:
```typescript
mustChangePassword: boolean('must_change_password').notNull().default(false),
```

#### [NEW] `apps/api/src/modules/notification/notification.schema.ts`
- Bảng `notifications`:
  - `id` (uuid PK), `title` (varchar 255), `content` (text), `type` (varchar 50, ví dụ: 'workspace_pending', 'account_created')
  - `referenceId` (uuid nullable — trỏ tới workspace/user liên quan)
  - `createdAt` (timestamp)
  - **Không có `workspaceId`** — notifications cho Platform Admin là cross-tenant.
- Bảng `userNotifications`:
  - `id` (uuid PK), `userId` (uuid FK → users), `notificationId` (uuid FK → notifications)
  - `isRead` (boolean default false), `deliveredAt` (timestamp), `readAt` (timestamp nullable)

#### [MODIFY] `apps/api/src/infrastructure/database/schema.ts`
- Thêm re-export (**fix issue #3**):
```typescript
export * from '../../modules/notification/notification.schema';
```

---

### Phase 2: Notification Module (Feature 1 — In-app + Email cho Admin)

#### [NEW] `apps/api/src/modules/notification/notification.module.ts`
- Imports: `MessageQueueModule`, `EmailModule`.
- Providers: `NotificationService`, `NotificationRepository`, `WorkspacePendingConsumer`, `AccountCreatedConsumer`.
- Exports: `NotificationService`.

#### [NEW] `apps/api/src/modules/notification/repositories/notification.repository.ts`
- **KHÔNG extend `BaseRepository`** (**fix issue #4**).
- Inject `ClsService` nhưng dùng `getOptionalWorkspaceId()` hoặc `getDatabase()` trực tiếp cho cross-tenant queries.
- Methods:
  - `createNotification(data, tx?)` — insert vào `notifications` table.
  - `createUserNotifications(entries[], tx?)` — batch insert vào `userNotifications`.
  - `findAllPlatformAdmins()` — query `users WHERE role = 'platform_admin' AND is_active = true` (cross-workspace, KHÔNG dùng workspace isolation).
  - `findUserNotifications(userId, pagination)` — query notifications cho 1 user cụ thể.
  - `markAsRead(userId, notificationId)`.

#### [NEW] `apps/api/src/modules/notification/services/notification.service.ts`
- Method: `notifyPlatformAdmins(title, content, type, referenceId)`:
  1. Gọi `notificationRepository.findAllPlatformAdmins()`.
  2. Insert 1 record vào `notifications`.
  3. Batch insert N records vào `userNotifications` (1 per admin).
  4. Gọi `emailService.sendMail()` cho từng admin.
- Method: `getUserNotifications(userId, pagination)` — cho API endpoint để FE poll.
- Method: `markAsRead(userId, notificationId)`.

#### [NEW] `apps/api/src/modules/notification/consumers/workspace-pending.consumer.ts`
- `OnModuleInit`: subscribe RabbitMQ queue `workspace.pending`.
- Consumer callback:
  1. Wrap trong `cls.run()` để tạo CLS context (**đúng Rule 4.1 trong dev guidelines**).
  2. Gọi `notificationService.notifyPlatformAdmins(...)`.

#### [MODIFY] `apps/api/src/modules/iam/iam.module.ts`
- Thêm `MessageQueueModule` vào imports (**fix issue #2**).

#### [MODIFY] `apps/api/src/modules/iam/workspace/services/workspace.service.ts`
- Inject `MessageQueueService`.
- Trong `register()`: publish `workspace.pending` event **SAU** transaction commit (**fix issue #11**):
```typescript
const result = await this.databaseService.withTransaction(async (tx) => {
    // ... existing code ...
    return workspace;
});
// Publish AFTER commit
await this.messageQueueService.publishMessage('workspace.pending', {
    workspaceId: result.id,
    workspaceName: result.name,
    registeredAt: result.createdAt,
});
return result;
```

#### [MODIFY] `apps/api/src/app.module.ts`
- Thêm `NotificationModule`, `EmailModule` vào imports.

---

### Phase 3: Employee Module (Feature 2 — HR Add Employee)

#### [NEW] `apps/api/src/modules/iam/employee/` (**fix issue #7**, đầy đủ structure)

##### `employee/dtos/employee.dto.ts`
- `CreateEmployeeSchema` (Zod): email, firstName, lastName, role (từ `WORKSPACE_ENABLEABLE_ROLES`), department (string).
- Validate email format, role phải thuộc enum.

##### `employee/controllers/employee.controller.ts`
- `POST /employees` — Guarded by `JwtAuthGuard`, check permission `hr:manage`.
- Swagger decorators đầy đủ.

##### `employee/services/employee.service.ts`
- Method: `addEmployee(dto, actorPayload, ipAddress)`:
  1. Check email uniqueness bằng `userRepository.findByEmailForAuth(dto.email)` (cross-workspace) (**fix issue #9**).
  2. Generate temp password bằng `crypto.randomBytes(9).toString('base64url')` rồi đảm bảo complexity (**fix issue #6**, nhất quán với codebase).
  3. Hash via `authService.hashPassword(tempPassword)` (reuse existing public method).
  4. `databaseService.withTransaction()`:
     - Insert user với `mustChangePassword: true`, `isActive: true`, `role: dto.role`.
     - Audit log `EMPLOYEE_CREATE_SUCCESS`.
  5. **Sau transaction**: publish `account.created` event lên RabbitMQ bằng `publishWithDLQ('account.created', payload, 'account.created.dlq')`.
     - Payload chứa `{ userId, email, tempPassword, workspaceName }`.
     - `tempPassword` chỉ tồn tại trong RabbitMQ message, không log, không lưu DB.

#### [MODIFY] `apps/api/src/modules/iam/iam.module.ts`
- Thêm `EmployeeController`, `EmployeeService` vào module declarations.

---

### Phase 4: First-Login Flow (Feature 2 — changeToken)

#### Chiến lược xử lý changeToken (**fix issue #1 & #10**)

> [!IMPORTANT]
> **changeToken KHÔNG phải access token thông thường.** Nó là một JWT ngắn hạn (15 min) được sign bằng cùng `JWT_SECRET` nhưng có payload khác biệt: `{ sub, workspaceId, type: 'complete-registration' }` — **KHÔNG có `sessionId`**. Do đó, `JwtStrategy.validate()` sẽ reject nó (vì thiếu `sessionId`), và đó chính là điều chúng ta muốn: changeToken không dùng được cho bất kỳ business API nào.
>
> Endpoint `POST /auth/complete-registration` sử dụng một Guard riêng (`CompleteRegistrationGuard`) để **tự verify** token thay vì đi qua Passport JwtStrategy.

#### [NEW] `apps/api/src/modules/iam/auth/guards/complete-registration.guard.ts`
- Inject `JwtService` và `ConfigService`.
- Extract Bearer token từ header.
- Verify JWT signature + expiration.
- Check `payload.type === 'complete-registration'`.
- Check token chưa bị dùng: query Redis key `change-token:used:${payload.jti}`.
  - Sử dụng `SessionRegistryService.get()` (generic Redis cache method đã có sẵn).
  - Nếu key tồn tại → token đã dùng → throw 401.
- Nếu hợp lệ → set `req.user = payload`, set CLS `workspaceId = payload.workspaceId`.

#### [NEW] `apps/api/src/modules/iam/auth/dtos/complete-registration.dto.ts`
- `CompleteRegistrationSchema` (Zod): `newPassword` — same complexity regex từ `ChangePasswordSchema`.

#### [MODIFY] `apps/api/src/modules/iam/auth/services/auth.service.ts`
- Update `login()`:
```typescript
// After step 4 (password valid), BEFORE step 5:
if (user.mustChangePassword) {
    // Issue scoped changeToken instead of full access token
    const jti = uuid();
    const changeToken = this.jwtService.sign(
        { sub: user.id, workspaceId: user.workspaceId, type: 'complete-registration', jti },
        { expiresIn: 900 }, // 15 min
    );
    return { requiresPasswordChange: true, changeToken };
}
// ... existing flow continues for normal users
```
- New method `completeRegistration(payload, newPassword, ipAddress, userAgent?)`:
  1. Fetch user bằng query trực tiếp `getDatabase()` (bypass workspace CLS vì guard đã set CLS).
  2. Verify `user.mustChangePassword === true`.
  3. Hash new password, update user: `{ passwordHash, mustChangePassword: false }`.
  4. Blacklist changeToken: `sessionRegistryService.setEx('change-token:used:' + payload.jti, '1', 900)`.
  5. Tạo session mới + sign JWT bình thường (full access token).
  6. Audit log `AUTH_FIRST_LOGIN_PASSWORD_CHANGED`.
  7. Return `{ accessToken, expiresIn, sessionWarningAt }`.

#### [MODIFY] `apps/api/src/modules/iam/auth/controllers/auth.controller.ts`
- Thêm endpoint:
```typescript
@Post('complete-registration')
@UseGuards(CompleteRegistrationGuard)
@SkipGlobalAudit()
```

#### [MODIFY] `apps/api/src/modules/iam/auth/dtos/auth.dto.ts`
- Update `LoginResponseSchema` để support `requiresPasswordChange` response variant:
```typescript
// Thêm optional field hoặc tạo union type
export const LoginResponseSchema = z.union([
    z.object({ accessToken: z.string(), expiresIn: z.number(), sessionWarningAt: z.number() }),
    z.object({ requiresPasswordChange: z.literal(true), changeToken: z.string() }),
]);
```

---

### Phase 5: Wiring & Registration

#### [MODIFY] `apps/api/src/app.module.ts`
```diff
+ import { EmailModule } from './infrastructure/email/email.module';
+ import { NotificationModule } from './modules/notification/notification.module';
  ...
  imports: [
    ...
+   EmailModule,
+   NotificationModule,
  ],
```

#### [MODIFY] `apps/api/src/modules/iam/iam.module.ts`
```diff
+ import { MessageQueueModule } from '../../infrastructure/message-queue/message-queue.module';
+ import { EmployeeController } from './employee/controllers/employee.controller';
+ import { EmployeeService } from './employee/services/employee.service';
+ import { CompleteRegistrationGuard } from './auth/guards/complete-registration.guard';
  ...
  imports: [
    ...
+   MessageQueueModule,
  ],
- controllers: [AuthController, WorkspaceController],
+ controllers: [AuthController, WorkspaceController, EmployeeController],
  providers: [
    ...
+   EmployeeService,
+   CompleteRegistrationGuard,
  ],
```

---

## Tổng hợp File Changes

| Action | File | Lý do |
|--------|------|-------|
| **NEW** | `infrastructure/email/email.service.ts` | Reusable SMTP service |
| **NEW** | `infrastructure/email/email.module.ts` | Module wrapper |
| **NEW** | `modules/notification/notification.schema.ts` | notifications + userNotifications tables |
| **NEW** | `modules/notification/notification.module.ts` | Module |
| **NEW** | `modules/notification/repositories/notification.repository.ts` | Cross-tenant queries |
| **NEW** | `modules/notification/services/notification.service.ts` | Fan-out logic |
| **NEW** | `modules/notification/consumers/workspace-pending.consumer.ts` | RabbitMQ consumer |
| **NEW** | `modules/notification/consumers/account-created.consumer.ts` | RabbitMQ consumer + DLQ |
| **NEW** | `modules/iam/employee/dtos/employee.dto.ts` | Zod DTOs |
| **NEW** | `modules/iam/employee/controllers/employee.controller.ts` | REST endpoint |
| **NEW** | `modules/iam/employee/services/employee.service.ts` | Business logic |
| **NEW** | `modules/iam/auth/guards/complete-registration.guard.ts` | changeToken guard |
| **NEW** | `modules/iam/auth/dtos/complete-registration.dto.ts` | DTO |
| **MODIFY** | `modules/iam/iam.schema.ts` | Add `mustChangePassword` column |
| **MODIFY** | `modules/iam/iam.module.ts` | Import MQ + register employee/guard |
| **MODIFY** | `modules/iam/auth/services/auth.service.ts` | Login fork + completeRegistration |
| **MODIFY** | `modules/iam/auth/controllers/auth.controller.ts` | New endpoint |
| **MODIFY** | `modules/iam/auth/dtos/auth.dto.ts` | LoginResponse union |
| **MODIFY** | `modules/iam/workspace/services/workspace.service.ts` | Publish event |
| **MODIFY** | `infrastructure/message-queue/message-queue.service.ts` | DLQ methods |
| **MODIFY** | `infrastructure/database/schema.ts` | Add notification export |
| **MODIFY** | `core/audit/enums/audit.enums.ts` | New actions |
| **MODIFY** | `app.module.ts` | Register new modules |

## Verification Plan

1. **Build check**: `pnpm build` must pass without TypeScript errors.
2. **Notification flow**: Register workspace → verify RabbitMQ message published → consumer inserts into `notifications` + `userNotifications` → email sent via SMTP.
3. **Employee creation**: `POST /employees` → user created with `mustChangePassword=true` → `account.created` event published → consumer sends welcome email with temp password.
4. **First-login flow**: Login with temp password → response has `requiresPasswordChange: true, changeToken` (NOT accessToken) → `POST /auth/complete-registration` with changeToken → password updated → `mustChangePassword=false` → returns normal accessToken → changeToken blacklisted in Redis → second use of same changeToken returns 401.
5. **DLQ**: Simulate email failure 3 times → message moves to `account.created.dlq`.
