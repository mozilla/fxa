/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define(['./intern'], function(intern) {
  intern.proxyPort = 9090;
  intern.proxyUrl = 'http://localhost:9090/';

  intern.useSauceConnect = true;
  intern.maxConcurrency = 3;

  intern.tunnel = 'SauceLabsTunnel';
  intern.tunnelOptions = {
    directory: '/tmp/sc-4.4.5-linux/bin',
    executable: './sc',
  };

  intern.webdriver = {
    host: 'localhost',
    port: 4445,
  };

  intern.capabilities = {
    build: '1',
  };

  intern.environments = [
    {
      browserName: 'firefox',
      version: ['45'],
      platform: ['Windows 7', 'Linux'],
    },
    { browserName: 'firefox', version: ['56'], platform: ['Windows 7'] }, // Sauce only supports Fx 56 on Windows/Mac
    {
      browserName: 'internet explorer',
      version: ['10', '11'],
      platform: ['Windows 7'],
    },
    { browserName: 'chrome' },
  ];

  console.log('SAUCE', intern.proxyUrl);

  return intern;
});
