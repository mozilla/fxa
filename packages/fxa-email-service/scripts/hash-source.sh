#!/bin/bash -e

DIR=$(dirname "$0")
cd $DIR/..

git ls-files | \
# exclude version.json because it changes on every build.
# Cargo.toml serves as a signal for new releases
grep -v -e 'version\.json$' | \
sort | \
xargs cat | \
shasum -a 256 | \
cut -d " " -f 1
