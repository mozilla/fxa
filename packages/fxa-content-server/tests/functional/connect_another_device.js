/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const { registerSuite } = intern.getInterface('object');
const FunctionalHelpers = require('./lib/helpers');
const UA_STRINGS = require('./lib/ua-strings');
const selectors = require('./lib/selectors');

const config = intern._config;
const CONNECT_ANOTHER_DEVICE_URL = `${config.fxaContentRoot}connect_another_device`;
const ENTER_EMAIL_URL = `${config.fxaContentRoot}?context=fx_desktop_v3&service=sync&action=email`;

const {
  clearBrowserState,
  createEmail,
  fillOutEmailFirstSignUp,
  noSuchElement,
  openPage,
  testElementExists,
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
        .then(noSuchElement(selectors.CONNECT_ANOTHER_DEVICE.SUCCESS));
    },
  },
});
