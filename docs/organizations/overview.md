# Organizations

**Shipped:** 2026-07-18

## Purpose

Multi-tenant organizations with membership roles.

## Scope

- In: create org on register, list memberships, `GET /organizations/me`
- Out: invites, org switching UI, billing

## Behavior

- Each user belongs to one or more organizations via `organization_members`.
- Roles: `owner`, `admin`, `member`.
- `GET /organizations/me` returns the org from the JWT context only.

## Tenancy

All org-scoped data is filtered by `organizationId`.

## Tests

- E2E: tenant isolation between two registered orgs
