# Unified Inbox — Backend API

NestJS Phase 0 foundation: auth, organizations, teams/RBAC, connectors stub, SSE stub.

This folder is its **own git repository** (separate from frontend).

## Prerequisites

- Node.js 20+
- Docker (Postgres + Redis)

## Quick start

```bash
cd backend
docker compose up -d
cp .env.example .env
npm install
npm run migration:run
npm run start:dev
```

API base: `http://localhost:3001`

## Main endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/auth/register` | No | Create user + org |
| POST | `/auth/login` | No | JWT login |
| GET | `/organizations/me` | Bearer | Current org context |
| GET | `/organizations` | Bearer | List memberships |
| GET | `/teams` | Bearer | List teams in org |
| POST | `/teams` | Bearer (owner/admin) | Create team |
| POST | `/connectors/webhooks/:provider` | No | Enqueue webhook job |
| GET | `/realtime/events` | Bearer | SSE heartbeat |
| GET | `/health` | No | Health check |

## Tests

```bash
npm test          # unit tests (no Docker required)
npm run test:e2e  # requires Postgres + Redis via docker compose up -d
```

E2E coverage includes register/login, `/organizations/me`, cross-tenant org separation, and team creation.

## Docs

Feature docs live under [`docs/`](docs/).
