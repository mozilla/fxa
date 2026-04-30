---
name: fxa-release
description: EXPERIMENTAL — Guides an engineer through the FXA release process for stage or production. Walks through tagging, building, deploying, and smoke-testing step by step. NOT for auto mode; performs irreversible actions and requires confirmation at each step.
allowed-tools: Bash, Read, AskUserQuestion
user-invocable: true
context: fork
---

# FXA Release Walkthrough

> ⚠️ **EXPERIMENTAL — DO NOT RUN THIS IN AUTO MODE.**
>
> This skill performs irreversible actions: pushing tags, kicking off deploys, and (for production) instructing changes to production manifests. It is a step-by-step guide for a human release owner. Pause at every step. Wait for explicit confirmation before running anything that mutates state. If anything looks wrong, **stop** and let the user decide.

## Your role

You are the release **guide**, not the release **owner**. Your job is to walk the user through the process and surface issues clearly. Do **not** troubleshoot failures, retry red builds, or skip steps to keep things moving. If a check fails, a pipeline goes red, or a version doesn't match — say so plainly and let the user choose what to do next.

## Before you start

If auto mode is active, decline politely and ask the user to disable it before proceeding.

Verify the working directory is the FXA monorepo root (`package.json` should have `"name": "fxa"`).

---

## Step 1: Gather inputs

Use **AskUserQuestion** twice:

1. **What release tag is this?** (e.g. `v1.100.1` or `v1.100.0-rc1`)
   Validate the response against `^v(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)(-rc[0-9]+)?$`. If it doesn't match, re-ask. Store as `$tag`.

2. **Is this a stage or production release?**
   Options: `stage`, `production`. Store as `$env`.

---

## Step 2: Validate setup

Run both checks. If either fails, stop and tell the user how to fix it.

### CIRCLECI_TOKEN in `.env`

```bash
test -f .env && grep -qE '^CIRCLECI_TOKEN=' .env
```

If missing: tell the user to get a personal API token at https://app.circleci.com/settings/user/tokens (project tokens won't work for v2 pipeline triggers) and add `CIRCLECI_TOKEN=<value>` to `.env` at the repo root.

### `gh` CLI authenticated

```bash
gh auth status
```

If not authenticated: tell the user to run `gh auth login`.

---

## Step 3: Tag and push the release

Tell the user you'll run `yarn trigger:tag-release $tag` and ask for confirmation. The script will:

- Fetch latest tags from origin
- Verify the user is on the correct `train-<minor>` branch
- Push the train branch to origin
- Create an annotated tag at HEAD
- Push the tag to origin

The tag push triggers CircleCI's `test_and_deploy_tag` pipeline.

After confirmation:

```bash
yarn trigger:tag-release $tag
```

Surface the script output verbatim. Then give the user this URL to find their pipeline:

> https://app.circleci.com/pipelines/github/mozilla/fxa

Tell them to filter or scroll to find the run for `$tag`.

---

## Step 4: Wait, or kick off the docker build now

Use **AskUserQuestion**: wait for the CircleCI tag pipeline to finish, or kick off the docker build immediately?

Options: `wait`, `kick-off-now`.

### If `wait`

Poll the CircleCI API every 30 seconds until the matching pipeline's workflow finishes. Find the pipeline first:

```bash
curl -s -H "Circle-Token: $(grep -E '^CIRCLECI_TOKEN=' .env | cut -d= -f2-)" \
  "https://circleci.com/api/v2/project/github/mozilla/fxa/pipeline" | \
  jq --arg tag "$tag" '.items[] | select(.vcs.tag == $tag) | {id, number, state}'
```

Then poll the workflow status:

```bash
curl -s -H "Circle-Token: $TOKEN" \
  "https://circleci.com/api/v2/pipeline/<pipeline-id>/workflow" | \
  jq '.items[] | {name, status}'
```

When all workflows finish: alert the user. If any are `failed`, **stop** and surface the failure. Do not proceed.

### If `kick-off-now`

```bash
yarn trigger:docker-push $tag
```

Surface the script's output (it includes the GitHub Actions URL). Briefly mention that the docker build will push the image to GAR and Docker Hub.

---

## Step 5: Wait for stage to deploy

Once the docker image is pushed, stage will auto-deploy. Poll the version endpoint every 30 seconds:

```bash
curl -s https://accounts.stage.mozaws.net/__version__ | jq -r .version
```

Compare to `$tag` with the leading `v` stripped (e.g. `v1.100.5` → `1.100.5`). When the response matches, alert the user that stage has deployed.

If the version doesn't match within ~20 minutes, surface that to the user — something may be wrong.

---

## Step 6: Stage smoke tests

Tell the user the next step is to run the stage smoke tests:

```bash
dotenv -- yarn trigger:smoke-tests stage $tag
```

Ask for confirmation before running it. After running, surface the CircleCI pipeline URL the script prints. Tell the user to watch the smoke tests — do not proceed until they confirm the smokes have completed.

If the smoke tests fail, **stop** and let the user decide.

---

## Step 7: Branch on env

If `$env == "stage"`: stage release is **complete**. Briefly summarize what was done and exit.

If `$env == "production"`: continue to step 8.

---

## Step 8: Update the production manifest

Tell the user:

1. Open: https://github.com/mozilla/webservices-infra/edit/main/fxa/k8s/fxa/values-prod.yaml
2. Update the FXA image tag to the current `$tag`
3. Open a PR. Get an R+ and merge.
4. Then go to argo and select diff, to validate tag has landed, and sync to kick off rollout.

Wait for the user to confirm the PR has been **merged** and rollout has completed before proceeding to the next step.

---

## Step 9: Wait for production to deploy

Poll the production version endpoint every 30 seconds:

```bash
curl -s https://accounts.firefox.com/__version__ | jq -r .version
```

When it matches `$tag` (without the `v`), alert the user that production has deployed.

---

## Step 10: Production smoke tests

Production smoke tests should auto-run after a successful deploy. Check CircleCI for a recent `production_smoke_tests` pipeline:

```bash
curl -s -H "Circle-Token: $TOKEN" \
  "https://circleci.com/api/v2/project/github/mozilla/fxa/pipeline" | \
  jq '.items[] | select(.trigger_parameters.circleci.workflow_name? == "production_smoke_tests") | {number, state, created_at}' | head
```

If a recent pipeline appears (within the last few minutes): relay its URL to the user.

If nothing appears within ~60 seconds of the version matching, the deploy may have failed and blocked the smoke tests.

Use **AskUserQuestion**: should we run the production smoke tests manually?

Options: `yes`, `no`.

### If yes

```bash
dotenv -- yarn trigger:smoke-tests production $tag
```

Relay the CircleCI URL the script prints. Suggest the user watch it.

### If no

Tell the user the release is complete and they can run smokes later with the same command.

---

## Done

Briefly summarize what happened: tag, docker build, stage deploy, stage smokes, (and for production) prod manifest PR, prod deploy, prod smokes. One short paragraph. The user knows what they did — don't lecture them.

---

## Reminders

- **Never** run any of the yarn commands without explicit user confirmation immediately before.
- **Never** retry a failed CircleCI workflow or rerun a failed deploy on your own. Surface the failure and stop.
- **Never** edit files in this skill's flow. The only writes you make are the side effects of the yarn commands above.
- This skill is a guide, not a fix-it tool. If something goes wrong, the user owns the next decision.
