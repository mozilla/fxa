/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const { registerSuite } = intern.getInterface('object');
const assert = intern.getPlugin('chai').assert;
const TestHelpers = require('../lib/helpers');
const FunctionalHelpers = require('./lib/helpers');
const selectors = require('./lib/selectors');

var config = intern._config;
var SIGNIN_URL = config.fxaContentRoot + 'signin';
var SETTINGS_URL = config.fxaContentRoot + 'settings';

const {
  clearBrowserState,
  click,
  closeCurrentWindow,
  createUser,
  denormalizeStoredEmail,
  destroySessionForEmail,
  fillOutSignIn,
  focus,
  noSuchStoredAccountByEmail,
  openPage,
  openSettingsInNewTab,
  switchToWindow,
  testElementDisabled,
  testElementExists,
  testElementTextEquals,
  testErrorTextInclude,
  type,
  visibleByQSA,
} = FunctionalHelpers;

var FIRST_PASSWORD = 'password';
var email;
var accountData;

registerSuite('settings', {
  beforeEach: function() {
    email = TestHelpers.createEmail();

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
    'with an invalid email': function() {
      return this.remote
        .then(openPage(SETTINGS_URL + '?email=invalid', '#fxa-400-header'))
        .then(testErrorTextInclude('invalid'))
        .then(testErrorTextInclude('email'));
    },

    'with an empty email': function() {
      return this.remote
        .then(openPage(SETTINGS_URL + '?email=', '#fxa-400-header'))
        .then(testErrorTextInclude('invalid'))
        .then(testErrorTextInclude('email'));
    },

    'with an invalid uid': function() {
      return this.remote
        .then(openPage(SETTINGS_URL + '?uid=invalid', '#fxa-400-header'))
        .then(testErrorTextInclude('invalid'))
        .then(testErrorTextInclude('uid'));
    },

    'with an empty uid': function() {
      return this.remote
        .then(openPage(SETTINGS_URL + '?uid=', '#fxa-400-header'))
        .then(testErrorTextInclude('invalid'))
        .then(testErrorTextInclude('uid'));
    },

    'sign in, go to settings, sign out': function() {
      return (
        this.remote
          .then(openPage(SIGNIN_URL, '#fxa-signin-header'))
          .then(fillOutSignIn(email, FIRST_PASSWORD))

          .then(testElementExists('#fxa-settings-header'))
          // sign the user out
          .then(click('#signout'))

          // success is going to the signin page
          .then(testElementExists('#fxa-signin-header'))
      );
    },

    'sign in with incorrect email case, go to settings, canonical email form is used': function() {
      return this.remote
        .then(openPage(SIGNIN_URL, '#fxa-signin-header'))
        .then(fillOutSignIn(email.toUpperCase(), FIRST_PASSWORD))

        .then(testElementExists('#fxa-settings-header'))
        .then(testElementTextEquals('.card-header', email));
    },

    'sign in with incorrect email case before normalization fix, go to settings, canonical email form is used': function() {
      return (
        this.remote
          .then(openPage(SIGNIN_URL, '#fxa-signin-header'))
          .then(fillOutSignIn(email, FIRST_PASSWORD))

          .then(testElementExists('#fxa-settings-header'))
          // synthesize signin pre-#4470 with incorrect email case
          .then(denormalizeStoredEmail(email))

          // now, refresh to ensure the email is normalized
          .refresh()

          .then(testElementExists('#fxa-settings-header'))
          .then(testElementTextEquals('.card-header', email))
      );
    },

    'sign in, go to settings with setting param set to avatar redirects to avatar change page ': function() {
      return (
        this.remote
          .then(fillOutSignIn(email, FIRST_PASSWORD, true))

          .then(testElementExists('#fxa-settings-header'))
          .then(openPage(SETTINGS_URL + '?setting=avatar', '#avatar-options'))

          .then(click('.modal-panel button.cancel'))

          // Should not redirect after clicking the home button
          .then(testElementExists('#fxa-settings-header'))
      );
    },

    'sign in, go to settings with setting param and additional params redirects to avatar change page ': function() {
      return (
        this.remote
          .then(fillOutSignIn(email, FIRST_PASSWORD, true))

          .then(testElementExists('#fxa-settings-header'))
          .then(
            openPage(
              SETTINGS_URL + '?setting=avatar&uid=' + accountData.uid,
              '#avatar-options'
            )
          )

          .then(click('.modal-panel button.cancel'))

          // Should not redirect after clicking the home button
          .then(testElementExists('#fxa-settings-header'))
      );
    },

    'sign in with setting param set to avatar redirects to avatar change page ': function() {
      return this.remote
        .then(openPage(SIGNIN_URL + '?setting=avatar', '#fxa-signin-header'))
        .then(fillOutSignIn(email, FIRST_PASSWORD))
        .then(testElementExists('#avatar-options'));
    },

    'sign in with setting param and additional params redirects to avatar change page ': function() {
      return this.remote
        .then(
          openPage(
            SIGNIN_URL + '?setting=avatar&uid=' + accountData.uid,
            '#fxa-signin-header'
          )
        )
        .then(fillOutSignIn(email, FIRST_PASSWORD))
        .then(testElementExists('#avatar-options'));
    },

    'sign in, go to settings and opening display_name panel autofocuses the first input element': function() {
      return (
        this.remote
          .then(fillOutSignIn(email, FIRST_PASSWORD, true))
          .then(click('[data-href="settings/display_name"]'))
          .then(testElementExists('input.display-name'))

          // first element is focused
          .getActiveElement()
          .then(function(element) {
            element.getAttribute('class').then(function(className) {
              assert.isTrue(className.includes('display-name'));
            });
          })
          .end()
      );
    },

    'sign in, open settings and add a display name': function() {
      var name = 'joe';
      return this.remote
        .then(fillOutSignIn(email, FIRST_PASSWORD, true))
        .then(click('[data-href="settings/display_name"]'))
        .then(testElementExists('input.display-name'))
        .then(testElementDisabled('#submit_display'))
        .then(type('input[type=text]', name))
        .then(click('#submit_display'))
        .then(visibleByQSA('[data-href="settings/display_name"]'))
        .then(testElementTextEquals(selectors.SETTINGS.PROFILE_HEADER, name))
        .end();
    },
    'sign in, open settings in a second tab, sign out': function() {
      return (
        this.remote
          .then(fillOutSignIn(email, FIRST_PASSWORD))
          // wait for the settings page or else when the new tab is opened,
          // the user is asked to sign in.
          .then(testElementExists('#fxa-settings-header'))

          .then(openSettingsInNewTab())
          .then(switchToWindow(1))
          .then(testElementExists('#fxa-settings-header'))
          .then(click('#signout'))

          .then(testElementExists('#fxa-signin-header'))
          .then(closeCurrentWindow())

          .then(testElementExists('#fxa-signin-header'))
          .then(noSuchStoredAccountByEmail(email))
      );
    },
  },
});

