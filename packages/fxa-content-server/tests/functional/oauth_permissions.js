/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const { registerSuite } = intern.getInterface('object');
const assert = intern.getPlugin('chai').assert;
const TestHelpers = require('../lib/helpers');
const FunctionalHelpers = require('./lib/helpers');
const selectors = require('./lib/selectors');

const config = intern._config;

const TIMEOUT = 90 * 1000;

const TRUSTED_OAUTH_APP = config.fxaOAuthApp;
const UNTRUSTED_OAUTH_APP = config.fxaUntrustedOauthApp;
const PASSWORD = 'passwordzxcv';

const ENTER_EMAIL_URL = `${config.fxaContentRoot}?action=email`;

let email;

const {
  click,
  closeCurrentWindow,
  createUser,
  fillOutForceAuth,
  fillOutEmailFirstSignIn,
  fillOutEmailFirstSignUp,
  noSuchElement,
  openFxaFromRp: openFxaFromTrustedRp,
  openFxaFromUntrustedRp,
  openPage,
  openSettingsInNewTab,
  openVerificationLinkInNewTab,
  openVerificationLinkInSameTab,
  switchToWindow,
  testElementExists,
  testElementTextInclude,
  testUrlEquals,
  type,
  visibleByQSA,
} = FunctionalHelpers;

