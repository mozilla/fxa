/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  './intern'
], function (intern) {
  intern.functionalSuites = [
    'tests/functional/mocha',
    // a few basic functional tests
    'tests/functional/confirm',
    'tests/functional/reset_password',
    'tests/functional/sign_in',
    'tests/functional/sign_up',
    'tests/functional/settings',
    'tests/functional/verification_experiments'
  ];

  intern.environments = [
    { browserName: 'firefox' }
  ];

  return intern;
});
