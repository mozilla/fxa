#!/bin/bash -ex

# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.

echo 'Testing with Memcache database'
tap test/local test/remote test/scripts --no-coverage --jobs=1

echo 'Testing with Redis database'
CUSTOMS_REDIS_ENABLED=true tap test/local test/remote test/scripts --no-coverage --jobs=1
