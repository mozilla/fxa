#!/bin/bash -ex

# yarn workspaces focus fxa-payments-server

# payments-server has some missing dependency that
# causes tests to fail when only it's deps are installed
# but passes when all fxa deps are installed
yarn install
yarn build
yarn test
