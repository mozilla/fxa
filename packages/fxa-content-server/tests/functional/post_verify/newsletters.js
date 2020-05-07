/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const { registerSuite } = intern.getInterface('object');
const FunctionalHelpers = require('./../lib/helpers');
const selectors = require('./../lib/selectors');
const config = intern._config;

const ENTER_EMAIL_URL = config.fxaContentRoot;
const Newsletters =
  config.fxaContentRoot + 'post_verify/newsletters/add_newsletters';

const PASSWORD = 'password1234567';
let email;

const {
  clearBrowserState,
  click,
  createEmail,
  createUser,
  fillOutEmailFirstSignIn,
  openPage,
  testElementExists,
  testElementTextInclude,
} = FunctionalHelpers;

registerSuite('post_verify_newsletters', {
  beforeEach: function() {
    email = createEmail();

    return this.remote
      .then(clearBrowserState({ force: true }))
      .then(createUser(email, PASSWORD, { preVerified: true }));
  },

  tests: {
    'subscribe to newsletters': function() {
      return this.remote
        .then(openPage(ENTER_EMAIL_URL, selectors.ENTER_EMAIL.HEADER))
        .then(fillOutEmailFirstSignIn(email, PASSWORD))
        .then(testElementExists(selectors.SETTINGS.HEADER))

        .then(
          openPage(Newsletters, selectors.POST_VERIFY_ADD_NEWSLETTERS.HEADER, {
            query: {
              forceExperiment: 'newsletterSync',
              forceExperimentGroup: 'trailhead-copy',
            },
          })
        )

        .then(
          click(selectors.POST_VERIFY_ADD_NEWSLETTERS.NEWSLETTERS.ONLINE_SAFETY)
        )
        .then(
          click(
            selectors.POST_VERIFY_ADD_NEWSLETTERS.NEWSLETTERS.HEALTHY_INTERNET
          )
        )

        .then(
          testElementTextInclude(
            selectors.POST_VERIFY_ADD_NEWSLETTERS.SUBMIT,
            email
          )
        )
        .then(
          testElementTextInclude(
            selectors.POST_VERIFY_ADD_NEWSLETTERS.DESCRIPTION,
            'Practical knowledge is coming to your inbox'
          )
        )

        .then(click(selectors.POST_VERIFY_ADD_NEWSLETTERS.SUBMIT))

        .then(testElementExists(selectors.SETTINGS.HEADER));
    },

    'treatment new copy': function() {
      return this.remote
        .then(openPage(ENTER_EMAIL_URL, selectors.ENTER_EMAIL.HEADER))
        .then(fillOutEmailFirstSignIn(email, PASSWORD))
        .then(testElementExists(selectors.SETTINGS.HEADER))

        .then(
          openPage(Newsletters, selectors.POST_VERIFY_ADD_NEWSLETTERS.HEADER, {
            query: {
              forceExperiment: 'newsletterSync',
              forceExperimentGroup: 'new-copy',
            },
          })
        )

        .then(
          testElementTextInclude(
            selectors.POST_VERIFY_ADD_NEWSLETTERS.DESCRIPTION,
            'Get practical knowledge in your inbox about'
          )
        );
    },
  },
});
