# API Documentation

Backend API for LogiSync - NestJS with Drizzle ORM, PostgreSQL, Redis.

## Contents

- **[Validation](./validation.md)** - Input validation with Zod
- **[Enterprise Setup](./enterprise-setup.md)** - Audit logging, RLS, security
- **[Backend Readme](./backend-readme.md)** - Architecture overview

## Quick Links

### Core Concepts

- **Validation**: Runtime data validation with Zod
- **Authentication**: JWT-based authentication
- **Authorization**: Role-Based Access Control (RBAC)
- **Audit Logging**: Append-only audit trail
- **Data Isolation**: Row-Level Security (RLS)
- **Health Checks**: `/health`, `/health/ready`, `/health/live`

### Development

- [Validation Guide](./validation.md)
- [Testing](../development/testing.md)
- [Code Quality](../development/code-quality.md)

### Deployment

- [Docker Deployment](../deployment/docker.md)
- [Environment Config](../deployment/environment.md)
- [Monitoring](../deployment/monitoring.md)

## Endpoints

### Health

```
GET /health         - Overall health status
GET /health/ready   - Readiness probe
GET /health/live    - Liveness probe
```

### Users (Coming Soon)

```
POST   /users           - Create user
GET    /users/:id       - Get user
PATCH  /users/:id       - Update user
DELETE /users/:id       - Delete user
```

### Workspaces (Coming Soon)

```
POST   /workspaces           - Create workspace
GET    /workspaces           - List workspaces
PATCH  /workspaces/:id       - Update workspace
```

## Error Handling

All errors return consistent JSON format:

```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "errors": [
    {
      "path": "email",
      "message": "Invalid email address",
      "code": "invalid_string"
    }
  ]
}
```

## Project Structure

```
src/
├── main.ts                 # Entry point
├── app.module.ts           # Root module
├── app.controller.ts       # Root routes
├── common/                 # Shared code
│   ├── pipes/              # Zod validation pipe
│   ├── schemas/            # Validation schemas
│   └── utils/              # Helper utilities
├── modules/                # Feature modules
│   ├── auth/               # Authentication
│   ├── health/             # Health checks
│   ├── audit/              # Audit logging
│   ├── security/           # RBAC, guards
│   ├── session/            # Session management
│   └── workers/            # Background jobs
└── database/               # Database setup
    ├── schema.ts           # Drizzle schema
    ├── migrate.ts          # Migration runner
    └── seed.ts             # Initial data
```

## Key Technologies

- **Framework**: NestJS 11
- **Database**: PostgreSQL + TimescaleDB
- **ORM**: Drizzle ORM
- **Validation**: Zod
- **Cache**: Redis
- **Security**: Bcrypt, JWT

---

See individual guides for detailed information.
