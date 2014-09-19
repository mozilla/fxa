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
  'tests/lib/restmail',
  'tests/lib/helpers',
  'tests/functional/lib/helpers'
], function (intern, registerSuite, assert, require, nodeXMLHttpRequest, FxaClient, restmail, TestHelpers, FunctionalHelpers) {
  'use strict';

  var config = intern.config;
  var OAUTH_APP = config.fxaOauthApp;
  var EMAIL_SERVER_ROOT = config.fxaEmailRoot;
  var AUTH_SERVER_ROOT = config.fxaAuthRoot;

  var PASSWORD = 'password';
  var TOO_YOUNG_YEAR = new Date().getFullYear() - 13;
  var user;
  var email;
  /* global window, addEventListener */

  /**
   * This suite tests the WebChannel functionality in the OAuth signin and signup cases
   * It uses a CustomEvent "WebChannelMessageToChrome" to finish OAuth flows
   */
  registerSuite({
    name: 'oauth web channel signin',

    beforeEach: function () {
      email = TestHelpers.createEmail();
      user = TestHelpers.emailToUser(email);

      return FunctionalHelpers.clearBrowserState(this);
    },

    teardown: function () {
      return FunctionalHelpers.clearBrowserState(this);
    },

    'signin using an oauth app': function () {
      var self = this;

      email = TestHelpers.createEmail();
      user = TestHelpers.emailToUser(email);
      var client = new FxaClient(AUTH_SERVER_ROOT, {
        xhr: nodeXMLHttpRequest.XMLHttpRequest
      });

      return self.get('remote')
        .setFindTimeout(intern.config.pageLoadTimeout)
        .then(function () {
          return client.signUp(email, PASSWORD)
            .then(function () {
              return restmail(EMAIL_SERVER_ROOT + '/mail/' + user);
            })
            .then(function (emails) {
              return self.get('remote')
                .get(require.toUrl(emails[0].headers['x-link']));
            });
        })

        // wait for confirmation
        .findById('fxa-sign-up-complete-header')
        .end()

        // sign in with a verified account via OAUTH_APP uri
        .get(require.toUrl(OAUTH_APP))
        .findByCssSelector('#splash .signin')
        .click()
        .end()

        .findByCssSelector('form input.email')
        .end()

        .getCurrentUrl()
        .then(function (url) {
          return self.get('remote')
            // add "&webChannelId=test" to the OAuth login url to signal that this is a WebChannel flow
            .get(require.toUrl(url + '&webChannelId=test'));
        })

        .execute(function (OAUTH_APP) {
          // this event will fire once the form is submitted below, helping it redirect to the application
          // if the window redirect does not happen then the sign in page will hang with an indicator
          addEventListener('WebChannelMessageToChrome', function (e) {
            if (e.detail.message.command === 'oauth_complete') {
              window.location.href = OAUTH_APP + 'api/oauth?' +
                'state=' + e.detail.message.data.state + '&code=' + e.detail.message.data.code;
            }
          });

          return true;
        }, [ OAUTH_APP ])

        .findByCssSelector('form input.email')
        .clearValue()
        .click()
        .type(email)
        .end()

        .findByCssSelector('form input.password')
        .click()
        .type(PASSWORD)
        .end()

        .findByCssSelector('button[type="submit"]')
        .click()
        .end()

        .findByCssSelector('#loggedin')
        .end()

        .findByCssSelector('#logout')
        .click()
        .end();
    },

    'signup using a webchannel using the "ready" page': function () {
      var self = this;

      return self.get('remote')
        // sign up, do not verify steps
        .get(require.toUrl(OAUTH_APP))
        .setFindTimeout(intern.config.pageLoadTimeout)
        .findByCssSelector('#splash .signup')
        .click()
        .end()
        .getCurrentUrl()
        .then(function (url) {

          return self.get('remote')
            // add '&webChannelId=test' to the current url, which is the confirmation screen
            .get(require.toUrl(url + '&webChannelId=test'));
        })
        .execute(function (OAUTH_APP) {
          // this event will fire once the account is confirmed, helping it redirect to the application
          // if the window redirect does not happen then the sign in page will hang on the confirmation screen
          addEventListener('WebChannelMessageToChrome', function (e) {
            if (e.detail.message.command === 'oauth_complete') {
              window.location.href = OAUTH_APP + 'api/oauth?' +
                'state=' + e.detail.message.data.state + '&code=' + e.detail.message.data.code;
            }
          });

          return true;
        }, [ OAUTH_APP ])

        .findByCssSelector('form input.email')
        .clearValue()
        .click()
        .type(email)
        .end()

        .findByCssSelector('form input.password')
        .click()
        .type(PASSWORD)
        .end()

        .findByCssSelector('#fxa-age-year')
        .click()
        .end()

        .findById('fxa-' + (TOO_YOUNG_YEAR - 1))
        .pressMouseButton()
        .releaseMouseButton()
        .click()
        .end()

        .findByCssSelector('button[type="submit"]')
        .click()
        .end()

        .findByCssSelector('#fxa-confirm-header')
        .end()

        .then(function () {
          // open a new window to validate the email
          return restmail(EMAIL_SERVER_ROOT + '/mail/' + user)
            .then(function (emails) {
              var emailLink = emails[0].headers['x-link'];

              return self.get('remote').execute(function (emailLink) {
                window.open(emailLink, 'newwindow');

                return true;
              }, [ emailLink ]);
            });
        })
        // close the email tab
        .switchToWindow('newwindow')
        // wait for the verified window in the new tab
        .findById('fxa-sign-up-complete-header')
        .end()
        .closeCurrentWindow()
        // switch to the original window
        .switchToWindow('')

        .findByCssSelector('#loggedin')
        .end()

        .findByCssSelector('#logout')
        .click()
        .end();
    }
  });

});
