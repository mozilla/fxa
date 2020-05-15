#!/bin/bash -ex

yarn workspaces focus fxa-auth-server
yarn workspace fxa-shared run build
yarn run test-ci