registerSuite('settings unverified', {
  beforeEach: function() {
    email = TestHelpers.createEmail();

    return this.remote
      .then(createUser(email, FIRST_PASSWORD))
      .then(clearBrowserState())
      .then(fillOutSignIn(email, FIRST_PASSWORD))

      .then(testElementExists('#fxa-confirm-header'));
  },
  tests: {
    'visit settings page with an unverified account redirects to confirm': function() {
      return (
        this.remote
          // Expect to get redirected to confirm since the account is unverified
          .then(openPage(SETTINGS_URL, '#fxa-confirm-header'))
      );
    },
  },
});

registerSuite('settings with expired session', {
  beforeEach: function() {
    email = TestHelpers.createEmail();

    return this.remote
      .then(createUser(email, FIRST_PASSWORD, { preVerified: true }))
      .then(clearBrowserState({ force: true }))
      .then(fillOutSignIn(email, FIRST_PASSWORD))

      .then(testElementExists('#fxa-settings-header'))
      .then(destroySessionForEmail(email));
  },

  afterEach: function() {
    // browser state must be cleared or the tests that follow fail.
    return this.remote.then(clearBrowserState({ force: true }));
  },
  tests: {
    'a focus on the settings page after session expires redirects to signin': function() {
      return this.remote
        .then(focus())

        .then(testElementExists('#fxa-force-auth-header'));
    },
  },
});
