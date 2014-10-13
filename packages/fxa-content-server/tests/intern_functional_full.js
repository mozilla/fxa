/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  './intern'
], function (intern) {
  'use strict';

  intern.functionalSuites = [
    'tests/functional',
    'tests/functional_oauth'
  ];

  if (intern.fxaContentRoot.indexOf('https://') === 0) {
    // test firefox specific flows only on HTTPS
    // this might have to change if we test more browsers in the future
    // NOTE: these are disabled for now, see https://github.com/mozilla/fxa-content-server/issues/1769
    //intern.functionalSuites.push('tests/functional/firefox/functional_firefox');
  }

  return intern;
});
