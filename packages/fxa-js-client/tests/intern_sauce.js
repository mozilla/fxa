/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  './intern'
], function (intern) {
  intern.proxyPort = 9090;
  intern.proxyUrl = 'http://localhost:9090/';

  intern.useSauceConnect = true;
  intern.maxConcurrency = 3;

  intern.webdriver =  {
    host: 'localhost',
    port: 4445
  };

  intern.capabilities = {
    'build': '1',
    'selenium-version': '2.37.0'
  };

  intern.environments = [
    { browserName: 'firefox', version: '25' , platform: [ 'Windows 7', 'Linux' ] },
    { browserName: 'internet explorer', version: '10', platform: [ 'Windows 7' ] }
  ];

  console.log("SAUCE", intern.proxyUrl);

  return intern;
});
