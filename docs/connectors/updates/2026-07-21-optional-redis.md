# Optional Redis for local development

## What changed

- Added `REDIS_ENABLED` env flag (default: disabled unless set to `true`).
- When disabled, BullMQ and `ConnectorsModule` are not loaded; the API starts without a Redis connection.
- `REDIS_HOST` / `REDIS_PORT` are required only when `REDIS_ENABLED=true`.

## Why

Local auth and core API work should not require Docker Redis during early development.

## Breaking changes

None for clients. Connector webhook queue endpoints are unavailable when Redis is disabled.

## Migration / follow-ups

Set `REDIS_ENABLED=true` and start Redis (`docker compose up redis`) before testing connector webhook processing.

## Tests updated or added

None — conditional module wiring only; existing unit tests unchanged.
