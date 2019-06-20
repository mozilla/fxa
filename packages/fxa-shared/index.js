/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

'use strict';

module.exports = {
  email: {
    popularDomains: require('./email/popularDomains'),
  },
  l10n: {
    localizeTimestamp: require('./l10n/localizeTimestamp'),
    supportedLanguages: require('./l10n/supportedLanguages'),
  },
  metrics: {
    amplitude: require('./metrics/amplitude'),
  },
  oauth: {
    scopes: require('./oauth/scopes'),
  },
  promise: require('./promise'),
  redis: require('./redis'),
};
