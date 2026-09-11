---
name: fxa-dependabot
description: Use to triage, fix, and drive Mozilla FxA (mozilla/fxa) dependency-bot PRs (Dependabot and mozilla-blender/BLEnder security bumps) to green CI — hands-off. Runs one idempotent pass: classify every open bot dependency PR, auto-approve functional gates, rebase yarn.lock conflicts, rerun flaky failures, and attempt real fixes for genuine breaks — including a first-pass code and test adaptation (e.g. an API migration) verified locally before pushing, with low-risk scopes auto-pushed and runtime/auth/payments changes proposed for review. After a fix, approves the functional-test gate and requires Playwright CI to pass before calling a PR merge-ready — non-blocking, revisiting the PR on a later pass rather than idling on the run. NEVER merges; never weakens tests. Reports a risk-labeled merge-ready list. Fired hourly by cron or invoked manually as /fxa-dependabot.
allowed-tools: Bash, Read, Edit, Write, Grep, Glob, PushNotification
user-invocable: true
---

# FxA Dependency-Bot Auto-Triage

One **pass** = inspect every open `mozilla/fxa` dependency-bot PR (author `app/dependabot` or `app/mozilla-blender`), take only safe/deterministic corrective actions, attempt known-safe fixes for real breaks, and report. **You never merge** — the human merges the low-risk list. Idempotent: safe to run every hour.

Toolkit: `scripts/deps.sh` (in this skill dir) provides the reliable primitives. CircleCI token comes from `~/.circleci/cli.yml` — never print it.

## Procedure (each pass)

1. **cd into the FxA repo** (the working tree). Confirm `git rev-parse --show-toplevel` succeeds. All git/yarn actions run there.
2. **Classify** — run `scripts/deps.sh report`. It lists every open bot dependency PR with `[STATE] risk=… title`, any failing checks, and a `merge:` line whenever GitHub says the branch is not cleanly mergeable (`DIRTY` conflict, `BEHIND` main, `BLOCKED` on review, `DRAFT`, or mergeability not yet computed). STATE ∈ `CONFLICT | FAIL | GATE_HOLD | RUNNING | GREEN` (checks **both** CircleCI StatusContexts and CheckRuns like CodeQL; cosmetic storybook "Deploy to GitHub Pages" cancels are ignored).
3. **Act per state** (below) for every PR — approve gates, rebase lockfile conflicts, rerun flakes.
4. **Fix real failures** — for every `FAIL` with a REAL verdict, run the **Fix playbook**. Not optional: each pass *attempts* a fix (once per head SHA), it does not merely flag.
5. **Confirm functional tests ran (non-blocking)** — a PR is *ready to merge* only once its functional (Playwright) checks have actually executed and passed. If functional is still on_hold, approve the gate (`scripts/deps.sh gate <pr>`) and mark the PR *in flight* — then **move on to the other PRs; never idle waiting on a CI run.** A later pass (next cron tick) re-checks it once CI reports back. Never call a PR merge-ready on unit/integration alone while functional sits unrun.
6. **Report + notify** — print the summary table. Fire a `PushNotification` **only** when a PR newly becomes *ready to merge* or newly *needs a human*. Don't ping on "still running".
7. **Reschedule** — the hourly cron handles this; nothing to do. (If invoked via `/loop`, re-arm per that skill.)

## State → action playbook

