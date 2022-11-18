#!/bin/bash -ex

# DIR=$(dirname "$0")
# cd "$DIR/.."


# If there is no difference in the yarn lock file, skip the install
# if cmp -s "yarn.lock" "base.yarn.lock"; then
#     print "Yarn lock up to date. Skipping base install"
# else
#     print "Updated yarn lock detected. Running yarn install!"
#     yarn install --immutable --immutable-cache
# if

yarn install --immutable

node .circleci/modules-to-test.js | tee packages/test.list

./_scripts/create-version-json.sh
