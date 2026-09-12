---
name: fxa-pr-debug
description: Boots a branch's FxA stack in CircleCI with `yarn pr-debug`, tunnels it to localhost with `yarn pr-debug --tunnel`, and reports when it is up. Given a description of what to check, also writes and runs a throwaway Playwright test against it in a headed local Firefox. Requires CIRCLECI_TOKEN. Use to try a branch or PR without checking it out.
allowed-tools: Bash, Read, Write, Edit, Grep, Glob, TaskOutput, TaskStop, AskUserQuestion
argument-hint: [pr-number] [what to test]
user-invocable: true
context: inherit
---

# Debug a PR on a CI stack

Two commands: `yarn pr-debug [pr]` boots the branch's stack in CircleCI and
returns once it is up; `yarn pr-debug --tunnel [pr]` then forwards every
service port to `localhost`, so `http://localhost:3030` *is* the CI stack and
`yarn playwright test --project=local` runs against it unchanged. The stack
stays up 30 minutes after boot whether or not a tunnel is open, so several
can run side by side and `--tunnel` hops between them. How the script gets
there is documented in `.circleci/README.md` (Interactive stack); this skill
only drives it.

Arguments: a leading integer is a PR number; everything else is the test
description. Either is optional.

## Hard rules

- The stack is a public CI job: only throwaway identities (`testAccountTracker`
  makes them), never real accounts or stage/production credentials, and never
  print the container's `env`.
- Scratch specs live in `packages/functional-tests/tests/scratch/` and are
  deleted before this skill ends. Never stage or commit one. If the user wants
  to keep it, say it must become a real test (`/fxa-test-draft`) first.
- Ask before `yarn stop` (their local stack) or `npx playwright install`
  (network). Do not edit `_scripts/pr-debug.sh` or `.circleci/config.yml` here.
- `--tunnel` closes any tunnel already open from this machine. If `pgrep -f
  fxa-pr-debug-tunnel` finds one, say which stack it will drop and ask first.
- A host key mismatch from the script is a stop, not something to bypass.

## Steps

### 1. Preflight (run these in parallel)

- Token present, without printing it:
  `if [ -n "$CIRCLECI_TOKEN" ] || [ -n "$CIRCLECI_CLI_TOKEN" ]; then echo set; else echo missing; fi`.
  Missing → point at https://app.circleci.com/settings/user/tokens and stop.
- `git status -sb`. Without a PR number, the branch must not be `main`/`HEAD`,
  and must exist on origin; if local is ahead, say so — CI builds origin.
- `ssh-add -l`. `--tunnel` runs ssh non-interactively, so the key registered
  with the user's GitHub account must be in the agent. If the agent is empty,
  ask them to `ssh-add` it in their terminal and stop until they confirm.
- Existing tunnel: `pgrep -fl fxa-pr-debug-tunnel` (see hard rules).
- Forwarded ports free:
  `for p in 3030 3000 9000 9001 1111 1112 8080 8091 8095 9130 9160 6379; do nc -z -w1 127.0.0.1 $p && echo "$p busy"; done`.
  Busy ports with no tunnel running usually mean a local `yarn start`; ask
  before `yarn stop`.
- With a test description: a local Firefox for Playwright
  (`ls ~/Library/Caches/ms-playwright | grep -c firefox`). None → ask before
  `npx playwright install firefox`.

### 2. Boot the stack

Run from the repo root in the background with the maximum timeout:

```sh
yarn pr-debug [pr-number]
```

It prints each CI step as it goes ("Canceling first pass" is expected — SSH can
only be enabled on a rerun), then `Job #N: <url>`, and exits with "Stack for
<branch> is up". A cold boot is about seven minutes (two of them the
throwaway first pass); a rerun on the same commit skips that pass and takes
about five. If a stack is already running for the commit it says so and exits
at once.

### 3. Draft the test while it boots (only with a description)

Write `packages/functional-tests/tests/scratch/<kebab-slug>.spec.ts`:

- `import { test, expect } from '../../lib/fixtures/standard';` — fixtures are
  `target`, `page`, `pages` (the POMs under `pages/`), `testAccountTracker`,
  `syncBrowserPages`. Read `lib/testAccountTracker.ts` for how accounts are
  created and cleaned up, and the spec under `tests/` closest to the request
  for the flow.
