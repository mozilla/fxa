# free-access-program

Front-door library for the Strapi-managed **B2B free-access allowlist** —
resolves per-email capability grants at read time, and reconciles Strapi
state into delayed `profileDataChange` SNS events for downstream RPs on
webhook/cron reconciles.

The projection itself (the by-email map of `email → { capabilities,
offeringApiIdentifiers }`) is owned by `FreeAccessProgramConfigurationManager`
in [`@fxa/shared/cms`](../shared/cms) — this lib layers the front-door
service and the durable reconciler journal on top of that projection.

## Runtime layout

| Piece | Lives in | Purpose |
|---|---|---|
| `FreeAccessProgramConfigurationManager` | `@fxa/shared/cms` | Two-layer (memory + Firestore) cache in front of the Strapi `accesses` query, projected into a flat by-email map via `AccessUtil.project`. |
| `FreeAccessProgramService` | this lib | Front door. `findCapabilitiesForEmail` / `findOfferingIdsForEmail` (O(1) map lookup); `findFreeAccessForUid` (membership gate via the projection, then per-client grants from the full access); `reconcile()` (diff journal ↔ fresh projection, queue per-email change signals, send the ones that are due). |
| `FreeAccessProgramJournalManager` + `free-access-program.repository.ts` | this lib | Durable Firestore document (`<collection>/state`) holding the last-reconciled by-email projection, plus the `state/pending` subcollection of queued notifications. No TTL — the journal is the diff source-of-truth so cache evictions can't silently drop notifications. |
| `FreeAccessNotifier` interface + `FREE_ACCESS_NOTIFIER` token | this lib | Contract: `notifyEmailChanged(email)`. |
| `FreeAccessInProcessNotifier` | `packages/fxa-auth-server/lib/payments/` | Auth-server implementation. Resolves email → uid via `db.accountRecord`, invalidates the profile-server cache via `ProfileClient.deleteCache`, and emits a coarse `profileDataChange` event via `log.notifyAttachedServices`. |
| Webhook helpers (`classifyAccessWebhook`, `isDuplicateAccessWebhook`) | this lib (`util/`) | Framework-agnostic Strapi-webhook building blocks. `classifyAccessWebhook` filters to `model=access` + publish/update/unpublish/delete and returns a dedupe key; `isDuplicateAccessWebhook` dedupes `(event, documentId, createdAt)` for 60s over a caller-owned map. Each app composes these with its own bearer check and side effect. |
| Webhook route (`POST /webhooks/strapi/free-access-program/access`) — auth-server | thin Hapi wrapper in `packages/fxa-auth-server/lib/routes/subscriptions/` | Verifies the shared bearer (→ Boom 401), then classify → dedupe → `service.reconcile()` (journal diff → queue → cache invalidation → send due notifications). |
| Webhook route (`POST /webhooks/strapi/free-access-program/access`) — payments-api | thin Nest wrapper in this lib (`free-access-program-webhooks.{controller,service}.ts`) | Additive endpoint. Verifies the shared bearer (→ `UnauthorizedException`), then classify → dedupe → `FreeAccessProgramConfigurationManager.invalidateProjectionCache()` so the payments-api process's projection cache (in-memory L1 + shared Firestore L2) is refreshed. |
| Reconcile cron | `packages/fxa-auth-server/scripts/free-access-program-reconcile.ts` | Periodic safety-net sweep. Same `reconcile()` call as the webhook. |

## Reconcile flow

1. `journalManager.get()` returns the last-reconciled by-email projection, or `null` on cold start.
2. `configurationManager.getFreshProjection()` re-projects Strapi (skipping the read cache).
3. **Cold start** (`before === null`): `journalManager.set(after)` seeds the baseline; fire zero notifications.
4. **Warm path**: `diffByEmail(before, after)` walks both projections and returns emails whose capability map differs (order-insensitive on both `clientId` keys and capability slugs). New emails, removed emails, and changed capability sets all surface.
5. Queue each affected email in `state/pending` with `notBefore = now + memCacheTTL + 60s`, **before** the journal write, so a crash in between re-diffs and re-queues on the next run. Re-queueing an email overwrites its `notBefore`.
6. Persist the new baseline (`journalManager.set(after)`) and invalidate the read cache.
7. Send due notifications: load up to 500 pending docs with `notBefore <= now`, oldest first, call `notifier.notifyEmailChanged(email)`, then delete each doc with an update-time precondition so a concurrent re-queue survives. Failed sends stay pending for the next run; malformed docs are deleted.

The delay exists because `invalidateProjectionCache()` only clears the calling process's memory tier; every other instance serves its cached projection until `memCacheTTL` expires. The delay is derived from the reconciling process's `memCacheTTL`, so every process that serves the projection to RPs must use a `memCacheTTL` no greater than the reconciler's.

Notifications for a change go out on a webhook or cron reconcile after `notBefore`. Each run sends at most 500, oldest first, and failed sends stay pending, so a backlog can take several runs. Delivery is at-least-once: overlapping reconciles can send the same due notification twice.

Notifications are coarse: RPs receive a `profileDataChange` event and re-fetch their profile/capabilities view. We deliberately don't enumerate added vs removed capabilities — that stays inside the diff.

## Building

```
nx build free-access-program
```

## Running unit tests

```
nx test-unit free-access-program
```

## Reconcile cron

Runs in-process as an auth-server script:

```
NODE_ENV=<env> node -r ts-node/register packages/fxa-auth-server/scripts/free-access-program-reconcile.ts
```

Schedule via the same cron mechanism that drives the other auth-server periodic scripts. The script no-ops (with a `free-access-program-reconcile.skipped` log) when `subscriptions.enabled` is false or when the CMS Strapi client isn't configured.

## Config

Wired via auth-server convict (`packages/fxa-auth-server/config/index.ts`).

- `cms.strapiClient.*` (env `STRAPI_CLIENT_*`) — shared with the `StrapiClient`. `FreeAccessProgramConfigurationManager` reuses this config for its projection cache; disjoint `type-cacheable` keys (`freeAccessProgramProjection` vs per-query) mean the two managers share the Firestore collection without colliding.
- `subscriptions.freeAccessProgramJournal.collectionName` (env `FREE_ACCESS_PROGRAM_JOURNAL_COLLECTION_NAME`, default `subplat-free-access-program-journal`) — the durable journal collection, distinct from the read cache.

The journal collection holds a `state` document with `{ projection, updatedAt }` and a `state/pending` subcollection of `{ email, notBefore }` docs keyed by the sha256 of the lowercased email. No TTL: `state` is the reconciler's source of truth for the diff. Deleting `state` alone leaves `state/pending` in place; the next reconcile is a cold start that only seeds the journal, and the warm reconcile after it sends the due pending docs, subject to the per-run limit and failures. Deleting `state/pending` discards unsent notifications, and a cold start won't recreate them, so let pending drain (wait out `notBefore` and run reconcile) before resetting either.
