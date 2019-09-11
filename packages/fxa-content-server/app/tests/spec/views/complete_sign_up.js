/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { assert } from 'chai';
import AuthErrors from 'lib/auth-errors';
import Backbone from 'backbone';
import Broker from 'models/auth_brokers/base';
import Constants from 'lib/constants';
import VerificationReasons from 'lib/verification-reasons';
import Metrics from 'lib/metrics';
import Notifier from 'lib/channels/notifier';
import Relier from 'models/reliers/relier';
import sinon from 'sinon';
import SyncRelier from 'models/reliers/sync';
import TestHelpers from '../../lib/helpers';
import Translator from 'lib/translator';
import User from 'models/user';
import View from 'views/complete_sign_up';
import WindowMock from '../../mocks/window';

describe('views/complete_sign_up', function() {
  let account;
  let broker;
  let isSignedIn;
  let metrics;
  let notifier;
  let relier;
  let translator;
  let user;
  let verificationError;
  let view;
  let windowMock;

  const validCode = TestHelpers.createUid();
  const validUid = TestHelpers.createRandomHexString(Constants.UID_LENGTH);
  const validService = 'someValidService';
  const validReminder = 'validReminder';

  function testShowsExpiredScreen(search) {
    windowMock.location.search =
      search || '?code=' + validCode + '&uid=' + validUid;
    initView(account);
    return view.render().then(function() {
      assert.ok(view.$('#fxa-verification-link-expired-header').length);
    });
  }

  function testShowsDamagedScreen(search) {
    windowMock.location.search =
      search || '?code=' + validCode + '&uid=' + validUid;
    initView(account);
    return view.render().then(function() {
      assert.ok(view.$('#fxa-verification-link-damaged-header').length);
    });
  }

  function testErrorLogged(error) {
    var normalizedError = view._normalizeError(error);
    assert.isTrue(TestHelpers.isErrorLogged(metrics, normalizedError));
  }

  function initView(account) {
    view = new View({
      account: account,
      broker: broker,
      metrics: metrics,
      notifier: notifier,
      relier: relier,
      translator: translator,
      user: user,
      viewName: 'complete_sign_up',
      window: windowMock,
    });
  }

  beforeEach(function() {
    broker = new Broker();
    notifier = new Notifier();
    sinon.stub(notifier, 'trigger').callsFake(() => {});
    metrics = new Metrics({ notifier });
    relier = new Relier();
    user = new User({
      notifier: notifier,
    });

    verificationError = null;
    windowMock = new WindowMock();
    translator = new Translator({ forceEnglish: true });

    account = user.initAccount({
      email: 'a@a.com',
      sessionToken: 'foo',
      sessionTokenContext: 'context',
      uid: validUid,
    });

    sinon.stub(account, 'verifySignUp').callsFake(function() {
      if (verificationError) {
        return Promise.reject(verificationError);
      } else {
        return Promise.resolve();
      }
    });

    isSignedIn = true;
    sinon
      .stub(account, 'isSignedIn')
      .callsFake(() => Promise.resolve(isSignedIn));

    windowMock.location.search = '?code=' + validCode + '&uid=' + validUid;
    initView(account);
    sinon.spy(view, 'logViewEvent');
  });

  afterEach(function() {
    metrics.destroy();

    view.remove();
    view.destroy();

    view = windowMock = metrics = null;
  });

  it('emits set-uid event correctly', () => {
    assert.equal(notifier.trigger.callCount, 2);
    const args = notifier.trigger.args[1];
    assert.equal(args[0], 'set-uid');
    assert.equal(args[1], validUid);
  });

  describe('beforeRender', () => {
    beforeEach(() => {
      view.beforeRender();
    });

    it('emits verification.clicked event correctly', () => {
      assert.equal(view.logViewEvent.callCount, 1);
      const args = view.logViewEvent.args[0];
      assert.equal(args.length, 1);
      assert.equal(args[0], 'verification.clicked');
    });
  });

  describe('getAccount', function() {
    describe('if verifying in the same browser', function() {
      beforeEach(function() {
        sinon.stub(user, 'getAccountByUid').callsFake(() => account);

        // do not pass in an account, to simulate how the module
        // is initialized in the app. The account should be
        // fetched from the User module, which fetches it
        // from localStorage.
        initView(null);
      });

      it('uses the stored account', function() {
        assert.deepEqual(view.getAccount(), account);
      });
    });

    describe('if verifying in a second browser', function() {
      beforeEach(function() {
        sinon.stub(user, 'getAccountByUid').callsFake(function() {
          // return the "default" account simulating the user verifying
          // in a second browser.
          return user.initAccount({});
        });

        // do not pass in an account, to simulate how the module
        // is initialized in the app. The account should be
        // fetched from the User module, which fetches it
        // from localStorage.
        initView(null);
      });

      it('returns an account with a `uid`', function() {
        assert.equal(view.getAccount().get('uid'), validUid);
      });
    });
  });

  describe('render', function() {
    describe('if uid is not available on the URL', function() {
      beforeEach(function() {
        return testShowsDamagedScreen('?code=' + validCode);
      });

      it('logs an error, does not attempt to verify the account', function() {
        testErrorLogged(AuthErrors.toError('DAMAGED_VERIFICATION_LINK'));
        assert.isFalse(account.verifySignUp.called);
      });
    });

    describe('if code is not available on the URL', function() {
      beforeEach(function() {
        return testShowsDamagedScreen('?uid=' + validUid);
      });

      it('logs an error, does not attempt to verify the account', function() {
        testErrorLogged(AuthErrors.toError('DAMAGED_VERIFICATION_LINK'));
        assert.isFalse(account.verifySignUp.called);
      });
    });

    describe('if service is available in the URL', function() {
      beforeEach(function() {
        windowMock.location.search =
          '?code=' +
          validCode +
          '&uid=' +
          validUid +
          '&service=' +
          validService;
        relier = new SyncRelier(
          {},
          {
            window: windowMock,
          }
        );
        relier.fetch();
        initView(account);
        sinon
          .stub(view, '_notifyBrokerAndComplete')
          .callsFake(() => Promise.resolve());
        return view.render();
      });

      it('attempt to verify the account with service', function() {
        var args = account.verifySignUp.getCall(0).args;
        assert.isTrue(account.verifySignUp.called);
        assert.ok(args[0]);
        assert.deepEqual(args[1], {
          primaryEmailVerified: null,
          reminder: null,
          secondaryEmailVerified: null,
          service: validService,
          style: null,
          type: null,
        });
      });
    });

    describe('if reminder is available in the URL', function() {
      beforeEach(function() {
        windowMock.location.search =
          '?code=' +
          validCode +
          '&uid=' +
          validUid +
          '&reminder=' +
          validReminder;
        relier = new Relier(
          {},
          {
            window: windowMock,
          }
        );
        relier.fetch();
        initView(account);
        sinon
          .stub(view, '_notifyBrokerAndComplete')
          .callsFake(() => Promise.resolve());
        return view.render();
      });

      it('attempt to verify the account with reminder', function() {
        var args = account.verifySignUp.getCall(0).args;
        assert.isTrue(account.verifySignUp.called);
        assert.ok(args[0]);
        assert.deepEqual(args[1], {
          primaryEmailVerified: null,
          reminder: validReminder,
          secondaryEmailVerified: null,
          service: null,
          style: null,
          type: null,
        });
      });
    });

    describe('if reminder and service is available in the URL', function() {
      beforeEach(function() {
        windowMock.location.search =
          '?code=' +
          validCode +
          '&uid=' +
          validUid +
          '&service=' +
          validService +
          '&reminder=' +
          validReminder;
        relier = new SyncRelier(
          {},
          {
            window: windowMock,
          }
        );
        relier.fetch();
        initView(account);
        sinon
          .stub(view, '_notifyBrokerAndComplete')
          .callsFake(() => Promise.resolve());
        return view.render();
      });

      it('attempt to verify the account with service and reminder', function() {
        var args = account.verifySignUp.getCall(0).args;
        assert.isTrue(account.verifySignUp.called);
        assert.ok(args[0]);
        assert.deepEqual(args[1], {
          primaryEmailVerified: null,
          reminder: validReminder,
          secondaryEmailVerified: null,
          service: validService,
          style: null,
          type: null,
        });
      });
    });

    describe('if type is in the url', function() {
      beforeEach(function() {
        windowMock.location.search =
          '?code=' + validCode + '&uid=' + validUid + '&type=secondary';
        relier = new Relier(
          {},
          {
            window: windowMock,
          }
        );
        relier.fetch();
        initView(account);
        sinon
          .stub(view, '_notifyBrokerAndComplete')
          .callsFake(() => Promise.resolve());
        return view.render();
      });

      it('attempt to pass type to verifySignUp', function() {
        var args = account.verifySignUp.getCall(0).args;
        assert.isTrue(account.verifySignUp.called);
        assert.ok(args[0]);
        assert.deepEqual(args[1], {
          primaryEmailVerified: null,
          reminder: null,
          secondaryEmailVerified: null,
          service: null,
          style: null,
          type: 'secondary',
        });
      });
    });

    describe('if secondary_email_verified is in the url', function() {
      beforeEach(function() {
        windowMock.location.search =
          '?code=' +
          validCode +
          '&uid=' +
          validUid +
          '&secondary_email_verified=some@email.com';
        relier = new Relier(
          {},
          {
            window: windowMock,
          }
        );
        relier.fetch();
        initView(account);
        sinon
          .stub(view, '_notifyBrokerAndComplete')
          .callsFake(() => Promise.resolve());
        return view.render();
      });

      it('attempt to pass secondary_email_verified to verifySignUp', function() {
        var args = account.verifySignUp.getCall(0).args;
        assert.isTrue(account.verifySignUp.called);
        assert.ok(args[0]);
        assert.deepEqual(args[1], {
          primaryEmailVerified: null,
          reminder: null,
          secondaryEmailVerified: 'some@email.com',
          service: null,
          style: null,
          type: null,
        });
      });
    });

    describe('if primary_email_verified is in the url', () => {
      beforeEach(function() {
        windowMock.location.search =
          '?code=' +
          validCode +
          '&uid=' +
          validUid +
          '&primary_email_verified=some@email.com';
        relier = new Relier(
          {},
          {
            window: windowMock,
          }
        );
        relier.fetch();
        initView(account);
        sinon
          .stub(view, '_notifyBrokerAndComplete')
          .callsFake(() => Promise.resolve());
        return view.render();
      });

      it('attempt to pass secondary_email_verified to verifySignUp', () => {
        const { args } = account.verifySignUp.getCall(0);
        assert.isTrue(account.verifySignUp.called);
        assert.ok(args[0]);
        assert.deepEqual(args[1], {
          primaryEmailVerified: 'some@email.com',
          reminder: null,
          secondaryEmailVerified: null,
          service: null,
          style: null,
          type: null,
        });
      });
    });

    describe('INVALID_PARAMETER error', function() {
      beforeEach(function() {
        verificationError = AuthErrors.toError('INVALID_PARAMETER', 'code');
        return testShowsDamagedScreen();
      });

      it('logs the error, attempts to verify the account', function() {
        testErrorLogged(AuthErrors.toError('DAMAGED_VERIFICATION_LINK'));
        assert.isTrue(account.verifySignUp.calledWith(validCode));
      });
    });

    describe('UNKNOWN_ACCOUNT error', function() {
      describe('with sessionToken available (user verifies in same browser)', function() {
        beforeEach(function() {
          verificationError = AuthErrors.toError(
            'UNKNOWN_ACCOUNT',
            'who are you?'
          );
          sinon.stub(user, 'getAccountByEmail').callsFake(function() {
            return user.initAccount({
              sessionToken: 'abc123',
            });
          });
          return testShowsExpiredScreen();
        });

        it('attempts to verify the account, displays link expired, resend link', function() {
          assert.isTrue(account.verifySignUp.calledWith(validCode));
          testErrorLogged(AuthErrors.toError('UNKNOWN_ACCOUNT_VERIFICATION'));
          assert.equal(view.$('#resend').length, 1);
        });
      });

      describe('without a sessionToken (user verifies in a different browser)', function() {
        beforeEach(function() {
          verificationError = AuthErrors.toError(
            'UNKNOWN_ACCOUNT',
            'who are you?'
          );
          sinon.stub(user, 'getAccountByEmail').callsFake(function() {
            return user.initAccount();
          });
          return testShowsExpiredScreen();
        });

        it('attempts to verify the account, displays link expired, no resend link', function() {
          assert.isTrue(account.verifySignUp.calledWith(validCode));
          testErrorLogged(AuthErrors.toError('UNKNOWN_ACCOUNT_VERIFICATION'));
          assert.equal(view.$('#resend').length, 0);
        });
      });
    });

    describe('INVALID_VERIFICATION_CODE error', function() {
      beforeEach(function() {
        verificationError = AuthErrors.toError(
          'INVALID_VERIFICATION_CODE',
          "this isn't a lottery"
        );
        return testShowsDamagedScreen();
      });

      it('attempts to verify the account, displays link damaged screen', function() {
        assert.isTrue(account.verifySignUp.calledWith(validCode));
        testErrorLogged(AuthErrors.toError('DAMAGED_VERIFICATION_LINK'));
      });
    });

    describe('REUSED_SIGNIN_VERIFICATION_CODE error', function() {
      beforeEach(function() {
        verificationError = AuthErrors.toError(
          'INVALID_VERIFICATION_CODE',
          "this isn't a lottery"
        );

        windowMock.location.search = '?code=' + validCode + '&uid=' + validUid;
        var model = new Backbone.Model();
        model.set('type', VerificationReasons.SIGN_IN);

        view = new View({
          account: account,
          broker: broker,
          metrics: metrics,
          model: model,
          notifier: notifier,
          relier: relier,
          user: user,
          window: windowMock,
        });

        return view.render();
      });

      it('displays the verification link expired screen', function() {
        assert.ok(view.$('#fxa-verification-link-reused-header').length);
        testErrorLogged(AuthErrors.toError('REUSED_SIGNIN_VERIFICATION_CODE'));
      });
    });

    describe('REUSED_PRIMARY_EMAIL_VERIFICATION_CODE error', () => {
      beforeEach(function() {
        verificationError = AuthErrors.toError(
          'INVALID_VERIFICATION_CODE',
          "this isn't a lottery"
        );

        windowMock.location.search = '?code=' + validCode + '&uid=' + validUid;
        var model = new Backbone.Model();
        model.set('type', VerificationReasons.PRIMARY_EMAIL_VERIFIED);

        view = new View({
          account: account,
          broker: broker,
          metrics: metrics,
          model: model,
          notifier: notifier,
          relier: relier,
          user: user,
          window: windowMock,
        });

        return view.render();
      });

      it('displays the verification link expired screen', () => {
        assert.ok(view.$('#fxa-verification-link-reused-header').length);
        testErrorLogged(
          AuthErrors.toError('REUSED_PRIMARY_EMAIL_VERIFICATION_CODE')
        );
      });
    });

    describe('all other server errors', function() {
      beforeEach(function() {
        verificationError = AuthErrors.toError('UNEXPECTED_ERROR');
        return view.render().then(() => view.afterVisible());
      });

      it('attempts to verify the account, errors are logged and displayed', function() {
        assert.isTrue(account.verifySignUp.calledWith(validCode));
        testErrorLogged(verificationError);
        assert.ok(view.$('#fxa-verification-error-header').length);
        assert.equal(view.$('.error').text(), 'Unexpected error');
      });
    });

    describe('success', () => {
      beforeEach(() => {
        sinon
          .stub(user, 'completeAccountSignUp')
          .callsFake(() => Promise.resolve());
        sinon
          .stub(view, '_notifyBrokerAndComplete')
          .callsFake(() => Promise.resolve());

        return view.render();
      });

      it('completes verification', () => {
        assert.isTrue(user.completeAccountSignUp.calledOnce);
        assert.isTrue(
          user.completeAccountSignUp.calledWith(account, validCode)
        );

        assert.isTrue(view._notifyBrokerAndComplete.calledOnce);
        assert.isTrue(view._notifyBrokerAndComplete.calledWith(account));
      });
    });
  });

  describe('_notifyBrokerAndComplete', () => {
    beforeEach(() => {
      notifier.trigger.resetHistory();
    });

    it('logs and notifies the broker', () => {
      sinon
        .stub(view, '_getBrokerMethod')
        .callsFake(() => 'afterCompleteSignIn');
      sinon.stub(view, 'invokeBrokerMethod').callsFake(() => Promise.resolve());
      sinon.stub(view, 'isSignIn').callsFake(() => true);
      sinon.spy(view, 'logEvent');

      return view._notifyBrokerAndComplete(account).then(() => {
        assert.isTrue(view.logViewEvent.calledOnce);
        assert.isTrue(view.logViewEvent.calledWith('verification.success'));

        assert.isTrue(notifier.trigger.calledOnce);
        assert.equal(notifier.trigger.args[0][0], 'verification.success');

        assert.isTrue(view.logEvent.calledOnce);
        assert.isTrue(view.logEvent.calledWith('signin.success'));

        assert.isTrue(view._getBrokerMethod.calledOnce);

        assert.isTrue(view.invokeBrokerMethod.calledOnce);
        assert.isTrue(
          view.invokeBrokerMethod.calledWith('afterCompleteSignIn', account)
        );
      });
    });
  });

  describe('_getBrokerMethod', () => {
    it('works for primary email', () => {
      sinon.stub(view, 'isPrimaryEmail').callsFake(() => true);

      assert.equal(view._getBrokerMethod(), 'afterCompletePrimaryEmail');
    });

    it('works for secondary emails', () => {
      sinon.stub(view, 'isSecondaryEmail').callsFake(() => true);

      assert.equal(view._getBrokerMethod(), 'afterCompleteSecondaryEmail');
    });

    it('works for signin', () => {
      sinon.stub(view, 'isSignIn').callsFake(() => true);

      assert.equal(view._getBrokerMethod(), 'afterCompleteSignIn');
    });

    it('works for signup', () => {
      sinon.stub(view, 'isSignUp').callsFake(() => true);

      assert.equal(view._getBrokerMethod(), 'afterCompleteSignUp');
    });
  });

  describe('resend', function() {
    var retrySignUpAccount;

    beforeEach(function() {
      account = user.initAccount({
        email: 'a@a.com',
        sessionToken: 'foo',
        uid: validUid,
      });
    });

    describe('successful resend', function() {
      beforeEach(function() {
        retrySignUpAccount = user.initAccount({
          email: 'a@a.com',
          sessionToken: 'new token',
          uid: validUid,
        });

        sinon.stub(account, 'verifySignUp').callsFake(() => Promise.resolve());
        sinon
          .stub(retrySignUpAccount, 'retrySignUp')
          .callsFake(() => Promise.resolve());
        sinon.stub(user, 'getAccountByUid').callsFake(() => account);
        sinon
          .stub(user, 'getAccountByEmail')
          .callsFake(() => retrySignUpAccount);

        windowMock.location.search = '?code=' + validCode + '&uid=' + validUid;
        initView();

        sinon
          .stub(view, 'getStringifiedResumeToken')
          .callsFake(() => 'resume token');
        sinon
          .stub(broker, 'afterCompleteSignUp')
          .callsFake(() => Promise.resolve());

        return view.render().then(function() {
          return view.resend();
        });
      });

      it('tells the account to retry signUp', function() {
        assert.isTrue(view.getStringifiedResumeToken.calledOnce);
        assert.isTrue(
          view.getStringifiedResumeToken.calledWith(retrySignUpAccount)
        );
        assert.isTrue(
          retrySignUpAccount.retrySignUp.calledWith(relier, {
            resume: 'resume token',
          })
        );
      });
    });

    describe('resend with invalid resend token', function() {
      beforeEach(function() {
        sinon.stub(account, 'retrySignUp').callsFake(function() {
          return Promise.reject(AuthErrors.toError('INVALID_TOKEN'));
        });

        sinon.stub(user, 'getAccountByEmail').callsFake(function() {
          return account;
        });

        sinon.spy(view, 'navigate');

        return view.resend();
      });

      it('sends the user to the /signup page', function() {
        assert.isTrue(view.navigate.calledWith('signup'));
      });
    });

    describe('other resend errors', function() {
      beforeEach(function() {
        sinon.stub(account, 'retrySignUp').callsFake(function() {
          return Promise.reject(AuthErrors.toError('UNEXPECTED_ERROR'));
        });

        sinon.stub(user, 'getAccountByEmail').callsFake(function() {
          return account;
        });
      });

      it('re-throws other errors', function() {
        return view.resend().then(assert.fail, function(err) {
          assert.isTrue(AuthErrors.is(err, 'UNEXPECTED_ERROR'));
        });
      });
    });
  });
});
