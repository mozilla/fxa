---
paths:
  - "packages/db-migrations/databases/**/*.sql"
---

# FXA Database Migration Rules

Applies whenever you read or edit a `.sql` patch under `packages/db-migrations/databases/{fxa,fxa_oauth,fxa_profile,pushbox}/patches/`. FXA runs at scale — some tables exceed 150M rows — so a migration that is harmless on a dev box can lock a production table for minutes. These rules are MySQL/InnoDB-specific.

**Never edit an existing published patch.** Patches are immutable once merged. A change always means a *new* forward patch (`patch-N-N+1.sql`) and its paired rollback (`patch-N+1-N.sql`). See `CLAUDE.md` §2.

---

## 1. Follow the patch envelope exactly

Every forward patch asserts the current level, makes the change, then bumps `dbMetadata`. The paired rollback reverses the change and restores the prior level. Get the numbers wrong and the migration runner refuses to apply or applies out of order.

```sql
-- Violation — no level assertion, no metadata bump; runner can't sequence it
ALTER TABLE accounts ADD COLUMN foo TINYINT NOT NULL DEFAULT 0;

-- Correct — full envelope (forward patch-192-193.sql)
SET NAMES utf8mb4 COLLATE utf8mb4_bin;

CALL assertPatchLevel('192');

ALTER TABLE accounts ADD COLUMN foo TINYINT NOT NULL DEFAULT 0;

UPDATE dbMetadata SET value = '193' WHERE name = 'schema-patch-level';
```

Always author the matching rollback patch (`patch-193-192.sql`) that drops the column and sets the level back to `'192'`.

---

## 2. DDL on large tables must be online — state ALGORITHM and LOCK

A bare `ALTER TABLE` may copy the entire table while holding a metadata lock, blocking all reads and writes for the duration. On a 150M-row table that is an outage. Make the locking behavior explicit so it is reviewed, not discovered in production.

```sql
-- Violation — implicit algorithm; may trigger a full table copy with a write lock
ALTER TABLE sessionTokens ADD COLUMN lastAccessTime BIGINT UNSIGNED;

-- Correct — assert the fast path; fail loudly if MySQL can't do it online
ALTER TABLE sessionTokens
  ADD COLUMN lastAccessTime BIGINT UNSIGNED,
  ALGORITHM=INSTANT;  -- or ALGORITHM=INPLACE, LOCK=NONE
```

- Prefer `ALGORITHM=INSTANT` (metadata-only: add column at end, etc.) where supported.
- Else `ALGORITHM=INPLACE, LOCK=NONE` for index builds and most column changes.
- If neither is possible (e.g. changing a column type, adding a PK), **say so in a comment** and flag that the change needs an out-of-band tool (gh-ost / pt-online-schema-change) or a maintenance window. Do not ship a silent `COPY`-algorithm ALTER against a big table.

---

## 3. Index changes: add concurrently, justify every new index

Each secondary index is write amplification on every INSERT/UPDATE and storage on a huge table. Adding one is a real cost; dropping one can break a query plan.

- New index → `ALGORITHM=INPLACE, LOCK=NONE`, and in a comment state which query it serves.
- Before adding, check whether an existing index already covers the predicate (a `(uid, createdAt)` index serves `WHERE uid = ?` too).
- A `WHERE`/`JOIN`/`ORDER BY` introduced in a stored procedure or app query against a large table must be backed by an index — call it out in the patch comment.

---

## 4. Backfills and data DML must be bounded and batched

A single `UPDATE`/`DELETE` touching millions of rows builds one giant transaction: a long-held lock, replication lag, and a huge undo log.

```sql
-- Violation — rewrites the whole table in one transaction
UPDATE accounts SET locale = 'en-US' WHERE locale IS NULL;
```

Schema patches should change *schema*, not bulk-rewrite data. For large backfills, prefer a separate idempotent, batched script (chunk by PK range, `LIMIT` per batch, commit between batches) rather than inlining unbounded DML in a patch. If a small bounded data fix genuinely belongs in a patch, keep it bounded and note the affected row-count order of magnitude in a comment.

---

## 5. Stored procedures: keep transactions tight and ordered

FXA does multi-table writes via stored procedures (e.g. `deleteAccount_N`, `resetAccount_N`). When editing one:

- Wrap multi-statement writes in `START TRANSACTION` … `COMMIT` with an `EXIT HANDLER FOR SQLEXCEPTION` that does `ROLLBACK; RESIGNAL;` (see `deleteAccount_23`).
- **Order child-table writes before parent** when foreign keys lack `ON DELETE CASCADE` — deleting the parent first aborts the transaction with `ER_ROW_IS_REFERENCED_2`. When adding a new child table that references `accounts(uid)`, you must add its `DELETE` to `deleteAccount_N` (and reset/forgot procs as applicable).
- Each `DELETE ... WHERE uid = ?` should hit an index on `uid`. Don't add an unindexed predicate to a proc that runs per-user.
- Bump the proc's numeric suffix (`deleteAccount_24`) rather than editing an existing version, and `DROP`/recreate consistently in the rollback.

---

## 6. New columns: NULL-friendly or cheap default, charset-correct

- Prefer `NULL`able or `DEFAULT`-bearing columns so the add is metadata-only (`INSTANT`). A `NOT NULL` column with no default forces a value for every existing row.
- Match the table's charset/collation. FXA uses `utf8mb4 COLLATE utf8mb4_bin`; binary UUIDs are `BINARY(16)`, timestamps are `BIGINT UNSIGNED` (ms since epoch). Don't introduce `VARCHAR` UUIDs or `DATETIME` where the table uses the binary/epoch conventions.
