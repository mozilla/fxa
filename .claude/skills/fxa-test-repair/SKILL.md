---
name: fxa-test-repair
description: Reviews a test file for violations of FXA testing guidelines, then suggests concrete repairs. Does not auto-apply changes — output is a repair plan for engineer review.
allowed-tools: Bash, Read, Grep, Glob
argument-hint: <test-file-path>
user-invocable: true
context: fork
---

# FXA Test Repair

Review a test file for violations of the FXA testing guidelines and produce a prioritized repair plan with before/after code suggestions. This skill does not modify files — all repairs are presented for engineer review.

Read the shared testing guidelines before proceeding:
`.claude/skills/fxa-testing-shared/GUIDELINES.md`

---

## Step 1: Identify the Target File

If `$ARGUMENTS` is provided, use it as the test file path.

Otherwise check for recently changed test files:
```bash
git diff HEAD --name-only | grep -E '\.(spec|test)\.(ts|tsx)$'
git diff --cached --name-only | grep -E '\.(spec|test)\.(ts|tsx)$'
```

If multiple files are found, ask the engineer which to repair. If none, ask explicitly.

---

## Step 2: Read the File

Read the full test file. Note:
- Total number of tests
- Testing framework (Jest vs Mocha — flag Mocha, no new tests should be added)
- How mocks are structured (module-level, `beforeEach`, inline)
- Whether shared state variables exist at module or `describe` scope

---

## Step 3: Audit for Violations

Work through every rule in the shared guidelines. For each violation found, record: location, the rule it breaks, and a before/after repair snippet. If a rule has no violations, note it as clean — do not skip rules.

---

## Step 4: Present the Repair Plan

Output a prioritized findings table:

| # | Severity | Rule violated | Location | Description |
|---|----------|---------------|----------|-------------|
| 1 | High | Independent & order-agnostic | `account.spec.ts:14` | `account` mutated across tests without `beforeEach` reset |
| 2 | Medium | Assert explicitly | `account.spec.ts:42` | `toBeTruthy()` used where exact value is known |
| 3 | Low | Independent & order-agnostic | `account.spec.ts:8` | `jest.clearAllMocks()` in `beforeEach` — global config handles this |

**Severity:**
- **High** — likely causes false positives, order-dependent failures, or masks real regressions (shared mutable state, missing `await`, over-mocking)
- **Medium** — reduces test value or maintainability (vague assertions, non-deterministic values, implementation-detail testing)
- **Low** — noise or convention violations that don't affect correctness (redundant calls, vague names, minor patterns)

Follow the table with a detailed write-up for each High finding, including a before/after code snippet showing the repair.

For Medium and Low findings, a one-line description and the repair snippet is sufficient.

---

## Step 5: Suggest Scope

After presenting findings, suggest a reasonable repair scope based on the volume of issues:

- **Few issues (1–5):** Suggest fixing all in one pass.
- **Moderate (6–15):** Suggest prioritizing High findings first; Medium/Low in a follow-up.
- **Many (16+):** Suggest tackling by rule category across the file rather than line-by-line, and note that `/fxa-test-independence` should be run after repairs to validate nothing regressed.

Remind the engineer: repairs are suggestions. Review each one — especially mock restructuring, which can change test behavior, not just style.
