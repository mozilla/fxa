#!/bin/bash -ex

yarn workspaces focus fxa-admin-panel
yarn build
yarn test
