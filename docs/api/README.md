# API Documentation

Backend API for LogiSync - NestJS with Drizzle ORM, PostgreSQL, Redis.

## Contents

- **[Backend Development Guidelines](./development-guidelines.md)** - Architecture rules, development flow, and coding standards.
- **[Validation](./zod-migration-guide.md)** - Input validation with Zod
- **[Backend Readme](./backend-readme.md)** - Architecture overview

## Quick Links

### Core Concepts

- **Validation**: Runtime data validation with Zod
- **Authentication**: JWT-based authentication
- **Authorization**: Role-Based Access Control (RBAC)
- **Audit Logging**: Append-only audit trail
- **Data Isolation**: Row-Level Security (RLS)
- **Health Checks**: `/health`, `/health/ready`, `/health/live`

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

## Key Technologies

- **Framework**: NestJS 11
- **Database**: PostgreSQL + TimescaleDB
- **ORM**: Drizzle ORM
- **Validation**: Zod
- **Cache**: Redis
- **Security**: Bcrypt, JWT

---

See individual guides for detailed information.
