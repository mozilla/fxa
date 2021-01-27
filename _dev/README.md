# \_dev

This directory contains files to support local development that aren't needed in production, especially things that would otherwise clutter up the root directory.

## Build-Time Environment Variables (Docker)

By default, only environment variables explicitly declared inside the respective
`Dockerfile` are visible during the build process of a Docker image. However,
it is sometimes needed to customize how certain tools do their job within that
process. For this reason, the developer can opt to provide additional
environment variables using a Shell file at `_dev/local-build-env.sh`.

This file - if available (ignored by Git, so be careful with `git clean -x`) -
will be sourced by the actual build script [`_scripts/base-docker.sh`](../_scripts/base-docker.sh)
and thus allows to use any Shell code to also do other customizations, although
it is expected to define variables only (and may use functions to generate the
value).

The following is an example of such a file to set a proxy for downloading
dependencies by NPM or YARN:

```bash
npm_config_http_proxy="https://npm-proxy.mycorp.localdomain:9876"
npm_config_https_proxy="${npm_config_https_proxy}"

yarn_http_proxy="${npm_config_https_proxy}"
yarn_https_proxy="${npm_config_https_proxy}"
```

_Please note that the execution context of this script is also inside the
Docker build environment, so it will be limited to the commands that the Docker
base image provides or that have been installed before (see
[`_dev/docker/builder/Dockerfile`](docker/builder/Dockerfile))._
