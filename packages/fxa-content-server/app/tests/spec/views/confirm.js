/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { assert } from 'chai';
import AuthErrors from 'lib/auth-errors';
import Backbone from 'backbone';
import BaseBroker from 'models/auth_brokers/base';
import VerificationReasons from 'lib/verification-reasons';
import Metrics from 'lib/metrics';
import Notifier from 'lib/channels/notifier';
import Relier from 'models/reliers/relier';
import {
  CONFIRM_SIGNIN,
  CONFIRM_SIGNUP,
} from '../../../../tests/functional/lib/selectors';
import Session from 'lib/session';
import SessionVerificationPoll from 'models/polls/session-verification';
import sinon from 'sinon';
import TestHelpers from '../../lib/helpers';
import User from 'models/user';
import View from 'views/confirm';
import WindowMock from '../../mocks/window';

const SIGNIN_REASON = VerificationReasons.SIGN_IN;
const SIGNUP_REASON = VerificationReasons.SIGN_UP;

const ConfirmSignInSelectors = CONFIRM_SIGNIN;
const ConfirmSignUpSelectors = CONFIRM_SIGNUP;

describe('views/confirm', function() {
  let account;
  let broker;
  let metrics;
  let model;
  let notifier;
  let relier;
  let sessionVerificationPoll;
  let user;
  let view;
  let windowMock;

  beforeEach(function() {
    model = new Backbone.Model();
    notifier = new Notifier();
    metrics = new Metrics({ notifier });
    user = new User();
    windowMock = new WindowMock();

    relier = new Relier(
      {},
      {
        window: windowMock,
      }
    );

    broker = new BaseBroker({
      relier: relier,
      session: Session,
      window: windowMock,
    });

    account = user.initAccount({
      email: 'a@a.com',
      sessionToken: 'fake session token',
      uid: 'uid',
    });

    sessionVerificationPoll = new SessionVerificationPoll(
      {},
      {
        account,
        pollIntervalInMS: 2,
        window: windowMock,
      }
    );

    model.set({
      account: account,
      type: SIGNUP_REASON,
    });

    sinon.stub(user, 'setSignedInAccount').callsFake(() => Promise.resolve());

    view = new View({
      broker: broker,
      canGoBack: true,
      metrics: metrics,
      model: model,
      notifier: notifier,
      relier: relier,
      sessionVerificationPoll,
      user: user,
      viewName: 'confirm',
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

  describe('render', function() {
    describe('with sessionToken', function() {
      describe('sign up', function() {
        it('legacy renders correctly', () => {
          model.set('type', SIGNUP_REASON);

          return view.render().then(() => {
            assert.lengthOf(view.$(ConfirmSignUpSelectors.LINK_BACK), 0);
            assert.lengthOf(
              view.$(ConfirmSignUpSelectors.PROGRESS_INDICATOR),
              0
            );
            assert.lengthOf(view.$(ConfirmSignUpSelectors.HEADER), 1);
          });
        });

        it('trailhead renders correctly', () => {
          model.set('type', SIGNUP_REASON);
          sinon.stub(view, 'isTrailhead').callsFake(() => true);

          return view.render().then(() => {
            assert.lengthOf(view.$(ConfirmSignUpSelectors.LINK_BACK), 0);
            assert.lengthOf(view.$(ConfirmSignUpSelectors.HEADER), 1);
            assert.lengthOf(
              view.$(ConfirmSignUpSelectors.PROGRESS_INDICATOR),
              1
            );
          });
        });
      });

      describe('sign in', function() {
        beforeEach(function() {
          model.set('type', SIGNIN_REASON);

          return view.render();
        });

        it('draws the correct template', function() {
          assert.lengthOf(view.$(ConfirmSignInSelectors.LINK_BACK), 1);
          assert.lengthOf(view.$(ConfirmSignInSelectors.HEADER), 1);
        });
      });
    });

    describe('without a sessionToken', function() {
      beforeEach(function() {
        model.set({
          account: user.initAccount(),
        });

        view = new View({
          broker: broker,
          canGoBack: true,
          model: model,
          notifier: notifier,
          user: user,
          window: windowMock,
        });

        sinon.spy(view, 'navigate');
      });

      describe('sign up', function() {
        beforeEach(function() {
          return view.render();
        });

        it('redirects to `/signup`', function() {
          assert.isTrue(view.navigate.calledWith('signup'));
        });
      });

      describe('sign in', function() {
        beforeEach(function() {
          model.set('type', SIGNIN_REASON);

          return view.render();
        });

        it('redirects to `/signin`', function() {
          assert.isTrue(view.navigate.calledWith('signin'));
        });
      });
    });
  });

  describe('afterVisible', function() {
    it('notifies the broker before the confirmation', function() {
      sinon.spy(broker, 'persistVerificationData');

      sinon
        .stub(broker, 'beforeSignUpConfirmationPoll')
        .callsFake(() => Promise.resolve());

      sinon.stub(view, 'waitForSessionVerification').callsFake(() => {});

      return view.afterVisible().then(function() {
        assert.isTrue(view.waitForSessionVerification.calledOnce);
        assert.isTrue(view.waitForSessionVerification.calledWith(account));

        assert.isTrue(broker.persistVerificationData.calledOnce);
        assert.isTrue(broker.beforeSignUpConfirmationPoll.calledOnce);
        assert.isTrue(broker.beforeSignUpConfirmationPoll.calledWith(account));
      });
    });
  });

  describe('session verifiation completes', () => {
    it('invokes `_gotoNextScreen`', () => {
      sinon.stub(view, '_gotoNextScreen').callsFake(() => {});
      sinon.stub(sessionVerificationPoll, 'start').callsFake(() => {});

      return view.afterVisible().then(() => {
        sessionVerificationPoll.trigger('verified');

        assert.isTrue(view._gotoNextScreen.calledOnce);
      });
    });
  });

  describe('_gotoNextScreen', () => {
    describe('signup', function() {
      it('notifies the broker after the account is confirmed', function() {
        sinon.stub(view, 'isSignUp').callsFake(() => true);
        sinon.stub(view, 'isSignIn').callsFake(() => false);

        return testGotoNextScreen('afterSignUpConfirmationPoll');
      });
    });

    describe('signin', function() {
      it('notifies the broker after the account is confirmed', function() {
        sinon.stub(view, 'isSignUp').callsFake(() => false);
        sinon.stub(view, 'isSignIn').callsFake(() => true);

        return testGotoNextScreen('afterSignInConfirmationPoll');
      });
    });

    function testGotoNextScreen(expectedBrokerCall) {
      const notifySpy = sinon.spy(view.notifier, 'trigger');

      sinon.stub(broker, expectedBrokerCall).callsFake(() => Promise.resolve());

      return view._gotoNextScreen().then(function() {
        assert.isTrue(broker[expectedBrokerCall].calledWith(account));
        assert.isTrue(
          TestHelpers.isEventLogged(metrics, 'confirm.verification.success')
        );
        assert.isTrue(notifySpy.withArgs('verification.success').calledOnce);
      });
    }
  });

  describe('resend', function() {
    it('resends the confirmation email', function() {
      sinon.stub(account, 'retrySignUp').callsFake(() => Promise.resolve());
      sinon
        .stub(view, 'getStringifiedResumeToken')
        .callsFake(() => 'resume token');

      return view.resend().then(() => {
        assert.isTrue(view.getStringifiedResumeToken.calledOnce);
        assert.isTrue(view.getStringifiedResumeToken.calledWith(account));
        assert.isTrue(
          account.retrySignUp.calledWith(relier, {
            resume: 'resume token',
          })
        );
      });
    });

    describe('with an invalid resend token', function() {
      beforeEach(function() {
        sinon.stub(account, 'retrySignUp').callsFake(function() {
          return Promise.reject(AuthErrors.toError('INVALID_TOKEN'));
        });

        sinon.spy(view, 'navigate');

        return view.resend();
      });

      it('redirects to /signup', function() {
        assert.isTrue(view.navigate.calledWith('signup'));
      });
    });

    describe('that causes other errors', function() {
      let error;

      beforeEach(function() {
        sinon.stub(account, 'retrySignUp').callsFake(function() {
          return Promise.reject(
            new Error('synthesized error from auth server')
          );
        });

        return view.resend().then(assert.fail, function(err) {
          error = err;
        });
      });

      it('re-throws the error', function() {
        assert.equal(error.message, 'synthesized error from auth server');
      });
    });
  });

  describe('openWebmail feature', function() {
    it('it is not visible in basic contexts', function() {
      assert.notOk(view.$('#open-webmail').length);
    });

    it('is visible with the the openGmailButtonVisible capability and email is @gmail.com', function() {
      broker.setCapability('openWebmailButtonVisible', true);

      account = user.initAccount({
        email: 'a@gmail.com',
        sessionToken: 'fake session token',
        uid: 'uid',
      });

      model.set({
        account: account,
      });

      view = new View({
        broker: broker,
        canGoBack: true,
        metrics: metrics,
        model: model,
        notifier: notifier,
        relier: relier,
        user: user,
        viewName: 'confirm',
        window: windowMock,
      });

      return view.render().then(function() {
        assert.lengthOf(view.$('#open-webmail'), 1);
      });
    });
  });
});
