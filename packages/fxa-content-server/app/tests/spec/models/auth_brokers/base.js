/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import Account from 'models/account';
import { assert } from 'chai';
import AuthErrors from 'lib/auth-errors';
import BaseAuthenticationBroker from 'models/auth_brokers/base';
import FxaClient from 'lib/fxa-client';
import Metrics from 'lib/metrics';
import Notifier from 'lib/channels/notifier';
import Relier from 'models/reliers/relier';
import SameBrowserVerificationModel from 'models/verification/same-browser';
import sinon from 'sinon';
import VerificationMethods from 'lib/verification-methods';
import VerificationReasons from 'lib/verification-reasons';
import WebChannel from 'lib/channels/web';
import WindowMock from '../../../mocks/window';

describe('models/auth_brokers/base', function() {
  let account;
  let broker;
  let fxaClient;
  let metrics;
  let notifier;
  let notificationChannel;
  let relier;
  let windowMock;

  beforeEach(function() {
    account = new Account({ uid: 'users_uid' });
    fxaClient = new FxaClient();
    metrics = new Metrics();
    notificationChannel = new WebChannel('web_channel');
    sinon
      .stub(notificationChannel, 'isFxaStatusSupported')
      .callsFake(() => false);
    notifier = new Notifier();
    relier = new Relier({ context: 'fx_fennec_v1' });
    windowMock = new WindowMock();

    broker = new BaseAuthenticationBroker({
      fxaClient,
      metrics,
      notificationChannel,
      notifier,
      relier,
      window: windowMock,
    });
  });

  function testDoesNotHalt(behavior) {
    assert.ok(behavior);
    assert.isUndefined(behavior.halt);
    return behavior;
  }

  function testNavigates(expectedEndpoint) {
    return behavior => {
      assert.ok(behavior);
      assert.isTrue(behavior.halt);
      assert.equal(behavior.endpoint, expectedEndpoint);
      return behavior;
    };
  }

  describe('fetch', () => {
    beforeEach(() => {
      sinon.stub(broker, '_fetchFxaStatus').callsFake(() => Promise.resolve());
    });

    describe('fxaStatus not supported', () => {
      it('does not attempt to fetch status from the browser', () => {
        broker.setCapability('fxaStatus', false);

        return broker.fetch().then(() => {
          assert.isFalse(broker._fetchFxaStatus.called);
        });
      });
    });

    describe('fxaStatus is supported', () => {
      it('fetches status from the browser', () => {
        broker.setCapability('fxaStatus', true);

        return broker.fetch().then(() => {
          assert.isTrue(broker._fetchFxaStatus.calledOnce);
        });
      });
    });

    it('if relier has a `signinCode`, it is consumed', () => {
      relier.set('signinCode', 'signin-code');
      sinon
        .stub(broker, '_consumeSigninCode')
        .callsFake(() => Promise.resolve());

      return broker.fetch().then(() => {
        assert.isTrue(broker._consumeSigninCode.calledOnce);
        assert.isTrue(broker._consumeSigninCode.calledWith('signin-code'));
      });
    });
  });

  describe('openPairPreferences', () => {
    beforeEach(() => {
      sinon.spy(notificationChannel, 'send');
    });
    it('calls to desktop to open pair preferences', () => {
      broker.setCapability('supportsPairing', true);
      broker.openPairPreferences();
      assert.isTrue(
        notificationChannel.send.calledOnceWith('fxaccounts:pair_preferences')
      );
    });

    it('is disabled if no capability', () => {
      broker.setCapability('supportsPairing', false);
      broker.openPairPreferences();
      assert.isFalse(
        notificationChannel.send.calledOnceWith('fxaccounts:pair_preferences')
      );
    });
  });

  describe('_fetchFxaStatus', () => {
    describe('success', () => {
      it('sets `browserSignedInAccount, triggers an `fxa_status` message with the response', () => {
        const signedInUser = {
          email: 'testuser@testuser.com',
        };
        const response = {
          engines: ['creditcards'],
          signedInUser,
        };
        sinon
          .stub(notificationChannel, 'request')
          .callsFake(() => Promise.resolve(response));
        sinon.spy(broker, 'trigger');

        return broker._fetchFxaStatus().then(() => {
          assert.deepEqual(broker.get('browserSignedInAccount'), signedInUser);
          assert.isTrue(broker.trigger.calledWith('fxa_status', response));
        });
      });

      it('`fxa_status` reports isPairing for pairing urls', () => {
        windowMock.location.pathname = '/pair';
        sinon
          .stub(broker, '_fetchFxaStatus')
          .callsFake(() => Promise.resolve());
        broker.setCapability('fxaStatus', true);

        return broker.fetch().then(() => {
          assert.isTrue(
            broker._fetchFxaStatus.calledOnceWith({ isPairing: true })
          );
        });
      });

      it('`fxa_status` reports isPairing as `false` for non-pairing urls', () => {
        windowMock.location.pathname = '/force_auth';
        sinon
          .stub(broker, '_fetchFxaStatus')
          .callsFake(() => Promise.resolve());
        broker.setCapability('fxaStatus', true);

        return broker.fetch().then(() => {
          assert.isTrue(
            broker._fetchFxaStatus.calledOnceWith({ isPairing: false })
          );
        });
      });

      it('status message sets pairing capability if available', () => {
        notificationChannel = new WebChannel('web_channel');
        sinon
          .stub(notificationChannel, 'isFxaStatusSupported')
          .callsFake(() => true);

        broker = new BaseAuthenticationBroker({
          fxaClient,
          metrics,
          notificationChannel,
          notifier,
          relier,
          window: windowMock,
        });

        const signedInUser = {
          email: 'testuser@testuser.com',
        };
        const response = {
          capabilities: {
            pairing: true,
          },
          signedInUser,
        };

        sinon
          .stub(notificationChannel, 'request')
          .callsFake(() => Promise.resolve(response));
        sinon.spy(broker, 'trigger');

        assert.isFalse(broker.getCapability('supportsPairing'));
        return broker._fetchFxaStatus().then(() => {
          assert.deepEqual(broker.get('browserSignedInAccount'), signedInUser);
          assert.isTrue(broker.trigger.calledWith('fxa_status', response));
          assert.isTrue(broker.getCapability('supportsPairing'));
        });
      });
    });

    describe('INVALID_WEB_CHANNEL error', () => {
      it('sets the fxaStatus capability to false, drops the error', () => {
        sinon
          .stub(notificationChannel, 'request')
          .callsFake(() =>
            Promise.reject(AuthErrors.toError('INVALID_WEB_CHANNEL'))
          );

        return broker._fetchFxaStatus().then(() => {
          assert.isFalse(broker.getCapability('fxaStatus'));
        });
      });
    });

    describe('other errors', () => {
      it('are propagated', () => {
        sinon
          .stub(notificationChannel, 'request')
          .callsFake(() =>
            Promise.reject(AuthErrors.toError('UNEXPECTED_ERROR'))
          );

        return broker._fetchFxaStatus().then(assert.fail, err => {
          assert.isTrue(AuthErrors.is(err, 'UNEXPECTED_ERROR'));
        });
      });
    });
  });

  describe('afterLoaded', function() {
    it('returns a promise', function() {
      return broker.afterLoaded().then(assert.pass);
    });

    it('is invoked once on the `view-shown` notification', () => {
      sinon.spy(broker, 'afterLoaded');

      notifier.trigger('view-shown');
      notifier.trigger('view-shown');

      assert.isTrue(broker.afterLoaded.calledOnce);
    });
  });

  describe('persistVerificationData', function() {
    let verificationInfo;

    beforeEach(function() {
      return broker.persistVerificationData(account).then(function() {
        verificationInfo = new SameBrowserVerificationModel(
          {},
          {
            namespace: 'context',
            uid: 'users_uid',
          }
        );
        verificationInfo.load();
      });
    });

    it("persist the relier's `context` to localStorage", function() {
      assert.equal(verificationInfo.get('context'), 'fx_fennec_v1');
    });
  });

  describe('unpersistVerificationData', function() {
    let verificationInfo;

    beforeEach(function() {
      return broker
        .persistVerificationData(account)
        .then(function() {
          return broker.unpersistVerificationData(account);
        })
        .then(function() {
          verificationInfo = new SameBrowserVerificationModel(
            {},
            {
              namespace: 'context',
              uid: 'users_uid',
            }
          );
          verificationInfo.load();
        });
    });

    it("delete's the stored `context` from localStorage", function() {
      assert.isFalse(verificationInfo.has('context'));
    });
  });

  describe('afterChangePassword', function() {
    it('returns a promise', function() {
      return broker.afterChangePassword(account).then(testDoesNotHalt);
    });
  });

  describe('afterCompleteResetPassword', function() {
    beforeEach(function() {
      sinon.spy(broker, 'unpersistVerificationData');
    });

    describe('with TOTP enabled', () => {
      it('navigates to signin_totp_code', () => {
        account.set({
          verificationMethod: VerificationMethods.TOTP_2FA,
          verificationReason: VerificationReasons.SIGN_IN,
        });
        return broker.afterCompleteResetPassword(account).then(behavior => {
          assert.isTrue(broker.unpersistVerificationData.calledWith(account));
          assert.equal(behavior.type, 'navigate');
          assert.equal(behavior.endpoint, 'signin_totp_code');
        });
      });
    });

    describe('without TOTP enabled', () => {
      it('returns a NullBehavior', () => {
        return broker.afterCompleteResetPassword(account).then(behavior => {
          assert.isTrue(broker.unpersistVerificationData.calledWith(account));
          assert.equal(behavior.type, 'null');
        });
      });
    });
  });

  describe('afterCompletePrimaryEmail', () => {
    it('unpersists VerificationData, returns the expected behavior', function() {
      sinon.spy(broker, 'unpersistVerificationData');
      return broker.afterCompletePrimaryEmail(account).then(behavior => {
        assert.isTrue(broker.unpersistVerificationData.calledWith(account));
        assert.equal(behavior.type, 'settings');
      });
    });
  });

  describe('afterCompleteSecondaryEmail', function() {
    it('unpersist VerificationData, returns the expected behavior', function() {
      sinon.spy(broker, 'unpersistVerificationData');
      return broker.afterCompleteSecondaryEmail(account).then(behavior => {
        assert.isTrue(broker.unpersistVerificationData.calledWith(account));
        assert.equal(behavior.type, 'settings');
      });
    });
  });

  describe('afterCompleteSignIn', function() {
    it('unpersist VerificationData, returns the expected behavior', function() {
      sinon.spy(broker, 'unpersistVerificationData');
      return broker.afterCompleteSignIn(account).then(behavior => {
        assert.isTrue(broker.unpersistVerificationData.calledWith(account));
        assert.equal(behavior.type, 'navigate');
        assert.equal(behavior.endpoint, 'signin_verified');
      });
    });
  });

  describe('afterCompleteSignUp', function() {
    it('unpersist VerificationData, returns the expected behavior', function() {
      sinon.spy(broker, 'unpersistVerificationData');
      return broker.afterCompleteSignUp(account).then(behavior => {
        assert.isTrue(broker.unpersistVerificationData.calledWith(account));
        assert.equal(behavior.type, 'navigateOrRedirect');
        assert.equal(behavior.endpoint, 'signup_verified');
      });
    });
  });

  describe('afterDeleteAccount', function() {
    it('returns a promise', function() {
      return broker.afterDeleteAccount(account).then(testDoesNotHalt);
    });
  });

  describe('afterResetPasswordConfirmationPoll', function() {
    it('returns a promise', function() {
      return broker
        .afterResetPasswordConfirmationPoll(account)
        .then(testDoesNotHalt);
    });
  });

  describe('afterSignIn', function() {
    it('returns a promise', function() {
      return broker
        .afterSignIn(account)
        .then(testNavigates('signin_confirmed'));
    });
  });

  describe('afterSignInConfirmationPoll', function() {
    it('returns a promise, behavior navigates to signin_confirmed', function() {
      return broker
        .afterSignInConfirmationPoll(account)
        .then(testNavigates('signin_confirmed'));
    });
  });

  describe('afterForceAuth', function() {
    it('returns a promise', function() {
      return broker
        .afterForceAuth(account)
        .then(testNavigates('signin_confirmed'));
    });
  });

  describe('beforeSignIn', function() {
    it('returns a promise', function() {
      return broker.beforeSignIn(account).then(testDoesNotHalt);
    });
  });

  describe('afterSignUp', function() {
    it('delegates to `afterSignUpConfirmationPoll` if account is verified', () => {
      account.set('verified', true);
      sinon
        .stub(broker, 'afterSignUpConfirmationPoll')
        .callsFake(() => Promise.resolve());
      return broker.afterSignUp(account).then(() => {
        assert.isTrue(broker.afterSignUpConfirmationPoll.calledOnce);
        assert.isTrue(broker.afterSignUpConfirmationPoll.calledWith(account));
      });
    });

    it('returns the `afterSignUp` behavior if account is not verified', () => {
      return broker.afterSignUp(account).then(testNavigates('confirm'));
    });
  });

  describe('afterSignUpConfirmationPoll', function() {
    it('returns a promise, behavior navigates to signup_confirmed', function() {
      sinon.spy(broker, 'unpersistVerificationData');
      return broker
        .afterSignUpConfirmationPoll(account)
        .then(testNavigates('signup_confirmed'))
        .then(() => {
          assert.isTrue(
            broker.unpersistVerificationData.calledOnceWith(account)
          );
        });
    });
  });

  describe('beforeSignUpConfirmationPoll', function() {
    it('returns a promise', function() {
      return broker.beforeSignUpConfirmationPoll(account).then(testDoesNotHalt);
    });
  });

  describe('transformLink', function() {
    it('does nothing to the link', function() {
      assert.equal(broker.transformLink('signin'), 'signin');
    });
  });

  describe('isForceAuth', function() {
    it('returns `false` by default', function() {
      assert.isFalse(broker.isForceAuth());
    });

    it('returns `true` if flow began at `/force_auth`', function() {
      windowMock.location.pathname = '/force_auth';
      return broker.fetch().then(function() {
        assert.isTrue(broker.isForceAuth());
      });
    });
  });

  describe('_isPairing', () => {
    it('returns `false` for non-pairing pathname', () => {
      windowMock.location.pathname = '/force_auth';
      assert.isFalse(broker._isPairing());
    });

    it('returns `true` for root pairing path', () => {
      windowMock.location.pathname = '/pair';
      assert.isTrue(broker._isPairing());
    });

    it('returns `true` for root pairing path', () => {
      windowMock.location.pathname = '/pair/auth_allow';
      assert.isTrue(broker._isPairing());
    });
  });

  describe('isAutomatedBrowser', function() {
    it('returns `false` by default', function() {
      assert.isFalse(broker.isAutomatedBrowser());
    });

    it('returns `true` if the URL contains `isAutomatedBrowser=true`', function() {
      windowMock.location.search = '?automatedBrowser=true';
      return broker.fetch().then(function() {
        assert.isTrue(broker.isAutomatedBrowser());
      });
    });
  });

  describe('capabilities', function() {
    describe('hasCapability', function() {
      it('returns `false` by default', function() {
        assert.isFalse(broker.hasCapability('some-capability'));
      });

      it("returns `false` if the capability's value is falsy", function() {
        broker.setCapability('some-capability', false);
        assert.isFalse(broker.hasCapability('some-capability'));

        broker.setCapability('some-capability', undefined);
        assert.isFalse(broker.hasCapability('some-capability'));

        broker.setCapability('some-capability', null);
        assert.isFalse(broker.hasCapability('some-capability'));

        broker.setCapability('some-capability', 0);
        assert.isFalse(broker.hasCapability('some-capability'));
      });

      it('returns `true` if `setCapability` was called with truthy value', function() {
        broker.setCapability('some-capability', { key: 'value' });
        assert.isTrue(broker.hasCapability('some-capability'));

        broker.setCapability('other-capability', true);
        assert.isTrue(broker.hasCapability('other-capability'));

        broker.unsetCapability('other-capability');
        assert.isFalse(broker.hasCapability('other-capability'));
      });

      it('returns `true` for `signup` by default', function() {
        assert.isTrue(broker.hasCapability('signup'));
      });

      it('returns `true` for `handleSignedInNotification` by default', function() {
        assert.isTrue(broker.hasCapability('handleSignedInNotification'));
      });

      it('returns `true` for `emailVerificationMarketingSnippet` by default', function() {
        assert.isTrue(
          broker.hasCapability('emailVerificationMarketingSnippet')
        );
      });
    });

    describe('getCapability', function() {
      it('returns `undefined` by default', function() {
        assert.isUndefined(broker.getCapability('missing-capability'));
      });

      it('returns the capability value if available', function() {
        const capabilityMetadata = { key: 'value' };
        broker.setCapability('some-capability', capabilityMetadata);
        assert.deepEqual(
          broker.getCapability('some-capability'),
          capabilityMetadata
        );

        broker.unsetCapability('some-capability');
        assert.isUndefined(broker.getCapability('some-capability'));
      });
    });
  });

  describe('getBehavior', function() {
    it('gets a behavior, if defined', function() {
      const behavior = broker.getBehavior('beforeSignIn');
      assert.isDefined(behavior);
    });

    it('throws if behavior is not defined', function() {
      assert.throws(function() {
        broker.getBehavior('NOT_SET');
      }, 'behavior not found for: NOT_SET');
    });
  });

  describe('setBehavior', function() {
    it('sets a behavior', function() {
      broker.setBehavior('new behavior', { halt: true });
      assert.isTrue(broker.getBehavior('new behavior').halt);
    });
  });

  describe('_consumeSigninCode', () => {
    beforeEach(() => {
      sinon.stub(metrics, '_initializeFlowModel').callsFake(() => {});
    });

    it('delegates to the user, clears signinCode when complete', () => {
      sinon.stub(fxaClient, 'consumeSigninCode').callsFake(() => {
        return Promise.resolve({ email: 'signed-in-email@testuser.com' });
      });

      return broker._consumeSigninCode('signin-code').then(() => {
        assert.isTrue(fxaClient.consumeSigninCode.calledOnce);
        assert.isTrue(fxaClient.consumeSigninCode.calledWith('signin-code'));

        assert.deepEqual(broker.get('signinCodeAccount'), {
          email: 'signed-in-email@testuser.com',
        });
      });
    });

    it('logs and ignores errors, clears signinCode when complete', () => {
      const err = AuthErrors.toError('INVALID_SIGNIN_CODE');
      sinon.stub(fxaClient, 'consumeSigninCode').callsFake(() => {
        return Promise.reject(err);
      });
      sinon.spy(metrics, 'logError');

      return broker._consumeSigninCode('signin-code').then(() => {
        assert.isFalse(broker.has('signinCodeAccount'));

        assert.isTrue(metrics.logError.calledOnce);
        assert.isTrue(metrics.logError.calledWith(err));
      });
    });
  });
});
