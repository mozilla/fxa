<!-- blender:start — auto-generated, do not hand-edit -->
# BLEnder — mozilla/fxa notes

This file supplements the existing `CLAUDE.md` at the repo root. It only
records what BLEnder needs that `CLAUDE.md` does not already cover (install,
Nx targets, DB migrations, and L10N are documented there — don't duplicate).

## Toolchain versions

- **Node:** `24.15.0` (pinned in `.nvmrc`; `engines.node` is `^24.15.0`). CI
  runs on `cimg/node:24.15.0`.
- **Package manager:** Yarn `4.9.2` (Berry), pinned via `packageManager` in
  `package.json`. Do **not** use npm. Yarn workspaces live under `packages/*`;
  `libs/*` and `apps/*` are Nx projects.
- **Build system:** Nx (`nx ^23`, `@nx/*` `22.7.5`). Most CI checks are
  `nx affected`/`nx run-many` invocations.

## Install (CI-accurate)

CI installs with an immutable lockfile and skips Playwright browser downloads:

```sh
PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1 yarn install --immutable --inline-builds
```

For a dependency bump the lockfile change is expected, so `--immutable` will
still succeed as long as `yarn.lock` is committed in sync with `package.json`.
If install fails on lockfile drift, run a plain `yarn install` to refresh
`yarn.lock`, then commit it.

## Exact CI check commands (CircleCI `test_pull_request`)

CI is **CircleCI** (`.circleci/config.yml`), not GitHub Actions. The GitHub
workflows in `.github/workflows/` are release/deploy/codeql only — they are not
the PR gate. The PR workflow runs these jobs (all against `nx affected --base=main --head=$CIRCLE_SHA1`):

- **Build:** `NODE_OPTIONS="--max-old-space-size=7168" npx nx run-many -t build --parallel=2 --all` (env `NODE_ENV=test`)
- **Lint:** `npx nx affected --base=main --head=$CIRCLE_SHA1 --parallel=1 -t lint`
- **Unit tests:** first `npx nx run-many -t build --projects=tag:scope:shared:lib --parallel=2`, then
  `npx nx affected --base=main --head=$CIRCLE_SHA1 --parallel=2 -t test-unit` (env `NODE_ENV=test`, `JEST_AFFECTED_BASE=main`)
- **Integration tests** (`-t test-integration`, need infra — MySQL/Redis/Firestore/cloud-tasks emulators), split by Nx scope tags:
  - Frontends: `--exclude '*,!tag:scope:frontend'`
  - Servers: `--exclude '*,!tag:scope:server'`
  - Servers — Auth: `--exclude '*,!tag:scope:server:auth'` (also starts fxa-customs-server; runs `nx gen-keys fxa-auth-server`)
  - Servers — Auth Scripts: `--exclude '*,!tag:scope:server:auth'` with `-t test-scripts`
  - Libraries: `--exclude '*,!tag:scope:shared:*'`
- **Functional/Playwright tests** are behind a manual approval step ("Approve
  Functional Tests (PR)") and are not part of the default automatic gate.

To reproduce a single project's checks locally: `nx lint <pkg>`,
`nx test-unit <pkg>`, `nx test-integration <pkg>`, `nx build <pkg>`.

## Pre-commit hook (Husky + lint-staged)

`.husky/pre-commit` runs `npx lint-staged`. The `lint-staged` config in
`package.json` **rewrites staged files** on commit:

- `packages/!(fxa-shared)/**/*.{ts,tsx}` and `libs/**/*.{ts,tsx}`:
  `prettier --config _dev/.prettierrc --write` then `eslint`
- `*.css` / `*.md`: `prettier --config _dev/.prettierrc --write`
- `*.scss`: `stylelint --config _dev/.stylelintrc`
- every file: `yarn check:frozen` (`ts-node _scripts/check-frozen.ts`)

Because Prettier auto-formats on commit, a fix can leave the working tree
dirty after committing. **Stage/unstage workaround:** if a commit modifies
files via the hook, re-stage the hook's changes and amend, or run
`prettier --config _dev/.prettierrc --write` on changed files before staging so
the tree matches CI. To bypass the hook only when unavoidable, commit with
`--no-verify` and then run the equivalent lint/format manually. Note the CI
executors set `HUSKY_SKIP_INSTALL=1`.

## Code generation (Glean metrics)

Some packages have generated Glean telemetry code under
`libs/**/glean/__generated__/` and `libs/payments/metrics/src/lib/glean/__generated__/`.
If a dependency bump (e.g. `@mozilla/glean`, `glean_parser`) breaks generated
files, **re-run the generator** rather than hand-editing the output:

- Generators run via Nx: `nx run libs-payments-metrics:glean-generate` and
  `:glean-generate-frontend` (each depends on a `glean-lint`/`glinter` step).
- Under the hood these call `yarn glean translate <registry>.yaml -f typescript_server|typescript -o <out-dir>`.
- CI provisions a Python venv for this: `python3 -m venv .venv && .venv/bin/pip install 'glean_parser~=19.0'`.
  Keep `glean_parser` at `~=19.0` to match CI.

## Other notes

- Never edit published DB migration files under
  `packages/db-migrations/databases/fxa/patches/`; add a new forward migration
  (`nx run db-migrations:migrate`).
- Respect the do-not-touch paths in root `CLAUDE.md` (secrets, generated
  artifacts, `node_modules`, `.yarn`, etc.).
<!-- blender:end -->
