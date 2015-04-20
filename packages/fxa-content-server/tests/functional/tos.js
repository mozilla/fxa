/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'intern',
  'intern!object',
  'intern/chai!assert',
  'tests/functional/lib/helpers',
  'tests/functional/lib/test',
  'require'
], function (intern, registerSuite, assert, FunctionalHelpers, Test, require) {
  'use strict';

  var PAGE_URL = intern.config.fxaContentRoot + 'legal/terms';
  var SIGNUP_URL = intern.config.fxaContentRoot + 'signup';

  registerSuite({
    name: 'tos',

    beforeEach: function () {
      return FunctionalHelpers.clearBrowserState(this);
    },

    'start at signup': function () {

      return this.get('remote')
        .get(require.toUrl(SIGNUP_URL))
        .setFindTimeout(intern.config.pageLoadTimeout)
        .findByCssSelector('#fxa-tos')
          .click()
        .end()

        .findByCssSelector('#fxa-tos-back')
          .click()
        .end()

        // success is going back to the signup
        .findByCssSelector('#fxa-signup-header')
        .end();
    },

    'browse directly to page - no back button': function () {
      var self = this;
      return this.get('remote')

        .get(require.toUrl(PAGE_URL))
        .setFindTimeout(intern.config.pageLoadTimeout)

        .findById('fxa-tos-header')
        .end()

        .then(Test.noElementById(self, 'fxa-tos-back'));
    },

    'refresh, back button is available': function () {
      return this.get('remote')

        .get(require.toUrl(SIGNUP_URL))
        .setFindTimeout(intern.config.pageLoadTimeout)
        .findByCssSelector('#fxa-tos')
          .click()
        .end()

        .refresh()

        .findByCssSelector('#fxa-tos-back')
          .click()
        .end()

        // success is going back to the signup
        .findByCssSelector('#fxa-signup-header')
        .end();
    }
  });
});
