# Auth

**Shipped:** 2026-07-18

## Purpose

Email/password registration and login with JWT access tokens that carry active `organizationId` and org role.

## Scope

- In: register, login, JWT bearer auth
- Out: refresh tokens, OAuth, email verification

## Behavior

1. `POST /auth/register` creates a user, first organization, and owner membership; returns `accessToken`.
2. `POST /auth/login` validates credentials and returns `accessToken` for the user’s first organization.
3. Protected routes use `Authorization: Bearer <token>`.

## JWT claims

- `sub` — user id
- `email`
- `organizationId`
- `role` — `owner` | `admin` | `member`

## Tenancy

Tokens always include an organization context. Business queries must use `organizationId` from the token.

## Tests

- Unit: `password.service.spec.ts`, `auth.service.spec.ts`
- E2E: register → login → `/organizations/me`
