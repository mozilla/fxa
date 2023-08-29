#!/bin/bash -ex

npx nx fxa-payments-server:build
NODE_ENV=test npx nx fxa-payments-server:test
