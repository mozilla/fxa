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

## Triggering manual jobs

```sh
curl -u $CIRCLECI_API_TOKEN \
     -d build_parameters[CIRCLE_JOB]=$JOB_NAME \
     https://circleci.com/api/v1.1/project/github/mozilla/fxa/tree/$GITHUB_BRANCH
```

- `$CIRCLECI_API_TOKEN` is your personal API token from https://app.circleci.com/settings/user/tokens
- `$JOB_NAME` is the job to run from config.yml, `test-content-server-remote` for example
- `$GITHUB_BRANCH` is the branch you'd like to build & deploy to docker hub (this may be `main`)

## Local Testing

With the CircleCI [CLI](https://circleci.com/docs/2.0/local-cli/)
you can run some jobs locally. Deploy jobs will fail to run.

For example, to run the `test-many` job:

```sh
circleci config process .circleci/config.yml > .circleci/local.yml
circleci local execute -c .circleci/local.yml --job test-many
```
