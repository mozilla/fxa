/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define(function (require, exports, module) {
  'use strict';

  const { assert } = require('chai');
  const AuthErrors = require('lib/auth-errors');
  const Backbone = require('backbone');
  const Broker = require('models/auth_brokers/base');
  const FxaClient = require('../../mocks/fxa-client');
  const Metrics = require('lib/metrics');
  const Notifier = require('lib/channels/notifier');
  const p = require('lib/promise');
  const Relier = require('models/reliers/relier');
  const sinon = require('sinon');
  const Storage = require('lib/storage');
  const TestHelpers = require('../../lib/helpers');
  const User = require('models/user');
  const View = require('views/confirm_reset_password');
  const WindowMock = require('../../mocks/window');

  const EMAIL = 'testuser@testuser.com';
  const LOGIN_MESSAGE_TIMEOUT_MS = 300;
  const PASSWORD_FORGOT_TOKEN = 'fake password reset token';
  const VERIFICATION_POLL_TIMEOUT_MS = 100;

  describe('views/confirm_reset_password', function () {
    let broker;
    let fxaClient;
    let metrics;
    let model;
    let notifier;
    let relier;
    let user;
    let view;
    let windowMock;

    function createDeps() {
      destroyView();

      fxaClient = new FxaClient();
      model = new Backbone.Model();
      notifier = new Notifier();
      metrics = new Metrics({ notifier });
      relier = new Relier();
      windowMock = new WindowMock();

      sinon.stub(windowMock, 'setTimeout', window.setTimeout.bind(window));
      sinon.stub(windowMock, 'clearTimeout', window.clearTimeout.bind(window));

      broker = new Broker({
        relier: relier
      });

      user = new User({
        fxaClient: fxaClient,
        metrics: metrics,
        storage: Storage.factory('localStorage')
      });

      sinon.stub(fxaClient, 'isPasswordResetComplete', function () {
        return p(true);
      });

      model.set({
        email: EMAIL,
        passwordForgotToken: PASSWORD_FORGOT_TOKEN
      });

      createView();
    }

    function createView () {
      view = new View({
        broker: broker,
        fxaClient: fxaClient,
        loginMessageTimeoutMS: LOGIN_MESSAGE_TIMEOUT_MS,
        metrics: metrics,
        model: model,
        notifier: notifier,
        relier: relier,
        user: user,
        verificationPollMS: VERIFICATION_POLL_TIMEOUT_MS,
        viewName: 'confirm_reset_password',
        window: windowMock
      });
    }

    function destroyView () {
      if (view) {
        view.remove();
        view.destroy();
        view = null;
      }
    }

    beforeEach(createDeps);

    afterEach(function () {
      metrics.destroy();
      metrics = null;

      destroyView();
    });

    describe('render', function () {
      beforeEach(function () {
        sinon.spy(broker, 'persistVerificationData');

        return view.render();
      });

      it('redirects to /reset_password if no passwordForgotToken', function () {
        model.unset('passwordForgotToken');

        sinon.spy(view, 'navigate');

        return view.render()
          .then(function () {
            assert.isTrue(view.navigate.calledWith('reset_password'));
          });
      });

      it('`sign in` link goes to /signin in normal flow', function () {
        return view.render()
          .then(function () {
            // Check to make sure the normal signin link is drawn
            assert.equal(view.$('a[href="/signin"]').length, 1);
            assert.equal(view.$('a[href="/force_auth?email=testuser%40testuser.com"]').length, 0);
            assert.ok(view.$('#fxa-confirm-reset-password-header').length);
          });
      });

      it('`sign in` link goes to /force_auth in force auth flow', function () {
        sinon.stub(broker, 'isForceAuth', function () {
          return true;
        });

        return view.render()
          .then(function () {
            // Check to make sure the signin link goes "back"
            assert.equal(view.$('a[href="/signin"]').length, 0);
            assert.equal(view.$('a[href="/force_auth?email=testuser%40testuser.com"]').length, 1);
          });
      });

      it('does not allow XSS emails through for forceAuth', function () {
        sinon.stub(broker, 'isForceAuth', function () {
          return true;
        });

        var xssEmail = 'testuser@testuser.com" onclick="javascript:alert(1)"';

        model.set('email', xssEmail);

        return view.render()
          .then(function () {
            assert.equal(view.$('a.sign-in').attr('href'), '/force_auth?email=' + encodeURIComponent(xssEmail));
            assert.isFalse(!! view.$('a.sign-in').attr('onclick'));
          });
      });

      describe('sign-in button', function () {
        describe('with relier.resetPasswordConfirm===true', function () {
          beforeEach(function () {
            relier.set('resetPasswordConfirm', true);
            return view.render();
          });

          it('is visible', function () {
            assert.ok(view.$('.sign-in').length);
          });
        });

        describe('with relier.resetPasswordConfirm===false', function () {
          beforeEach(function () {
            relier.set('resetPasswordConfirm', false);
            return view.render();
          });

          it('is not visible', function () {
            assert.equal(view.$('.sign-in').length, 0);
          });
        });
      });
    });

    describe('afterVisible', function () {
      beforeEach(function () {
        sinon.spy(broker, 'persistVerificationData');
      });

      afterEach(function () {
        destroyView();
      });

      it('calls `_finishPasswordResetSameBrowser` if `_waitForConfirmation` returns session info', function () {
        var sessionInfo = { sessionToken: 'sessiontoken' };

        sinon.stub(view, '_waitForConfirmation', function () {
          return p(sessionInfo);
        });

        sinon.stub(view, '_finishPasswordResetSameBrowser', function () {
          return p();
        });

        return view.afterVisible()
          .then(function () {
            assert.isTrue(broker.persistVerificationData.called);
            assert.isTrue(
              view._finishPasswordResetSameBrowser.calledWith(sessionInfo));
            assert.isTrue(TestHelpers.isEventLogged(
              metrics, 'confirm_reset_password.verification.success'));
          });
      });

      it('calls `_finishPasswordResetDifferentBrowser` if `_waitForConfirmation` does not return session info', function () {
        sinon.stub(view, '_waitForConfirmation', function () {
          return p(null);
        });

        sinon.stub(view, '_finishPasswordResetDifferentBrowser', function () {
          return p();
        });


        return view.afterVisible()
          .then(function () {
            assert.isTrue(broker.persistVerificationData.called);
            assert.isTrue(
              view._finishPasswordResetDifferentBrowser.called);
            assert.isTrue(TestHelpers.isEventLogged(
              metrics, 'confirm_reset_password.verification.success'));
          });
      });

      it('sets the `resetPasswordConfirm` flag back to `true` after the reset completes', function () {
        sinon.stub(view, '_waitForConfirmation', function () {
          return p(null);
        });

        sinon.stub(view, '_finishPasswordResetDifferentBrowser', function () {
          return p();
        });

        relier.set('resetPasswordConfirm', false);

        return view.afterVisible()
          .then(function () {
            assert.equal(relier.get('resetPasswordConfirm'), true);
            assert.isTrue(TestHelpers.isEventLogged(
              metrics, 'confirm_reset_password.verification.success'));
          });
      });

      it('displays errors if `_waitForConfirmation` returns an error', function () {
        sinon.stub(view, '_waitForConfirmation', function () {
          return p.reject(AuthErrors.toError('UNEXPECTED_ERROR'));
        });

        sinon.spy(view, 'displayError');

        return view.afterVisible()
          .then(function () {
            var err = view.displayError.args[0][0];
            assert.isTrue(AuthErrors.is(err, 'UNEXPECTED_ERROR'));

            assert.isTrue(broker.persistVerificationData.called);
            assert.isFalse(TestHelpers.isEventLogged(
              metrics, 'confirm_reset_password.verification.success'));
          });
      });
    });

    describe('_waitForConfirmation', function () {
      beforeEach(function () {
        fxaClient.isPasswordResetComplete.restore();
      });

      it('waits for the server confirmation if `complete_reset_password_tab_open` message is not received', function () {
        sinon.stub(fxaClient, 'isPasswordResetComplete', function () {
          return p(fxaClient.isPasswordResetComplete.callCount === 3);
        });

        return view._waitForConfirmation()
          .then(function (sessionInfo) {
            assert.isNull(sessionInfo);
          });
      });

      it('stops waiting if server returns an error', function () {
        sinon.stub(fxaClient, 'isPasswordResetComplete', function () {
          return p.reject(AuthErrors.toError('UNEXPECTED_ERROR'));
        });

        sinon.spy(view, '_stopWaiting');
        return view._waitForConfirmation()
          .then(assert.fail, function (err) {
            assert.isTrue(AuthErrors.is(err, 'UNEXPECTED_ERROR'));
            assert.isTrue(view._stopWaiting.called);
          });
      });

      it('waits for the `SIGNED_IN` if a `COMPLETE_RESET_PASSWORD_TAB_OPEN` is received while an XHR request is outstanding', function () {
        sinon.stub(fxaClient, 'isPasswordResetComplete', function () {
          // synthesize the message received while the 2nd XHR request is
          // outstanding.
          if (fxaClient.isPasswordResetComplete.callCount === 2) {
            notifier.trigger(Notifier.COMPLETE_RESET_PASSWORD_TAB_OPEN);
            return p(false).delay(100);
          }

          return p(false);
        });

        setTimeout(function () {
          notifier.trigger(Notifier.SIGNED_IN, {
            sessionToken: 'sessiontoken'
          });
        }, VERIFICATION_POLL_TIMEOUT_MS * 4);

        return view._waitForConfirmation()
          .then(function (sessionInfo) {
            assert.equal(fxaClient.isPasswordResetComplete.callCount, 2);
            assert.equal(sessionInfo.sessionToken, 'sessiontoken');
          });
      });

      it('waits for the `SIGNED_IN` notification if a `COMPLETE_RESET_PASSWORD_TAB_OPEN` notification is received', function () {
        sinon.stub(fxaClient, 'isPasswordResetComplete', function () {
          if (fxaClient.isPasswordResetComplete.callCount === 2) {
            // synthesize message sent afterr response received.
            setTimeout(function () {
              notifier.trigger(Notifier.COMPLETE_RESET_PASSWORD_TAB_OPEN);
            }, 10);
          }

          return p(false);
        });

        setTimeout(function () {
          notifier.trigger(Notifier.SIGNED_IN, {
            sessionToken: 'sessiontoken'
          });
        }, VERIFICATION_POLL_TIMEOUT_MS * 4);

        return view._waitForConfirmation()
          .then(function (sessionInfo) {
            assert.equal(fxaClient.isPasswordResetComplete.callCount, 2);
            assert.equal(sessionInfo.sessionToken, 'sessiontoken');
          });
      });
    });


    describe('_finishPasswordResetDifferentBrowser', function () {
      it('redirects to page specified by broker if user verifies in a second browser', function () {
        sinon.stub(broker, 'transformLink', function () {
          // synthesize the OAuth broker.
          return '/oauth/signin';
        });

        sinon.spy(view, 'navigate');

        view._finishPasswordResetDifferentBrowser();

        // leading slash should be removed from the url.
        assert(view.navigate.calledWith('oauth/signin'));
      });
    });

    describe('_finishPasswordResetSameBrowser', function () {
      beforeEach(function () {
        sinon.stub(broker, 'afterResetPasswordConfirmationPoll', function () {
          return p();
        });

        sinon.stub(user, 'setSignedInAccount', function (account) {
          return p(account);
        });

        sinon.stub(view, 'navigate', function () {
          // nothing to do
        });

        var account = user.initAccount({
          uid: 'uid'
        });

        return user.setAccount(account);
      });

      describe('with an unknown account uid', function () {
        beforeEach(() => {
          return view._finishPasswordResetSameBrowser({ uid: 'unknown uid' });
        });

        it('sets the account, notifies the broker', function () {
          assert.isTrue(user.setSignedInAccount.calledOnce);
          assert.equal(user.setSignedInAccount.args[0][0].get('uid'), 'unknown uid');
          assert.isTrue(broker.afterResetPasswordConfirmationPoll.calledOnce);
        });
      });

      describe('broker does not halt', function () {
        beforeEach(function () {
          user._persistAccount({
            displayName: 'fx user',
            email: 'a@a.com',
            uid: 'uid'
          });

          return view._finishPasswordResetSameBrowser({
            keyFetchToken: 'keyfetchtoken',
            uid: 'uid',
            unwrapBKey: 'unwrapbkey'
          });
        });

        it('notifies, redirects to reset_password_confirmed', () => {
          assert.isTrue(user.setSignedInAccount.called);
          var account = user.setSignedInAccount.args[0][0];

          assert.deepEqual(
            account.pick('displayName', 'email', 'keyFetchToken', 'uid', 'unwrapBKey'),
            {
              displayName: 'fx user',
              email: 'a@a.com',
              keyFetchToken: 'keyfetchtoken',
              uid: 'uid',
              unwrapBKey: 'unwrapbkey'
            }
          );

          assert.isTrue(broker.afterResetPasswordConfirmationPoll.called);
          assert.isTrue(view.navigate.calledWith('reset_password_confirmed'));
        });
      });
    });

    describe('resend', function () {
      beforeEach(function () {
        return view.render();
      });

      it('resends the confirmation email, shows success message', function () {
        sinon.stub(view, 'retryResetPassword', function () {
          return p(true);
        });

        return view.resend()
          .then(function () {
            assert.isTrue(view.retryResetPassword.calledOnce);
            assert.isTrue(view.retryResetPassword.calledWith(
              EMAIL,
              PASSWORD_FORGOT_TOKEN
            ));
          });
      });

      it('redirects to `/reset_password` if the resend token is invalid', function () {
        sinon.stub(view, 'retryResetPassword', function () {
          return p.reject(AuthErrors.toError('INVALID_TOKEN', 'Invalid token'));
        });

        sinon.spy(view, 'navigate');

        return view.resend()
          .then(function () {
            assert.isTrue(view.navigate.calledWith('reset_password'));
          });
      });

      it('re-throws other errors', function () {
        sinon.stub(view, 'retryResetPassword', function () {
          return p.reject(new Error('synthesized error from auth server'));
        });

        return view.resend()
          .then(assert.fail, function (err) {
            assert.equal(err.message, 'synthesized error from auth server');
          });
      });
    });

    describe('openWebmail feature', function () {
      it('it is not visible in basic contexts', function () {
        assert.lengthOf($('#open-webmail'), 0);
      });

      it('is visible with the the openGmailButtonVisible capability and email is @gmail.com', function () {
        broker.setCapability('openWebmailButtonVisible', true);
        model.set('email', 'a@gmail.com');

        return view.render()
          .then(() => {
            assert.lengthOf(view.$('#open-webmail'), 1);
          });
      });
    });
  });
});
