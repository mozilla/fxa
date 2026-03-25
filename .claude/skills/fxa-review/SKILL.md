---
name: fxa-review
description: Thorough FXA-specific commit review using parallel specialist agents. Covers security, TypeScript, logic/bugs, test quality, and architecture. Agents explore call sites, git history, and monorepo conventions.
allowed-tools: Bash, Read, Grep, Glob, Agent
argument-hint: [commit-ref]
user-invocable: true
context: fork
---

# FXA Thorough Review

Review the most recent commit (or the commit specified in `$ARGUMENTS`) using specialized parallel agents.

## Step 1: Get Commit Information

```bash
COMMIT_REF="${ARGUMENTS:-HEAD}"
git show "$COMMIT_REF" --format="%H%n%an%n%ae%n%s%n%b"
```

```bash
COMMIT_REF="${ARGUMENTS:-HEAD}"
git show --stat "$COMMIT_REF"
```

Save the full diff output and commit metadata. You will pass these to each agent in Step 2.

## Step 2: Spawn Parallel Review Agents

Launch ALL FIVE agents **in parallel** using the Agent tool in a **single message**. Each agent receives the full diff and commit metadata in its prompt.

Tell each agent to use Read/Grep/Glob to examine surrounding code in changed files for context. Provide the repo working directory path.

Each agent MUST output findings as a JSON array ONLY (no markdown, no extra text). Each item has: severity (CRITICAL/HIGH/MEDIUM/LOW), category, subcategory, file, line, issue, recommendation. If no issues, return: []

---

**Agent 1 — FXA Security Review**
- subagent_type: general-purpose
- model: opus
- description: FXA security review

Tell this agent it is a senior security engineer. It should:

- Trace user input through changed code paths to check for injection (SQL, Redis, command, XSS)
- Verify auth schemes on new route handlers — FXA auth-server uses 13 custom Hapi auth schemes, new routes must declare one
- Check for PII exposure in logs and error messages (emails, UIDs, session tokens) — note: UIDs and emails in API response bodies are expected, focus on logs and error messages
- Verify parameterized queries — no string concatenation in SQL or Redis commands
- Check rate limiting on new public endpoints (customs server integration)
- Verify session token rotation on privilege escalation (login, 2FA, password change)
- Check CORS configuration — no `*` on credentialed endpoints
- Verify OTP/TOTP handling: constant-time comparison, immediate invalidation, rate limiting
- Check that secrets are accessed via Convict config, not hardcoded or read from env directly

Output JSON array with fields: severity, category ("Security"), subcategory, file, line, issue, recommendation.

---

**Agent 2 — FXA TypeScript Review**
- subagent_type: general-purpose
- model: opus
- description: FXA TypeScript review

Tell this agent it is a senior TypeScript engineer familiar with FXA's mixed JS/TS codebase. It should:

- Flag `any` usage — suggest `unknown`, interfaces, or generics instead. Note: `any` is permitted in auth-server during migration but should not be introduced in new code unnecessarily
- Check for non-null assertions (`!` postfix) — `@typescript-eslint/no-non-null-assertion: error`
- Verify `as any` is justified — needed for CJS/ESM interop or type system limitations, not hiding real type issues
- Check mock type safety — mocks should use `satisfies` against real interfaces where possible
- Flag missing return types on exported functions
- Look for simplification: optional chaining, nullish coalescing, early returns, destructuring
- Check import style: `@fxa/<domain>/<package>` for cross-package, relative within package
- Flag new `require()` in `.ts` files — use `import` instead. Existing CJS patterns in auth-server `.js` files are fine.
- Prefer `async/await` over `.then()` promise chains
- For `.js` files: review general code patterns, no TypeScript-specific feedback

Output JSON array with fields: severity, category ("TypeScript"), subcategory, file, line, issue, recommendation, code_before, code_after.

---

**Agent 3 — FXA Logic and Bugs Review**
- subagent_type: general-purpose
- model: opus
- description: FXA logic and bugs review

Tell this agent it is a senior software engineer who knows FXA's auth-server patterns deeply. It should:

- Follow data flow through changed functions — read callers and callees to verify assumptions
- Check async correctness: missing `await`, unhandled promise rejections, race conditions — note: some fire-and-forget patterns (metrics, logging) are intentional, check context
- Verify error propagation: Hapi route handlers should throw, not catch-and-rethrow
- Check `AppError` usage — HTTP errors must use `AppError` from `@fxa/accounts/errors`
- Verify logging uses the `log` object (mozlog format), not `console.log`
- Check edge cases: empty arrays, zero values, null UIDs, expired tokens
- Flag new `Container.get()`/`Container.set()` usage — linting rules to disallow these are coming
- Check Convict config access: verify `config.get('key')` keys exist in `config/index.ts`
- Flag catch blocks that swallow errors or re-throw without context

Output JSON array with fields: severity, category ("Logic/Bugs"), subcategory, file, line, issue, recommendation.

---

**Agent 4 — FXA Test Quality Review**
- subagent_type: general-purpose
- model: opus
- description: FXA test quality review

