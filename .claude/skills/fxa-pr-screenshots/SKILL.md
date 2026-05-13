---
name: fxa-pr-screenshots
description: EXPERIMENTAL — Captures Storybook screenshots of FXA UI components or email templates. Two modes — diff-driven (no args; auto-detects changed surfaces vs main, used for PR prep) and on-demand (path argument; captures all stories under that path regardless of diff, used for docs, investigations, baselines, or sharing). Starts the right Storybook(s), drives Playwright headless, saves PNGs to a local gitignored folder, and returns paths the user can paste into PR bodies, docs, or chat.
argument-hint: Optional path — pass a path/folder to trigger on-demand mode (e.g. packages/fxa-settings/src/components/BoxButton); omit for diff-driven PR-prep mode
---

# Storybook Screenshots — PR-prep or On-demand

> **Experimental.** This skill is new and the workflow may shift as we use it on real PRs. Expect rough edges around port handling, baseline worktree setup, and slow Storybook boots. Feedback welcome.

Capture screenshots of FXA UI components or email templates from Storybook. Two modes:

1. **Diff-driven** (no argument) — detects changed surfaces vs `main` and captures only those stories. Default mode for PR prep; this is what `/fxa-pr-open` invokes.
2. **On-demand** (path argument) — captures every story under the given path, regardless of diff. Useful for docs, bug investigations, capturing a baseline before a change, or sharing a component state in Slack.

Both modes share the same downstream pipeline: detect → start Storybook → Playwright capture → handoff. Output is a set of PNGs in a local gitignored folder plus a markdown block. When the destination is a GitHub PR body, the user drops the local images into the GitHub editor, which uploads them and replaces local paths with `https://github.com/user-attachments/...` URLs. For other destinations (Slack, Confluence, etc.), the user uses the local files directly.

Capture mode (after-only vs before/after) is decided automatically: after-only for *new* / *unchanged* stories, before/after for *modified* stories in diff-driven mode.

## Hard rules

- **Never `git stash`, `git checkout`, or otherwise switch branches in the primary working tree.** Other Claude Code sessions may be running on different branches in the same checkout, and switching branches in place can stash their pending work. This rule applies to one specific situation in this skill: **rendering a `main` baseline for before/after captures of modified stories** (Step 5). Detecting *which* files changed uses `git diff main...HEAD --name-only`, which needs no checkout. Detecting changes is fine in place; rendering the baseline requires `git worktree add ../<name> main`.
- **Confirm before starting Storybook.** Storybook on `fxa-settings` (~10–20s) and `accounts-email-renderer` (much slower — `l10n-merge` + `build-css` + `build-ts`) takes time. Print the command and let the user approve before backgrounding it.
- **Confirm before installing Playwright's Firefox.** First-time use requires `npx playwright install firefox` (~80MB, one-time per machine). Prompt before running.
- **Do not upload screenshots anywhere.** Save to the local gitignored folder only — uploading to GitHub PR bodies is the user's manual step (drag/drop into the GitHub editor).

## Step 1 — Determine which stories to capture

Mode selection:

- **`$ARGUMENTS` provided → on-demand mode.** Treat the argument as a path (or comma-separated paths). Skip the diff check entirely. In Step 2, find every `*.stories.{ts,tsx}` under that path; in Step 5, treat all stories as new (after-only capture, no `main` baseline). Use this mode for docs, investigations, sharing a component state, or capturing a pre-change baseline.

  Infer the surface (and thus which Storybook to start in Step 3) from the path prefix:
  - Path under `packages/fxa-settings/` → `fxa-settings` Storybook, port 6008
  - Path under `packages/fxa-react/` → `fxa-react` Storybook, port 6007
  - Path under `libs/accounts/email-renderer/` → `accounts-email-renderer` Storybook, port 4400
  - Anything else → stop and tell the user the skill only knows those three surfaces; suggest manual capture instead.
- **No `$ARGUMENTS` → diff-driven mode.** Compute the file list:
  - `git diff main...HEAD --name-only` — all changed files
  - `git diff main...HEAD --diff-filter=A --name-only` — added files only (used in Step 5 to distinguish "new" from "modified" for before/after pairs)

  Screenshots are relevant when the diff touches any of these surfaces:

  | Surface | Globs | Storybook |
  |---|---|---|
  | Settings UI | `packages/fxa-settings/**/*.{tsx,scss,css,svg,png,gif,webp}` | `fxa-settings` — port 6008 |
  | Shared React components | `packages/fxa-react/**/*.{tsx,scss,css,svg,png,gif,webp}` | `fxa-react` — port 6007 |
  | Email templates / layouts / partials | `libs/accounts/email-renderer/src/{templates,layouts,partials}/**/*.{mjml,ts,txt,ftl}` | `accounts-email-renderer` — port 4400 |
  | User-visible copy in any of the above | sibling `*.ftl` files | matches the surface above |

  Content-server (`packages/fxa-content-server/**`) is **out of scope** for this skill — there is no Storybook coverage for it. If the diff only touches content-server, tell the user screenshots need to be captured manually from the running app.

  If the diff touches none of the surfaces above, stop and tell the user no screenshots are needed for this PR — and mention they can re-invoke with a path argument for on-demand capture if they want one anyway.

