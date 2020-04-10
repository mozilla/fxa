#!/bin/bash -e

echo "Branch: $CIRCLE_BRANCH    Pull request: $CIRCLE_PULL_REQUEST"

if [ "$CIRCLE_BRANCH" != "master" ] || [ "$CIRCLE_PULL_REQUEST" != "" ]; then
  echo "Not building docs."
  exit 0
fi

echo "Building docs."

cd packages/fxa-email-service
cargo doc --no-deps

# fxa-payments-server relies on fxa-content-server .scss styles, which in turn
# rely on some modules in package.json
cd ../../packages/fxa-content-server
npm ci

cd ../../packages/fxa-payments-server
npm ci
npm run build-storybook

cd ../..
git clone --branch gh-pages git@github.com:mozilla/fxa.git docs-build
cd docs-build
rm -rf ./*
mv ../packages/fxa-email-service/target/doc fxa-email-service
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
