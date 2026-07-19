# Auth

**Shipped:** 2026-07-18 · **Updated:** 2026-07-19 (JWT refresh)

## Purpose

Email/password registration and login with short-lived JWT access tokens and longer-lived JWT refresh tokens. Access tokens carry active `organizationId` and org role.

## Scope

- In: register, login, JWT bearer auth, JWT refresh (stateless — no token table)
- Out: OAuth, email verification, server-side token denylist

## Behavior

1. `POST /auth/register` creates a user, first organization, and owner membership; returns `accessToken` + `refreshToken`.
2. `POST /auth/login` validates credentials and returns `accessToken` + `refreshToken` for the user’s first organization.
3. `POST /auth/refresh` verifies a refresh JWT, reloads membership from the DB, and returns a new token pair.
4. Protected routes use `Authorization: Bearer <accessToken>`.
5. `POST /auth/logout` acknowledges logout (clients clear cookies; no server denylist).

## JWT claims

### Access (`typ: access`)

- `sub` — user id
- `email`
- `organizationId`
- `role` — `owner` | `admin` | `member`
- `typ` — `access`

### Refresh (`typ: refresh`)

- `sub` — user id
- `organizationId`
- `typ` — `refresh`
- Signed with `JWT_REFRESH_SECRET` (separate from access)

## Tenancy

Tokens always include an organization context. Business queries must use `organizationId` from the access token. Privileged writes re-check membership in Postgres.

## Tests

- Unit: `password.service.spec.ts`, `auth.service.spec.ts` (includes refresh)
- E2E: register → login → refresh → `/organizations/me`
