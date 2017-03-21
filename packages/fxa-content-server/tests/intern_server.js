/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  './intern'
], function (intern) {
  intern.capabilities = {};
  intern.webdriver = {};
  intern.environments = [];
  intern.functionalSuites = [];
  intern.suites = [
    'tests/server/routes',
    'tests/server/ver.json.js',
    'tests/server/csp',
    'tests/server/flow-event',
    'tests/server/flow-metrics',
    'tests/server/frame-guard',
    'tests/server/hpkp',
    'tests/server/html-middleware',
    'tests/server/l10n',
    'tests/server/lang',
    'tests/server/metrics',
    'tests/server/metrics-collector-stderr',
    'tests/server/metrics-errors',
    'tests/server/metrics-ga',
    'tests/server/metrics-unit',
    'tests/server/noindex',
    'tests/server/configuration',
    'tests/server/statsd-collector',
    'tests/server/raven',
    'tests/server/routes/get-config',
    'tests/server/routes/get-verify-email',
    'tests/server/routes/get-fxa-client-configuration',
    'tests/server/routes/get-openid-configuration',
    'tests/server/routes/get-index',
    'tests/server/routes/post-csp',
    'tests/server/routes/post-metrics'
  ];

  return intern;
});
