# LogiSync Backend API

Backend `apps/api` là lõi vận hành của LogiSync, xây bằng NestJS theo hướng Modular Monolith để dễ tách dần thành microservices sau này nhưng vẫn giữ tốc độ gọi nội bộ rất nhanh trong giai đoạn hiện tại.

## Mục tiêu của backend này

- quản lý đa tenant theo `workspace`
- bảo vệ dữ liệu ở cả tầng API và database
- lưu audit log theo kiểu append-only
- quản lý session JWT stateless kết hợp Redis
- đáp ứng yêu cầu vận hành như health check, worker nền, CI/CD và khả năng deploy container hóa

## Những gì đã có trong code

### Bootstrap và cấu hình

- `ConfigModule` load `.env` từ monorepo root qua `src/config/env-paths.ts`
- `main.ts` dùng `ConfigService` thay vì đọc `process.env` trực tiếp cho port và CORS
- startup có `Logger`, `ValidationPipe`, `enableShutdownHooks()`
- CORS hỗ trợ whitelist bằng `CORS_ORIGINS` hoặc fallback `FRONTEND_URL`

### Database và lifecycle

- dùng PostgreSQL/TimescaleDB qua Drizzle ORM
- `DatabaseService` verify kết nối DB đúng lifecycle của NestJS
- startup có retry kết nối DB để tránh fail khi app lên trước database
- shutdown đóng PostgreSQL pool

### Audit Logger

- module riêng
- interceptor được gắn global qua `APP_INTERCEPTOR`
- mọi thao tác quan trọng ở tầng HTTP có thể được ghi audit
- bảng `audit_logs` lưu:
  - `actor_id`
  - `workspace_id`
  - `action`
  - `resource_type`
  - `resource_id`
  - `ip_address`
  - `user_agent`
  - `status`
  - `error_message`
  - `timestamp`
- RLS và SQL trigger nằm ở `src/database/rls-setup.sql`
- mục tiêu append-only đã được mô hình hóa ở mức DB policy/trigger

### Security và phân quyền

- bcrypt qua `bcryptjs`
- khóa tài khoản 15 phút sau 5 lần đăng nhập sai
- RBAC service kiểm tra quyền theo role
- invalidate session khi cần qua `session_registry`
- mô hình multi-tenant theo `workspace_id`
- file `src/database/rls-setup.sql` chuẩn bị sẵn Row-Level Security ở mức database

### Session Registry

- module riêng
- dùng Redis cho session active tốc độ cao
- dùng bảng `session_registry` để lưu persistence/audit trail cho session
- hỗ trợ:
  - tạo session
  - revoke một session
  - revoke toàn bộ session theo workspace
  - đếm session active theo workspace
- phù hợp với yêu cầu force-logout tổ chức trong thời gian ngắn

### Health check và monitoring

- endpoint:
  - `/health`
  - `/health/ready`
  - `/health/live`
- `HealthCheckService` ping DB và Redis thật mỗi 15 giây
- nếu degraded sẽ log cảnh báo để monitoring agent bên ngoài bắt và alert admin

### Background workers

- module riêng
- đã scaffold các job nền chính:
  - auto-settle confirmations mỗi 15 phút
  - tính reputation score mỗi giờ
  - nén ảnh e-POD mỗi 6 giờ
  - dọn session hết hạn hằng ngày
  - backup database hằng ngày
- hiện trạng:
  - khung scheduler đã có
  - business logic chi tiết cho từng worker vẫn cần nối tiếp

### Testing và CI/CD

- unit test và e2e test đã có scaffold trong `test/`
- có test cho:
  - audit logging
  - security
  - cross-tenant isolation
- CI ở `.github/workflows/ci.yml` chạy lint, build, test, cross-tenant test, coverage, Docker build và security scan
- `turbo.json` đã track `.env` để tránh cache sai khi thay đổi cấu hình

## Yêu cầu enterprise đang được đáp ứng ra sao

### 1. Logging bắt buộc

