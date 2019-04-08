/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import Account from 'models/account';
import { assert } from 'chai';
import AuthErrors from 'lib/auth-errors';
import Constants from 'lib/constants';
import OAuthErrors from 'lib/oauth-errors';
import RedirectAuthenticationBroker from 'models/auth_brokers/oauth-redirect';
import Relier from 'models/reliers/base';
import Session from 'lib/session';
import sinon from 'sinon';
import User from 'models/user';
import VerificationMethods from 'lib/verification-methods';
import VerificationReasons from 'lib/verification-reasons';
import WindowMock from '../../../mocks/window';

var REDIRECT_TO = 'https://redirect.here';


var HEX_CHARSET = '0123456789abcdef';
function generateOAuthCode() {
  var code = '';

  for (var i = 0; i < 64; ++i) {
    code += HEX_CHARSET.charAt(Math.floor(Math.random() * 16));
  }

  return code;
}

const REDIRECT_URI = 'https://127.0.0.1:8080';
const VALID_OAUTH_CODE = generateOAuthCode();
const VALID_OAUTH_CODE_REDIRECT_URL = `${REDIRECT_URI}?code=${VALID_OAUTH_CODE}&state=state`;

describe('models/auth_brokers/oauth-redirect', () => {
  var account;
  var broker;
  var metrics;
  var relier;
  var user;
  var windowMock;

  beforeEach(() => {
    metrics = {
      flush: sinon.spy(() => Promise.resolve()),
      logEvent: () => {}
    };
    relier = new Relier();
    relier.set({
      action: 'action',
      clientId: 'clientId',
      redirectUri: REDIRECT_URI,
      scope: 'scope',
      state: 'state'
    });
    user = new User();

    windowMock = new WindowMock();

    account = user.initAccount({
      sessionToken: 'abc123'
    });
    sinon.stub(account, 'createOAuthCode').callsFake(() => {
      return Promise.resolve({
        code: VALID_OAUTH_CODE,
        redirect: VALID_OAUTH_CODE_REDIRECT_URL,
        state: 'state'
      });
    });

    broker = new RedirectAuthenticationBroker({
      metrics: metrics,
      relier: relier,
      session: Session,
      window: windowMock
    });
    broker.DELAY_BROKER_RESPONSE_MS = 0;

    sinon.spy(broker, 'finishOAuthFlow');
  });

  it('has the expected capabilities', () => {
    assert.isTrue(broker.hasCapability('signup'));
    assert.isTrue(broker.hasCapability('reuseExistingSession'));
    assert.isFalse(broker.hasCapability('handleSignedInNotification'));
    assert.isTrue(broker.hasCapability('emailVerificationMarketingSnippet'));
  });

  describe('afterSignInConfirmationPoll', () => {
    it('calls sendOAuthResultToRelier with the correct options', () => {
      sinon.stub(broker, 'sendOAuthResultToRelier').callsFake(() => {
        return Promise.resolve();
      });

      return broker.afterSignInConfirmationPoll(account)
        .then((behavior) => {
          assert.isTrue(broker.finishOAuthFlow.calledWith(account, {
            action: Constants.OAUTH_ACTION_SIGNIN
          }));
          assert.isTrue(broker.sendOAuthResultToRelier.calledWith({
            action: Constants.OAUTH_ACTION_SIGNIN,
            code: VALID_OAUTH_CODE,
            redirect: VALID_OAUTH_CODE_REDIRECT_URL,
            state: 'state'
          }));
          // The Hello window will close the screen, no need to transition
          assert.isTrue(behavior.halt);
        });
    });

    it('returns any errors returned by getOAuthResult', () => {
      sinon.stub(broker, 'getOAuthResult').callsFake(() => {
        return Promise.reject(new Error('uh oh'));
      });

      return broker.afterSignInConfirmationPoll(account)
        .then(assert.fail, (err) => {
          assert.equal(err.message, 'uh oh');
        });
    });
  });

  describe('afterSignIn', function () {
    it('calls sendOAuthResultToRelier with the correct options', function () {
      sinon.stub(broker, 'sendOAuthResultToRelier').callsFake(function () {
        return Promise.resolve();
      });

      return broker.afterSignIn(account)
        .then(function () {
          assert.isTrue(broker.finishOAuthFlow.calledWith(account, {
            action: Constants.OAUTH_ACTION_SIGNIN
          }));
          assert.isTrue(broker.sendOAuthResultToRelier.calledWith({
            action: Constants.OAUTH_ACTION_SIGNIN,
            code: VALID_OAUTH_CODE,
            redirect: VALID_OAUTH_CODE_REDIRECT_URL,
            state: 'state'
          }));
        });
    });

    it('returns any errors returned by getOAuthResult', function () {
      sinon.stub(broker, 'getOAuthResult').callsFake(function () {
        return Promise.reject(new Error('uh oh'));
      });

      return broker.afterSignIn(account)
        .then(assert.fail, function (err) {
          assert.equal(err.message, 'uh oh');
        });
    });
  });

  describe('afterSignUpConfirmationPoll', function () {
    describe('relier requires TOTP', () => {
      beforeEach(() => {
        sinon.stub(relier, 'wantsTwoStepAuthentication').callsFake(() => {
          return true;
        });
        sinon.spy(broker, 'getBehavior');
        return broker.afterSignUpConfirmationPoll(account);
      });

      it('calls afterSignUpRequireTOTP', () => {
        assert.equal(broker.getBehavior.callCount, 1);
        assert.equal(broker.getBehavior.args[0][0], 'afterSignUpRequireTOTP');
      });
    });

    it('calls sendOAuthResultToRelier with the correct options', function () {
      sinon.stub(broker, 'sendOAuthResultToRelier').callsFake(function () {
        return Promise.resolve();
      });

      return broker.afterSignUpConfirmationPoll(account)
        .then(function () {
          assert.isTrue(broker.finishOAuthFlow.calledWith(account, {
            action: Constants.OAUTH_ACTION_SIGNUP
          }));
          assert.isTrue(broker.sendOAuthResultToRelier.calledWith({
            action: Constants.OAUTH_ACTION_SIGNUP,
            code: VALID_OAUTH_CODE,
            redirect: VALID_OAUTH_CODE_REDIRECT_URL,
            state: 'state'
          }));
        });
    });
  });

  describe('afterResetPasswordConfirmationPoll', function () {
    describe('with a verified account', () => {
      it('calls sendOAuthResultToRelier with the expected options', function () {
        account.set('verified', true);
        sinon.stub(broker, 'sendOAuthResultToRelier').callsFake(() => Promise.resolve());

        return broker.afterResetPasswordConfirmationPoll(account)
          .then(() => {
            assert.isTrue(broker.finishOAuthFlow.calledWith(account, {
              action: Constants.OAUTH_ACTION_SIGNIN
            }));
            assert.isTrue(broker.sendOAuthResultToRelier.calledWith({
              action: Constants.OAUTH_ACTION_SIGNIN,
              code: VALID_OAUTH_CODE,
              redirect: VALID_OAUTH_CODE_REDIRECT_URL,
              state: 'state'
            }));
          });
      });
    });

    describe('with an unverified session that requires TOTP', () => {
      it('asks the user to enter a TOTP code', () => {
        account.set({
          verificationMethod: VerificationMethods.TOTP_2FA,
          verificationReason: VerificationReasons.SIGN_IN,
          verified: false
        });

        return broker.afterResetPasswordConfirmationPoll(account)
          .then((behavior) => {
            assert.isFalse(broker.finishOAuthFlow.called);
            assert.equal(behavior.type, 'navigate');
            assert.equal(behavior.endpoint, 'signin_totp_code');
          });
      });

      it('ignores account `verified` if verification method and reason set', function () {
        account.set({
          verificationMethod: VerificationMethods.TOTP_2FA,
          verificationReason: VerificationReasons.SIGN_IN,
          verified: true
        });

        return broker.afterResetPasswordConfirmationPoll(account)
          .then((behavior) => {
            assert.isFalse(broker.finishOAuthFlow.called);
            assert.equal(behavior.type, 'navigate');
            assert.equal(behavior.endpoint, 'signin_totp_code');
          });
      });
    });
  });

  describe('sendOAuthResultToRelier', () => {
    describe('with no error', () => {
      it('prepares window to be closed', () => {
        return broker.sendOAuthResultToRelier({
          redirect: REDIRECT_TO
        }).then(() => {
          assert.isTrue(metrics.flush.calledOnce);
          assert.lengthOf(metrics.flush.getCall(0).args, 0);
          assert.equal(windowMock.location.href, REDIRECT_TO);
        });
      });
    });

    describe('with an error', () => {
      it('appends an error query parameter', () => {
        return broker.sendOAuthResultToRelier({
          error: 'error',
          redirect: REDIRECT_TO
        }).then(() => {
          assert.isTrue(metrics.flush.calledOnce);
          assert.lengthOf(metrics.flush.getCall(0).args, 0);
          assert.include(windowMock.location.href, REDIRECT_TO);
          assert.include(windowMock.location.href, 'error=error');
        });
      });
    });

    describe('with an action', () => {
      it('appends an action query parameter', () => {
        var action = Constants.OAUTH_ACTION_SIGNIN;
        return broker.sendOAuthResultToRelier({
          action: action,
          redirect: REDIRECT_TO
        }).then(() => {
          assert.isTrue(metrics.flush.calledOnce);
          assert.lengthOf(metrics.flush.getCall(0).args, 0);
          assert.include(windowMock.location.href, REDIRECT_TO);
          assert.include(windowMock.location.href, 'action=' + action);
        });
      });
    });

    describe('with existing query parameters', () => {
      it('passes through existing parameters unchanged', () => {
        return broker.sendOAuthResultToRelier({
          error: 'error',
          redirect: REDIRECT_TO + '?test=param'
        }).then(() => {
          assert.isTrue(metrics.flush.calledOnce);
          assert.lengthOf(metrics.flush.getCall(0).args, 0);
          assert.include(windowMock.location.href, REDIRECT_TO);
          assert.include(windowMock.location.href, 'test=param');
          assert.include(windowMock.location.href, 'error=error');
        });
      });
    });
  });

  describe('persistVerificationData', () => {
    it('sets the Original Tab marker and saves OAuth params to session', () => {
      return broker.persistVerificationData(account)
        .then(function () {
          assert.ok(!! Session.oauth);
          assert.isTrue(broker.isOriginalTab());
        });
    });

    it('persists PKCE params for same tab verification', () => {
      const CODE_CHALLENGE = 'E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM';
      const CODE_CHALLENGE_METHOD = 'S256';

      relier.set({
        action: 'action',
        clientId: 'clientId',
        codeChallenge: CODE_CHALLENGE,
        codeChallengeMethod: CODE_CHALLENGE_METHOD,
        redirectUri: REDIRECT_URI,
        scope: 'scope',
        state: 'state'
      });

      broker = new RedirectAuthenticationBroker({
        metrics: metrics,
        relier: relier,
        session: Session,
        window: windowMock
      });

      return broker.persistVerificationData(account)
        .then(() => {
          assert.equal(Session.oauth.code_challenge, CODE_CHALLENGE);
          assert.equal(Session.oauth.code_challenge_method, CODE_CHALLENGE_METHOD);
          assert.isTrue(broker.isOriginalTab());
        });
    });
  });

  describe('getOAuthResult', () => {
    it('gets an object with the OAuth login information', () => {
      relier.set({
        accessType: 'offline',
        acrValues: 'foo',
        codeChallenge: 'bar',
        codeChallengeMethod: 'baz',
        scope: 'wibble',
        state: 'wobble',
      });
      sinon.stub(relier, 'wantsKeys').callsFake(() => true);
      sinon.stub(broker, '_provisionScopedKeys').callsFake(() => Promise.resolve('glub'));

      return broker.getOAuthResult(account)
        .then((result) => {
          assert.isTrue(relier.wantsKeys.calledOnce);
          assert.isTrue(broker._provisionScopedKeys.calledOnceWith(account));

          /* eslint-disable camelcase */
          assert.isTrue(account.createOAuthCode.calledOnceWith('clientId', 'wobble', {
            access_type: 'offline',
            acr_values: 'foo',
            code_challenge: 'bar',
            code_challenge_method: 'baz',
            keys_jwe: 'glub',
            scope: 'wibble'
          }));
          /* eslint-enable camelcase */

          assert.equal(result.redirect, VALID_OAUTH_CODE_REDIRECT_URL);
          assert.equal(result.state, 'state');
          assert.equal(result.code, VALID_OAUTH_CODE);
        });
    });

    it('locally constructs the redirect URI, ignoring any provided by the server', function () {
      account.createOAuthCode.restore();
      sinon.stub(account, 'createOAuthCode').callsFake(function () {
        return Promise.resolve({
          code: VALID_OAUTH_CODE,
          redirect: 'https://the.server.got.confused',
          state: 'state'
        });
      });
      return broker.getOAuthResult(account)
        .then(function (result) {
          assert.isTrue(account.createOAuthCode.calledOnce);
          assert.equal(result.redirect, VALID_OAUTH_CODE_REDIRECT_URL);
          assert.equal(result.state, 'state');
          assert.equal(result.code, VALID_OAUTH_CODE);
        });
    });

    it('passes on errors from account.createOAuthCode', function () {
      account.createOAuthCode.restore();
      sinon.stub(account, 'createOAuthCode').callsFake(function () {
        return Promise.reject(new Error('uh oh'));
      });

      return broker.getOAuthResult(account)
        .then(assert.fail, function (err) {
          assert.equal(err.message, 'uh oh');
        });
    });

    it('throws an error if account.createOAuthCode returns nothing', function () {
      account.createOAuthCode.restore();
      sinon.stub(account, 'createOAuthCode').callsFake(function () {
        return;
      });

      return broker.getOAuthResult(account)
        .then(assert.fail, function (err) {
          assert.isTrue(OAuthErrors.is(err, 'INVALID_RESULT'));
        });
    });

    it('throws an error if account.createOAuthCode returns an empty object', function () {
      account.createOAuthCode.restore();
      sinon.stub(account, 'createOAuthCode').callsFake(function () {
        return {};
      });

      return broker.getOAuthResult(account)
        .then(assert.fail, function (err) {
          assert.isTrue(OAuthErrors.is(err, 'MISSING_PARAMETER'));
        });
    });

    it('throws an error if account.createOAuthCode returns an invalid code', function () {
      account.createOAuthCode.restore();
      sinon.stub(account, 'createOAuthCode').callsFake(function () {
        return {
          code: 'invalid-code'
        };
      });

      return broker.getOAuthResult(account)
        .then(assert.fail, function (err) {
          assert.isTrue(OAuthErrors.is(err, 'INVALID_PARAMETER'));
        });
    });

    it('throws an error if account.createOAuthCode returns an invalid state', function () {
      account.createOAuthCode.restore();
      sinon.stub(account, 'createOAuthCode').callsFake(function () {
        return {
          code: VALID_OAUTH_CODE,
          state: { invalid: 'state' }
        };
      });

      return broker.getOAuthResult(account)
        .then(assert.fail, function (err) {
          assert.isTrue(OAuthErrors.is(err, 'INVALID_PARAMETER'));
        });
    });

    it('throws an error if accountData is missing', function () {
      return broker.getOAuthResult()
        .then(assert.fail, function (err) {
          assert.isTrue(AuthErrors.is(err, 'INVALID_TOKEN'));
        });
    });

    it('throws an error if accountData is missing a sessionToken', function () {
      return broker.getOAuthResult(user.initAccount())
        .then(assert.fail, function (err) {
          assert.isTrue(AuthErrors.is(err, 'INVALID_TOKEN'));
        });
    });
  });

  describe('transformLink', () => {
    [
      'force_auth',
      'signin',
      'signup',
    ].forEach(route => {
      describe(`${route}`, () => {
        it('prepends `/oauth` to the link', () => {
          assert.include(broker.transformLink(`/${route}`), `/oauth/${route}`);
          assert.include(broker.transformLink(`${route}`), `/oauth/${route}`);
        });
      });
    });

    describe('/', () => {
      it('prepends `/oauth` to the link', () => {
        assert.include(broker.transformLink('/'), '/oauth/');
      });
    });

    describe('not transformed', () => {
      it('does not include the oauth prefix', () => {
        const transformed = broker.transformLink('not_oauth');
        assert.notInclude(transformed, 'oauth/not_oauth');
        assert.include(transformed, 'not_oauth');
      });
    });
  });

  describe('_provisionScopedKeys', () => {
    let accountKey;
    const keysJwk = 'jwk';
    const keys = {
      kA: 'foo',
      kB: 'bar'
    };
    const scope = 'https://identity.mozilla.com/apps/sample-scope-can-scope-key';
    const keyData = {
      [scope]: {
        identifier: scope,
        keyRotationSecret: '0000000000000000000000000000000000000000000000000000000000000000',
        keyRotationTimestamp: 1506970363512
      }
    };

    beforeEach(() => {
      relier.set('keysJwk', keysJwk);

      accountKey = new Account({
        email: 'testuser@testuser.com',
        keyFetchToken: 'key-fetch-token',
        uid: 'uid',
        unwrapBKey: 'unwrap-b-key'
      });
      sinon.stub(accountKey, 'getOAuthScopedKeyData').callsFake((clientId, scope) => {
        assert.equal(clientId, 'clientId');
        assert.equal(scope, 'scope');

        return Promise.resolve(keyData);
      });

      sinon.stub(accountKey, 'accountKeys').callsFake((args) => {
        return Promise.resolve(keys);
      });
    });

    it('calls _provisionScopedKeys to encrypt the bundle', () => {
      relier.set('keysJwk', keysJwk);

      sinon.stub(broker._scopedKeys, 'createEncryptedBundle').callsFake((_keys, _uid, _keyData, _jwk) => {
        assert.equal(_keys, keys);
        assert.equal(_uid, 'uid');
        assert.equal(_keyData, keyData);
        assert.equal(_jwk, keysJwk);

        return Promise.resolve('bundle');
      });

      return broker._provisionScopedKeys(accountKey)
        .then((result) => {
          assert.isTrue(broker._scopedKeys.createEncryptedBundle.calledOnce);
          assert.equal(result, 'bundle');
        });
    });

    it('returns null if no unwrapBKey', () => {
      accountKey.set('unwrapBKey', null);

      return broker._provisionScopedKeys(accountKey)
        .then((result) => {
          assert.equal(result, null);
        });
    });

    it('returns null if no clientKeyData', () => {
      accountKey.getOAuthScopedKeyData.restore();
      sinon.stub(accountKey, 'getOAuthScopedKeyData').callsFake((args) => {
        return Promise.resolve({});
      });

      return broker._provisionScopedKeys(accountKey, 'assertion')
        .then((result) => {
          assert.equal(result, null);
        });
    });

  });

  describe('finishOAuthFlow', () => {
    it('clears the original tab marker', () => {
      broker.finishOAuthFlow.restore();

      sinon.stub(broker, 'getOAuthResult').callsFake(() => {
        return Promise.resolve({});
      });

      sinon.stub(broker, 'sendOAuthResultToRelier').callsFake(() => {
        return Promise.resolve();
      });

      return broker.persistVerificationData(account)
        .then(() => {
          return broker.finishOAuthFlow(account);
        })
        .then(() => {
          assert.isTrue(broker.getOAuthResult.calledWith(account));
          assert.isFalse(broker.isOriginalTab());
        });
    });
  });

  describe('afterCompleteSignUp', () => {
    it('finishes the oauth flow if the user verifies in the original tab', () => {
      return broker.persistVerificationData(account)
        .then(() => {
          return broker.afterCompleteSignUp(account);
        })
        .then(() => {
          assert.isTrue(broker.finishOAuthFlow.calledWith(account, {
            action: Constants.OAUTH_ACTION_SIGNUP
          }));
        });
    });

    it('does not finish the oauth flow if the user verifies in another tab', () => {
      return broker.afterCompleteSignUp(account)
        .then(() => {
          assert.isFalse(broker.finishOAuthFlow.calledWith(account));
        });
    });
  });

  describe('afterCompleteResetPassword', () => {
    it('verified sessions finishes the oauth flow if the user verifies in the original tab', () => {
      account.set('verified', true);
      return broker.persistVerificationData(account)
        .then(() => {
          return broker.afterCompleteResetPassword(account);
        })
        .then(() => {
          assert.isTrue(broker.finishOAuthFlow.calledOnceWith(account, {
            action: Constants.OAUTH_ACTION_SIGNIN
          }));
        });
    });

    it('unverified sessions ask the user to enter a TOTP code if the user verifies in the original tab', () => {
      account.set({
        verificationMethod: VerificationMethods.TOTP_2FA,
        verificationReason: VerificationReasons.SIGN_IN,
        verified: false
      });

      return broker.persistVerificationData(account)
        .then(() => {
          return broker.afterCompleteResetPassword(account);
        })
        .then((behavior) => {
          assert.isFalse(broker.finishOAuthFlow.called);
          assert.equal(behavior.type, 'navigate');
          assert.equal(behavior.endpoint, 'signin_totp_code');
        });
    });

    it('unverified sessions ask the user to enter a TOTP code if the user verifies in different tab', () => {
      account.set({
        verificationMethod: VerificationMethods.TOTP_2FA,
        verificationReason: VerificationReasons.SIGN_IN,
        verified: false
      });
      // whenever the user verifies in a different tab, the relier has no state but we have defined the state of relier.
      relier.unset('state');

      return broker.afterCompleteResetPassword(account)
        .then((behavior) => {
          assert.isFalse(broker.finishOAuthFlow.called);
          assert.equal(behavior.type, 'null');
        });
    });

    it('ignores account `verified` if verification method and reason set', () => {
      account.set({
        verificationMethod: VerificationMethods.TOTP_2FA,
        verificationReason: VerificationReasons.SIGN_IN,
        verified: true
      });
      relier.unset('state');

      return broker.afterCompleteResetPassword(account)
        .then((behavior) => {
          assert.isFalse(broker.finishOAuthFlow.called);
          assert.equal(behavior.type, 'null');
        });
    });

    it('does not finish the oauth flow if the user verifies in another tab', () => {
      return broker.afterCompleteResetPassword(account)
        .then(() => {
          assert.isFalse(broker.finishOAuthFlow.calledWith(account));
        });
    });
  });
});
