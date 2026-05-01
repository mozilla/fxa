# Backfill `accountAuthorizations` — Test Cases

Script: `packages/fxa-auth-server/scripts/backfill-account-authorizations/backfill-account-authorizations.ts`

The matching logic mirrors `lib/oauth/browser-services.ts:recordAuthorizationOnLogin`:

- **Scope match** requires the clientId to be a recognized minter for that service (scope alone is not proof of authorization).
- **ClientId-only fallback** only fires when the clientId maps to **exactly one** service.
- **Service-ambiguous clientIds** (Firefox Desktop, `5882386c6d801776`) cannot be reliably attributed without `serviceParam`, which is not stored on `refreshTokens`. These are skipped unless scope+clientId match resolves a single service.

---

## Test Cases

| ID  | Category                   | Setup                                                                                                                         | Expected Outcome                                                                                                                                               |
| --- | -------------------------- | ----------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| T01 | Basic match                | 1 token, relay scope + relay clientId (scope+clientId AND match)                                                              | 1 row: `(uid, relay-scope, 'relay', token.createdAt)`                                                                                                          |
| T02 | Basic match                | 1 token, vpn scope + vpn clientId                                                                                             | 1 row for `'vpn'`                                                                                                                                              |
| T03 | Basic match                | 1 token, relay clientId (single-service), no relay scope                                                                      | 1 row for `'relay'` — matched via clientId-only fallback                                                                                                       |
| T04 | Basic match                | 1 token, `profile` scope only, unrelated clientId                                                                             | 0 rows — no service match                                                                                                                                      |
| T05 | Basic match                | 1 token, `openid` scope only, unrelated clientId                                                                              | 0 rows                                                                                                                                                         |
| T06 | Basic match                | 1 token, `profile openid` multi-scope, unrelated clientId                                                                     | 0 rows                                                                                                                                                         |
| T07 | Multi-service              | 1 token, relay+vpn scopes, clientId that mints both                                                                           | 2 rows — one per service, same uid, same `authorizedAt`                                                                                                        |
| T08 | Multi-service              | 1 token, relay+`profile` scope, relay clientId                                                                                | 1 row for relay only                                                                                                                                           |
| T09 | Multi-token, same service  | 2 tokens, same uid, both relay scope + relay clientId; token A `createdAt` earlier than B                                     | 1 row: `authorizedAt = A.createdAt` (LEAST)                                                                                                                    |
| T10 | Multi-token, same service  | 2 tokens, same uid, both relay scope + relay clientId, identical timestamps                                                   | 1 row, no duplication                                                                                                                                          |
| T11 | Multi-token, same service  | 3 tokens, same uid, relay scope + relay clientId, `createdAt` interleaved across all three                                    | 1 row: `authorizedAt = min(createdAt)` across all three                                                                                                        |
| T12 | Multi-token, multi-service | Token A: relay scope + relay clientId. Token B: vpn scope + vpn clientId. Same uid.                                           | 2 rows — one relay, one vpn                                                                                                                                    |
| T13 | Multi-token, multi-service | Token A: relay scope + relay clientId. Token B: `profile` scope + unrelated clientId. Same uid.                               | 1 row for relay only                                                                                                                                           |
| T14 | Scope matching             | Scope = `https://identity.mozilla.com/apps/relay-extra`, unrelated clientId                                                   | 0 rows — partial match must not fire                                                                                                                           |
| T15 | Scope matching             | Scope = `https://identity.mozilla.com/apps/rela`, unrelated clientId                                                          | 0 rows                                                                                                                                                         |
| T16 | Scope matching             | Scope = `profile https://identity.mozilla.com/apps/relay`, relay clientId                                                     | 1 row — correctly splits space-separated string and matches relay                                                                                              |
| T17 | Timestamps                 | 1 token, relay scope + relay clientId, specific `createdAt` (e.g. `2025-01-15T10:00:00Z`)                                     | `authorizedAt = 1736935200000` (verifies TIMESTAMP → BIGINT ms-epoch conversion)                                                                               |
| T18 | Idempotency                | Pre-existing row with `authorizedAt = T`. Token has same `createdAt = T`.                                                     | Row unchanged (LEAST(T, T) = T) — no-op                                                                                                                        |
| T19 | Idempotency                | Pre-existing row with `authorizedAt = T`. Token has `createdAt = T+N` (later).                                                | Row unchanged: `authorizedAt` stays at `T` (LEAST wins, existing is earlier)                                                                                   |
| T20 | Idempotency                | Pre-existing row with `authorizedAt = T`. Token has `createdAt = T-N` (earlier).                                              | Row updated: `authorizedAt = T-N` (LEAST wins, token reveals an earlier authorization)                                                                         |
| T21 | Idempotency                | Script run twice on identical data                                                                                            | Result identical to single run                                                                                                                                 |
| T22 | Strict matching            | 1 token, relay scope, clientId that is **not** a relay minter                                                                 | 0 rows — scope alone is not proof of authorization (matches `recordAuthorizationOnLogin`)                                                                      |
| T23 | Strict matching            | 1 token, no service scope, clientId that maps to **multiple** services (e.g. mobile Firefox in relay+vpn+sync)                | 0 rows — multi-service clientId without scope is ambiguous, no fallback                                                                                        |
| T24 | Strict matching            | 1 token, no service scope, Firefox Desktop clientId (`5882386c6d801776`)                                                      | 0 rows — service-ambiguous clientId requires `serviceParam` which isn't stored on refreshTokens; metric `tokens_skipped{reason=ambiguous_no_match}` increments |
| T25 | Strict matching            | 1 token, relay scope, Firefox Desktop clientId (which is in relay's `clientIds`)                                              | 1 row — scope+clientId AND still works for ambiguous clientIds                                                                                                 |
| T26 | Dry run                    | Various tokens covering T01–T08 cases, run with `--dry-run`                                                                   | 0 rows written. Log reports correct per-service counts. Statsd metrics still emitted.                                                                          |
| T27 | Dry run                    | Pre-existing rows in `accountAuthorizations`, run with `--dry-run`                                                            | Table unchanged. Counts logged correctly.                                                                                                                      |
| T28 | Resumability               | 500 tokens, `--batch-size 100`. Interrupt after batch 2 (cursor at position 200). Restart with `--start-cursor <that value>`. | Final table state identical to an uninterrupted run.                                                                                                           |
| T29 | Volume/batching            | 10,000 tokens, mix of service and non-service scopes, `--batch-size 500`                                                      | All service-matching tokens produce rows. Cursor advances correctly across all batches. No rows missed or duplicated.                                          |
| T30 | Volume/batching            | 10,000 tokens, all non-service scopes + unrelated clientIds                                                                   | 0 rows in `accountAuthorizations`. Script completes cleanly.                                                                                                   |
| T31 | Service filter             | Tokens for relay + vpn + sync. Run with `--service relay`.                                                                    | Only relay rows written. VPN and sync tokens scanned but not upserted.                                                                                         |
| T32 | Service filter             | 1 token matching both relay (scope) and vpn (scope) from a clientId minting both. Run with `--service relay`.                 | 1 row for relay only — vpn skipped at output filter.                                                                                                           |
| T33 | Service filter             | Run unfiltered, then run `--service relay` again.                                                                             | Relay rows: `authorizedAt` unchanged (LEAST is a no-op for identical values). Other services unaffected.                                                       |
| T34 | Service filter             | `--service nonexistent`                                                                                                       | Script exits early with clear error: `No service 'nonexistent' found in browserServices config`.                                                               |

---

## Seeding Strategy

### Layer 1 — Exact test case rows

Small, deterministic rows with controlled UIDs, client IDs, scopes, and timestamps — one or a few rows per case. These are asserted against field-by-field after the run.

### Layer 2 — Volume noise

N thousand rows with random UIDs, random non-service client IDs, and non-service scopes (`profile`, `openid`, `https://example.com/other`). Should produce 0 rows in `accountAuthorizations` but force real batching behaviour across at least 20–30 batches at the chosen batch size.

Seeding should be deterministic (fixed values or fixed random seed) so expected outcomes are reproducible across runs.

---

## Coverage Notes

- **T01–T21** are covered by the deterministic seed in `seed-test-data.ts` and verified by the SQL block at the bottom of this doc.
- **T22–T25 (strict matching edge cases)** are documented but not yet in the seed. To verify, add tokens with:
  - T22: relay scope + an unrelated clientId (uid `aa…0022`)
  - T23: profile scope + a multi-service clientId like mobile Firefox `1b1a3e44c54fbb58` (uid `aa…0023`)
  - T24: profile scope + Firefox Desktop `5882386c6d801776` (uid `aa…0024`)
  - T25: relay scope + Firefox Desktop `5882386c6d801776` (uid `aa…0025`)
- **T26–T34** are run-mode tests (dry run, resumability, volume, service filter) verified manually via flags and log inspection.

## Open Questions

- **Sync desktop (`allowSilentExchange: false`)**: Should Sync **desktop** refresh tokens be backfilled? The flag governs future silent exchanges, not historical state. Mobile Firefox already mints sync via refresh tokens; desktop is the open question. See the related caveat in the [PR #20500 review](https://github.com/mozilla/fxa/pull/20500#pullrequestreview-4238172630). If excluded, possibly add `backfill: false` to the service config, or omit from backfill manually (rp by rp runs). Needs confirmation before implementation.

## Verifying Results

Once the seed data is added, and backfill is run, we can use the following to verify the results

```sql
SELECT test_id, HEX(uid) AS uid, service, actual_rows, expected_rows,
  authorizedAt, expected_authorizedAt,
  IF(
    actual_rows = expected_rows
    AND (expected_authorizedAt IS NULL OR authorizedAt = expected_authorizedAt),
    'PASS', 'FAIL'
  ) AS result
FROM (
  SELECT 'T01' AS test_id, x'aa000000000000000000000000000001' AS uid, 'relay' AS service,
    (SELECT COUNT(*) FROM accountAuthorizations WHERE uid = x'aa000000000000000000000000000001' AND service = 'relay') AS actual_rows,
    1 AS expected_rows,
    (SELECT authorizedAt FROM accountAuthorizations WHERE uid = x'aa000000000000000000000000000001' AND service = 'relay' LIMIT 1) AS authorizedAt,
    NULL AS expected_authorizedAt

  UNION ALL SELECT 'T02', x'aa000000000000000000000000000002', 'vpn',
    (SELECT COUNT(*) FROM accountAuthorizations WHERE uid = x'aa000000000000000000000000000002' AND service = 'vpn'),
    1, (SELECT authorizedAt FROM accountAuthorizations WHERE uid = x'aa000000000000000000000000000002' AND service = 'vpn' LIMIT 1), NULL

  UNION ALL SELECT 'T03 (clientId-only fallback)', x'aa000000000000000000000000000003', 'relay',
    (SELECT COUNT(*) FROM accountAuthorizations WHERE uid = x'aa000000000000000000000000000003' AND service = 'relay'),
    1, NULL, NULL

  UNION ALL SELECT 'T04 (expect 0)', x'aa000000000000000000000000000004', NULL,
    (SELECT COUNT(*) FROM accountAuthorizations WHERE uid = x'aa000000000000000000000000000004'),
    0, NULL, NULL

  UNION ALL SELECT 'T05 (expect 0)', x'aa000000000000000000000000000005', NULL,
    (SELECT COUNT(*) FROM accountAuthorizations WHERE uid = x'aa000000000000000000000000000005'),
    0, NULL, NULL

  UNION ALL SELECT 'T06 (expect 0)', x'aa000000000000000000000000000006', NULL,
    (SELECT COUNT(*) FROM accountAuthorizations WHERE uid = x'aa000000000000000000000000000006'),
    0, NULL, NULL

  UNION ALL SELECT 'T07 relay+vpn (expect 2 rows)', x'aa000000000000000000000000000007', NULL,
    (SELECT COUNT(*) FROM accountAuthorizations WHERE uid = x'aa000000000000000000000000000007'),
    2, NULL, NULL

  UNION ALL SELECT 'T08', x'aa000000000000000000000000000008', 'relay',
    (SELECT COUNT(*) FROM accountAuthorizations WHERE uid = x'aa000000000000000000000000000008' AND service = 'relay'),
    1, NULL, NULL

  UNION ALL SELECT 'T09 authorizedAt=LEAST', x'aa000000000000000000000000000009', 'relay',
    (SELECT COUNT(*) FROM accountAuthorizations WHERE uid = x'aa000000000000000000000000000009' AND service = 'relay'),
    1,
    (SELECT authorizedAt FROM accountAuthorizations WHERE uid = x'aa000000000000000000000000000009' AND service = 'relay' LIMIT 1),
    1704067200000

  UNION ALL SELECT 'T10', x'aa00000000000000000000000000000a', 'relay',
    (SELECT COUNT(*) FROM accountAuthorizations WHERE uid = x'aa00000000000000000000000000000a' AND service = 'relay'),
    1, NULL, NULL

  UNION ALL SELECT 'T11 authorizedAt=LEAST(3 tokens)', x'aa00000000000000000000000000000b', 'relay',
    (SELECT COUNT(*) FROM accountAuthorizations WHERE uid = x'aa00000000000000000000000000000b' AND service = 'relay'),
    1,
    (SELECT authorizedAt FROM accountAuthorizations WHERE uid = x'aa00000000000000000000000000000b' AND service = 'relay' LIMIT 1),
    1704067200000

  UNION ALL SELECT 'T12 relay+vpn (expect 2 rows)', x'aa00000000000000000000000000000c', NULL,
    (SELECT COUNT(*) FROM accountAuthorizations WHERE uid = x'aa00000000000000000000000000000c'),
    2, NULL, NULL

  UNION ALL SELECT 'T13', x'aa00000000000000000000000000000d', 'relay',
    (SELECT COUNT(*) FROM accountAuthorizations WHERE uid = x'aa00000000000000000000000000000d' AND service = 'relay'),
    1, NULL, NULL

  UNION ALL SELECT 'T14 (expect 0)', x'aa00000000000000000000000000000e', NULL,
    (SELECT COUNT(*) FROM accountAuthorizations WHERE uid = x'aa00000000000000000000000000000e'),
    0, NULL, NULL

  UNION ALL SELECT 'T15 (expect 0)', x'aa00000000000000000000000000000f', NULL,
    (SELECT COUNT(*) FROM accountAuthorizations WHERE uid = x'aa00000000000000000000000000000f'),
    0, NULL, NULL

  UNION ALL SELECT 'T16', x'aa000000000000000000000000000010', 'relay',
    (SELECT COUNT(*) FROM accountAuthorizations WHERE uid = x'aa000000000000000000000000000010' AND service = 'relay'),
    1, NULL, NULL

  UNION ALL SELECT 'T17 authorizedAt=BIGINT', x'aa000000000000000000000000000011', 'relay',
    (SELECT COUNT(*) FROM accountAuthorizations WHERE uid = x'aa000000000000000000000000000011' AND service = 'relay'),
    1,
    (SELECT authorizedAt FROM accountAuthorizations WHERE uid = x'aa000000000000000000000000000011' AND service = 'relay' LIMIT 1),
    1736935200000

  UNION ALL SELECT 'T18 idempotent no-op', x'aa000000000000000000000000000012', 'relay',
    (SELECT COUNT(*) FROM accountAuthorizations WHERE uid = x'aa000000000000000000000000000012' AND service = 'relay'),
    1,
    (SELECT authorizedAt FROM accountAuthorizations WHERE uid = x'aa000000000000000000000000000012' AND service = 'relay' LIMIT 1),
    1704067200000

  UNION ALL SELECT 'T19 idempotent no-op', x'aa000000000000000000000000000013', 'relay',
    (SELECT COUNT(*) FROM accountAuthorizations WHERE uid = x'aa000000000000000000000000000013' AND service = 'relay'),
    1,
    (SELECT authorizedAt FROM accountAuthorizations WHERE uid = x'aa000000000000000000000000000013' AND service = 'relay' LIMIT 1),
    1704067200000

  UNION ALL SELECT 'T20 authorizedAt=LEAST(pre-seed)', x'aa000000000000000000000000000014', 'relay',
    (SELECT COUNT(*) FROM accountAuthorizations WHERE uid = x'aa000000000000000000000000000014' AND service = 'relay'),
    1,
    (SELECT authorizedAt FROM accountAuthorizations WHERE uid = x'aa000000000000000000000000000014' AND service = 'relay' LIMIT 1),
    1685577600000

  UNION ALL SELECT 'T21 second run no-op', x'aa000000000000000000000000000015', 'relay',
    (SELECT COUNT(*) FROM accountAuthorizations WHERE uid = x'aa000000000000000000000000000015' AND service = 'relay'),
    1, NULL, NULL

  UNION ALL SELECT 'noise-client (expect 0)', x'aa000000000000000000000000000099', NULL,
    (SELECT COUNT(*) FROM accountAuthorizations WHERE uid = x'aa000000000000000000000000000099'),
    0, NULL, NULL

) AS checks
ORDER BY test_id;
```
