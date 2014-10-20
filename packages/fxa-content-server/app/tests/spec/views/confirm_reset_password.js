/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'chai',
  'sinon',
  'lib/promise',
  'lib/auth-errors',
  'views/confirm_reset_password',
  'lib/session',
  'lib/metrics',
  'lib/channels/inter-tab',
  '../../mocks/fxa-client',
  'models/reliers/relier',
  '../../mocks/router',
  '../../mocks/window',
  '../../lib/helpers'
],
function (chai, sinon, p, AuthErrors, View, Session, Metrics,
      InterTabChannel, FxaClient, Relier, RouterMock,
      WindowMock, TestHelpers) {
  'use strict';

  var assert = chai.assert;

  describe('views/confirm_reset_password', function () {
    var view;
    var routerMock;
    var windowMock;
    var metrics;
    var fxaClient;
    var relier;
    var interTabChannel;

    beforeEach(function () {
      routerMock = new RouterMock();
      windowMock = new WindowMock();
      metrics = new Metrics();
      relier = new Relier();
      fxaClient = new FxaClient();
      interTabChannel = new InterTabChannel();

      Session.set('passwordForgotToken', 'fake password reset token');
      Session.set('email', 'testuser@testuser.com');

      sinon.stub(fxaClient, 'isPasswordResetComplete', function () {
        return p(true);
      });

      view = new View({
        router: routerMock,
        window: windowMock,
        metrics: metrics,
        fxaClient: fxaClient,
        relier: relier,
        interTabChannel: interTabChannel,
        sessionUpdateTimeoutMS: 100
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
        return view.render()
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
        return view.render()
          .then(function () {
            // Check to make sure the signin link goes "back"
            assert.equal(view.$('a[href="/signin"]').length, 0);
            assert.equal(view.$('a[href="/force_auth?email=testuser%40testuser.com"]').length, 1);
          });
      });

      it('`sign in` link goes to /oauth/signin in oauth flow', function () {
        sinon.stub(relier, 'isOAuth', function () {
          return true;
        });

        return view.render()
          .then(function () {
            // Check to make sure the signin link goes "back"
            assert.equal(view.$('a[href="/oauth/signin"]').length, 1);
            assert.equal(view.$('a[href="/signin"]').length, 0);
            assert.equal(view.$('a[href="/force_auth?email=testuser%40testuser.com"]').length, 0);
          });
      });
    });

    describe('_waitForVerification', function () {
      it('polls to check if user has verified, if not, retry', function () {
        var count = 0;
        fxaClient.isPasswordResetComplete.restore();
        sinon.stub(view.fxaClient, 'isPasswordResetComplete', function () {
          // force at least one cycle through the poll
          count++;
          return p(count === 2);
        });

        sinon.stub(view, 'setTimeout', function (callback) {
          callback();
        });

        return view._waitForVerification()
            .then(function () {
              assert.equal(view.fxaClient.isPasswordResetComplete.callCount, 2);
            });
      });
    });

    describe('render', function () {
      it('finishes non-OAuth flow at /reset_password_complete if user has verified in the same browser', function (done) {
        fxaClient.isPasswordResetComplete.restore();
        sinon.stub(fxaClient, 'isPasswordResetComplete', function () {
          // simulate the login occurring in another tab.
          interTabChannel.emit('login', {
            sessionToken: 'sessiontoken'
          });
          return p(true);
        });

        sinon.stub(relier, 'isOAuth', function () {
          return false;
        });

        sinon.stub(view, 'navigate', function (page) {
          TestHelpers.wrapAssertion(function () {
            assert.equal(page, 'reset_password_complete');
          }, done);
        });

        view.render();
      });

      it('finishes the OAuth flow if user has verified in the same browser', function (done) {
        fxaClient.isPasswordResetComplete.restore();
        sinon.stub(fxaClient, 'isPasswordResetComplete', function () {
          // simulate the sessionToken being set in another tab.
          // simulate the login occurring in another tab.
          interTabChannel.emit('login', {
            sessionToken: 'sessiontoken'
          });
          return p(true);
        });

        sinon.stub(relier, 'isOAuth', function () {
          return true;
        });

        sinon.stub(view, 'finishOAuthFlow', function () {
          done();
        });

        view.render();
      });

      it('finishes the Sync flow if user has verified in the same browser', function (done) {
        fxaClient.isPasswordResetComplete.restore();
        sinon.stub(fxaClient, 'isPasswordResetComplete', function () {
          // simulate the sessionToken being set in another tab.
          // simulate the login occurring in another tab.
          interTabChannel.emit('login', {
            sessionToken: 'sessiontoken'
          });
          return p(true);
        });

        sinon.stub(relier, 'isSync', function () {
          return true;
        });

        sinon.stub(fxaClient, 'notifyChannelOfLogin', function () {
          done();
        });

        view.render();
      });

      it('normal flow redirects to /signin if user verifies in a second browser', function (done) {
        sinon.stub(relier, 'isOAuth', function () {
          return false;
        });

        testSecondBrowserVerifyForcesSignIn('signin', done);
      });

      it('oauth flow redirects to /oauth/signin if user verifies in a second browser', function (done) {
        sinon.stub(relier, 'isOAuth', function () {
          return true;
        });

        testSecondBrowserVerifyForcesSignIn('oauth/signin', done);
      });

      function testSecondBrowserVerifyForcesSignIn(expectedPage, done) {
        fxaClient.isPasswordResetComplete.restore();
        sinon.stub(fxaClient, 'isPasswordResetComplete', function () {
          return p(true);
        });

        sinon.stub(view, 'setTimeout', function (callback) {
          callback();
        });

        sinon.stub(view, 'navigate', function (page) {
          TestHelpers.wrapAssertion(function () {
            assert.equal(page, expectedPage);
            // session.email is used to pre-fill the email on
            // the signin page.
            assert.equal(Session.prefillEmail, 'testuser@testuser.com');
          }, done);
        });

        // email is cleared in initial render in beforeEach, reset it to
        // see if it makes it through to the redirect.
        Session.set('email', 'testuser@testuser.com');
        view.render();
      }

      it('displays an error if isPasswordResetComplete blows up', function (done) {
        fxaClient.isPasswordResetComplete.restore();

        sinon.stub(fxaClient, 'isPasswordResetComplete', function () {
          return p().then(function () {
            throw AuthErrors.toError('UNEXPECTED_ERROR');
          });
        });

        sinon.stub(view, 'displayError', function () {
          // if isPasswordResetComplete blows up, it will be after
          // view.render()'s promise has already resolved. Wait for the
          // error to be displayed.
          done();
        });

        view.render();
      });
    });

    describe('submit', function () {
      it('resends the confirmation email, shows success message', function () {
        sinon.stub(fxaClient, 'passwordResetResend', function () {
          return p(true);
        });

        return view.submit()
          .then(function () {
            assert.isTrue(view.$('.success').is(':visible'));

            assert.isTrue(fxaClient.passwordResetResend.calledWith(
                relier));
          });
      });

      it('redirects to `/reset_password` if the resend token is invalid', function () {
        sinon.stub(fxaClient, 'passwordResetResend', function () {
          return p().then(function () {
            throw AuthErrors.toError('INVALID_TOKEN', 'Invalid token');
          });
        });

        return view.submit()
              .then(function () {
                assert.equal(routerMock.page, 'reset_password');

                assert.isTrue(TestHelpers.isEventLogged(metrics,
                                  'confirm_reset_password.resend'));
              });
      });

      it('displays other error messages if there is a problem', function () {
        sinon.stub(fxaClient, 'passwordResetResend', function () {
          return p().then(function () {
            throw new Error('synthesized error from auth server');
          });
        });

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
        var count = 0;
        view.validateAndSubmit = function () {
          count++;
        };

        view.$('section').click();
        assert.equal(count, 0);

        view.$('#resend').click();
        assert.equal(count, 1);
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
