# Backfill `accountAuthorizations` — Test Cases

Script: `packages/fxa-auth-server/scripts/backfill-account-authorizations/index.ts`

---

## Test Cases

| ID | Category | Setup | Expected Outcome |
|---|---|---|---|
| T01 | Basic match | 1 token, Relay scope, Firefox client ID | 1 row: `(uid, relay-scope, 'relay', token.createdAt, token.lastUsedAt)` |
| T02 | Basic match | 1 token, VPN scope, Firefox client ID | 1 row for `'vpn'` |
| T03 | Basic match | 1 token, Relay web client ID, no relay scope | 1 row for `'relay'` — matched via clientId |
| T04 | Basic match | 1 token, `profile` scope only | 0 rows — no service match |
| T05 | Basic match | 1 token, `openid` scope only | 0 rows |
| T06 | Basic match | 1 token, `profile openid` multi-scope, no service scope | 0 rows |
| T07 | Multi-service | 1 token, Relay scope + VPN scope, same uid | 2 rows — one per service, same uid, same timestamps |
| T08 | Multi-service | 1 token, Relay scope + `profile` scope | 1 row for relay only |
| T09 | Multi-token, same service | 2 tokens, same uid, both Relay scope; token A `createdAt` earlier, token B `lastUsedAt` later | 1 row: `authorizedAt = A.createdAt` (LEAST), `lastUsedAt = B.lastUsedAt` (GREATEST) |
| T10 | Multi-token, same service | 2 tokens, same uid, both Relay scope, identical timestamps | 1 row, no ambiguity |
| T11 | Multi-token, same service | 3 tokens, same uid, Relay scope — createdAt and lastUsedAt interleaved across all three | 1 row: min createdAt, max lastUsedAt across all three |
| T12 | Multi-token, multi-service | Token A: Relay scope. Token B: VPN scope. Same uid. | 2 rows — one relay, one vpn |
| T13 | Multi-token, multi-service | Token A: Relay scope. Token B: `profile` scope. Same uid. | 1 row for relay only |
| T14 | Scope matching | Scope = `https://identity.mozilla.com/apps/relay-extra` | 0 rows — partial match must not fire; requires exact scope match |
| T15 | Scope matching | Scope = `https://identity.mozilla.com/apps/rela` | 0 rows |
| T16 | Scope matching | Scope = `profile https://identity.mozilla.com/apps/relay` | 1 row — correctly splits space-separated string and matches relay |
| T17 | Timestamps | 1 token, Relay scope, specific `createdAt` and `lastUsedAt` | `authorizedAt = createdAt * 1000` ms epoch, `lastUsedAt = lastUsedAt * 1000` ms epoch — verifies TIMESTAMP → BIGINT conversion |
| T18 | Idempotency | Row already exists with `lastUsedAt = T`. New token for same uid+service has `lastUsedAt = T+1`. | Row updated: `lastUsedAt = T+1` |
| T19 | Idempotency | Row already exists with `lastUsedAt = T`. New token has `lastUsedAt = T-1`. | Row unchanged: `lastUsedAt` stays at `T` (GREATEST wins) |
| T20 | Idempotency | Row already exists with `authorizedAt = T`. New token has `createdAt = T-1`. | Row updated: `authorizedAt = T-1` (LEAST wins — found earlier auth) |
| T21 | Idempotency | Script run twice on identical data | Result identical to single run |
| T22 | Dry run | Various tokens covering T01–T07 cases, run with `--dry-run` | 0 rows written. Log reports correct per-service counts. |
| T23 | Dry run | Pre-existing rows in `accountAuthorizations`, run with `--dry-run` | Table unchanged. Counts logged correctly. |
| T24 | Resumability | 500 tokens, `--batch-size 100`. Interrupt after batch 2 (cursor at position 200). Restart with `--start-cursor <that value>`. | Final table state identical to an uninterrupted run. |
| T25 | Volume/batching | 10,000 tokens, mix of service and non-service scopes, `--batch-size 500` | All service-matching tokens produce rows. Cursor advances correctly across all batches. No rows missed or duplicated. |
| T26 | Volume/batching | 10,000 tokens, all non-service scopes | 0 rows in `accountAuthorizations`. Script completes cleanly. |
| T27 | Service filter | Tokens for relay + vpn + monitor. Run with `--service relay`. | Only relay rows written. VPN and monitor tokens untouched. |
| T28 | Service filter | 1 token matching both relay (scope) and vpn (scope). Run with `--service relay`. | 1 row for relay only — vpn skipped. |
| T29 | Service filter | Run unfiltered, then run `--service relay` again. | Relay rows: authorizedAt/lastUsedAt unchanged (UPSERT is a no-op). Other services unaffected. |
| T30 | Service filter | `--service nonexistent` | Script exits early with clear error: "no service 'nonexistent' in browserServices config". |

---

## Seeding Strategy

### Layer 1 — Exact test case rows
Small, deterministic rows with controlled UIDs, client IDs, scopes, and timestamps — one or a few rows per case. These are asserted against field-by-field after the run.

### Layer 2 — Volume noise
N thousand rows with random UIDs, random non-service client IDs, and non-service scopes (`profile`, `openid`, `https://example.com/other`). Should produce 0 rows in `accountAuthorizations` but force real batching behaviour across at least 20–30 batches at the chosen batch size.

Seeding should be deterministic (fixed values or fixed random seed) so expected outcomes are reproducible across runs.

---

## Open Questions

- **Sync (`allowSilentExchange: false`)**: Should Sync refresh tokens be backfilled? The flag governs future silent exchanges, not historical state. If excluded, add `backfill: false` to the service config. Needs confirmation before implementation.
- **Relay/VPN/Monitor client IDs**: Placeholders in the `browserServices` config need real values before the script can match via clientId (T03-equivalent cases for each RP).
