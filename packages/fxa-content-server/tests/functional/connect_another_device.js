/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const { registerSuite } = intern.getInterface('object');
const FunctionalHelpers = require('./lib/helpers');
const UA_STRINGS = require('./lib/ua-strings');
const selectors = require('./lib/selectors');

const config = intern._config;

const ADJUST_LINK_ANDROID =
  'https://app.adjust.com/2uo1qc?campaign=fxa-conf-page&' +
  'creative=button-autumn-2016-connect-another-device&adgroup=android';

const ADJUST_LINK_IOS =
  'https://app.adjust.com/2uo1qc?campaign=fxa-conf-page&' +
  'creative=button-autumn-2016-connect-another-device&adgroup=ios&' +
  'fallback=https://itunes.apple.com/app/apple-store/id989804926?pt=373246&' +
  'ct=adjust_tracker&mt=8';

const CONNECT_ANOTHER_DEVICE_URL = `${config.fxaContentRoot}connect_another_device`;
const CONNECT_ANOTHER_DEVICE_SMS_ENABLED_URL = `${config.fxaContentRoot}connect_another_device?forceExperiment=sendSms&forceExperimentGroup=signinCodes`;
const ENTER_EMAIL_URL = `${config.fxaContentRoot}?context=fx_desktop_v3&service=sync&action=email`;

const {
  clearBrowserState,
  createEmail,
  fillOutEmailFirstSignUp,
  noSuchElement,
  openPage,
  testElementExists,
  testHrefEquals,
} = FunctionalHelpers;

let email;
const PASSWORD = 'password12345678';

registerSuite('connect_another_device', {
  beforeEach: function () {
    email = createEmail('sync{id}');

    return this.remote.then(clearBrowserState({ force: true }));
  },

  tests: {
    'signup Fx Desktop, load /connect_another_device page': function () {
      // should have both links to mobile apps
      const forceUA = UA_STRINGS['desktop_firefox'];
      return this.remote
        .then(
          openPage(ENTER_EMAIL_URL, selectors.ENTER_EMAIL.HEADER, {
            query: { forceUA },
          })
        )
        .then(fillOutEmailFirstSignUp(email, PASSWORD))
        .then(testElementExists(selectors.CHOOSE_WHAT_TO_SYNC.HEADER))

        .then(
          openPage(
            CONNECT_ANOTHER_DEVICE_URL,
            selectors.CONNECT_ANOTHER_DEVICE.HEADER
          )
        )
        .then(noSuchElement(selectors.CONNECT_ANOTHER_DEVICE.SIGNIN_BUTTON))
        .then(
          testElementExists(
            selectors.CONNECT_ANOTHER_DEVICE.TEXT_INSTALL_FX_DESKTOP
          )
        )
        .then(
          testHrefEquals(
            selectors.CONNECT_ANOTHER_DEVICE.LINK_INSTALL_IOS,
            ADJUST_LINK_IOS
          )
        )
        .then(
          testHrefEquals(
            selectors.CONNECT_ANOTHER_DEVICE.LINK_INSTALL_ANDROID,
            ADJUST_LINK_ANDROID
          )
        )
        .then(noSuchElement(selectors.CONNECT_ANOTHER_DEVICE.SUCCESS));
    },

    'signup Fx Desktop, load /connect_another_device page, SMS enabled': function () {
      // should have both links to mobile apps
      const forceUA = UA_STRINGS['desktop_firefox'];
      return this.remote
        .then(
          openPage(ENTER_EMAIL_URL, selectors.ENTER_EMAIL.HEADER, {
            query: { forceUA },
          })
        )
        .then(fillOutEmailFirstSignUp(email, PASSWORD))
        .then(testElementExists(selectors.CHOOSE_WHAT_TO_SYNC.HEADER))

        .then(
          openPage(
            CONNECT_ANOTHER_DEVICE_SMS_ENABLED_URL,
            selectors.SMS_SEND.HEADER
          )
        )
        .then(
          testHrefEquals(selectors.SMS_SEND.LINK_MARKETING_IOS, ADJUST_LINK_IOS)
        )
        .then(
          testHrefEquals(
            selectors.SMS_SEND.LINK_MARKETING_ANDROID,
            ADJUST_LINK_ANDROID
          )
        )
        .then(noSuchElement(selectors.SMS_SEND.SUCCESS));
    },
  },
});
