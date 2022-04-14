#!/bin/bash -e

yarn workspaces focus fxa-event-broker
yarn test --runInBand