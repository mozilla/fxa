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
    'tests/server/cookies_disabled',
    'tests/server/l10n',
    'tests/server/lang',
    'tests/server/metrics',
    'tests/server/metrics-collector-stderr',
    'tests/server/metrics-errors',
    'tests/server/metrics-ga',
    'tests/server/configuration',
    'tests/server/statsd-collector'
  ];

  return intern;
});
