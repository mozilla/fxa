# CircleCI

`config.yml` defines the jobs and workflows of our CircleCI deployment.

## Special Cases

`fxa-email-service` and `fxa-circleci` aren't tested for most PRs because
they don't change often and are relatively resource intensive. In order to
trigger these tests the PR branch should be prefixed with `email-service-`
or `fxa-circleci-`. PRs that change those packages on other branches
will (intentionally) fail.

## Scripts

This directory contains scripts used by `config.yml` to run jobs. More
general scripts should be located in `../_scripts` or in individual
package directories.

## Conventions

### Tests

Packages are tested with `./test-package.sh`. The default action is to run:

```sh
npm ci
npm test
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

## Local Testing

With the CircleCI [CLI](https://circleci.com/docs/2.0/local-cli/)
you can run some jobs locally. Deploy jobs will fail to run.

For example, to run the `test-many` job:

```sh
circleci config process .circleci/config.yml > .circleci/local.yml
circleci local execute -c .circleci/local.yml --job test-many
```
