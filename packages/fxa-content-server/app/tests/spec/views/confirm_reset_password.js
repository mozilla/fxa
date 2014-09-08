/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'chai',
  'lib/promise',
  'lib/auth-errors',
  'views/confirm_reset_password',
  'lib/session',
  'lib/metrics',
  'lib/fxa-client',
  '../../mocks/router',
  '../../mocks/window',
  '../../lib/helpers'
],
function (chai, p, AuthErrors, View, Session, Metrics, FxaClient, RouterMock, WindowMock, TestHelpers) {
  'use strict';

  var assert = chai.assert;

  describe('views/confirm_reset_password', function () {
    var view, routerMock, windowMock, metrics, fxaClient;

    beforeEach(function () {
      routerMock = new RouterMock();
      windowMock = new WindowMock();
      metrics = new Metrics();
      fxaClient = new FxaClient();

      Session.set('passwordForgotToken', 'fake password reset token');
      Session.set('email', 'testuser@testuser.com');

      view = new View({
        router: routerMock,
        window: windowMock,
        metrics: metrics,
        fxaClient: fxaClient
      });
      return view.render()
            .then(function () {
              $('#container').html(view.el);
            });
    });

    afterEach(function () {
      metrics.destroy();

      view.remove();
      view.destroy();

      view = metrics = null;
    });

    describe('constructor', function () {
      it('redirects to /reset_password if no passwordForgotToken', function () {
        Session.clear('passwordForgotToken');
        view.render()
          .then(function () {
            assert.equal(routerMock.page, 'reset_password');
          });
      });

      it('`sign in` link goes to /signin in normal flow', function () {
        // Check to make sure the normal signin link is drawn
        assert.equal(view.$('a[href="/signin"]').length, 1);
        assert.equal(view.$('a[href="/force_auth?email=testuser%40testuser.com"]').length, 0);
        assert.ok($('#fxa-confirm-reset-password-header').length);
      });

      it('`sign in` link goes to /force_auth in force auth flow', function () {
        Session.set('forceAuth', true);
        view.render()
          .then(function () {
            // Check to make sure the signin link goes "back"
            assert.equal(view.$('a[href="/signin"]').length, 0);
            assert.equal(view.$('a[href="/force_auth?email=testuser%40testuser.com"]').length, 1);
          });
      });

      it('`sign in` link goes to /oauth/signin in oauth flow', function () {
        /* jshint camelcase: false */
        Session.set('service', 'sync');
        Session.set('oauth', { client_id: 'sync' });
        view.render()
          .then(function () {
            // Check to make sure the signin link goes "back"
            assert.equal(view.$('a[href="/oauth/signin"]').length, 1);
            assert.equal(view.$('a[href="/signin"]').length, 0);
            assert.equal(view.$('a[href="/force_auth?email=testuser%40testuser.com"]').length, 0);
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

      it('redirects to /oauth/signin if user has verified in oauth flow', function () {
        /* jshint camelcase: false */

        Session.set('service', 'sync');
        Session.set('oauth', { client_id: 'sync' });

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
                assert.equal(routerMock.page, 'oauth/signin');
                // session.email is used to pre-fill the email on
                // the signin page.
                assert.equal(Session.prefillEmail, 'testuser@testuser.com');
              });
      });
    });

    describe('submit', function () {
      it('resends the confirmation email, shows success message', function () {
        var email = TestHelpers.createEmail();

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
            throw AuthErrors.toError('INVALID_TOKEN', 'Invalid token');
          });
        };

        return view.submit()
              .then(function () {
                assert.equal(routerMock.page, 'reset_password');

                assert.isTrue(TestHelpers.isEventLogged(metrics,
                                  'confirm_reset_password.resend'));
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
        var email = TestHelpers.createEmail();

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

    describe('a click on the signin link', function () {
      it('saves Session.email to Session.prefillEmail so user\'s email address is prefilled when browsing to /signin', function () {
        Session.set('email', 'testuser@testuser.com');

        view.$('a[href="/signin"]').click();
        assert.equal(Session.prefillEmail, 'testuser@testuser.com');
      });
    });
  });
});
