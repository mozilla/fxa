/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const { registerSuite } = intern.getInterface('object');
const FunctionalHelpers = require('./lib/helpers');
var PAGE_URL = intern._config.fxaContentRoot + 'legal/privacy';
var SIGNUP_URL = intern._config.fxaContentRoot + 'signup';

var noSuchElement = FunctionalHelpers.noSuchElement;

registerSuite('pp', {
  beforeEach: function() {
    return this.remote.then(FunctionalHelpers.clearBrowserState());
  },
  tests: {
    'start at signup': function() {
      return (
        this.remote
          .get(SIGNUP_URL)
          .setFindTimeout(intern._config.pageLoadTimeout)
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
          .end()
      );
    },

    'browse directly to page - no back button': function() {
      return this.remote
        .get(PAGE_URL)
        .setFindTimeout(intern._config.pageLoadTimeout)

        .findById('fxa-pp-header')
        .end()

        .then(noSuchElement('#fxa-pp-back'));
    },

    'refresh, back button is available': function() {
      return (
        this.remote

          .get(SIGNUP_URL)
          .setFindTimeout(intern._config.pageLoadTimeout)
          .findByCssSelector('#fxa-pp')
          .click()
          .end()

          // wait for policy to load
          .findByCssSelector('#fxa-pp-back')
          .end()

          .refresh()

          .findByCssSelector('#fxa-pp-back')
          .click()
          .end()

          // success is going back to the signup
          .findByCssSelector('#fxa-signup-header')
          .end()
      );
    },
  },
});
