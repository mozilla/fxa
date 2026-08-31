# ClickHouse migrations

Numbered SQL files, applied in order. Same rules as `packages/db-migrations`:

- Don't edit a file once it has shipped. To undo a change, add a new file that reverses it.
- Every statement must be safe to run twice (`CREATE TABLE IF NOT EXISTS`, `ADD COLUMN IF NOT EXISTS`), so a failed run can just be retried.
- One change per file.
- Bump `target-patch.json` in the same PR as the new file.

## Running

```sh
nx run entitlements-metering:migrate-clickhouse
```

`migrate.mjs` creates the database if needed, applies every file up to the level in `target-patch.json` that isn't already in the `schema_migrations` table, and records what it applied.

Connection settings come from `METERING_CLICKHOUSE_URL`, `METERING_CLICKHOUSE_USERNAME`, `METERING_CLICKHOUSE_PASSWORD` and `METERING_CLICKHOUSE_DATABASE`. The defaults point at the local container from `yarn start infrastructure` (port 8124). The integration tests use that same container and only run locally.

## Schema constraints

- The `events` sort key `(client_id, slug, subject, event_time, event_id_hash)` can't be changed without rewriting the table.
- `events` must stay partitioned by month. Parts can't merge across partitions, and a monthly usage window needs to read from as few parts as possible.
- Duplicates are dropped at ingest. `ReplacingMergeTree` on `events` is only a safety net and reads must not rely on it.
- Retention is 90 days on every table. Change all of them together.
- Leave `ttl_only_drop_parts` off, otherwise expiry lags by up to a month.
- Reads must run under `ClickHouseConfig.maxMemoryUsageBytes`. A single unbounded query can take the server down.
- Read `sessions` with `max(session_start)`. It's a `ReplacingMergeTree` and may hold more than one row per subject until merged.
- Integration tests must anchor timestamps to the current time (`anchoredClock()` in `src/testing.ts`), otherwise TTL deletes the fixtures once they age past 90 days.
