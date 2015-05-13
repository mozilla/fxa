/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'intern',
  'intern!object',
  'intern/chai!assert',
  'require',
  'intern/node_modules/dojo/node!xmlhttprequest',
  'app/bower_components/fxa-js-client/fxa-client',
  'tests/lib/helpers',
  'tests/functional/lib/helpers'
], function (intern, registerSuite, assert, require, nodeXMLHttpRequest,
        FxaClient, TestHelpers, FunctionalHelpers) {
  'use strict';

  var config = intern.config;
  var PAGE_URL = config.fxaContentRoot + 'signup?context=iframe&service=sync';

  var SIGNIN_URL = config.fxaContentRoot + 'signin';

  var AUTH_SERVER_ROOT = config.fxaAuthRoot;
  var TOO_YOUNG_YEAR = new Date().getFullYear() - 13;
  var OLD_ENOUGH_YEAR = TOO_YOUNG_YEAR - 1;

  var client;
  var email;
  var PASSWORD = '12345678';

  var listenForFxaCommands = FunctionalHelpers.listenForWebChannelMessage;
  var respondToWebChannel = function (context, expectedCommand, response) {
    return function () {
      return context.get('remote')
        .execute(function (expectedCommand, response) {
          /* global addEventListener, removeEventListener, CustomEvent, dispatchEvent */
          addEventListener('WebChannelMessageToChrome', function listener(e) {
            removeEventListener('WebChannelMessageToChrome', listener);

            var command = e.detail.message.command;
            var messageId = e.detail.message.messageId;

            if (command === expectedCommand) {
              var event = new CustomEvent('WebChannelMessageToContent', {
                detail: {
                  id: 'account_updates',
                  message: {
                    messageId: messageId,
                    command: command,
                    data: response
                  }
                }
              });

              dispatchEvent(event);
            }
          });
        }, [ expectedCommand, response ]);
    };
  };

  registerSuite({
    name: 'Firefox Desktop Sync v2 sign_up',

    beforeEach: function () {
      email = TestHelpers.createEmail();

      client = new FxaClient(AUTH_SERVER_ROOT, {
        xhr: nodeXMLHttpRequest.XMLHttpRequest
      });

      return FunctionalHelpers.clearBrowserState(this);
    },

    teardown: function () {
      var self = this;

      return FunctionalHelpers.clearBrowserState(this)
        .then(function () {
          // ensure the next test suite (bounced_email) loads a fresh
          // signup page. If a fresh signup page is not forced, the
          // bounced_email tests try to sign up using the Sync broker,
          // resulting in a channel timeout.
          self.get('remote')
            .get(require.toUrl(SIGNIN_URL))

            .findByCssSelector('#fxa-signin-header')
            .end();
        });
    },

    'sign up, verify same browser': function () {
      var self = this;

      return FunctionalHelpers.openPage(this, PAGE_URL, '#fxa-signup-header')
        .execute(listenForFxaCommands)

        .then(respondToWebChannel(self, 'fxaccounts:can_link_account', { ok: true } ))


        .then(function () {
          return FunctionalHelpers.fillOutSignUp(self, email, PASSWORD, OLD_ENOUGH_YEAR);
        })

        .then(FunctionalHelpers.testIsBrowserNotified(self, 'fxaccounts:can_link_account'))
        .then(FunctionalHelpers.testIsBrowserNotified(self, 'fxaccounts:login'))

        // verify the user
        .then(function () {
          return FunctionalHelpers.openVerificationLinkSameBrowser(
                self, email, 0);
        })
        .switchToWindow('newwindow')

        // user should be redirected to "Success!" screen.
        // In real life, the original browser window would show
        // a "welcome to sync!" screen that has a manage button
        // on it, and this screen should show the FxA success screen.
        .findById('fxa-sign-up-complete-header')
        .end()

        .findByCssSelector('.account-ready-service')
        .getVisibleText()
        .then(function (text) {
          assert.ok(text.indexOf('Firefox Sync') > -1);
        })

        .end()
        .closeCurrentWindow()

        // switch to the original window, it should not transition.
        .switchToWindow('')
        .end()

        .findByCssSelector('#fxa-confirm-header')
        .end();
    }
  });
});
