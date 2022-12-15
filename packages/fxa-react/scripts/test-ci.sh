#!/bin/bash -ex

yarn workspaces focus fxa-react
CI=yes NODE_ENV=test yarn test
