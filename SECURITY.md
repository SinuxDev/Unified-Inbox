# Security — Unified Inbox (Backend)

This checklist ships with the backend git repo.

## Backend must-haves

- [x] Helmet security headers
- [x] CORS allowlist (`CORS_ORIGINS`)
- [x] Rate limiting on auth endpoints (`@nestjs/throttler`)
- [x] TypeORM ≥ 0.3.29 (currently 0.3.31)
- [x] Short access JWT + separate refresh secret; reject refresh `typ` on access routes
- [x] Strict `ValidationPipe` (whitelist + forbid non-whitelisted)
- [x] Tenancy: scope by `organizationId` from JWT; re-check membership on privileged writes
- [x] No secrets in git; production HTTPS still required at deploy time

## Auth threat notes

Stateless JWT refresh: logout clears client cookies only. Stolen refresh tokens work until expiry unless a denylist is added later.

## Dependency alerts

Triage Dependabot on https://github.com/SinuxDev/Unified-Inbox/security/dependabot
