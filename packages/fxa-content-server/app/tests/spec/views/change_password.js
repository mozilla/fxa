/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';


define([
  'chai',
  'underscore',
  'jquery',
  'views/change_password',
  '../../mocks/router',
  '../../lib/helpers'
],
function (chai, _, $, View, RouterMock, TestHelpers) {
  var assert = chai.assert;
  var wrapAssertion = TestHelpers.wrapAssertion;

  describe('views/change_password', function () {
    var view, router, email;

    beforeEach(function () {
      router = new RouterMock();
      view = new View({
        router: router
      });
    });

    afterEach(function () {
      $(view.el).remove();
      view.destroy();
      view = null;
      router = null;
    });

    describe('with no session', function () {
      it('redirects to signin', function (done) {
        router.on('navigate', function (newPage) {
          wrapAssertion(function () {
            assert.equal(newPage, 'signin');
          }, done);
        });

        var isRendered = view.render();
        assert.isFalse(isRendered);
      });
    });

    describe('with session', function () {
      beforeEach(function () {
        email = 'testuser.' + Math.random() + '@testuser.com';

        return view.fxaClient.signUp(email, 'password', {preVerified: true})
          .then(function () {
            view.render();

            $('body').append(view.el);
          });
      });

      describe('isValid', function () {
        it('returns true if both old and new passwords are valid and different', function () {
          $('#old_password').val('password');
          $('#new_password').val('password2');

          assert.equal(view.isValid(), true);
        });

        it('returns true if both old and new passwords are valid and the same', function () {
          $('#old_password').val('password');
          $('#new_password').val('password');

          assert.equal(view.isValid(), true);
        });

        it('returns false if old password is too short', function () {
          $('#old_password').val('passwor');
          $('#new_password').val('password');

          assert.equal(view.isValid(), false);
        });

        it('returns false if new password is too short', function () {
          $('#old_password').val('password');
          $('#new_password').val('passwor');

          assert.equal(view.isValid(), false);
        });
      });

      describe('showValidationErrors', function() {
        it('shows an error if the password is invalid', function (done) {
          view.$('#old_password').val('passwor');
          view.$('#new_password').val('password');

          view.on('validation_error', function(which, msg) {
            wrapAssertion(function () {
              assert.ok(msg);
            }, done);
          });

          view.showValidationErrors();
        });

        it('shows an error if the new_password is invalid', function (done) {
          view.$('#old_password').val('password');
          view.$('#new_password').val('passwor');

          view.on('validation_error', function(which, msg) {
            wrapAssertion(function () {
              assert.ok(msg);
            }, done);
          });

          view.showValidationErrors();
        });
      });

      describe('submit', function () {
        it('prints an error message if both passwords are the same', function (done) {
          $('#old_password').val('password');
          $('#new_password').val('password');

          view.on('error', function (msg) {
            wrapAssertion(function () {
              assert.ok(msg);
            }, done);
          });

          view.submit();
        });

        it('changes from old to new password, redirects user to signin', function (done) {
          $('#old_password').val('password');
          $('#new_password').val('new_password');

          view.on('success', done);
          view.submit();
        });
      });
    });
  });
});


