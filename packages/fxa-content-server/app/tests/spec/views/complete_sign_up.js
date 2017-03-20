/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define(function (require, exports, module) {
  'use strict';

  const { assert } = require('chai');
  const AuthErrors = require('lib/auth-errors');
  const Backbone = require('backbone');
  const Broker = require('models/auth_brokers/base');
  const Constants = require('lib/constants');
  const VerificationReasons = require('lib/verification-reasons');
  const MarketingEmailErrors = require('lib/marketing-email-errors');
  const Metrics = require('lib/metrics');
  const Notifier = require('lib/channels/notifier');
  const p = require('lib/promise');
  const Relier = require('models/reliers/relier');
  const sinon = require('sinon');
  const TestHelpers = require('../../lib/helpers');
  const Translator = require('lib/translator');
  const User = require('models/user');
  const View = require('views/complete_sign_up');
  const WindowMock = require('../../mocks/window');

  describe('views/complete_sign_up', function () {
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

    const validCode = TestHelpers.createRandomHexString(Constants.CODE_LENGTH);
    const validUid = TestHelpers.createRandomHexString(Constants.UID_LENGTH);
    const validService = 'someValidService';
    const validReminder = 'validReminder';

    function testShowsExpiredScreen(search) {
      windowMock.location.search = search || '?code=' + validCode + '&uid=' + validUid;
      initView(account);
      return view.render()
        .then(function () {
          assert.ok(view.$('#fxa-verification-link-expired-header').length);
        });
    }

    function testShowsDamagedScreen(search) {
      windowMock.location.search = search || '?code=' + validCode + '&uid=' + validUid;
      initView(account);
      return view.render()
        .then(function () {
          assert.ok(view.$('#fxa-verification-link-damaged-header').length);
        });
    }

    function testErrorLogged(error) {
      var normalizedError = view._normalizeError(error);
      assert.isTrue(TestHelpers.isErrorLogged(metrics, normalizedError));
    }

    function initView (account) {
      view = new View({
        account: account,
        broker: broker,
        metrics: metrics,
        notifier: notifier,
        relier: relier,
        translator: translator,
        user: user,
        viewName: 'complete_sign_up',
        window: windowMock
      });
    }

    beforeEach(function () {
      broker = new Broker();
      notifier = new Notifier();
      metrics = new Metrics({ notifier });
      relier = new Relier();
      user = new User({
        notifier: notifier
      });
      sinon.stub(user, 'setAccount', () => {});

      verificationError = null;
      windowMock = new WindowMock();
      translator = new Translator({forceEnglish: true});

      account = user.initAccount({
        email: 'a@a.com',
        sessionToken: 'foo',
        uid: validUid
      });

      sinon.stub(account, 'verifySignUp', function () {
        if (verificationError) {
          return p.reject(verificationError);
        } else {
          return p();
        }
      });

      isSignedIn = true;
      sinon.stub(account, 'isSignedIn', () => p(isSignedIn));

      windowMock.location.search = '?code=' + validCode + '&uid=' + validUid;
      initView(account);
    });

    afterEach(function () {
      metrics.destroy();

      view.remove();
      view.destroy();

      view = windowMock = metrics = null;
    });

    describe('getAccount', function () {
      describe('if verifying in the same browser', function () {
        beforeEach(function () {
          sinon.stub(user, 'getAccountByUid', () => account);

          // do not pass in an account, to simulate how the module
          // is initialized in the app. The account should be
          // fetched from the User module, which fetches it
          // from localStorage.
          initView(null);
        });

        it('uses the stored account', function () {
          assert.deepEqual(view.getAccount(), account);
        });
      });

      describe('if verifying in a second browser', function () {
        beforeEach(function () {
          sinon.stub(user, 'getAccountByUid', function () {
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

        it('returns an account with a `uid`', function () {
          assert.equal(view.getAccount().get('uid'), validUid);
        });
      });
    });

    describe('render', function () {
      describe('if uid is not available on the URL', function () {
        beforeEach(function () {
          return testShowsDamagedScreen('?code=' + validCode);
        });

        it('logs an error, does not attempt to verify the account', function () {
          testErrorLogged(AuthErrors.toError('DAMAGED_VERIFICATION_LINK'));
          assert.isFalse(account.verifySignUp.called);
        });
      });

      describe('if code is not available on the URL', function () {
        beforeEach(function () {
          return testShowsDamagedScreen('?uid=' + validUid);
        });

        it ('logs an error, does not attempt to verify the account', function () {
          testErrorLogged(AuthErrors.toError('DAMAGED_VERIFICATION_LINK'));
          assert.isFalse(account.verifySignUp.called);
        });
      });

      describe('if service is available in the URL', function () {
        beforeEach(function () {
          windowMock.location.search = '?code=' + validCode + '&uid=' + validUid + '&service=' + validService;
          relier = new Relier({}, {
            window: windowMock
          });
          relier.fetch();
          initView(account);
          return view.render();
        });

        it('attempt to verify the account with service', function () {
          var args = account.verifySignUp.getCall(0).args;
          assert.isTrue(account.verifySignUp.called);
          assert.ok(args[0]);
          assert.deepEqual(args[1], {reminder: null, service: validService});
        });
      });

      describe('if reminder is available in the URL', function () {
        beforeEach(function () {
          windowMock.location.search = '?code=' + validCode + '&uid=' + validUid + '&reminder=' + validReminder;
          relier = new Relier({}, {
            window: windowMock
          });
          relier.fetch();
          initView(account);
          return view.render();
        });

        it('attempt to verify the account with reminder', function () {
          var args = account.verifySignUp.getCall(0).args;
          assert.isTrue(account.verifySignUp.called);
          assert.ok(args[0]);
          assert.deepEqual(args[1], {reminder: validReminder, service: null});
        });
      });

      describe('if reminder and service is available in the URL', function () {
        beforeEach(function () {
          windowMock.location.search = '?code=' + validCode + '&uid=' + validUid +
            '&service=' + validService + '&reminder=' + validReminder;
          relier = new Relier({}, {
            window: windowMock
          });
          relier.fetch();
          initView(account);
          return view.render();
        });

        it('attempt to verify the account with service and reminder', function () {
          var args = account.verifySignUp.getCall(0).args;
          assert.isTrue(account.verifySignUp.called);
          assert.ok(args[0]);
          assert.deepEqual(args[1], {reminder: validReminder, service: validService});
        });
      });

      describe('email opt-in failures', function () {
        beforeEach(function () {
          verificationError = MarketingEmailErrors.toError('USAGE_ERROR');

          sinon.spy(view, 'logError');
          sinon.stub(view, '_notifyBrokerAndComplete', () => p());

          return view.render();
        });

        it('logs error, completes verification', function () {
          assert.isTrue(view.logError.calledWith(verificationError));
          assert.isTrue(view._notifyBrokerAndComplete.calledWith(account));
        });
      });

      describe('INVALID_PARAMETER error', function () {
        beforeEach(function () {
          verificationError = AuthErrors.toError('INVALID_PARAMETER', 'code');
          return testShowsDamagedScreen();
        });

        it('logs the error, attempts to verify the account', function () {
          testErrorLogged(AuthErrors.toError('DAMAGED_VERIFICATION_LINK'));
          assert.isTrue(account.verifySignUp.calledWith(validCode));
        });
      });

      describe('UNKNOWN_ACCOUNT error', function () {
        describe('with sessionToken available (user verifies in same browser)', function () {
          beforeEach(function () {
            verificationError = AuthErrors.toError('UNKNOWN_ACCOUNT', 'who are you?');
            sinon.stub(user, 'getAccountByEmail', function () {
              return user.initAccount({
                sessionToken: 'abc123'
              });
            });
            return testShowsExpiredScreen();
          });

          it('attempts to verify the account, displays link expired, resend link', function () {
            assert.isTrue(account.verifySignUp.calledWith(validCode));
            testErrorLogged(AuthErrors.toError('UNKNOWN_ACCOUNT_VERIFICATION'));
            assert.equal(view.$('#resend').length, 1);
          });
        });

        describe('without a sessionToken (user verifies in a different browser)', function () {
          beforeEach(function () {
            verificationError = AuthErrors.toError('UNKNOWN_ACCOUNT', 'who are you?');
            sinon.stub(user, 'getAccountByEmail', function () {
              return user.initAccount();
            });
            return testShowsExpiredScreen();
          });

          it('attempts to verify the account, displays link expired, no resend link', function () {
            assert.isTrue(account.verifySignUp.calledWith(validCode));
            testErrorLogged(AuthErrors.toError('UNKNOWN_ACCOUNT_VERIFICATION'));
            assert.equal(view.$('#resend').length, 0);
          });
        });
      });

      describe('INVALID_VERIFICATION_CODE error', function () {
        beforeEach(function () {
          verificationError = AuthErrors.toError('INVALID_VERIFICATION_CODE', 'this isn\'t a lottery');
          return testShowsDamagedScreen();
        });

        it('attempts to verify the account, displays link damaged screen', function () {
          assert.isTrue(account.verifySignUp.calledWith(validCode));
          testErrorLogged(AuthErrors.toError('DAMAGED_VERIFICATION_LINK'));
        });
      });

      describe('REUSED_SIGNIN_VERIFICATION_CODE error', function () {
        beforeEach(function () {
          verificationError = AuthErrors.toError('INVALID_VERIFICATION_CODE', 'this isn\'t a lottery');

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
            window: windowMock
          });

          return view.render();
        });

        it('displays the verification link expired screen', function () {
          assert.ok(view.$('#fxa-verification-link-reused-header').length);
          testErrorLogged(AuthErrors.toError('REUSED_SIGNIN_VERIFICATION_CODE'));
        });
      });

      describe('all other server errors', function () {
        beforeEach(function () {
          verificationError = AuthErrors.toError('UNEXPECTED_ERROR');
          return view.render().then(() => view.afterVisible());
        });

        it('attempts to verify the account, errors are logged and displayed', function () {
          assert.isTrue(account.verifySignUp.calledWith(validCode));
          testErrorLogged(verificationError);
          assert.ok(view.$('#fxa-verification-error-header').length);
          assert.equal(view.$('.error').text(), 'Unexpected error');
        });
      });

      describe('success', () => {
        beforeEach(() => {
          sinon.stub(user, 'completeAccountSignUp', () => p());

          sinon.stub(view, 'invokeBrokerMethod', () => p());
          sinon.stub(view, '_navigateToNextScreen', () => {});
          sinon.spy(view, 'logViewEvent');

          sinon.spy(notifier, 'trigger');

          return view.render();
        });

        it('completes verification', () => {
          assert.isTrue(user.completeAccountSignUp.calledOnce);
          assert.isTrue(user.completeAccountSignUp.calledWith(account, validCode));

          assert.isTrue(view.invokeBrokerMethod.calledWith('afterCompleteSignUp'));
          assert.isTrue(view._navigateToNextScreen.calledOnce);
          assert.isTrue(view.logViewEvent.calledWith('verification.success'));

          assert.isTrue(notifier.trigger.calledWith('verification.success'));
        });
      });
    });

    describe('_navigateToVerifiedScreen', () => {
      beforeEach(() => {
        sinon.spy(view, 'navigate');
      });

      describe('for sign-up', () => {
        beforeEach(() => {
          sinon.stub(view, 'isSignUp', () => true);
          return view._navigateToVerifiedScreen();
        });

        it('redirects to `signup_verified`', () => {
          assert.isTrue(view.navigate.calledOnce);
          assert.isTrue(view.navigate.calledWith('signup_verified'));
        });
      });

      describe('for sign-in', () => {
        beforeEach(() => {
          sinon.stub(view, 'isSignUp', () => false);
          return view._navigateToVerifiedScreen();
        });

        it('redirects to `signin_verified`', () => {
          assert.isTrue(view.navigate.calledOnce);
          assert.isTrue(view.navigate.calledWith('signin_verified'));
        });
      });
    });

    describe('_navigateToNextScreen', () => {
      beforeEach(() => {
        sinon.spy(view, 'navigate');
      });

      describe('sync relier', () => {
        beforeEach(() => {
          sinon.stub(relier, 'isSync', () => true);
          sinon.stub(relier, 'isOAuth', () => false);
        });

        describe('user is eligible to send sms', () => {
          beforeEach(() => {
            sinon.stub(view, '_isEligibleToSendSms', () => p(true));
            sinon.stub(view, '_isEligibleToConnectAnotherDevice', () => true);
            return view._navigateToNextScreen();
          });

          it('redirects user to `/sms`', () => {
            assert.isTrue(view.navigate.calledWith('sms'));
          });
        });

        describe('user is eligible to connect another device', () => {
          beforeEach(() => {
            sinon.stub(view, '_isEligibleToSendSms', () => p(false));
            sinon.stub(view, '_isEligibleToConnectAnotherDevice', () => true);
            return view._navigateToNextScreen();
          });

          it('redirects user to `/connect_another_device`', () => {
            assert.isTrue(view.navigate.calledWith('connect_another_device'));
          });
        });

        describe('user is not eligible to connect another device', () => {
          beforeEach(() => {
            sinon.stub(view, '_isEligibleToSendSms', () => p(false));
            sinon.stub(view, '_isEligibleToConnectAnotherDevice', () => false);
            sinon.spy(view, '_navigateToVerifiedScreen');
            return view._navigateToNextScreen();
          });

          it('delegates to `_navigateToVerifiedScreen`', () => {
            assert.isTrue(view._navigateToVerifiedScreen.calledOnce);
          });
        });
      });

      describe('oauth relier', () => {
        beforeEach(() => {
          sinon.stub(relier, 'isSync', () => false);
          sinon.stub(relier, 'isOAuth', () => true);
          sinon.spy(view, '_navigateToVerifiedScreen');

          return view._navigateToNextScreen();
        });

        it('delegates to _navigateToVerifiedScreen', () => {
          assert.isTrue(view._navigateToVerifiedScreen.calledOnce);
        });
      });

      describe('direct-access', () => {
        describe('user is signed in', () => {
          beforeEach(function () {
            isSignedIn = true;
            return view._navigateToNextScreen();
          });

          it('redirects to `/settings`', () => {
            assert.isTrue(view.navigate.calledWith('settings'));
          });
        });

        describe('user is not signed in', () => {
          beforeEach(function () {
            sinon.spy(view, '_navigateToVerifiedScreen');
            isSignedIn = false;

            return view._navigateToNextScreen();
          });

          it('delegates to _navigateToVerifiedScreen', () => {
            assert.isTrue(view._navigateToVerifiedScreen.calledOnce);
          });
        });
      });
    });

    describe('_isEligibleToConnectAnotherDevice', () => {
      beforeEach(() => {
        account = user.initAccount({
          email: 'a@a.com',
          sessionToken: 'foo',
          uid: validUid
        });

        sinon.spy(notifier, 'trigger');
      });

      describe('user is part of treatment group', () => {
        beforeEach(() => {
          sinon.stub(view, 'isInExperimentGroup', () => true);
        });

        describe('user is completing sign-in', () => {
          beforeEach(() => {
            sinon.stub(user, 'getSignedInAccount', () => {
              return {
                isDefault: () => true
              };
            });
            sinon.stub(view, 'isSignIn', () => true);
          });

          it('returns `false`', () => {
            assert.isFalse(view._isEligibleToConnectAnotherDevice(account));
          });
        });


        describe('no user signed in', () => {
          beforeEach(() => {
            sinon.stub(user, 'getSignedInAccount', () => {
              return {
                isDefault: () => true
              };
            });
          });

          it('returns `true`', () => {
            assert.isTrue(view._isEligibleToConnectAnotherDevice(account));
            assert.isFalse(notifier.trigger.called);
          });
        });

        describe('different user signed in', () => {
          beforeEach(() => {
            sinon.stub(user, 'getSignedInAccount', () => {
              return {
                isDefault: () => false
              };
            });
            sinon.stub(user, 'isSignedInAccount', () => false);
          });

          it('returns `false`, notifies', () => {
            assert.isFalse(view._isEligibleToConnectAnotherDevice(account));
            assert.isTrue(notifier.trigger.calledWith('connectAnotherDevice.other_user_signed_in'));
          });
        });

        describe('same user signed in', () => {
          beforeEach(() => {
            sinon.stub(user, 'getSignedInAccount', () => {
              return {
                isDefault: () => false
              };
            });
            sinon.stub(user, 'isSignedInAccount', () => true);
          });

          it('returns `true`', () => {
            assert.isTrue(view._isEligibleToConnectAnotherDevice(account));
          });
        });
      });

      describe('user is not part of treatment group', () => {
        beforeEach(() => {
          sinon.stub(view, 'isInExperimentGroup', () => false);
        });

        it('returns `false`', () => {
          assert.isFalse(view._isEligibleToConnectAnotherDevice(account));
          assert.isFalse(notifier.trigger.called);
        });
      });
    });

    describe('_isEligibleToSendSms', () => {
      beforeEach(() => {
        account = user.initAccount({
          email: 'a@a.com',
          sessionToken: 'foo',
          uid: validUid
        });

        sinon.spy(notifier, 'trigger');
      });

      describe('user is part of treatment group', () => {
        beforeEach(() => {
          sinon.stub(view, 'isInExperimentGroup', () => true);
        });

        describe('user is completing sign-in', () => {
          beforeEach(() => {
            sinon.stub(view, 'isSignIn', () => true);
          });

          it('resolves to `false`', () => {
            return view._isEligibleToSendSms()
              .then((isEligible) => {
                assert.isFalse(isEligible);
              });
          });
        });


        describe('no user signed in', () => {
          beforeEach(() => {
            sinon.stub(user, 'getSignedInAccount', () => {
              return {
                isDefault: () => true
              };
            });
          });

          it('resolves to `true`', () => {
            return view._isEligibleToSendSms()
              .then((isEligible) => {
                assert.isTrue(isEligible);
              });
          });
        });

        describe('different user signed in', () => {
          beforeEach(() => {
            sinon.stub(user, 'getSignedInAccount', () => {
              return {
                isDefault: () => false
              };
            });
            sinon.stub(user, 'isSignedInAccount', () => false);
          });

          it('resolves to `false`', () => {
            return view._isEligibleToSendSms()
              .then((isEligible) => {
                assert.isFalse(isEligible);
              });
          });
        });

        describe('same user signed in', () => {
          beforeEach(() => {
            sinon.stub(user, 'getSignedInAccount', () => {
              return {
                isDefault: () => false
              };
            });
            sinon.stub(user, 'isSignedInAccount', () => true);
          });

          it('resolves to `true`', () => {
            return view._isEligibleToSendSms()
              .then((isEligible) => {
                assert.isTrue(isEligible);
              });
          });
        });
      });

      describe('user is not part of treatment group', () => {
        beforeEach(() => {
          sinon.stub(view, 'isInExperimentGroup', () => false);
        });

        it('resolves to `false`', () => {
          return view._isEligibleToSendSms()
            .then((isEligible) => {
              assert.isFalse(isEligible);
            });
        });
      });
    });

    describe('resend', function () {
      var retrySignUpAccount;

      beforeEach(function () {
        account = user.initAccount({
          email: 'a@a.com',
          sessionToken: 'foo',
          uid: validUid
        });
      });

      describe('successful resend', function () {
        beforeEach(function () {
          retrySignUpAccount = user.initAccount({
            email: 'a@a.com',
            sessionToken: 'new token',
            uid: validUid
          });

          sinon.stub(account, 'verifySignUp', () => p());
          sinon.stub(retrySignUpAccount, 'retrySignUp', () => p());
          sinon.stub(user, 'getAccountByUid', () => account);
          sinon.stub(user, 'getAccountByEmail', () => retrySignUpAccount);

          windowMock.location.search = '?code=' + validCode + '&uid=' + validUid;
          initView();

          sinon.stub(view, 'getStringifiedResumeToken', () => 'resume token');

          return view.render()
            .then(function () {
              return view.resend();
            });
        });

        it('tells the account to retry signUp', function () {
          assert.isTrue(view.getStringifiedResumeToken.calledOnce);
          assert.isTrue(view.getStringifiedResumeToken.calledWith(retrySignUpAccount));
          assert.isTrue(retrySignUpAccount.retrySignUp.calledWith(
            relier,
            {
              resume: 'resume token'
            }
          ));
        });
      });

      describe('resend with invalid resend token', function () {
        beforeEach(function () {
          sinon.stub(account, 'retrySignUp', function () {
            return p.reject(AuthErrors.toError('INVALID_TOKEN'));
          });

          sinon.stub(user, 'getAccountByEmail', function () {
            return account;
          });

          sinon.spy(view, 'navigate');

          return view.resend();
        });

        it('sends the user to the /signup page', function () {
          assert.isTrue(view.navigate.calledWith('signup'));
        });
      });

      describe('other resend errors', function () {
        beforeEach(function () {
          sinon.stub(account, 'retrySignUp', function () {
            return p.reject(AuthErrors.toError('UNEXPECTED_ERROR'));
          });

          sinon.stub(user, 'getAccountByEmail', function () {
            return account;
          });
        });

        it('re-throws other errors', function () {
          return view.resend()
            .then(assert.fail, function (err) {
              assert.isTrue(AuthErrors.is(err, 'UNEXPECTED_ERROR'));
            });
        });
      });
    });
  });
});
