/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';


define([
  'mocha',
  'chai',
  'views/sign_in',
  '../../mocks/window'
],
function (mocha, chai, View, WindowMock) {
  var assert = chai.assert;

  describe('views/sign_in', function () {
    var view;

    beforeEach(function () {
      view = new View();
      view.render();
      $('#container').html(view.el);
    });

    afterEach(function () {
      view.remove();
      view.destroy();
    });

    describe('constructor creates it', function () {
      it('is drawn', function () {
        assert.ok($('#fxa-signin-header').length);
      });
    });

    describe('updatePasswordVisibility', function () {
      it('pw field set to text when clicked', function () {
        $('.show-password').click();
        assert.equal($('.password').attr('type'), 'text');
      });

      it('pw field set to password when clicked again', function () {
        $('.show-password').click();
        $('.show-password').click();
        assert.equal($('.password').attr('type'), 'password');
      });
    });

    describe('isFormValid', function () {
      it('returns true if both email and password are valid', function () {
        view.$('[type=email]').val('testuser@testuser.com');
        view.$('[type=password]').val('password');
        assert.isTrue(view.isFormValid());
      });

      it('returns false if email is invalid', function () {
        view.$('[type=email]').val('testuser');
        view.$('[type=password]').val('password');
        assert.isFalse(view.isFormValid());
      });

      it('returns false if password is invalid', function () {
        view.$('[type=email]').val('testuser@testuser.com');
        view.$('[type=password]').val('passwor');
        assert.isFalse(view.isFormValid());
      });
    });

    describe('showValidationErrors', function() {
      it('shows an error if the email is invalid', function (done) {
        view.$('[type=email]').val('testuser');
        view.$('[type=password]').val('password');

        view.on('validation_error', function(which, msg) {
          assert.ok(msg);
          done();
        });

        view.showValidationErrors();
      });

      it('shows an error if the password is invalid', function (done) {
        view.$('[type=email]').val('testuser@testuser.com');
        view.$('[type=password]').val('passwor');

        view.on('validation_error', function(which, msg) {
          assert.ok(msg);
          done();
        });

        view.showValidationErrors();
      });
    });
  });

  describe('views/sign_in used for /force_auth without email', function () {
    var view, windowMock;

    beforeEach(function () {
      windowMock = new WindowMock;
      windowMock.location.search = '';

      view = new View({ forceAuth: true, window: windowMock });
      view.render();
      $('#container').html(view.el);
    });

    afterEach(function () {
      view.remove();
      view.destroy();
      windowMock = view = null;
    });

    it('prints an error message', function() {
      windowMock.location.search = '';

      assert.notEqual(view.$('.error').text(), '');
    });
  });

  describe('views/sign_in used for /force_auth?email="testuser@testuser.com"', function () {
    var view, windowMock;

    beforeEach(function () {
      windowMock = new WindowMock;
      windowMock.location.search = '?email=testuser@testuser.com';

      view = new View({ forceAuth: true, window: windowMock });
      view.render();
      $('#container').html(view.el);
    });

    afterEach(function () {
      view.remove();
      view.destroy();
      windowMock = view = null;
    });


    it('does not print an error message', function () {
      assert.equal(view.$('.error').text(), '');
    });

    it('does not allow the email to be edited', function () {
      assert.equal($('input[type=email]').length, 0);
    });

    it('user cannot create an account', function () {
      assert.equal($('a[href="/signup"]').length, 0);
    });

    it('isFormValid is successful when the password is filled out', function () {
      $('.password').val('password');
      assert.isTrue(view.isFormValid());
    });
  });

});


