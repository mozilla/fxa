/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import $ from 'jquery';
import { assert } from 'chai';
import AuthErrors from 'lib/auth-errors';
import Broker from 'models/auth_brokers/base';
import FxaClient from 'lib/fxa-client';
import Metrics from 'lib/metrics';
import Notifier from 'lib/channels/notifier';
import Relier from 'models/reliers/relier';
import SentryMetrics from 'lib/sentry';
import sinon from 'sinon';
import TestHelpers from '../../lib/helpers';
import User from 'models/user';
import View from 'views/complete_reset_password';
import WindowMock from '../../mocks/window';

describe('views/complete_reset_password', () => {
  const CODE = 'dea0fae1abc2fab3bed4dec5eec6ace7';
  const EMAIL = 'testuser@testuser.com';
  const PASSWORD = 'password';
  const TOKEN = 'feed';

  let broker;
  let fxaClient;
  let isPasswordResetComplete;
  let metrics;
  let notifier;
  let relier;
  let sentryMetrics;
  let user;
  let view;
  let windowMock;

  function testEventNotLogged(eventName) {
    assert.isFalse(TestHelpers.isEventLogged(metrics, eventName));
  }

  function testErrorLogged(error) {
    const normalizedError = view._normalizeError(error);
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
      window: windowMock,
    });

    sinon
      .stub(view, '_createPasswordWithStrengthBalloonView')
      .callsFake(() => ({
        afterRender() {},
        on() {},
      }));
  }

  beforeEach(() => {
    broker = new Broker();
    fxaClient = new FxaClient();
    notifier = new Notifier();
    sentryMetrics = new SentryMetrics();
    metrics = new Metrics({ notifier, sentryMetrics });
    // prevents metrics from being flushed
    // so we can check if they were emit
    sinon.stub(metrics, 'flush');

    relier = new Relier();
    user = new User({
      fxaClient: fxaClient,
      metrics: metrics,
      notifier: notifier,
    });
    windowMock = new WindowMock();
    windowMock.location.search =
      '?code=dea0fae1abc2fab3bed4dec5eec6ace7&email=testuser@testuser.com&token=feed';

    // mock in isPasswordResetComplete
    isPasswordResetComplete = false;

    initView();

    sinon.stub(fxaClient, 'isPasswordResetComplete').callsFake(() => {
      return Promise.resolve(isPasswordResetComplete);
    });

    sinon.stub(fxaClient, 'recoveryKeyExists').callsFake(() => {
      return Promise.resolve({ exists: false });
    });

    return view.render().then(() => $('#container').html(view.$el));
  });

  afterEach(() => {
    metrics.destroy();

    view.remove();
    view.destroy();

    view = windowMock = metrics = null;
  });

  describe('beforeRender', () => {
    beforeEach(() => {
      sinon.spy(view, 'logViewEvent');
      return view.beforeRender();
    });

    it('emits verification.clicked event correctly', () => {
      assert.equal(view.logViewEvent.callCount, 1);
      const args = view.logViewEvent.args[0];
      assert.equal(args.length, 1);
      assert.equal(args[0], 'verification.clicked');
    });
  });

  describe('render', () => {
    it('shows form if token, code and email are all present', () => {
      return view.render().then(() => {
        testEventNotLogged('complete_reset_password.link_expired');
        assert.ok(view.$('#fxa-complete-reset-password-header').length);
        assert.equal(view.$('input[type=email]').val(), EMAIL);
      });
    });

    it('shows malformed screen if the token is missing', () => {
      windowMock.location.search = TestHelpers.toSearchString({
        code: 'faea',
        email: 'testuser@testuser.com',
      });

      initView();
      return view.render().then(() => {
        testErrorLogged(AuthErrors.toError('DAMAGED_VERIFICATION_LINK'));
        assert.ok(view.$('#fxa-reset-link-damaged-header').length);
      });
    });

    it('shows malformed screen if the token is invalid', () => {
      windowMock.location.search = TestHelpers.toSearchString({
        // not a hex string
        code: 'dea0fae1abc2fab3bed4dec5eec6ace7',
        email: 'testuser@testuser.com',
        token: 'invalid_token',
      });

      initView();
      return view.render().then(() => {
        testErrorLogged(AuthErrors.toError('DAMAGED_VERIFICATION_LINK'));
        assert.ok(view.$('#fxa-reset-link-damaged-header').length);
      });
    });

    it('shows malformed screen if the code is missing', () => {
      windowMock.location.search = TestHelpers.toSearchString({
        email: 'testuser@testuser.com',
        token: 'feed',
      });

      initView();
      return view.render().then(() => {
        testErrorLogged(AuthErrors.toError('DAMAGED_VERIFICATION_LINK'));
        assert.ok(view.$('#fxa-reset-link-damaged-header').length);
      });
    });

    it('shows malformed screen if the code is invalid', () => {
      windowMock.location.search = TestHelpers.toSearchString({
        code: 'invalid_code',
        // not a hex string
        email: 'testuser@testuser.com',
        token: 'feed',
      });

      initView();
      return view.render().then(() => {
        testErrorLogged(AuthErrors.toError('DAMAGED_VERIFICATION_LINK'));
        assert.ok(view.$('#fxa-reset-link-damaged-header').length);
      });
    });

    it('shows malformed screen if the email is missing', () => {
      windowMock.location.search =
        '?token=feed&code=dea0fae1abc2fab3bed4dec5eec6ace7';
      initView();
      return view.render().then(() => {
        testErrorLogged(AuthErrors.toError('DAMAGED_VERIFICATION_LINK'));
        assert.ok(view.$('#fxa-reset-link-damaged-header').length);
      });
    });

    it('shows malformed screen if the email is invalid', () => {
      windowMock.location.search = TestHelpers.toSearchString({
        code: 'dea0fae1abc2fab3bed4dec5eec6ace7',
        email: 'does_not_validate',
        token: 'feed',
      });

      initView();
      return view.render().then(() => {
        testErrorLogged(AuthErrors.toError('DAMAGED_VERIFICATION_LINK'));
        assert.ok(view.$('#fxa-reset-link-damaged-header').length);
      });
    });

    it('shows the expired screen if the token has already been used', () => {
      isPasswordResetComplete = true;
      return view.render().then(() => {
        testErrorLogged(AuthErrors.toError('EXPIRED_VERIFICATION_LINK'));
        assert.ok(view.$('#fxa-reset-link-expired-header').length);
      });
    });

    it('shows the Sync warning by default', () => {
      return view.render().then(() => {
        assert.ok(view.$('.reset-warning').length);
      });
    });

    it('does not show the Sync warning if relier.resetPasswordConfirm === false', () => {
      relier.set('resetPasswordConfirm', false);
      return view.render().then(() => {
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
      assert.equal(notifier.trigger.callCount, 2);
      assert.equal(notifier.trigger.args[0][0], 'flow.initialize');
    });
  });

  describe('isValidEnd', () => {
    it('returns true if password & vpassword valid and the same', () => {
      view.$('#password').val(PASSWORD);
      view.$('#vpassword').val(PASSWORD);
      assert.isTrue(view.isValidEnd());
    });

    it('returns false if password & vpassword are different', () => {
      view.$('#password').val('password');
      view.$('#vpassword').val('other_password');
      assert.isFalse(view.isValidEnd());
    });

    it('returns false if password invalid', () => {
      view.$('#password').val('passwor');
      view.$('#vpassword').val('password');
      assert.isFalse(view.isValidEnd());
    });

    it('returns false if vpassword invalid', () => {
      view.$('#password').val('password');
      view.$('#vpassword').val('passwor');
      assert.isFalse(view.isValidEnd());
    });
  });

  describe('showValidationErrorsEnd', () => {
    beforeEach(() => {
      sinon.stub(view, 'displayError');
    });

    it('shows an error if the password is invalid', () => {
      view.$('#password').val('passwor');
      view.$('#vpassword').val('password');

      view.showValidationErrorsEnd();

      assert.isTrue(view.displayError.calledOnce);
      assert.isTrue(
        AuthErrors.is(view.displayError.args[0][0], 'PASSWORDS_DO_NOT_MATCH')
      );
    });
  });

  describe('validateAndSubmit', () => {
    beforeEach(() => {
      sinon.stub(view, 'isValidStart').callsFake(() => true);
      sinon.stub(view, 'showValidationErrorsStart').callsFake(() => false);
    });

    it('shows an error if passwords are different', () => {
      view.$('#password').val('password123123');
      view.$('#vpassword').val('password2');

      return view.validateAndSubmit().then(
        () => {
          assert(false, 'unexpected success');
        },
        () => {
          assert.ok(view.$('.error').text().length);
        }
      );
    });

    describe('broker does not halt', () => {
      beforeEach(() => {
        view.$('[type=password]').val(PASSWORD);

        sinon
          .stub(user, 'completeAccountPasswordReset')
          .callsFake(function (account) {
            account.set('verified', true);
            return Promise.resolve(account);
          });

        sinon.stub(user, 'setSignedInAccount').callsFake(function (newAccount) {
          return Promise.resolve(newAccount);
        });

        sinon.spy(broker, 'afterCompleteResetPassword');

        sinon.spy(view, 'navigate');

        return view.validateAndSubmit();
      });

      it('completes, notifies, redirects to reset_password_verified', () => {
        const args = user.completeAccountPasswordReset.args[0];
        assert.isTrue(user.completeAccountPasswordReset.called);
        const account = args[0];
        assert.equal(account.get('email'), EMAIL);

        const password = args[1];
        assert.equal(password, PASSWORD);

        const token = args[2];
        assert.equal(token, TOKEN);

        const code = args[3];
        assert.equal(code, CODE);

        assert.isTrue(
          TestHelpers.isEventLogged(
            metrics,
            'complete_reset_password.verification.success'
          )
        );

        assert.isTrue(view.navigate.calledWith('reset_password_verified'));

        return user.completeAccountPasswordReset.returnValues[0].then(function (
          returnValue
        ) {
          assert.isTrue(
            broker.afterCompleteResetPassword.calledWith(returnValue)
          );
        });
      });
    });

    describe('access with `resetPasswordConfirm` set to `false`', () => {
      beforeEach(() => {
        relier.set('resetPasswordConfirm', false);

        view.$('[type=password]').val(PASSWORD);

        sinon
          .stub(user, 'completeAccountPasswordReset')
          .callsFake(function (account) {
            return Promise.resolve(account);
          });

        sinon.stub(user, 'setSignedInAccount').callsFake(function (newAccount) {
          return Promise.resolve(newAccount);
        });

        return view.validateAndSubmit();
      });

      it('sets `resetPasswordConfirm` back to `true` when the reset completes', () => {
        assert.equal(relier.get('resetPasswordConfirm'), true);
      });
    });

    it('reload view to allow user to resend an email on INVALID_TOKEN error', () => {
      view.$('[type=password]').val('password');

      sinon.stub(fxaClient, 'completePasswordReset').callsFake(() => {
        return Promise.reject(AuthErrors.toError('INVALID_TOKEN'));
      });

      // isPasswordResetComplete needs to be overridden as well for when
      // render is re-loaded the token needs to be expired.
      fxaClient.isPasswordResetComplete = () => {
        return Promise.resolve(true);
      };

      return view.validateAndSubmit().then(() => {
        assert.ok(view.$('#fxa-reset-link-expired-header').length);
      });
    });

    it('shows error message if server returns an error', () => {
      view.$('[type=password]').val('password');

      sinon.stub(fxaClient, 'completePasswordReset').callsFake(() => {
        return Promise.reject(new Error('uh oh'));
      });

      return view.validateAndSubmit().then(assert.fail, () => {
        assert.ok(view.$('.error').text().length);
      });
    });
  });

  describe('resend', () => {
    it('delegates to the `resetPassword` method', () => {
      sinon.stub(view, 'resetPassword').callsFake(() => {
        return Promise.resolve();
      });

      return view.resend().then(() => {
        assert.isTrue(view.resetPassword.calledOnce);
        assert.isTrue(view.resetPassword.calledWith(EMAIL));
      });
    });

    it('re-throws all errors', () => {
      sinon.stub(view, 'resetPassword').callsFake(() => {
        return Promise.reject(new Error('server error'));
      });

      return view.resend().then(assert.fail, (err) => {
        assert.equal(err.message, 'server error');
      });
    });
  });
});
