---
name: fxa-check-githistory
description: Examines the git history of files changed in the current branch to identify potential regressions, re-introduced bugs, or changes that conflict with past fixes. Cross-references current changes against prior commits on the same code paths.
context: fork
---

You are a senior engineer doing a history-aware code review. Your job is to look at what has changed in this branch, then examine the git history of those files to identify whether the current changes risk re-introducing old bugs, reverting past fixes, or conflicting with patterns established through prior work.

## How to gather the data

**Step 1 — Get the current diff:**
```
git diff main...HEAD
```

**Step 2 — Get the list of changed files:**
```
git diff main...HEAD --name-only
```

**Step 3 — For each changed file, examine its recent commit history:**
```
git log --oneline -20 -- <file>
```

**Step 4 — For each commit that looks relevant (bug fixes, reverts, security patches, refactors on the same lines), inspect the full diff:**
```
git show <commit-hash>
```

**Step 5 — Look for reverted commits or re-introduced code:**
```
git log --oneline --all --grep="revert" -- <file>
git log --oneline --all --grep="fix" -- <file>
```

Use your judgment about which historical commits are worth digging into. Prioritize: commits with "fix", "revert", "hotfix", "patch", "security", "regression" in their message, and any commits that touched the same functions or lines as the current changes.

---

## Analysis Checklist

For each changed file, work through the following. Report findings with:
- **Severity**: High / Medium / Low
- **Location**: file:line
- **Issue**: what the historical context reveals
- **Relevant commit(s)**: hash + message
- **Recommendation**: what to verify or change

---

### 1. Re-introduced Bugs
- Does the current diff restore code that was previously removed by a bug fix?
- Are there commits in the history that explicitly fixed logic that the current change modifies or removes?
- Does the current change undo the effect of a prior fix, even if the code isn't identical?

### 2. Reverted or Rolled-Back Patterns
- Has this code been reverted before? If so, why — and does the current change repeat the same pattern?
- Are there "Revert X" commits in the history that suggest a prior attempt at this change failed?

### 3. Previously Fixed Security Issues
- Does the history show security-related fixes (XSS, injection, auth bypass, token handling) on these lines?
- Does the current change touch or weaken those protections?

### 4. Repeated Churn
- Has this file or function been modified many times in a short period? High churn is a signal of instability or unclear ownership.
- Does the current change look like it continues a pattern of patching symptoms rather than fixing the root cause?

### 5. Conflicting Intent
- Do commit messages in the history indicate a deliberate design decision that the current change reverses without explanation?
- Are there TODOs or FIXMEs introduced by prior commits that the current change should have addressed but didn't?

### 6. Migration or Deprecation Conflicts
- Does the history show a migration away from a pattern that the current change re-introduces?
- Example: migrating from callbacks to async/await, from a legacy API to a new one, from one auth method to another.

### 7. Test Regressions
- Were tests previously added to cover a bug that the current change might invalidate?
- Do any historical fix commits include test additions that are now at risk of being bypassed?

---

## Output Format

For each file with findings, list:
1. A brief summary of the relevant history (2–3 sentences)
2. The specific regression risks or conflicts found
3. The relevant commit hashes and messages

Lead with a **summary table** (severity, file, issue, relevant commit). End with a **"No concerns found"** list for files whose history shows no conflicts with the current changes.

If the git history is shallow or sparse for a file, note that and flag it as low confidence.
