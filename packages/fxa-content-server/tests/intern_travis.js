/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  './intern'
], function (intern) {
  'use strict';

  // override the main config file and adjust it to suit Sauce Labs
  intern.useSauceConnect = false;
  intern.webdriver.port = 4444;
  intern.functionalSuites = [
    'tests/functional/mocha',
    // a few basic functional tests
    'tests/functional/confirm',
    'tests/functional/reset_password',
    'tests/functional/sign_in',
    'tests/functional/sign_up',
    'tests/functional/settings'
  ];

  intern.environments = [
    { browserName: 'firefox' }
  ];

  return intern;
});
