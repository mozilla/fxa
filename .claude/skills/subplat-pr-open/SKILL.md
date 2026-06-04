---
name: subplat-pr-open
description: Drafts a SubPlat pull request title and body following the repo PR template and team conventions, then opens the PR as a draft after explicit confirmation. Use when a SubPlat feature branch is ready and the user wants to open a PR. Do not invoke for edits to an existing PR.
argument-hint: Optional Jira key (e.g. PAY-3701)
---

# Open a SubPlat PR

Order of operations: gather state → ask the user up front → align ticket/commits → draft title and body → confirm and open as draft. The intake step exists so the user can fix scope, amend commits, run a pre-merge review, or capture screenshots *before* a draft is produced — drafting late means the draft reflects validated, approved scope.

## Hard rules

- **PRs always open as draft.** `gh pr create --draft`. Marking ready is a separate action (`gh pr ready`) that needs its own approval — never bundle it with create.
- **Confirm before every state-changing command.** `git push`, `gh pr create`, and any later `gh pr edit/comment/ready/merge/review` each need their own approval — prior approval does not roll forward.
- **No co-author trailer.** Do not add `Co-Authored-By: Claude ...` anywhere. Team policy.
- **PR description uses `Closes: PAY-N` (colon, no hash).** This differs from commit footers, which use `Closes #PAY-N` (hash, no colon).
- **Preserve template section order, headings, and placeholder text verbatim.**
- **Never pre-check the Checklist boxes.** Leave every `- [ ]` unchecked in the draft. Those are manual attestations (GPG signing, tests run locally, docs, RTL verification, AI code review) that only the user can truthfully make. Do not tick them on the user's behalf even if you believe the condition holds.
- **Never force-push** to a shared branch. If the branch was already pushed, default to a normal push.
- **Do not touch existing PRs.** This skill is for opening a new PR only. If `gh pr view` shows a PR already exists for the branch, stop and ask the user how to proceed.
- **Don't invoke review skills from within this one** (`/fxa-review-quick`, `/fxa-review`, `/fxa-security-review`) — they can produce findings requiring new commits, invalidating the discovery this skill just did (commits, diff scope, alignment). The user runs them separately and re-enters this skill after. **Exceptions:** `/fxa-pr-screenshots` and the Jira authoring skills (`/fxa-jira-feature-description`, `/fxa-jira-bug-description`) produce external artifacts (image attachments, Jira tickets) with no code changes, so they may be invoked inline when the user selects them in Step 2 (Jira) or Step 3c (screenshots).

## Step 1 — Pre-flight

Run these in parallel:
- `git fetch origin main --quiet` — refresh the base ref so the diff is against current `main` (tolerate failure if offline)
- `git rev-parse --abbrev-ref HEAD` — current branch name
- `git log --format=%B main..HEAD` — full commit messages on this branch
- `git diff main...HEAD --name-only` — changed files
- `git diff main...HEAD --stat` — files/lines summary
- `git status -sb` — confirm clean tree and check ahead/behind vs upstream
- `gh pr view --json url,state 2>/dev/null` — confirm no PR exists yet

If `gh pr view` returns a PR, stop (see hard rules) and ask whether the user wants to edit that PR (different workflow — confirm each `gh pr edit` separately) or target a different base.

If the branch is `main`, the working tree is dirty, or the branch has no commits ahead of `main` (empty `git log` output), stop and flag it.

## Step 2 — Gather Jira context

Extract the Jira key from the branch name when it matches `PAY-\d+`. If `$ARGUMENTS` contains an explicit key, prefer that. If the user is logged into the Atlassian MCP, fetch the ticket summary, description, and acceptance criteria — they are needed for the alignment check in Step 3 and the "Because" bullets in Step 4. If the Atlassian MCP is not available, ask the user to share the ticket summary and AC so 3b can still run a real alignment pass; if they decline, proceed and flag in 3b that alignment was partial.

### No ticket for this work?

If no Jira key can be derived from the branch, arguments, or the user, call `AskUserQuestion` with these options:

- **"Create a feature/task ticket now via `/fxa-jira-feature-description`" (Recommended for product/code changes)** — invoke the skill inline (see hard rules carve-out). When it returns, parse the new `PAY-N` key from its output and use it for the `Closes:` line.
- **"Create a bug ticket now via `/fxa-jira-bug-description`"** — same flow for bug fixes.
- **"Provide an existing ticket key"** — user types `PAY-N`; continue with that.
- **"Waive — chore-only, no ticket needed"** — set the `Closes:` line to `N/A` and capture the user's reason for `## Other information (Optional)` in Step 4.

The authoring skills file via Atlassian MCP when it's available and return the new key. If the MCP isn't available, they output the draft only and stop — in that case, exit this skill so the user can file the ticket manually, then re-enter with the key.

## Step 3 — Intake & alignment (before drafting)

This step is the structured conversation with the user before any drafting happens. It exists to catch scope, framing, and process issues while they are still cheap to fix.

The intake is split into a short briefing (3a + 3b) followed by a structured interview (3c). **Do not collapse the interview into one open-ended prose prompt** — use `AskUserQuestion` so each decision is answered discretely.

### 3a. Summarize what you see

Output a short paragraph: branch name, commit count, packages touched, against ticket `PAY-N: <ticket summary>`.

### 3b. Run an alignment pass

Compare three sources of truth:

