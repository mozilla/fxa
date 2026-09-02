# CLAUDE.md

Security takes **absolute precedence**. This repository handles Mozilla authentication, payments, and user data.

## 1) Scope & Writes

- Operate strictly under `<FXA_REPO_ROOT>`; normalize paths; do not follow symlinks outside the repo.
- **Writes allowed** to working tree; always present a diff for review **before** any staging/commit.
- Do not modify files adjacent to the requested change; mention issues found but do not fix them.
- **Ask first** for any command (build/test/install, DB ops, git, services). Do **not** run `git add/commit/push/rebase` unless explicitly told to.

## 2) Non-Negotiables

- **Secrets:** never read/print/summarize/transmit secret files/values; use placeholders (`YOUR_API_KEY_HERE`).
- **External network:** only with explicit approval to a trusted/documented endpoint.
- **Pipelines & contracts:** flag breaking API/contract changes; do not alter CI/CD or git hooks without explicit, reviewed justification.
- **Published DB migrations:** **NEVER edit** existing published migration files. Always add a new forward migration and a separate rollback.
- **Workspace recommendations:** the repo deliberately ships no `.vscode/extensions.json`. Do not re-add one. Useful extensions are listed in `.vscode/README.md` so contributors install at their own discretion.

## 3) Do-not-touch paths (no read, no write)

_Note:_ This list must mirror `.gitignore`. If there is a discrepancy, `.gitignore` is the source of truth.

- **Secrets:** `.env*`, `**/*.env`, `secrets.json`, `secret*`, `**/*.gpg`, `.keys`, `*-key.json`, `packages/fxa-auth-server/config/key.json`, `packages/fxa-auth-server/config/vapid-keys.json`, `_dev/firebase/.config`
- **Dependencies:** `**/node_modules/`, `**/browser_modules/`, `**/.yarn/**`, `**/.pnp*/`, `**/vendor/`, `**/fxa-content-server-l10n/`
- **Generated / Artifacts / Runtime / Cache:**
  `**/(build|dist|.next|storybook-static)/**`, `**/.nx/cache/**`, `**/.eslintcache`, `**/*.map`,
  `**/schema.gql`, `**/public/locales/**`, `**/__generated__/**`,
  `**/(coverage|.nyc_output|artifacts/tests|logs)/**`, `**/*.log*`,
  `**/.pm2/**`, `pm2/`, `process.yml`, `**/(temp|tmp)/**`,
  `**/tsconfig.tsbuildinfo`, `**/version.json`, `dump.rdb`
- **System/Editor:** `.DS_Store`, `Thumbs.db`, swap files, `.idea/`

> If a path matches both allowed and disallowed rules, **Disallowed wins**.

## 4) Repository Layout

- **Apps/Services (`packages/*`):**
  - `fxa-auth-server` — Core auth API (SRP/OAuth/sessions); talks to MySQL/Redis.
  - `fxa-settings` — React UI for sign-in/settings; uses `fxa-auth-client` (REST).
  - `fxa-profile-server` — User profile API.

- **Shared libraries (`libs/*`):**
  - `libs/shared/*` — errors, logging (mozlog), metrics/telemetry, experiments/feature flags, l10n, types.
  - `libs/accounts/*` — email sending and rendering, errors, (partial) 2FA, recovery phone, rate limiting.
  - `libs/payments/*` — Stripe/PayPal clients, billing models, webhook helpers.

- **Conventions:**
  - **Imports:** use `@fxa/<domain>/<package>` path aliases (e.g., `@fxa/shared/error`); avoid deep relative imports across package boundaries.
  - **Tests:** co-located `*.test.ts` / `*.spec.ts`.
  - **Config:** Convict in `config/*.json`; local overrides go in `config/secrets.json` (gitignored; do not read).

### Preferred targets & anti-duplication

- **Prefer `libs/*` over app-local code** for reusable logic. If a refactor touches multiple apps, extract to a library instead of duplicating.
- **Prefer `fxa-settings` over `fxa-content-server`** for UI work (content-server is legacy). Do not add new features to content-server unless explicitly directed.
- **Avoid partial refactors:** when moving logic, complete the path (call sites, tests, docs). If full migration is not feasible, provide a thin adapter and TODO with owner and date.
- **No duplication:** before adding code, search the monorepo for existing helpers/types; reuse or consolidate.

## 5) How to Run

_Note:_ This is a general overview and may vary per library/package. For authoritative commands and targets, check each package's **`project.json`** (Nx) and **`package.json`**. Test commands in particular tend to vary.

