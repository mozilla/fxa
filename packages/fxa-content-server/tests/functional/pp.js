/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'intern',
  'intern!object',
  'intern/chai!assert',
  'tests/functional/lib/helpers',
  'require'
], function (intern, registerSuite, assert, FunctionalHelpers, require) {
  'use strict';

  var PAGE_URL = intern.config.fxaContentRoot + 'signup';

  registerSuite({
    name: 'pp',

    beforeEach: function () {
      return FunctionalHelpers.clearBrowserState(this);
    },

    'start at signup': function () {

      return this.get('remote')
        .get(require.toUrl(PAGE_URL))
        .setFindTimeout(intern.config.pageLoadTimeout)
        .findById('fxa-pp')
          .click()
        .end()

        // success is going to the Privacy screen
        .findById('fxa-pp-header')
        .end()

        .findById('fxa-pp-back')
          .click()
        .end()

        // success is going back to the signup
        .findById('fxa-signup-header')
        .end();
    }
  });
});
