# LogiSync - Hệ thống hỗ trợ hoạt động Logistics

Nền tảng logistics toàn diện dành cho Supplier, Buyer và Carrier - từ quản lý đơn hàng, vận chuyển, theo dõi GPS đến thanh toán.

## 🚀 Quick Start

### 1. Chuẩn bị

```bash
pnpm install
pnpm prepare
```

### 2. Database & Infrastructure

```bash
pnpm db:up
pnpm db:setup
pnpm db:studio
```

### 3. Development

```bash
pnpm dev           # Tất cả services
pnpm dev:api       # NestJS Backend
pnpm dev:web       # Next.js Frontend
pnpm dev:mobile    # React Native Mobile
```

### 4. Verify Installation

```bash
curl http://localhost:3000/health/ready
curl http://localhost:3000/health
```

---

## Commit Convention

Always use `pnpm commit` to create commits with proper format:

```bash
pnpm commit
```

### Format: `<type>(<scope>): <subject>`

**Types**: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `chore`, `ci`

**Scopes**: `api`, `web`, `mobile`, `db`, `auth`, `validation`, `config`, etc.

### Examples

```
feat(auth): add OAuth2 support
fix(validation): handle null values in schemas
docs(api): update validation guide
```

### Rules

- Use imperative mood ("add" not "added")
- No period at the end
- Max 50 characters for subject
- Reference issues: `Closes #123`

---

## 📖 Documentation

| Topic                   | Location                               |
| ----------------------- | -------------------------------------- |
| **Setup & Environment** | [docs/setup/](docs/setup/)             |
| **Development Guide**   | [docs/development/](docs/development/) |
| **API & Validation**    | [docs/api/](docs/api/)                 |
| **Deployment**          | [docs/deployment/](docs/deployment/)   |
| **CI/CD Pipeline**      | [docs/ci-cd/](docs/ci-cd/)             |

---

## ✨ Key Features

- ✅ Multi-tenant Workspace (Supplier/Buyer/Carrier)
- ✅ Product & Order Management
- ✅ Real-time GPS Tracking & ETA
- ✅ e-POD (Electronic Proof of Delivery)
- ✅ Invoice & Payment Management
- ✅ **Audit Logging** (Append-only, tamper-proof)
- ✅ **Security** (RBAC, Bcrypt, RLS)
- ✅ **Health Checks** & Monitoring
- ✅ **Background Workers** (Scheduled tasks)

---

## 🛠️ Project Structure

```
logisync/
├── apps/
│   ├── api/          # NestJS Backend
│   ├── web/          # Next.js Frontend
│   └── mobile/       # React Native
├── packages/
│   ├── constants/
│   └── shared-types/
└── docs/             # Documentation
```

---

## 📞 Need Help?

- 📚 **Setup Issues?** → [docs/setup/](docs/setup/)
- 💻 **Development?** → [docs/development/](docs/development/)
- 🚀 **Deployment?** → [docs/deployment/](docs/deployment/)
- 🔧 **API Questions?** → [docs/api/](docs/api/)

---
