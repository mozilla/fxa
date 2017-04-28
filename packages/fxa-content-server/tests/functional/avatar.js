/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'intern',
  'intern!object',
  'intern/browser_modules/dojo/node!path',
  'tests/lib/helpers',
  'tests/functional/lib/helpers'
], function (intern, registerSuite, path, TestHelpers, FunctionalHelpers) {
  var config = intern.config;

  var ADD_AVATAR_BUTTON_SELECTOR  = '#change-avatar .settings-unit-toggle.primary';
  var AVATAR_CHANGE_URL = config.fxaContentRoot + 'settings/avatar/change';
  var AVATAR_CHANGE_URL_AUTOMATED = config.fxaContentRoot + 'settings/avatar/change?automatedBrowser=true';
  var PASSWORD = 'password';
  var SETTINGS_URL = config.fxaContentRoot + 'settings';
  var SIGNIN_URL = config.fxaContentRoot + 'signin';
  var UPLOAD_IMAGE_PATH = path.join(this.process.cwd(), 'app', 'apple-touch-icon-152x152.png');

  var email;

  var thenify = FunctionalHelpers.thenify;

  var clearBrowserState = FunctionalHelpers.clearBrowserState;
  var click = FunctionalHelpers.click;
  var createUser = FunctionalHelpers.createUser;
  var fillOutSignIn = FunctionalHelpers.fillOutSignIn;
  var openPage = FunctionalHelpers.openPage;
  var testElementExists = FunctionalHelpers.testElementExists;
  var testIsBrowserNotified = FunctionalHelpers.testIsBrowserNotified;

  var testIsBrowserNotifiedOfAvatarChange = thenify(function () {
    return this.parent
      .then(testIsBrowserNotified('profile:change'));
  });

  function signUp(context, email) {
    return context.remote
      .then(createUser(email, PASSWORD, { preVerified: true }))
      .then(clearBrowserState())

      .then(openPage(SIGNIN_URL, '#fxa-signin-header'))
      .then(fillOutSignIn(email, PASSWORD))
      .then(testElementExists('#fxa-settings-header'));
  }

  registerSuite({
    name: 'settings/avatar',

    beforeEach: function () {
      email = TestHelpers.createEmail();

      return signUp(this, email);
    },

    afterEach: function () {
      return this.remote.then(clearBrowserState());
    },

    'go to settings then avatar change': function () {
      return this.remote
        .then(openPage(SETTINGS_URL, '#fxa-settings-header'))

        // go to add avatar
        .then(click(ADD_AVATAR_BUTTON_SELECTOR))

        // success is going to the change avatar page
        .then(testElementExists('#avatar-options'));
    },

    'go to settings with an email selected to see change link then click on avatar to change': function () {
      return this.remote
        .then(openPage(SETTINGS_URL, '#fxa-settings-header'))

        // go to change avatar
        .then(click('a.change-avatar'))

        // success is going to the change avatar page
        .then(testElementExists('#avatar-options'));
    },

    'go to settings with an email selected to see change link then click on text link to change': function () {
      return this.remote
        .then(openPage(SETTINGS_URL, '#fxa-settings-header'))

        // go to add avatar
        .then(click(ADD_AVATAR_BUTTON_SELECTOR))

        // success is going to the change avatar page
        .then(testElementExists('#avatar-options'));
    },

    'attempt to use webcam for avatar': function () {
      return this.remote
        .then(openPage(AVATAR_CHANGE_URL_AUTOMATED, '#camera'))
        .then(click('#camera'))

        .then(click('.modal-panel #submit-btn'))

        .then(testElementExists('#fxa-settings-header'))
        .then(testIsBrowserNotifiedOfAvatarChange())
        //success is seeing the image loaded
        .then(FunctionalHelpers.imageLoadedByQSA('.change-avatar > img'));
    },

    'attempt to use webcam for avatar, then cancel': function () {
      return this.remote
        .then(openPage(AVATAR_CHANGE_URL_AUTOMATED, '#camera'))

        // go to change avatar
        .then(click('#camera'))

        .then(testElementExists('#avatar-camera'))
        .then(click('.modal-panel #back'))

        // success is returning to the avatar change page
        .then(testElementExists('#avatar-options'));
    },

    'upload a profile image': function () {
      return this.remote
        .then(openPage(AVATAR_CHANGE_URL, '#imageLoader'))

        // Selenium's way of interacting with a file picker
        .findByCssSelector('#imageLoader')
          .type(UPLOAD_IMAGE_PATH)
        .end()

        .then(testElementExists('.cropper'))

        .then(click('.zoom-out'))
        .then(click('.zoom-in'))
        .then(click('.rotate'))
        .then(click('.modal-panel #submit-btn'))

        .then(testElementExists('#fxa-settings-header'))
        .then(testIsBrowserNotifiedOfAvatarChange())
        //success is seeing the image loaded
        .then(FunctionalHelpers.imageLoadedByQSA('.change-avatar > img'));

    },

    'cancel uploading a profile image': function () {
      return this.remote
        .then(openPage(AVATAR_CHANGE_URL, '#imageLoader'))

        // Selenium's way of interacting with a file picker
        .findByCssSelector('#imageLoader')
          .type(UPLOAD_IMAGE_PATH)
        .end()

        .then(testElementExists('.cropper'))

        .then(click('.modal-panel #back'))

        //success is returning to the avatar change page
        .then(testElementExists('#avatar-options'));
    }

  });

});
