/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import _ from 'underscore';
import { assert } from 'chai';
import Account from 'models/account';
import AuthErrors from 'lib/auth-errors';
import Backbone from 'backbone';
import BaseBroker from 'models/auth_brokers/base';
import Metrics from 'lib/metrics';
import Relier from 'models/reliers/relier';
import sinon from 'sinon';
import User from 'models/user';
import View from 'views/post_verify/secondary_email/confirm_secondary_email';
import WindowMock from '../../../../mocks/window';
import $ from 'jquery';

const CODE_INPUT_SELECTOR = 'input.otp-code';
const CODE = '100110';
const SECONDARY_EMAIL = 'anotherEmail@e.com';

describe('views/post_verify/secondary_email/confirm_secondary_email', () => {
  let account;
  let broker;
  let metrics;
  let model;
  let notifier;
  let relier;
  let user;
  let view;
  let windowMock;

  beforeEach(() => {
    windowMock = new WindowMock();
    relier = new Relier({
      window: windowMock,
    });
    broker = new BaseBroker({
      relier,
      window: windowMock,
    });
    account = new Account({
      email: 'a@a.com',
      uid: 'uid',
    });
    model = new Backbone.Model({
      account,
      secondaryEmail: SECONDARY_EMAIL,
    });
    notifier = _.extend({}, Backbone.Events);
    metrics = new Metrics({ notifier });
    user = new User();
    view = new View({
      broker,
      metrics,
      model,
      notifier,
      relier,
      user,
    });

    sinon.stub(view, 'getSignedInAccount').callsFake(() => account);

    return view.render().then(() => $('#container').html(view.$el));
  });

  afterEach(function() {
    metrics.destroy();
    view.remove();
    view.destroy();
  });

  describe('render', () => {
    it('renders the view', () => {
      assert.lengthOf(view.$('#fxa-confirm-secondary-email-header'), 1);
      assert.include(
        view.$('.verification-email-message').text(),
        SECONDARY_EMAIL
      );
      assert.lengthOf(view.$('#submit-btn'), 1);
      assert.lengthOf(view.$('#resend'), 1);
      assert.lengthOf(view.$(CODE_INPUT_SELECTOR), 1);
    });

    describe('without an account', () => {
      beforeEach(() => {
        account = new Account({});
        sinon.spy(view, 'navigate');
        return view.render();
      });

      it('redirects to the email first page', () => {
        assert.isTrue(view.navigate.calledWith('/'));
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
        view.$('.otp-code').val('');
        return view.validateAndSubmit().then(assert.fail, () => {});
      });

      it('displays a tooltip, does not call submit', () => {
        assert.isTrue(view.showValidationError.called);
        assert.isFalse(view.submit.called);
      });
    });

    const validCodes = [
      CODE,
      '   ' + CODE,
      CODE + '   ',
      '   ' + CODE + '   ',
      '111 111',
    ];
    validCodes.forEach(code => {
      describe(`with a valid code: '${code}'`, () => {
        beforeEach(() => {
          view.$('.otp-code').val(code);
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
          .stub(account, 'recoveryEmailSecondaryVerifyCode')
          .callsFake(() => Promise.resolve());
        sinon.spy(view, 'navigate');
        view.$(CODE_INPUT_SELECTOR).val(CODE);
        return view.submit();
      });

      it('calls correct broker methods', () => {
        assert.isTrue(
          account.recoveryEmailSecondaryVerifyCode.calledWith(
            SECONDARY_EMAIL,
            CODE
          ),
          'verify correct email and code'
        );
        assert.isTrue(
          view.navigate.calledWith(
            '/post_verify/secondary_email/verified_secondary_email',
            {
              secondaryEmail: SECONDARY_EMAIL,
            }
          )
        );
      });
    });

    describe('errors', () => {
      const error = AuthErrors.toError('INVALID_OTP_CODE');

      beforeEach(() => {
        sinon
          .stub(account, 'recoveryEmailSecondaryVerifyCode')
          .callsFake(() => Promise.reject(error));
        sinon.spy(view, 'showValidationError');
        view.$(CODE_INPUT_SELECTOR).val(CODE);
        return view.submit();
      });

      it('rejects with the error for display', () => {
        const args = view.showValidationError.args[0];
        assert.equal(args[1], error);
      });
    });
  });
});
