#!/bin/bash -ex

yarn workspaces focus fxa-payments-server
yarn build
yarn test
