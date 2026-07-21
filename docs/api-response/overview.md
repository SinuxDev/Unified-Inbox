# API response envelope

## Purpose

Standardize all NestJS API and Next.js BFF JSON responses into a predictable envelope for clients.

## Scope

**In scope**

- Success and error envelopes on Nest controllers (via global interceptor + filter)
- Same envelope on Next.js BFF routes under `frontend/src/app/api/**`
- `nestFetch` / `clientFetchJson` unwrap `data` and surface `message` on errors

**Out of scope**

- Pagination meta (`total`, `page`, …) — add when list endpoints paginate
- `GET /health` — keeps Terminus probe format (excluded from interceptor)

## Behavior

### Success (HTTP 2xx)

```json
{
  "success": true,
  "message": "OK",
  "data": {}
}
```

### Error (HTTP 4xx / 5xx)

```json
{
  "success": false,
  "message": "Invalid credentials",
  "data": null
}
```

## API surface

- All Nest routes except `GET /health`
- BFF: `/api/auth/*`, `/api/organizations/me`, `/api/teams`

## Tenancy / auth notes

No change to auth or tenancy rules; only response wrapping.

## Tests

- `backend/src/common/http/transform.interceptor.spec.ts`
- `backend/src/common/http/http-exception.filter.spec.ts`
- Updated `backend/test/phase0.e2e-spec.ts`
- Updated `frontend/src/lib/query/client-fetch.test.ts`

## Date

2026-07-21
