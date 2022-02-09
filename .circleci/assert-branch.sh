#!/bin/bash -e

DIR=$(dirname "$0")
cd "$DIR"

if [[ $CIRCLE_BRANCH =~ ^train-.* ]]; then
  # train PRs should be excluded from this check
  echo "Train branch, skipping package check"
  exit 0
fi