registerSuite('oauth permissions for untrusted reliers', {
  beforeEach: function() {
    this.timeout = TIMEOUT;
    email = TestHelpers.createEmail();

    return this.remote.then(
      FunctionalHelpers.clearBrowserState({
        '321done': true,
        contentServer: true,
      })
    );
  },
  tests: {
    'signin verified': function() {
      return this.remote
        .then(createUser(email, PASSWORD, { preVerified: true }))
        .then(openFxaFromUntrustedRp('enter-email'))
        .then(fillOutEmailFirstSignIn(email, PASSWORD))

        .then(testElementExists(selectors.OAUTH_PERMISSIONS.HEADER))
        .then(click(selectors.OAUTH_PERMISSIONS.SUBMIT))

        .then(testElementExists(selectors['123DONE'].AUTHENTICATED))
        .then(testUrlEquals(UNTRUSTED_OAUTH_APP));
    },

    're-signin verified, no additional permissions': function() {
      return (
        this.remote
          .then(createUser(email, PASSWORD, { preVerified: true }))
          .then(openFxaFromUntrustedRp('enter-email'))
          .then(fillOutEmailFirstSignIn(email, PASSWORD))

          .then(testElementExists(selectors.OAUTH_PERMISSIONS.HEADER))
          .then(
            click(
              selectors.OAUTH_PERMISSIONS.SUBMIT,
              selectors['123DONE'].AUTHENTICATED
            )
          )

          .then(testUrlEquals(UNTRUSTED_OAUTH_APP))

          .then(click(selectors['123DONE'].LINK_LOGOUT))
          .then(click(selectors['123DONE'].BUTTON_SIGNIN))

          // user signed in previously and should not need to enter
          // either their email address or password
          .then(testElementExists(selectors.SIGNIN_PASSWORD.HEADER))
          .then(click(selectors.SIGNIN_PASSWORD.SUBMIT_USE_SIGNED_IN))

          // no permissions additional asked for
          .then(testElementExists(selectors['123DONE'].AUTHENTICATED))
          // redirected back to the App without seeing the permissions screen.
          .then(testUrlEquals(UNTRUSTED_OAUTH_APP))
      );
    },

    'signin unverified, acts like signup': function() {
      return (
        this.remote
          .then(createUser(email, PASSWORD, { preVerified: false }))
          .then(openFxaFromUntrustedRp('enter-email'))
          .then(fillOutEmailFirstSignIn(email, PASSWORD))

          .then(testElementExists(selectors.OAUTH_PERMISSIONS.HEADER))
          .then(
            click(
              selectors.OAUTH_PERMISSIONS.SUBMIT,
              selectors.CONFIRM_SIGNUP.HEADER
            )
          )

          // get the second email, the first was sent on client.signUp w/
          // preVerified: false above. The second email has the `service` and
          // `resume` parameters.
          .then(openVerificationLinkInSameTab(email, 1))
          // user verifies in the same tab, so they are logged in to the RP.
          .then(testElementExists(selectors['123DONE'].AUTHENTICATED))
      );
    },

    'signup, verify same browser': function() {
      return (
        this.remote
          .then(openFxaFromUntrustedRp('enter-email'))
          .then(testElementExists(selectors.ENTER_EMAIL.SUB_HEADER))
          .getCurrentUrl()
          .then(function(url) {
            assert.ok(url.indexOf('client_id=') > -1);
            assert.ok(url.indexOf('redirect_uri=') > -1);
            assert.ok(url.indexOf('state=') > -1);
          })
          .end()

          .then(fillOutEmailFirstSignUp(email, PASSWORD))

          .then(testElementExists(selectors.OAUTH_PERMISSIONS.HEADER))
          .then(
            click(
              selectors.OAUTH_PERMISSIONS.SUBMIT,
              selectors.CONFIRM_SIGNUP.HEADER
            )
          )

          .then(openVerificationLinkInNewTab(email, 0))
          .then(switchToWindow(1))
          // wait for the verified window in the new tab
          .then(testElementExists(selectors.SIGNUP_COMPLETE.HEADER))
          .sleep(5000)

          // user sees the name of the RP,
          // but cannot redirect
          .then(
            testElementTextInclude(
              selectors.SIGNUP_COMPLETE.SERVICE_NAME,
              '321done Untrusted'
            )
          )

          // switch to the original window
          .then(closeCurrentWindow())

          .then(testElementExists(selectors['123DONE'].AUTHENTICATED))
      );
    },

    'signup, then signin with no additional permissions': function() {
      return (
        this.remote
          .then(openFxaFromUntrustedRp('enter-email'))
          .then(fillOutEmailFirstSignUp(email, PASSWORD))

          .then(testElementExists(selectors.OAUTH_PERMISSIONS.HEADER))
          .then(
            click(
              selectors.OAUTH_PERMISSIONS.SUBMIT,
              selectors.CONFIRM_SIGNUP.HEADER
            )
          )

          .then(openVerificationLinkInNewTab(email, 0))
          .then(switchToWindow(1))
          // wait for the verified window in the new tab
          .then(testElementExists(selectors.SIGNUP_COMPLETE.HEADER))

          .sleep(5000)
          // user sees the name of the RP,
          // but cannot redirect
          .then(
            testElementTextInclude(
              selectors.SIGNUP_COMPLETE.SERVICE_NAME,
              '321done Untrusted'
            )
          )

          // switch to the original window
          .then(closeCurrentWindow())

          .then(testElementExists(selectors['123DONE'].AUTHENTICATED))
          .then(click(selectors['123DONE'].LINK_LOGOUT))
          .then(click(selectors['123DONE'].BUTTON_SIGNIN))

          // user signed in previously and should not need to enter
          // either their email address or password
          .then(testElementExists(selectors.SIGNIN_PASSWORD.HEADER))
          .then(click(selectors.SIGNIN_PASSWORD.SUBMIT_USE_SIGNED_IN))

          .then(testElementExists(selectors['123DONE'].AUTHENTICATED))
          .then(testUrlEquals(UNTRUSTED_OAUTH_APP))
      );
    },

    'signin with new permission available b/c of new account information': function() {
      return (
        this.remote
          .then(createUser(email, PASSWORD, { preVerified: true }))
          .then(openFxaFromUntrustedRp('enter-email'))
          .then(fillOutEmailFirstSignIn(email, PASSWORD))

          .then(testElementExists(selectors.OAUTH_PERMISSIONS.HEADER))
          // display name is not available because user has not set their name
          .then(
            noSuchElement(selectors.OAUTH_PERMISSIONS.CHECKBOX_DISPLAY_NAME)
          )
          .then(
            click(
              selectors.OAUTH_PERMISSIONS.SUBMIT,
              selectors['123DONE'].AUTHENTICATED
            )
          )

          .then(testUrlEquals(UNTRUSTED_OAUTH_APP))

          .then(click(selectors['123DONE'].LINK_LOGOUT))

          .then(openSettingsInNewTab())
          .then(switchToWindow(1))

          .then(
            click(
              selectors.SETTINGS_DISPLAY_NAME.MENU_BUTTON,
              selectors.SETTINGS_DISPLAY_NAME.INPUT_DISPLAY_NAME
            )
          )
          .then(
            type(
              selectors.SETTINGS_DISPLAY_NAME.INPUT_DISPLAY_NAME,
              'test user'
            )
          )
          .then(click(selectors.SETTINGS_DISPLAY_NAME.SUBMIT))
          .then(visibleByQSA(selectors.SETTINGS.SUCCESS))

          .then(closeCurrentWindow())

          // user is already signed in, does not need to enter their password.
          .then(click(selectors['123DONE'].BUTTON_SIGNIN))
          .then(click(selectors.SIGNIN_PASSWORD.SUBMIT_USE_SIGNED_IN))

          // display name is now available
          .then(
            testElementExists(selectors.OAUTH_PERMISSIONS.CHECKBOX_DISPLAY_NAME)
          )
          .then(
            click(
              selectors.OAUTH_PERMISSIONS.SUBMIT,
              selectors['123DONE'].AUTHENTICATED
            )
          )
      );
    },

    'signin with additional requested permission': function() {
      return (
        this.remote
          .then(createUser(email, PASSWORD, { preVerified: true }))
          .then(openPage(ENTER_EMAIL_URL, selectors.ENTER_EMAIL.HEADER))
          .then(fillOutEmailFirstSignIn(email, PASSWORD))

          // make display_name available from the start
          .then(click(selectors.SETTINGS_DISPLAY_NAME.MENU_BUTTON))
          .then(
            type(
              selectors.SETTINGS_DISPLAY_NAME.INPUT_DISPLAY_NAME,
              'test user'
            )
          )
          // user is already signed in, does not need to enter their password.
          .then(click(selectors.SETTINGS_DISPLAY_NAME.SUBMIT))
          .then(visibleByQSA(selectors.SETTINGS.SUCCESS))

          // the first time through, only request email and uid
          .then(
            openFxaFromUntrustedRp('enter-email', {
              header: selectors.SIGNIN_PASSWORD.HEADER,
              query: {
                scope: 'openid profile:email profile:uid',
              },
            })
          )

          .then(click(selectors.SIGNIN_PASSWORD.SUBMIT_USE_SIGNED_IN))

          .then(testElementExists(selectors.OAUTH_PERMISSIONS.HEADER))
          // display name is not available because it's not requested
          .then(
            noSuchElement(selectors.OAUTH_PERMISSIONS.CHECKBOX_DISPLAY_NAME)
          )
          .then(
            click(
              selectors.OAUTH_PERMISSIONS.SUBMIT,
              selectors['123DONE'].AUTHENTICATED
            )
          )

          .then(testUrlEquals(UNTRUSTED_OAUTH_APP))

          .then(click(selectors['123DONE'].LINK_LOGOUT))
          .then(click(selectors['123DONE'].BUTTON_SIGNIN))

          .then(click(selectors.SIGNIN_PASSWORD.SUBMIT_USE_SIGNED_IN))

          // the second time through, profile:email, profile:uid, and
          // profile:display_name will be asked for, so display_name is
          // available
          .then(
            testElementExists(selectors.OAUTH_PERMISSIONS.CHECKBOX_DISPLAY_NAME)
          )
          .then(
            click(
              selectors.OAUTH_PERMISSIONS.SUBMIT,
              selectors['123DONE'].AUTHENTICATED
            )
          )
      );
    },

    'signin after de-selecting a requested permission': function() {
      return (
        this.remote
          .then(createUser(email, PASSWORD, { preVerified: true }))
          .then(openPage(ENTER_EMAIL_URL, selectors.ENTER_EMAIL.HEADER))
          .then(fillOutEmailFirstSignIn(email, PASSWORD))

          // make display_name available from the start
          .then(click(selectors.SETTINGS_DISPLAY_NAME.MENU_BUTTON))
          .then(
            type(
              selectors.SETTINGS_DISPLAY_NAME.INPUT_DISPLAY_NAME,
              'test user'
            )
          )
          .then(click(selectors.SETTINGS_DISPLAY_NAME.SUBMIT))
          .then(visibleByQSA(selectors.SETTINGS.SUCCESS))

          .then(
            openFxaFromUntrustedRp('enter-email', {
              header: selectors.SIGNIN_PASSWORD.HEADER,
            })
          )

          .then(click(selectors.SIGNIN_PASSWORD.SUBMIT_USE_SIGNED_IN))

          .then(
            testElementExists(selectors.OAUTH_PERMISSIONS.CHECKBOX_DISPLAY_NAME)
          )
          // deselect display name to ensure permission state is
          // saved correctly.
          .then(click(selectors.OAUTH_PERMISSIONS.CHECKBOX_DISPLAY_NAME))
          .then(
            click(
              selectors.OAUTH_PERMISSIONS.SUBMIT,
              selectors['123DONE'].AUTHENTICATED
            )
          )

          .then(click(selectors['123DONE'].LINK_LOGOUT))
          // signin again, no permissions should be asked for even though
          // display_name was de-selected last time.
          .then(click(selectors['123DONE'].BUTTON_SIGNIN))

          .then(
            click(
              selectors.SIGNIN_PASSWORD.SUBMIT_USE_SIGNED_IN,
              selectors['123DONE'].AUTHENTICATED
            )
          )
      );
    },
  },
});

