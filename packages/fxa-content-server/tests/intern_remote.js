/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  './intern'
], function (intern) {
  'use strict';

  // simply override the main config file and adjust it to suite the local env

  // disable Sauce Connect for local config
  intern.useSauceConnect = true;

  // adjust the local Selenium port
  intern.webdriver.port = 4445;
  intern.functionalSuites = [ 'tests/functional' ];

  intern.environments = [
    { browserName: 'firefox', version: '23', platform: [ 'Linux', 'Windows 7' ] }
  ];

  return intern;
});
