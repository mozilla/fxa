#!/bin/bash -ex

yarn workspaces focus fxa-settings
PUBLIC_URL=/ INLINE_RUNTIME_CHUNK=false CI=false SKIP_PREFLIGHT_CHECK=true yarn build
CI=yes SKIP_PREFLIGHT_CHECK=true yarn test
