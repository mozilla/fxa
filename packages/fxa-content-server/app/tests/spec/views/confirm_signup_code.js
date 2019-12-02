/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import _ from 'underscore';
import { assert } from 'chai';
import AuthErrors from 'lib/auth-errors';
import Backbone from 'backbone';
import BaseBroker from 'models/auth_brokers/base';
import Constants from 'lib/constants';
import helpers from '../../lib/helpers';
import Metrics from 'lib/metrics';
import Relier from 'models/reliers/relier';
import sinon from 'sinon';
import SentryMetrics from 'lib/sentry';
import User from 'models/user';
import View from 'views/confirm_signup_code';
import WindowMock from '../../mocks/window';

const { createRandomString } = helpers;

const CODE = createRandomString(Constants.SIGNUP_CODE_LENGTH, 10);

describe('views/confirm_signup_code', () => {
  let account;
  let broker;
  let metrics;
  let model;
  let notifier;
  let relier;
  let sentryMetrics;
  let user;
  let view;
  let windowMock;

  beforeEach(() => {
    windowMock = new WindowMock();
    user = new User();
    sentryMetrics = new SentryMetrics();

    relier = new Relier({
      window: windowMock,
      service: 'sync',
    });

    broker = new BaseBroker({
      relier,
      window: windowMock,
    });

    account = user.initAccount({
      email: 'a@a.com',
      sessionToken: 'fake session token',
      uid: 'uid',
    });

    model = new Backbone.Model({
      account,
    });

    notifier = _.extend({}, Backbone.Events);
    metrics = new Metrics({ notifier, sentryMetrics });

    view = new View({
      broker,
      metrics,
      model,
      notifier,
      relier,
      user,
      viewName: 'confirm-signup-code',
      window: windowMock,
    });

    return view.render();
  });

  afterEach(function() {
    metrics.destroy();
    view.remove();
    view.destroy();
    view = metrics = null;
  });

  describe('render', () => {
    it('renders the view', () => {
      assert.lengthOf(
        view.$('#fxa-confirm-signup-code-header'),
        1,
        'has header'
      );
      assert.lengthOf(view.$('.otp-code'), 1, 'has input');
      assert.include(
        view.$('.verification-email-message').text(),
        'a@a.com',
        'has email'
      );
      assert.lengthOf(view.$('.step-3'), 0, 'no progress indicator');
    });

    describe('without a session', () => {
      beforeEach(function() {
        model.unset('account');
        view = new View({
          relier,
          broker,
          model,
          notifier,
          user,
          window: windowMock,
        });

        sinon.spy(view, 'navigate');

        return view.render();
      });

      it('redirects to the signup page', () => {
        assert.isTrue(view.navigate.calledWith('signup'));
      });
    });
  });

  describe('afterVisible', () => {
    it('notifies the broker before the confirmation, starts polling', () => {
      sinon.spy(broker, 'persistVerificationData');
      sinon.stub(broker, 'beforeSignUpConfirmationPoll').resolves({});
      sinon.stub(view, 'waitForSessionVerification');

      return view.afterVisible().then(function() {
        assert.isTrue(
          broker.persistVerificationData.calledOnce,
          'called persistVerificationData'
        );
        assert.isTrue(
          broker.beforeSignUpConfirmationPoll.calledOnce,
          'called beforeSignUpConfirmationPoll'
        );
        assert.isTrue(view.waitForSessionVerification.calledOnceWith(account));
        assert.isTrue(broker.beforeSignUpConfirmationPoll.calledWith(account));
      });
    });
  });

  describe('validateAndSubmit', () => {
    beforeEach(() => {
      sinon.stub(view, 'submit').callsFake(() => Promise.resolve());
      sinon.spy(view, 'showValidationError');
    });

    describe('with an empty code', () => {
      beforeEach(() => {
        view.$('input.otp-code').val('');
        return view.validateAndSubmit().then(assert.fail, () => {});
      });

      it('displays a tooltip, does not call submit', () => {
        assert.isTrue(view.showValidationError.called);
        assert.isFalse(view.submit.called);
      });
    });

    const validCodes = [CODE, '   ' + CODE, CODE + '   ', '   ' + CODE + '   '];
    validCodes.forEach(code => {
      describe(`with a valid code: '${code}'`, () => {
        beforeEach(() => {
          view.$('input.otp-code').val(code);
          return view.validateAndSubmit();
        });

        it('calls submit', () => {
          assert.equal(view.submit.callCount, 1);
        });
      });
    });
  });

  describe('submit', () => {
    describe('success', () => {
      beforeEach(() => {
        sinon
          .stub(user, 'verifyAccountSessionCode')
          .callsFake(() => Promise.resolve());
        sinon
          .stub(view, 'invokeBrokerMethod')
          .callsFake(() => Promise.resolve());
        view.$('input.otp-code').val(CODE);
        return view.submit();
      });

      it('calls correct broker methods', () => {
        assert.isTrue(
          user.verifyAccountSessionCode.calledWith(account, CODE, {
            service: 'sync',
          }),
          'verify with correct code'
        );
        assert.isTrue(
          view.invokeBrokerMethod.calledWith(
            'afterSignUpConfirmationPoll',
            account
          )
        );
      });
    });

    describe('invalid or expired code error', () => {
      const error = AuthErrors.toError('INVALID_EXPIRED_SIGNUP_CODE');

      beforeEach(() => {
        sinon
          .stub(account, 'verifySessionCode')
          .callsFake(() => Promise.reject(error));
        sinon.spy(view, 'showValidationError');
        view.$('input.otp-code').val(CODE);
        return view.submit();
      });

      it('rejects with the error for display', () => {
        const args = view.showValidationError.args[0];
        assert.equal(args[1], error);
      });
    });

    describe('invalid code error', () => {
      const error = AuthErrors.toError('INVALID_OTP_CODE');

      beforeEach(() => {
        sinon
          .stub(account, 'verifySessionCode')
          .callsFake(() => Promise.reject(error));
        sinon.spy(view, 'showValidationError');
        view.$('input.otp-code').val(CODE);
        return view.submit();
      });

      it('rejects with the error for display', () => {
        const args = view.showValidationError.args[0];
        assert.equal(args[1], error);
      });
    });

    describe('required code error', () => {
      const error = AuthErrors.toError('OTP_CODE_REQUIRED');

      beforeEach(() => {
        sinon
          .stub(account, 'verifySessionCode')
          .callsFake(() => Promise.reject(error));
        sinon.spy(view, 'showValidationError');
        view.$('input.otp-code').val(CODE);
        return view.submit();
      });

      it('rejects with the error for display', () => {
        const args = view.showValidationError.args[0];
        assert.equal(args[1], error);
      });
    });

    describe('unexpected error', () => {
      const error = AuthErrors.toError('UNEXPECTED_ERROR');

      beforeEach(() => {
        sinon
          .stub(account, 'verifySessionCode')
          .callsFake(() => Promise.reject(error));
        sinon.spy(view, 'showValidationError');
      });

      it('rejects with the error for display', () => {
        view.$('input.otp-code').val(CODE);
        return view.validateAndSubmit().then(assert.fail, () => {
          assert.ok(view.$('.error').text().length);
          assert.equal(view.showValidationError.callCount, 0);
        });
      });
    });
  });

  describe('resend', () => {
    describe('success', () => {
      beforeEach(() => {
        sinon
          .stub(account, 'verifySessionResendCode')
          .callsFake(() => Promise.resolve());
        return view.resend();
      });

      it('calls correct methods', () => {
        assert.equal(account.verifySessionResendCode.callCount, 1);
      });
    });
  });
});