registerSuite('oauth permissions for trusted reliers', {
  beforeEach: function() {
    email = TestHelpers.createEmail();

    return this.remote.then(
      FunctionalHelpers.clearBrowserState({
        '123done': true,
        contentServer: true,
      })
    );
  },

  tests: {
    'signup without `prompt=consent`': function() {
      return (
        this.remote
          .then(openFxaFromTrustedRp('enter-email'))
          .then(fillOutEmailFirstSignUp(email, PASSWORD))

          // no permissions asked for, straight to confirm
          .then(testElementExists(selectors.CONFIRM_SIGNUP.HEADER))
      );
    },

    'signup with `prompt=consent`': function() {
      return (
        this.remote
          .then(
            openFxaFromTrustedRp('enter-email', {
              query: { prompt: 'consent' },
            })
          )
          .then(fillOutEmailFirstSignUp(email, PASSWORD))

          // permissions are asked for with `prompt=consent`
          .then(testElementExists(selectors.OAUTH_PERMISSIONS.HEADER))
          .then(click(selectors.OAUTH_PERMISSIONS.SUBMIT))

          .then(testElementExists(selectors.CONFIRM_SIGNUP.HEADER))
      );
    },

    'signin without `prompt=consent`': function() {
      return (
        this.remote
          .then(openFxaFromTrustedRp('enter-email'))
          .then(createUser(email, PASSWORD, { preVerified: true }))
          .then(fillOutEmailFirstSignIn(email, PASSWORD))

          // no permissions asked for, straight to relier
          .then(testElementExists(selectors['123DONE'].AUTHENTICATED))
      );
    },

    'signin with `prompt=consent`': function() {
      return (
        this.remote
          .then(
            openFxaFromTrustedRp('enter-email', {
              query: { prompt: 'consent' },
            })
          )
          .then(createUser(email, PASSWORD, { preVerified: true }))
          .then(fillOutEmailFirstSignIn(email, PASSWORD))

          // permissions are asked for with `prompt=consent`
          .then(testElementExists(selectors.OAUTH_PERMISSIONS.HEADER))
          .then(click(selectors.OAUTH_PERMISSIONS.SUBMIT))

          .then(testElementExists(selectors['123DONE'].AUTHENTICATED))
      );
    },

    'signin without `prompt=consent`, then re-signin with `prompt=consent`': function() {
      return (
        this.remote
          .then(createUser(email, PASSWORD, { preVerified: true }))
          .then(openFxaFromTrustedRp('enter-email'))
          .then(fillOutEmailFirstSignIn(email, PASSWORD))

          // no permissions asked for, straight to relier
          .then(testElementExists(selectors['123DONE'].AUTHENTICATED))
          .then(testUrlEquals(TRUSTED_OAUTH_APP))
          .then(click(selectors['123DONE'].LINK_LOGOUT))
          // currently there is no way to tell when 123done fully logged out
          // give the logout request some time to complete
          .sleep(1000)
          .then(visibleByQSA('#splash .signup'))

          // relier changes to request consent
          .then(
            openFxaFromTrustedRp('enter-email', {
              header: selectors.SIGNIN_PASSWORD.HEADER,
              query: { prompt: 'consent' },
            })
          )

          .then(click(selectors.SIGNIN_PASSWORD.SUBMIT_USE_SIGNED_IN))

          // since consent is now requested, user should see prompt
          .then(testElementExists(selectors.OAUTH_PERMISSIONS.HEADER))
          .then(click(selectors.OAUTH_PERMISSIONS.SUBMIT))

          .then(testElementExists(selectors['123DONE'].AUTHENTICATED))
      );
    },

    'force_auth without `prompt=consent`': function() {
      return (
        this.remote
          .then(createUser(email, PASSWORD, { preVerified: true }))
          .then(openFxaFromTrustedRp('force-auth', { query: { email: email } }))
          .then(fillOutForceAuth(PASSWORD))

          // no permissions asked for, straight to relier
          .then(testElementExists(selectors['123DONE'].AUTHENTICATED))
      );
    },

    'force_auth with `prompt=consent`': function() {
      return (
        this.remote
          .then(createUser(email, PASSWORD, { preVerified: true }))
          .then(
            openFxaFromTrustedRp('force-auth', {
              query: {
                email: email,
                prompt: 'consent',
              },
            })
          )
          .then(fillOutForceAuth(PASSWORD))

          // permissions are asked for with `prompt=consent`
          .then(testElementExists(selectors.OAUTH_PERMISSIONS.HEADER))
          .then(click(selectors.OAUTH_PERMISSIONS.SUBMIT))

          .then(testElementExists(selectors['123DONE'].AUTHENTICATED))
      );
    },
  },
});
