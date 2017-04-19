/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'intern',
  'intern!object',
  'tests/lib/helpers',
  'tests/functional/lib/helpers'
], function (intern, registerSuite, TestHelpers, FunctionalHelpers) {

  var config = intern.config;
  var SIGNIN_URL = config.fxaContentRoot + 'signin';

  var FIRST_PASSWORD = 'password';
  var BROWSER_DEVICE_NAME = 'Browser Session Device';
  var BROWSER_DEVICE_TYPE = 'desktop';
  var TEST_DEVICE_NAME = 'Test Runner Session Device';
  var TEST_DEVICE_NAME_UPDATED = 'Test Runner Session Device Updated';
  var TEST_DEVICE_TYPE = 'mobile';
  var email;
  var client;
  var accountData;

  var clearBrowserState = FunctionalHelpers.clearBrowserState;
  var click = FunctionalHelpers.click;
  var createUser = FunctionalHelpers.createUser;
  var fillOutSignIn = FunctionalHelpers.fillOutSignIn;
  var noSuchElement = FunctionalHelpers.noSuchElement;
  var noSuchStoredAccountByEmail = FunctionalHelpers.noSuchStoredAccountByEmail;
  var openPage = FunctionalHelpers.openPage;
  var pollUntil = FunctionalHelpers.pollUntil;
  var pollUntilGoneByQSA = FunctionalHelpers.pollUntilGoneByQSA;
  var testElementExists = FunctionalHelpers.testElementExists;
  var testElementTextEquals = FunctionalHelpers.testElementTextEquals;

  registerSuite({
    name: 'settings clients',

    beforeEach: function () {
      email = TestHelpers.createEmail();
      client = FunctionalHelpers.getFxaClient();
      return this.remote
        .then(createUser(email, FIRST_PASSWORD, {preVerified: true}))
        .then(function (result) {
          accountData = result;
        })
        .then(clearBrowserState());
    },

    afterEach: function () {
      return this.remote.then(clearBrowserState());
    },

    'sessions are listed in clients view': function () {
      return this.remote
        .then(openPage(SIGNIN_URL, '#fxa-signin-header'))
        .then(fillOutSignIn(email, FIRST_PASSWORD))

        .then(testElementExists('#fxa-settings-header'))
        .then(click('#clients .settings-unit-stub button'))

        // current session has the text `current session`
        .then(FunctionalHelpers.testElementTextEquals(
          '.client-webSession:nth-child(1) .client-name + .device-current',
          'current session'
        ))

        // first session has the user agent
        .then(testElementTextEquals(
          '.client-webSession:nth-child(1) .client-name',
          'Web Session, Firefox 40'
        ))

        // second session is the node.js session from test setup
        .then(testElementTextEquals(
          '.client-webSession:nth-child(2) .client-name',
          'Web Session, node-XMLHttpRequest null'
        ))

        // clicking disconnect on the second session should update the list
        .then(click('.client-webSession:nth-child(2) .client-disconnect'))
        // disconnect waits until successful AJAX session delete
        .waitForDeletedByCssSelector('.client-webSession:nth-child(2)')
        .end()

        .then(click('.clients-refresh'))
        // second session is gone.
        .then(noSuchElement('.client-webSession:nth-child(2)'))

        // disconnect the current session
        .then(click('.client-webSession:nth-child(1) .client-disconnect'))
        // this will sign you out
        .then(testElementExists('#fxa-signin-header'));

    },

    'device and apps panel works with query param, same device': function () {
      this.timeout = 90 * 1000;
      var testDeviceId;

      return this.remote
        .then(openPage(SIGNIN_URL, '#fxa-signin-header'))
        .then(fillOutSignIn(email, FIRST_PASSWORD))

        .then(testElementExists('#fxa-settings-header'))
        .then(click('#clients .settings-unit-stub button'))

        // add a device from the test runner
        .then(function () {
          return client.deviceRegister(
            accountData.sessionToken,
            TEST_DEVICE_NAME,
            TEST_DEVICE_TYPE
          );
        })

        .then(function (device) {
          testDeviceId = device.id;
        })

        // on a slow connection we wait until early refresh stops first
        .then(pollUntilGoneByQSA('.clients-refresh.disabled'))

        .then(click('.clients-refresh'))

        .then(testElementTextEquals(
          '.client-device .client-name', TEST_DEVICE_NAME
        ))

        // add a device using a session token from the browser
        .execute(function (uid) {
          var accounts = JSON.parse(localStorage.getItem('__fxa_storage.accounts'));

          return accounts[uid];
        }, [ accountData.uid ])
        .then(function (browserAccount) {
          return client.deviceRegister(
            browserAccount.sessionToken,
            BROWSER_DEVICE_NAME,
            BROWSER_DEVICE_TYPE
          );
        })

        .then(click('.clients-refresh'))

        // wait for 2 devices
        .then(testElementExists('.client-device:nth-child(2)'))

        // browser device should be sorted first
        .then(testElementTextEquals(
          '.client-device:nth-child(1) .client-name',
          BROWSER_DEVICE_NAME
        ))

        // update external device from the test runner
        .then(function () {
          return client.deviceUpdate(
            accountData.sessionToken,
            testDeviceId,
            TEST_DEVICE_NAME_UPDATED
          );
        })

        // current device has the text `current device`
        .then(FunctionalHelpers.testElementTextEquals(
          '.client-device:nth-child(1) .client-name + .device-current',
          'current device'
        ))

        // external update should show in the device list
        .then(click('.clients-refresh'))

        // external text change is hard to track, use pollUntil
        .then(pollUntil(function (newName) {
          var deviceName = document.querySelectorAll('.client-device:nth-child(2) .client-name')[0].textContent.trim();

          return deviceName === newName ? true : null;
        }, [ TEST_DEVICE_NAME_UPDATED ], 10000))

        .then(testElementTextEquals(
          '.client-device:nth-child(2) .client-name',
          TEST_DEVICE_NAME_UPDATED
        ))

        // clicking disconnect on the second device should update the list
        .then(click('.client-device:nth-child(2) .client-disconnect'))

        // get the modal dialog
        .then(testElementExists('.intro'))
        .then(testElementExists('.disabled'))

        // test cancel
        .then(click('.cancel-disconnect'))
        .waitForDeletedByCssSelector('#client-disconnect')
        .end()

        .then(click('.client-device:nth-child(2) .client-disconnect'))
        .then(click('.disconnect-reasons > label > input[value="lost"]'))
        // wait until button is enabled (disabled class has gone away)
        .then(pollUntilGoneByQSA('#client-disconnect .disabled'))
        .then(click('#client-disconnect .primary'))
        .then(click('#client-disconnect .reason-help'))

        // disconnect waits until successful AJAX device delete
        .waitForDeletedByCssSelector('.client-device:nth-child(2)')
        .end()

        .then(click('.clients-refresh'))
        // second device is still gone.
        .then(noSuchElement('.client-device:nth-child(2)'))
        .then(click('.client-device:nth-child(1) .client-disconnect'))
        .then(click('.disconnect-reasons > label > input[value="lost"]'))
        // wait until button is enabled
        .then(pollUntilGoneByQSA('#client-disconnect .disabled'))
        // clicking disconnect on the current device should sign you out
        .then(click('#client-disconnect .primary'))

        .then(testElementExists('#fxa-signin-header'))
        .then(noSuchStoredAccountByEmail(email));
    }
  });
});
