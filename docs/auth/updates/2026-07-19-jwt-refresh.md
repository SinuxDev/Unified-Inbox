# JWT access + refresh (stateless)

**Date:** 2026-07-19

## Change

- Access JWT TTL default shortened to `15m` (`JWT_EXPIRES_IN`).
- Added refresh JWT signed with `JWT_REFRESH_SECRET`, TTL `JWT_REFRESH_EXPIRES_IN` (default `7d`).
- Login/register return `{ accessToken, refreshToken, user, organization }`.
- New `POST /auth/refresh` re-issues the pair after verifying refresh JWT and reloading org membership from the DB.
- Access strategy rejects tokens with `typ: refresh`.
- No refresh-token table — logout is client-side cookie clear only.

## Why

Keep authentication JWT-only while limiting how long role claims stay valid without a DB round-trip. Refresh re-reads membership so demotions apply on the next refresh.
