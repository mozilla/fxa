/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  './intern'
], function (intern) {
  // override the main config file and adjust it to suit Sauce Labs
  intern.tunnel = 'SauceLabsTunnel';
  intern.tunnelOptions = {
    directDomains: ['latest.dev.lcip.org'],
    port: 4445,
    skipSslDomains: ['latest.dev.lcip.org']
  };
  intern.functionalSuites = [
    'tests/functional',
    'tests/functional_oauth'
  ];

  intern.environments = [
    {
      browserName: 'firefox',
      platform: 'Windows 7',
      version: '33'
    }
  ];

  return intern;
});
