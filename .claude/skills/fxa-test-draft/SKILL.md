---
name: fxa-test-draft
description: Drafts Jest tests for changed code. Defaults to staged/unstaged changes or the most recent commit. Output is a starting point for review, not final.
allowed-tools: Bash, Read, Grep, Glob
argument-hint: [file-path | commit-ref | git-range]
user-invocable: true
context: fork
---

# FXA Draft Tests

Draft Jest tests for changed code following FXA conventions and the project testing guidelines. Output is a **draft** — review before committing.

Read the shared testing guidelines before proceeding:
`.claude/skills/fxa-testing-shared/GUIDELINES.md`

---

## Step 1: Identify Scope

If `$ARGUMENTS` is provided, use it as the target (file path, commit ref, or git range). Otherwise determine scope automatically:

1. **Unstaged + staged changes first:**
```bash
git diff HEAD       # unstaged
git diff --cached   # staged
```
If either produces output, that is your scope.

2. **Fallback — most recent commit** (if working tree is clean):
```bash
git diff HEAD~1..HEAD
```

Read the full diff before proceeding.

---

## Step 2: Identify Source Files to Test

From the diff, extract files that:
- Contain new or modified logic (functions, branches, classes, route handlers)
- Are **not** already test files (`*.spec.ts`, `*.test.ts`, `*.test.tsx`)
- Are **not** generated, config, or migration files

For each source file, check whether a co-located test file already exists and what it already covers.

---

## Step 3: Explore Existing Test Patterns

For each source file, read nearby test files and shared mocks to understand the conventions in that package:

```bash
# Find test files in the same directory
# Find shared mocks (e.g. test/mocks.js in auth-server)
```

Determine:
- Framework in use — must be Jest. Flag if Mocha is present (legacy; no new Mocha tests).
- Co-location convention: `*.spec.ts` (auth-server `lib/`) or `*.test.tsx` (fxa-settings)
- Available shared mocks: `mockDB`, `mockLog`, `mockMailer`, `mockPush`, etc. from `test/mocks.js`
- How `jest.mock()` is structured in this package

---

## Step 4: Analyze What Needs Tests

For each changed function or module, identify:
- **Happy paths** — the expected successful flows
- **Error cases** — thrown errors, rejected promises, validation failures
- **Edge cases** — nulls, empty arrays, boundary values, missing auth
- **Branches** — every `if`/`else`, `switch`, ternary, optional chaining path

**Call out** any code that is difficult to test due to:
- Missing dependency injection (direct `new Foo()` instantiation inside logic)
- Functions doing too many things (test surface too large)
- Side effects embedded in otherwise pure logic
- Missing error boundaries

Do not skip coverage for hard-to-test code — flag it explicitly and suggest a refactor where applicable.

---

## Step 5: Present the Test Plan

Before writing any code, output a test plan table for the engineer to review:

| File | Function / Handler | Type | Proposed test name |
|------|--------------------|------|--------------------|
| `lib/account.ts` | `getAccount` | happy path | returns account when found |
| `lib/account.ts` | `getAccount` | error | throws NotFound when account does not exist |
| `lib/account.ts` | `getAccount` | edge case | returns null when db returns empty result |

Include a row for every case identified in Step 4. Mark any cases flagged as difficult to test with a `⚠️` and a brief inline note.

**Pause here.** Ask the engineer if the coverage looks right, if any cases should be added or removed, or if the scope should be adjusted. Do not proceed to drafting until confirmed.

---

## Step 6: Draft the Tests

Write Jest tests for each identified case following the shared guidelines.

Place tests in the co-located test file (`*.spec.ts` or `*.test.tsx`). If the file doesn't exist, create it with the MPL-2.0 license header at the top.

**Leave things better than you found them.** When adding tests to an existing file, write new tests to the guidelines standard — don't copy existing patterns that violate them. If existing tests have clear issues, note them in the output and suggest the engineer run `/fxa-test-repair`. Don't rewrite existing tests wholesale unless that's explicitly in scope.

After drafting, consider running `/fxa-test-independence` to verify the new tests pass both as a suite and in isolation.

---

## Step 7: Output

For each source file, produce:

1. **Test file path** — where the tests should live
2. **Coverage summary** — happy paths, error cases, and branches covered
3. **Drafted tests** — complete, runnable Jest test blocks
4. **Callouts** — any code that is difficult to test, with a brief explanation and suggested refactor if applicable

If a test file already exists, show only the new blocks to add, not the full file.

Remind the user: these are drafts. Review mock return values, error types, and edge case assumptions before committing.
