---
name: fxa-review-quick
description: Fast single-pass FXA-specific commit review covering security, conventions, logic/bugs, tests, and migrations. No subagents — runs directly in the main context.
allowed-tools: Bash, Read, Grep, Glob
argument-hint: [commit-ref]
user-invocable: true
context: fork
---

# FXA Quick Review

Review the most recent commit (or the commit specified in `$ARGUMENTS`) in a single pass, using FXA-specific knowledge.

## Step 1: Get Commit Info

```bash
COMMIT_REF="${ARGUMENTS:-HEAD}"
git show "$COMMIT_REF" --format="%H%n%an%n%ae%n%s%n%b"
```

```bash
COMMIT_REF="${ARGUMENTS:-HEAD}"
git show --stat "$COMMIT_REF"
```

## Step 2: Read Changed Files

Use Read and Grep to examine the changed files and their surrounding context. Look at imports, callers, and related types to understand the full picture before judging.

## Step 3: Review

Evaluate the diff through these lenses, in order of priority:

**1. Security**
- Hardcoded secrets, injection (SQL/XSS/command), missing input validation, auth bypasses
- Sensitive data in logs or error messages (PII: emails, UIDs, tokens) — note: UIDs and emails in API response bodies are expected, focus on logs and error messages
- Missing rate limiting on new public endpoints
- Session token handling that bypasses established Hapi auth schemes
- New endpoints missing `Content-Type` validation
- User-controlled input passed to Redis keys without prefix/namespace

**2. FXA Conventions**
- Raw `Error` thrown in route handlers instead of `AppError` from `@fxa/accounts/errors`
- `console.log` instead of the `log` object (mozlog format)
- Cross-package imports using relative paths instead of `@fxa/<domain>/<package>` aliases
- Circular or bi-directional dependencies between packages/libs — breaks build ordering
- Auth-server code importing from `fxa-auth-server/**` (ESLint blocks this)
- New code added to legacy packages (`fxa-content-server`) — should be in `fxa-settings` or SubPlat 3.0
- No new GraphQL — `fxa-graphql-api` was removed, `admin-server` GraphQL is legacy. Exception: CMS-related GraphQL.
- Hardcoded values that should come from Convict config
- New `require()` in `.ts` files — use `import` instead. Existing CJS patterns in auth-server `.js` files are fine.
- Missing MPL-2.0 license header on new files
- Prefer `async/await` over `.then()` promise chains
- Flag new `Container.get()`/`Container.set()` usage — linting rules to disallow these are coming

**3. Logic & Bugs**
- Missing `await` on async calls — note: some fire-and-forget patterns (metrics, logging) are intentional, check context before flagging
- Null/undefined mishandling
- Race conditions, shared mutable state
- Swallowed errors (empty catch blocks, catch-and-rethrow without context)
- Off-by-one, wrong comparisons, missing break/return in switch
- Hapi route handlers that catch and re-throw instead of letting the error pipeline handle it

**4. Tests**

Apply the FXA testing rules in `.claude/rules/testing/base.md` and (for `*.test.tsx` changes) `.claude/rules/testing/react.md` — read them before reviewing test changes. Common quick-review triggers:

