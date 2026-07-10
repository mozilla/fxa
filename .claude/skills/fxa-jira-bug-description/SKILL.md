---
name: fxa-jira-bug-description
description: Drafts a Jira bug report for an FXA issue. Gathers repro steps, expected vs actual behaviour, and affected surface, outputs a structured report, and optionally files the ticket via the Atlassian MCP. Returns the new FXA-N key when filed.
user-invocable: true
---

# FXA Jira Bug Report

Draft a Jira bug report for an FXA issue, and optionally file the ticket via the Atlassian MCP. Do not create, edit, or suggest changes to any source files.

## Step 1: Gather Context

If a Sentry link, error log, or stack trace was provided, read it first and infer as much as possible before asking anything.

Required information:
- **What:** One-sentence description of the bug
- **Steps to reproduce:** Numbered steps from a known starting state
- **Expected behaviour:** What should happen
- **Actual behaviour:** What actually happens
- **Affected surface:** Which flow, page, or API endpoint; which users or account states are affected

Also useful — ask only for what is missing:
- Error message, Sentry event, or stack trace
- Browser, OS, or environment (if frontend)
- Account state at time of bug (e.g. 2FA enabled, passwordless, linked account)
- Severity — data loss, security impact, broken flow, visual/cosmetic

If all required information is clear, proceed directly to Step 2.

## Step 2: Research

Search only the packages likely involved. Find:
- The code path most likely responsible (route handler, component, service method)
- Any recent changes to that path (`git log` on the relevant files)
- Whether a similar bug has been fixed before (look for related test cases or comments)

Incorporate findings directly into Root Cause and Key Reference Files. Surface genuine unknowns as Open Questions.

## Step 3: Output

**Summary:** `[area] <concise bug description>` — e.g. `[auth] Passkey registration fails silently when device has no authenticator`

**Background:**
What the bug is, where it occurs, and who is affected. 2–3 sentences.

**Steps to Reproduce:**
Numbered steps from a known starting state. Include account state and environment where relevant.

**Expected Behaviour:**
What should happen.

**Actual Behaviour:**
What actually happens. Include error message, code, or Sentry event if available.

**Affected Surface:**
Which users, flows, account states, browsers, or environments are affected. Note if intermittent.

**Severity:** *(Critical / High / Medium / Low)*
- Critical — data loss, security vulnerability, auth bypass
- High — broken core flow affecting multiple users
- Medium — degraded experience, workaround exists
- Low — cosmetic, edge case, minor inconvenience

**Root Cause:** *(if known or suspected — omit if unknown)*
Where in the code the bug originates. Reference specific file and function if identified.

**Acceptance Criteria:**
- Bug is no longer reproducible following the steps above
- Regression test added covering the broken path
- *(add any additional observable outcomes)*

**Key Reference Files:**
Specific files relevant to investigation or fix. One line each.

**Out of Scope:** *(omit if not needed)*

**Open Questions:** *(omit if none)*

## Step 4: Optionally file the ticket via Atlassian MCP

After producing the draft (Step 3), check whether the Atlassian MCP is available in the current session (look for `mcp__atlassian__createJiraIssue` in the available tools). If not available, stop — the user files the ticket manually using the drafted description.

If available, ask the user via `AskUserQuestion` whether to file now:

- "File now via Atlassian MCP (Recommended)"
- "Skip — I'll file manually"

If the user picks "Skip", stop and output the draft. If "File now", call `mcp__atlassian__createJiraIssue` with:

- `cloudId`: `mozilla-hub.atlassian.net` (the Atlassian MCP accepts the site hostname directly; fall back to `getAccessibleAtlassianResources` if the call ever rejects this form).
- `projectKey`: `FXA`
- `issueTypeName`: `Bug`
- `summary`: the `[area] <concise bug description>` line from Step 3
- `description`: the rest of the drafted body from Step 3 (Background, Steps to Reproduce, Expected/Actual, Severity, etc.)
- `contentFormat`: `markdown`

Surface the returned `FXA-N` key and the issue URL. That key is this skill's return value when invoked inline by another skill (e.g. `/fxa-pr-open` uses it to populate the `Closes:` line).

## Guidelines

- Do not create, edit, or suggest changes to any source files. Filing a Jira ticket via the MCP (Step 4) is not a source file change.
- Steps to Reproduce must be precise enough for another engineer to reproduce independently
- Do not speculate on root cause unless there is clear evidence — use Open Questions instead
- Severity should reflect user impact, not code complexity
- Always include a regression test in Acceptance Criteria
- If the bug has security implications (auth bypass, data exposure, token leakage), flag severity as Critical and note it explicitly in Background
