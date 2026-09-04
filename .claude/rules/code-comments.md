---
paths:
  - "**/*.ts"
  - "**/*.tsx"
  - "**/*.js"
  - "**/*.jsx"
---

# Code comments

A commit message says what changed. A comment says what is true.

## Adding comments

- Default to none. Add a comment only for a fact the code cannot show: a constraint, an external cause, a non-local consequence.
- 1-3 lines. If it needs more, it belongs in a docblock or design doc.
- Never write: section labels (`// Setup`), restatements (`// Get the user` above `getUser()`), change narration (`// Added to fix X`), or history (`used to`, `previously`, `no longer`, `we decided`). History goes in the commit's `Because:` section.
- No JSDoc on private helpers unless the signature cannot carry the contract.

## Before you finish

List every comment line you added. For each, name the fact the code could not carry. Delete any you cannot justify.

## Editing comments you did not write

- False after your edit: Verify that the change was intended, then fix only the clause that became untrue.
- Restates the code: you may delete.
- Cites anything outside the repo (version, vendor, tool or loader behaviour, incident, spec, ticket): keep it whole. Do not shorten.
- Reason has expired but it still carries a fact: relocate the fact, do not delete both.
- Otherwise: leave it and mention it in your summary.
