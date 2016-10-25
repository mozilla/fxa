/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'intern',
  'intern!object',
  'intern/chai!assert',
  'intern/browser_modules/dojo/node!path',
  'tests/lib/helpers',
  'tests/functional/lib/helpers'
], function (intern, registerSuite, assert, path, TestHelpers, FunctionalHelpers) {
  var config = intern.config;

  var AVATAR_CHANGE_URL = config.fxaContentRoot + 'settings/avatar/change';
  var AVATAR_CHANGE_URL_AUTOMATED = config.fxaContentRoot + 'settings/avatar/change?automatedBrowser=true';
  var CHANGE_AVATAR_BUTTON_SELECTOR = '#change-avatar .settings-unit-toggle';
  var PASSWORD = 'password';
  var SETTINGS_URL = config.fxaContentRoot + 'settings';
  var SIGNIN_URL = config.fxaContentRoot + 'signin';
  var UPLOAD_IMAGE_PATH = path.join(this.process.cwd(), 'app', 'apple-touch-icon-152x152.png');

  var email;

  var thenify = FunctionalHelpers.thenify;

  var clearBrowserState = thenify(FunctionalHelpers.clearBrowserState);
  var click = FunctionalHelpers.click;
  var createUser = FunctionalHelpers.createUser;
  var fillOutSignIn = thenify(FunctionalHelpers.fillOutSignIn);
  var openPage = thenify(FunctionalHelpers.openPage);
  var testElementExists = FunctionalHelpers.testElementExists;
  var testIsBrowserNotified = FunctionalHelpers.testIsBrowserNotified;

  var testIsBrowserNotifiedOfAvatarChange = thenify(function () {
    return this.parent
      .then(testIsBrowserNotified(this.parent, 'profile:change'));
  });

  function signUp(context, email) {
    return context.remote
      .then(createUser(email, PASSWORD, { preVerified: true }))
      .then(clearBrowserState(context))

      .then(openPage(context, SIGNIN_URL, '#fxa-signin-header'))
      .then(fillOutSignIn(context, email, PASSWORD))
      .then(testElementExists('#fxa-settings-header'));
  }

  registerSuite({
    name: 'settings/avatar',

    beforeEach: function () {
      email = TestHelpers.createEmail();

      return signUp(this, email);
    },

    afterEach: function () {
      return FunctionalHelpers.clearBrowserState(this);
    },

    'go to settings then avatar change': function () {
      return this.remote
        .then(openPage(this, SETTINGS_URL, '#fxa-settings-header'))

        // go to change avatar
        .then(click(CHANGE_AVATAR_BUTTON_SELECTOR))

        // success is going to the change avatar page
        .then(testElementExists('#avatar-options'));
    },

    'go to settings with an email selected to see change link then click on avatar to change': function () {
      return this.remote
        .then(openPage(this, SETTINGS_URL, '#fxa-settings-header'))

        // go to change avatar
        .then(click('a.change-avatar'))

        // success is going to the change avatar page
        .then(testElementExists('#avatar-options'));
    },

    'go to settings with an email selected to see change link then click on text link to change': function () {
      return this.remote
        .then(openPage(this, SETTINGS_URL, '#fxa-settings-header'))

        // go to change avatar
        .then(click(CHANGE_AVATAR_BUTTON_SELECTOR))

        // success is going to the change avatar page
        .then(testElementExists('#avatar-options'));
    },

    'visit gravatar with gravatar set': function () {
      return this.remote
        .then(openPage(this, AVATAR_CHANGE_URL_AUTOMATED, '#gravatar'))

        // go to gravatar change
        .then(click('#gravatar'))

        // there is a strange race condition with the permission screen,
        // if the .sleep does not help then we should revisit this
        .then(testElementExists('.email'))
        .then(testElementExists('#back'))

        .sleep(2000)

        // accept permission
        .then(click('#accept'))

        .then(testElementExists('img[src*="https://secure.gravatar.com"]'))
        .then(click('.modal-panel #submit-btn'))

        .then(FunctionalHelpers.testSuccessWasShown(this))
        .then(testIsBrowserNotifiedOfAvatarChange())
        //success is returning to the settings page
        .then(testElementExists('#fxa-settings-header'))
        // check for an image with the gravatar url
        .then(testElementExists('img[src*="https://secure.gravatar.com"]'))

        // Go back to the gravatar view to make sure permission prompt is skipped the second time
        .then(click(CHANGE_AVATAR_BUTTON_SELECTOR))
        .then(click('#gravatar'))

        .then(testElementExists('#avatar-gravatar'));
    },

    'visit gravatar with gravatar set then cancel': function () {
      return this.remote
        .then(openPage(this, AVATAR_CHANGE_URL_AUTOMATED, '#gravatar'))
        // go to change avatar
        .then(click('#gravatar'))

        // accept permission
        .then(click('#accept'))

        .then(testElementExists('img[src*="https://secure.gravatar.com"]'))
        .then(click('.modal-panel #back'))

        // redirected back to main avatar page after save
        .then(testElementExists('#avatar-options'))

        // give time for error to show up, there should be no error though
        .sleep(500)

        .findByCssSelector('.modal-panel .error')
          .getVisibleText()
          .then(function (val) {
            assert.ok(! val, 'has no error text');
          })
        .end()

        // success is seeing no profile image set
        .waitForDeletedByCssSelector('.avatar-wrapper img')
        .end();
    },

    'visit gravatar with no gravatar set': function () {
      return this.remote
        .then(openPage(this, AVATAR_CHANGE_URL, '#gravatar'))

        // go to change avatar
        .then(click('#gravatar'))

        // accept permission
        .then(click('#accept'))

        // success is going to the change avatar page
        .then(testElementExists('#avatar-options'))

        // success is seeing the error text
        .then(FunctionalHelpers.visibleByQSA('.modal-panel .error'))
        .findByCssSelector('.modal-panel .error')
          .getVisibleText()
          .then(function (val) {
            assert.ok(val, 'has error text');
          })
        .end();
    },

    'attempt to use webcam for avatar': function () {
      return this.remote
        .then(openPage(this, AVATAR_CHANGE_URL_AUTOMATED, '#camera'))
        .then(click('#camera'))

        .then(click('.modal-panel #submit-btn'))

        .then(testIsBrowserNotifiedOfAvatarChange())
        .then(testElementExists('#fxa-settings-header'))
        //success is seeing the image loaded
        .then(FunctionalHelpers.imageLoadedByQSA('.change-avatar > img'));
    },

    'attempt to use webcam for avatar, then cancel': function () {
      return this.remote
        .then(openPage(this, AVATAR_CHANGE_URL_AUTOMATED, '#camera'))

        // go to change avatar
        .then(click('#camera'))

        .then(testElementExists('#avatar-camera'))
        .then(click('.modal-panel #back'))

        // success is returning to the avatar change page
        .then(testElementExists('#avatar-options'));
    },

    'upload a profile image': function () {
      return this.remote
        .then(openPage(this, AVATAR_CHANGE_URL, '#imageLoader'))

        // Selenium's way of interacting with a file picker
        .findByCssSelector('#imageLoader')
          .type(UPLOAD_IMAGE_PATH)
        .end()

        .then(testElementExists('.cropper'))

        .then(click('.zoom-out'))
        .then(click('.zoom-in'))
        .then(click('.rotate'))
        .then(click('.modal-panel #submit-btn'))

        .then(testIsBrowserNotifiedOfAvatarChange())
        .then(testElementExists('#fxa-settings-header'))
        //success is seeing the image loaded
        .then(FunctionalHelpers.imageLoadedByQSA('.change-avatar > img'));

    },

    'cancel uploading a profile image': function () {
      return this.remote
        .then(openPage(this, AVATAR_CHANGE_URL, '#imageLoader'))

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
