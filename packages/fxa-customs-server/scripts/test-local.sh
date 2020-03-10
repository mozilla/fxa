#!/bin/bash -ex

# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.

npm run lint:eslint || exit 1
node_modules/.bin/grunt copyright || exit 1

cov=""
if test "$NO_COVERAGE" = ""; then
  cov="--coverage --cov"
fi

tap test/local test/remote $cov
