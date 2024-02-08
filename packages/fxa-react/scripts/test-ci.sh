#!/bin/bash -ex

CI=yes NODE_ENV=test npx yarn nx fxa-react:test
