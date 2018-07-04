#!/bin/sh

# Copied from: https://github.com/kmcallister/travis-doc-upload
# License: CC0 1.0 Universal
# https://creativecommons.org/publicdomain/zero/1.0/legalcode

set -e

if [ "$TRAVIS_BRANCH" = "master" ] && [ "$TRAVIS_PULL_REQUEST" = "false" ]; then
  eval key=\$encrypted_08b3d3de2dc6_key
  eval iv=\$encrypted_08b3d3de2dc6_iv

  mkdir -p ~/.ssh
  openssl aes-256-cbc -K $key -iv $iv -in scripts/id_rsa.enc -out ~/.ssh/id_rsa -d
  chmod 600 ~/.ssh/id_rsa

  git clone --branch gh-pages git@github.com:mozilla/fxa-email-service.git docs
  cd docs
  git config user.name "fxa-devs"
  git config user.email "fxa-core@mozilla.com"
  rm -rf *
  mv ../target/doc/* .
  git add -A .
  git commit -qm "chore(docs): rebuild developer docs"
  git push -q origin gh-pages
fi
