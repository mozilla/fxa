/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';


define([
  'chai',
  'underscore',
  'jquery',
  'lib/auth-errors',
  'views/change_password',
  '../../mocks/router',
  '../../lib/helpers',
  'lib/session'
],
function (chai, _, $, AuthErrors, View, RouterMock, TestHelpers, Session) {
  var assert = chai.assert;
  var wrapAssertion = TestHelpers.wrapAssertion;

  describe('views/change_password', function () {
    var view, routerMock, email;

    beforeEach(function () {
      routerMock = new RouterMock();
      view = new View({
        router: routerMock
      });
    });

    afterEach(function () {
      $(view.el).remove();
      view.destroy();
      view = null;
      routerMock = null;
    });

    describe('with no session', function () {
      it('redirects to signin', function () {
        return view.render()
          .then(function () {
            assert.equal(routerMock.page, 'signin');
          });
      });
    });

    describe('with session', function () {
      beforeEach(function () {
        email = 'testuser.' + Math.random() + '@testuser.com';

        return view.fxaClient.signUp(email, 'password', {preVerified: true})
          .then(function () {
            return view.render()
              .then(function () {
                $('body').append(view.el);
              });
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
        it('prints incorrect password error message if old password is incorrect (event if passwords are the same)', function () {
          $('#old_password').val('bad_password');
          $('#new_password').val('bad_password');

          return view.submit()
              .then(function () {
                assert.ok(false, 'unexpected success');
              }, function (err) {
                assert.isTrue(AuthErrors.is(err, 'INCORRECT_PASSWORD'));
              });
        });

        it('prints passwords must be different message if both passwords are the same and the first password is correct', function () {
          $('#old_password').val('password');
          $('#new_password').val('password');

          return view.submit()
              .then(function () {
                assert.ok(false, 'unexpected success');
              }, function (err) {
                assert.ok(AuthErrors.is(err, 'PASSWORDS_MUST_BE_DIFFERENT'));
              });
        });

        it('changes from old to new password, redirects user to /settings', function () {
          $('#old_password').val('password');
          $('#new_password').val('new_password');

          return view.submit()
              .then(function () {
                assert.equal(routerMock.page, 'settings');
              });
        });

       it('changes from old to new password, keeps sessionTokenContext', function () {
          $('#old_password').val('password');
          $('#new_password').val('new_password');

          Session.set('sessionTokenContext', 'foo');

          return view.submit()
              .then(function () {
                assert.equal(Session.sessionTokenContext, 'foo');
              });
        });

        it('shows the unverified user message if the user is unverified', function () {
          email = 'testuser.' + Math.random() + '@testuser.com';

          // create an unverified user, then change their password.
          return view.fxaClient.signUp(email, 'password')
            .then(function () {
              $('#old_password').val('password');
              $('#new_password').val('new_password');
              return view.submit();
            })
            .then(function () {
              assert.ok(view.$('#resend').length);
            });
        });
      });

      describe('resendVerificationEmail', function () {
        it('resends a verification email, and sends user to /confirm', function () {
          return view.resendVerificationEmail()
            .then(function () {
              assert.equal(routerMock.page, 'confirm');
            });
        });
      });
    });
  });
});


