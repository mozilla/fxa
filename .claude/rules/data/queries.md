---
paths:
  - "packages/fxa-shared/db/**/*.ts"
  - "packages/fxa-auth-server/lib/db.ts"
  - "packages/fxa-auth-server/lib/oauth/db/**/*.js"
  - "packages/fxa-auth-server/lib/oauth/db/**/*.ts"
  - "packages/fxa-profile-server/lib/db/**/*.js"
  - "packages/fxa-admin-server/src/database/**/*.ts"
  - "libs/shared/db/mysql/**/*.ts"
  - "libs/payments/**/*.repository.ts"
  - "libs/payments/**/*.manager.ts"
  # Pattern-level negation (gitignore/minimatch style) — UNDOCUMENTED for the
  # rules matcher as of this writing. If supported, these drop test files and
  # fixtures so the rule only loads on production data-access code. The text
  # skip in the body below is the reliable backstop if negation is ignored.
  - "!**/*.{spec,test}.ts"
  - "!**/test/**"
---

# FXA Data-Layer Query Rules

Applies whenever you read or edit MySQL data-access code in FXA — the Knex/Objection models in `fxa-shared/db`, the legacy raw-SQL clients in `fxa-auth-server/lib/oauth/db/mysql` and `fxa-profile-server/lib/db/mysql`, the Kysely repositories under `libs/shared/db/mysql` and `libs/payments`, and the admin-server database service.

This code runs against tables that can exceed 150M rows. A query that looks fine on a seeded dev DB can table-scan in production. These rules are about query shape, parameterization, and scale.

**Skip these rules when the file is a test or fixture** (`*.spec.ts`, `*.test.ts`, files under `test/`) — the testing rules cover those.

---

## 1. Parameterize every query — never interpolate values

String-built SQL is both a security hole (injection) and a plan-cache buster. Use placeholders/bindings regardless of layer.

```js
// Violation — interpolated value; injectable and unparameterized
knex.raw(`SELECT * FROM emails WHERE normalizedEmail = '${email}'`);

// Correct (legacy raw client) — ? placeholder with bound args
const Q_EMAIL_GET = 'SELECT * FROM emails WHERE normalizedEmail = ?';
this._read(Q_EMAIL_GET, [email]);

// Correct (Knex) — bound parameter
knex.raw('SELECT * FROM emails WHERE normalizedEmail = ?', [email]);

// Correct (Kysely) — builder binds automatically
db.selectFrom('emails').selectAll().where('normalizedEmail', '=', email);
```

Stored-proc calls go through the `callString(proc, argCount)` helper in `base-auth.ts`, which emits `CALL proc(?, ?, …)` — pass values as the bound args array, never concatenate them into the call string.

---

## 2. No `SELECT *` — name the columns you use

`SELECT *` over a wide table ships bytes you don't need, defeats covering indexes, and silently breaks when columns are added/reordered. Select the explicit column list.

```js
// Violation
'SELECT * FROM accounts WHERE uid = ?';

// Correct — only what the caller consumes; can be served by a covering index
'SELECT uid, email, emailVerified, locale FROM accounts WHERE uid = ?';
```

Pre-existing `SELECT *` constants in legacy files are not your mandate to refactor wholesale — but don't add new ones, and tighten the one you're touching.

---

## 3. Every WHERE / JOIN / ORDER BY must be index-backed

On a large table, an unindexed predicate is a full scan. Before writing or changing a query:

- Confirm the `WHERE`/`JOIN` columns are covered by an existing index (check the table's `CREATE TABLE` / index patches under `db-migrations`).
- If the access path needs a new index, that's a migration (`.sql` patch) — flag it; don't ship the query assuming the index exists.
- Be wary of leading-wildcard `LIKE '%x'`, functions wrapping an indexed column (`WHERE LOWER(email) = ?`), or `OR` across different columns — all defeat indexes. FXA stores `normalizedEmail` precisely so lookups stay sargable; follow that pattern.

---

## 4. Bound every potentially-large result set with LIMIT

A query whose result grows with user/account activity must have an explicit `LIMIT`. Listing endpoints (tokens, devices, sessions, security events) can return huge sets for heavy accounts.

```js
// Violation — unbounded; a heavy account can return tens of thousands of rows
'SELECT id, createdAt FROM securityEvents WHERE uid = ? ORDER BY createdAt DESC';

// Correct — explicit cap (paginate with keyset, not large OFFSET)
'SELECT id, createdAt FROM securityEvents WHERE uid = ? ORDER BY createdAt DESC LIMIT ?';
```

Paginate with keyset/seek (`WHERE createdAt < ? ORDER BY createdAt DESC LIMIT ?`), not large `OFFSET` — `OFFSET 100000` still scans and discards 100k rows.

---

## 5. No N+1 — fetch sets in one round trip

A query inside a loop over rows multiplies latency and connection-pool pressure. Fetch the related rows in a single set-based query.

```ts
// Violation — one query per device; N round trips
for (const d of devices) {
  d.commands = await knex.raw('SELECT * FROM deviceCommands WHERE deviceId = ?', [d.id]);
}

// Correct — single query, group in app code (or a JOIN)
const cmds = await knex('deviceCommands').whereIn('deviceId', devices.map((d) => d.id));
```

---

## 6. Batch and bound large writes; keep transactions short

`UPDATE`/`DELETE` without a selective, indexed `WHERE` can lock huge ranges and lag replication. Bulk maintenance (pruning, backfills) must chunk by PK/time range with a `LIMIT` per batch and commit between batches — see the `prune` stored procedure pattern rather than a single unbounded statement.

Hold transactions open for as little as possible: do I/O and computation *before* `START TRANSACTION`, not between it and `COMMIT`. A transaction that awaits a network call mid-flight holds row locks for the round trip.

---

## 7. Preserve the read/write split and use the shared pool

- The legacy oauth/profile clients expose `_read`/`_readOne` vs `_write`. Today both run against the same pool — the split is a *convention* (it documents intent and keeps the door open for replica routing later). Keep using `_read` for `SELECT` and `_write` for DML; don't collapse them or send a `SELECT` through `_write`.
- Don't open ad-hoc connections. Use the shared Knex/Kysely instance from the package's setup/config module so pooling and the session settings established at connect time (`utf8mb4`, `sql_mode`, time zone) apply uniformly.
- Don't tune pool size or connection options inline in a query module — that belongs in the central config (`fxa-shared/db/config.ts`, `libs/shared/db/mysql/core`).
