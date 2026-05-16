# API Documentation

Backend API for LogiSync - NestJS with Drizzle ORM, PostgreSQL, Redis.

## Contents

- **[Backend Development Guidelines](./development-guidelines.md)** - Architecture rules, development flow, and coding standards.
- **[Validation](./zod-migration-guide.md)** - Input validation with Zod
- **[Backend Readme](./backend-readme.md)** - Architecture overview

## Module Documentation

- **[IAM Module](./iam/README.md)** - Identity, Auth, and Workspace Management.
- **[Catalog Module](./catalog/README.md)** - Supplier Catalog and Product Management.
- **[Order Module](./order/README.md)** - Purchase Orders and Task Management.
- **[Sourcing Module](./sourcing/README.md)** - RFQ, Quotations, and Negotiation.
- **[Master Data Module](./master-data/README.md)** - Shared Platform Data (Categories, UoM).
- **[Media Module](./media/README.md)** - Secure Storage and Signed URLs.
- **[Core Services](./core/README.md)** - Audit, Health, and Security foundational services.

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
