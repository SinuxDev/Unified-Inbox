# Realtime

**Shipped:** 2026-07-18

## Purpose

SSE stub for future inbox live updates.

## Scope

- In: `GET /realtime/events` authenticated SSE heartbeat every 15s
- Out: conversation events, WebSocket upgrade

## Behavior

Clients connect with Bearer JWT; events include `organizationId` and `userId` in heartbeat payloads.
