# Frontend Guide: Workspace Multi-Types and User Multi-Roles

This guide describes how the frontend should work with the backend model where:

- A workspace can have many business types.
- A user can have many assigned roles.
- An access token contains one active role for the current session.

## Workspace Registration

Use `types` as an array when registering a workspace.

```json
{
  "name": "Acme Logistics",
  "slug": "acme-logistics",
  "taxId": "0123456789",
  "types": ["supplier", "buyer"],
  "adminEmail": "admin@acme.test",
  "adminPassword": "Admin@123456",
  "acceptedTermsVersion": "v1.0"
}
```

Frontend rules:

- Show workspace type selection as multi-select checkboxes.
- Require at least one selected type before submit.
- Do not send the legacy `type` field.

## Login Flow

`POST /auth/login` can return one of three shapes.

Single-role user:

```json
{
  "accessToken": "...",
  "expiresIn": 1800,
  "sessionWarningAt": 1680
}
```

First-login user:

```json
{
  "requiresPasswordChange": true,
  "changeToken": "...",
  "expiresIn": 900
}
```

Multi-role user:

```json
{
  "requiresRoleSelection": true,
  "roleSelectionToken": "...",
  "roles": ["company_admin", "supplier_manager"],
  "expiresIn": 300
}
```

When `requiresRoleSelection` is true:

- Do not store it as the main access token.
- Show a select-role screen using `roles`.
- Call `POST /auth/select-role`.

```json
{
  "roleSelectionToken": "...",
  "role": "supplier_manager"
}
```

The response is the normal access-token response. Store that access token for authenticated API calls.

## Token Claims

The access token contains:

- `sub`: user id.
- `workspaceId`: active workspace id.
- `workspaceTypes`: all enabled workspace types.
- `role`: the active role selected for this session.
- `sessionId`: server-side session id.
- `jti`: JWT id.

Use `role` for the current dashboard/menu. Use `workspaceTypes` to decide which cross-domain features can be shown for the workspace.

## Current User

`GET /auth/me` returns the active role plus all assigned roles:

```json
{
  "id": "...",
  "email": "admin@acme.test",
  "firstName": "Acme",
  "lastName": "Admin",
  "role": "supplier_manager",
  "roles": ["company_admin", "supplier_manager"],
  "workspaceId": "...",
  "lastLoginAt": "2026-05-25T00:00:00.000Z"
}
```

## Employee Creation Role Options

The allowed employee roles are derived from all `workspaceTypes`.

- `supplier`: `supplier_manager`, `supplier_staff`, `supplier_accountant`, `hr_manager`
- `buyer`: `buyer_manager`, `buyer_staff`, `hr_manager`
- `carrier`: `carrier_dispatcher`, `driver`, `hr_manager`

Frontend should build the role dropdown as the unique union of all enabled workspace types. If the backend rejects a role, show the backend message inline.

## Enabling Additional Roles

`POST /workspaces/:id/roles/enable` is for `company_admin` only and only for the admin's own workspace.

Important behavior:

- The role must be valid for at least one enabled workspace type.
- The endpoint enables a role option for the workspace; it does not automatically assign that role to an existing user.
- User role assignment is represented by `user_roles` on the backend.

## Practical Frontend State

Recommended auth state:

```ts
type AuthState =
  | { status: 'anonymous' }
  | { status: 'password_change_required'; changeToken: string; expiresIn: number }
  | {
      status: 'role_selection_required';
      roleSelectionToken: string;
      roles: string[];
      expiresIn: number;
    }
  | {
      status: 'authenticated';
      accessToken: string;
      activeRole: string;
      workspaceTypes: string[];
    };
```

Do not treat role selection as authenticated. The user becomes authenticated only after `POST /auth/select-role` returns an access token.
