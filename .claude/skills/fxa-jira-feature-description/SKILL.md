---
name: fxa-jira-feature-description
description: Drafts a concise Jira description for an FXA task. Gathers context via targeted interview, researches relevant patterns in the repo, then outputs a clean description ready for an engineer to hand to Claude for implementation.
user-invocable: true
---

# FXA Jira Description

Draft a Jira description for an FXA task. Output the description only — do not create, edit, or suggest changes to any source files.

## Step 1: Gather Context

If a planning doc, epic description, or tech spec was provided, read it first and infer what, why, packages, and constraints before asking anything.

Required information:
- **What:** What is being built or changed, in one sentence
- **Why:** Motivation — user need, requirement, bug, or tech debt
- **Packages:** Which specific package(s) will be modified (e.g. `fxa-auth-server`, `libs/accounts/passkey`)
- **Constraints:** Feature flag, breaking change, migration, L10n — or none

If all four are clear from provided context, proceed directly to Step 2. Otherwise ask for only what is missing in a single message. Also invite related PRs, tickets, existing approach notes, design mockups, or flow diagrams that would add useful context.

## Step 2: Research

Search only the packages identified in Step 1. Find the most relevant existing patterns: similar feature, nearby route, equivalent component. Expand to the broader repo only if nothing relevant is found there.

Identify:
- Key files an implementer will need to touch
- The closest existing reference implementation to follow
- Whether tests, metrics, or security events apply (see Step 3)

Incorporate findings directly into the draft — do not list them separately or ask for confirmation. Surface genuine blockers as Open Questions.

## Step 3: Output

**Design:** *(Figma link if applicable. Note that all copy, strings, and visual specs should be taken from the latest Figma file — do not reproduce design details here as they may change before implementation. Omit if no design involved.)*

**Background:**
Why this is needed and what it enables. 2–4 sentences.

**Acceptance Criteria:**
Observable, testable outcomes. Each item verifiable without reading the code. Include criteria for tests, metrics emission, and security events where applicable to this task.

**Implementation Steps:**
Numbered steps with file paths, method names, and structural guidance. Reference the nearest existing pattern for each step. No code snippets — file locations, types, and patterns only.

**Tests:**
What needs to be tested. Unit, integration, and snapshot coverage expectations. Reference the nearest existing test file as a pattern. Omit if covered inline above.

**Metrics & Security Events:** *(omit if not applicable)*
Any StatsD metrics or security events (`log.info`, `request.emitMetricsEvent`, `customs` checks) that should be emitted. Reference the nearest equivalent for naming conventions.

**Key Reference Files:**
Specific files the implementer should read before starting. One line each.

**Out of Scope:** *(omit if not needed)*

**Open Questions:** *(omit if none)*

## Guidelines

- Output the description only — no source file changes
- Implementation Steps should give enough detail to start work without follow-up questions — file paths and patterns, not prose
- Do not include design details (copy, colours, layout, component specifics) — note that the implementer should refer to the latest Figma file
- Omit redundant or obvious acceptance criteria
- Include Tests, Metrics & Security Events sections only when relevant to the task type
- If motivation or scope remain unclear after asking, flag as an Open Question rather than assuming
