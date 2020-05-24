/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const { registerSuite } = intern.getInterface('object');
const FunctionalHelpers = require('./lib/helpers');
const selectors = require('./lib/selectors');

const ENTER_EMAIL_URL = intern._config.fxaContentRoot;
const TOS_URL = intern._config.fxaContentRoot + 'legal/terms';

const { click, createEmail, noSuchElement, openPage, type } = FunctionalHelpers;

registerSuite('terms of service', {
  beforeEach: function () {
    return this.remote.then(FunctionalHelpers.clearBrowserState());
  },

  tests: {
    'from signup': function () {
      return this.remote
        .then(openPage(ENTER_EMAIL_URL, selectors.ENTER_EMAIL.HEADER))
        .then(type(selectors.ENTER_EMAIL.EMAIL, createEmail()))
        .then(
          click(selectors.ENTER_EMAIL.SUBMIT, selectors.SIGNUP_PASSWORD.HEADER)
        )

        .then(click(selectors.SIGNUP_PASSWORD.TOS, selectors.TOS.HEADER))
        .then(click(selectors.TOS.LINK_BACK, selectors.SIGNUP_PASSWORD.HEADER));
    },

    'browse directly to page - no back button': function () {
      return this.remote
        .then(openPage(TOS_URL, selectors.TOS.HEADER))
        .then(noSuchElement(selectors.TOS.LINK_BACK));
    },

    'refresh, back button is available': function () {
      return (
        this.remote
          .then(openPage(ENTER_EMAIL_URL, selectors.ENTER_EMAIL.HEADER))
          .then(type(selectors.ENTER_EMAIL.EMAIL, createEmail()))
          .then(
            click(
              selectors.ENTER_EMAIL.SUBMIT,
              selectors.SIGNUP_PASSWORD.HEADER
            )
          )

          .then(click(selectors.SIGNUP_PASSWORD.TOS, selectors.TOS.HEADER))

          // wait for terms to load
          .refresh()

          .then(click(selectors.TOS.LINK_BACK, selectors.ENTER_EMAIL.HEADER))
      );
    },
  },
});
