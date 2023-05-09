# \_dev

This directory contains files to support local development that aren't needed in production, especially things that would otherwise clutter up the root directory.

## docker

There are a couple different docker files for the mono repo:

    - **docker/ci** - This controls the creation of a base image used for CI pipelines. The goal of this image is to offer quick install and start up times of the fxa project.
    - **docker/ci-lockfile-generator** - This is a developer utility, and acts as mechanism / sanity check against yarn lock file mismatches. Prior to yarn 3.3.0 some systems would encounter bad hashes in yarn lock file. In case this ever resurfaces, we will leave this file here.
    - **docker/ci/mono** - This file builds a deployable version of the mono repo. It houses all available services in one image. Services can be targeted as needed.
