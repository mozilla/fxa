# Account-level OAuth authorization table (`accountAuthorizations`)

- Status: accepted
- Deciders: Lauren Zugai, Nick Shirley, Dan Schomburg, Vijay Budhram, Wil Clouser, Ross Otto
- Date: 2026-07-03

Technical Story: [FXA-13761]. Builds on ADR [0048](0048-refresh-tokens-and-account-level-authorization.md).

## Context and Problem Statement

ADR 0048 introduced explicit account-level authorization — a persistent consent ledger — for Firefox browser services and relying parties. Around the same time, a batch of related product requirements arrived that each wanted some per-user, per-service record, but for different reasons, necessitating different tables and data design.

This ADR covers only the authorization/consent table, `accountAuthorizations`. Liveness/activity tracking (and a possibly-separate inactive-account-deletion table) are out of scope.

## Requirements that came up together

| #   | Requirement                                                                  | Served by this table?                                                |
| --- | ---------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| 1   | Token-exchange policy gate ([FXA-12930])                                     | **Yes** — the core purpose                                           |
| 2   | Reject `prompt=none` / silent exchange on RP ToS update ([FXA-13825])        | **Yes** — via `lastAuthorizedTosAt`                                  |
| 3   | Braze "first authorization of a service" trigger ([FXA-13267] / [FXA-13784]) | **Yes** — first-authorization check                                  |
| 4   | Device-specific asks                                                         | No — determined to be doable separately without affecting new tables |
| 5   | Inactive-account-deletion liveness ([FXA-13662])                             | No                                                                   |
| 6   | Liveness for lapsed Smart Window / Sync users ([FXA-13391])                  | No                                                                   |
| 7   | Support tooling / dashboards of user↔service relationships                  | Partially — authorization relationships only                         |

## Decision

Use a dedicated consent ledger, `accountAuthorizations`, in the `fxa_oauth` database.

**Schema** — one row per `(uid, scope, service, clientId)`:

- `uid`, `scope`, `service`, `clientId` — primary key (most lookups use its `(uid, scope, service)` left-prefix).
- `firstAuthorizedTosAt` — set once, on the first authorization (drives the Braze first-auth signal).
- `lastAuthorizedTosAt` — bumped on each interactive re-authorization; must _not_ be bumped by silent paths (`prompt=none`, token exchange) so it can gate ToS re-consent.

The `…TosAt` naming reflects intent: these track terms-of-service agreement, not general activity. The scope→service mapping lives in auth-server Convict config (`oauthServer.exchange.serviceScopes`), not a column, so adding a browser service is config + deploy with no schema change.

A row is attributed to a service only when **both** the scope and the `clientId` are configured for it (`serviceScopes` + `allowedClientsForService`). A matching scope from a non-configured client does not touch that service's consent row — e.g. if Mozilla Monitor requests the Relay scope but its `clientId` isn't allow-listed for the Relay "project", it does not write to the Relay consent row. This `service` grouping follows Google's [cross-client identity](https://developers.google.com/identity/protocols/oauth2/cross-client-identity) model — multiple client IDs under one "project," with consent scoped to the project.

### Writes & reads

- **Write — one row per consented scope at the authorization grant.** Fires on a normal RP / browser-service sign-in, and skips `prompt=none`; it is not written when an access token is later minted. Repeat writes are gated by a throttled Redis key (first write inserts, subsequent writes within its TTL no-op), avoiding a read-before-write on every grant ([FXA-14048]).
- **Write — one-time backfill** over `refreshTokens` ([FXA-12932], see below).
- **Read — token-exchange gate** (`_hasConsentForScope`, via the `EXCHANGE_DECISION` matrix in `lib/routes/oauth/token.js`) and the **first-authorization signal** (`hasConsentForService` / `hasConsentForClient`, `lib/oauth/first-authorization.ts`); also the admin panel (`fxa-admin-server`).
- **Delete** on account deletion, and on sign-out / service disconnect once no corresponding entry remains ([FXA-14101], below).

### Reaching a pre-authorization state ([FXA-14101])

When the user signs out or removes a service from Connected Services, we check whether they still have any other entries corresponding to that consent row (per the `browserServices` config / cross-client-identity setup); if none remain, we delete the row. Because token exchange treats a missing row as no consent, this returns the user to a pre-authorization state and the next token exchange denies.

This is preferred over a nullable `revokedAt` column ([FXA-14015], cancelled): it reaches the denied state with no new column or read-path change, and re-authorizing re-inserts the row (building on the sign-out deletion plumbing, [FXA-12931]). Account deletion likewise hard-deletes rows. Trade-off: deletion loses the per-row ToS history for a fully-disconnected service — accepted, since the record only matters while an authorization is active.

