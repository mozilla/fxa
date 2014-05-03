/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'chai',
  'p-promise',
  'lib/auth-errors',
  'views/confirm_reset_password',
  'lib/session',
  '../../mocks/router',
  '../../mocks/window'
],
function (chai, p, authErrors, View, Session, RouterMock, WindowMock) {
  'use strict';

  /*global describe, beforeEach, afterEach, it*/
  var assert = chai.assert;

  describe('views/confirm_reset_password', function () {
    var view, routerMock, windowMock;

    beforeEach(function () {
      routerMock = new RouterMock();
      windowMock = new WindowMock();

      Session.set('passwordForgotToken', 'fake password reset token');
      Session.set('email', 'testuser@testuser.com');

      view = new View({
        router: routerMock,
        window: windowMock
      });
      return view.render()
            .then(function () {
              $('#container').html(view.el);
            });
    });

    afterEach(function () {
      view.remove();
      view.destroy();
    });

    describe('constructor', function () {
      it('draws view if passwordForgotToken exists', function () {
        assert.ok($('#fxa-confirm-reset-password-header').length);
      });

      it('redirects to /reset_password if no passwordForgotToken', function () {
        Session.clear('passwordForgotToken');
        view.render()
          .then(function () {
            assert.equal(routerMock.page, 'reset_password');
          });
      });
    });

    describe('afterRender', function () {
      it('polls to check if user has verified, if not, retry', function () {
        view.fxaClient.isPasswordResetComplete = function () {
          return p().then(function () {
            return false;
          });
        };

        return view.afterRender()
              .then(function (isComplete) {
                assert.isFalse(isComplete);
                assert.isTrue(windowMock.isTimeoutSet());
              });
      });

      it('redirects to /signin if user has verified', function () {
        view.fxaClient.isPasswordResetComplete = function () {
          return p().then(function () {
            return true;
          });
        };

        // email is cleared in initial render in beforeEach, reset it to
        // see if it makes it through to the redirect.
        Session.set('email', 'testuser@testuser.com');
        return view.afterRender()
              .then(function (isComplete) {
                assert.isTrue(isComplete);
                assert.equal(routerMock.page, 'signin');
                // session.email is used to pre-fill the email on
                // the signin page.
                assert.equal(Session.prefillEmail, 'testuser@testuser.com');
              });
      });
    });

    describe('submit', function () {
      it('resends the confirmation email, shows success message', function () {
        var email = 'user' + Math.random() + '@testuser.com';

        return view.fxaClient.signUp(email, 'password')
              .then(function () {
                return view.fxaClient.passwordReset(email);
              })
              .then(function () {
                return view.submit();
              })
              .then(function () {
                assert.isTrue(view.$('.success').is(':visible'));
              });
      });

      it('redirects to `/reset_password` if the resend token is invalid', function () {
        view.fxaClient.passwordResetResend = function () {
          return p().then(function () {
            throw authErrors.toError('INVALID_TOKEN', 'Invalid token');
          });
        };

        return view.submit()
              .then(function () {
                assert.equal(routerMock.page, 'reset_password');
              });
      });

      it('displays other error messages if there is a problem', function () {
        view.fxaClient.passwordResetResend = function () {
          return p().then(function () {
            throw new Error('synthesized error from auth server');
          });
        };

        return view.submit()
              .then(function () {
                assert(false, 'unexpected success');
              }, function (err) {
                assert.equal(err.message, 'synthesized error from auth server');
              });
      });
    });

    describe('validateAndSubmit', function () {
      it('only called after click on #resend', function () {
        var email = 'user' + Math.random() + '@testuser.com';

        return view.fxaClient.signUp(email, 'password')
              .then(function () {
                var count = 0;
                view.validateAndSubmit = function() {
                  count++;
                };

                view.$('section').click();
                assert.equal(count, 0);

                view.$('#resend').click();
                assert.equal(count, 1);
              });
      });
    });
  });
});
