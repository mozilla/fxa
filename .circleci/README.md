# CircleCI

`config.yml` defines the jobs and workflows of our CircleCI deployment.

## Scripts

This directory contains scripts used by `config.yml` to run jobs. More
general scripts should be located in `../_scripts` or in individual
package directories.

## Conventions

### Tests

Packages are tested with `./test-package.sh`. The default action is to run:

```sh
yarn install
yarn test
```

Packages may define a `scripts/test-ci.sh` as a custom test script.

### Builds

By default packages are built using docker. The standard `Dockerfile`
is the preferred method. Packages may define a `scripts/build-ci.sh`
as a custom build script.

### Deploys

Packages that create docker images are deployed to docker hub.

New packages require username and password environment variables
in CircleCI [project settings](https://ui.circleci.com/settings/project/github/mozilla/fxa/environment-variables) in order to
deploy.

## Triggering Workflows

Previously we would trigger jobs directly, but we now trigger workflows instead. To see how workflows are triggered
remotely, checkout: https://github.com/mozilla-services/cloudops-deployment/blob/master/projects/fxa/smoke-tests/smoketests.py

## Local Testing

With the CircleCI [CLI](https://circleci.com/docs/2.0/local-cli/)
you can run some jobs locally. Deploy jobs will fail to run.

For example, to run the `test-many` job:

```sh
circleci config process .circleci/config.yml > .circleci/local.yml
circleci local execute -c .circleci/local.yml --job test-many
```

## Interactive PR stack (`yarn pr-debug`)

`yarn pr-debug [--tunnel | --ssh] [pr-number | branch]` boots the
dev stack for a branch in CircleCI and lets you reach it from your
machine. Use it as an ephemeral environment to try a branch without checking
it out, or to keep several PR stacks up and hop between them. Claude
will also find clever ways to leverage this as well.

| Command                  | What it does                                                                                                                                        |
| ------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| `yarn pr-debug`          | Boots the stack and returns once it is up. Reports the job if one is already running for the commit.                                                |
| `yarn pr-debug --tunnel` | Forwards the service ports to `localhost` and holds them until Ctrl-C. Closes any tunnel a previous run opened, so switching stacks is one command. |
| `yarn pr-debug --ssh`    | Opens a shell in `~/project`. Binds no ports, so it sits beside a tunnel (`yarn pm2 log`), and connects even if a CI step failed.                   |

All three default to the current branch. Needs `CIRCLECI_TOKEN` (a personal
token — project tokens cannot trigger pipelines), `jq` and `nc`; `gh` only
when passing a PR number. `--tunnel` runs ssh non-interactively, so the key
registered with your GitHub account must be in `ssh-agent`.

Switching between two PRs looks like this:

```sh
yarn pr-debug 1234            # boot PR 1234's stack, ~7 minutes cold
yarn pr-debug 5678            # boot PR 5678's stack
yarn pr-debug --tunnel 1234   # localhost:3030 is PR 1234
yarn pr-debug --tunnel 5678   # drops the first tunnel; localhost:3030 is PR 5678
```

The `/fxa-pr-debug` Claude skill wraps the boot and tunnel: it tells you when
the stack is up, and can write and run a throwaway Playwright test from a
description.

Under the hood (`_scripts/pr-debug.sh`), the boot:

1. Triggers the `stack` workflow: one `Stack (SSH)` job that installs, builds
   and starts the stack against the `functional-test-executor`'s service
   containers. It runs only when the `run_stack` pipeline parameter is set, so
   ordinary pipelines never see it.
2. Cancels that run as soon as the job starts and reruns it with SSH enabled.
   CircleCI cannot enable SSH from config and only enables it on the rerun of a
   finished workflow, so the throwaway first pass is the price of scripting
   this. A run already made for the same commit is reused instead.
3. Waits for `Start services` and prints the connect commands.

`--tunnel` and `--ssh` look up the newest running SSH job on the branch (any
commit, with a warning if origin has moved on), pin the host key CircleCI
reports for it, and run `ssh` with the forwards or a shell. In that shell you
will mostly want pm2 logs, e.g. `yarn pm2 log inbox` tails the mail helper,
which is the quickest way to grab a signup or reset code.

A cold boot takes about seven minutes: about two for the throwaway first pass
(container spin-up, then the cancel) and five for the SSH job. Reusing a run for
the same commit skips the first pass.

### Lifetime

After it boots, the job holds the stack up for 30 minutes whether or not anyone
is connected (`PR_DEBUG_MINUTES` at boot time changes it; it is passed as the
`stack_minutes` pipeline parameter). That is what lets several stacks sit side
by side. Once the hold ends, CircleCI's rules apply: the job stays up while an
SSH session is open and shuts down about ten minutes after the last one
closes, two hours per job at most. Tunnel and shell sessions are capped at the
same number of minutes; rerun the command to reconnect. To release a stack
early, cancel the job from its CircleCI page.

### Using the stack

Open <http://localhost:3030>. Ports are forwarded same-number because the
services advertise `localhost:<port>` URLs: 3030 content, 3000 fxa-settings
(dev server, hot-rebuilds), 9000 auth, 9001 mail helper, 1111/1112 profile,
8080 123done, 8091/8095 admin panel/server, 9130/9160 node inspectors.

Sign up with an `@restmail.net` address and read the mail at
`http://localhost:9001/mail/<local-part>`; the request blocks until mail
arrives. The stack runs `NODE_ENV=test` with the executor's forced feature
flags and customs disabled, so it matches CI, not `yarn start`.

### Access and exposure

Triggering, canceling and rerunning need project write access (GitHub team
membership), and the rerun installs only the token owner's VCS keys, so the
person who booted the stack is the one who can connect. The container has no
inbound ports other than CircleCI's SSH gateway, so a forwarded port is not a
published one. Fork authors have no write access and the workflow never runs
unless explicitly triggered.

The shell inherits the project's env vars, which is where this repo keeps its CI
secrets. A write-access user could read those from any `run:` step already, but
an SSH session leaves no diff, so treat it as the less auditable path. Step
output is public and the executor logs at debug level: use throwaway identities
only, never real accounts or stage/production credentials, and never echo `env`.
pm2 logs are deliberately not stored as artifacts for the same reason.

Docker `xlarge` bills 20 credits/min while the job is up: the boot, the hold,
and up to ten minutes after the last session closes. A stack left to its
default hold costs roughly 800 credits.

The job pins `mozilla/fxa-circleci:ci-builder-vN` (it needs the baked-in
`node_modules` and `yarn.lock.base`), so bump it with the other `-vN`
references (below).

## Updating the CI images (Playwright / dependency bumps)

Most jobs run in pre-built images published to Docker Hub as
`mozilla/fxa-circleci:ci-<target>-vN` (`ci-builder`, `ci-test-runner`,
`ci-functional-test-runner`). They are defined in
[`../_dev/docker/ci/Dockerfile`](../_dev/docker/ci/Dockerfile) and built/pushed
by the `deploy_ci_images` workflow (`deploy-fxa-ci-images` job →
`create-fxa-ci-images`).

The functional-test image bakes the Playwright browsers at build time in the
`playwright-install` stage (`npx playwright install firefox chromium webkit`),
so the browser versions are pinned to whatever `@playwright/test` resolves to in
`yarn.lock` **when the image was built**. Bumping Playwright therefore needs a
new image — otherwise functional tests fail at launch with
`Executable doesn't exist at .../firefox-<n>`.

### When the images rebuild

`rebuild-check` (in `config.yml`) rebuilds when either the pipeline parameter
`force-deploy-fxa-ci-images` is `true`, or the last commit changed `yarn.lock`
(`git diff HEAD~1 HEAD -- yarn.lock`). The `deploy_ci_images` workflow only runs
on the `main` and `update-ci-image` branches, plus nightly. The project builds
pull requests, not arbitrary branch pushes, so pushing `update-ci-image` by
itself does **not** start a build — trigger it explicitly (below).

### The `-vN` tag

Every image reference in `config.yml` shares one version suffix (`-vN`). Bump it
on **all** references (the `image:` lines, the build `-t` line, and the
`docker push` lines) when an image change must not affect in-flight branches —
e.g. a Playwright upgrade that needs different browsers, or a base-image change
(the Node 24 upgrade introduced `-v9`). Other branches keep the old tag until
they adopt the bump; merging to `main` makes it the default.

### Steps to ship a new image (e.g. a Playwright upgrade)

1. Bump `@playwright/test` in `packages/functional-tests/package.json` and run
   `yarn install` so `yarn.lock` updates.
2. Bump every `-vN` reference in `config.yml` to `-v(N+1)`.
3. Publish the new image **before** your PR's functional tests run, by pushing
   the branch content to `update-ci-image` and triggering a pipeline for it (via
   the CircleCI UI/API with `force-deploy-fxa-ci-images=true`). The
   `create-fxa-ci-images` job rebuilds all three targets — re-running
   `npx playwright install` for the new browsers — and pushes the `-v(N+1)` tags.
4. Re-run your PR's functional tests; they now pull the new image.
5. Once the new tag is published, the `update-ci-image` branch can be deleted.
