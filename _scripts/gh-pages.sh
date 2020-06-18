#!/bin/bash -e

echo "Branch: $CIRCLE_BRANCH    Pull request: $CIRCLE_PULL_REQUEST"

if [ "$CIRCLE_BRANCH" != "main" ] || [ "$CIRCLE_PULL_REQUEST" != "" ]; then
  echo "Not building docs."
  exit 0
fi

echo "Building docs."

cd packages/fxa-email-service
cargo doc --no-deps

cd ../../packages/fxa-payments-server
yarn workspaces focus fxa-payments-server
npm run build-storybook

cd ../..
git clone --branch gh-pages git@github.com:mozilla/fxa.git docs-build

cd docs-build

rm -rf ./fxa-email-service
mv ../packages/fxa-email-service/target/doc fxa-email-service

rm -rf ./fxa-payments-server
mv ../packages/fxa-payments-server/storybook-static fxa-payments-server

CHANGES=$(git status --porcelain)

if [ "$CHANGES" = "" ]; then
  echo "Docs are unchanged, not deploying to GitHub Pages."
  exit 0
fi

echo "Deploying docs to GitHub Pages."

git config user.name "fxa-devs"
git config user.email "fxa-core@mozilla.com"
git add -A .
git commit -qm "chore(docs): rebuild docs [skip ci]"
git push -q origin gh-pages
