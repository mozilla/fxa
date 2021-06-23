/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import _ from 'underscore';
import { assert } from 'chai';
import Account from 'models/account';
import Backbone from 'backbone';
import BaseBroker from 'models/auth_brokers/base';
import Metrics from 'lib/metrics';
import Relier from 'models/reliers/relier';
import sinon from 'sinon';
import User from 'models/user';
import View from 'views/push/send_login';
import WindowMock from '../../../mocks/window';
import SentryMetrics from 'lib/sentry';
import SessionVerificationPoll from 'models/polls/session-verification';

describe('views/push/send_login', () => {
  let account;
  let broker;
  let metrics;
  let model;
  let notifier;
  let relier;
  let user;
  let view;
  let windowMock;
  let sentryMetrics;
  let sessionVerificationPoll;

  beforeEach(async () => {
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
    sentryMetrics = new SentryMetrics();
    metrics = new Metrics({ notifier, sentryMetrics });

    user = new User();

    sessionVerificationPoll = new SessionVerificationPoll(
      {},
      {
        account,
        pollIntervalInMS: 2,
        window: windowMock,
      }
    );

    view = new View({
      broker,
      canGoBack: true,
      metrics,
      model,
      notifier,
      relier,
      user,
      viewName: 'send-login',
      window: windowMock,
      sessionVerificationPoll,
    });

    sinon.stub(view, 'getSignedInAccount').callsFake(() => account);
    sinon
      .stub(account, 'sendPushLoginRequest')
      .callsFake(() => Promise.resolve());
    sinon
      .stub(view, '_handleSessionVerificationPollErrors')
      .callsFake(() => {});
    sinon.stub(sessionVerificationPoll, 'start').callsFake(() => {});

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
      assert.lengthOf(view.$('#fxa-push-send-login-header'), 1);
      assert.include(
        view.$('.verification-message').text(),
        'Check your connected Firefox devices'
      );
      assert.lengthOf(view.$('#resend'), 1);
      assert.lengthOf(view.$('#send-email'), 1);
    });

    it('sends push notification to account', () => {
      assert.isTrue(account.sendPushLoginRequest.calledOnce);
    });
  });

  describe('afterVisible', () => {
    beforeEach(async () => {
      sinon.spy(broker, 'persistVerificationData');
      sinon.spy(view, 'waitForSessionVerification');
      sinon.spy(view, 'invokeBrokerMethod');
      return view.afterVisible().then(() => {
        // simulate account being verified
        return sessionVerificationPoll.trigger('verified');
      });
    });

    it('starts polling for session to be verified', () => {
      assert.isTrue(broker.persistVerificationData.calledOnceWith(account));
      assert.isTrue(view.waitForSessionVerification.calledOnce);
      assert.isTrue(view.invokeBrokerMethod.calledTwice);
      const args = view.invokeBrokerMethod.args;
      assert.equal(args[0][0], 'beforeSignUpConfirmationPoll');
      assert.equal(args[1][0], 'afterCompleteSignInWithCode');
    });
  });

  describe('resend', () => {
    describe('success', () => {
      beforeEach(() => {
        sinon.spy(view, 'displaySuccess');
        return view.render().then(() => {
          account.sendPushLoginRequest.resetHistory();
          return view.resend();
        });
      });

      it('calls correct methods', () => {
        assert.isTrue(account.sendPushLoginRequest.calledOnce);
        assert.isTrue(view.displaySuccess.calledOnce);
      });
    });
  });
});
