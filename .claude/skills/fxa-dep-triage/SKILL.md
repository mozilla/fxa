---
name: fxa-dep-triage
description: Assess and triage Mozilla FxA (mozilla/fxa) dependency security in one pass. Part 1 — walk every open Dependabot alert, read BLEnder's recorded verdict (from the investigated/<repo>/<n> tag in mozilla/blender), and recommend a disposition (dismiss / bump / finish the in-flight PR / needs human); advisory only, never dismisses or closes an alert. Part 2 — classify every open bot dependency PR (Dependabot and mozilla-blender/BLEnder security bumps), approve the functional-test gate (the one safe CI-side action), and report conflicts, real breaks, and risky migrations for a human. NEVER merges, edits code, or pushes; never touches your working tree. Reports alert dispositions plus a risk-labeled merge-ready PR list. Runnable standalone as /fxa-dep-triage, hourly by cron, or invoked from fxa-triage.
allowed-tools: Bash, Read, Grep, Glob, PushNotification
user-invocable: true
---

# FxA Dependency Triage

One **pass** covers FxA's whole dependency-security surface:

1. **Alerts** — walk every open Dependabot alert on `mozilla/fxa`, read BLEnder's recorded verdict, and give each a disposition. Advisory: this skill never dismisses or closes an alert.
2. **Bump PRs** — classify every open bot dependency PR (Dependabot + BLEnder security bumps), approve the functional gate (the one safe CI-side action), and report anything needing a human (conflicts, real breaks, risky migrations). **You never merge, edit code, or push** — the human acts on the report.

