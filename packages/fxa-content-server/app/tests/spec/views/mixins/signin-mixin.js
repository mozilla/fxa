/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import Account from 'models/account';
import { assert } from 'chai';
import AuthBroker from 'models/auth_brokers/base';
import AuthErrors from 'lib/auth-errors';
import Backbone from 'backbone';
import OAuthErrors from 'lib/oauth-errors';
import Relier from 'models/reliers/relier';
import BrowserRelier from 'models/reliers/browser';
import SignInMixin from 'views/mixins/signin-mixin';
import sinon from 'sinon';
import User from 'models/user';
import VerificationMethods from 'lib/verification-methods';
import VerificationReasons from 'lib/verification-reasons';

const RESUME_TOKEN = 'a big hairy resume token';

describe('views/mixins/signin-mixin', function() {
  it('exports correct interface', function() {
    assert.isObject(SignInMixin);
    assert.lengthOf(Object.keys(SignInMixin), 4);
    assert.isFunction(SignInMixin.signIn);
    assert.isFunction(SignInMixin.onSignInBlocked);
    assert.isFunction(SignInMixin.onSignInSuccess);
    assert.isArray(SignInMixin.dependsOn);
  });

  describe('signIn', function() {
    let account;
    let broker;
    let model;
    let relier;
    let user;
    let view;

    beforeEach(function() {
      account = new Account({
        email: 'testuser@testuser.com',
        verified: true,
      });
      broker = new AuthBroker();
      model = new Backbone.Model();
      user = new User();
      sinon
        .stub(user, 'signInAccount')
        .callsFake(account => Promise.resolve(account));

      relier = new Relier();
      view = {
        _clickLink: SignInMixin._clickLink,
        _engageSignInForm: SignInMixin._engageSignInForm,
        formPrefill: {
          clear: sinon.spy(),
        },
        _submitSignInForm: SignInMixin._submitSignInForm,
        broker: broker,
        currentPage: 'force_auth',
        displayError: sinon.spy(),
        getStringifiedResumeToken: sinon.spy(() => RESUME_TOKEN),
        getTokenCodeExperimentGroup: sinon.spy(() => 'control'),
        invokeBrokerMethod: sinon.spy(() => Promise.resolve()),
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
        unsafeDisplayError: sinon.spy(),
        user: user,
      };
    });

    describe('account needs permissions', function() {
      beforeEach(function() {
        sinon.stub(relier, 'accountNeedsPermissions').callsFake(function() {
          return true;
        });

        return view.signIn(account, 'password');
      });

      it('invokes the correct broker method', function() {
        assert.isTrue(
          view.invokeBrokerMethod.calledWith('beforeSignIn', account)
        );
      });

      it('signs in the user', function() {
        assert.isTrue(view.getStringifiedResumeToken.calledOnce);
        assert.isTrue(view.getStringifiedResumeToken.calledWith(account));
        assert.isTrue(
          user.signInAccount.calledWith(account, 'password', relier)
        );
        assert.equal(user.signInAccount.args[0][3].resume, RESUME_TOKEN);
      });

      it('redirects to the `signin_permissions` screen', function() {
        assert.isTrue(view.navigate.calledOnce);

        var args = view.navigate.args[0];
        assert.equal(args[0], 'signin_permissions');
        assert.deepEqual(args[1].account, account);
        assert.isFunction(args[1].onSubmitComplete);
      });

      it('does not log any events', function() {
        assert.isFalse(view.logViewEvent.called);
      });
    });

    describe('offers to Sync', function() {
      it('navigates to the correct view', function() {
        view.relier = new BrowserRelier();
        sinon.spy(view.relier, 'shouldOfferToSync');

        return view.signIn(account, 'password').then(() => {
          assert.isTrue(view.relier.shouldOfferToSync.calledOnce);
          assert.isTrue(view.navigate.calledOnce);

          var args = view.navigate.args[0];
          assert.equal(args[0], 'would_you_like_to_sync');
          assert.deepEqual(args[1].account, account);
          assert.isFunction(args[1].onSubmitComplete);
        });
      });

      it('skips if relier does not support it', function() {
        sinon.spy(view.relier, 'shouldOfferToSync');

        return view.signIn(account, 'password').then(() => {
          assert.isTrue(view.relier.shouldOfferToSync.calledOnce);
          assert.isFalse(view.navigate.calledOnce);
        });
      });

      it('skips if service is sync already', function() {
        view.relier = new BrowserRelier();
        view.relier.set('service', 'sync');
        sinon.spy(view.relier, 'shouldOfferToSync');

        return view.signIn(account, 'password').then(() => {
          assert.isTrue(view.relier.shouldOfferToSync.calledOnce);
          assert.isFalse(view.navigate.calledOnce);
        });
      });

      it('skips if viewName is force-auth', function() {
        view.relier = new BrowserRelier();
        sinon.spy(view.relier, 'shouldOfferToSync');

        view.viewName = 'force-auth';
        return view.signIn(account, 'password').then(() => {
          assert.isFalse(view.navigate.called);
        });
      });
    });

    describe('verified account', function() {
      describe('with `redirectTo` specified', function() {
        beforeEach(function() {
          model.set('redirectTo', 'settings/avatar');
          sinon.spy(broker, 'setBehavior');

          return view.signIn(account, 'password');
        });

        it('calls view.logViewEvent correctly', function() {
          assert.equal(view.logViewEvent.callCount, 1);
          assert.isTrue(view.logViewEvent.calledWith('signin.success'));
        });

        it('calls view.logEvent correctly', function() {
          assert.equal(view.logEvent.callCount, 2);
          assert.isTrue(view.logEvent.calledWith('signin.success'));
          assert.isTrue(
            view.logEvent.calledWith('signin.success.skip-confirm')
          );
        });

        it('calls view.formPrefill.clear correctly', function() {
          assert.equal(view.formPrefill.clear.callCount, 1);
          assert.lengthOf(view.formPrefill.clear.args[0], 0);
        });

        it('sets a NavigateBehavior with the expected endpoint on the broker', () => {
          const behavior = broker.getBehavior('afterSignIn');
          assert.equal(behavior.type, 'navigate');
          assert.equal(behavior.endpoint, 'settings/avatar');

          assert.isTrue(broker.setBehavior.calledOnce);
          assert.isTrue(broker.setBehavior.calledWith('afterSignIn', behavior));
        });

        it('calls view.invokeBrokerMethod correctly', function() {
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
      });

      describe('without `redirectTo` specified', function() {
        beforeEach(function() {
          model.unset('redirectTo');
          sinon.spy(broker, 'setBehavior');

          return view.signIn(account, 'password');
        });

        it('does not set a NavigateBehavior on the broker', () => {
          assert.isFalse(broker.setBehavior.called);
        });
      });

      describe('with `onSuccess` option', () => {
        let onSuccess;

        beforeEach(() => {
          onSuccess = sinon.spy();
          return view.signIn(account, 'password', { onSuccess });
        });

        it('called onSuccess', () => {
          assert.equal(onSuccess.callCount, 1);
          assert.lengthOf(onSuccess.args[0], 0);
        });
      });
    });

    describe('unverified account', function() {
      beforeEach(function() {
        account.set({
          verificationMethod: VerificationMethods.EMAIL,
          verificationReason: VerificationReasons.SIGN_UP,
          verified: false,
        });

        return view.signIn(account, 'password');
      });

      it('signs in the user', function() {
        assert.isTrue(view.getStringifiedResumeToken.calledOnce);
        assert.isTrue(view.getStringifiedResumeToken.calledWith(account));
        assert.isTrue(
          user.signInAccount.calledWith(account, 'password', relier)
        );
        assert.equal(user.signInAccount.args[0][3].resume, RESUME_TOKEN);
      });

      it('calls view.navigate correctly', function() {
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

    describe('unverified session', function() {
      beforeEach(function() {
        account.set({
          verificationMethod: VerificationMethods.EMAIL,
          verificationReason: VerificationReasons.SIGN_IN,
          verified: false,
        });

        return view.signIn(account, 'password');
      });

      it('signs in the user', function() {
        assert.isTrue(view.getStringifiedResumeToken.calledOnce);
        assert.isTrue(view.getStringifiedResumeToken.calledWith(account));
        assert.isTrue(
          user.signInAccount.calledWith(account, 'password', relier)
        );
        assert.equal(user.signInAccount.args[0][3].resume, RESUME_TOKEN);
      });

      it('calls view.navigate correctly', function() {
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

    describe('with existing sessionToken', () => {
      beforeEach(() => {
        account.set({
          sessionToken: 'session token',
          sessionTokenContext: 'sync context',
        });
      });

      describe('with broker that has `reuseExistingSession` capability', () => {
        beforeEach(() => {
          broker.setCapability('reuseExistingSession', true);
          return view.signIn(account, 'password');
        });

        it('keeps the existing sessionToken', () => {
          assert.equal(account.get('sessionToken'), 'session token');
        });

        it('signs in the user', () => {
          assert.isTrue(
            user.signInAccount.calledWith(account, 'password', relier)
          );
        });
      });

      describe('with broker that does not have `reuseExistingSession` capability', () => {
        beforeEach(() => {
          broker.setCapability('reuseExistingSession', false);
          return view.signIn(account, 'password');
        });

        it('discards the existing sessionToken', () => {
          assert.isTrue(!account.has('sessionToken'));
        });

        it('signs in the user', () => {
          assert.isTrue(
            user.signInAccount.calledWith(account, 'password', relier)
          );
        });
      });
    });

    describe('blocked', () => {
      let blockedError;

      beforeEach(() => {
        blockedError = AuthErrors.toError('REQUEST_BLOCKED');

        user.signInAccount.restore();
        sinon
          .stub(user, 'signInAccount')
          .callsFake(() => Promise.reject(blockedError));
      });

      describe('cannot unblock', () => {
        let err;
        beforeEach(() => {
          return view
            .signIn(account, 'password')
            .then(assert.fail, _err => (err = _err));
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

            sinon
              .stub(account, 'sendUnblockEmail')
              .callsFake(() => Promise.resolve());

            return view.signIn(account, 'password');
          });

          it('redirects to `signin_unblock` with the account and password', () => {
            assert.isTrue(
              view.navigate.calledWith('signin_unblock', {
                account: account,
                lastPage: 'force_auth',
                password: 'password',
              })
            );
          });
        });

        describe('error sending email', () => {
          const err = AuthErrors.toError('UNEXPECTED_ERROR');
          let thrownErr;

          beforeEach(() => {
            blockedError.verificationReason = VerificationReasons.SIGN_IN;
            blockedError.verificationMethod = VerificationMethods.EMAIL_CAPTCHA;

            sinon
              .stub(account, 'sendUnblockEmail')
              .callsFake(() => Promise.reject(err));

            return view
              .signIn(account, 'password')
              .then(assert.fail, _err => (thrownErr = _err));
          });

          it('re-throws the error for display', () => {
            assert.strictEqual(thrownErr, err);
          });
        });
      });

      describe('with `onSuccess` option', () => {
        let onSuccess;

        beforeEach(() => {
          onSuccess = sinon.spy();
          return view
            .signIn(account, 'password', { onSuccess })
            .catch(() => {});
        });

        it('did not call onSuccess', () => {
          assert.equal(onSuccess.callCount, 0);
        });
      });
    });

    describe('hard email bounce error', () => {
      let succeeded, failed;

      beforeEach(() => {
        user.signInAccount.restore();
        sinon.stub(user, 'signInAccount').callsFake(() => {
          return Promise.reject(AuthErrors.toError('EMAIL_HARD_BOUNCE'));
        });

        return view
          .signIn(account, 'password')
          .then(() => (succeeded = true), () => (failed = true));
      });

      it('succeeded', () => {
        assert.isTrue(succeeded);
        assert.isUndefined(failed);
      });

      it('navigated to the signin-bounced screen', () => {
        assert.equal(view.navigate.callCount, 1);
        assert.equal(view.navigate.args[0][0], 'signin_bounced');
        assert.deepEqual(view.navigate.args[0][1], {
          email: account.get('email'),
        });
      });
    });

    describe('soft email bounce error', () => {
      let succeeded, err;

      beforeEach(() => {
        user.signInAccount.restore();
        sinon.stub(user, 'signInAccount').callsFake(() => {
          return Promise.reject(AuthErrors.toError('EMAIL_SOFT_BOUNCE'));
        });

        return view
          .signIn(account, 'password')
          .then(() => (succeeded = true), e => (err = e));
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
        sinon.stub(user, 'signInAccount').callsFake(() => {
          return Promise.reject(AuthErrors.toError('EMAIL_SENT_COMPLAINT'));
        });

        return view
          .signIn(account, 'password')
          .then(() => (succeeded = true), e => (failed = true));
      });

      it('succeeded', () => {
        assert.isTrue(succeeded);
        assert.isUndefined(failed);
      });

      it('navigated to the signin-bounced screen', () => {
        assert.equal(view.navigate.callCount, 1);
        assert.equal(view.navigate.args[0][0], 'signin_bounced');
        assert.deepEqual(view.navigate.args[0][1], {
          email: account.get('email'),
        });
      });
    });

    describe('formPrefill undefined', function() {
      beforeEach(function() {
        view.formPrefill = undefined;
      });

      it('does not throw', function() {
        assert.doesNotThrow(function() {
          return view.signIn(account);
        });
      });
    });

    describe('onSignInSuccess', () => {
      it('updates relier email and uid from account', () => {
        account.set('uid', 'foo');
        account.set('email', 'a@a.com');
        relier.set('uid', 'bar');
        relier.set('uid', 'b@b.com');
        view.onSignInSuccess(account);
        assert.equal(relier.get('uid'), account.get('uid'));
        assert.equal(relier.get('email'), account.get('email'));
      });

      it('updates relier uid with the allowUidChange broker', () => {
        account.set('uid', 'foo');
        account.set('email', 'a@a.com');
        relier.set('uid', 'bar');
        relier.set('email', 'b@b.com');
        broker.hasCapability(cap => cap === 'allowUidChange');
        view.onSignInSuccess(account);
        assert.equal(relier.get('uid'), account.get('uid'));
        assert.equal(relier.get('email'), account.get('email'));
      });
    });

    describe('relier wants TOTP', () => {
      let err;

      beforeEach(() => {
        err = AuthErrors.toError('TOTP_REQUIRED');

        user.signInAccount.restore();
        sinon.stub(user, 'signInAccount').callsFake(() => Promise.reject(err));
        sinon.stub(relier, 'isOAuth').callsFake(() => true);
        sinon.stub(relier, 'wantsTwoStepAuthentication').callsFake(() => true);

        return view.signIn(account, 'password');
      });

      it('failed', () => {
        assert.isTrue(AuthErrors.is(err, 'TOTP_REQUIRED'));
        assert.isTrue(view.unsafeDisplayError.calledWith(err));
        const link =
          'https://support.mozilla.org/kb/secure-firefox-account-two-step-authentication';
        assert.isTrue(
          err.forceMessage.indexOf(link) > 0,
          'contains setup link'
        );

        const args = user.signInAccount.args[0];
        assert.equal(
          args[3].verificationMethod,
          VerificationMethods.TOTP_2FA,
          'correct verification method set'
        );
      });

      it('did not navigate', () => {
        assert.equal(view.navigate.callCount, 0);
      });
    });

    describe('relier has mismatch acr values', () => {
      let err;

      beforeEach(() => {
        err = OAuthErrors.toError('MISMATCH_ACR_VALUES');

        user.signInAccount.restore();
        sinon.stub(user, 'signInAccount').callsFake(() => Promise.reject(err));
        sinon.stub(relier, 'isOAuth').callsFake(() => true);
        sinon.stub(relier, 'wantsTwoStepAuthentication').callsFake(() => true);

        return view.signIn(account, 'password');
      });

      it('failed', () => {
        assert.isTrue(OAuthErrors.is(err, 'MISMATCH_ACR_VALUES'));
        assert.isTrue(view.unsafeDisplayError.calledWith(err));
        const link =
          'https://support.mozilla.org/kb/secure-firefox-account-two-step-authentication';
        assert.isTrue(
          err.forceMessage.indexOf(link) > 0,
          'contains setup link'
        );

        const args = user.signInAccount.args[0];
        assert.equal(
          args[3].verificationMethod,
          VerificationMethods.TOTP_2FA,
          'correct verification method set'
        );
      });

      it('did not navigate', () => {
        assert.equal(view.navigate.callCount, 0);
      });
    });
  });
});
