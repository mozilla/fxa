#!/bin/bash -e

DIR=$(dirname "$0")
cd $DIR/..

git ls-files | \
# exclude these files because they change more often than we want to build.
grep -v -e '^version\.json$' -e '^CHANGELOG\.md$' -e '^Cargo\.toml$' -e '^Cargo\.lock$' | \
sort | \
xargs cat | \
# This is kind of a silly way to let dependency updates trigger a new hash without
# including the package version line, but a better way involves more parsing than
# I'd like to do at the moment. It skips the first 4 lines of Cargo.toml
cat <(tail -n +4 Cargo.toml) - | \
shasum -a 256 | \
cut -d " " -f 1