Idempotent: safe to run every hour. Runnable standalone (`/fxa-dep-triage`), hourly by cron, or invoked inline from the `fxa-triage` skill (which shares this pass's context).

Forked from Vijay's `fxa-dependabot` skill: Part 1 adds the alert-assessment layer that reads BLEnder's verdicts, and Part 2 keeps his classification and gate-approval engine but is advisory on anything that would mutate a branch (conflicts and code fixes are reported, not applied).

Toolkit: `scripts/deps.sh` (in this skill dir) provides the reliable primitives for Part 2. CircleCI token comes from `~/.circleci/cli.yml` — never print it.

## Part 1 — Alerts: assess & dispose

Assess every open Dependabot alert on `mozilla/fxa`. BLEnder already auto-dismisses high-confidence not-affected alerts and opens bump PRs; what's left needs human judgment — alerts above the severity ceiling, below the confidence floor, of unknown severity, or affected with a bump in flight. **This skill never dismisses, closes, or bumps an alert itself — it reads BLEnder's verdict and recommends; the human acts.**

### 1a. Collect open alerts

```bash
gh api --paginate "repos/mozilla/fxa/dependabot/alerts?state=open&per_page=100" \
  --jq '.[] | {number, severity: .security_vulnerability.severity, package: .security_vulnerability.package.name, ecosystem: .security_vulnerability.package.ecosystem, ghsa: .security_advisory.ghsa_id, summary: .security_advisory.summary}'
```

Order critical → high → medium → low when presenting (the API doesn't sort by severity).

### 1b. Read BLEnder's verdict (per alert)

BLEnder records its verdict on a git tag in `mozilla/blender`, keyed by alert number:

```bash
n=<alert-number>
ref=$(gh api "repos/mozilla/blender/git/ref/tags/investigated/mozilla/fxa/$n" 2>/dev/null)
if [ -z "$ref" ]; then
  echo "not yet investigated — BLEnder's 30-min sweep will pick it up"
elif [ "$(echo "$ref" | jq -r .object.type)" = "tag" ]; then
  gh api "repos/mozilla/blender/git/tags/$(echo "$ref" | jq -r .object.sha)" --jq .message  # verdict JSON
else
  echo "investigated, lightweight tag — verdict predates the tag artifact; read the investigate run log"
fi
```

The verdict JSON has `affected`, `confidence`, `reason`, `recommended_action`. If a `blender/security-bump-<package>` or Dependabot PR is open for the same package, BLEnder may also have left a `**BLEnder investigated:**` comment on it (marker `<!-- blender-investigated -->`) explaining a not-affected finding.

### 1c. Disposition

| Verdict / state | Why still open | Recommend |
|---|---|---|
| `affected: true`, bump PR open | Fix in flight | Drive the PR to green in Part 2; human merges. |
| `affected: true`, no PR | No known patched version or unsupported ecosystem | Manual bump or advisory; check `reason`. |
| `affected: false`, severity above ceiling | BLEnder won't auto-dismiss critical/above-ceiling even when not affected | Confirm not-affected → human dismisses as "not used"; else bump. |
| `affected: false`, confidence below floor | Not-affected finding wasn't high-confidence | Verify `reason`; human dismisses if agreed, else bump. |
| `affected: false`, unknown severity | Needs manual review | Assess severity, then dismiss or bump. |
| No tag | Not investigated yet | Wait for next sweep, or dispose manually if urgent. |

Link each alert as `https://github.com/mozilla/fxa/security/dependabot/<n>`. Alerts whose disposition is "drive the in-flight PR" hand off to Part 2 — the same PR appears there. Everything else lands in the report's **Alerts needing a decision** block for the human.

## Part 2 — Bump PRs: drive to green

Inspect every open `mozilla/fxa` dependency-bot PR (author `app/dependabot` or `app/mozilla-blender`), approve the functional-test gate, and report conflicts and real breaks for a human. **You never merge, edit code, or push** — the human acts on the report.

### Procedure (each pass)

1. **Classify** — run `scripts/deps.sh report`. It lists every open bot dependency PR with `[STATE] risk=… title`, any failing checks, and a `merge:` line when GitHub says the branch isn't cleanly mergeable (`DIRTY` conflict, `BEHIND` main, `BLOCKED`, `DRAFT`, or mergeability not yet computed). STATE ∈ `CONFLICT | FAIL | GATE_HOLD | RUNNING | GREEN` (checks both CircleCI StatusContexts and CheckRuns like CodeQL; a non-success terminal result — CANCELLED, TIMED_OUT, ERROR — counts as failing, and cosmetic storybook checks never block).
2. **Act per state** (below): approve the functional gate (the only CI-side action); report everything else.
3. **Confirm functional tests ran (non-blocking)** — a PR is *ready to merge* only once its functional (Playwright) checks have actually run and passed. If functional is still on_hold, `scripts/deps.sh gate <pr>` and mark the PR *in flight* — then move on; a later pass re-checks once CI reports back. Never call a PR merge-ready on unit/integration alone while functional sits unrun.
4. **Report + notify** — print the summary. Fire a `PushNotification` **only** when a PR newly becomes *ready to merge* or newly *needs a human*. Don't ping on "still running".
5. **Reschedule** — the hourly cron handles this. (If invoked via `/loop`, re-arm per that skill.)

### State → action playbook

| STATE | Action |
|-------|--------|
| `GATE_HOLD` | `scripts/deps.sh gate <pr>` — approve the on_hold "Approve Functional Tests" job. (Every push resets it, so re-approve each pass.) |
| `FAIL` | `scripts/deps.sh faillog <pr>`, then **report** the cause and a suggested fix on the Needs-you list (see Diagnosing real failures). Its flaky/real HINT is advisory — the human decides whether to rerun. Never edit or push. |
| `CONFLICT` / `merge: BEHIND` | **Report** "needs rebase" — never resolve or rebase. On Dependabot PRs a `@dependabot rebase` comment (or the human) handles it; on BLEnder PRs a human rebases. |
| `RUNNING` | Leave it. Next pass revisits. |
| `merge: BLOCKED` / `DRAFT` | A human gate, not a CI problem. Report it; take no action. |
| `GREEN` | All required checks passed, functional included (a PR with functional still on_hold classifies as `GATE_HOLD`, not `GREEN`). Add to the **Ready to merge** report with its risk label. |

### Diagnosing real failures (report, don't fix)

For a `FAIL` with a REAL verdict, read `scripts/deps.sh faillog <pr>`, identify the cause, and put it on the **Needs you** list with a concrete suggested fix for the human. Ground the suggestion in the dependency's release notes/changelog, not guesswork. **Never edit code, tests, or lockfiles, and never push** — this skill is advisory on anything that mutates a branch.

Common signatures and what to recommend:

| Failure signature | Recommend to the human |
|-------------------|------------------------|
| `check:frozen` / YN0028 "lockfile would have been modified" | Regenerate the lockfile (`yarn install`), verify `yarn install --immutable`. |
| grpc `TS2322 … ChannelCredentials` / duplicate `@grpc/grpc-js` | `yarn dedupe @grpc/grpc-js`. |
| Type error from a duplicated transitive dep | `yarn dedupe <pkg>`. |
| CodeQL: `Loaded a configuration file for version X, but running Y` | Align `github/codeql-action/{init,autobuild,analyze}` to one SHA. |
| Build/test break from a changed API (webpack-dev-server v4→v5, a renamed export, a changed default, an updated snapshot) | A code/test migration is needed — point at the exact call site/assertion and the relevant changelog. Flag prominently when the scope is MED/HIGH (auth/session/crypto/payments, `fxa-auth-server`, DB, or a published migration). |

Never recommend weakening, skipping, or deleting a test to force green — a test failing because behavior genuinely regressed is a real problem to flag, not to edit away.

### Risk model — two independent axes (don't conflate them)

**Axis 1 — scope risk** (`risk=` in the report): production/runtime *blast radius if it ships*.
- 🟢 **LOW** — dev/build-only deps (esbuild, webpack, storybook, eslint, **stylelint/postcss/sass**, jest, types, nx, playwright, babel); SHA-pinned GitHub Actions (codeql, docker/login, actions/*); patch/minor; lockfile-only transitive.
- 🟡 **MED** — runtime deps, minor bumps in the request path, grouped bumps (opentelemetry).
- 🔴 **HIGH** — runtime deps in auth/session/crypto/payments (hapi, grpc, mysql, jose, jsonwebtoken, stripe, paypal, otplib, bcrypt), `fxa-auth-server` runtime, DB drivers. A **major** runtime bump escalates MED→HIGH. A major **dev-only** bump stays LOW (its blast radius is still dev-only).

**Axis 2 — merge-safety / migration** (`⚠ major X→Y — verify migration` in the report): is the change *complete and correct to merge*, independent of scope. A major-version bump can be an **incomplete migration** (peer-dependency skew, companion-config compat) that a green CI misses — **especially for tools run only at pre-commit/lint-staged, not in CI**, where CI never exercises them at all. `risk=LOW` + this flag means *"safe if it ships, but don't merge until the migration is verified."*

**BLEnder PRs** (`chore(deps): bump <pkg> to <ver>`, branch `blender/*`) are security-driven transitive bumps. Their title has no *from* version, so `report` reads the old version from the removed `resolution:` line in the PR's lockfile diff. Both axes then work as normal. If the diff gives no old version the report shows no ⚠ flag — check the diff yourself before you call that PR merge-safe.

Lesson learned (stylelint 16→17): `risk=LOW` (dev-only) was right on Axis 1 but hid an incomplete peer-dep migration on Axis 2. Never let a low scope-risk imply merge-safety.

`scripts/deps.sh report` prints both. Treat as advisory; when the ⚠ flag is set on a major bump, call it out in the report as merge-unsafe-until-verified, even when the scope risk is LOW.

### Guardrails (non-negotiable — this is an auth/payments repo)

- **Never** merge or enable auto-merge.
- **Never** edit code, tests, or lockfiles, and never `git commit`/`push` — Part 2 reports fixes and conflicts for a human; it never applies them or touches your working tree.
- **Never** dismiss, close, or reopen a Dependabot alert — Part 1 only recommends.
- The only action this skill takes is CircleCI-side: approve the functional-test gate.
- Read secrets into a variable, never print/echo them.

## Report format

```
### FxA dependency triage — A alert(s), P open PR(s)   (HH:MM)

🔎 Alerts needing a decision:
  #<n>  🔴 critical  <pkg>  — <verdict reason> → recommend <dismiss | bump | see PR #NNNNN>
  (alerts covered by an in-flight bump PR appear under the PR lists, not here)

✅ Ready to merge:
  #NNNNN  🟢 LOW   <title>
⏳ In flight:
  #NNNNN  [RUNNING] <title>   (gate approved — functional running)
⚠️ Needs you:
  #NNNNN  [FAIL]   <title>   — <one-line root cause + proposed fix>
```

A PR belongs on the ✅ list only when its checks are green **and** `merge:` prints nothing. A green PR that cannot actually merge goes under ⚠️ with the reason. Keep it short — the human's only jobs are deciding the flagged alerts and clicking merge on the ✅ list.
