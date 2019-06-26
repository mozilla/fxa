/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

// To be enabled via the environment of stage or prod. NEW_RELIC_HIGH_SECURITY
// and NEW_RELIC_LOG should be set in addition to NEW_RELIC_APP_NAME and
// NEW_RELIC_LICENSE_KEY.

function maybeRequireNewRelic() {
  const env = process.env;

  if (env.NEW_RELIC_APP_NAME && env.NEW_RELIC_LICENSE_KEY) {
    return require('newrelic');
  }

  return null;
}

module.exports = maybeRequireNewRelic;
