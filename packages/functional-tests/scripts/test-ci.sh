#!/bin/bash -ex

DIR=$(dirname "$0")

cd "$DIR/../../../"

circleci tests glob "packages/functional-tests/tests/**/*.spec.ts" | circleci tests split --split-by=timings > tests-to-run.txt
yarn workspace functional-tests test $(cat tests-to-run.txt|awk -F"/" '{ print $NF }')
