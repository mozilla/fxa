# CLAUDE.md

Security takes **absolute precedence**. This repository handles Mozilla authentication, payments, and user data.

## 1) Scope & Writes

- Operate strictly under `<FXA_REPO_ROOT>`; normalize paths; do not follow symlinks outside the repo.
- **Writes allowed** to working tree; always present a diff for review **before** any staging/commit.
- **Ask first** for any command (build/test/install, DB ops, git, services). Do **not** run `git add/commit/push/rebase` unless explicitly told to.

## 2) Non-Negotiables

- **Secrets:** never read/print/summarize/transmit secret files/values; use placeholders (`YOUR_API_KEY_HERE`).
- **External network:** only with explicit approval to a trusted/documented endpoint.
- **Pipelines & contracts:** flag breaking API/contract changes; do not alter CI/CD or git hooks without explicit, reviewed justification.
- **Published DB migrations:** **NEVER edit** existing published migration files. Always add a new forward migration and a separate rollback.

## 3) Do-not-touch paths (no read, no write)

_Note:_ This list must mirror `.gitignore`. If there is a discrepancy, `.gitignore` is the source of truth.

- **Secrets:** `.env*`, `**/*.env`, `secrets.json`, `secret*`, `**/*.gpg`, `.keys`, `*-key.json`, `packages/fxa-auth-server/config/key.json`, `packages/fxa-auth-server/config/vapid-keys.json`, `_dev/firebase/.config`
- **Dependencies:** `**/node_modules/`, `**/browser_modules/`, `**/.yarn/**`, `**/.pnp*/`, `**/vendor/`, `**/fxa-content-server-l10n/`
- **Generated / Artifacts / Runtime / Cache:**
  `**/(build|dist|.next|storybook-static)/**`, `**/.nx/cache/**`, `**/.eslintcache`, `**/*.map`,
  `**/schema.gql`, `**/public/locales/**`, `**/__generated__/**`,
  `**/config/gql/allowlist/**` (except `gql-playground.json`),
  `**/(coverage|.nyc_output|artifacts/tests|logs)/**`, `**/*.log*`,
  `**/.pm2/**`, `pm2/`, `process.yml`, `**/(temp|tmp)/**`,
  `**/tsconfig.tsbuildinfo`, `**/version.json`, `dump.rdb`
- **System/Editor:** `.DS_Store`, `Thumbs.db`, swap files, `.idea/`

> If a path matches both allowed and disallowed rules, **Disallowed wins**.

## 4) Repository Layout

- **Apps/Services (`packages/*`):**
  - `fxa-auth-server` — Core auth API (SRP/OAuth/sessions); talks to MySQL/Redis.
  - `fxa-settings` — React UI for sign-in/settings; uses `fxa-auth-client` and GraphQL.
  - `fxa-graphql-api` — NestJS BFF/gateway; aggregates server data for the UI.
  - `fxa-payments-server` — Subscriptions UI; integrates with Stripe/PayPal (webhooks handled server-side).
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
- **Prefer SubPlat 3.0 (sp3)** over `fxa-payments-server` for subscriptions flows. Treat `fxa-payments-server` as legacy; avoid new investments there.
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
- **Pkg scripts:** `cd packages/<name> && yarn <script>`
- **GraphQL allowlist:** `yarn gql:allowlist`
- **L10N:** `yarn l10n:prime`
- **DB migrations:** add new SQL under `packages/db-migrations/databases/fxa/patches/` → `nx run db-migrations:migrate`
  **Never edit existing published migration files.**

> When asked, show the exact minimal command block you intend to run; wait for approval.
