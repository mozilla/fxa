/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define(function (require, exports, module) {
  'use strict';

  const { assert } = require('chai');
  const AuthErrors = require('lib/auth-errors');
  const Broker = require('models/auth_brokers/base');
  const FxaClient = require('lib/fxa-client');
  const Metrics = require('lib/metrics');
  const Notifier = require('lib/channels/notifier');
  const p = require('lib/promise');
  const Relier = require('models/reliers/relier');
  const SentryMetrics = require('lib/sentry');
  const sinon = require('sinon');
  const TestHelpers = require('../../lib/helpers');
  const User = require('models/user');
  const View = require('views/complete_reset_password');
  const WindowMock = require('../../mocks/window');

  const wrapAssertion = TestHelpers.wrapAssertion;

  describe('views/complete_reset_password', function () {
    var CODE = 'dea0fae1abc2fab3bed4dec5eec6ace7';
    var EMAIL = 'testuser@testuser.com';
    var PASSWORD = 'password';
    var TOKEN = 'feed';

    var broker;
    var fxaClient;
    var isPasswordResetComplete;
    var metrics;
    var notifier;
    var relier;
    var sentryMetrics;
    var user;
    var view;
    var windowMock;

    function testEventNotLogged(eventName) {
      assert.isFalse(TestHelpers.isEventLogged(metrics, eventName));
    }

    function testErrorLogged(error) {
      var normalizedError = view._normalizeError(error);
      assert.isTrue(TestHelpers.isErrorLogged(metrics, normalizedError));
    }

    function initView() {
      view = new View({
        broker: broker,
        metrics: metrics,
        notifier: notifier,
        relier: relier,
        user: user,
        viewName: 'complete_reset_password',
        window: windowMock
      });
    }

    beforeEach(function () {
      broker = new Broker();
      fxaClient = new FxaClient();
      notifier = new Notifier();
      sentryMetrics = new SentryMetrics();
      metrics = new Metrics({ notifier, sentryMetrics });
      relier = new Relier();
      user = new User({
        fxaClient: fxaClient,
        metrics: metrics,
        notifier: notifier
      });
      windowMock = new WindowMock();
      windowMock.location.search = '?code=dea0fae1abc2fab3bed4dec5eec6ace7&email=testuser@testuser.com&token=feed';


      // mock in isPasswordResetComplete
      isPasswordResetComplete = false;

      initView();

      sinon.stub(fxaClient, 'isPasswordResetComplete', function () {
        return p(isPasswordResetComplete);
      });

      return view.render()
        .then(() => $('#container').html(view.$el));
    });

    afterEach(function () {
      metrics.destroy();

      view.remove();
      view.destroy();

      view = windowMock = metrics = null;
    });

    describe('render', function () {
      it('shows form if token, code and email are all present', function () {
        return view.render()
          .then(function () {
            testEventNotLogged('complete_reset_password.link_expired');
            assert.ok(view.$('#fxa-complete-reset-password-header').length);
            assert.equal(view.$('input[type=email]').val(), EMAIL);
          });
      });

      it('shows malformed screen if the token is missing', function () {
        windowMock.location.search = TestHelpers.toSearchString({
          code: 'faea',
          email: 'testuser@testuser.com'
        });

        initView();
        return view.render()
          .then(function () {
            testErrorLogged(AuthErrors.toError('DAMAGED_VERIFICATION_LINK'));
            assert.ok(view.$('#fxa-reset-link-damaged-header').length);
          });
      });

      it('shows malformed screen if the token is invalid', function () {
        windowMock.location.search = TestHelpers.toSearchString({
          // not a hex string
          code: 'dea0fae1abc2fab3bed4dec5eec6ace7',
          email: 'testuser@testuser.com',
          token: 'invalid_token'
        });

        initView();
        return view.render()
          .then(function () {
            testErrorLogged(AuthErrors.toError('DAMAGED_VERIFICATION_LINK'));
            assert.ok(view.$('#fxa-reset-link-damaged-header').length);
          });
      });

      it('shows malformed screen if the code is missing', function () {
        windowMock.location.search = TestHelpers.toSearchString({
          email: 'testuser@testuser.com',
          token: 'feed'
        });

        initView();
        return view.render()
          .then(function () {
            testErrorLogged(AuthErrors.toError('DAMAGED_VERIFICATION_LINK'));
            assert.ok(view.$('#fxa-reset-link-damaged-header').length);
          });
      });

      it('shows malformed screen if the code is invalid', function () {
        windowMock.location.search = TestHelpers.toSearchString({
          code: 'invalid_code',
          // not a hex string
          email: 'testuser@testuser.com',
          token: 'feed'
        });

        initView();
        return view.render()
          .then(function () {
            testErrorLogged(AuthErrors.toError('DAMAGED_VERIFICATION_LINK'));
            assert.ok(view.$('#fxa-reset-link-damaged-header').length);
          });
      });

      it('shows malformed screen if the email is missing', function () {
        windowMock.location.search = '?token=feed&code=dea0fae1abc2fab3bed4dec5eec6ace7';
        initView();
        return view.render()
          .then(function () {
            testErrorLogged(AuthErrors.toError('DAMAGED_VERIFICATION_LINK'));
            assert.ok(view.$('#fxa-reset-link-damaged-header').length);
          });
      });

      it('shows malformed screen if the email is invalid', function () {
        windowMock.location.search = TestHelpers.toSearchString({
          code: 'dea0fae1abc2fab3bed4dec5eec6ace7',
          email: 'does_not_validate',
          token: 'feed'
        });

        initView();
        return view.render()
          .then(function () {
            testErrorLogged(AuthErrors.toError('DAMAGED_VERIFICATION_LINK'));
            assert.ok(view.$('#fxa-reset-link-damaged-header').length);
          });
      });

      it('shows the expired screen if the token has already been used', function () {
        isPasswordResetComplete = true;
        return view.render()
          .then(function () {
            testErrorLogged(AuthErrors.toError('EXPIRED_VERIFICATION_LINK'));
            assert.ok(view.$('#fxa-reset-link-expired-header').length);
          });
      });

      it('shows the Sync warning by default', function () {
        return view.render()
          .then(function () {
            assert.ok(view.$('.reset-warning').length);
          });
      });

      it('does not show the Sync warning if relier.resetPasswordConfirm === false', function () {
        relier.set('resetPasswordConfirm', false);
        return view.render()
          .then(function () {
            assert.equal(view.$('.reset-warning').length, 0);
          });
      });
    });

    describe('afterRender', () => {
      beforeEach(() => {
        sinon.spy(notifier, 'trigger');
        return view.afterRender();
      });

      it('called notifier.trigger correctly', () => {
        assert.equal(notifier.trigger.callCount, 1);
        assert.equal(notifier.trigger.args[0][0], 'flow.initialize');
      });
    });

    describe('isValid', function () {
      it('returns true if password & vpassword valid and the same', function () {
        view.$('#password').val(PASSWORD);
        view.$('#vpassword').val(PASSWORD);
        assert.isTrue(view.isValid());
      });

      it('returns false if password & vpassword are different', function () {
        view.$('#password').val('password');
        view.$('#vpassword').val('other_password');
        assert.isFalse(view.isValid());
      });

      it('returns false if password invalid', function () {
        view.$('#password').val('passwor');
        view.$('#vpassword').val('password');
        assert.isFalse(view.isValid());
      });

      it('returns false if vpassword invalid', function () {
        view.$('#password').val('password');
        view.$('#vpassword').val('passwor');
        assert.isFalse(view.isValid());
      });
    });

    describe('showValidationErrors', function () {
      it('shows an error if the password is invalid', function (done) {
        view.$('#password').val('passwor');
        view.$('#vpassword').val('password');

        view.on('validation_error', function (which, msg) {
          wrapAssertion(function () {
            assert.ok(msg);
          }, done);
        });

        view.showValidationErrors();
      });

      it('shows an error if the vpassword is invalid', function (done) {
        view.$('#password').val('password');
        view.$('#vpassword').val('passwor');

        view.on('validation_error', function (which, msg) {
          wrapAssertion(function () {
            assert.ok(msg);
          }, done);
        });

        view.showValidationErrors();
      });
    });

    describe('validateAndSubmit', function () {
      it('shows an error if passwords are different', function () {
        view.$('#password').val('password1');
        view.$('#vpassword').val('password2');

        return view.validateAndSubmit()
            .then(function () {
              assert(false, 'unexpected success');
            }, function () {
              assert.ok(view.$('.error').text().length);
            });
      });

      describe('broker does not halt', function () {
        beforeEach(function () {
          view.$('[type=password]').val(PASSWORD);
          view.enableForm();

          sinon.stub(user, 'completeAccountPasswordReset', function (account) {
            account.set('verified', true);
            return p(account);
          });

          sinon.stub(user, 'setSignedInAccount', function (newAccount) {
            return p(newAccount);
          });

          sinon.spy(broker, 'afterCompleteResetPassword');

          sinon.spy(view, 'navigate');

          return view.validateAndSubmit();
        });

        it('completes, notifies, redirects to reset_password_verified', function () {
          var args = user.completeAccountPasswordReset.args[0];
          assert.isTrue(user.completeAccountPasswordReset.called);
          var account = args[0];
          assert.equal(account.get('email'), EMAIL);

          var password = args[1];
          assert.equal(password, PASSWORD);

          var token = args[2];
          assert.equal(token, TOKEN);

          var code = args[3];
          assert.equal(code, CODE);

          assert.isTrue(TestHelpers.isEventLogged(
            metrics, 'complete_reset_password.verification.success'));

          assert.isTrue(view.navigate.calledWith('reset_password_verified'));

          return user.completeAccountPasswordReset.returnValues[0].then(function (returnValue) {
            assert.isTrue(broker.afterCompleteResetPassword.calledWith(returnValue));
          });
        });
      });

      describe('access with `resetPasswordConfirm` set to `false`', function () {
        beforeEach(function () {
          relier.set('resetPasswordConfirm', false);

          view.$('[type=password]').val(PASSWORD);
          view.enableForm();

          sinon.stub(user, 'completeAccountPasswordReset', function (account) {
            return p(account);
          });

          sinon.stub(user, 'setSignedInAccount', function (newAccount) {
            return p(newAccount);
          });

          return view.validateAndSubmit();
        });

        it('sets `resetPasswordConfirm` back to `true` when the reset completes', function () {
          assert.equal(relier.get('resetPasswordConfirm'), true);
        });
      });

      it('reload view to allow user to resend an email on INVALID_TOKEN error', function () {
        view.$('[type=password]').val('password');
        view.enableForm();

        sinon.stub(fxaClient, 'completePasswordReset', function () {
          return p.reject(AuthErrors.toError('INVALID_TOKEN'));
        });

        // isPasswordResetComplete needs to be overridden as well for when
        // render is re-loaded the token needs to be expired.
        fxaClient.isPasswordResetComplete = function () {
          return p(true);
        };

        return view.validateAndSubmit()
            .then(function () {
              assert.ok(view.$('#fxa-reset-link-expired-header').length);
            });
      });

      it('shows error message if server returns an error', function () {
        view.$('[type=password]').val('password');
        view.enableForm();

        sinon.stub(fxaClient, 'completePasswordReset', function () {
          return p.reject(new Error('uh oh'));
        });

        return view.validateAndSubmit()
            .then(assert.fail, function () {
              assert.ok(view.$('.error').text().length);
            });
      });
    });

    describe('resend', function () {
      it('delegates to the `resetPassword` method', function () {
        sinon.stub(view, 'resetPassword', function () {
          return p();
        });

        return view.resend()
          .then(function () {
            assert.isTrue(view.resetPassword.calledOnce);
            assert.isTrue(view.resetPassword.calledWith(EMAIL));
          });
      });

      it('re-throws all errors', function () {
        sinon.stub(view, 'resetPassword', function () {
          return p.reject(new Error('server error'));
        });

        return view.resend()
          .then(assert.fail, (err) => {
            assert.equal(err.message, 'server error');
          });
      });
    });
  });
});