- New auth-server source files without co-located `*.spec.ts`; fxa-settings uses `*.test.tsx` convention
- `jest.clearAllMocks()` in `beforeEach` — redundant only when the package's `jest.config.*` sets `clearMocks: true` (currently `fxa-auth-server` and `fxa-profile-server`); do not flag in other packages without checking their config
- `mockClear`/`mockReset`/`jest.clearAllMocks`/`jest.resetAllMocks` called **inside** an `it()` body — band-aid for state leakage from prior tests or shared setup; fix the isolation instead
- `proxyquire` in new test code — should use `jest.mock()`
- New Mocha tests in `test/local/` or `test/remote/` — new tests must be Jest
- Over-mocked tests that only test mock wiring; mocking internal helpers in the same package instead of at system boundaries
- Tautological mocks: mock returns `X`, assertion checks for `X`, no real logic in between
- Untyped mocks where the real interface is available — typed mocks (`jest.Mocked<T>`) catch contract drift
- Soft matchers used to make tests pass: `expect.anything()`, `expect.any(Object)`, broad `expect.objectContaining({})` with one trivial key
- `forEach` / `for` loops driving multiple `expect` calls inside one `it()` body — use `it.each` so each case is independently reported
- Manually bumped per-test timeouts (`it('...', async () => {...}, 30_000)`, `jest.setTimeout(...)` for a single file) — usually masks a real timer or unmocked I/O
- Prefer `jest.useFakeTimers()` and `jest.setSystemTime()` over `setTimeout` or mocking `Date.now` directly
- Flag patterns likely to cause open handle warnings (unclosed connections, uncleared timers)
- Flag missing `act()` wrapping in React test state updates
- Committed `it.only`, `describe.only`, `fit`, `fdescribe` — silently skips the rest of the suite, never acceptable. `it.skip`, `xit`, `xdescribe`, `it.todo` — flag only when there is no comment explaining the skip; a justified skip (ideally with a Jira/issue reference) is acceptable
- For `*.test.tsx` in `fxa-settings`: also apply `.claude/rules/testing/react.md` (querying by role, `userEvent` over `fireEvent`, no asserting on refs/instances)
- Route/component tests with many fixtures-per-branch (>~3 tests differing only in input shape) — heavy branching at the route/component level signals the rule should be extracted and unit-tested directly; reserve route/component tests for wiring

**5. Database Migrations**
- Edits to existing published migration files — CRITICAL, never allowed
- New migration without corresponding rollback file
- Verify test DB patches are aligned with current test DB state (`/fxa-shared/test/db/models/**/*.sql`)
- `DELETE`/`UPDATE` without `WHERE` clause
- `ALTER TABLE` on large tables without online DDL consideration
- Index changes bundled with schema changes — should be separate migrations
- Data type changes that could truncate data

**6. Migration Direction**
- Mocha → Jest (no new Mocha tests)
- `proxyquire` → `jest.mock()`
- Callbacks → `async/await`
- `fxa-shared` → `libs/*` (migration in progress, check both locations for existing code before adding new)

**7. AI Slop Detection**
- Overly verbose or obvious comments that describe what the code does, not why
- Unnecessary abstractions or helper functions for one-time operations
- Excessive error handling for scenarios that cannot happen
- Redundant validation or fallbacks that duplicate framework guarantees
- Generic variable names or boilerplate patterns that suggest auto-generated code

## Step 4: Output

## Commit Summary

**Commit:** hash
**Author:** name
**Message:** commit message
**Files Changed:** count

## Changes Overview

Write a brief summary of what the commit does based on the diff. Do not repeat the commit message.

## Issues Found

Use a table with columns: #, Severity, Category, File, Line, Issue, Recommendation.

Severity definitions:
- CRITICAL — security vulnerabilities, data loss, auth bypasses, editing published migrations. Must fix.
- HIGH — bugs that will cause production issues, missing auth schemes on routes. Should fix.
- MEDIUM — convention violations, code quality, moderate risk. Consider fixing.
- LOW — style, minor improvements. Optional.

If no issues are found, skip the table and write: "No issues found."

## Verdict

Recommendation: APPROVE, REQUEST CHANGES, or NEEDS DISCUSSION.

Include blocking issue count (CRITICAL + HIGH) and total issue count.

If clean: "This commit is ready to merge."
If not: "Please address the CRITICAL and HIGH issues before merging."

## Guidelines

- Be pragmatic, not pedantic. Flag real problems, not style preferences.
- Consider the context — read surrounding code before flagging something.
- Do not flag missing tests for trivial changes (config values, enum additions, comment updates).
- One or two missing edge-case tests is MEDIUM at most, not HIGH.
- Always explain WHY something is a problem, not just what.
- If the commit is clean, say so clearly and approve. A short review is a good review.
