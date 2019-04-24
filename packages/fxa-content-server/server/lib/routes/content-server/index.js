/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

module.exports = (config, i18n) => {
  const redirectVersionedToUnversioned = require('./redirect-versioned-to-unversioned');

  const routes = [
    redirectVersionedToUnversioned('complete_reset_password'),
    redirectVersionedToUnversioned('reset_password'),
    redirectVersionedToUnversioned('verify_email'),
    require('./get-apple-app-site-association')(),
    require('./get-frontend-pairing')(),
    require('./get-frontend')(),
    require('./get-oauth-success'),
    require('./get-terms-privacy')(i18n),
    require('./get-update-firefox')(config),
    require('./get-index')(config),
    require('./get-ver.json'),
    require('./get-client.json')(i18n),
    require('./get-config')(i18n),
    require('./get-fxa-client-configuration')(config),
    require('./get-openid-configuration')(config),
    require('./get-version.json'),
    require('./get-metrics-flow')(config),
    require('./get-well-known-change-password')(),
    require('./redirect-complete-to-verified')(),
    require('./redirect-download-firefox')(config),
    require('./redirect-m-to-adjust')(config),
  ];

  if (config.get('env') === 'development') {
    routes.push(require('./get-test-index')(config));
    routes.push(require('./get-test-style-guide')(config));
  }

  return routes;
};
