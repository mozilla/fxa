/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const { registerSuite } = intern.getInterface('object');
const assert = intern.getPlugin('chai').assert;
const path = require('path');
const FunctionalHelpers = require('./lib/helpers');
const selectors = require('./lib/selectors');

const config = intern._config;

const PASSWORD = 'passwordzxcv';
const SETTINGS_URL = config.fxaContentRoot + 'settings';
const ENTER_EMAIL_URL = config.fxaContentRoot + '?action=email';
const UPLOAD_IMAGE_PATH = path.join(
  process.cwd(),
  'app',
  'apple-touch-icon-152x152.png'
);

let email;

const {
  clearBrowserState,
  click,
  createEmail,
  createUser,
  fillOutEmailFirstSignIn,
  getWebChannelMessageData,
  openPage,
  storeWebChannelMessageData,
  testElementExists,
  type,
  visibleByQSA,
} = FunctionalHelpers;

registerSuite('settings/avatar', {
  // In order to test creating an avatar from a webcam on a headless test
  // machine, we set the 'media.navigator.streams.fake' browser pref, which
  // instructs the browser to return a fake stream from getUserMedia requests.
  // It turns out browser profile changes aren't reset between test runs, so
  // we just need to flip the pref once, and reset it when we're done. There's
  // probably a clever way to do this in a config file, but here we simply use
  // browser automation to load about:config and change the values directly.
  before: function () {
    return this.remote
      .then(openPage('about:config'))
      .then(click('#warningButton'))
      .then(type('#about-config-search', 'media.navigator.streams.fake'))
      .then(click('.button-toggle'));
  },

  after: function () {
    return this.remote
      .then(openPage('about:config'))
      .then(click('#warningButton'))
      .then(type('#about-config-search', 'media.navigator.streams.fake'))
      .then(click('.button-reset'));
  },

  beforeEach: function () {
    email = createEmail();

    return this.remote
      .then(createUser(email, PASSWORD, { preVerified: true }))
      .then(clearBrowserState({ force: true }))

      .then(openPage(ENTER_EMAIL_URL, selectors.ENTER_EMAIL.HEADER))
      .then(fillOutEmailFirstSignIn(email, PASSWORD))
      .then(testElementExists(selectors.SETTINGS.HEADER));
  },

  tests: {
    'attempt to use webcam for avatar': function () {
      return (
        this.remote
          .then(openPage(SETTINGS_URL, selectors.SETTINGS.HEADER))
          // go to change avatar
          .then(click(selectors.SETTINGS_AVATAR.MENU_BUTTON))
          .then(storeWebChannelMessageData('profile:change'))
          // click button, look for the loading spinner
          .then(click(selectors.SETTINGS_AVATAR.BUTTON_CAMERA))
          .then(click(selectors.SETTINGS_AVATAR.BUTTON_CAPTURING))
          .then(click(selectors.SETTINGS_AVATAR.SUBMIT))
          .then(testElementExists(selectors.SETTINGS.HEADER))
          //success is seeing the image loaded
          .then(testElementExists(selectors.SETTINGS_AVATAR.NON_DEFAULT_IMAGE))
          // Replacement for testIsBrowserNotified
          .then(getWebChannelMessageData('profile:change'))
          .then((msg) => {
            assert.equal(msg.command, 'profile:change');
          })
      );
    },

    'attempt to use webcam for avatar, then cancel': function () {
      return (
        this.remote
          .then(openPage(SETTINGS_URL, selectors.SETTINGS.HEADER))

          // go to change avatar
          .then(click(selectors.SETTINGS_AVATAR.MENU_BUTTON))
          .then(click(selectors.SETTINGS_AVATAR.BUTTON_CAMERA))
          // look for the button shown when the webcam capture has begun
          .then(testElementExists(selectors.SETTINGS_AVATAR.BUTTON_CAPTURING))
          .then(click(selectors.SETTINGS_AVATAR.BACK))

          // success is returning to the settings page
          .then(testElementExists(selectors.SETTINGS.HEADER))
      );
    },

    'upload and then remove profile image': function () {
      return (
        this.remote
          .then(openPage(SETTINGS_URL, selectors.SETTINGS.HEADER))
          .then(click(selectors.SETTINGS_AVATAR.MENU_BUTTON))
          .then(storeWebChannelMessageData('profile:change'))

          // Selenium's way of interacting with a file picker
          .findByCssSelector(selectors.SETTINGS_AVATAR.UPLOAD_FILENAME_INPUT)
          .type(UPLOAD_IMAGE_PATH)
          .end()

          .then(testElementExists(selectors.SETTINGS_AVATAR.BUTTON_ROTATE))

          .then(click(selectors.SETTINGS_AVATAR.BUTTON_ZOOM_OUT))
          .then(click(selectors.SETTINGS_AVATAR.BUTTON_ZOOM_IN))
          .then(click(selectors.SETTINGS_AVATAR.BUTTON_ROTATE))
          .then(
            click(
              selectors.SETTINGS_AVATAR.SUBMIT,
              selectors.SETTINGS_AVATAR.NON_DEFAULT_IMAGE
            )
          )

          //success is seeing the image loaded and navigated to settings
          .then(testElementExists(selectors.SETTINGS_AVATAR.NON_DEFAULT_IMAGE))
          .then(visibleByQSA(selectors.SETTINGS.HEADER))
          // Replacement for testIsBrowserNotified
          .then(getWebChannelMessageData('profile:change'))
          .then((msg) => {
            assert.equal(msg.command, 'profile:change');
          })

          // Remove the uploaded image
          .then(click(selectors.SETTINGS_AVATAR.MENU_BUTTON))
          .then(click(selectors.SETTINGS_AVATAR.REMOVE_BUTTON))

          // Success is navigating to settings and seeing no image
          .then(visibleByQSA(selectors.SETTINGS.HEADER))
          .then(testElementExists(selectors.SETTINGS_AVATAR.NON_DEFAULT_IMAGE))
      );
    },

    'cancel uploading a profile image': function () {
      return (
        this.remote
          .then(openPage(SETTINGS_URL, selectors.SETTINGS.HEADER))
          .then(click(selectors.SETTINGS_AVATAR.MENU_BUTTON))

          // Selenium's way of interacting with a file picker
          .findByCssSelector(selectors.SETTINGS_AVATAR.UPLOAD_FILENAME_INPUT)
          .type(UPLOAD_IMAGE_PATH)
          .end()

          .then(testElementExists(selectors.SETTINGS_AVATAR.BUTTON_ROTATE))

          .then(click(selectors.SETTINGS_AVATAR.BACK))

          // success is returning to the settings page
          .then(testElementExists(selectors.SETTINGS.HEADER))
      );
    },

    'redirects from /settings/avatar/change to /settings/avatar': function () {
      return (
        this.remote
          .then(openPage(SETTINGS_URL + '/avatar/change'))

          //success is being redirected to /avatar and seeing the page load
          .then(testElementExists(selectors.SETTINGS_AVATAR.BUTTON_CAMERA))
      );
    },
  },
});