- One `test.describe('scratch: <description>')` with one `test()`. Assert with
  `expect`; no severity tags.
- Locator rules in `.claude/rules/testing/functional-pages.md` apply (they load
  when you touch the file): structural locators and POM getters, never CMS
  copy.

### 4. Open the tunnel

Once the boot task has exited successfully, run in the background with the
maximum timeout:

```sh
yarn pr-debug --tunnel [pr-number]
```

It prints `Job #N`, the SSH endpoint, then "Tunnel open". Then confirm the
ports answer, in one bounded call rather than a sleep loop:

```sh
curl -sf --retry 20 --retry-all-errors --retry-delay 5 --retry-max-time 120 \
  -o /dev/null http://localhost:3030/ && curl -sf -o /dev/null http://localhost:9000/__heartbeat__ && echo up
```

`--retry-all-errors` matters: a forwarded port whose remote side is not
listening yet returns an empty reply, which curl otherwise treats as final.

If either task fails, read its output: "No stack is running" means the boot
did not finish or the stack has shut down (rerun step 2); a "Step failed" line
carries the job URL. Do not guess at the cause; relay the failing step.

### 5. Tell the user

One message: the stack is at <http://localhost:3030>, the job URL, when the
30-minute hold ends, and that mail for `@restmail.net` signups is read at
`http://localhost:9001/mail/<local-part>` (the request blocks until mail
arrives). For a shell on the box alongside the tunnel — `yarn pm2 log`, say —
they run `yarn pr-debug --ssh [pr-number]` in their own terminal; it binds no
ports.

### 6. Run the test (only with a description)

```sh
cd packages/functional-tests && DEBUG=1 PLAYWRIGHT_WORKERS=1 \
  yarn test tests/scratch/<slug>.spec.ts --retries=0
```

The package's `test` script pins `--project=local` and the ipv4-first DNS
order the tunnel needs. `DEBUG=1` runs headed, so the user watches the CI stack
drive a local Firefox. An existing spec works just as well as a scratch one
when the request matches a flow the suite already covers; pick one test with
`-g "<title>$"`.

In a checkout without `node_modules` (a fresh worktree), `yarn` refuses to run.
Node resolution walks up to the main checkout's `node_modules`, so run its
binary against this checkout's config instead:
`NODE_OPTIONS=--dns-result-order=ipv4first <main-checkout>/node_modules/.bin/playwright test --config <this-checkout>/packages/functional-tests/playwright.config.ts --project=local …`.
Report the result plainly: which assertion failed and what the page showed. On
failure the trace is under `artifacts/functional/`; give the
`yarn playwright show-trace <zip>` command. Offer to adjust and rerun — the
stack is warm, so a rerun is seconds.

### 7. Wrap up

Delete `tests/scratch/` and confirm `git status --short packages/functional-tests`
is clean. Then ask what to do with the stack:

- **Keep the tunnel** — they browse `localhost:3030` until the session cap.
- **Stop the tunnel** (`TaskStop`) — the stack stays up for the rest of its
  hold, and `yarn pr-debug --tunnel` reconnects to it.
- **Release now** — stop the tunnel, then cancel the job (URL first, so the
  Bash permission rule for CircleCI POSTs matches):
  `curl https://circleci.com/api/v2/project/gh/mozilla/fxa/job/<N>/cancel -sS -X POST -H "Circle-Token: $CIRCLECI_TOKEN"`.

## Notes

- Docker `xlarge` bills 20 credits/min while the job is up. The 30-minute hold
  is set at boot (`PR_DEBUG_MINUTES` overrides it); after it the job shuts down
  about ten minutes after the last SSH session closes. Tunnel and shell
  sessions are capped at the same number of minutes and never cancel the job.
- Redis (6379) is forwarded because the `target` fixture resets rate limits
  through it; without that forward every test hangs on connect.
- Script errors to relay verbatim rather than work around: "No stack is
  running", "Local ports in use", "Host key mismatch", "Step failed", "Timed
  out waiting".
