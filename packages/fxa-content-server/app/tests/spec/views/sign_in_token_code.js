/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import _ from 'underscore';
import { assert } from 'chai';
import Account from 'models/account';
import AuthErrors from 'lib/auth-errors';
import Backbone from 'backbone';
import BaseBroker from 'models/auth_brokers/base';
import Constants from 'lib/constants';
import helpers from '../../lib/helpers';
import Metrics from 'lib/metrics';
import Relier from 'models/reliers/relier';
import sinon from 'sinon';
import View from 'views/sign_in_token_code';
import WindowMock from '../../mocks/window';

const { createRandomString } = helpers;

const TOKEN_CODE = createRandomString(Constants.TOKEN_CODE_LENGTH, 10);

describe('views/sign_in_token_code', () => {
  let account;
  let broker;
  let metrics;
  let model;
  let notifier;
  let relier;
  let view;
  let windowMock;

  beforeEach(() => {
    windowMock = new WindowMock();

    relier = new Relier({
      window: windowMock,
    });

    broker = new BaseBroker({
      relier: relier,
      window: windowMock,
    });

    account = new Account({
      email: 'a@a.com',
      uid: 'uid',
    });

    model = new Backbone.Model({
      account: account,
      lastPage: 'signin',
      password: 'password',
    });

    notifier = _.extend({}, Backbone.Events);
    metrics = new Metrics({ notifier });

    view = new View({
      broker,
      canGoBack: true,
      metrics,
      model,
      notifier,
      relier,
      viewName: 'sign-in-token-code',
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
      assert.lengthOf(view.$('#fxa-signin-code-header'), 1);
      assert.include(view.$('.verification-email-message').text(), 'a@a.com');
    });

    describe('without an account', () => {
      beforeEach(() => {
        model.unset('account');
        sinon.spy(view, 'navigate');
        return view.render();
      });

      it('redirects to the signin page', () => {
        assert.isTrue(view.navigate.calledWith('signin'));
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

    const validCodes = [
      TOKEN_CODE,
      '   ' + TOKEN_CODE,
      TOKEN_CODE + '   ',
      '   ' + TOKEN_CODE + '   ',
    ];
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
          .stub(account, 'verifySessionCode')
          .callsFake(() => Promise.resolve());
        sinon
          .stub(view, 'invokeBrokerMethod')
          .callsFake(() => Promise.resolve());
        view.$('input.otp-code').val(TOKEN_CODE);
        return view.submit();
      });

      it('calls correct broker methods', () => {
        assert.isTrue(
          account.verifySessionCode.calledWith(TOKEN_CODE),
          'verify with correct code'
        );
        assert.isTrue(
          view.invokeBrokerMethod.calledWith(
            'afterCompleteSignInWithCode',
            account
          )
        );
      });
    });

    describe('errors', () => {
      const error = AuthErrors.toError('INVALID_EXPIRED_OTP_CODE');

      beforeEach(() => {
        sinon
          .stub(account, 'verifySessionCode')
          .callsFake(() => Promise.reject(error));
        sinon.spy(view, 'showValidationError');
        view.$('input.otp-code').val(TOKEN_CODE);
        return view.submit();
      });

      it('rejects with the error for display', () => {
        const args = view.showValidationError.args[0];
        assert.equal(args[1], error);
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
