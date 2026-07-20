#!/usr/bin/env python3
"""Phase 2 scan for the fxa-changelog skill.

Pure git, no network. Walks the first-parent history of a range and emits one
skeleton JSON record per merged PR, pre-classified so the model layers never
re-derive git facts.

Exit codes: 0 = JSON printed; 2 = could not run (bad range, not a git repo).
"""

import argparse
import json
import re
import subprocess
import sys

# --- SubPlat exclusion boundary (tune here, not in logic) ---
EXCLUDE_JIRA_PROJECTS = {"PAY", "ENT"}
EXCLUDE_SCOPES = {
    "payments", "payments-next", "payments-api", "payments-cart",
    "subplat", "entitlements", "entitlement", "iap",
}
# Distinctive substrings that are safe to match anywhere in a branch name.
EXCLUDE_BRANCH_SUBSTRINGS = ("subplat", "payments_")
# PAY-/ENT- Jira keys embedded in a branch. Anchored to a start or separator and
# requiring a trailing digit so it matches "ENT-1234" / "worktree-pay-99" but NOT
# "content-", "deployment-", "improvement-" (which merely contain the letters "ent-").
EXCLUDE_BRANCH_KEY_RE = re.compile(r"(?i)(?:^|[/_-])(?:pay|ent)-\d")
EXCLUDE_PATH_PREFIXES = (
    "packages/fxa-payments-server/", "packages/payments-next/",
    "apps/payments/", "libs/payments/", "libs/entitlements/",
    "libs/shared/entitlements/",
)

# --- Paths that trigger a full-diff read in Phase 3 (handoff gotchas) ---
FLAG_RULES = (
    ("migration", lambda p: p.startswith("packages/db-migrations/")),
    ("config", lambda p: "/config/" in p and p.endswith((".ts", ".json")) and "/test/" not in p),
    ("routes", lambda p: "/routes/" in p and p.endswith(".ts") and not p.endswith(".test.ts")),
    ("ci", lambda p: p.startswith(".github/workflows/") or p.startswith(".circleci/")),
    ("adr", lambda p: p.startswith("docs/adr/")),
)

MERGE_RE = re.compile(r"^Merge pull request #(\d+) from ([^\s]+)")
# Trailing (?!\d) instead of \b: keys are often glued to underscores in branch
# names (worktree-FXA-13863__poc) and _ is a word char, which breaks \b.
JIRA_RE = re.compile(r"\b([A-Z][A-Z0-9]{1,9})-(\d{2,6})(?!\d)")
SCOPE_RE = re.compile(r"^\w+\(([^)]+)\)\s*:")
REVERT_RE = re.compile(r'^Revert "(.*)"')
NOISE_RULES = (
    ("deps", lambda s, a, b: a.endswith("[bot]") or s.startswith(("chore(deps", "build(deps"))),
    # Legal-doc PR subjects vary ("chore(docs): latest legal PDFs", "... [skip ci]");
    # match on the legal+pdf signal, not on a [skip ci] tag that isn't always present.
    ("legal-pdfs", lambda s, a, b: "legal" in s.lower() and ("pdf" in s.lower() or "[skip ci]" in s)),
    ("l10n", lambda s, a, b: "l10n" in b.lower() and "import" in s.lower()),
)


def git(*args):
    r = subprocess.run(["git", *args], capture_output=True, text=True)
    if r.returncode != 0:
        raise RuntimeError(f"git {' '.join(args[:3])}...: {r.stderr.strip()[:200]}")
    return r.stdout


