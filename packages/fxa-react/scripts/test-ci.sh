#!/bin/bash -ex

CI=yes NODE_ENV=test npx nx fxa-react:test
