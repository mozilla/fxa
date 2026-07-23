<!-- blender:start — auto-generated, do not hand-edit -->
# BLEnder — Firefox Accounts (mozilla/fxa)

This file documents only what BLEnder needs **beyond** what `CLAUDE.md`
already covers (repo layout, `yarn install`, `nx build/lint/test-unit/
test-integration`, l10n, db-migrations). Read `CLAUDE.md` first.

## Toolchain (enforced by `preinstall`)

- **Node:** `24.15.0` (`.nvmrc`; `engines.node: ^24.15.0`).
- **Package manager:** Yarn Berry `4.9.2` (`packageManager` in `package.json`).
  Use `yarn`, never `npm`/`npx yarn`. `_scripts/check-package-manager.sh`
  and `_scripts/check-node-version.sh` run on `preinstall` and will fail the
  install if the wrong tool/version is used.
- **Python:** only needed for Glean code generation (see below); CI installs
  `glean_parser~=19.0` into a throwaway `.venv`. Not otherwise a Python project.

## Install (matches CI)

CI uses an immutable install and skips Playwright browser downloads:

```sh
PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1 yarn install --immutable --inline-builds
```

`--immutable` fails if `yarn.lock` is out of sync with `package.json`. After a
Dependabot bump the lockfile is already updated in the PR, so immutable install
verifies it. If you must regenerate the lockfile, drop `--immutable`.

## CI checks (CircleCI, not GitHub Actions)

The authoritative pipeline is `.circleci/config.yml` (GitHub Actions here only
handle storybooks, CodeQL, docker, l10n extract, releases). The required
checks BLEnder must make pass:

- **Lint:** `npx nx run-many -t lint --parallel=1`
  (PR runs use `nx affected` over changed projects.)
- **Unit tests:** `NODE_OPTIONS="--max-old-space-size=7168" npx nx run-many -t test-unit --parallel=2`
- **Integration tests:** `npx nx run-many -t test-integration`
  (needs infra: MySQL, Redis, Firestore — `yarn start infrastructure`, then
  `node ./packages/db-migrations/bin/patcher.mjs` for migrations).
- Per-project overrides live in each package's `project.json`; a package may
  ship `scripts/test-ci.sh` which CI runs instead of the default nx target.
- Scope a single project instead of the whole monorepo:
  `npx nx run <project>:lint` / `:test-unit` / `:test-integration`.

## Formatting (enforced, easy to trip)

Prettier config is **not** the repo root default — it lives at
`_dev/.prettierrc`. Run prettier with `--config _dev/.prettierrc`. ESLint uses
`.eslintrc.json`; SCSS uses `stylelint --config _dev/.stylelintrc`.

## Pre-commit hook + stage/unstage workaround

`.husky/pre-commit` runs `npx lint-staged`. `lint-staged` (config in
`package.json`) will, on commit:

- run `yarn check:frozen` against **all** staged files (fails if `yarn.lock`
  drifts from `package.json`);
- `prettier --config _dev/.prettierrc --write` + `eslint` on staged
  `packages/**` and `libs/**` `*.{ts,tsx}`;
- prettier on `*.css`/`*.md`, stylelint on `*.scss`.

Because the hook only sees **staged** files, if a fix needs a change the hook
would reformat: stage the file, let the hook rewrite it, then re-stage the
hook's changes (`git add -u`) before completing the commit. If a hook blocks an
otherwise-valid automated commit, commit with `--no-verify` only as a last
resort and ensure the same checks pass via the CI commands above.

## Code generation (re-run when a dep bump breaks generated output)

- **Glean metrics** (`**/glean/__generated__`): regenerate with the nx target
  `glean-generate`, e.g. `npx nx run payments-next:glean-generate`, which runs
  `yarn glean translate <registry>.yaml -f typescript_server -o <out>`.
  Requires the Python `glean_parser~=19.0` toolchain:
  ```sh
  python3 -m venv .venv && .venv/bin/pip install 'glean_parser~=19.0'
  ```
- **GraphQL / CMS types** (`libs/shared/cms/src/__generated__`): regenerate with
  `npx nx run cms:codegen` (`graphql-codegen --config libs/shared/cms/codegen.config.ts`).

If a dependency update to Glean, GraphQL, or codegen packages breaks the build
because generated files are stale, re-run the matching generator and commit the
regenerated output rather than hand-editing files under `__generated__`.
<!-- blender:end -->
