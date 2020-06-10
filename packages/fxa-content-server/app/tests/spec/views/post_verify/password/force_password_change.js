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
import View from 'views/post_verify/password/force_password_change';
import WindowMock from '../../../../mocks/window';
import $ from 'jquery';

describe('views/post_verify/password/force_password_change', () => {
  const PASSWORD = 'passwordzxcv';
  const OPASSWORD = 'lasswordzxcv';
  let account;
  let broker;
  let error;
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
    error = undefined;

    sinon.stub(view, 'getSignedInAccount').callsFake(() => account);
    sinon.stub(view, 'invokeBrokerMethod').callsFake(() => Promise.resolve());
    sinon.stub(user, 'changeAccountPassword').callsFake(() => {
      if (error) {
        return Promise.reject(error);
      }
      return Promise.resolve({});
    });

    return view.render().then(() => $('#container').html(view.$el));
  });

  afterEach(function () {
    metrics.destroy();
    view.remove();
    view.destroy();
  });

  describe('render', () => {
    it('renders the view', () => {
      assert.lengthOf(view.$('#fxa-force-password-change-header'), 1);
      assert.lengthOf(view.$('.verification-email-message'), 2);
      assert.lengthOf(view.$('#opassword'), 1);
      assert.lengthOf(view.$('#password'), 1);
      assert.lengthOf(view.$('#vpassword'), 1);
      assert.lengthOf(view.$('#submit-btn'), 1);
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

  describe('submit', () => {
    describe('with correct old password and matching new passwords', () => {
      beforeEach(() => {
        view.$('#opassword').val(OPASSWORD);
        view.$('#password').val(PASSWORD);
        view.$('#vpassword').val(PASSWORD);
        return view.submit();
      });

      it('correct response', () => {
        assert.isTrue(
          user.changeAccountPassword.calledWith(
            account,
            OPASSWORD,
            PASSWORD,
            relier
          )
        );
        assert.isTrue(
          view.invokeBrokerMethod.calledWith(
            'afterCompleteSignInWithCode',
            account
          )
        );
      });
    });

    describe('validateAndSubmit', () => {
      beforeEach(() => {
        sinon.stub(view, 'submit').callsFake(() => Promise.resolve());
        sinon.spy(view, 'showValidationError');
      });

      describe('with mismatching new password', () => {
        beforeEach(() => {
          view.$('#password').val('12312');
          view.$('#vpassword').val('asdf');
          return view.validateAndSubmit().then(assert.fail, () => {});
        });

        it('displays a tooltip, does not call submit', () => {
          assert.isTrue(view.showValidationError.called);
          assert.isFalse(view.submit.called);
        });
      });
    });

    describe('errors', () => {
      describe('with invalid password', () => {
        beforeEach(() => {
          sinon.spy(view, 'showValidationError');
          error = AuthErrors.toError('INCORRECT_PASSWORD');
          return view.submit();
        });

        it('should show validation tooltip', () => {
          assert.isTrue(
            view.showValidationError.calledWith(view.$('#opassword'), error)
          );
        });
      });

      describe('other errors', () => {
        beforeEach(() => {
          sinon.spy(view, 'displayError');
          error = AuthErrors.toError('UNEXPECTED_ERROR');
          return view.submit();
        });

        it('should throw and handle in lower level', () => {
          assert.isTrue(view.displayError.calledWith(error));
        });
      });
    });
  });
});
