# LogiSync Backend Enterprise Setup

Tài liệu này tập trung vào cách triển khai backend `apps/api` theo checklist enterprise: cấu hình môi trường, database, RLS, audit logger, session registry, health monitoring, worker nền và deploy.

Backend overview chính nằm tại [backend-readme.md](./backend-readme.md).

## 1. Kiến trúc đang áp dụng

Backend dùng Modular Monolith với NestJS:

- module hóa theo capability
- gọi nội bộ in-memory
- dễ tách dần thành microservice
- phù hợp target phản hồi nhanh cho API nội bộ

Các module chính:

- `audit`
- `session`
- `security`
- `health`
- `workers`
- `database`

## 2. Chuẩn bị môi trường

### Bắt buộc

```env
DATABASE_URL=postgresql://...
REDIS_URL=redis://localhost:6379
API_PORT=3000
FRONTEND_URL=http://localhost:5173
CORS_ORIGINS=http://localhost:5173
JWT_SECRET=change-me
NODE_ENV=development
```

### Khuyến nghị thêm cho production

```env
POSTGRES_USER=logisync_user
POSTGRES_PASSWORD=strong_password
POSTGRES_DB=logisync_db
MINIO_ROOT_USER=minio
MINIO_ROOT_PASSWORD=strong_password
RABBITMQ_USER=guest
RABBITMQ_PASSWORD=guest
```

## 3. Hạ tầng local / staging

Chạy stack phụ trợ:

```bash
docker compose up -d
```

Services hiện có trong compose:

- PostgreSQL / TimescaleDB
- Redis
- MinIO
- RabbitMQ

## 4. Database setup

### Sinh migration

```bash
pnpm --filter @logisync/api db:generate
```

### Chạy migration

```bash
pnpm --filter @logisync/api db:migrate
```

### Seed dữ liệu ban đầu

```bash
pnpm --filter @logisync/api db:seed
```

### Áp dụng RLS và trigger audit

```bash
psql $DATABASE_URL < apps/api/src/database/rls-setup.sql
```

`rls-setup.sql` hiện đảm nhiệm:

- bật Row-Level Security cho bảng chính
- policy cô lập dữ liệu theo `workspace_id`
- policy chặn `UPDATE` / `DELETE` audit log
- trigger bất biến cho `audit_logs`

## 5. Audit logging

### Đã triển khai

- `AuditModule`
- `AuditInterceptor` global
- `AuditLoggerService`
- bảng `audit_logs`

### Trường tối thiểu đang có

- `actor_id`
- `workspace_id`
- `action`
- `ip_address`
- `status`
- `timestamp`

### Nên kiểm tra khi lên production

1. Trigger chống sửa/xóa audit log đã được apply thật trong DB.
2. Request pipeline đã gắn danh tính người dùng trước khi vào interceptor.
3. Timestamp đang dùng UTC từ database.

## 6. Session registry

### Đã triển khai

- Redis cache session active
- bảng `session_registry` lưu persistence
- revoke theo session
- revoke toàn workspace
- đếm active session theo workspace

### Ý nghĩa vận hành

- force logout tenant khi cần suspend workspace
- vẫn truy vết được lịch sử session kể cả khi Redis restart

### Việc cần chắc chắn ở production

1. Redis phải là instance bền vững, không chỉ local ephemeral.
2. Cần cơ chế backup/HA cho Redis nếu session count là dữ liệu vận hành quan trọng.
3. Nếu triển khai nhiều replica API, tất cả phải trỏ cùng một Redis.

## 7. Security

### Đã có

- bcrypt password hashing
- lockout 15 phút sau 5 lần sai
- RBAC service
- session invalidation ở tầng persistence

### Cần hoàn thiện thêm

- auth controller / JWT issuance đầy đủ
- rotate secret định kỳ
- audit cho các luồng auth nhạy cảm

## 8. Health check và monitoring

### Endpoint

- `/health`
- `/health/ready`
- `/health/live`

### Hành vi hiện tại

- health service ping DB và Redis thật mỗi 15 giây
- nếu degraded sẽ log warning

### Để đạt yêu cầu enterprise

1. Dùng monitoring agent ngoài hệ thống ping mỗi 15-30 giây.
2. Nối warning sang email / Slack / incident channel.
3. Định nghĩa rule alert rõ cho DB down, Redis down, API not ready.

## 9. Background workers

Worker đã scaffold sẵn cho:

- auto-settle confirmations sau 48 giờ
- reputation scoring
- nén ảnh e-POD
- cleanup session
- backup database

### Lưu ý

Hiện tại scheduler có khung cron nhưng logic nghiệp vụ chi tiết vẫn cần cài đặt thêm.

## 10. CI/CD

Workflow chính ở:

- `.github/workflows/ci.yml`

Pipeline hiện chạy:

- code quality
- lint
- build
- unit test
- cross-tenant isolation test
- coverage
- Docker build
- security scan

Tài liệu CI/CD:

- [../ci-cd/README.md](../ci-cd/README.md)
- [../ci-cd/cicd-setup.md](../ci-cd/cicd-setup.md)
- [../ci-cd/ghcr-token-setup.md](../ci-cd/ghcr-token-setup.md)

## 11. Deploy

### Build container

```bash
docker build -f Dockerfile.api -t logisync-api .
```

### Run container

```bash
docker run --env-file .env -p 3000:3000 logisync-api
```

### Compose production

```bash
docker compose -f docker-compose.prod.yml up -d
```

## 12. Checklist trước khi coi là production-ready

### Bắt buộc

1. Apply `rls-setup.sql` trên database thật.
2. Kiểm tra trigger append-only cho `audit_logs`.
3. Xác nhận Redis đang được ping thành công qua `/health`.
4. Chạy pass test backend và cross-tenant test trong CI.
5. Cấu hình CORS whitelist chuẩn môi trường thật.

### Nên làm tiếp

1. Hoàn thiện auth module đầy đủ.
2. Nối mail alert / incident notification.
3. Hoàn thiện logic worker nghiệp vụ.
4. Thêm benchmark thực tế cho SLA response time.
5. Thêm backup/restore drill để chứng minh RTO/RPO.

## 13. Tài liệu liên quan

- [Backend Readme](./backend-readme.md)
- [Docs Index](../README.md)
- [API Docs Index](./README.md)