### ToS re-consent ([FXA-13825])

`lastAuthorizedTosAt` gates ToS re-consent: `prompt=none` / silent token exchange is rejected when an RP publishes updated terms after that timestamp, forcing an interactive re-agreement. It's a proxy — a "token minted outside `prompt=none`" time, not a literal ToS-view event — but reliable, since any non-silent path shows at least a cached-login screen.

### Backfill ([FXA-12932])

A one-time script walks `refreshTokens` in cursor order and writes one row per `(uid, scope, service, clientId)`, idempotent via `INSERT … ON DUPLICATE KEY UPDATE LEAST(first…)/GREATEST(last…)` so it is safe to re-run.

- **All RPs, not just browser services.** `service` is inferred per token (exactly one matching service-scope URL → that service, otherwise `''`); e.g. a 123done token lands as rows with `service=''`. Deliberate, so ToS re-consent can gate non-browser RPs too.
- **`lastAuthorizedTosAt` = token `createdAt`, not a real ToS view.** For `prompt=none`-minted tokens the user never saw the ToS, so backfilled values are upper bounds; organic `/authorization` writes converge them forward. `firstAuthorizedTosAt` equals `lastAuthorizedTosAt` unless the user had multiple tokens.
- **Desktop gap.** Desktop calls `/destroy` on its sync refresh token right after sign-in, so it isn't in the scan source; sync and Desktop `service=` logins (Smart Window, etc.) are forward-filled by new logins, not backfilled.
- **Sync rows are benign.** Sync-scoped rows that do land (from mobile, or any browser flow that mints a Sync refresh token) are acceptable — the table gates silent token exchange, and Sync is never granted silently. This is expected to tidy up once Desktop moves to refresh tokens.

## History

This table went through several iterations — it was first weighed as one combined consent + liveness table before being split from `accountActivity`. Its original implementation removed rows only on account deletion, with no way to return to a pre-authorization state; a `revokedAt` column was then proposed ([FXA-14015]) and ultimately dropped in favor of deleting the row on last disconnect ([FXA-14101]), because a lingering consent row would otherwise silently re-grant scopes on the next token exchange.

## Notes

- **Planned DB improvements.** Normalizing `scope` to a `scopeId`, the resulting PK change, an in-memory scopes cache, and the prerequisites for a full `refreshTokens` backfill are tracked in [FXA-14169].
- **BigQuery authorization log.** If a full history of authorizations is ever needed, we may emit each `lastAuthorizedTosAt` update as a log entry to a new BigQuery table so subsequent updates don't overwrite prior values. Not needed today — `firstAuthorizedTosAt` (Braze / [FXA-13267]) and the current `lastAuthorizedTosAt` ([FXA-13825]) cover the known consumers. Tracked as [FXA-14102], to be implemented only if we decide we need per-authorization ToS/PP history.

## Links

- Builds on [ADR 0048](0048-refresh-tokens-and-account-level-authorization.md).
- Relying-party inactive account management (account liveness, covered by the separate activity ADR): [FXA-13391] and [design doc](https://docs.google.com/document/d/1BQAtMnviFAcyV6IZHs5niaUshvsQykqkrX9JUbj1fIo/edit).

[FXA-13761]: https://mozilla-hub.atlassian.net/browse/FXA-13761
[FXA-12930]: https://mozilla-hub.atlassian.net/browse/FXA-12930
[FXA-12931]: https://mozilla-hub.atlassian.net/browse/FXA-12931
[FXA-13267]: https://mozilla-hub.atlassian.net/browse/FXA-13267
[FXA-13662]: https://mozilla-hub.atlassian.net/browse/FXA-13662
[FXA-13784]: https://mozilla-hub.atlassian.net/browse/FXA-13784
[FXA-13825]: https://mozilla-hub.atlassian.net/browse/FXA-13825
[FXA-14015]: https://mozilla-hub.atlassian.net/browse/FXA-14015
[FXA-13391]: https://mozilla-hub.atlassian.net/browse/FXA-13391
[FXA-14101]: https://mozilla-hub.atlassian.net/browse/FXA-14101
[FXA-14102]: https://mozilla-hub.atlassian.net/browse/FXA-14102
[FXA-12932]: https://mozilla-hub.atlassian.net/browse/FXA-12932
[FXA-14048]: https://mozilla-hub.atlassian.net/browse/FXA-14048
[FXA-14169]: https://mozilla-hub.atlassian.net/browse/FXA-14169