| STATE | Action |
|-------|--------|
| `GATE_HOLD` | `scripts/deps.sh gate <pr>` — approve the on_hold "Approve Functional Tests" job. (Every push resets this, so re-approve each pass.) |
| `CONFLICT` | `scripts/deps.sh rebase <pr>` — **only** auto-resolves a **yarn.lock-only** conflict (take main's lockfile → `yarn install` → verify `yarn install --immutable` → force-push-with-lease, bot authorship preserved). If any non-lockfile file conflicts it aborts and prints `NEEDS HUMAN` — surface that, do not hand-resolve source. |
| `FAIL` | `scripts/deps.sh faillog <pr>` first. If VERDICT=FLAKY → `scripts/deps.sh rerun <pr>` (bounded, max 2 per head SHA). If VERDICT=REAL → go to the **Fix playbook**. |
| `RUNNING` | Leave it. Next pass revisits. |
| `merge: BEHIND` | The branch is behind main and the base requires an update. Run `scripts/deps.sh rebase <pr>` — same lockfile-only path, so it still refuses to touch source. |
| `merge: BLOCKED` / `DRAFT` | A human gate, not a CI problem. Report it; take no action. |
| `GREEN` | All required checks passed, functional included (a PR with functional still on_hold classifies as `GATE_HOLD`, not `GREEN`). Add to the **Ready to merge** report with its risk label. Do nothing else. |

## Fix playbook (attempt real fixes — code and tests — for REAL failures)

Two tiers. Both **must verify locally before any push**, `--force-with-lease`, and preserve the bot's authorship (`dependabot[bot]` / `mozilla-blender[bot]`) on the bump commit (put your fix in a **separate** commit). One fix attempt per head SHA — if you can't get it locally green, revert and flag. **After any fix push, the new commit resets the functional-test gate to on_hold — immediately `scripts/deps.sh gate <pr>` so Playwright runs against your fix, then move on to the rest of the queue (don't block on the run). The PR stays in flight (not merge-ready) until those functional checks pass on a later pass.**

### Tier 1 — deterministic fixes (auto-apply → verify → push)

| Failure signature | Fix |
|-------------------|-----|
| `check:frozen` / YN0028 "lockfile would have been modified" | `yarn install` to regenerate, verify `yarn install --immutable`, push. |
| grpc `TS2322 … ChannelCredentials` / duplicate `@grpc/grpc-js` | `yarn dedupe @grpc/grpc-js`, `deps.sh verify <project> build`, push. |
| Type error from a duplicated transitive dep | `yarn dedupe <pkg>`, verify build, push. |
| CodeQL: `Loaded a configuration file for version X, but running Y` | Align `github/codeql-action/{init,autobuild,analyze}` to the same SHA. CI change → propose diff unless clearly in-scope. |

### Tier 2 — code & test adaptation (attempt a first pass, then gate on scope)

When a dep bump breaks the build or tests because an **API/behavior changed** (e.g. webpack-dev-server v4→v5 options, a renamed export, a changed default, an updated snapshot), attempt a first-pass fix:

1. **Read the failure** — `deps.sh faillog <pr>`; open the failing build/test output. Identify the exact broken call site or changed assertion. Ground the fix in the dependency's **release notes/changelog**, never guesswork.
2. **Checkout a scratch branch** off the PR branch (keeps the dependabot bump commit intact).
3. **Edit code and/or tests** to adapt to the new API:
   - Code: migrate call sites to the new API surface.
   - Tests: update expectations/snapshots **only** where the new dependency legitimately changed output. **Never weaken, skip, or delete a test to force green** — if a test now fails because behavior genuinely regressed, that's a REAL problem to flag, not to edit away.
4. **Verify locally, mandatory** — `deps.sh verify <project> <targets>` for the failing target(s) (`build`, `lint`, `test-unit`, and `test-integration` if that's what failed). Must be **green** to proceed.
5. **Gate on risk scope:**
   - 🟢 **LOW scope** (dev/build config, dev-only dep, non-runtime code, test-only changes for dev tooling) **and** locally green → commit as a separate `fix(<scope>): …` commit, push, and **notify** (the human still reviews it at merge time).
   - 🟡🔴 **MED/HIGH scope** (anything in `fxa-auth-server`/runtime, auth, session, crypto, payments, DB, or a published migration) → **do not push.** Save the verified diff and flag for the human with the patch + the local verification result.
6. If step 4 can't reach green, the signature needs judgment beyond a mechanical migration, or it touches a forbidden path (below) → **revert the scratch branch**, flag with what you tried.

**Hard limits for autonomous edits:** never edit DB migrations, CI secrets, or auth/crypto/payment logic to "make CI pass"; never weaken tests; never push a code change that isn't locally verified green. When unsure, propose don't push.

## Risk model — two independent axes (don't conflate them)

**Axis 1 — scope risk** (`risk=` in the report): production/runtime *blast radius if it ships*.
- 🟢 **LOW** — dev/build-only deps (esbuild, webpack, storybook, eslint, **stylelint/postcss/sass**, jest, types, nx, playwright, babel); SHA-pinned GitHub Actions (codeql, docker/login, actions/*); patch/minor; lockfile-only transitive.
- 🟡 **MED** — runtime deps, minor bumps in the request path, grouped bumps (opentelemetry).
- 🔴 **HIGH** — runtime deps in auth/session/crypto/payments (hapi, grpc, mysql, jose, jsonwebtoken, stripe, paypal, otplib, bcrypt), `fxa-auth-server` runtime, DB drivers. A **major** runtime bump escalates MED→HIGH. A major **dev-only** bump stays LOW (its blast radius is still dev-only).

**Axis 2 — merge-safety / migration** (`⚠ major X→Y — verify migration` in the report): is the change *complete and correct to merge*, independent of scope. A major-version bump can be an **incomplete migration** (peer-dependency skew, companion-config compat) that a green CI misses — **especially for tools run only at pre-commit/lint-staged, not in CI**, where CI never exercises them at all. `risk=LOW` + this flag means *"safe if it ships, but don't merge until the migration is verified."*

**BLEnder PRs** (`chore(deps): bump <pkg> to <ver>`, branch `blender/*`) are security-driven transitive bumps. Their title has no *from* version, so `report` reads the old version from the removed `resolution:` line in the PR's lockfile diff. Both axes then work as normal. If the diff gives no old version the report shows no ⚠ flag — check the diff yourself before you call that PR merge-safe.

Lesson learned (stylelint 16→17): `risk=LOW` (dev-only) was right on Axis 1 but hid an incomplete peer-dep migration on Axis 2. Never let a low scope-risk imply merge-safety.

`scripts/deps.sh report` prints both. Treat as advisory; when the ⚠ flag is set on a major bump, prefer the Tier-2 verify path over an auto-LOW.

## Guardrails (non-negotiable — this is an auth/payments repo)

- **Never** `merge`, enable auto-merge, or `git add/commit` source files.
- **Only** auto-resolve `yarn.lock` conflicts. Any source/code/CI/migration conflict → flag, never hand-resolve.
- Reruns are **bounded** (max 2 per head SHA, tracked in `$TMPDIR/fxa-dependabot-rr`) so a persistent break can't hide behind reruns or burn CI. When exhausted, flag.
- Always `git push --force-with-lease`; preserve the bot's authorship (rebase does this).
- Fixes touching CI/CD, migrations, or security-sensitive files are **proposed, not auto-applied**, unless clearly in-scope and locally verified.
- Read secrets into a variable, never print/echo them.
- The l10n `post-checkout` hook exits non-zero on every checkout — that's harmless noise, not a failure. Verify state directly.

## Report format

```
### FxA dependency-bot triage — N open PR(s)   (HH:MM)
✅ Ready to merge:
  #NNNNN  🟢 LOW   <title>
⏳ In flight:
  #NNNNN  [RUNNING] <title>   (fix pushed — functional running / gate approved / rerun 1/2 / rebased)
⚠️ Needs you:
  #NNNNN  [FAIL]   <title>   — <one-line root cause + proposed fix>
```

A PR belongs on the ✅ list only when its checks are green **and** `merge:` prints nothing. A green PR that cannot actually merge goes under ⚠️ with the reason.

Keep it short. The human's only job is clicking merge on the ✅ list.
