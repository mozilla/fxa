/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const { registerSuite } = intern.getInterface('object');
const path = require('path');
const TestHelpers = require('../lib/helpers');
const FunctionalHelpers = require('./lib/helpers');
const uaStrings = require('./lib/ua-strings');
const selectors = require('./lib/selectors');

const config = intern._config;

const ios10UserAgent = uaStrings['ios_firefox_6_1'];

const AVATAR_CHANGE_URL = config.fxaContentRoot + 'settings/avatar/change';
const AVATAR_CHANGE_URL_AUTOMATED =
  config.fxaContentRoot + 'settings/avatar/change?automatedBrowser=true';
const PASSWORD = 'passwordzxcv';
const SETTINGS_URL = config.fxaContentRoot + 'settings';
const SETTINGS_URL_IOS10 = `${SETTINGS_URL}?forceUA='${encodeURIComponent(
  ios10UserAgent
)}`;
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
  createUser,
  fillOutEmailFirstSignIn,
  imageLoadedByQSA,
  noSuchElement,
  openPage,
  pollUntilHiddenByQSA,
  testElementExists,
  testIsBrowserNotified,
} = FunctionalHelpers;

registerSuite('settings/avatar', {
  beforeEach: function() {
    email = TestHelpers.createEmail();

    return this.remote
      .then(createUser(email, PASSWORD, { preVerified: true }))
      .then(clearBrowserState({ force: true }))

      .then(openPage(ENTER_EMAIL_URL, selectors.ENTER_EMAIL.HEADER))
      .then(fillOutEmailFirstSignIn(email, PASSWORD))
      .then(testElementExists(selectors.SETTINGS.HEADER));
  },

  tests: {
    'go to settings then avatar change': function() {
      return (
        this.remote
          .then(openPage(SETTINGS_URL, selectors.SETTINGS.HEADER))

          // go to add avatar
          .then(click(selectors.SETTINGS_AVATAR.MENU_BUTTON))

          // success is going to the change avatar page
          .then(testElementExists(selectors.SETTINGS_AVATAR.CHANGE_HEADER))
      );
    },

    'go to settings with an email selected to see change link then click on avatar to change': function() {
      return (
        this.remote
          .then(openPage(SETTINGS_URL, selectors.SETTINGS.HEADER))
          // go to change avatar
          .then(click(selectors.SETTINGS_AVATAR.AVATAR))

          // success is going to the change avatar page
          .then(testElementExists(selectors.SETTINGS_AVATAR.CHANGE_HEADER))
      );
    },

    'attempt to use webcam for avatar': function() {
      return (
        this.remote
          .then(
            openPage(
              AVATAR_CHANGE_URL_AUTOMATED,
              selectors.SETTINGS_AVATAR.BUTTON_CAMERA
            )
          )
          .then(click(selectors.SETTINGS_AVATAR.BUTTON_CAMERA))

          .then(click(selectors.SETTINGS_AVATAR.SUBMIT))

          .then(testElementExists(selectors.SETTINGS.HEADER))
          //success is seeing the image loaded
          .then(imageLoadedByQSA(selectors.SETTINGS_AVATAR.AVATAR))
          .then(testIsBrowserNotified('profile:change'))
      );
    },

    'attempt to use webcam for avatar, then cancel': function() {
      return (
        this.remote
          .then(
            openPage(
              AVATAR_CHANGE_URL_AUTOMATED,
              selectors.SETTINGS_AVATAR.BUTTON_CAMERA
            )
          )

          // go to change avatar
          .then(click(selectors.SETTINGS_AVATAR.BUTTON_CAMERA))

          .then(testElementExists(selectors.SETTINGS_AVATAR.CAMERA_HEADER))
          .then(click(selectors.SETTINGS_AVATAR.BACK))

          // success is returning to the avatar change page
          .then(testElementExists(selectors.SETTINGS_AVATAR.CHANGE_HEADER))
      );
    },

    'upload a profile image': function() {
      return (
        this.remote
          .then(
            openPage(
              AVATAR_CHANGE_URL,
              selectors.SETTINGS_AVATAR.UPLOAD_FILENAME_INPUT
            )
          )

          // Selenium's way of interacting with a file picker
          .findByCssSelector(selectors.SETTINGS_AVATAR.UPLOAD_FILENAME_INPUT)
          .type(UPLOAD_IMAGE_PATH)
          .end()

          .then(testElementExists(selectors.SETTINGS_AVATAR.CROPPER_HEADER))

          .then(click(selectors.SETTINGS_AVATAR.BUTTON_ZOOM_OUT))
          .then(click(selectors.SETTINGS_AVATAR.BUTTON_ZOOM_IN))
          .then(click(selectors.SETTINGS_AVATAR.BUTTON_ROTATE))
          .then(click(selectors.SETTINGS_AVATAR.SUBMIT))

          .then(
            pollUntilHiddenByQSA(
              selectors.SETTINGS_AVATAR.UPLOAD_FILENAME_INPUT
            )
          )

          //success is seeing the image loaded
          .then(imageLoadedByQSA(selectors.SETTINGS_AVATAR.AVATAR))
          .then(testIsBrowserNotified('profile:change'))
      );
    },

    'cancel uploading a profile image': function() {
      return (
        this.remote
          .then(
            openPage(
              AVATAR_CHANGE_URL,
              selectors.SETTINGS_AVATAR.UPLOAD_FILENAME_INPUT
            )
          )

          // Selenium's way of interacting with a file picker
          .findByCssSelector(selectors.SETTINGS_AVATAR.UPLOAD_FILENAME_INPUT)
          .type(UPLOAD_IMAGE_PATH)
          .end()

          .then(testElementExists(selectors.SETTINGS_AVATAR.CROPPER_HEADER))

          .then(click(selectors.SETTINGS_AVATAR.BACK))

          //success is returning to the avatar change page
          .then(testElementExists(selectors.SETTINGS_AVATAR.CHANGE_HEADER))
      );
    },

    'avatar panel removed on iOS 10': function() {
      return (
        this.remote
          .then(openPage(SETTINGS_URL_IOS10, selectors.SETTINGS.HEADER))

          //success is not displaying avatar change panel
          .then(noSuchElement(selectors.SETTINGS_AVATAR.MENU_BUTTON))
      );
    },
  },
});
