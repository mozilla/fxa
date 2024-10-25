#!/bin/bash -ex

# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.
tsc --build && tsc-alias
tap dist/packages/fxa-customs-server/test/local dist/packages/fxa-customs-server/test/remote --no-coverage --jobs=1
