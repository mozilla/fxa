#!/bin/bash -ex

yarn workspaces focus fxa-metrics-processor
yarn test
