/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  './intern'
], function (intern) {
  'use strict';

  // override the main config file and adjust it to suit Sauce Labs
  intern.useSauceConnect = true;
  intern.webdriver.port = 4445;
  intern.functionalSuites = [ 'tests/functional', 'tests/functional_extra' ];
  intern.environments = [
    { browserName: 'firefox', version: '29', platform: 'Windows 7' }
  ];

  return intern;
});
