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
], function (intern, registerSuite, assert, require, nodeXMLHttpRequest, FxaClient, TestHelpers, FunctionalHelpers) {
  var config = intern.config;
  var AUTH_SERVER_ROOT = config.fxaAuthRoot;
  var SIGNIN_URL = config.fxaContentRoot + 'signin';
  var SETTINGS_URL = config.fxaContentRoot + 'settings';
  var AVATAR_CHANGE_URL = config.fxaContentRoot + 'settings/avatar/change';
  var AVATAR_CHANGE_URL_AUTOMATED = config.fxaContentRoot + 'settings/avatar/change?automatedBrowser=true';

  var PASSWORD = 'password';
  var email;
  var client;
  var CHANGE_AVATAR_BUTTON_SELECTOR = '#change-avatar .settings-unit-toggle';

  function testIsBrowserNotifiedOfAvatarChange(context) {
    return FunctionalHelpers.testIsBrowserNotified(context, 'profile:change', function (data) {
      assert.ok(data.uid);
    });
  }

  function signUp(context, email) {
    return client.signUp(email, PASSWORD, { preVerified: true })
      .then(function () {
        return FunctionalHelpers.clearBrowserState(context);
      })
      .then(function () {
        return context.remote
          .get(require.toUrl(SIGNIN_URL))
          // This will configure the timeout for the duration of this test suite
          .setFindTimeout(intern.config.pageLoadTimeout)
          .findByCssSelector('form input.email')
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

          // make sure we actually sign in
          .findById('fxa-settings-header')
          .end();
      });
  }

  registerSuite({
    name: 'settings/avatar',

    beforeEach: function () {
      email = TestHelpers.createEmail();

      client = new FxaClient(AUTH_SERVER_ROOT, {
        xhr: nodeXMLHttpRequest.XMLHttpRequest
      });

      return signUp(this, email);
    },

    afterEach: function () {
      return FunctionalHelpers.clearBrowserState(this);
    },

    'go to settings then avatar change': function () {
      return this.remote
        .get(require.toUrl(SETTINGS_URL))

        // go to change avatar
        .findByCssSelector(CHANGE_AVATAR_BUTTON_SELECTOR)
          .click()
        .end()

        // success is going to the change avatar page
        .findById('avatar-options')
        .end();
    },

    'go to settings with an email selected to see change link then click on avatar to change': function () {
      var self = this;
      return self.remote
        .get(require.toUrl(SETTINGS_URL))

        // go to change avatar
        .findByCssSelector('a.change-avatar')
          .click()
        .end()

        // success is going to the change avatar page
        .findById('avatar-options')
        .end();
    },

    'go to settings with an email selected to see change link then click on text link to change': function () {
      var self = this;
      return self.remote
        .get(require.toUrl(SETTINGS_URL))

        // go to change avatar
        .findByCssSelector(CHANGE_AVATAR_BUTTON_SELECTOR)
          .click()
        .end()

        // success is going to the change avatar page
        .findById('avatar-options')
        .end();
    },

    'visit gravatar with gravatar set': function () {
      var self = this;
      return self.remote
        .get(require.toUrl(AVATAR_CHANGE_URL_AUTOMATED))

        // go to gravatar change
        .findById('gravatar')
          .click()
        .end()

        // there is a strange race condition with the permission screen,
        // if the .sleep does not help then we should revisit this
        .findByCssSelector('.email')
        .end()

        .findByCssSelector('#back')
        .end()

        .sleep(2000)

        // accept permission
        .findById('accept')
          .click()
        .end()

        .findByCssSelector('img[src*="https://secure.gravatar.com"]')
        .end()

        .execute(FunctionalHelpers.listenForWebChannelMessage)

        .findByCssSelector('.avatar-panel #submit-btn')
          .click()
        .end()

        .then(FunctionalHelpers.visibleByQSA('.success'))

        .findByCssSelector('.success')
          .getVisibleText()
          .then(function (val) {
            assert.ok(val, 'has success text');
          })
        .end()

        .then(testIsBrowserNotifiedOfAvatarChange(self))

        //success is returning to the settings page
        .findById('fxa-settings-header')
        .end()

        // check for an image with the gravatar url
        .findByCssSelector('img[src*="https://secure.gravatar.com"]')
        .end()

        // Go back to the gravatar view to make sure permission prompt is skipped the second time
        .findByCssSelector(CHANGE_AVATAR_BUTTON_SELECTOR)
          .click()
        .end()

        .findById('gravatar')
          .click()
        .end()

        .findById('avatar-gravatar')
        .end();
    },

    'visit gravatar with gravatar set then cancel': function () {
      var self = this;
      return self.remote
        .get(require.toUrl(AVATAR_CHANGE_URL_AUTOMATED))

        // go to change avatar
        .findById('gravatar')
          .click()
        .end()

        // accept permission
        .findById('accept')
          .click()
        .end()

        .findByCssSelector('img[src*="https://secure.gravatar.com"]')
        .end()

        .findByCssSelector('.avatar-panel #back')
          .click()
        .end()

        // redirected back to main avatar page after save
        .findById('avatar-options')
        .end()

        // give time for error to show up, there should be no error though
        .sleep(500)

        .findByCssSelector('.avatar-panel .error')
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
      var self = this;
      return self.remote
        .get(require.toUrl(AVATAR_CHANGE_URL))

        // go to change avatar
        .findById('gravatar')
          .click()
        .end()

        // accept permission
        .findById('accept')
          .click()
        .end()

        // success is going to the change avatar page
        .findById('avatar-options')
        .end()

        // success is seeing the error text
        .then(FunctionalHelpers.visibleByQSA('.avatar-panel .error'))
        .findByCssSelector('.avatar-panel .error')
          .getVisibleText()
          .then(function (val) {
            assert.ok(val, 'has error text');
          })
        .end();
    },

    'attempt to use webcam for avatar': function () {
      return this.remote
        .get(require.toUrl(AVATAR_CHANGE_URL_AUTOMATED))

        // go to change avatar - click the span inside the element
        // to ensure the click handlers are hooked up properly.
        .findByCssSelector('#camera span')
          .click()
        .end()

        .execute(FunctionalHelpers.listenForWebChannelMessage)

        .findByCssSelector('.avatar-panel #submit-btn')
          .click()
        .end()

        .then(testIsBrowserNotifiedOfAvatarChange(this))

        .findById('fxa-settings-header')
        .end()
        //success is seeing the image loaded
        .then(FunctionalHelpers.imageLoadedByQSA('.change-avatar > img'));
    },

    'attempt to use webcam for avatar, then cancel': function () {
      return this.remote
        .get(require.toUrl(AVATAR_CHANGE_URL_AUTOMATED))

        // go to change avatar
        .findById('camera')
          .click()
        .end()

        .findById('avatar-camera')
        .end()

        .findByCssSelector('.avatar-panel #back')
          .click()
        .end()

        // success is returning to the avatar change page
        .findById('avatar-options')
        .end();
    },

    'upload a profile image': function () {
      return this.remote
        .get(require.toUrl(AVATAR_CHANGE_URL_AUTOMATED))

        // go to change avatar
        .findById('imageLoader')
        .end()

        .findById('file')
          .click()
        .end()

        .findByCssSelector('.cropper')
        .end()

        .findByCssSelector('.zoom-out')
          .click()
        .end()

        .findByCssSelector('.zoom-in')
          .click()
        .end()

        .findByCssSelector('.rotate')
          .click()
        .end()

        .execute(FunctionalHelpers.listenForWebChannelMessage)

        .findByCssSelector('.avatar-panel #submit-btn')
          .click()
        .end()

        .then(testIsBrowserNotifiedOfAvatarChange(this))

        .findById('fxa-settings-header')
        .end()
        //success is seeing the image loaded
        .then(FunctionalHelpers.imageLoadedByQSA('.change-avatar > img'));

    },

    'cancel uploading a profile image': function () {
      return this.remote
        .get(require.toUrl(AVATAR_CHANGE_URL_AUTOMATED))

        // go to change avatar
        .findById('imageLoader')
        .end()

        .findById('file')
          .click()
        .end()

        .findByCssSelector('.cropper')
        .end()

        .findByCssSelector('.avatar-panel #back')
          .click()
        .end()

        //success is returning to the avatar change page
        .findById('avatar-options')
        .end();

    }

  });

});
