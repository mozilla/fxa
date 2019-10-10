/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const { registerSuite } = intern.getInterface('object');
const TestHelpers = require('../lib/helpers');
const FunctionalHelpers = require('./lib/helpers');
const selectors = require('./lib/selectors');

const config = intern._config;
const ENTER_EMAIL_URL = config.fxaContentRoot;

const FIRST_PASSWORD = 'password';
const BROWSER_DEVICE_NAME = 'Browser Session Device';
const BROWSER_DEVICE_TYPE = 'desktop';
const TEST_DEVICE_NAME = 'Test Runner Session Device';
const TEST_DEVICE_NAME_UPDATED = 'Test Runner Session Device Updated';
const TEST_DEVICE_TYPE = 'mobile';

var email;
var client;
var accountData;

const {
  clearBrowserState,
  click,
  createUser,
  fillOutEmailFirstSignIn,
  noSuchElement,
  noSuchStoredAccountByEmail,
  openPage,
  pollUntil,
  pollUntilGoneByQSA,
  testElementExists,
  testElementTextEquals,
  visibleByQSA,
} = FunctionalHelpers;

registerSuite('settings clients', {
  beforeEach: function() {
    email = TestHelpers.createEmail();
    client = FunctionalHelpers.getFxaClient();
    return this.remote
      .then(createUser(email, FIRST_PASSWORD, { preVerified: true }))
      .then(function(result) {
        accountData = result;
      })
      .then(clearBrowserState());
  },

  afterEach: function() {
    return this.remote.then(clearBrowserState());
  },
  tests: {
    'sessions are listed in clients view': function() {
      return (
        this.remote
          .then(openPage(ENTER_EMAIL_URL, selectors.ENTER_EMAIL.HEADER))
          .then(fillOutEmailFirstSignIn(email, FIRST_PASSWORD))

          .then(testElementExists(selectors.SETTINGS.HEADER))
          .then(click(selectors.SETTINGS_CLIENTS.MENU_BUTTON))

          // current session has the text `current session`
          .then(
            FunctionalHelpers.testElementTextEquals(
              '.client-webSession:nth-child(1) .client-name + .device-current',
              'Current session'
            )
          )

          // first session has the user agent
          .then(
            testElementTextEquals(
              '.client-webSession:nth-child(1) .client-name',
              'Web Session, Firefox 40'
            )
          )

          // second session is the node.js session from test setup
          .then(
            testElementTextEquals(
              '.client-webSession:nth-child(2) .client-name',
              'Web Session'
            )
          )

          // clicking disconnect on the second session should update the list
          .then(click('.client-webSession:nth-child(2) .client-disconnect'))
          // disconnect waits until successful AJAX session delete
          .waitForDeletedByCssSelector('.client-webSession:nth-child(2)')
          .end()

          .then(click(selectors.SETTINGS_CLIENTS.BUTTON_REFRESH))
          .then(pollUntilGoneByQSA(selectors.SETTINGS_CLIENTS.REFRESHING))

          // second session is gone.
          .then(noSuchElement('.client-webSession:nth-child(2)'))

          // disconnect the current session
          .then(click('.client-webSession:nth-child(1) .client-disconnect'))
          // this will sign you out
          .then(testElementExists(selectors.ENTER_EMAIL.HEADER))
      );
    },

    'device and apps panel works with query param, same device': function() {
      this.timeout = 90 * 1000;
      var testDeviceId;

      return (
        this.remote
          .then(openPage(ENTER_EMAIL_URL, selectors.ENTER_EMAIL.HEADER))
          .then(fillOutEmailFirstSignIn(email, FIRST_PASSWORD))

          .then(testElementExists(selectors.SETTINGS.HEADER))
          .then(click(selectors.SETTINGS_CLIENTS.MENU_BUTTON))

          // add a device from the test runner
          .then(function() {
            return client.deviceRegister(
              accountData.sessionToken,
              TEST_DEVICE_NAME,
              TEST_DEVICE_TYPE
            );
          })

          .then(function(device) {
            testDeviceId = device.id;
          })

          // on a slow connection we wait until the client list is visible
          // and the refresh indicator goes away.
          .then(visibleByQSA(selectors.SETTINGS_CLIENTS.CLIENT_LIST))
          .then(pollUntilGoneByQSA(selectors.SETTINGS_CLIENTS.REFRESHING))

          .then(click(selectors.SETTINGS_CLIENTS.BUTTON_REFRESH))
          .then(pollUntilGoneByQSA(selectors.SETTINGS_CLIENTS.REFRESHING))

          .then(
            testElementTextEquals(
              '.client-device .client-name',
              TEST_DEVICE_NAME
            )
          )

          // add a device using a session token from the browser
          .execute(
            function(uid) {
              var accounts = JSON.parse(
                localStorage.getItem('__fxa_storage.accounts')
              );

              return accounts[uid];
            },
            [accountData.uid]
          )
          .then(function(browserAccount) {
            return client.deviceRegister(
              browserAccount.sessionToken,
              BROWSER_DEVICE_NAME,
              BROWSER_DEVICE_TYPE
            );
          })

          .then(click(selectors.SETTINGS_CLIENTS.BUTTON_REFRESH))
          .then(pollUntilGoneByQSA(selectors.SETTINGS_CLIENTS.REFRESHING))

          // wait for 2 devices
          .then(testElementExists('.client-device:nth-child(2)'))

          // browser device should be sorted first
          .then(
            testElementTextEquals(
              '.client-device:nth-child(1) .client-name',
              BROWSER_DEVICE_NAME
            )
          )

          // update external device from the test runner
          .then(function() {
            return client.deviceUpdate(
              accountData.sessionToken,
              testDeviceId,
              TEST_DEVICE_NAME_UPDATED
            );
          })

          // current device has the text `current device`
          .then(
            FunctionalHelpers.testElementTextEquals(
              '.client-device:nth-child(1) .client-name + .device-current',
              'Current device'
            )
          )

          // external update should show in the device list
          .then(click(selectors.SETTINGS_CLIENTS.BUTTON_REFRESH))
          .then(pollUntilGoneByQSA(selectors.SETTINGS_CLIENTS.REFRESHING))

          // external text change is hard to track, use pollUntil
          .then(
            pollUntil(
              function(newName) {
                var deviceName = document
                  .querySelectorAll(
                    '.client-device:nth-child(2) .client-name'
                  )[0]
                  .textContent.trim();

                return deviceName === newName ? true : null;
              },
              [TEST_DEVICE_NAME_UPDATED],
              10000
            )
          )

          .then(
            testElementTextEquals(
              '.client-device:nth-child(2) .client-name',
              TEST_DEVICE_NAME_UPDATED
            )
          )

          // clicking disconnect on the second device should update the list
          .then(click('.client-device:nth-child(2) .client-disconnect'))

          // get the modal dialog
          .then(testElementExists('.intro'))

          // test cancel
          .then(click('.cancel-disconnect'))
          .waitForDeletedByCssSelector('#client-disconnect')
          .end()

          .refresh()

          .then(click('.client-device:nth-child(2) .client-disconnect'))
          .then(click('.disconnect-reasons > label > input[value="lost"]'))
          // wait until button is enabled (disabled class has gone away)
          .then(pollUntilGoneByQSA('#client-disconnect .disabled'))
          .then(click('#client-disconnect .warning-button'))
          .then(click('#client-disconnect .reason-help'))

          // disconnect waits until successful AJAX device delete
          .waitForDeletedByCssSelector('.client-device:nth-child(2)')
          .end()

          // visibleByQSA is necessary to prevent a StaleElementReference
          // error. w/o it, a reference to the refresh button from before
          // the refresh is used. See #5593
          .then(visibleByQSA(selectors.SETTINGS_CLIENTS.BUTTON_REFRESH))
          .then(click(selectors.SETTINGS_CLIENTS.BUTTON_REFRESH))
          .then(pollUntilGoneByQSA(selectors.SETTINGS_CLIENTS.REFRESHING))

          // second device is still gone.
          .then(noSuchElement('.client-device:nth-child(2)'))
          .then(click('.client-device:nth-child(1) .client-disconnect'))
          .then(click('.disconnect-reasons > label > input[value="lost"]'))
          // wait until button is enabled
          .then(pollUntilGoneByQSA('#client-disconnect .disabled'))
          // clicking disconnect on the current device should sign you out
          .then(click('#client-disconnect .warning-button'))

          .then(testElementExists(selectors.ENTER_EMAIL.HEADER))
          .then(noSuchStoredAccountByEmail(email))
      );
    },
  },
});
