---
name: subplat-jira-fetch
description: Fetches a Subscription Platform Jira ticket (PAY-N) and digests it into a compact, self-contained context bundle covering the ticket, comments, parent epic, and blocking/blocked-by links. Designed so subsequent skills can rely on this digest instead of re-fetching or holding the full conversation history.
user-invocable: true
---

# Subplat Jira Fetch

Pull a Subscription Platform Jira ticket (PAY-N) and produce a focused context digest. Do not create, edit, or suggest changes to any source files. This skill only reads from Jira; it does not modify the ticket.

## Step 1: Resolve the ticket key

The user typically supplies the key as an argument (e.g. `/subplat-jira-fetch PAY-3071`) or pastes a Jira URL.

- Accept either form: `PAY-N` directly, or extract the key from a `mozilla-hub.atlassian.net/browse/PAY-N` URL.
- If no key is provided, try to infer one from the current git branch name (e.g. branch `PAY-3071-some-slug` → `PAY-3071`).
- If still unresolved, ask the user via `AskUserQuestion`.

Reject keys that do not match `^PAY-\d+$`. Other projects (FXA, etc.) belong to different skills.

## Step 2: Verify MCP availability

Check that the Atlassian MCP is available — look for `mcp__atlassian__getJiraIssue` in the tool list. If missing, stop and tell the user that this skill requires the Atlassian MCP; do not attempt a manual scrape or web fetch.

## Step 3: Fetch

Make the following calls. Where data is independent, fire them in parallel.

1. **Main ticket** — `mcp__atlassian__getJiraIssue` on `PAY-N`. Capture: summary, description, status, issue type, priority, labels, fix versions, sprint, assignee, reporter, created/updated dates, **issue links** (blocks / is blocked by / relates to / clones / duplicates), and **parent / Epic Link**.
2. **Comments** — fetch all comments on the ticket. If the main `getJiraIssue` call already returns them, use those; otherwise call the dedicated comments endpoint.
3. **Parent epic** (if present) — fetch the parent epic's summary, description, status, and fix versions only. Do not pull the epic's full comment history or its other children — those are rarely pertinent to a single child ticket.
4. **Linked tickets** — for each `blocks` and `is blocked by` link, fetch the linked ticket's key, summary, status, type, and assignee. For `relates to` / `clones` / `duplicates`, fetch the same fields only if the total linked-ticket count is small (≤5); otherwise list keys only.

If any individual fetch fails, capture the error in the **Fetch Notes** section of the output rather than aborting — partial context is still useful.

## Step 4: Digest

The goal is a **compact, self-contained** context bundle. Apply these filters aggressively.

**Comments — keep:**
- Decisions, scope changes, requirement clarifications
- Technical constraints (DB schema, API contracts, infra, security, compliance)
- Reproduction notes, error logs, references to Sentry events
- Acceptance-criteria refinements
- Cross-references to other tickets, PRs, Figma, design docs, Slack threads

**Comments — discard:**
- Status updates ("moving to in progress", "PR open", "merged")
- Standup / scheduling / triage chatter
- Pleasantries, emoji-only reactions, thanks
- Quoted boilerplate from automation (branch-creation notices, GitHub bot comments)
- Anything explicitly superseded by a later comment

**Parent epic — keep only:**
- The 1–3 sentences that frame *why* this ticket exists within the epic
- Any epic-level constraints that apply to this ticket (feature flag, deadline, dependency on another team, compliance driver)

**Links — keep:**
- Blocking tickets: status + one-line summary of what they deliver. Flag any still open.
- Blocked tickets: one-line summary of what's waiting on this work — useful for downstream impact.

When in doubt, discard. A future task can re-invoke this skill if more is needed.

## Step 5: Output

Produce the digest in this exact shape so downstream skills can rely on it:

```
# Subplat Jira Context: PAY-N

**Title:** <summary>
**Status:** <status> · **Type:** <Task/Bug/Story/Spike> · **Priority:** <priority>
**Assignee:** <name or Unassigned> · **Reporter:** <name>
**Labels:** <comma-separated, omit if none>
**Fix Version:** <version, omit if none>
**URL:** https://mozilla-hub.atlassian.net/browse/PAY-N

## Description
<verbatim ticket description, with templated headers that were left empty stripped out>

## Parent Epic — <EPIC-KEY>: <epic summary>
<1–3 sentence framing of why this ticket exists within the epic. Note any epic-level constraints.>
*(omit section entirely if no parent epic)*

## Blocked By (open) — N tickets
- PAY-X (status) — what it delivers
- ...
*(omit section if none open; if there are closed blockers worth noting, list them under a "Blocked By (resolved)" subsection)*

## Blocks — N tickets
- PAY-Y (status) — what's waiting on this
- ...
*(omit section if none)*

## Other Linked Tickets
- PAY-Z (link type, status) — one-line context
*(omit section if empty after filtering)*

## Key Discussion Points
- <topic>: <distilled point — author, date>
- ...
*(2–8 bullets typically; if the ticket is quiet, write "No substantive discussion." and omit the bullet list)*

## Open Questions / Unresolved
- <anything raised in comments that was never answered>
*(omit if none)*

## Fetch Notes *(omit if clean)*
- <any errors, missing fields, or partial data from Step 3>
```

End the output with a short directive for downstream use:

> **Working context:** subsequent tasks in this session should treat the digest above as the canonical PAY-N context. Re-invoke `/subplat-jira-fetch PAY-N` only if the ticket may have changed since this fetch.

## Guidelines

- Do not create, edit, or suggest changes to any source files.
- The digest **is** the product. Do not append the raw ticket dump or the unfiltered comment thread — that defeats the purpose of compiling a focused context.
- Preserve verbatim wording for the description, acceptance criteria, and any quoted technical constraints. Paraphrase commentary.
- Mozilla employee names are fine to include (assignee, reporter, comment authors). Redact external email addresses or PII unrelated to the work as `<redacted>`.
- If the ticket links to Figma, Sentry, Grafana, or a Google Doc, keep the link but do not attempt to fetch it.
- When invoked inline by another skill, the return value is the full digest block, ready to be embedded as context for the calling skill.
