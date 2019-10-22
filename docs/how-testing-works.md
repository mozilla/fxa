# Firefox Accounts Testing

Last Updated: 2019-10-22

## Overview

Firefox Accounts (FxA) is a complex project consisting of many packages implementing microservices or code shared between these services. Each of these packages has its own local suite of unit and integration tests. A few packages host test suites that exercise the functionality of several interdependent services working together.

This document aims to describe how these tests are structured, when and how they are run, and some tips and gotchas along the way.

## Where are tests run?

### CircleCI

CircleCI is a service that automatically runs FxA tests in parallel jobs for every Pull Request and merge to `master` branch on GitHub. Scripts and configuration for CircleCI mostly lives in the `.circleci` directory.

The file `.circleci/config.yml` contains general configuration, job definitions, and workflows orchestrating all the jobs.

#### Important scripts

##### .circleci/modules-to-test.js

Running all tests across all modules / packages in FxA can be time-comsuming. Time can be saved by skipping tests that we know are unrelated to changes in some given commit. Applying that logic, this script outputs a name of individual packages that should be tested - or `all` if it decides that everything needs to be run.

For master branch and other non-PR commits, the output is always `all`.

For pull requests, the script fetches and parses the diff for the current PR. The URL for the diff is constructed from CircleCI env vars.

If there's an error while fetching or parsing the diff, `all` is output. Otherwise, the script checks the path of each file changed to build a list of modules for testing.

Some modules depend on other modules. Within `package.json` at the root of the FxA project, there is an `fxa.moduleDependencies` object. This maps named modules to their dependencies.

If the diff contains changes to any of the dependencies, the dependent module is also added to the list. So, for example, `fxa-content-server` lists `fxa-auth-server` as a dependency. Thus, a change to `fxa-auth-server` causes `fxa-content-server` to be automatically included in the list.

```json
"fxa": {
  "moduleDependencies": {
    "fxa-content-server": [
      "fxa-auth-server"
    ]
  }
}
```

Finally, the list is output to the stdout, one module per line for each in need of testing.

##### .circleci/build-test-deploy.sh {TEST_SCRIPT_NAME}

Runs `build.sh`, `test.sh`, and `deploy.sh` for a given package - deriving the package name from the current working directory. Passes along the first parameter as the second parameter in `test.sh`.

##### .circleci/build.sh {MODULE}

Common build script for most modules.

Logic for running or skipping build for a given module is implemented here: `packages/test.list` is expected to contain a list output from `modules-to-test.js` - if the current module's name is missing and the list isn't `all`, this script will exit immediately.

Parameters are just `$1` for the name of the module being tested.

The file `packages/version.json` is expected to have been generated earlier - i.e. from the `install` job in CircleCI. This file is copied into the package.

For modules where `Dockerfile` is present, a container tagged `{MODULE}:build` is built from `Dockerfile`.

For modules where `Dockerfile-build` is present, the container is built from that file instead.

There are exceptions for `fxa-auth-server`, `fxa-content-server`, and `fxa-payments-server`: For each of these modules, the Docker build is performed in the `packages` parent directory. This is because each of these modules depends on files from other packages (e.g. `fxa-shared`) and Docker will not allow `../` path references outside the base directory for the container build.

The module `fxa-oauth-server` also has some exceptions: Because its source resides within the `fxa-auth-server` package, it has a special case `Dockerfile-oauth-build` file and uses the `packages` directory as its base in order to access cross-package dependencies.

Finally, `fxa-auth-server` executes `_scripts/clone-authdb.sh` in order to set up the correct database interface for the server. (TKTK?)

##### .circleci/test.sh {MODULE} {TEST_SCRIPT_NAME}

Common script that runs tests for most modules.

Parameters are `$1` the name of the module being tested and `$2` the name of an npm script that executes tests (defaults to `test` if omitted).

Logic for running or skipping tests for a given module is implemented here: `packages/test.list` is expected to contain a list output from `modules-to-test.js` - if the current module's name is missing and the list isn't `all`, this script will exit immediately.

For most modules: if `Dockerfile-test` is present, it's used to build a Docker container.

