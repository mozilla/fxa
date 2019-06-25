/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import $ from 'jquery';
import _ from 'underscore';
import { assert } from 'chai';
import Account from 'models/account';
import AuthErrors from 'lib/auth-errors';
import Backbone from 'backbone';
import BaseBroker from 'models/auth_brokers/base';
import Metrics from 'lib/metrics';
import Relier from 'models/reliers/relier';
import sinon from 'sinon';
import View from 'views/sign_in_totp_code';
import WindowMock from '../../mocks/window';

const TOTP_CODE = '123123';

describe('views/sign_in_totp_code', () => {
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
      sessionToken: 'someToken',
      uid: 'uid',
    });

    model = new Backbone.Model({
      account: account,
      lastPage: 'signin',
      password: 'password',
    });

    notifier = _.extend({}, Backbone.Events);
    metrics = new Metrics({
      notifier,
      sentryMetrics: {
        captureException() {},
      },
    });

    view = new View({
      broker,
      canGoBack: true,
      metrics,
      model,
      notifier,
      relier,
      viewName: 'sign-in-totp-code',
      window: windowMock,
    });

    sinon
      .stub(view, 'getSignedInAccount')
      .callsFake(() => model.get('account'));

    $(windowMock.document.body).attr(
      'data-flow-id',
      '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef'
    );
    $(windowMock.document.body).attr('data-flow-begin', Date.now());
    sinon.spy(view, 'logFlowEvent');

    return view.render().then(() => $('#container').html(view.$el));
  });

  afterEach(() => {
    metrics.destroy();
    view.remove();
    view.destroy();
    view = metrics = null;
  });

  describe('render', () => {
    it('renders the view', () => {
      assert.lengthOf(view.$('#fxa-totp-code-header'), 1);
      assert.include(
        view.$('.verification-totp-message').text(),
        'security code'
      );
      assert.equal(
        view.$('#use-recovery-code-link').attr('href'),
        '/signin_recovery_code'
      );
      assert.equal(view.$('.different-account-link').attr('href'), '/signin');
    });

    describe('without an account', () => {
      beforeEach(() => {
        account = model.get('account').unset('sessionToken');
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
        view.$('#totp-code').val('');
        return view.validateAndSubmit().then(assert.fail, () => {});
      });

      it('displays a tooltip, does not call submit', () => {
        assert.isTrue(view.showValidationError.called);
        assert.isFalse(view.submit.called);
      });
    });

    const validCodes = [
      TOTP_CODE,
      '   ' + TOTP_CODE,
      TOTP_CODE + '   ',
      '   ' + TOTP_CODE + '   ',
      '001-001',
      '111 111',
    ];
    validCodes.forEach(code => {
      describe(`with a valid code: '${code}'`, () => {
        beforeEach(() => {
          view.$('.totp-code').val(code);

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
          .stub(account, 'verifyTotpCode')
          .callsFake(() => Promise.resolve({ success: true }));
        sinon
          .stub(view, 'invokeBrokerMethod')
          .callsFake(() => Promise.resolve());
        view.$('.totp-code').val(TOTP_CODE);

        return view.submit();
      });

      it('calls correct broker methods', () => {
        assert.isTrue(
          account.verifyTotpCode.calledWith(TOTP_CODE),
          'verify with correct code'
        );
        assert.isTrue(
          view.invokeBrokerMethod.calledWith(
            'afterCompleteSignInWithCode',
            account
          )
        );
      });

      it('logs flowEvent', () => {
        assert.equal(view.logFlowEvent.callCount, 1);
      });
    });

    describe('invalid TOTP code', () => {
      beforeEach(() => {
        sinon
          .stub(account, 'verifyTotpCode')
          .callsFake(() => Promise.resolve({ success: false }));
        sinon.spy(view, 'showValidationError');
        view.$('.totp-code').val(TOTP_CODE);
        return view.submit();
      });

      it('rejects with the error for display', () => {
        assert.equal(
          view.showValidationError.args[0][1].errno,
          1054,
          'correct error thrown'
        );
      });
    });

    describe('errors', () => {
      beforeEach(() => {
        sinon
          .stub(account, 'verifyTotpCode')
          .callsFake(() =>
            Promise.reject(AuthErrors.toError('UNEXPECTED_ERROR'))
          );
        sinon.spy(view, 'showValidationError');
        view.$('.totp-code').val(TOTP_CODE);
        return view.submit();
      });

      it('rejects with the error for display', () => {
        assert.equal(
          view.showValidationError.args[0][1].errno,
          999,
          'correct error thrown'
        );
      });
    });
  });
});
