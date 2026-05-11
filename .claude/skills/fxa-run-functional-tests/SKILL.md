---
name: fxa-run-functional-tests
description: Approves the on-hold "Approve Functional Tests (PR)" CircleCI job for the current PR branch, kicking off the gated Playwright functional tests. Requires CIRCLECI_TOKEN in the environment.
allowed-tools: Bash
user-invocable: true
context: inherit
---

# Run Functional Tests

Functional (Playwright) tests for PRs are gated in CircleCI behind a manual approval job (`Approve Functional Tests (PR)` in the `test_pull_request` workflow). This skill approves that job for the current branch's latest pipeline so the tests start running against the already-built workspace.

## Steps

1. Determine the current branch:
   ```sh
   git rev-parse --abbrev-ref HEAD
   ```
   If the branch is `main` or `HEAD` (detached), stop and tell the user functional tests are only gated on PR branches.

2. Confirm a CircleCI token is set in the environment — the script reads `CIRCLECI_TOKEN`, falling back to `CIRCLECI_CLI_TOKEN`:
   ```sh
   [[ -n "${CIRCLECI_TOKEN:-${CIRCLECI_CLI_TOKEN:-}}" ]] && echo set || echo missing
   ```
   If missing, instruct the user to export a personal API token (project tokens don't work for v2 approvals):
   > Get one at https://app.circleci.com/settings/user/tokens, then `export CIRCLECI_TOKEN=...` and retry.

3. Run the approval script from the repo root:
   ```sh
   ./_scripts/approve-functional-tests.sh
   ```

4. Report the result to the user:
   - On success, share the pipeline URL printed by the script.
   - If the script prints "Functional tests not on hold yet" (either "workflow not visible" or "approval job not visible"), relay that and suggest waiting a moment for CI to expand the workflow, then retrying.
   - If the script prints "Build (PR) hasn't finished yet", the gating build is still running — suggest waiting for it before retrying.
   - If the script reports the approval was already given, share the pipeline URL so the user can watch progress.
   - If the script errors with a SHA mismatch (latest pipeline is for an older commit), relay that — the user likely just pushed and CircleCI hasn't created the new pipeline yet. Suggest retrying in a few seconds.

## Notes

- The script targets the most recent pipeline on the branch and refuses to approve it if its commit doesn't match the local branch tip — that prevents accidentally approving a stale pipeline when a newer commit has just been pushed.
- The approval becomes available as soon as Build (PR) completes and the workflow expands, but if you try to approve before that happens you'll get a "Functional tests not on hold" message. Just wait a moment for CI to catch up and try again.
- Stale runs are cancelled automatically by the project-level "auto-cancel redundant workflows" setting in CircleCI.
