#!/bin/bash -ex

npx yarn nx fxa-admin-panel:build
NODE_ENV=test npx yarn nx fxa-admin-panel:test
