# free-access-program

Front-door library for the Strapi-managed **B2B free-access allowlist** —
resolves per-email capability grants at read time, and reconciles Strapi
state into `profileDataChange` SNS events for downstream RPs at
write/webhook/cron time.

The projection itself (the by-email map of `email → { capabilities,
offeringApiIdentifiers }`) is owned by `FreeAccessProgramConfigurationManager`
in [`@fxa/shared/cms`](../shared/cms) — this lib layers the front-door
service and the durable reconciler journal on top of that projection.

## Runtime layout

| Piece | Lives in | Purpose |
|---|---|---|
| `FreeAccessProgramConfigurationManager` | `@fxa/shared/cms` | Two-layer (memory + Firestore) cache in front of the Strapi `accesses` query, projected into a flat by-email map via `AccessUtil.project`. |
| `FreeAccessProgramService` | this lib | Front door. `findCapabilitiesForEmail` / `findOfferingIdsForEmail` (O(1) map lookup); `reconcile()` (diff journal ↔ fresh projection, fan out per-email change signals). |
| `FreeAccessProgramJournalManager` + `free-access-program.repository.ts` | this lib | Durable Firestore document (`<collection>/state`) holding the last-fanned-out by-email projection. No TTL — this is the diff source-of-truth so cache evictions can't silently drop notifications. |
| `FreeAccessNotifier` interface + `FREE_ACCESS_NOTIFIER` token | this lib | Contract: `notifyEmailChanged(email)`. |
| `FreeAccessInProcessNotifier` | `packages/fxa-auth-server/lib/payments/` | Auth-server implementation. Resolves email → uid via `db.accountRecord`, invalidates the profile-server cache via `ProfileClient.deleteCache`, and emits a coarse `profileDataChange` event via `log.notifyAttachedServices`. |
| Webhook route (`POST /webhooks/strapi/free-access-program/access`) | `packages/fxa-auth-server/lib/routes/subscriptions/` | Strapi-facing entry point. Verifies the shared bearer, dedupes on `(event, documentId, createdAt)` for 60s, dispatches to `service.reconcile()`. |
| Reconcile cron | `packages/fxa-auth-server/scripts/free-access-program-reconcile.ts` | Periodic safety-net sweep. Same `reconcile()` call as the webhook. |

## Reconcile flow

1. `journalManager.get()` returns the last-fanned-out by-email projection, or `null` on cold start.
2. `configurationManager.getFreshProjection()` re-projects Strapi (skipping the read cache).
3. **Cold start** (`before === null`): `journalManager.set(after)` seeds the baseline; fire zero notifications.
4. **Warm path**: `diffByEmail(before, after)` walks both projections and returns emails whose capability map differs (order-insensitive on both `clientId` keys and capability slugs). New emails, removed emails, and changed capability sets all surface.
5. Persist the new baseline (`journalManager.set(after)`) and invalidate the read cache **before** firing notifications, so concurrent in-process readers don't serve stale state while downstream RPs are already learning the new state.
6. Fire `notifier.notifyEmailChanged(email)` for every affected email. Per-call failures are isolated so one bad email can't block the rest.

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

The journal collection holds a single `state` document with `{ projection, updatedAt }`. No TTL: this doc is the reconciler's source of truth for the diff.
