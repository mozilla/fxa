/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define(['./intern'], function(intern) {
  intern.proxyPort = 9090;
  intern.proxyUrl = 'http://localhost:9090/';

  intern.useSauceConnect = false;

  intern.webdriver = {
    host: 'localhost',
    port: 4444,
  };

  intern.capabilities = {
    'selenium-version': '2.39.0',
  };

  intern.environments = [{ browserName: 'firefox', version: '25' }];

  return intern;
});
