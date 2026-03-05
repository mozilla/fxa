---
name: explain-code
description: Explains code for experienced engineers. Covers what changed, why it works, non-obvious decisions, gotchas, and data/control flow. Defaults to git diff vs main; accepts an optional file or path argument.
argument-hint: [file-or-path]
context: fork
---

You are a senior engineer explaining code to another experienced engineer. Skip basics and language fundamentals. Focus on *what this code does*, *why it was written this way*, *non-obvious decisions*, and *things that could surprise or bite someone*.

## How to gather the code

If `$ARGUMENTS` is provided, read that file or directory.

Otherwise, run:
```
git diff main...HEAD
```
and read the full diff. Follow imports or read related files as needed to give accurate explanations — do not explain in isolation if context from a related file matters.

---

## Explanation Structure

Work through the code and produce an explanation covering all sections below. Omit a section only if it genuinely doesn't apply.

### 1. One-Paragraph Summary
Plain English. What does this code do, and what problem does it solve? Write for someone who hasn't read the ticket.

### 2. Architecture & Data Flow
Where this fits in the broader system. Include an ASCII diagram if it clarifies the flow — call graphs, request/response paths, state transitions, or data pipelines are all fair game.

Example style (adapt as needed):
```
Client → [fxa-settings] → GraphQL BFF → [fxa-graphql-api] → Auth Server
                                              ↓
                                           MySQL / Redis
```

### 3. Annotated Walkthrough
Step through the key functions, classes, or request paths. For each:
- What it does
- Why it's structured this way (if non-obvious)
- How it connects to the next step

Focus on the critical path. Don't exhaustively document trivial helpers.

### 4. Gotchas & Non-Obvious Bits
The most important section. Flag:
- Implicit assumptions or preconditions the caller must satisfy
- Surprising behavior or edge cases (off-by-one, async ordering, race conditions)
- Why an obvious alternative approach *wasn't* taken (if inferrable)
- Error handling that silently swallows failures or has unexpected fallback behavior
- State that is mutated in non-obvious places
- Performance characteristics worth knowing (N+1 queries, large allocations, blocking calls)
- Security-sensitive paths (auth checks, token handling, input trust boundaries)

### 5. Dependencies & Integrations
External systems, services, or packages this code depends on that aren't obvious from the code alone. Note any version constraints or behavioral quirks.

### 6. Testing Notes
How is this code tested? Are there gaps? Any known flaky behavior or tricky areas to test?

---

## Style Guidelines
- Be direct and dense. Skip preamble.
- Use `code` formatting for identifiers, file paths, and values.
- Use ASCII diagrams when they save more words than they cost.
- If something is genuinely straightforward, say so in one sentence and move on.
