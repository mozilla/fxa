#!/bin/bash -ex

yarn workspaces focus fxa-react
CI=yes yarn test
