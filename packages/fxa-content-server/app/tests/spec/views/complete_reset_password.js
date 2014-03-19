/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';


define([
  'chai',
  'views/complete_reset_password',
  '../../mocks/window',
  '../../lib/helpers'
],
function (chai, View, WindowMock, TestHelpers) {
  var assert = chai.assert;
  var wrapAssertion = TestHelpers.wrapAssertion;

  describe('views/complete_reset_password', function () {
    var view, windowMock;

    beforeEach(function () {
      windowMock = new WindowMock();

      view = new View({
        window: windowMock
      });

      view.render();
      $('#container').html(view.el);
    });

    afterEach(function () {
      view.remove();
      view.destroy();
      view = windowMock = null;
    });

    describe('constructor creates it', function () {
      it('is drawn', function () {
        assert.ok($('#fxa-complete-reset-password-header').length);
      });
    });

    describe('render', function () {
      it('shows an error if the token is missing', function (done) {
        windowMock.location.search = '?code=code&email=testuser@testuser.com';
        view.on('error', function () {
          done();
        });
        view.render();
      });

      it('shows an error if the code is missing', function (done) {
        windowMock.location.search = '?token=token&email=testuser@testuser.com';
        view.on('error', function () {
          done();
        });
        view.render();
      });

      it('shows an error if the email is missing', function (done) {
        windowMock.location.search = '?token=token&code=code';
        view.on('error', function () {
          done();
        });
        view.render();
      });
    });

    describe('updatePasswordVisibility', function () {
      it('pw field set to text when clicked', function () {
        $('.show-password').click();
        assert.equal($('#password').attr('type'), 'text');
        assert.equal($('#vpassword').attr('type'), 'text');
      });

      it('pw field set to password when clicked again', function () {
        $('.show-password').click();
        $('.show-password').click();
        assert.equal($('#password').attr('type'), 'password');
        assert.equal($('#vpassword').attr('type'), 'password');
      });
    });

    describe('isValid', function () {
      it('returns true if token, code, email, password, vpassword available, password & vpassword valid and the same', function () {
        view.token = view.code = view.email = 'passed_in_on_url';
        view.$('#password').val('password');
        view.$('#vpassword').val('password');
        assert.isTrue(view.isValid());
      });

      it('returns false if token, code, email, password, vpassword available, password & vpassword valid are different', function () {
        view.token = view.code = view.email = 'passed_in_on_url';
        view.$('#password').val('password');
        view.$('#vpassword').val('other_password');
        assert.isFalse(view.isValid());
      });

      it('returns false if token, code, email, password, vpassword available, password invalid', function () {
        view.token = view.code = view.email = 'passed_in_on_url';
        view.$('#password').val('passwor');
        view.$('#vpassword').val('password');
        assert.isFalse(view.isValid());
      });

      it('returns false if token, code, email, password, vpassword available, vpassword invalid', function () {
        view.token = view.code = view.email = 'passed_in_on_url';
        view.$('#password').val('password');
        view.$('#vpassword').val('passwor');
        assert.isFalse(view.isValid());
      });

      it('returns false if email missing', function () {
        view.token = view.code = 'passed_in_on_url';
        view.$('#password').val('password');
        view.$('#vpassword').val('password');
        assert.isFalse(view.isValid());
      });

      it('returns false if code missing', function () {
        view.token = view.email = 'passed_in_on_url';
        view.$('#password').val('password');
        view.$('#vpassword').val('password');
        assert.isFalse(view.isValid());
      });

      it('returns false if token missing', function () {
        view.code = view.email = 'passed_in_on_url';
        view.$('#password').val('password');
        view.$('#vpassword').val('password');
        assert.isFalse(view.isValid());
      });
    });

    describe('showValidationErrors', function() {
      it('shows an error if the password is invalid', function (done) {
        view.$('#password').val('passwor');
        view.$('#vpassword').val('password');

        view.on('validation_error', function(which, msg) {
          wrapAssertion(function() {
            assert.ok(msg);
          }, done);
        });

        view.showValidationErrors();
      });

      it('shows an error if the vpassword is invalid', function (done) {
        view.$('#password').val('password');
        view.$('#vpassword').val('passwor');

        view.on('validation_error', function(which, msg) {
          wrapAssertion(function() {
            assert.ok(msg);
          }, done);
        });

        view.showValidationErrors();
      });
    });

    describe('submit', function() {
      it('shows an error if passwords are the same', function (done) {
        view.$('#password').val('password1');
        view.$('#vpassword').val('password2');

        view.on('error', function() {
          done();
        });

        view.submit();
      });

      it('submits if passwords are the same', function () {
        view.$('[type=password]').val('password');
        view.submit();
      });
    });
  });
});



