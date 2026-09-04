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

## Interactive dev stack (`Dev Stack (SSH)`)

`Dev Stack (SSH)` boots the same services as the functional tests
(`packages/functional-tests/scripts/start-services.sh`, on the same
`functional-test-executor`) on a single container and holds it open. It runs no
tests. Use it to click through a branch without checking it out.

### Using it

1. On the PR, approve **Approve Dev Stack (SSH)**.
2. When the job reaches "Hold stack open", click **Rerun job with SSH**.
   CircleCI cannot enable SSH from `config.yml`, so this rerun is unavoidable —
   it rebuilds the stack (~15 min). To skip the wasted first pass, approve once
   and then always start from Rerun-with-SSH.
3. The "How to connect" step prints the `ssh -L` block. Paste in the host and
   port from the job's SSH panel and run it.
4. Open <http://localhost:3030> in your own browser.
5. `touch /tmp/release-stack` when you are done.

### Ports

Same-port forwarding is deliberate: the services advertise `localhost:<port>`
URLs in their served config, so preserving the numbers makes them work unmodified.

| Port |                          | Port        |                           |
| ---- | ------------------------ | ----------- | ------------------------- |
| 3030 | content server           | 3000        | fxa-settings (dev server) |
| 9000 | auth server              | 9001        | mail helper               |
| 1111 | profile server           | 1112        | profile static            |
| 8080 | 123done                  | 8091        | admin panel               |
| 8095 | admin server             | 6080 / 5901 | noVNC / VNC               |
| 9130 | content-server inspector | 9160        | auth-server inspector     |

Mail is captured, not delivered — sign up with an `@restmail.net` address and
read it at `http://localhost:9001/mail/<local-part>`.

### Seeing a browser

`.circleci/dev-stack-display.sh` puts Xvfb, fluxbox, x11vnc and noVNC on `:99`,
and installs `xauth` so `ssh -X` works. Three options, best first:

- Your own browser over the tunnel. Fastest, real devtools.
- VNC (`vnc://localhost:5901` or `http://localhost:6080/vnc.html`) to watch a
  headed run: `DISPLAY=:99 DEBUG=1 yarn playwright test --project=local <spec>`.
- `ssh -X` — works, but X11 over a WAN link is slow.

The tooling is installed at job time rather than baked into
`_dev/docker/ci/Dockerfile`, because a Dockerfile change forces the `-vN` bump
across every image reference plus an `update-ci-image` publish (below) — not
worth ~30s of apt.

### Access and cost

Access is not group-based: CircleCI installs only the public keys of the VCS
account that clicked Rerun-with-SSH, so exactly one person can connect.
Approving and rerunning both require write access to the project, which comes
from GitHub team membership. The container accepts no inbound connections other
than through CircleCI's SSH gateway, so a forwarded port is not a published one.

Docker `xlarge` is 20 credits/min; the default 180 minute hold is ~3,600 credits
if you let it run out. `touch /tmp/release-stack` stops the meter. Pass
`hold_minutes` to change the ceiling — CircleCI's hard job limit is 5 hours.

The stack runs `NODE_ENV=test` with the functional-test executor's environment,
so customs is off and the React / recovery-phone / passwordless flags are forced
on. It matches CI, not your local `yarn start`.

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
