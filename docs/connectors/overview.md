# Connectors

**Shipped:** 2026-07-18

## Purpose

Empty integration boundary for channel/system webhooks (Yangon Broom, CELC, email, Telegram later).

## Scope

- In: `POST /connectors/webhooks/:provider` enqueues a BullMQ job
- Out: real provider adapters, signature verification, retries policy tuning

## Behavior

Webhook payloads are accepted and queued on `connector-webhooks`. Processor currently logs only.

## Principles

Core Inbox must not couple to external DBs; connectors stay separate.