- **Install:** `yarn install`
- **Infra only (for tests):** `yarn start infrastructure`
- **All services:** `yarn start`
- **Core subset:** `yarn start mza`
- **Ports:** `yarn ports`
- **Nx:** `nx build <pkg>`, `nx lint <pkg>`, `nx test-unit <pkg>`, `nx test-integration <pkg>`, `nx start <pkg>`
- **Pkg scripts:** `cd packages/<name> && yarn <script>` — Run these through Nx (`nx build <pkg>`, `nx build-storybook <pkg>`); invoking them with plain `yarn` will **not** run their dependency steps.
- **L10N:** `yarn l10n:prime`
- **DB migrations:** add a forward patch and its rollback under `packages/db-migrations/databases/<db>/patches/` and bump that database's `target-patch.json` — see `packages/db-migrations/databases/README.md`. `yarn start` applies them; to run it directly, `node ./packages/db-migrations/bin/patcher.mjs`.
  **Never edit existing published migration files.**

> When asked, show the exact minimal command block you intend to run; wait for approval.

## 6) Git Commit Messages

Follow the commit message format defined in [CONTRIBUTING.md — Git Commit Guidelines](https://github.com/mozilla/fxa/blob/main/CONTRIBUTING.md#git-commit-guidelines) and the `~/.gitmessage` template configured globally.

Key points: `type(scope): subject` format; imperative present tense subject; `Because:` / `This commit:` body sections; `Fixes #N` footer for issues.

**Never add a `Co-Authored-By: Claude ...` trailer** to any commit message.

Length budget — these are read at `git blame` speed, so keep them scannable:

- Subject ≤72 chars.
- `Because:` — up to 3 bullets. Motivation only.
- `This commit:` — up to 5 bullets, one line each. What changed; the why belongs in `Because:`.
- If the change genuinely won't fit in 5 bullets, say the commit is too big rather than adding more bullets.

See section 9 for phrasing.

## 7) Available Skills

Every skill's name and description loads automatically — this section only covers when to reach for one unprompted. Suggest proactively when the task matches.

- **Before merging:** `/fxa-review` for auth, payments, crypto, migrations, or multi-package changes; `/fxa-review-quick` otherwise. `/fxa-security-review` on top when the change touches auth, sessions, tokens, or payments.
- **Filing a ticket:** `/fxa-jira-feature-description` or `/fxa-jira-bug-description`, even when the ask arrives mid-task.
- **Opening a PR:** `/fxa-pr-open`. It handles the template, the alignment pass against Jira, and the draft-only rule.

## 8) Testing Guidelines

> Detailed test rules auto-load from `.claude/rules/testing/` by path: `base.md` for all tests, `react.md` layers on for `*.test.tsx`, `functional-pages.md` for anything under `packages/functional-tests`.

**Shift-left is a golden goal.** Prefer testing business logic at the lowest layer that exercises it. FXA has three layers, cheapest to costliest: unit (`nx test-unit`), integration (`nx test-integration`), functional/E2E (Playwright in `packages/functional-tests`). Route handlers and React components should be thin shells; their tests cover wiring (auth, request/response shape, error propagation, rendering), not business branches. When a route or component has more than ~3 tests differing only in input shape, that's the signal to extract the rule into a pure function or hook and unit-test it directly. Shifting left is not required for every change — but always strive for it, and flag the opportunities to improve.

Skills: `/fxa-test-draft` (draft tests for changes), `/fxa-test-repair` (audit a test file), `/fxa-test-independence` (verify isolation).

## 9) Conciseness & Writing Style

**Be concise.** Applies to commit messages, PR bodies, Jira tickets, and code comments.

- **Cut items before compressing sentences.** Shorten by dropping a point or folding two together; tightening a point worth keeping is fine, but don't squeeze every point into a semicolon-spliced fragment. What survives should read like a person wrote it.
- **One claim per bullet.** In commit messages, PR bodies and tickets, state what changed. Give the reason only when it isn't inferable and lives nowhere else.
- **Comments state what is true, not what changed.** They're read cold, with no diff — so "used to", "no longer" and "we decided in review" belong in the commit's `Because:` section instead. Detailed rules auto-load from `.claude/rules/code-comments.md` when you touch JavaScript/TypeScript.
- **Meta-commentary must save the reader work.** Out-of-scope notes and rejected alternatives earn their place when a reviewer would otherwise ask; narrating the diff's boundaries doesn't.
- **Ticket refs in code only where the history is the answer.** Put the why in the comment. An `FXA-12345` pointer fits when the code reads as complex or non-standard and the explanation outgrows a comment — a workaround, an external constraint. Not in test names. Leave existing refs alone.
- **Paths earn their place.** Name a file when it saves the reader a search. Skip it when the diff or a reference section already points there.

## BLEnder

See [.blender/agents.md](.blender/agents.md) for CI commands and dependency management context.
