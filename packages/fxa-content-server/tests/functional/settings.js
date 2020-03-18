/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const { registerSuite } = intern.getInterface('object');
const assert = intern.getPlugin('chai').assert;
const FunctionalHelpers = require('./lib/helpers');
const selectors = require('./lib/selectors');

var config = intern._config;
var ENTER_EMAIL_URL = config.fxaContentRoot;
var SETTINGS_URL = config.fxaContentRoot + 'settings';
var SETTINGS_URL_WITH_SECURITY_EVENTS =
  config.fxaContentRoot + 'settings?security_events=true';

const {
  clearBrowserState,
  click,
  closeCurrentWindow,
  createEmail,
  createUser,
  denormalizeStoredEmail,
  destroySessionForEmail,
  fillOutEmailFirstSignIn,
  focus,
  noSuchElement,
  openPage,
  openSettingsInNewTab,
  switchToWindow,
  testElementExists,
  testElementTextEquals,
  testErrorTextInclude,
  type,
  visibleByQSA,
} = FunctionalHelpers;

var FIRST_PASSWORD = 'passwordcxvz';
var email;
var accountData;

registerSuite('settings', {
  beforeEach: function() {
    email = createEmail();

    return this.remote
      .then(createUser(email, FIRST_PASSWORD, { preVerified: true }))
      .then(function(result) {
        accountData = result;
      })
      .then(clearBrowserState());
  },

  tests: {
    'with an invalid email': function() {
      return this.remote
        .then(
          openPage(SETTINGS_URL + '?email=invalid', selectors['400'].HEADER)
        )
        .then(testErrorTextInclude('invalid'))
        .then(testErrorTextInclude('email'));
    },

    'with an empty email': function() {
      return this.remote
        .then(openPage(SETTINGS_URL + '?email=', selectors['400'].HEADER))
        .then(testErrorTextInclude('invalid'))
        .then(testErrorTextInclude('email'));
    },

    'with an invalid uid': function() {
      return this.remote
        .then(openPage(SETTINGS_URL + '?uid=invalid', selectors['400'].HEADER))
        .then(testErrorTextInclude('invalid'))
        .then(testErrorTextInclude('uid'));
    },

    'with an empty uid': function() {
      return this.remote
        .then(openPage(SETTINGS_URL + '?uid=', selectors['400'].HEADER))
        .then(testErrorTextInclude('invalid'))
        .then(testErrorTextInclude('uid'));
    },

    'sign in, go to settings, sign out': function() {
      return (
        this.remote
          .then(openPage(ENTER_EMAIL_URL, selectors.ENTER_EMAIL.HEADER))
          .then(fillOutEmailFirstSignIn(email, FIRST_PASSWORD))

          .then(testElementExists(selectors.SETTINGS.HEADER))
          // sign the user out
          .then(click(selectors.SETTINGS.SIGNOUT))

          // success is going to the signin page
          .then(testElementExists(selectors.ENTER_EMAIL.HEADER))
      );
    },

    'sign in with incorrect email case, go to settings, canonical email form is used': function() {
      return this.remote
        .then(openPage(ENTER_EMAIL_URL, selectors.ENTER_EMAIL.HEADER))
        .then(fillOutEmailFirstSignIn(email.toUpperCase(), FIRST_PASSWORD))

        .then(testElementExists(selectors.SETTINGS.HEADER))
        .then(testElementTextEquals('.card-header', email));
    },

    'sign in with incorrect email case before normalization fix, go to settings, canonical email form is used': function() {
      return (
        this.remote
          .then(openPage(ENTER_EMAIL_URL, selectors.ENTER_EMAIL.HEADER))
          .then(fillOutEmailFirstSignIn(email, FIRST_PASSWORD))

          .then(testElementExists(selectors.SETTINGS.HEADER))
          // synthesize signin pre-#4470 with incorrect email case
          .then(denormalizeStoredEmail(email))

          // now, refresh to ensure the email is normalized
          .refresh()

          .then(testElementExists(selectors.SETTINGS.HEADER))
          .then(testElementTextEquals('.card-header', email))
      );
    },

    'sign in, go to settings with setting param set to avatar redirects to avatar change page ': function() {
      return (
        this.remote
          .then(openPage(ENTER_EMAIL_URL, selectors.ENTER_EMAIL.HEADER))
          .then(fillOutEmailFirstSignIn(email, FIRST_PASSWORD, true))

          .then(testElementExists(selectors.SETTINGS.HEADER))
          .then(openPage(SETTINGS_URL + '?setting=avatar', '#avatar-options'))

          .then(click('.modal-panel button.cancel'))

          // Should not redirect after clicking the home button
          .then(testElementExists(selectors.SETTINGS.HEADER))
      );
    },

    'sign in, go to settings with setting param and additional params redirects to avatar change page ': function() {
      return (
        this.remote
          .then(openPage(ENTER_EMAIL_URL, selectors.ENTER_EMAIL.HEADER))
          .then(fillOutEmailFirstSignIn(email, FIRST_PASSWORD, true))

          .then(testElementExists(selectors.SETTINGS.HEADER))
          .then(
            openPage(
              SETTINGS_URL + '?setting=avatar&uid=' + accountData.uid,
              '#avatar-options'
            )
          )

          .then(click('.modal-panel button.cancel'))

          // Should not redirect after clicking the home button
          .then(testElementExists(selectors.SETTINGS.HEADER))
      );
    },

    'sign in with setting param set to avatar redirects to avatar change page ': function() {
      return this.remote
        .then(
          openPage(
            ENTER_EMAIL_URL + '?setting=avatar',
            selectors.ENTER_EMAIL.HEADER
          )
        )
        .then(fillOutEmailFirstSignIn(email, FIRST_PASSWORD))
        .then(testElementExists('#avatar-options'));
    },

    'sign in with setting param and additional params redirects to avatar change page ': function() {
      return this.remote
        .then(
          openPage(
            ENTER_EMAIL_URL + '?setting=avatar&uid=' + accountData.uid,
            selectors.ENTER_EMAIL.HEADER
          )
        )
        .then(fillOutEmailFirstSignIn(email, FIRST_PASSWORD))
        .then(testElementExists('#avatar-options'));
    },

    'sign in, go to settings and opening display_name panel autofocuses the first input element': function() {
      return (
        this.remote
          .then(openPage(ENTER_EMAIL_URL, selectors.ENTER_EMAIL.HEADER))
          .then(fillOutEmailFirstSignIn(email, FIRST_PASSWORD, true))
          .then(click(selectors.SETTINGS_DISPLAY_NAME.MENU_BUTTON))
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
        .then(openPage(ENTER_EMAIL_URL, selectors.ENTER_EMAIL.HEADER))
        .then(fillOutEmailFirstSignIn(email, FIRST_PASSWORD, true))
        .then(
          click(
            selectors.SETTINGS_DISPLAY_NAME.MENU_BUTTON,
            selectors.SETTINGS_DISPLAY_NAME.INPUT_DISPLAY_NAME
          )
        )
        .then(type(selectors.SETTINGS_DISPLAY_NAME.INPUT_DISPLAY_NAME, name))
        .then(click(selectors.SETTINGS_DISPLAY_NAME.SUBMIT))
        .then(visibleByQSA(selectors.SETTINGS_DISPLAY_NAME.MENU_BUTTON))
        .then(testElementTextEquals(selectors.SETTINGS.PROFILE_HEADER, name));
    },
    'sign in, open settings in a second tab, sign out': function() {
      return (
        this.remote
          .then(openPage(ENTER_EMAIL_URL, selectors.ENTER_EMAIL.HEADER))
          .then(fillOutEmailFirstSignIn(email, FIRST_PASSWORD))
          // wait for the settings page or else when the new tab is opened,
          // the user is asked to sign in.
          .then(testElementExists(selectors.SETTINGS.HEADER))

          .then(openSettingsInNewTab())
          .then(switchToWindow(1))
          .then(testElementExists(selectors.SETTINGS.HEADER))
          .then(click(selectors.SETTINGS.SIGNOUT))

          .then(testElementExists(selectors.ENTER_EMAIL.HEADER))
          .then(closeCurrentWindow())

          .then(testElementExists(selectors.FORCE_AUTH.HEADER))
      );
    },
  },
});

registerSuite('settings with expired session', {
  beforeEach: function() {
    email = createEmail();

    return this.remote
      .then(createUser(email, FIRST_PASSWORD, { preVerified: true }))
      .then(clearBrowserState({ force: true }))
      .then(openPage(ENTER_EMAIL_URL, selectors.ENTER_EMAIL.HEADER))
      .then(fillOutEmailFirstSignIn(email, FIRST_PASSWORD))

      .then(testElementExists(selectors.SETTINGS.HEADER))
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

        .then(testElementExists(selectors.FORCE_AUTH.HEADER));
    },
  },
});

registerSuite('settings with recent activity link', {
  beforeEach: function() {
    email = createEmail();

    return this.remote
      .then(createUser(email, FIRST_PASSWORD, { preVerified: true }))
      .then(clearBrowserState());
  },

  tests: {
    'gets recent activity link with ?security_events query param': function() {
      return this.remote
        .then(openPage(ENTER_EMAIL_URL, selectors.ENTER_EMAIL.HEADER))
        .then(fillOutEmailFirstSignIn(email, FIRST_PASSWORD))
        .then(testElementExists(selectors.SETTINGS.HEADER))

        .then(openPage(SETTINGS_URL_WITH_SECURITY_EVENTS))
        .then(testElementExists('#recent-activity-link'));
    },

    'does not get recent activity link without ?security_events query param': function() {
      return this.remote
        .then(openPage(ENTER_EMAIL_URL, selectors.ENTER_EMAIL.HEADER))
        .then(fillOutEmailFirstSignIn(email, FIRST_PASSWORD))
        .then(testElementExists(selectors.SETTINGS.HEADER))

        .then(openPage(SETTINGS_URL))
        .then(noSuchElement('#recent-activity-link'));
    },
  },
});