1. **Jira ticket** — summary, description, acceptance criteria (from Step 2).
2. **Commits** — full commit messages including `Because:` / `This commit:` bodies (from Step 1).
3. **Diff scope** — changed files grouped by package (from Step 1).

Check for:
- **Scope match.** Do the commits and diff cover what the ticket asks for? Is anything in the diff outside the ticket's scope?
- **Motivation match.** Does the ticket's framing (bug vs feature, user impact) match what the commits do?
- **Acceptance criteria coverage.** For each AC on the ticket, is at least one commit clearly addressing it? Call out any uncovered AC.
- **Commit-type consistency.** Do `type(scope):` prefixes agree across commits and roughly match the likely PR title?
- **Out-of-scope creep.** Any commits touching unrelated files (formatting churn, drive-by refactors)?

Surface each concern as a bullet with a concrete recommended action — e.g. "Ticket AC #3 mentions L10n strings but no `.ftl` files changed — confirm out of scope?" or "Two commits are `chore(deps):` unrelated bumps — split into a separate PR?".

### 3c. Present the briefing, then interview with `AskUserQuestion`

First, send a brief message (just the 3a summary + 3b alignment bullets) so the user has the context. Keep it tight — no checkbox lists, no trailing open question.

Then call `AskUserQuestion` with 2–4 structured questions. The questions verify *prerequisites the user has met* (mirroring the PR template's Checklist), not actions the skill will run. Skip any question whose answer is already determined by the diff. The first option of each question should be the recommendation, marked `(Recommended)` in the label.

Suggested question set:

1. **Pre-merge review attestation** — has one been run already?
   - "Yes — completed `/<recommended>` (Recommended)" — name the right skill in the label based on the diff:
     - `/fxa-security-review` when OAuth, session, password, OTP/TOTP, recovery, or `/account/*` routes are touched
     - `/fxa-review` when auth, payments, crypto, sessions, migrations, or multi-package changes are involved
     - `/fxa-review-quick` otherwise
   - "Not yet — pause; exit so I can run it" — exit the skill; the user re-enters after.
   - "N/A — trivial change, no review needed" — capture the user's reason via the question's notes field and append it to `## Other information (Optional)` in Step 4.

2. **Screenshots attestation** — only ask when the diff touches `packages/fxa-settings/**/*.tsx`, `packages/fxa-react/**/*.tsx`, or any `.ftl` with user-visible copy.
   - "Yes — already captured (Recommended)"
   - "Capture now via `/fxa-pr-screenshots`" — invoke inline (see hard rules carve-out). Use the returned image references in `## Screenshots` of Step 4.
   - "N/A — no user-visible change"

3. **Framing for the body** — `multiSelect: true`. Pull concrete option labels from the discovery (related PR links surfaced in commits, feature-flag rollout notes when the diff touches config, follow-up tickets mentioned in commit bodies, deploy-ordering caveats for migrations). Don't use generic placeholders — every option should be a real candidate for *this* branch. Always include "Nothing extra" as one option. The user's selections feed into `## Other information` or `## Because` framing in Step 4.

**If the user picks "Not yet — pause" on any attestation, stop here.** They will exit, complete the prerequisite, and re-enter the skill. Do not draft a body that will be invalidated.

Otherwise, move on to Step 4 with the attestation answers and framing selections in hand.

## Step 4 — Draft the title and body

Read `.github/PULL_REQUEST_TEMPLATE.md` — that is the canonical body skeleton. Preserve its section order, headings, and placeholder text verbatim, and fill it in per the drafting guidance below. Substitute `PAY-NNNNN` on the `Closes:` line with the actual ticket key.

Title guidance:
- Follow the commit-message convention: `type(scope): subject`, imperative present tense, ≤72 chars.
- If the branch has a single commit, reuse its subject as the PR title.
- Otherwise, summarize the cumulative change — do not just use the latest commit subject.

Body drafting guidance:
- **"Because"** bullets describe motivation/user impact in complete sentences — derive from the Jira ticket and the intake answers, not from the file list. Reference the user need, bug, or requirement, not the code change.
- **"This pull request"** bullets describe what the code now does in complete sentences — be specific (e.g. "Adds `signinFlow.ts` to handle passkey discovery before falling back to password sign-in"), not vague ("Refactors the sign-in page"). Refer to files with backticks (e.g. `` `packages/fxa-settings/src/pages/Index/index.tsx` ``).
- **"How to review"** — fill in only when the diff is non-trivial (>~5 files or any risky path). Otherwise leave the three sub-bullets empty.
- **"Screenshots"** — if the user captured some in Step 3, reference them here (markdown image syntax once attached) or leave the placeholder line for the user to drop attachments into. Leave untouched if no UI changed.
- **"Other information"** — feature-flag rollout notes, follow-up tickets, deploy ordering caveats, related PRs from intake. Leave placeholder if none.

## Step 5 — Confirm and open as draft

Present **both the proposed title and the full draft body** to the user. Ask:
1. Any edits to the title or body before opening?
2. Ready to open the PR? (From Step 1's `git status -sb`: if the branch isn't pushed or is ahead of upstream, the push will run first.)

Only after the user explicitly approves:
1. Push the branch if not yet pushed, or if local is ahead of upstream (use upstream tracking on first push).
2. Open the PR as a draft against `main` with the approved title and body.
3. Print the PR URL.

After the PR is opened as draft, **stop**. Do not amend the body, add comments, mark ready, or push more commits without a new explicit ask. Each subsequent `gh pr edit/comment/ready/merge/review` is a separate action that needs its own approval.
