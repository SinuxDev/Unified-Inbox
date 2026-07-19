# Performance — Unified Inbox (Backend)

See workspace [`PERFORMANCE.md`](../PERFORMANCE.md). Skill: `futurewave-backend-performance`.

## Must have

- No N+1; batch/join related loads
- Paginated lists with bounds
- Indexes for `organization_id` and hot filters
- BullMQ for heavy/async work
- Explicit column/relation selection
