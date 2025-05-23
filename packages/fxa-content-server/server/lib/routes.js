/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const {
  getServerReactRouteGroups,
} = require('./routes/react-app/route-groups-server');

module.exports = function (config, i18n, statsd, glean) {
  const redirectVersionedToUnversioned = require('./routes/redirect-versioned-to-unversioned');
  const reactRouteGroups = getServerReactRouteGroups(
    config.get('showReactApp'),
    i18n,
    config
  );

  const routes = [
    redirectVersionedToUnversioned('complete_reset_password'),
    redirectVersionedToUnversioned('reset_password'),
    redirectVersionedToUnversioned('verify_email'),
    require('./routes/get-apple-app-site-association')(),
    require('./routes/get-frontend-pairing').default(reactRouteGroups),
    require('./routes/get-frontend').default(reactRouteGroups),
    require('./routes/get-oauth-success').default(reactRouteGroups),
    require('./routes/get-terms-privacy').default(reactRouteGroups, i18n),
    require('./routes/get-update-firefox')(config),
    require('./routes/get-index').default(reactRouteGroups, config),
    require('./routes/get-ver.json'),
    require('./routes/get-client.json')(i18n),
    require('./routes/get-config')(i18n),
    require('./routes/get-fxa-client-configuration')(config),
    require('./routes/get-lbheartbeat')(),
    require('./routes/get-openid-configuration')(config),
    require('./routes/get-version.json'),
    require('./routes/get-metrics-flow')(config, glean),
    require('./routes/get-well-known-change-password')(),
    require('./routes/post-metrics')(statsd),
    require('./routes/redirect-download-firefox')(config),
    require('./routes/post-third-party-auth-redirect')(config),
    require('./routes/get-500')(config),
    require('./routes/validate-email-domain')(config),
    require('./routes/post-nimbus-experiments')(config, statsd),
  ].filter((routeDefinition) => routeDefinition); // get rid of null values

  if (config.get('csp.enabled')) {
    routes.push(
      require('./routes/post-csp')({
        op: 'server.csp',
        path: config.get('csp.reportUri'),
      })
    );
  }

  if (config.get('csp.reportOnlyEnabled')) {
    routes.push(
      require('./routes/post-csp')({
        op: 'server.csp.report-only',
        path: config.get('csp.reportOnlyUri'),
      })
    );
  }

  if (config.get('env') === 'development') {
    routes.push(require('./routes/get-502')(config));
    routes.push(require('./routes/get-503')(config));
    // Add a route in dev mode to test 500 errors
    routes.push(require('./routes/get-boom')());
    // front end mocha tests
    routes.push(require('./routes/get-test-index')(config));
    routes.push(require('./routes/get-test-style-guide')(config));
  }

  return routes;
};