The container is tagged `${MODULE}:test`, where `MODULE` is named in the first parameter of the script. Then, `npm run test` is run within the container - the name of the npm script can be customized with the second parameter of `test.sh`.

If `eslint` or `tslint` is present in the module's `package.json`, then `npm run lint` is also run in the container. If there's a `Gruntfile.js` that contains `eslint`, then `grunt eslint` will be run in the container.

**Note**, the module `fxa-oauth-server` has exceptions: The container is built from `fxa-auth-server/Dockerfile-oauth-test` and `npm run test-oauth` is run within the container.

##### .circleci/deploy.sh {MODULE}

Common script for deploying the Docker container built from an FxA package to Docker Hub.

The basic gist of this script is that it takes a `{MODULE}:build` container - e.g. as created via `build.sh` - and re-tags it as appropriate for the current CI run before pushing it to Docker Hub.

These images are deployed to Mozilla's Docker Hub account. So, for example, many modules can be found with a search for [`mozilla/fxa-`](https://hub.docker.com/search?q=mozilla%2Ffxa-&type=image). Also look for images such as [`mozilla/123done`](https://hub.docker.com/r/mozilla/123done) and [`mozilla/browserid-verifier`](https://hub.docker.com/r/mozilla/browserid-verifier), which are listed under `packages` but do not follow the `fxa-*` naming convention.

The rest of the tag name depends on a few other conditions:

If the build is on `master` branch, then the tag will be `{MODULE}:latest`.

If a build is tagged in Git, then that Git tag is used - i.e. `{MODULE}:{GIT_TAG_NAME}`.

If a build is on a branch with a name prefixed with `feature` or `dockerpush`, that branch name will be used in the tag - i.e. `{MODULE}:{GIT_BRANCH_NAME}`.

It's also possible to supply `$MODULE_SUFFIX` env var tweak the Docker Hub repo name - i.e. `mozilla/$MODULE-$MODULE_SUFFIX`.

Untagged commits or commits on branches that do fall into one of the above cases do not result in a container deployed to Docker Hub.

Logic for running or skipping deployment for a given module is also implemented here: `packages/test.list` is expected to contain a list output from `modules-to-test.js` - if the current module's name is missing and the list isn't `all`, this script will exit immediately.

##### .circleci/tag.sh

(TKTK why is this a special case for `fxa-email-service`?)

Used solely by `fxa-email-service` as a custom version of `build.sh` and `deploy.sh`:

- Builds a Docker container using `Dockerfile-tag` tagged `${MODULE}:latest`
- Re-tags the Docker container using basically the same logic as `deploy.sh` and pushes to Docker Hub

#### Jobs

Jobs are the individual build tasks performed by CircleCI. They're orchestrated in **workflows** (described later), where they can be run in parallel and/or made dependent on each other. The results of one job can also feed into another.

##### install

Common installation and setup for all other jobs.

Checks out the project code. Runs `npm ci` in the root of the project. Creates `packages/version.json` based on CircleCI env vars to describe the hash, version, source, and build URL of the current run.

Also runs `.circleci/modules-to-test.js` and outputs to `packages/test.list` as a selection of which packages' tests should be run.

##### build-module

Common build task used by many modules.

Used by:

- 123done
- fortress
- browserid-verifier
- fxa-auth-db-mysql
- fxa-auth-server
- fxa-customs-server
- fxa-event-broker
- fxa-payments-server
- fxa-profile-server
- fxa-support-panel
- fxa-circleci

##### deploy-module

TKTK

##### fxa-oauth-server

TKTK

##### fxa-content-server

TKTK

##### build-and-deploy-content-server

TKTK

##### fxa-shared

TKTK

##### js-client

TKTK

##### fxa-email-event-proxy

TKTK

##### fxa-email-event-proxy-tag

TKTK

##### fxa-email-service

TKTK

##### fxa-email-service-tag

TKTK

##### docs

TKTK

#### Workflows

##### test

##### deploy-tag

### TeamCity

TBD: what's TeamCity? who administers it? when does it run tests? what tests does it run?

### Locally

## What are the tests?

### 123done

### fxa-auth-db-mysql

### fxa-auth-server

### fxa-content-server

### fxa-payments-server