## Step 2 — Locate stories for changed surfaces

For each changed file:
1. Look for a sibling stories file — `index.stories.tsx` / `index.stories.ts` / `<Name>.stories.tsx`.
2. If found, read the `title` from the default export (the Storybook navigation path) and the named story exports (the variants).
3. If not found:
   - For UI components: mark **no story** — the user will need to capture from the running app, or add a quick story.
   - For email templates: every email template in `libs/accounts/email-renderer/src/templates/<name>/` is expected to have a `index.stories.ts`. If one is missing on a new template, flag it — adding it is part of the work, not a screenshot workaround.

Produce one table per surface (UI vs email) so the user runs the right Storybook for each:

```
### UI (fxa-settings / fxa-react)

| Changed file | New? | Story file | Storybook nav | Variants |
|---|---|---|---|---|
| `packages/fxa-settings/src/components/BoxButton/index.tsx` | yes | `…/index.stories.tsx` | `Components/BoxButton` | `Default`, `WithIcon`, `Disabled` |

### Email (libs/accounts/email-renderer)

| Changed file | New? | Story file | Storybook nav | Variants |
|---|---|---|---|---|
| `libs/accounts/email-renderer/src/templates/postAddPasskey/index.mjml` | yes | `…/index.stories.ts` | `Templates/postAddPasskey` | `Html`, `Plaintext` |
```

The "New?" column drives capture mode in Step 5.

## Step 3 — Start the right Storybook(s) and fetch the stories manifest

For each surface identified in Step 1, start its Storybook in the background after user confirmation (see hard rules). Commands and ports:

- **fxa-settings UI:** `yarn workspace fxa-settings storybook` → http://localhost:6008
- **fxa-react UI:** `yarn workspace fxa-react storybook` → http://localhost:6007
- **Email templates:** `nx storybook accounts-email-renderer` → http://localhost:4400 (slowest — l10n-merge + build-css + build-ts run as deps; allow ~60s)

Background-start pattern: `<cmd> > /tmp/storybook-<surface>.log 2>&1 & echo $!`. Capture the printed PID for each Storybook started so Step 7 can offer to stop them. Poll until ready:

```
until curl -sf http://localhost:<PORT>/iframe.html > /dev/null; do sleep 2; done
```

Ports listed above are defaults. If a default port is in use, Storybook picks another and logs it — parse the actual port from `/tmp/storybook-<surface>.log` and use it for the manifest and capture URLs.

Once ready, fetch the stories manifest:
- Storybook 7+: `GET http://localhost:<PORT>/index.json`
- Storybook 6: `GET http://localhost:<PORT>/stories.json`

