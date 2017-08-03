/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define(function (require, exports, module) {
  'use strict';

  const Account = require('models/account');
  const { assert } = require('chai');
  const AuthBroker = require('models/auth_brokers/base');
  const AuthErrors = require('lib/auth-errors');
  const Backbone = require('backbone');
  const p = require('lib/promise');
  const Relier = require('models/reliers/relier');
  const SignInMixin = require('views/mixins/signin-mixin');
  const sinon = require('sinon');
  const User = require('models/user');
  const VerificationMethods = require('lib/verification-methods');
  const VerificationReasons = require('lib/verification-reasons');

  const RESUME_TOKEN = 'a big hairy resume token';

  describe('views/mixins/signin-mixin', function () {
    it('exports correct interface', function () {
      assert.isObject(SignInMixin);
      assert.lengthOf(Object.keys(SignInMixin), 4);
      assert.isFunction(SignInMixin.signIn);
      assert.isFunction(SignInMixin.onSignInBlocked);
      assert.isFunction(SignInMixin.onSignInSuccess);
      assert.isArray(SignInMixin.dependsOn);
    });

    describe('signIn', function () {
      let account;
      let broker;
      let model;
      let relier;
      let user;
      let view;

      beforeEach(function () {
        account = new Account({
          email: 'testuser@testuser.com',
          verified: true
        });
        broker = new AuthBroker();
        model = new Backbone.Model();
        user = new User();
        sinon.stub(user, 'signInAccount', (account) => p(account));

        relier = new Relier();
        view = {
          _clickLink: SignInMixin._clickLink,
          _engageSignInForm: SignInMixin._engageSignInForm,
          formPrefill: {
            clear: sinon.spy()
          },
          _submitSignInForm: SignInMixin._submitSignInForm,
          broker: broker,
          currentPage: 'force_auth',
          displayError: sinon.spy(),
          getStringifiedResumeToken: sinon.spy(() => RESUME_TOKEN),
          invokeBrokerMethod: sinon.spy(function () {
            return p();
          }),
          logEvent: sinon.spy(),
          logFlowEvent: sinon.spy(),
          logViewEvent: sinon.spy(),
          model: model,
          navigate: sinon.spy(),
          on: sinon.spy(),
          onSignInBlocked: SignInMixin.onSignInBlocked,
          onSignInSuccess: SignInMixin.onSignInSuccess,
          relier: relier,
          signIn: SignInMixin.signIn,
          user: user
        };
      });

      describe('account needs permissions', function () {
        beforeEach(function () {
          sinon.stub(relier, 'accountNeedsPermissions', function () {
            return true;
          });

          return view.signIn(account, 'password');
        });

        it('invokes the correct broker method', function () {
          assert.isTrue(
            view.invokeBrokerMethod.calledWith('beforeSignIn', account));
        });

        it('signs in the user', function () {
          assert.isTrue(view.getStringifiedResumeToken.calledOnce);
          assert.isTrue(view.getStringifiedResumeToken.calledWith(account));
          assert.isTrue(
            user.signInAccount.calledWith(account, 'password', relier));
          assert.equal(user.signInAccount.args[0][3].resume, RESUME_TOKEN);
        });

        it('redirects to the `signin_permissions` screen', function () {
          assert.isTrue(view.navigate.calledOnce);

          var args = view.navigate.args[0];
          assert.equal(args[0], 'signin_permissions');
          assert.deepEqual(args[1].account, account);
          assert.isFunction(args[1].onSubmitComplete);
        });

        it('does not log any events', function () {
          assert.isFalse(view.logViewEvent.called);
        });
      });

      describe('verified account', function () {
        describe('with `redirectTo` specified', function () {
          beforeEach(function () {
            model.set('redirectTo', 'settings/avatar');

            return view.signIn(account, 'password');
          });

          it('calls view.logViewEvent correctly', function () {
            assert.equal(view.logViewEvent.callCount, 1);
            assert.isTrue(view.logViewEvent.calledWith('signin.success'));
          });

          it('calls view.logEvent correctly', function () {
            assert.equal(view.logEvent.callCount, 2);
            assert.isTrue(view.logEvent.calledWith('signin.success'));
            assert.isTrue(view.logEvent.calledWith('signin.success.skip-confirm'));
          });

          it('calls view.formPrefill.clear correctly', function () {
            assert.equal(view.formPrefill.clear.callCount, 1);
            assert.lengthOf(view.formPrefill.clear.args[0], 0);
          });

          it('calls view.invokeBrokerMethod correctly', function () {
            assert.equal(view.invokeBrokerMethod.callCount, 2);

            var args = view.invokeBrokerMethod.args[0];
            assert.lengthOf(args, 2);
            assert.equal(args[0], 'beforeSignIn');
            assert.equal(args[1], account);

            args = view.invokeBrokerMethod.args[1];
            assert.lengthOf(args, 2);
            assert.equal(args[0], 'afterSignIn');
            assert.equal(args[1], account);
          });

          it('calls view.navigate correctly', function () {
            assert.equal(view.navigate.callCount, 1);
            var args = view.navigate.args[0];
            assert.lengthOf(args, 4);
            assert.equal(args[0], 'settings/avatar');
            assert.isObject(args[1]);
            assert.lengthOf(Object.keys(args[1]), 0);
            assert.deepEqual(args[2], {});
            assert.isUndefined(args[3]);
          });
        });

        describe('without `redirectTo` specified', function () {
          beforeEach(function () {
            model.unset('redirectTo');

            return view.signIn(account, 'password');
          });

          it('calls view.navigate correctly', function () {
            assert.equal(view.navigate.callCount, 1);
            var args = view.navigate.args[0];
            assert.lengthOf(args, 4);
            assert.equal(args[0], 'settings');
            assert.isObject(args[1]);
            assert.lengthOf(Object.keys(args[1]), 0);
            assert.deepEqual(args[2], {});
            assert.isUndefined(args[3]);
          });
        });
      });

      describe('unverified account', function () {
        beforeEach(function () {
          account.set({
            verificationMethod: VerificationMethods.EMAIL,
            verificationReason: VerificationReasons.SIGN_UP,
            verified: false
          });

          return view.signIn(account, 'password');
        });

        it('signs in the user', function () {
          assert.isTrue(view.getStringifiedResumeToken.calledOnce);
          assert.isTrue(view.getStringifiedResumeToken.calledWith(account));
          assert.isTrue(
            user.signInAccount.calledWith(account, 'password', relier));
          assert.equal(user.signInAccount.args[0][3].resume, RESUME_TOKEN);
        });

        it('calls view.navigate correctly', function () {
          assert.equal(view.navigate.callCount, 1);
          var args = view.navigate.args[0];
          assert.lengthOf(args, 2);
          assert.equal(args[0], 'confirm');
          assert.deepEqual(args[1], { account });
        });

        it('calls logFlowEvent correctly', () => {
          assert.equal(view.logFlowEvent.callCount, 1);
          assert.equal(view.logFlowEvent.args[0].length, 2);
          assert.equal(view.logFlowEvent.args[0][0], 'attempt');
          assert.equal(view.logFlowEvent.args[0][1], 'signin');
        });
      });

      describe('unverified session', function () {
        beforeEach(function () {
          account.set({
            verificationMethod: VerificationMethods.EMAIL,
            verificationReason: VerificationReasons.SIGN_IN,
            verified: false
          });

          return view.signIn(account, 'password');
        });

        it('signs in the user', function () {
          assert.isTrue(view.getStringifiedResumeToken.calledOnce);
          assert.isTrue(view.getStringifiedResumeToken.calledWith(account));
          assert.isTrue(
            user.signInAccount.calledWith(account, 'password', relier));
          assert.equal(user.signInAccount.args[0][3].resume, RESUME_TOKEN);
        });

        it('calls view.navigate correctly', function () {
          assert.equal(view.navigate.callCount, 1);
          var args = view.navigate.args[0];
          assert.lengthOf(args, 2);
          assert.equal(args[0], 'confirm_signin');
          assert.deepEqual(args[1], { account });
        });

        it('calls logFlowEvent correctly', () => {
          assert.equal(view.logFlowEvent.callCount, 1);
          assert.equal(view.logFlowEvent.args[0].length, 2);
          assert.equal(view.logFlowEvent.args[0][0], 'attempt');
          assert.equal(view.logFlowEvent.args[0][1], 'signin');
        });
      });

      describe('blocked', () => {
        let blockedError;

        beforeEach(() => {
          blockedError = AuthErrors.toError('REQUEST_BLOCKED');

          user.signInAccount.restore();
          sinon.stub(user, 'signInAccount', () => p.reject(blockedError));
        });

        describe('cannot unblock', () => {
          let err;
          beforeEach(() => {
            return view.signIn(account, 'password')
              .then(assert.fail, (_err) => err = _err);
          });

          it('re-throws the error for display at a lower level', () => {
            assert.strictEqual(err, blockedError);
          });
        });

        describe('can unblock', () => {
          describe('email successfully sent', () => {
            beforeEach(() => {
              blockedError.verificationReason = VerificationReasons.SIGN_IN;
              blockedError.verificationMethod = VerificationMethods.EMAIL_CAPTCHA;

              sinon.stub(account, 'sendUnblockEmail', () => p());

              return view.signIn(account, 'password');
            });

            it('redirects to `signin_unblock` with the account and password', () => {
              assert.isTrue(view.navigate.calledWith(
                'signin_unblock',
                {
                  account: account,
                  lastPage: 'force_auth',
                  password: 'password'
                }
              ));
            });
          });

          describe('error sending email', () => {
            const err = AuthErrors.toError('UNEXPECTED_ERROR');
            let thrownErr;

            beforeEach(() => {
              blockedError.verificationReason = VerificationReasons.SIGN_IN;
              blockedError.verificationMethod = VerificationMethods.EMAIL_CAPTCHA;

              sinon.stub(account, 'sendUnblockEmail', () => p.reject(err));

              return view.signIn(account, 'password')
                .then(assert.fail, (_err) => thrownErr = _err);
            });

            it('re-throws the error for display', () => {
              assert.strictEqual(thrownErr, err);
            });
          });
        });
      });

      describe('hard email bounce error', () => {
        let succeeded, failed;

        beforeEach(() => {
          user.signInAccount.restore();
          sinon.stub(user, 'signInAccount', () => {
            return p.reject(AuthErrors.toError('EMAIL_HARD_BOUNCE'));
          });

          return view.signIn(account, 'password')
            .then(() => succeeded = true, () => failed = true);
        });

        it('succeeded', () => {
          assert.isTrue(succeeded);
          assert.isUndefined(failed);
        });

        it('navigated to the signin-bounced screen', () => {
          assert.equal(view.navigate.callCount, 1);
          assert.equal(view.navigate.args[0][0], 'signin_bounced');
          assert.deepEqual(view.navigate.args[0][1], { email: account.get('email') });
        });
      });

      describe('soft email bounce error', () => {
        let succeeded, err;

        beforeEach(() => {
          user.signInAccount.restore();
          sinon.stub(user, 'signInAccount', () => {
            return p.reject(AuthErrors.toError('EMAIL_SOFT_BOUNCE'));
          });

          return view.signIn(account, 'password')
            .then(() => succeeded = true, e => err = e);
        });

        it('failed', () => {
          assert.isTrue(AuthErrors.is(err, 'EMAIL_SOFT_BOUNCE'));
          assert.isUndefined(succeeded);
        });

        it('did not navigate', () => {
          assert.equal(view.navigate.callCount, 0);
        });
      });

      describe('email complaint error', () => {
        let succeeded, failed;

        beforeEach(() => {
          user.signInAccount.restore();
          sinon.stub(user, 'signInAccount', () => {
            return p.reject(AuthErrors.toError('EMAIL_SENT_COMPLAINT'));
          });

          return view.signIn(account, 'password')
            .then(() => succeeded = true, e => failed = true);
        });

        it('succeeded', () => {
          assert.isTrue(succeeded);
          assert.isUndefined(failed);
        });

        it('navigated to the signin-bounced screen', () => {
          assert.equal(view.navigate.callCount, 1);
          assert.equal(view.navigate.args[0][0], 'signin_bounced');
          assert.deepEqual(view.navigate.args[0][1], { email: account.get('email') });
        });
      });

      describe('formPrefill undefined', function () {
        beforeEach(function () {
          view.formPrefill = undefined;
        });

        it('does not throw', function () {
          assert.doesNotThrow(function () {
            return view.signIn(account);
          });
        });
      });
    });
  });
});
