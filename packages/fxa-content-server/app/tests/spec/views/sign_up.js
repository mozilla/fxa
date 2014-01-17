/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';


define([
  'mocha',
  'chai',
  'underscore',
  'jquery',
  'views/sign_up',
  '../../mocks/router'
],
function (mocha, chai, _, $, View, RouterMock) {
  var assert = chai.assert;

  describe('views/sign_up', function () {
    var view, router;

    beforeEach(function() {
      document.cookie = "tooyoung=1; expires=Thu, 01-Jan-1970 00:00:01 GMT";
      sessionStorage.removeItem('tooYoung');
      router = new RouterMock();
      view = new View({
        router: router
      });
      view.render();

      $('body').append(view.el);
    });

    afterEach(function() {
      $(view.el).remove();
      view.destroy();
      view = null;
      router = null;
      document.cookie = "tooyoung=1; expires=Thu, 01-Jan-1970 00:00:01 GMT";
    });

    describe('isValid', function() {
      it('returns true if email, password, and age are all valid', function() {
        $('.email').val('testuser@testuser.com');
        $('.password').val('password');
        $('#fxa-age-year').val('1960');

        assert.isTrue(view.isValid());
      });

      it('returns false if email is empty', function() {
        $('.password').val('password');
        $('#fxa-age-year').val('1960');

        assert.isFalse(view.isValid());
      });

      it('returns false if email is not an email address', function() {
        $('.email').val('testuser')
        $('.password').val('password');
        $('#fxa-age-year').val('1960');

        assert.isFalse(view.isValid());
      });

      it('returns false if password is empty', function() {
        $('.email').val('testuser@testuser.com');
        $('#fxa-age-year').val('1960');

        assert.isFalse(view.isValid());
      });

      it('returns false if password is invalid', function() {
        $('.email').val('testuser@testuser.com');
        $('.password').val('passwor');
        $('#fxa-age-year').val('1960');

        assert.isFalse(view.isValid());
      });

      it('returns false if age is invalid', function() {
        $('.email').val('testuser@testuser.com');
        $('.password').val('password');

        assert.isFalse(view.isValid());
      });
    });

    describe('signUp', function() {
      it('sends the user to confirm screen if form filled out, >= 14 years ago', function() {
        $('.email').val('testuser@testuser.com');
        $('.password').val('password');

        var nowYear = (new Date()).getFullYear();
        $('#fxa-age-year').val(nowYear - 14);

        view.signUp();
        assert.equal(router.page, 'confirm');
      });

      it('sends the user to cannot_create_account screen if user selects <= 13 years ago', function() {
        $('.email').val('testuser@testuser.com');
        $('.password').val('password');

        var nowYear = (new Date()).getFullYear();
        $('#fxa-age-year').val(nowYear - 13);

        view.signUp();
        assert.equal(router.page, 'cannot_create_account');
      });

      it('a user who retries to enter the signUp screen after already going to cannot_create_account is automatically sent to cannot_create_account', function(done) {
        $('.email').val('testuser@testuser.com');
        $('.password').val('password');

        var nowYear = (new Date()).getFullYear();
        $('#fxa-age-year').val(nowYear - 13);

        view.signUp();
        assert.equal(router.page, 'cannot_create_account');

        // simulate user re-visiting the /signup page after being rejected
        var revisitRouter = new RouterMock();

        revisitRouter.on('navigate', function() {
          assert.equal(revisitRouter.page, 'cannot_create_account');
          done();
        });

        var revisitView = new View({
          router: revisitRouter
        });
        revisitView.render();
      });
    });
  });
});


