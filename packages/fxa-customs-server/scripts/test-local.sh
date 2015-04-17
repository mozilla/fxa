#!/bin/sh

# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.

node_modules/.bin/grunt lint copyright || exit 1
node scripts/tap-coverage.js test/local test/remote || exit 1
