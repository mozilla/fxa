/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const { registerSuite } = intern.getInterface('object');
const FunctionalHelpers = require('./lib/helpers');
var PAGE_URL = intern._config.fxaContentRoot + 'legal/terms';
var SIGNUP_URL = intern._config.fxaContentRoot + 'signup';

var noSuchElement = FunctionalHelpers.noSuchElement;

registerSuite('tos', {
  beforeEach: function() {
    return this.remote.then(FunctionalHelpers.clearBrowserState());
  },
  tests: {
    'start at signup': function() {
      return (
        this.remote
          .get(SIGNUP_URL)
          .setFindTimeout(intern._config.pageLoadTimeout)
          .findByCssSelector('#fxa-tos')
          .click()
          .end()

          .findByCssSelector('#fxa-tos-back')
          .click()
          .end()

          // success is going back to the signup
          .findByCssSelector('#fxa-signup-header')
          .end()
      );
    },

    'browse directly to page - no back button': function() {
      return this.remote

        .get(PAGE_URL)
        .setFindTimeout(intern._config.pageLoadTimeout)

        .findById('fxa-tos-header')
        .end()

        .then(noSuchElement('#fxa-tos-back'));
    },

    'refresh, back button is available': function() {
      return (
        this.remote

          .get(SIGNUP_URL)
          .setFindTimeout(intern._config.pageLoadTimeout)
          .findByCssSelector('#fxa-tos')
          .click()
          .end()

          // wait for terms to load
          .findByCssSelector('#fxa-tos-back')
          .end()

          .refresh()

          .findByCssSelector('#fxa-tos-back')
          .click()
          .end()

          // success is going back to the signup
          .findByCssSelector('#fxa-signup-header')
          .end()
      );
    },
  },
});
