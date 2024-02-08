#!/bin/bash -ex

npx yarn nx fxa-payments-server:build
NODE_ENV=test npx yarn nx fxa-payments-server:test
