# Database seeding

**Shipped:** 2026-07-21

## Purpose

Populate the database with known development data so login and local testing work without manual registration.

## Scope

- In: idempotent dev user + organization + owner membership via Nest DI
- Out: production seeding, bulk/faker demo data, test DB truncation

## Folder structure

```text
backend/src/database/
  seed.ts                 # CLI entry (Nest application context)
  seed.module.ts          # minimal module for seeding
  seeder.service.ts       # runs seeders in order
  seeds/
    seed.interface.ts     # DatabaseSeed contract
    dev-user.seed.ts      # dev login user
    *.seed.spec.ts        # unit tests per seed
```

Add new seeders as `seeds/<name>.seed.ts`, register in `SeederService`, and keep each seeder idempotent.

## Behavior

1. `npm run seed` boots `SeedModule` (no HTTP server).
2. Refuses to run when `NODE_ENV=production`.
3. `DevUserSeed` creates (or skips) a user + org using existing `UsersService`, `OrganizationsService`, and `PasswordService`.
4. Re-running is safe: skips if the email already has an organization membership.

## Default dev login

After `npm run migration:run` and `npm run seed`:

| Field | Default |
|-------|---------|
| Email | `owner@example.com` |
| Password | `Password123!` |
| Organization | `Dev Organization` |

Override via `SEED_DEV_USER_*` and `SEED_DEV_ORG_NAME` in `.env`.

## Tenancy / auth notes

Seeded user is org **owner** so protected routes and login return a valid `organizationId`.

## Tests

- `src/database/seeds/dev-user.seed.spec.ts` — skip path and create path

## Commands

```bash
npm run migration:run
npm run seed
```

Then `POST /auth/login` with the seeded credentials.
