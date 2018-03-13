/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define(function (require, exports, module) {
  'use strict';

  const _ = require('underscore');
  const {assert} = require('chai');
  const Account = require('models/account');
  const AuthErrors = require('lib/auth-errors');
  const Backbone = require('backbone');
  const BaseBroker = require('models/auth_brokers/base');
  const Constants = require('lib/constants');
  const {createRandomHexString} = require('../../lib/helpers');
  const Metrics = require('lib/metrics');
  const Relier = require('models/reliers/relier');
  const sinon = require('sinon');
  const View = require('views/sign_in_token_code');
  const WindowMock = require('../../mocks/window');

  const TOKEN_CODE = createRandomHexString(Constants.UNBLOCK_CODE_LENGTH);

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
        window: windowMock
      });

      broker = new BaseBroker({
        relier: relier,
        window: windowMock
      });

      account = new Account({
        email: 'a@a.com',
        uid: 'uid'
      });

      model = new Backbone.Model({
        account: account,
        lastPage: 'signin',
        password: 'password'
      });

      notifier = _.extend({}, Backbone.Events);
      metrics = new Metrics({notifier});

      view = new View({
        broker,
        canGoBack: true,
        metrics,
        model,
        notifier,
        relier,
        viewName: 'sign-in-token-code',
        window: windowMock
      });

      return view.render();
    });

    afterEach(function () {
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
          view.$('#token-code').val('');
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
        '   ' + TOKEN_CODE + '   '
      ];
      validCodes.forEach((code) => {
        describe(`with a valid code: '${code}'`, () => {
          beforeEach(() => {
            view.$('#token-code').val(code);
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
          sinon.stub(account, 'verifyTokenCode').callsFake(() => Promise.resolve());
          sinon.stub(view, 'invokeBrokerMethod').callsFake(() => Promise.resolve());
          view.$('#token-code').val(TOKEN_CODE);
          return view.submit();
        });

        it('calls correct broker methods', () => {
          assert.isTrue(account.verifyTokenCode.calledWith(TOKEN_CODE), 'verify with correct code');
          assert.isTrue(view.invokeBrokerMethod.calledWith('afterCompleteSignInWithCode', account));
        });
      });

      describe('errors', () => {
        const error = AuthErrors.toError('INVALID_TOKEN_VERIFICATION_CODE');

        beforeEach(() => {
          sinon.stub(account, 'verifyTokenCode').callsFake(() => Promise.reject(error));
          sinon.stub(view, 'displayError').callsFake(() => Promise.resolve());
          view.$('#token-code').val(TOKEN_CODE);
          return view.submit();
        });

        it('rejects with the error for display', () => {
          assert.isTrue(view.displayError.calledWith(error));
        });
      });
    });
  });
});