def find_jira(*texts):
    for t in texts:
        for m in JIRA_RE.finditer(t.upper()):
            return f"{m.group(1)}-{m.group(2)}"
    return None


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--range", required=True, help="git range, e.g. v1.340.0..origin/main")
    ap.add_argument("--release-tags", type=int, default=4, help="newest vN tags to check containment against")
    args = ap.parse_args()

    try:
        sep = "\x1e"
        raw = git("log", "--first-parent", f"--format=%H{sep}%an{sep}%cI{sep}%s{sep}%b\x1f", args.range)
        tags = [t for t in git("tag", "--sort=-v:refname").splitlines() if re.fullmatch(r"v1\.\d+\.\d+", t)][: args.release_tags]
    except RuntimeError as e:
        print(f"changelog-scan: {e}", file=sys.stderr)
        sys.exit(2)

    records = []
    for chunk in raw.split("\x1f"):
        chunk = chunk.strip("\n")
        if not chunk.strip():
            continue
        sha, author, date, merge_subject, body = (chunk.split(sep, 4) + [""] * 5)[:5]
        m = MERGE_RE.match(merge_subject)
        pr_number = int(m.group(1)) if m else None
        branch = m.group(2).split("/", 1)[-1] if m else ""
        # For merge commits the conventional subject is the body's first line.
        body_lines = [l for l in body.splitlines() if l.strip()]
        subject = body_lines[0] if (m and body_lines) else merge_subject

        numstat = git("diff", "--numstat", f"{sha}^1", sha) if pr_number else git("show", "--numstat", "--format=", sha)
        files, ins, dels, flags = [], 0, 0, set()
        for line in numstat.splitlines():
            parts = line.split("\t")
            if len(parts) != 3:
                continue
            a, d, path = parts
            files.append(path)
            ins += int(a) if a.isdigit() else 0
            dels += int(d) if d.isdigit() else 0
            for name, rule in FLAG_RULES:
                if rule(path):
                    flags.add(name)

        jira = find_jira(branch, subject, body)
        scope_m = SCOPE_RE.match(subject)
        scope = scope_m.group(1).strip().lower() if scope_m else None

        # Classification, first match wins.
        excluded_files = sum(1 for p in files if p.startswith(EXCLUDE_PATH_PREFIXES))
        if (
            (jira and jira.split("-")[0] in EXCLUDE_JIRA_PROJECTS)
            or (scope in EXCLUDE_SCOPES)
            or any(s in branch.lower() for s in EXCLUDE_BRANCH_SUBSTRINGS)
            or bool(EXCLUDE_BRANCH_KEY_RE.search(branch))
            or (files and excluded_files > len(files) / 2)
        ):
            classification = "subplat"
        else:
            classification = "entry"
            for kind, rule in NOISE_RULES:
                if rule(subject, author, branch):
                    classification = f"noise:{kind}"
                    break

        records.append({
            "sha": sha, "pr_number": pr_number, "branch": branch, "jira_key": jira,
            "subject": subject, "author": author, "merged_at": date[:10], "scope": scope,
            "files_changed": len(files), "insertions": ins, "deletions": dels,
            "flagged_paths": sorted(flags), "classification": classification,
        })

    # Pair reverts with their targets inside the range and collapse both.
    # Git rewrites nested double quotes to single quotes in revert subjects,
    # so compare with quotes normalized.
    def norm(s):
        return s.replace('"', "'")

    # Records are newest-first (git log --first-parent), so a revert precedes its
    # target in the list. Pair each revert with a SINGLE target: the nearest older
    # record whose subject matches, not already consumed by another pairing. This
    # avoids collapsing unrelated PRs that happen to share a subject (a revert
    # target may itself be a revert, which is how revert-of-revert chains link).
    consumed = set()
    for i, r in enumerate(records):
        rm = REVERT_RE.match(r["subject"])
        if not rm:
            continue
        target_subject = norm(rm.group(1))
        target = None
        for t in records[i + 1:]:
            if id(t) in consumed:
                continue
            if norm(t["subject"]) == target_subject:
                target = t
                break
        if target is None:
            continue
        r["classification"] = "reverted_pair"
        target["classification"] = "reverted_pair"
        target["reverted_by"] = r["sha"]
        consumed.add(id(r))
        consumed.add(id(target))
    # Chain parity: an odd-length chain (change -> revert -> revert-of-revert)
    # nets to the base change being applied; promote it back to an entry.
    by_sha = {r["sha"]: r for r in records}
    for r in records:
        if r["classification"] == "reverted_pair" and not REVERT_RE.match(r["subject"]):
            # r is a chain base (an original change, not itself a revert)
            length, cur = 1, r
            while cur.get("reverted_by") and cur["reverted_by"] in by_sha:
                cur = by_sha[cur["reverted_by"]]
                length += 1
            if length % 2 == 1:
                r["classification"] = "entry"
                r["note"] = f"net-applied after a revert chain of {length} commits in this range"

    # Earliest release tag containing each commit (factual; env mapping is presentation).
    for r in records:
        r["first_release_tag"] = None
        for tag in reversed(tags):  # oldest of the checked tags first
            if subprocess.run(["git", "merge-base", "--is-ancestor", r["sha"], tag], capture_output=True).returncode == 0:
                r["first_release_tag"] = tag
                break

    # Detect PRs whose patch was cherry-picked into a checked release tag.
    # Dot-release hotfixes land on main first, then get cherry-picked onto the
    # train's release branch under a *different* sha, so is-ancestor containment
    # above misses them. `git cherry <tag> <head>` patch-id-compares head's
    # non-merge commits against the tag and marks "- <sha>" for those already
    # applied there. Those are the PR's underlying commits, not the merge sha,
    # so map each merge back to its constituent commits before matching.
    range_head = args.range.split("..")[-1] or "HEAD"
    cherry_shas = {}  # full main-side sha -> [tags] whose branch already has its patch
    for tag in tags:
        try:
            out = git("cherry", tag, range_head)
        except RuntimeError:
            continue
        for line in out.splitlines():
            if line.startswith("- "):
                cherry_shas.setdefault(line[2:].strip(), []).append(tag)
    for r in records:
        picks = set()
        if r["pr_number"] and cherry_shas:
            try:
                children = git("rev-list", f"{r['sha']}^1..{r['sha']}").split()
            except RuntimeError:
                children = []
            for c in children:
                picks.update(cherry_shas.get(c, []))
        r["cherry_picked_in"] = sorted(picks) or None

    summary = {}
    for r in records:
        summary[r["classification"]] = summary.get(r["classification"], 0) + 1

    print(json.dumps({
        "range": args.range,
        "release_tags_checked": tags,
        "total": len(records),
        "summary": summary,
        "records": records,
    }, indent=1))
    sys.exit(0)


if __name__ == "__main__":
    main()
