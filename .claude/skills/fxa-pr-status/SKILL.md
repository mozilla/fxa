---
name: fxa-pr-status
description: Lists open FXA PRs matching a search term with a rich status table — file/line counts, draft state, review activity, and approval status. Defaults to all open PRs needing review.
allowed-tools: Bash
argument-hint: [search term, e.g. "passkey"]
user-invocable: true
context: fork
---

# FXA PR Status

Show a status table for open FXA PRs matching `$ARGUMENTS` (or all open PRs if no argument given).

## Step 1: Fetch matching PRs

```bash
SEARCH="${ARGUMENTS:-}"
gh pr list \
  --repo mozilla/fxa \
  --state open \
  --search "$SEARCH" \
  --json number,title,author,createdAt,isDraft,reviewDecision \
  --limit 30
```

## Step 2: Fetch per-PR details in parallel

For each PR number returned in Step 1, run these two commands in parallel (batch all PRs together — one `gh pr view` call per PR, all firing at the same time):

```bash
# For each PR number N:
gh pr view N --repo mozilla/fxa --json additions,deletions,changedFiles
gh pr view N --repo mozilla/fxa --json isDraft,reviewDecision,reviews
```

## Step 3: Compute age

For each PR, compute a human-readable age from `createdAt` relative to today's date:
- Under 24 h → "Xh"
- 1–6 days → "Xd"
- 7+ days → "Xw" (round to nearest week)

## Step 4: Summarize reviews

From the `reviews` array for each PR:
- **Approved:** yes if any review has `state == "APPROVED"` from a member of the  mozilla/fxa-devs team (exclude mozilla/fxa-l10n, bots and Copilot reviewers); otherwise no.
- **Reviews column:** list unique human reviewer logins (exclude `copilot-pull-request-reviewer` and bots) whose state is `APPROVED`, `CHANGES_REQUESTED`, or `COMMENTED`, joined by comma. If only Copilot has reviewed, write "Copilot only". If no reviews at all, write "—".

## Step 5: Output the table

Render a markdown table with these columns:

| # | Title | Author | Age | Files | +/- | Draft | Reviews | Approved |
|---|-------|--------|-----|-------|-----|-------|---------|----------|

- **#**: linked to the PR (`[#N](url)`)
- **Title**: full PR title, linked to the PR URL
- **Author**: `login` — append " (you)" if login matches the current git user
- **Age**: computed in Step 3
- **Files**: `changedFiles`
- **+/-**: `+additions / -deletions`
- **Draft**: "Yes" (bold) if `isDraft`, otherwise "No"
- **Reviews**: computed in Step 4
- **Approved**: "Yes" if any `APPROVED` review from a non-bot human; otherwise "No"

After the table, call out any actionable items in a short bulleted list:
- PRs still in draft that look ready (have reviews or approvals)
- PRs with `CHANGES_REQUESTED` that haven't been updated since the review
- PRs with no human reviews after 3+ days