Tell this agent it is a QA engineer who understands FXA's testing patterns and common flakiness causes. It should:

- Check new auth-server source files have co-located `*.spec.ts`; fxa-settings uses `*.test.tsx` convention
- Flag new Mocha tests — all new tests must be Jest
- Flag `proxyquire` in new code — should use `jest.mock()`
- Check mock quality: tests that only assert output matches what the mock returns (tautological)
- Verify interaction assertions: `.toHaveBeenCalledWith()` on mocked dependencies, not just checking return values
- Flag `jest.clearAllMocks()` in `beforeEach` — unnecessary, `clearMocks: true` is global
- Check for shared mutable state between tests, missing `await`, `setTimeout` in tests
- Prefer `jest.useFakeTimers()` and `jest.setSystemTime()` over `setTimeout` or mocking `Date.now` directly
- Flag patterns likely to cause open handle warnings (unclosed connections, uncleared timers)
- Flag missing `act()` wrapping in React test state updates
- Flag over-mocking: mocking internal functions in the same package instead of at system boundaries

Output JSON array with fields: severity, category ("Test Quality"), subcategory, file, line, issue, recommendation.

---

**Agent 5 — FXA Architecture Review**
- subagent_type: general-purpose
- model: opus
- description: FXA architecture review

Tell this agent it is a senior architect who knows FXA's monorepo structure and migration directions. It should:

- Check if new shared/reusable code belongs in `libs/*` or `fxa-shared` instead of app-local — search the monorepo for existing helpers before flagging. Note: `fxa-shared` is migrating to `libs/`, check both locations.
- Detect duplication: search `libs/**`, `fxa-shared/**`, and `packages/**` for functions/types with the same name or purpose
- Flag new code in legacy packages:
  - `fxa-content-server` — should be in `fxa-settings`
  - `fxa-payments-server` — should target SubPlat 3.0 (`libs/payments/*`, `apps/payments/*`)
  - No new GraphQL — `fxa-graphql-api` was removed, `admin-server` GraphQL is legacy. Exception: CMS-related GraphQL.
- Verify database migrations:
  - Never edit existing published migration files
  - New migration has corresponding rollback
  - Sequential patch numbering has no gaps
  - Index changes separate from schema changes
  - Test DB patches aligned with current test DB state (`/fxa-shared/test/db/models/**/*.sql`)
- Check cross-package boundary violations: relative imports across package boundaries instead of `@fxa/*` aliases
- Check for circular or bi-directional dependencies between packages/libs — these break build ordering and are hard to untangle later
- Flag colliding exports: new exports that duplicate existing ones elsewhere in the monorepo
- For fxa-settings changes: check React and Tailwind best practices (component composition, accessibility, responsive design)
- Also apply the code smell checks from the `/check-smells` skill (`.claude/skills/check-smells/SKILL.md`) — read that file and incorporate its design, implementation, test, and dependency smell checks into this review

**Migration direction compliance:**
- Mocha → Jest (no new Mocha tests)
- `proxyquire` → `jest.mock()`
- Callbacks → `async/await`
- `fxa-shared` → `libs/*` (in progress)

Output JSON array with fields: severity, category ("Architecture"), subcategory, file, line, issue, recommendation.

---

## Step 3: Aggregate and Report

After all agents return, parse each JSON output. Combine all findings into one list sorted by severity: CRITICAL then HIGH then MEDIUM then LOW. Number sequentially. If an agent returns malformed output, extract what you can and note the issue.

Deduplicate issues flagged by multiple agents (keep the more detailed one, note which reviewers flagged it).

Present the unified report:

**Commit Review Summary** — commit hash, author, message, files changed count.

**Changes Overview** — write your own summary of what the commit does from the diff (do not repeat the commit message).

**AI Slop Check** — flag overly verbose comments, unnecessary abstractions, excessive error handling for impossible cases, redundant validation, or other signs of auto-generated code.

**Issues Found** — markdown table with columns: #, Severity, Reviewer, Category, File, Line, Issue, Recommendation.

Severity definitions:
- CRITICAL — security vulnerabilities, data loss, editing published migrations, auth bypasses. Must fix.
- HIGH — bugs, missing auth schemes, unsafe type assertions hiding real issues. Should fix.
- MEDIUM — convention violations, code quality, missing tests. Consider fixing.
- LOW — style, minor improvements. Optional.

**Detailed Findings by Reviewer** — one subsection per reviewer (Security, TypeScript, Logic/Bugs, Test Quality, Architecture). Include code before/after examples for HIGH+ issues. If a reviewer found nothing, say "No issues found."

**Verdict** — APPROVE, REQUEST CHANGES, or NEEDS DISCUSSION. Include blocking issue count (CRITICAL + HIGH), total issue count, and which reviewers reported issues. If all agents returned empty arrays: "All specialist reviewers agree — this commit is ready to merge."

## Guidelines

- Always launch all 5 agents in parallel in a single message
- Be thorough but fair — not every commit needs to be perfect
- Focus on actual problems, not style preferences
- Deduplicate cross-agent findings
- Write the Changes Overview yourself from the diff
- Include code examples for HIGH+ issues in the detailed findings
