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
import SentryMetrics from 'lib/sentry';
import sinon from 'sinon';
import User from 'models/user';
import View from 'views/post_verify/secondary_email/add_secondary_email';
import WindowMock from '../../../../mocks/window';
import VerificationMethods from '../../../../../scripts/lib/verification-methods';
import $ from 'jquery';

const EMAIL_INPUT_SELECTOR = 'input.new-email';
const SECONDARY_EMAIL = 'anotherEmail@e.com';

describe('views/post_verify/secondary_email/add_secondary_email', () => {
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
    });
    notifier = _.extend({}, Backbone.Events);
    sentryMetrics = new SentryMetrics();
    metrics = new Metrics({ notifier, sentryMetrics });
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
    sinon.stub(account, 'recoveryEmails').callsFake(() => Promise.resolve({}));

    return view.render().then(() => $('#container').html(view.$el));
  });

  afterEach(function() {
    metrics.destroy();
    view.remove();
    view.destroy();
  });

  describe('render', () => {
    it('renders the view', () => {
      assert.lengthOf(view.$('#fxa-add-secondary-email-header'), 1);
      assert.include(view.$('.verification-email-message').text(), 'a@a.com');
      assert.lengthOf(view.$('#submit-btn'), 1);
      assert.lengthOf(view.$('#maybe-later-btn'), 1);
      assert.lengthOf(view.$(EMAIL_INPUT_SELECTOR), 1);
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

    describe('with an empty email', () => {
      beforeEach(() => {
        view.$(EMAIL_INPUT_SELECTOR).val('');
        return view.validateAndSubmit().then(assert.fail, () => {});
      });

      it('displays a tooltip, does not call submit', () => {
        assert.isTrue(view.showValidationError.called);
        assert.isFalse(view.submit.called);
      });
    });

    describe('with a valid email', () => {
      beforeEach(() => {
        view.$(EMAIL_INPUT_SELECTOR).val(SECONDARY_EMAIL);
        return view.validateAndSubmit();
      });

      it('calls submit', () => {
        assert.equal(view.submit.callCount, 1);
      });
    });
  });

  describe('submit', () => {
    describe('success', () => {
      beforeEach(() => {
        sinon
          .stub(account, 'recoveryEmailCreate')
          .callsFake(() => Promise.resolve());
        sinon.spy(view, 'navigate');
        view.$(EMAIL_INPUT_SELECTOR).val(SECONDARY_EMAIL);
        return view.submit();
      });

      it('calls correct broker methods', () => {
        assert.isTrue(
          account.recoveryEmailCreate.calledWith(SECONDARY_EMAIL, {
            verificationMethod: VerificationMethods.EMAIL_OTP,
          }),
          'verify correct email and verification method'
        );
        assert.isTrue(
          view.navigate.calledWith(
            '/post_verify/secondary_email/confirm_secondary_email',
            {
              secondaryEmail: SECONDARY_EMAIL,
            }
          )
        );
      });
    });

    describe('errors', () => {
      const error = AuthErrors.toError('VERIFIED_SECONDARY_EMAIL_EXISTS');

      beforeEach(() => {
        sinon
          .stub(account, 'recoveryEmailCreate')
          .callsFake(() => Promise.reject(error));
        sinon.spy(view, 'showValidationError');
        view.$(EMAIL_INPUT_SELECTOR).val(SECONDARY_EMAIL);
        return view.submit();
      });

      it('rejects with the error for display', () => {
        const args = view.showValidationError.args[0];
        assert.equal(args[1], error);
      });
    });

    describe('errors', () => {
      describe('existing email', () => {
        const error = AuthErrors.toError('VERIFIED_SECONDARY_EMAIL_EXISTS');

        beforeEach(() => {
          sinon
            .stub(account, 'recoveryEmailCreate')
            .callsFake(() => Promise.reject(error));
          sinon.spy(view, 'showValidationError');
          view.$(EMAIL_INPUT_SELECTOR).val(SECONDARY_EMAIL);
          return view.submit();
        });

        it('rejects with the error for display', () => {
          const args = view.showValidationError.args[0];
          assert.equal(args[1], error);
        });
      });

      describe('max emails reached', () => {
        const error = AuthErrors.toError('MAX_SECONDARY_EMAILS_REACHED');

        beforeEach(() => {
          sinon
            .stub(account, 'recoveryEmailCreate')
            .callsFake(() => Promise.reject(error));
          sinon.spy(view, 'showValidationError');
          view.$(EMAIL_INPUT_SELECTOR).val(SECONDARY_EMAIL);
          return view.submit();
        });

        it('rejects with the error for display', () => {
          const args = view.showValidationError.args[0];
          assert.equal(args[1], error);
        });
      });

      describe('adding existing owned email', () => {
        const error = AuthErrors.toError('ACCOUNT_OWNS_EMAIL');

        beforeEach(() => {
          sinon
            .stub(account, 'recoveryEmailCreate')
            .callsFake(() => Promise.reject(error));
          sinon.spy(view, 'showValidationError');
          view.$(EMAIL_INPUT_SELECTOR).val(SECONDARY_EMAIL);
          return view.submit();
        });

        it('rejects with the error for display', () => {
          const args = view.showValidationError.args[0];
          assert.equal(args[1], error);
        });
      });
    });
  });
});
