#!/bin/bash -ex

npx nx fxa-admin-panel:build
NODE_ENV=test npx nx fxa-admin-panel:test
