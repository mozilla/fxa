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
  'use strict';

  var config = intern.config;
  var AUTH_SERVER_ROOT = config.fxaAuthRoot;
  var SIGNIN_URL = config.fxaContentRoot + 'signin';
  var SETTINGS_URL = config.fxaContentRoot + 'settings';
  var AVATAR_URL = config.fxaContentRoot + 'settings/avatar';
  var AVATAR_CHANGE_URL = config.fxaContentRoot + 'settings/avatar/change';
  var AVATAR_CHANGE_URL_AUTOMATED = config.fxaContentRoot + 'settings/avatar/change?automatedBrowser=true';

  var PASSWORD = 'password';
  var EMAIL_AVATAR_AB_PREFIX = 'avatarAB-';
  var email;
  var client;
  var emailAvatarAb;

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
        return context.get('remote')
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
      emailAvatarAb = EMAIL_AVATAR_AB_PREFIX + TestHelpers.createEmail();

      client = new FxaClient(AUTH_SERVER_ROOT, {
        xhr: nodeXMLHttpRequest.XMLHttpRequest
      });

      return signUp(this, email);
    },

    teardown: function () {
      return FunctionalHelpers.clearBrowserState(this);
    },

    'go to avatars then avatar change': function () {
      return this.get('remote')
        .get(require.toUrl(AVATAR_URL))

        // go to change avatar
        .findById('change-avatar')
          .click()
        .end()

        // success is going to the change avatar page
        .findById('avatar-options')
        .end();
    },

    'go to settings with an email NOT selected to see change link should not see one': function () {
      return this.get('remote')
        .get(require.toUrl(SETTINGS_URL))

        // Should not see this anchor
        .waitForDeletedByCssSelector('a.change-avatar')
        .end();
    },

    'go to settings with an email NOT selected to see change link should not see text link': function () {
      return this.get('remote')
        .get(require.toUrl(SETTINGS_URL))

        // Should not see this anchor
        .waitForDeletedByCssSelector('p.change-avatar-text a')
        .end();
    },

    'go to settings with an email selected to see change link then click on avatar to change': function () {
      var self = this;
      return signUp(self, emailAvatarAb)
        .then(function () {
          return self.get('remote')
            .get(require.toUrl(SETTINGS_URL))

            // go to change avatar
            .findByCssSelector('a.change-avatar')
              .click()
            .end()

            // success is going to the change avatar page
            .findById('avatar-options')
            .end();
        });
    },

    'go to settings with an email selected to see change link then click on text link to change': function () {
      var self = this;
      return signUp(self, emailAvatarAb)
        .then(function () {
          return self.get('remote')
            .get(require.toUrl(SETTINGS_URL))

            // go to change avatar
            .findByCssSelector('p.change-avatar-text a')
              .click()
            .end()

            // success is going to the change avatar page
            .findById('avatar-options')
            .end();
        });
    },

    // revert this and the gravatar tests once #2515 is resolved
    'try to visit gravatar when it is disabled': function () {
      return this.get('remote')
        .get(require.toUrl(AVATAR_CHANGE_URL_AUTOMATED))

        // gravatar link should be absent
        .then(FunctionalHelpers.noSuchElement(this, '#gravatar'))
        .end();
    },

    'visit gravatar with gravatar set': function () {
      var self = this;
      return signUp(self, emailAvatarAb)
        .then(function () {
          return self.get('remote')
            .get(require.toUrl(AVATAR_CHANGE_URL_AUTOMATED))

            // go to change avatar
            .findById('gravatar')
              .click()
            .end()

            .findByCssSelector('img[src*="https://secure.gravatar.com"]')
            .end()

            .execute(FunctionalHelpers.listenForWebChannelMessage)

            .findById('submit-btn')
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
            .end();
        });
    },

    'visit gravatar with gravatar set then cancel': function () {
      var self = this;
      return signUp(self, emailAvatarAb)
        .then(function () {
          return self.get('remote')
            .get(require.toUrl(AVATAR_CHANGE_URL_AUTOMATED))

            // go to change avatar
            .findById('gravatar')
              .click()
            .end()

            .findByCssSelector('img[src*="https://secure.gravatar.com"]')
            .end()

            .findByCssSelector('a.cancel')
              .click()
            .end()

            // redirected back to main avatar page after save
            .findById('avatar-options')
            .end()

            // give time for error to show up, there should be no error though
            .sleep(500)

            .findByCssSelector('.error')
              .getVisibleText()
              .then(function (val) {
                assert.ok(! val, 'has no error text');
              })
            .end()

            // success is seeing no profile image set
            .waitForDeletedByCssSelector('.avatar-wrapper img')
            .end();
        });
    },

    'visit gravatar with no gravatar set': function () {
      var self = this;
      return signUp(self, emailAvatarAb)
        .then(function () {
          return self.get('remote')
            .get(require.toUrl(AVATAR_CHANGE_URL))

            // go to change avatar
            .findById('gravatar')
              .click()
            .end()

            // success is going to the change avatar page
            .findById('avatar-options')
            .end()

            // success is seeing the error text
            .then(FunctionalHelpers.visibleByQSA('.error'))
            .findByCssSelector('.error')
              .getVisibleText()
              .then(function (val) {
                assert.ok(val, 'has error text');
              })
            .end();
        });
    },

    'attempt to use webcam for avatar': function () {
      return this.get('remote')
        .get(require.toUrl(AVATAR_CHANGE_URL_AUTOMATED))

        // go to change avatar - click the span inside the element
        // to ensure the click handlers are hooked up properly.
        .findByCssSelector('#camera span')
          .click()
        .end()

        .execute(FunctionalHelpers.listenForWebChannelMessage)

        .findById('submit-btn')
          .click()
        .end()

        .then(testIsBrowserNotifiedOfAvatarChange(this))

        .findById('fxa-settings-header')
        //success is seeing the image loaded
        .then(FunctionalHelpers.imageLoadedByQSA('.avatar-wrapper > img'))
        .end();
    },

    'attempt to use webcam for avatar, then cancel': function () {
      return this.get('remote')
        .get(require.toUrl(AVATAR_CHANGE_URL_AUTOMATED))

        // go to change avatar
        .findById('camera')
          .click()
        .end()

        .findByCssSelector('a.cancel')
          .click()
        .end()

        // success is returning to the avatar change page
        .findById('avatar-options')
        .end();
    },

    'upload a profile image': function () {
      return this.get('remote')
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

        .findById('submit-btn')
          .click()
        .end()

        .then(testIsBrowserNotifiedOfAvatarChange(this))

        .findById('fxa-settings-header')
        //success is seeing the image loaded
        .then(FunctionalHelpers.imageLoadedByQSA('.avatar-wrapper > img'))
        .end();

    },

    'cancel uploading a profile image': function () {
      return this.get('remote')
        .get(require.toUrl(AVATAR_CHANGE_URL_AUTOMATED))

        // go to change avatar
        .findById('imageLoader')
        .end()

        .findById('file')
          .click()
        .end()

        .findByCssSelector('.cropper')
        .end()

        .findByCssSelector('.cancel')
          .click()
        .end()

        //success is returning to the avatar change page
        .findById('avatar-options')
        .end();

    }

  });

});
