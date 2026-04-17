---
name: fxa-test-independence
description: Validates that Jest tests in a given file pass both as a full suite and individually in isolation, catching hidden order dependencies and shared mutable state.
allowed-tools: Bash, Read, Grep
argument-hint: <test-file-path>
user-invocable: true
context: fork
---

# FXA Test Independence

Validate that tests pass both when run together and when run individually. A test that passes in the full suite but fails in isolation has a hidden dependency on execution order or shared state — that is a bug in the test, not the code.

---

## Step 1: Identify the Target File

If `$ARGUMENTS` is provided, use it as the test file path.

Otherwise, check for recently changed test files:
```bash
git diff HEAD --name-only | grep -E '\.(spec|test)\.(ts|tsx)$'
git diff --cached --name-only | grep -E '\.(spec|test)\.(ts|tsx)$'
```

If multiple files are found, ask the engineer which to validate. If no file is found, ask for one explicitly.

---

## Step 2: Extract Test Names

Read the target file and extract every `it(...)` / `test(...)` name. Build the full list before running anything.

---

## Step 3: Present the Plan and Confirm

Show the engineer the list of tests to be validated and the commands that will be run. Do not proceed without confirmation.

```
File: packages/fxa-auth-server/lib/account.spec.ts
Tests found: 12

Will run:
  1. Full suite (all 12 tests together)
  2. Each test individually (12 isolated runs)
  Total runs: 13
```

---

## Step 4: Run the Full Suite

Show the exact command, then run it:
```bash
npx jest --testPathPattern="<test-file-path>" --no-coverage
```

Record: pass/fail and any output for failing tests.

---

## Step 5: Run Each Test in Isolation

For each test name extracted in Step 2, run it individually:
```bash
npx jest --testPathPattern="<test-file-path>" --testNamePattern="<exact test name>" --no-coverage
```

Record the result for each.

---

## Step 6: Report Results

Output a results table:

| # | Test name | Full suite | Isolated | Status |
|---|-----------|-----------|----------|--------|
| 1 | returns account when found | ✅ | ✅ | OK |
| 2 | throws NotFound when missing | ✅ | ❌ | **ORDER DEPENDENCY** |

**Status codes:**
- `OK` — passes in both contexts
- `ORDER DEPENDENCY` — passes in suite, fails in isolation; likely depends on state set by a prior test
- `BROKEN` — fails in both; implementation or mock issue
- `FALSE POSITIVE` — passes in isolation, fails in suite; likely pollutes shared state for other tests

For any non-OK result, include the failure output and a diagnosis:

**Likely causes by status:**
- `ORDER DEPENDENCY`: missing `beforeEach` reset, shared module-level variable mutated by a prior test, or singleton not re-initialised between tests
- `FALSE POSITIVE`: test mutates a shared mock or global without cleaning up in `afterEach`
- `BROKEN`: wrong mock return value, missing `await`, or the implementation under test has changed

Suggest a concrete fix for each failure. Do not fix automatically — present the diagnosis and let the engineer decide.
