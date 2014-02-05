/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';


define([
  'mocha',
  'chai',
  'views/complete_reset_password'
],
function (mocha, chai, View) {
  var assert = chai.assert;

  describe('views/complete_reset_password', function () {
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
        assert.ok($('#fxa-complete-reset-password-header').length);
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
          assert.ok(msg);
          done();
        });

        view.showValidationErrors();
      });

      it('shows an error if the vpassword is invalid', function (done) {
        view.$('#password').val('password');
        view.$('#vpassword').val('passwor');

        view.on('validation_error', function(which, msg) {
          assert.ok(msg);
          done();
        });

        view.showValidationErrors();
      });
    });
  });
});



