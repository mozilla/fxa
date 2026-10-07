---
paths:
  - "packages/db-migrations/**"
  - "packages/fxa-shared/test/db/models/**/*.sql"
  - "packages/fxa-shared/db/**"
  - "libs/shared/db/mysql/**"
---

# Database migrations: backward compatible, never rolled back

Production migrations are moving to being applied **before** the code that needs them deploys. Write them for that now. If that code is rolled back, the migration stays, so every migration must work with both:

- the code running in production now (release N-1), and
- the code being shipped with it (release N).

The reverse patch exists for local and stage recovery. Do not plan a release around running it in production.

Put the migration in its own PR, separate from the code that uses it. Its test DB patch belongs in that PR too. The migration can then land and deploy on its own, and the code PR can be reverted without touching the schema. If they must ship together, say why in the PR description.

## Safe in one release

- Add a table.
- Add a nullable column, or a `NOT NULL` column with a default.
- Add an index (as its own patch).
- Add a new stored procedure version (`doThing_3`) and leave the old one (`doThing_2`) in place.
- Widen a column type without losing data (for example `VARCHAR(64)` → `VARCHAR(255)`).

## Needs expand → contract across releases

These break release N-1 code if they land in one step. Each step ships in a later release train than the previous one.

| Change | Expand | Contract |
| --- | --- | --- |
| Drop a column or table | Ship code that stops reading and writing it. If it's `NOT NULL` without a default, add a default first | Drop it |
| Rename a column, or change its type | Add the new column. Code writes both and reads the new one, falling back to the old. Backfill | Ship code that uses only the new column, then drop the old one in a later release |
| Make a column `NOT NULL` | Code always writes it. Backfill | Add the constraint |
| Change a stored procedure's signature or behavior | Add a new versioned procedure and call it | Drop the old version (see `packages/db-migrations/databases/README.md`) |
| Add a unique constraint | Code stops writing duplicates. Dedupe | Add the constraint |

Being merged to `main` is not enough for a contract step. The commit that removed the last use of the column, table, or procedure must already be in the latest train tag. When the contract step's train deploys, that earlier train is what a rollback lands on:

```sh
git merge-base --is-ancestor <commit> "$(git tag --list 'v1.*.0' --sort=-v:refname | head -1)"
```

If it fails, the contract step is too early.

## Data compatibility

Rows outlive a rollback, and during a deploy old and new code run side by side. So:

- Release N must handle rows written by release N-1. For example, a new column is empty on rows that old code inserts.
- Release N-1 must handle rows written by release N, or rewritten by the patch. Don't write values it can't parse, such as a new enum value. Don't stop populating a column it still reads.

## When it can't be done

Some changes can't be made backward compatible, such as a security fix that must remove data, or a constraint that can't be staged. In that case, say so explicitly in the PR description and the commit's `Because:` section. Name what breaks if the code is rolled back and what the recovery plan is. Do not leave it for a reviewer to find.