The manifest lists every story's `id` (slugified path, e.g. `components-boxbutton--default`), `title`, `name`, and `importPath`. Step 2 already produced a list of *story files* (e.g. `…/index.stories.tsx`) for each changed component — match the manifest's `importPath` against those story files (not against the raw changed component files like `index.tsx`, which won't appear in `importPath`). The matched manifest entries give the story `id`s used to build URLs in Step 5.

## Step 4 — Verify Playwright Firefox is installed

Playwright 1.44.1 is already a devDep in `packages/functional-tests` and hoisted to `node_modules/.bin/playwright`, so `npx playwright` works from anywhere in the repo. Verify Firefox is present in Playwright's browser cache:

```
npx playwright install --dry-run firefox
```

If the output indicates Firefox would be installed (i.e. it's not present yet), prompt the user to run `npx playwright install firefox` (~80MB, one-time per machine). Wait for confirmation before invoking.

## Step 5 — Capture screenshots

Build a target list — for each matched story, an object with `id`, `url`, and `outPath`:

- **URL:** `http://localhost:<PORT>/iframe.html?viewMode=story&id=<story-id>&shortcuts=false&singleStory=true`
- **Out path:** `.claude/screenshots/<sanitized-branch>/<surface>/<story-id>.png` (sanitized branch = replace `/` with `-`).

Pipe the targets as a JSON array to the bundled capture script (`.claude/skills/fxa-pr-screenshots/capture.js`). Use a quoted-delimiter heredoc — `'EOF'` disables shell interpolation so single quotes inside the JSON don't break the command:

````
node .claude/skills/fxa-pr-screenshots/capture.js <<'EOF'
<targets-json>
EOF
````

The script creates output directories as needed, waits for each story's DOM to render (Storybook's HMR keeps `networkidle` from settling), and emits one `ok <id> -> <path>` line per success or `fail <id>: <reason>` per failure. Exit code: `0` all ok, `1` partial failure, `2` bad input. No temp files to clean up.

**Before/after pairs for modified files.** Use Step 2's "New?" column. For any *modified* (not added) file, repeat the capture against a `main`-baseline worktree. Keep the capture script running in the **primary** worktree throughout — writing `before/*.png` files inside the baseline worktree would lose them when the worktree is removed.

Pick a per-branch baseline path so concurrent runs (or a stale worktree from an earlier interrupted run) don't collide: `../fxa-main-snapshot-<sanitized-branch>` (sanitized = replace `/` with `-`, same as the screenshots output dir).

1. Print, confirm, then run: `git worktree add ../fxa-main-snapshot-<sanitized-branch> main` followed by `(cd ../fxa-main-snapshot-<sanitized-branch> && yarn install)` — `yarn install` in a fresh worktree is slow, so this needs explicit user approval. If the per-branch path already exists from an earlier run, prompt the user before removing it.
2. From the baseline worktree, start the same Storybook(s) but on **different ports** so they don't clash with the branch-side Storybook already running on 6007/6008/4400. Recipes:
   - `fxa-settings`: `(cd ../fxa-main-snapshot-<sanitized-branch>/packages/fxa-settings && STORYBOOK_BUILD=1 yarn build-css && npx storybook dev -p 6108 --no-version-updates)`
   - `fxa-react`: `(cd ../fxa-main-snapshot-<sanitized-branch>/packages/fxa-react && npx storybook dev -p 6107 --no-version-updates)`
   - `accounts-email-renderer`: `(cd ../fxa-main-snapshot-<sanitized-branch> && nx storybook accounts-email-renderer --port=4500)`
3. From the **primary** worktree, run `capture.js` again with URLs pointing at the baseline ports (6108 / 6107 / 4500) and `outPath` values under the primary worktree's `.claude/screenshots/<branch>/<surface>/before/<story-id>.png`. Outputs land in the primary tree.
4. Clean up: stop the baseline Storybook(s), then `git worktree remove ../fxa-main-snapshot-<sanitized-branch>`. Baseline screenshots are unaffected because they were written to the primary worktree in Step 3.

The output folder `.claude/screenshots/` is gitignored — confirm it's in `.gitignore` (this PR adds the entry).

## Step 6 — Hand off

Output a markdown block ready to paste into the PR body's `## Screenshots (Optional)` section. Two templates depending on mode:

**After-only (new component / new template):**

````markdown
**BoxButton component — new primitive used in `AlternativeAuthOptions`**

| Default | With icon | Disabled |
|---|---|---|
| ![](.claude/screenshots/<branch>/fxa-settings/components-boxbutton--default.png) | ![](.claude/screenshots/<branch>/fxa-settings/components-boxbutton--with-icon.png) | ![](.claude/screenshots/<branch>/fxa-settings/components-boxbutton--disabled.png) |
````

**Before/after (modified UI or template):**

````markdown
**Sign-in page — passkey prompt added below email field**

| Before | After |
|---|---|
| ![](.claude/screenshots/<branch>/fxa-settings/before/pages-signin--default.png) | ![](.claude/screenshots/<branch>/fxa-settings/pages-signin--default.png) |
````

The user (or `/fxa-pr-open` consuming this skill's return value) pastes the block into the PR body. After the PR is opened, dragging/dropping the local PNGs into the GitHub editor uploads them and rewrites the local paths to `https://github.com/user-attachments/...` URLs.

When invoked inline by `/fxa-pr-open`, **return the markdown block as the skill's output** so the caller can slot it directly into the `## Screenshots` section of the draft body.

## Step 7 — Offer cleanup (optional)

After the handoff, there are two things worth offering to clean up: the captured PNGs and the background Storybook processes. Both are opt-in — never automatic — and both must only act on artefacts this run created.

**Captured PNGs.** The PNGs have usually served their purpose — uploaded into a PR body, pasted into Slack, attached to a doc. The skill does **not** delete them automatically (the user may want them for retries, a second upload, or a follow-up), but it should offer.

At the end of the run, ask the user whether to remove this run's captures. Only ever delete files this run wrote — never the whole `.claude/screenshots/` tree, and never another branch's folder. The script in Step 5 emits one `ok <id> -> <outPath>` line per success; that is the authoritative list to act on.

If the user confirms, `rm` each captured file by exact path, then remove the surface/branch directories only if they're now empty (`rmdir` will refuse if anything else lives there — that's the safety net). If the user declines or doesn't answer, leave everything in place; `.claude/screenshots/` is gitignored, so stale files cause no harm.

**Storybook processes.** Step 3 backgrounded one Storybook per surface and recorded each PID. Without cleanup these stay running, holding ports 6007 / 6008 / 4400 (and any baseline ports from Step 5) and consuming memory.

Print the captured PIDs and ports and ask whether to stop them. On confirmation, `kill <pid>` each one — only the PIDs this run recorded. Never `pkill -f storybook` (would kill unrelated dev servers another session is using). If the user declines, leave them running.

Skip both cleanups entirely when invoked inline by `/fxa-pr-open` — the caller decides timing, since the PNGs are still needed for the user's drag-and-drop upload and the caller may want to reuse the running Storybook.