- có module `AuditModule`
- audit log lưu actor, IP, timestamp UTC và action/outcome
- append-only được định hướng bằng trigger/policy trong SQL
- dữ liệu audit được tách khỏi business flow chính

### 2. Response time

- kiến trúc hiện tại là Modular Monolith nên gọi nội bộ theo in-memory function call
- không có network hop giữa các module nội bộ
- CI đã có mục performance target
- lưu ý:
  - đây là năng lực kiến trúc và target vận hành
  - để chứng minh SLA thực tế vẫn cần benchmark thật khi các nghiệp vụ order/search hoàn chỉnh

### 3. User count / session management

- session registry bằng Redis + DB đã có
- session được group theo `workspace`
- đã có API/service level capability để revoke tất cả session của một workspace

### 4. Backup & restore

- job backup đã có scheduler scaffold
- compose dùng PostgreSQL/TimescaleDB image
- RTO/RPO dưới 24h vẫn là cam kết cần hoàn thiện bằng hạ tầng thật:
  - replication
  - backup storage
  - restore drill
  - log shipping

### 5. Testing & helper

- backend có test folder riêng
- CI đã ép chạy luồng cross-tenant isolation
- có helper structure đủ để mở rộng security/integration test

### 6. Availability & xử lý lỗi

- health endpoint + health timer đã có
- startup/shutdown lifecycle sạch hơn trước
- Docker healthcheck đã có trong `Dockerfile.api` và `docker-compose.yml`
- phần email alert khẩn cho admin hiện mới dừng ở contract/log cảnh báo, chưa nối mailer thật

### 7. Bảo mật & phân quyền

- bcrypt hashing: có
- lockout 5 lần sai trong 15 phút: có
- RBAC tại backend: có service/guard scaffold
- RLS ở database: có file setup SQL, cần apply vào DB thật

### 8. Bảo trì & timer ngầm

- Modular Monolith: có
- worker scheduler: có scaffold
- cron cho các tác vụ enterprise chính: có

## Cài đặt môi trường local

### 1. Cài dependencies

```bash
pnpm install
```

### 2. Chuẩn bị `.env`

Backend đọc `.env` từ root monorepo. Tối thiểu cần:

```env
DATABASE_URL=postgresql://...
REDIS_URL=redis://localhost:6379
API_PORT=3000
FRONTEND_URL=http://localhost:5173
CORS_ORIGINS=http://localhost:5173
JWT_SECRET=change-me
NODE_ENV=development
```

### 3. Chạy hạ tầng phụ trợ

```bash
docker compose up -d
```

Compose hiện có:

- PostgreSQL / TimescaleDB
- Redis
- MinIO
- RabbitMQ

### 4. Setup database

```bash
pnpm --filter @logisync/api db:generate
pnpm --filter @logisync/api db:migrate
pnpm --filter @logisync/api db:seed
psql $DATABASE_URL < apps/api/src/database/rls-setup.sql
```

## Chạy backend

### Development

```bash
pnpm --filter @logisync/api dev
```

### Production build

```bash
pnpm --filter @logisync/api build
pnpm --filter @logisync/api start:prod
```

## Test backend

```bash
pnpm --filter @logisync/api test
pnpm --filter @logisync/api test:e2e
pnpm --filter @logisync/api test:cov
```

Các test enterprise đáng chú ý:

- `test/audit-logger.spec.ts`
- `test/security.spec.ts`
- `test/cross-tenant.spec.ts`

## Deploy backend

### Docker image

Root repo có `Dockerfile.api` để build backend bằng multi-stage Docker:

- prune monorepo bằng Turbo
- cài dependency tối thiểu
- build `@logisync/api`
- chạy bằng user non-root
- có healthcheck sẵn

Build thử:

```bash
docker build -f Dockerfile.api -t logisync-api .
```

Chạy:

```bash
docker run --env-file .env -p 3000:3000 logisync-api
```

### Docker Compose

Local stack:

```bash
docker compose up -d
```

Production stack:

```bash
docker compose -f docker-compose.prod.yml up -d
```