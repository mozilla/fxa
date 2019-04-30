/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const {registerSuite} = intern.getInterface('object');
const TestHelpers = require('../lib/helpers');
const FunctionalHelpers = require('./lib/helpers');
const UA_STRINGS = require('./lib/ua-strings');
const selectors = require('./lib/selectors');

const config = intern._config;

const SIGNUP_FENNEC_URL = `${config.fxaContentRoot}signup?context=fx_fennec_v1&service=sync`;
const SIGNUP_DESKTOP_URL = `${config.fxaContentRoot}signup?context=fx_desktop_v3&service=sync`;
const CHANNEL_COMMAND_CAN_LINK_ACCOUNT = 'fxaccounts:can_link_account';

const {
  clearBrowserState,
  click,
  fillOutSignUp,
  openPage,
  openVerificationLinkInSameTab,
  respondToWebChannelMessage,
  testElementExists,
} = FunctionalHelpers;

let email;
const PASSWORD = '12345678';

registerSuite('connect_another_service', {
  beforeEach: function () {
    email = TestHelpers.createEmail('sync{id}');

    return this.remote.then(clearBrowserState());
  },
  tests: {

    'signup Fx Desktop, verify in Fennec': function () {
      // should navigate to signin and have the email prefilled
      return this.remote
        .then(openPage(SIGNUP_DESKTOP_URL, selectors.SIGNUP.HEADER, {
          forceUA: UA_STRINGS['desktop_firefox'],
        }))
        .then(respondToWebChannelMessage(CHANNEL_COMMAND_CAN_LINK_ACCOUNT, {ok: true}))
        // this tests needs to signup so that we can check if the email gets prefilled
        .then(fillOutSignUp(email, PASSWORD))
        .then(testElementExists(selectors.CHOOSE_WHAT_TO_SYNC.HEADER))
        .then(click(selectors.CHOOSE_WHAT_TO_SYNC.SUBMIT))

        .then(testElementExists(selectors.CONFIRM_SIGNUP.HEADER))

        // clear browser state to synthesize verifying in an Android browser.
        .then(clearBrowserState())

        .then(openVerificationLinkInSameTab(email, 0, {
          query: {
            forceExperiment: 'connectAnotherService',
            forceExperimentGroup: 'treatment',
            forceUA: UA_STRINGS['android_firefox']
          }
        }))
        .then(testElementExists(selectors.CONNECT_ANOTHER_SERVICE.HEADER));
    },

    'signup Fx Desktop, verify in Fx for iOS': function () {
      return this.remote
        .then(openPage(SIGNUP_DESKTOP_URL, selectors.SIGNUP.HEADER, {
          forceUA: UA_STRINGS['desktop_firefox']
        }))
        .then(respondToWebChannelMessage(CHANNEL_COMMAND_CAN_LINK_ACCOUNT, {ok: true}))
        .then(fillOutSignUp(email, PASSWORD))
        .then(testElementExists(selectors.CHOOSE_WHAT_TO_SYNC.HEADER))
        .then(click(selectors.CHOOSE_WHAT_TO_SYNC.SUBMIT))

        .then(testElementExists(selectors.CONFIRM_SIGNUP.HEADER))

        // clear browser state to synthesize verifying in an Android browser.
        .then(clearBrowserState())

        .then(openVerificationLinkInSameTab(email, 0, {
          query: {
            forceExperiment: 'connectAnotherService',
            forceExperimentGroup: 'treatment',
            forceUA: UA_STRINGS['ios_firefox']
          }
        }))
        .then(testElementExists(selectors.CONNECT_ANOTHER_SERVICE.HEADER));
    },

    'signup in Fennec, verify same browser': function () {
      // should have both links to mobile apps
      return this.remote
        .then(openPage(SIGNUP_FENNEC_URL, selectors.SIGNUP.HEADER, {
          query: {
            forceUA: UA_STRINGS['android_firefox']
          }
        }))
        .then(respondToWebChannelMessage(CHANNEL_COMMAND_CAN_LINK_ACCOUNT, {ok: true}))
        .then(fillOutSignUp(email, PASSWORD))
        .then(testElementExists(selectors.CHOOSE_WHAT_TO_SYNC.HEADER))
        .then(click(selectors.CHOOSE_WHAT_TO_SYNC.SUBMIT))

        .then(testElementExists(selectors.CONFIRM_SIGNUP.HEADER))

        .then(openVerificationLinkInSameTab(email, 0, {
          query: {
            forceExperiment: 'connectAnotherService',
            forceExperimentGroup: 'treatment',
            forceUA: UA_STRINGS['android_firefox']
          }
        }))
        .then(testElementExists(selectors.CONNECT_ANOTHER_SERVICE.HEADER));
    }
  }
});
