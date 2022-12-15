#!/bin/bash -ex

yarn workspaces focus fxa-admin-panel
yarn build
NODE_ENV=test yarn test
