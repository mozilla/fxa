#!/bin/bash -ex

DIR=$(dirname "$0")
cd "$DIR/.."

for d in ./packages/*/ ; do
  (cd "$d" && mkdir -p config && cp ../version.json . && cp ../version.json config)
done

# `npx yarn` because `npm i -g yarn` needs sudo
npx yarn install
SKIP_PREFLIGHT_CHECK=true npx yarn workspaces foreach --topological-dev --verbose run build
rm -rf node_modules
rm -rf packages/*/node_modules
npx yarn workspaces focus --production \
  123done \
  browserid-verifier \
  fxa-admin-panel \
  fxa-admin-server \
  fxa-auth-db-mysql \
  fxa-auth-server \
  fxa-content-server \
  fxa-customs-server \
  fxa-event-broker \
  fxa-geodb \
  fxa-graphql-api \
  fxa-js-client \
  fxa-metrics-processor \
  fxa-payments-server \
  fxa-profile-server \
  fxa-react \
  fxa-settings \
  fxa-shared \
  fxa-support-panel
npx yarn cache clean --all
rm -rf artifacts
