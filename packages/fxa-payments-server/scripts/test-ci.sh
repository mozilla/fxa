#!/bin/bash -ex

yarn workspaces focus fxa-payments-server
yarn build
NODE_ENV=test yarn test
