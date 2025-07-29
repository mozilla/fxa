/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import Account from 'models/account';
import { assert } from 'chai';
import Broker from 'models/auth_brokers/base';
import GleanMetrics from '../../../../scripts/lib/glean';
import { Model } from 'backbone';
import Relier from 'models/reliers/relier';
import SignUpMixin from 'views/mixins/signup-mixin';
import sinon from 'sinon';

describe('views/mixins/signup-mixin', function () {
  it('exports correct interface', function () {
    assert.isObject(SignUpMixin);
    assert.lengthOf(Object.keys(SignUpMixin), 5);
    assert.isFunction(SignUpMixin.signUp);
    assert.isFunction(SignUpMixin.onSignUpSuccess);
    assert.isArray(SignUpMixin.dependsOn);
  });

  describe('signUp', function () {
    let account;
    let broker;
    let relier;
    let user;
    let view;
    let regSubmitMetricEventStub, regSuccessMetricEventStub;

    beforeEach(function () {
      account = new Account({
        email: 'testuser@testuser.com',
      });

      broker = new Broker();
      regSubmitMetricEventStub = sinon.stub(
        GleanMetrics.registration,
        'submit'
      );
      regSuccessMetricEventStub = sinon.stub(
        GleanMetrics.registration,
        'submitSuccess'
      );
      relier = new Relier();
      user = {
        signUpAccount: sinon.spy((account) => Promise.resolve(account)),
      };

      view = {
        broker,
        formPrefill: {
          clear: sinon.spy(),
        },
        getStringifiedResumeToken: sinon.spy(() => 'resume token'),
        invokeBrokerMethod: sinon.spy(function () {
          return Promise.resolve();
        }),
        logEvent: sinon.spy(),
        logEventOnce: sinon.spy(),
        logFlowEvent: sinon.spy(),
        logViewEvent: sinon.spy(),
        navigate: sinon.spy(),
        notifier: {
          trigger: sinon.spy(),
        },
        getSignupCodeExperimentGroup: sinon.spy(),
        onSignUpSuccess: SignUpMixin.onSignUpSuccess,
        clearInput: sinon.spy(),
        relier,
        signUp: SignUpMixin.signUp,
        user,
      };
    });

    afterEach(function () {
      regSubmitMetricEventStub.restore();
      regSuccessMetricEventStub.restore();
    });

    describe('account needs permissions', function () {
      beforeEach(function () {
        sinon.stub(relier, 'accountNeedsPermissions').callsFake(function () {
          return true;
        });

        return view.signUp(account, 'password');
      });

      it('triggers an account.created on the notifier', () => {
        assert.isTrue(view.notifier.trigger.calledOnceWith('account.created'));
      });

      it('emits a Glean event', () => {
        sinon.assert.calledOnce(regSubmitMetricEventStub);
      });

      it('calls user.signUpAccount correctly', () => {
        assert.isTrue(user.signUpAccount.calledOnce);
        assert.isTrue(
          user.signUpAccount.calledWith(account, 'password', relier, {
            resume: 'resume token',
            verificationMethod: 'email-otp',
          })
        );

        assert.isTrue(view.getStringifiedResumeToken.calledOnce);
        assert.isTrue(view.getStringifiedResumeToken.calledWith(account));
      });

      it('redirects to the `signup_permissions` screen', function () {
        assert.isTrue(view.navigate.calledOnce);

        var args = view.navigate.args[0];
        assert.equal(args[0], 'signup_permissions');
        assert.deepEqual(args[1].account, account);
        assert.isFunction(args[1].onSubmitComplete);
      });

      it('does not log any events', function () {
        assert.isFalse(view.logViewEvent.called);
      });
    });

    describe('choose what to sync displayed when entering the password', () => {
      beforeEach(function () {
        broker.set('chooseWhatToSyncWebV1Engines', new Model());
        sinon.stub(view, 'onSignUpSuccess').callsFake(() => Promise.resolve());
        // use a direct assignment rather than a stub because
        // isCWTSOnSignupPasswordEnabled is not on the view by default.
        view.isCWTSOnSignupPasswordEnabled = sinon.spy(() => true);

        return view.signUp(account, 'password');
      });

      it('does not navigate, calls view.onSignUpSuccess correctly', () => {
        assert.isFalse(view.navigate.called);
        assert.isTrue(view.onSignUpSuccess.calledOnceWith(account));
      });
    });

    describe('choose what to sync not displayed when entering password', function () {
      beforeEach(function () {
        broker.set('chooseWhatToSyncWebV1Engines', new Model());
        broker.setCapability('syncOptional', true);

        return view.signUp(account, 'password');
      });

      it('calls user.signUpAccount correctly', () => {
        assert.isTrue(user.signUpAccount.calledOnce);
        assert.isTrue(
          user.signUpAccount.calledWith(account, 'password', relier, {
            resume: 'resume token',
            verificationMethod: 'email-otp',
          })
        );

        assert.isTrue(view.getStringifiedResumeToken.calledOnce);
        assert.isTrue(view.getStringifiedResumeToken.calledWith(account));
      });

      it('redirects to the `choose_what_to_sync` screen', function () {
        assert.isTrue(view.navigate.calledOnce);

        var args = view.navigate.args[0];
        assert.equal(args[0], 'choose_what_to_sync');
        assert.deepEqual(args[1].account, account);
        assert.isTrue(args[1].allowToDisableSync);
        assert.isFunction(args[1].onSubmitComplete);
      });

      it('does not log any events', function () {
        assert.isFalse(view.logViewEvent.called);
      });
    });

    describe('everyone else', function () {
      beforeEach(function () {
        account.set('verified', false);
        sinon.stub(view, 'onSignUpSuccess').callsFake(() => Promise.resolve());

        return view.signUp(account, 'password');
      });

      it('calls user.signUpAccount correctly', () => {
        assert.isTrue(user.signUpAccount.calledOnce);
        assert.isTrue(
          user.signUpAccount.calledWith(account, 'password', relier, {
            resume: 'resume token',
            verificationMethod: 'email-otp',
          })
        );

        assert.isTrue(view.getStringifiedResumeToken.calledOnce);
        assert.isTrue(view.getStringifiedResumeToken.calledWith(account));
      });

      it('calls view.formPrefill.clear correctly', function () {
        assert.equal(view.formPrefill.clear.callCount, 1);
        assert.lengthOf(view.formPrefill.clear.args[0], 0);
      });

      it('calls view.invokeBrokerMethod correctly', function () {
        assert.equal(view.invokeBrokerMethod.callCount, 1);

        var args = view.invokeBrokerMethod.args[0];
        assert.lengthOf(args, 2);
        assert.equal(args[0], 'beforeSignIn');
        assert.equal(args[1], account);
      });

      it('calls view.onSignUpSuccess correctly', () => {
        assert.isTrue(view.onSignUpSuccess.calledOnce);
        assert.isTrue(view.onSignUpSuccess.calledWith(account));
      });
    });

    describe('user under 18', function () {
      beforeEach(function () {
        account.set('verified', false);
        sinon.stub(view, 'onSignUpSuccess').callsFake(() => Promise.resolve());

        return view.signUp(account, 'password');
      });

      it('calls user.signUpAccount correctly', () => {
        assert.isTrue(user.signUpAccount.calledOnce);
        assert.isTrue(
          user.signUpAccount.calledWith(account, 'password', relier, {
            resume: 'resume token',
            verificationMethod: 'email-otp',
          })
        );
      });

      it('calls view.onSignUpSuccess correctly', () => {
        assert.isTrue(view.onSignUpSuccess.calledOnce);
        assert.isTrue(view.onSignUpSuccess.calledWith(account));
      });
    });

    describe('user at least 18', function () {
      beforeEach(function () {
        account.set('verified', false);
        sinon.stub(view, 'onSignUpSuccess').callsFake(() => Promise.resolve());

        return view.signUp(account, 'password');
      });

      it('calls user.signUpAccount correctly', () => {
        assert.isTrue(user.signUpAccount.calledOnce);
        assert.isTrue(
          user.signUpAccount.calledWith(account, 'password', relier, {
            resume: 'resume token',
            verificationMethod: 'email-otp',
          })
        );
      });

      it('calls view.onSignUpSuccess correctly', () => {
        assert.isTrue(view.onSignUpSuccess.calledOnce);
        assert.isTrue(view.onSignUpSuccess.calledWith(account));
      });
    });

    describe('formPrefill undefined', function () {
      beforeEach(function () {
        view.formPrefill = undefined;
      });

      it('does not throw', function () {
        assert.doesNotThrow(function () {
          return view.signUp(account);
        });
      });
    });

    describe('onSignUpSuccess', () => {
      it('logs and calls view.invokeBrokerMethod correctly', () => {
        assert.isUndefined(view.onSignUpSuccess(account));

        assert.equal(view.logViewEvent.callCount, 2);
        assert.isTrue(view.logViewEvent.calledWith('success'));
        assert.isTrue(view.logViewEvent.calledWith('signup.success'));
        sinon.assert.calledOnce(regSuccessMetricEventStub);

        assert.isTrue(view.invokeBrokerMethod.calledOnce);
        const args = view.invokeBrokerMethod.args[0];
        assert.lengthOf(args, 2);
        assert.equal(args[0], 'afterSignUp');
        assert.deepEqual(args[1], account);
      });
    });

    describe('onSignUpSuccess w/ signupCode `treatment` experiment', () => {
      beforeEach(() => {
        account.set('verificationMethod', 'email-otp');
        return view.signUp(account);
      });

      it('navigates to `confirm_signup_code`', () => {
        assert.equal(view.clearInput.callCount, 1);
        assert.equal(view.navigate.callCount, 1);
        const args = view.navigate.args[0];
        assert.lengthOf(args, 2);
        assert.equal(args[0], '/confirm_signup_code');
      });
    });
  });
});
