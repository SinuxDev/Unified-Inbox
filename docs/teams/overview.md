# Teams

**Shipped:** 2026-07-18

## Purpose

Teams within an organization for future assignment/workload features.

## Scope

- In: create team (owner/admin), list teams for current org
- Out: team inbox assignment, advanced team roles

## Behavior

- `POST /teams` requires org role owner or admin.
- Teams always store `organizationId`.

## Tests

- E2E: owner can create a team
