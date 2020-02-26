/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import $ from 'jquery';
import AuthErrors from 'lib/auth-errors';
import chai from 'chai';
import FxaClient from 'fxaClient';
import FxaClientWrapper from 'lib/fxa-client';
import OAuthRelier from 'models/reliers/oauth';
import RecoveryKey from 'lib/crypto/recovery-keys';
import ResumeToken from 'models/resume-token';
import sinon from 'sinon';
import SignInReasons from 'lib/sign-in-reasons';
import testHelpers from '../../lib/helpers';
import VerificationMethods from 'lib/verification-methods';
import VerificationReasons from 'lib/verification-reasons';

var AUTH_SERVER_URL = 'http://127.0.0.1:9000';
var NON_SYNC_SERVICE = 'chronicle';
var REDIRECT_TO = 'https://sync.firefox.com';
var STATE = 'state';
var SYNC_SERVICE = 'sync';

var assert = chai.assert;
var client;
var email;
var password = 'password';
var realClient;
var relier;
var resumeToken;

function trim(str) {
  return $.trim(str);
}

describe('lib/fxa-client', function() {
  beforeEach(function() {
    email = ' ' + testHelpers.createEmail() + ' ';
    relier = new OAuthRelier();
    relier.set({
      redirectTo: REDIRECT_TO,
      service: SYNC_SERVICE,
      state: STATE,
    });

    resumeToken = ResumeToken.stringify({
      state: STATE,
    });

    realClient = new FxaClient(AUTH_SERVER_URL);

    client = new FxaClientWrapper({
      client: realClient,
    });
  });

  it('initializes client from authServerUrl', function() {
    client = new FxaClientWrapper({
      authServerUrl: AUTH_SERVER_URL,
    });
  });

  describe('errors', function() {
    describe('realClient client returns a promise', function() {
      it('are normalized to be AuthErrors based', function() {
        // taken from the fxa-auth-server @
        // https://github.com/mozilla/fxa-auth-server/blob/9dcdcd9b142a2ed93fc55ac187a501a7a2005c6b/lib/error.js#L290-L308
        sinon.stub(realClient, 'signUp').callsFake(function() {
          return Promise.reject({
            code: 429,
            errno: 114,
            error: 'Too Many Requests',
            message: 'Client has sent too many requests',
            retryAfter: 30,
          });
        });

        return client.signUp(email, password, relier).catch(function(err) {
          assert.equal(err.message, AuthErrors.toMessage(114));
          assert.equal(err.namespace, AuthErrors.NAMESPACE);
          assert.equal(err.code, 429);
          assert.equal(err.errno, 114);
          assert.equal(err.retryAfter, 30);
          realClient.signUp.restore();
        });
      });
    });

    describe('realClient does not return a promise', function() {
      it('does not normalize', function() {
        sinon.stub(realClient, 'signUp').callsFake(function() {
          return true;
        });

        return client._getClient().then(function(wrappedClient) {
          assert.isTrue(wrappedClient.signUp(email, password, relier));
        });
      });
    });
  });

  describe('signUp', function() {
    it('Sync signUp signs up a user with email/password and returns keys', function() {
      sinon.stub(realClient, 'signUp').callsFake(function() {
        return Promise.resolve({
          keyFetchToken: 'keyFetchToken',
          unwrapBKey: 'unwrapBKey',
        });
      });

      sinon.stub(relier, 'wantsKeys').callsFake(function() {
        return true;
      });

      sinon.stub(relier, 'isSync').callsFake(function() {
        return true;
      });

      return client
        .signUp(email, password, relier, {
          resume: resumeToken,
        })
        .then(function(sessionData) {
          assert.isTrue(
            realClient.signUp.calledWith(trim(email), password, {
              keys: true,
              redirectTo: REDIRECT_TO,
              resume: resumeToken,
              service: SYNC_SERVICE,
            })
          );

          // The following should only be set for Sync
          assert.equal(sessionData.unwrapBKey, 'unwrapBKey');
          assert.equal(sessionData.keyFetchToken, 'keyFetchToken');
        });
    });

    it('non-Sync signUp signs up a user with email/password does not request keys', function() {
      sinon.stub(realClient, 'signUp').callsFake(function() {
        return Promise.resolve({});
      });

      relier.set('service', NON_SYNC_SERVICE);
      assert.isFalse(relier.wantsKeys());
      return client
        .signUp(email, password, relier, {
          resume: resumeToken,
        })
        .then(function(sessionData) {
          assert.isTrue(
            realClient.signUp.calledWith(trim(email), password, {
              keys: false,
              redirectTo: REDIRECT_TO,
              resume: resumeToken,
              service: NON_SYNC_SERVICE,
            })
          );

          // These should not be returned by default
          assert.isFalse('unwrapBKey' in sessionData);
          assert.isFalse('keyFetchToken' in sessionData);
        });
    });

    it('non-Sync signUp requests keys if the relier explicitly wants them', function() {
      sinon.stub(realClient, 'signUp').callsFake(function() {
        return Promise.resolve({
          keyFetchToken: 'keyFetchToken',
          unwrapBKey: 'unwrapBKey',
        });
      });

      relier.set('service', NON_SYNC_SERVICE);
      sinon.stub(relier, 'wantsKeys').callsFake(() => true);
      return client
        .signUp(email, password, relier, {
          resume: resumeToken,
        })
        .then(function(sessionData) {
          assert.isTrue(
            realClient.signUp.calledWith(trim(email), password, {
              keys: true,
              redirectTo: REDIRECT_TO,
              resume: resumeToken,
              service: NON_SYNC_SERVICE,
            })
          );

          assert.equal(sessionData.unwrapBKey, 'unwrapBKey');
          assert.equal(sessionData.keyFetchToken, 'keyFetchToken');
        });
    });

    it('a throttled signUp returns a THROTTLED error', function() {
      sinon.stub(realClient, 'signUp').callsFake(function() {
        return Promise.reject({
          code: 429,
          errno: 114,
          error: 'Too Many Requests',
          message: 'Client has sent too many requests',
        });
      });

      return client
        .signUp(email, password, relier)
        .then(assert.fail, function(err) {
          assert.isTrue(AuthErrors.is(err, 'THROTTLED'));
        });
    });

    it('passes along an optional `metricsContext`', function() {
      sinon.stub(realClient, 'signUp').callsFake(function() {
        return Promise.resolve({});
      });

      relier.set('service', 'chronicle');

      return client
        .signUp(email, password, relier, {
          metricsContext: { foo: 'bar' },
          resume: resumeToken,
        })
        .then(function() {
          assert.isTrue(
            realClient.signUp.calledWith(trim(email), password, {
              keys: false,
              metricsContext: { foo: 'bar' },
              redirectTo: REDIRECT_TO,
              resume: resumeToken,
              service: 'chronicle',
            })
          );
        });
    });

    it('passes along an optional `style`', function() {
      sinon.stub(realClient, 'signUp').callsFake(function() {
        return Promise.resolve({});
      });

      relier.set('service', 'chronicle');

      return client
        .signUp(email, password, relier, {
          resume: resumeToken,
        })
        .then(function() {
          assert.isTrue(
            realClient.signUp.calledWith(trim(email), password, {
              keys: false,
              redirectTo: REDIRECT_TO,
              resume: resumeToken,
              service: 'chronicle',
            })
          );
        });
    });

    it('passes along an optional `verificationMethod`', function() {
      sinon.stub(realClient, 'signUp').callsFake(function() {
        return Promise.resolve({});
      });

      return client
        .signUp(email, password, relier, {
          resume: resumeToken,
          verificationMethod: 'email-otp',
        })
        .then(function() {
          assert.isTrue(
            realClient.signUp.calledWith(trim(email), password, {
              keys: false,
              redirectTo: REDIRECT_TO,
              resume: resumeToken,
              service: 'sync',
              verificationMethod: 'email-otp',
            })
          );
        });
    });
  });

  describe('recoveryEmailStatus', function() {
    var accountInfo;
    var clientMock;
    var err;

    beforeEach(function() {
      clientMock = {
        accountStatus() {},
        recoveryEmailStatus() {},
      };

      accountInfo = err = null;

      sinon.stub(client, '_getClient').callsFake(function() {
        return Promise.resolve(clientMock);
      });
    });

    describe('valid session', function() {
      describe('verified', function() {
        describe('with auth server that returns `emailVerified` and `sessionVerified`', function() {
          beforeEach(function() {
            sinon.stub(clientMock, 'recoveryEmailStatus').callsFake(function() {
              return Promise.resolve({
                email: 'testuser@testuser.com',
                emailVerified: true,
                sessionVerified: true,
                verified: true,
              });
            });

            return client
              .recoveryEmailStatus('session token')
              .then(function(_accountInfo) {
                accountInfo = _accountInfo;
              });
          });

          it('filters unexpected fields', function() {
            assert.isTrue(
              clientMock.recoveryEmailStatus.calledWith('session token')
            );
            assert.equal(accountInfo.email, 'testuser@testuser.com');
            assert.isTrue(accountInfo.verified);
            assert.notProperty(accountInfo, 'emailVerified');
            assert.notProperty(accountInfo, 'sessionVerified');
          });
        });
      });

      describe('unverified', function() {
        describe('with unverified email, unverified session', function() {
          beforeEach(function() {
            sinon.stub(clientMock, 'recoveryEmailStatus').callsFake(function() {
              return Promise.resolve({
                emailVerified: false,
                sessionVerified: false,
                verified: false,
              });
            });

            return client
              .recoveryEmailStatus('session token')
              .then(function(_accountInfo) {
                accountInfo = _accountInfo;
              });
          });

          it('sets correct `verifiedReason` and `verifiedMethod`', function() {
            assert.isTrue(
              clientMock.recoveryEmailStatus.calledWith('session token')
            );
            assert.isFalse(accountInfo.verified);
            assert.equal(accountInfo.verificationMethod, undefined);
            assert.equal(
              accountInfo.verificationReason,
              VerificationReasons.SIGN_UP
            );
          });
        });

        describe('with verified email, unverified session', function() {
          beforeEach(function() {
            sinon.stub(clientMock, 'recoveryEmailStatus').callsFake(function() {
              return Promise.resolve({
                emailVerified: true,
                sessionVerified: false,
                verified: false,
              });
            });

            return client
              .recoveryEmailStatus('session token')
              .then(function(_accountInfo) {
                accountInfo = _accountInfo;
              });
          });

          it('sets correct `verifiedReason` and `verifiedMethod`', function() {
            assert.isTrue(
              clientMock.recoveryEmailStatus.calledWith('session token')
            );
            assert.isFalse(accountInfo.verified);
            assert.equal(accountInfo.verificationMethod, undefined);
            assert.equal(
              accountInfo.verificationReason,
              VerificationReasons.SIGN_IN
            );
          });
        });
      });
    });

    describe('invalid session', function() {
      beforeEach(function() {
        sinon.stub(clientMock, 'recoveryEmailStatus').callsFake(function() {
          return Promise.reject(AuthErrors.toError('INVALID_TOKEN'));
        });

        sinon.spy(clientMock, 'accountStatus');

        return client
          .recoveryEmailStatus('session token')
          .then(assert.fail, function(_err) {
            err = _err;
          });
      });

      it('rejects with an INVALID_TOKEN error', function() {
        assert.isTrue(AuthErrors.is(err, 'INVALID_TOKEN'));
      });

      it('does not call accountStatus', function() {
        assert.isFalse(clientMock.accountStatus.called);
      });
    });
  });

  describe('signUpResend', () => {
    it('resends the validation email', () => {
      var sessionToken = 'session token';

      sinon
        .stub(realClient, 'recoveryEmailResendCode')
        .callsFake(() => Promise.resolve());

      return client
        .signUpResend(relier, sessionToken, { resume: resumeToken })
        .then(() => {
          const params = {
            redirectTo: REDIRECT_TO,
            resume: resumeToken,
            service: SYNC_SERVICE,
          };
          assert.isTrue(
            realClient.recoveryEmailResendCode.calledWith(sessionToken, params)
          );
        });
    });
  });

  describe('verifyCode', function() {
    it('can successfully complete', function() {
      sinon.stub(realClient, 'verifyCode').callsFake(function() {
        return Promise.resolve({});
      });

      return client.verifyCode('uid', 'code').then(function() {
        assert.isTrue(realClient.verifyCode.calledWith('uid', 'code'));
      });
    });

    it('can successfully complete with optional `style`', () => {
      sinon.stub(realClient, 'verifyCode').callsFake(() => {
        return Promise.resolve({});
      });

      return client.verifyCode('uid', 'code').then(() => {
        assert.isTrue(realClient.verifyCode.calledWith('uid', 'code'));
      });
    });

    it('throws any errors', function() {
      sinon.stub(realClient, 'verifyCode').callsFake(function() {
        return Promise.reject(AuthErrors.toError('INVALID_VERIFICATION_CODE'));
      });

      return client.verifyCode('uid', 'code').then(assert.fail, function(err) {
        assert.isTrue(realClient.verifyCode.calledWith('uid', 'code'));
        assert.isTrue(AuthErrors.is(err, 'INVALID_VERIFICATION_CODE'));
      });
    });
  });

  describe('sessionDestroy', () => {
    it('can successfully complete', () => {
      sinon.stub(realClient, 'sessionDestroy').callsFake(() => {
        return Promise.resolve({});
      });

      return client.sessionDestroy('sessionToken').then(() => {
        assert.isTrue(realClient.sessionDestroy.calledWith('sessionToken'));
      });
    });

    it('throws any errors', () => {
      sinon.stub(realClient, 'sessionDestroy').callsFake(() => {
        return Promise.reject(AuthErrors.toError('INVALID_TOKEN'));
      });

      return client.sessionDestroy('session').then(assert.fail, err => {
        assert.isTrue(realClient.sessionDestroy.calledWith('session'));
        assert.isTrue(AuthErrors.is(err, 'INVALID_TOKEN'));
      });
    });

    it('supports customSessionToken option', () => {
      sinon.stub(realClient, 'sessionDestroy').callsFake(() => {
        return Promise.resolve({});
      });

      return client
        .sessionDestroy('session', {
          customSessionToken: 'foo',
        })
        .then(() => {
          assert.isTrue(
            realClient.sessionDestroy.calledWith('session', {
              customSessionToken: 'foo',
            })
          );
        });
    });
  });

  describe('sessions', () => {
    it('can successfully complete', () => {
      sinon.stub(realClient, 'sessions').callsFake(() => {
        return Promise.resolve({});
      });

      return client.sessions('sessionToken').then(() => {
        assert.isTrue(realClient.sessions.calledWith('sessionToken'));
      });
    });

    it('throws any errors', () => {
      sinon.stub(realClient, 'sessions').callsFake(() => {
        return Promise.reject(AuthErrors.toError('INVALID_TOKEN'));
      });

      return client.sessions('session').then(assert.fail, err => {
        assert.isTrue(realClient.sessions.calledWith('session'));
        assert.isTrue(AuthErrors.is(err, 'INVALID_TOKEN'));
      });
    });
  });

  describe('signIn', function() {
    it('signin with unknown user should fail', function() {
      sinon.stub(realClient, 'signIn').callsFake(function() {
        return Promise.reject(AuthErrors.toError('UNKNOWN_ACCOUNT'));
      });

      return client
        .signIn('unknown@unknown.com', 'password', relier)
        .then(assert.fail, function(err) {
          assert.isTrue(AuthErrors.is(err, 'UNKNOWN_ACCOUNT'));
        });
    });

    describe('legacy unverified account responses', function() {
      var sessionData;

      beforeEach(function() {
        sinon.stub(realClient, 'signIn').callsFake(function() {
          return Promise.resolve({
            verified: false,
          });
        });

        return client
          .signIn(email, password, relier)
          .then(function(_sessionData) {
            sessionData = _sessionData;
          });
      });

      it('are converted to contain a `verificationMethod` and `verificationReason`', function() {
        assert.isFalse(sessionData.verified);
        assert.equal(sessionData.verificationMethod, VerificationMethods.EMAIL);
        assert.equal(
          sessionData.verificationReason,
          VerificationReasons.SIGN_UP
        );
      });
    });

    it('signIn w/ relier that wants keys signs in a user with email/password and returns keys', function() {
      sinon.stub(realClient, 'signIn').callsFake(function() {
        return Promise.resolve({
          keyFetchToken: 'keyFetchToken',
          unwrapBKey: 'unwrapBKey',
          verificationMethod: VerificationMethods.EMAIL,
          verificationReason: VerificationReasons.SIGN_IN,
          verified: false,
        });
      });

      sinon.stub(relier, 'wantsKeys').callsFake(() => true);

      return client
        .signIn(email, password, relier, {
          resume: resumeToken,
        })
        .then(function(sessionData) {
          assert.isTrue(
            realClient.signIn.calledWith(trim(email), password, {
              keys: true,
              reason: SignInReasons.SIGN_IN,
              redirectTo: REDIRECT_TO,
              resume: resumeToken,
              service: SYNC_SERVICE,
            })
          );

          assert.equal(sessionData.keyFetchToken, 'keyFetchToken');
          assert.equal(sessionData.unwrapBKey, 'unwrapBKey');
          assert.isFalse(sessionData.verified);
          assert.equal(
            sessionData.verificationMethod,
            VerificationMethods.EMAIL
          );
          assert.equal(
            sessionData.verificationReason,
            VerificationReasons.SIGN_IN
          );
        });
    });

    it('signIn w/ relier that does not want keys signs a user in with email/password and does not request keys', function() {
      sinon.stub(realClient, 'signIn').callsFake(() => Promise.resolve({}));

      relier.set('service', NON_SYNC_SERVICE);
      sinon.stub(relier, 'wantsKeys').callsFake(() => false);

      return client.signIn(email, password, relier).then(function(sessionData) {
        assert.isTrue(
          realClient.signIn.calledWith(trim(email), password, {
            keys: false,
            reason: SignInReasons.SIGN_IN,
            redirectTo: REDIRECT_TO,
            service: NON_SYNC_SERVICE,
          })
        );

        // These should not be returned by default
        assert.isFalse('unwrapBKey' in sessionData);
        assert.isFalse('keyFetchToken' in sessionData);
      });
    });

    it('passes along an optional `reason`', function() {
      sinon.stub(relier, 'wantsKeys').callsFake(function() {
        return true;
      });

      sinon.stub(realClient, 'signIn').callsFake(function() {
        return Promise.resolve({});
      });

      return client
        .signIn(email, password, relier, {
          reason: SignInReasons.PASSWORD_CHANGE,
        })
        .then(function() {
          assert.isTrue(
            realClient.signIn.calledWith(trim(email), password, {
              keys: true,
              reason: SignInReasons.PASSWORD_CHANGE,
              redirectTo: REDIRECT_TO,
              service: SYNC_SERVICE,
            })
          );
        });
    });

    it('passes along an optional `resume`', function() {
      sinon.stub(realClient, 'signIn').callsFake(function() {
        return Promise.resolve({});
      });

      return client
        .signIn(email, password, relier, { resume: 'resume token' })
        .then(function() {
          assert.isTrue(
            realClient.signIn.calledWith(trim(email), password, {
              keys: false,
              reason: SignInReasons.SIGN_IN,
              redirectTo: REDIRECT_TO,
              resume: 'resume token',
              service: SYNC_SERVICE,
            })
          );
        });
    });

    it('passes along an optional `metricsContext`', function() {
      sinon.stub(realClient, 'signIn').callsFake(function() {
        return Promise.resolve({});
      });

      relier.set('service', NON_SYNC_SERVICE);

      return client
        .signIn(email, password, relier, {
          metricsContext: { foo: 'bar' },
        })
        .then(function() {
          assert.isTrue(realClient.signIn.calledWith(trim(email), password), {
            keys: false,
            metricsContext: { foo: 'bar' },
            reason: SignInReasons.SIGN_IN,
            service: NON_SYNC_SERVICE,
          });
        });
    });

    it('passes along an optional `skipCaseError`', () => {
      sinon.stub(realClient, 'signIn').callsFake(() => Promise.resolve({}));

      return client
        .signIn(email, password, relier, {
          skipCaseError: true,
        })
        .then(() => {
          assert.isTrue(
            realClient.signIn.calledWith(trim(email), password, {
              keys: false,
              reason: SignInReasons.SIGN_IN,
              redirectTo: REDIRECT_TO,
              service: SYNC_SERVICE,
              skipCaseError: true,
            })
          );
        });
    });
  });

  describe('sessionReauth', () => {
    const sessionToken = 'session token';

    it('reauth with invalid session should fail', () => {
      sinon.stub(realClient, 'sessionReauth').callsFake(() => {
        return Promise.reject(AuthErrors.toError('INVALID_TOKEN'));
      });

      return client
        .sessionReauth('badSessionToken', email, password, relier)
        .then(assert.fail, err => {
          assert.isTrue(AuthErrors.is(err, 'INVALID_TOKEN'));
        });
    });

    it('reauth w/ relier that wants keys submits email/password and returns keys', () => {
      sinon.stub(realClient, 'sessionReauth').callsFake(() => {
        return Promise.resolve({
          keyFetchToken: 'keyFetchToken',
          unwrapBKey: 'unwrapBKey',
          verificationMethod: VerificationMethods.EMAIL,
          verificationReason: VerificationReasons.SIGN_IN,
          verified: false,
        });
      });

      sinon.stub(relier, 'wantsKeys').callsFake(() => true);

      return client
        .sessionReauth(sessionToken, email, password, relier, {
          resume: resumeToken,
        })
        .then(sessionData => {
          assert.isTrue(
            realClient.sessionReauth.calledWith(
              sessionToken,
              trim(email),
              password,
              {
                keys: true,
                reason: SignInReasons.SIGN_IN,
                redirectTo: REDIRECT_TO,
                resume: resumeToken,
                service: SYNC_SERVICE,
              }
            )
          );

          assert.equal(sessionData.keyFetchToken, 'keyFetchToken');
          assert.equal(sessionData.unwrapBKey, 'unwrapBKey');
          assert.isFalse(sessionData.verified);
          assert.equal(
            sessionData.verificationMethod,
            VerificationMethods.EMAIL
          );
          assert.equal(
            sessionData.verificationReason,
            VerificationReasons.SIGN_IN
          );
        });
    });

    it('reauth w/ relier that does not want keys submits email/password and does not request keys', () => {
      sinon
        .stub(realClient, 'sessionReauth')
        .callsFake(() => Promise.resolve({}));

      relier.set('service', NON_SYNC_SERVICE);
      sinon.stub(relier, 'wantsKeys').callsFake(() => false);

      return client
        .sessionReauth(sessionToken, email, password, relier)
        .then(sessionData => {
          assert.isTrue(
            realClient.sessionReauth.calledWith(
              sessionToken,
              trim(email),
              password,
              {
                keys: false,
                reason: SignInReasons.SIGN_IN,
                redirectTo: REDIRECT_TO,
                service: NON_SYNC_SERVICE,
              }
            )
          );

          // These should not be returned by default
          assert.isFalse('unwrapBKey' in sessionData);
          assert.isFalse('keyFetchToken' in sessionData);
        });
    });

    describe('reauth called with optional parameters', () => {
      beforeEach(() => {
        sinon.stub(relier, 'wantsKeys').callsFake(() => {
          return true;
        });

        sinon.stub(realClient, 'sessionReauth').callsFake(() => {
          return Promise.resolve({});
        });
      });

      it('passes along an optional `reason`', () => {
        return client
          .sessionReauth(sessionToken, email, password, relier, {
            reason: SignInReasons.PASSWORD_CHANGE,
          })
          .then(() => {
            assert.isTrue(
              realClient.sessionReauth.calledWith(
                sessionToken,
                trim(email),
                password,
                {
                  keys: true,
                  reason: SignInReasons.PASSWORD_CHANGE,
                  redirectTo: REDIRECT_TO,
                  service: SYNC_SERVICE,
                }
              )
            );
          });
      });

      it('passes along an optional `resume`', () => {
        return client
          .sessionReauth(sessionToken, email, password, relier, {
            resume: 'resume token',
          })
          .then(() => {
            assert.isTrue(
              realClient.sessionReauth.calledWith(
                sessionToken,
                trim(email),
                password,
                {
                  keys: true,
                  reason: SignInReasons.SIGN_IN,
                  redirectTo: REDIRECT_TO,
                  resume: 'resume token',
                  service: SYNC_SERVICE,
                }
              )
            );
          });
      });

      it('passes along an optional `metricsContext`', () => {
        return client
          .sessionReauth(sessionToken, email, password, relier, {
            metricsContext: { foo: 'bar' },
          })
          .then(() => {
            assert.isTrue(
              realClient.sessionReauth.calledWith(
                sessionToken,
                trim(email),
                password
              ),
              {
                keys: true,
                metricsContext: { foo: 'bar' },
                reason: SignInReasons.SIGN_IN,
                service: SYNC_SERVICE,
              }
            );
          });
      });

      it('passes along an optional `skipCaseError`', () => {
        return client
          .sessionReauth(sessionToken, email, password, relier, {
            skipCaseError: true,
          })
          .then(() => {
            assert.isTrue(
              realClient.sessionReauth.calledWith(
                sessionToken,
                trim(email),
                password,
                {
                  keys: true,
                  reason: SignInReasons.SIGN_IN,
                  redirectTo: REDIRECT_TO,
                  service: SYNC_SERVICE,
                  skipCaseError: true,
                }
              )
            );
          });
      });

      it('passes along an optional `unblockCode`', () => {
        return client
          .sessionReauth(sessionToken, email, password, relier, {
            unblockCode: 'unblock me',
          })
          .then(() => {
            assert.isTrue(
              realClient.sessionReauth.calledWith(
                sessionToken,
                trim(email),
                password,
                {
                  keys: true,
                  reason: SignInReasons.SIGN_IN,
                  redirectTo: REDIRECT_TO,
                  service: SYNC_SERVICE,
                  unblockCode: 'unblock me',
                }
              )
            );
          });
      });

      it('passes along an optional `verificationMethod`', () => {
        return client
          .sessionReauth(sessionToken, email, password, relier, {
            verificationMethod: 'email-2fa',
          })
          .then(() => {
            assert.isTrue(
              realClient.sessionReauth.calledWith(
                sessionToken,
                trim(email),
                password,
                {
                  keys: true,
                  reason: SignInReasons.SIGN_IN,
                  redirectTo: REDIRECT_TO,
                  service: SYNC_SERVICE,
                  verificationMethod: 'email-2fa',
                }
              )
            );
          });
      });
    });
  });

  describe('passwordReset', function() {
    beforeEach(function() {
      sinon.stub(realClient, 'passwordForgotSendCode').callsFake(function() {
        return Promise.resolve({
          passwordForgotToken: 'token',
        });
      });
    });

    it('requests a password reset', function() {
      return client
        .passwordReset(email, relier, { resume: resumeToken })
        .then(function() {
          var params = {
            redirectTo: REDIRECT_TO,
            resume: resumeToken,
            service: SYNC_SERVICE,
          };
          assert.isTrue(
            realClient.passwordForgotSendCode.calledWith(trim(email), params)
          );
        });
    });

    it('passes along an optional `metricsContext`', function() {
      return client
        .passwordReset(email, relier, {
          metricsContext: {},
          resume: resumeToken,
        })
        .then(function() {
          var params = {
            metricsContext: {},
            redirectTo: REDIRECT_TO,
            resume: resumeToken,
            service: SYNC_SERVICE,
          };
          assert.isTrue(
            realClient.passwordForgotSendCode.calledWith(trim(email), params)
          );
        });
    });
  });

  describe('passwordResetResend', function() {
    var passwordForgotToken = 'token';

    beforeEach(function() {
      sinon.stub(realClient, 'passwordForgotSendCode').callsFake(function() {
        return Promise.resolve({
          passwordForgotToken: passwordForgotToken,
        });
      });

      sinon.stub(realClient, 'passwordForgotResendCode').callsFake(function() {
        return Promise.resolve({});
      });
    });

    it('resends the validation email', function() {
      return client
        .passwordReset(email, relier, { resume: resumeToken })
        .then(function() {
          return client.passwordResetResend(
            email,
            passwordForgotToken,
            relier,
            { resume: resumeToken }
          );
        })
        .then(function() {
          var params = {
            redirectTo: REDIRECT_TO,
            resume: resumeToken,
            service: SYNC_SERVICE,
          };
          assert.isTrue(
            realClient.passwordForgotResendCode.calledWith(
              trim(email),
              passwordForgotToken,
              params
            )
          );
        });
    });
  });

  describe('completePasswordReset', function() {
    var token = 'token';
    var code = 'code';
    var relier = {
      has() {
        return false;
      },
      isSync() {
        return true;
      },
      wantsKeys() {
        return true;
      },
    };

    beforeEach(function() {
      sinon.stub(realClient, 'passwordForgotVerifyCode').callsFake(function() {
        return Promise.resolve({
          accountResetToken: 'reset_token',
        });
      });

      sinon.stub(realClient, 'accountReset').callsFake(function() {
        return Promise.resolve({
          authAt: Date.now(),
          keyFetchToken: 'new keyFetchToken',
          sessionToken: 'new sessionToken',
          uid: 'uid',
          unwrapBKey: 'unwrap b key',
          verified: true,
        });
      });
    });

    it('completes the password reset', function() {
      return client
        .completePasswordReset(email, password, token, code, relier)
        .then(function(sessionData) {
          assert.isTrue(
            realClient.passwordForgotVerifyCode.calledWith(code, token)
          );
          assert.isTrue(
            realClient.accountReset.calledWith(
              trim(email),
              password,
              'reset_token',
              { keys: true, sessionToken: true }
            )
          );

          assert.equal(sessionData.email, trim(email));
          assert.equal(sessionData.keyFetchToken, 'new keyFetchToken');
          assert.equal(sessionData.sessionToken, 'new sessionToken');
          assert.equal(sessionData.sessionTokenContext, 'fx_desktop_v1');
          assert.equal(sessionData.uid, 'uid');
          assert.equal(sessionData.unwrapBKey, 'unwrap b key');
          assert.isTrue(sessionData.verified);
        });
    });
  });

  describe('checkAccountExists', function() {
    it('returns true if an account exists', function() {
      sinon.stub(realClient, 'accountStatus').callsFake(function() {
        return Promise.resolve({ exists: true });
      });

      return client.checkAccountExists('uid').then(function(accountExists) {
        assert.isTrue(accountExists);
      });
    });

    it('returns false if an account does not exist', function() {
      sinon.stub(realClient, 'accountStatus').callsFake(function() {
        return Promise.resolve({ exists: false });
      });

      return client.checkAccountExists('uid').then(function(accountExists) {
        assert.isFalse(accountExists);
      });
    });

    it('throws other errors from the auth server', function() {
      sinon.stub(realClient, 'accountStatus').callsFake(function() {
        return Promise.reject(new Error('missing uid'));
      });

      return client.checkAccountExists().then(assert.fail, function(err) {
        assert.equal(err.message, 'missing uid');
      });
    });
  });

  describe('checkPassword', function() {
    it('returns error if password is incorrect', function() {
      email = trim(email);

      sinon.stub(realClient, 'signIn').callsFake(function() {
        return Promise.reject(AuthErrors.toError('INCORRECT_PASSWORD'));
      });

      sinon.stub(realClient, 'sessionDestroy').callsFake(sinon.spy());

      return client
        .checkPassword(email, password)
        .then(assert.fail, function(err) {
          assert.isTrue(AuthErrors.is(err, 'INCORRECT_PASSWORD'));
          assert.isTrue(
            realClient.signIn.calledWith(email, password, {
              reason: SignInReasons.PASSWORD_CHECK,
            })
          );
          assert.isFalse(realClient.sessionDestroy.called);
        });
    });

    it('succeeds if password is correct', function() {
      email = trim(email);

      sinon.stub(realClient, 'signIn').callsFake(function() {
        return Promise.resolve({
          sessionToken: 'session token',
        });
      });

      sinon.stub(realClient, 'sessionDestroy').callsFake(function() {
        return Promise.resolve();
      });

      return client.checkPassword(email, password).then(function() {
        assert.isTrue(
          realClient.signIn.calledWith(email, password, {
            reason: SignInReasons.PASSWORD_CHECK,
          })
        );
        assert.isTrue(realClient.sessionDestroy.calledWith('session token'));
      });
    });

    it('re-authenticates an existing sessionToken if provided', () => {
      const sessionToken = 'session token';
      email = trim(email);

      sinon.stub(realClient, 'sessionReauth').callsFake(() => {
        return Promise.resolve({});
      });

      sinon.stub(realClient, 'signIn').callsFake(() => {
        return Promise.resolve({});
      });

      sinon.stub(realClient, 'sessionDestroy').callsFake(() => {
        return Promise.resolve();
      });

      return client.checkPassword(email, password, sessionToken).then(() => {
        assert.isTrue(
          realClient.sessionReauth.calledWith(sessionToken, email, password, {
            reason: SignInReasons.PASSWORD_CHECK,
          })
        );
        assert.isFalse(realClient.signIn.called);
        assert.isFalse(realClient.sessionDestroy.called);
      });
    });
  });

  describe('changePassword', function() {
    it("changes the user's password", function() {
      var trimmedEmail = trim(email);

      var relier = {
        has() {
          return false;
        },
        isSync() {
          return true;
        },
        wantsKeys() {
          return true;
        },
      };

      sinon.stub(realClient, 'passwordChange').callsFake(function() {
        return Promise.resolve({
          email: trimmedEmail,
          keyFetchToken: 'new keyFetchToken',
          sessionToken: 'new sessionToken',
          uid: 'uid',
          verified: true,
        });
      });

      sinon.spy(realClient, 'signIn');

      return client
        .changePassword(
          email,
          password,
          'new_password',
          'sessionToken',
          'fx_desktop_v1',
          relier
        )
        .then(function(sessionData) {
          assert.isTrue(
            realClient.passwordChange.calledWith(
              trim(email),
              password,
              'new_password',
              {
                keys: true,
                sessionToken: 'sessionToken',
              }
            )
          );

          assert.isFalse(realClient.signIn.called);

          assert.equal(sessionData.email, trimmedEmail);
          assert.equal(sessionData.keyFetchToken, 'new keyFetchToken');
          assert.equal(sessionData.sessionToken, 'new sessionToken');
          assert.equal(sessionData.sessionTokenContext, 'fx_desktop_v1');
          assert.equal(sessionData.uid, 'uid');
          assert.isTrue(sessionData.verified);
        });
    });

    it('requests keys for any relier if sessionTokenContext indicates keys were needed previously', function() {
      var trimmedEmail = trim(email);

      var relier = {
        isSync() {
          return false;
        },
        wantsKeys() {
          return false;
        },
      };

      sinon.stub(realClient, 'passwordChange').callsFake(function() {
        return Promise.resolve({
          email: trimmedEmail,
          keyFetchToken: 'new keyFetchToken',
          sessionToken: 'new sessionToken',
          uid: 'uid',
          verified: true,
        });
      });

      return client
        .changePassword(
          email,
          password,
          'new_password',
          'sessionToken',
          'fx_desktop_v1',
          relier
        )
        .then(sessionData => {
          assert.isTrue(
            realClient.passwordChange.calledWith(
              trimmedEmail,
              password,
              'new_password',
              {
                keys: true,
                sessionToken: 'sessionToken',
              }
            )
          );

          assert.equal(sessionData.email, trimmedEmail);
          assert.equal(sessionData.keyFetchToken, 'new keyFetchToken');
          assert.equal(sessionData.sessionToken, 'new sessionToken');
          assert.equal(sessionData.sessionTokenContext, 'fx_desktop_v1');
          assert.equal(sessionData.uid, 'uid');
          assert.isTrue(sessionData.verified);
        });
    });
  });

  describe('isPasswordResetComplete', function() {
    it('password status incomplete', function() {
      sinon.stub(realClient, 'passwordForgotStatus').callsFake(function() {
        return Promise.resolve();
      });

      return client.isPasswordResetComplete('token').then(function(complete) {
        // cache the token so it's not cleared after the password change
        assert.isFalse(complete);
      });
    });

    it('password status complete', function() {
      sinon.stub(realClient, 'passwordForgotStatus').callsFake(function() {
        return Promise.reject(AuthErrors.toError('INVALID_TOKEN'));
      });

      return client.isPasswordResetComplete('token').then(function(complete) {
        assert.isTrue(complete);
      });
    });

    it('throws other errors', function() {
      sinon.stub(realClient, 'passwordForgotStatus').callsFake(function() {
        return Promise.reject(AuthErrors.toError('UNEXPECTED_ERROR'));
      });

      return client
        .isPasswordResetComplete('token')
        .then(assert.fail, function(err) {
          assert.isTrue(AuthErrors.is(err, 'UNEXPECTED_ERROR'));
        });
    });
  });

  describe('deleteAccount', function() {
    it("deletes the user's account", function() {
      sinon.stub(realClient, 'accountDestroy').callsFake(function() {
        return Promise.resolve();
      });

      return client.deleteAccount(email, password).then(null, function(err) {
        assert.isTrue(realClient.accountDestroy.calledWith(trim(email)));
        // this test is necessary because errors in deleteAccount
        // should not be propagated to the final done's error
        // handler
        throw new Error('unexpected failure: ' + err.message);
      });
    });
  });

  describe('sessionStatus', function() {
    it('checks sessionStatus', function() {
      sinon.stub(realClient, 'sessionStatus').callsFake(function() {
        return Promise.resolve();
      });

      return client.sessionStatus('sessiontoken').then(function() {
        assert.isTrue(realClient.sessionStatus.calledWith('sessiontoken'));
      });
    });
  });

  describe('accountProfile', () => {
    it('checks accountProfile', () => {
      sinon.stub(realClient, 'accountProfile').callsFake(() => {
        return Promise.resolve();
      });

      return client.accountProfile('sessiontoken').then(() => {
        assert.isTrue(realClient.accountProfile.calledWith('sessiontoken'));
      });
    });
  });

  describe('account', () => {
    it('calls account', () => {
      sinon.stub(realClient, 'account').callsFake(() => Promise.resolve());

      return client.account('wibble').then(() => {
        assert.isTrue(realClient.account.calledWith('wibble'));
      });
    });
  });

  describe('isSignedIn', function() {
    it('resolves to false if no sessionToken passed in', function() {
      return client.isSignedIn().then(function(isSignedIn) {
        assert.isFalse(isSignedIn);
      });
    });

    it('resolves to false if invalid sessionToken passed in', function() {
      sinon.stub(realClient, 'sessionStatus').callsFake(function() {
        return Promise.reject(AuthErrors.toError('INVALID_TOKEN'));
      });

      return client.isSignedIn('not a real token').then(function(isSignedIn) {
        assert.isFalse(isSignedIn);
      });
    });

    it('resolves to true with a valid sessionToken', function() {
      sinon.stub(realClient, 'sessionStatus').callsFake(function() {
        return Promise.resolve({});
      });

      return client.isSignedIn('token').then(function(isSignedIn) {
        assert.isTrue(isSignedIn);
      });
    });

    it('throws any other errors', function() {
      sinon.stub(realClient, 'sessionStatus').callsFake(function() {
        return Promise.reject(AuthErrors.toError('UNEXPECTED_ERROR'));
      });

      return client.isSignedIn('token').then(assert.fail, function(err) {
        assert.isTrue(AuthErrors.is(err, 'UNEXPECTED_ERROR'));
      });
    });
  });

  describe('getRandomBytes', function() {
    it('snags some entropy from somewhere', function() {
      sinon.stub(realClient, 'getRandomBytes').callsFake(function() {
        return Promise.resolve('some random bytes');
      });

      return client.getRandomBytes().then(function(bytes) {
        assert.ok(bytes);
        assert.isTrue(realClient.getRandomBytes.called);
      });
    });
  });

  describe('accountKeys', function() {
    it('fetches account keys on request', function() {
      sinon.stub(realClient, 'accountKeys').callsFake(function() {
        return Promise.resolve({
          kA: 'kA',
          kB: 'kB',
        });
      });

      return client
        .accountKeys('keyFetchToken', 'unwrapBKey')
        .then(function(keys) {
          assert.isTrue(
            realClient.accountKeys.calledWith('keyFetchToken', 'unwrapBKey')
          );
          assert.equal(keys.kA, 'kA');
          assert.equal(keys.kB, 'kB');
        });
    });
  });

  describe('deviceList', function() {
    beforeEach(function() {
      sinon.stub(realClient, 'deviceList').callsFake(function() {
        return Promise.resolve();
      });
      return client.deviceList('session token');
    });

    it('calls `deviceList` of the realClient', function() {
      assert.isTrue(realClient.deviceList.calledWith('session token'));
    });
  });

  describe('deviceDestroy', function() {
    beforeEach(function() {
      sinon.stub(realClient, 'deviceDestroy').callsFake(function() {
        return Promise.resolve();
      });
      return client.deviceDestroy('session token', 'device id');
    });

    it('calls `deviceDestroy` of the realClient', function() {
      assert.isTrue(
        realClient.deviceDestroy.calledWith('session token', 'device id')
      );
    });
  });

  describe('sendUnblockEmail', () => {
    const metricsContext = {};
    beforeEach(() => {
      sinon
        .stub(realClient, 'sendUnblockCode')
        .callsFake(() => Promise.resolve({}));

      return client.sendUnblockEmail(email, { metricsContext });
    });

    it('sends a login authorization email', () => {
      assert.isTrue(
        realClient.sendUnblockCode.calledWith(email, { metricsContext })
      );
    });
  });

  describe('rejectUnblockCode', () => {
    beforeEach(() => {
      sinon
        .stub(realClient, 'rejectUnblockCode')
        .callsFake(() => Promise.resolve({}));

      return client.rejectUnblockCode('uid', 'code');
    });

    it('rejects the authorization code', () => {
      assert.isTrue(realClient.rejectUnblockCode.calledWith('uid', 'code'));
    });
  });

  describe('sendSms', () => {
    it('delegates to the fxa-js-client', () => {
      sinon.stub(realClient, 'sendSms').callsFake(() => Promise.resolve());

      return client
        .sendSms('sessionToken', '+441234567890', 1, {
          metricsContext: {},
        })
        .then(() => {
          assert.isTrue(
            realClient.sendSms.calledWith('sessionToken', '+441234567890', 1, {
              metricsContext: {},
            })
          );
        });
    });

    it('converts INVALID_PARAMETER w/ phoneNumber to AuthErrors.INVALID_PHONE_NUMBER', () => {
      const serverError = {
        code: 400,
        errno: AuthErrors.toErrno('INVALID_PARAMETER'),
        validation: {
          keys: ['phoneNumber'],
        },
      };
      sinon
        .stub(realClient, 'sendSms')
        .callsFake(() => Promise.reject(serverError));

      return client
        .sendSms('sessionToken', '1234567890', 1, {
          metricsContext: {},
        })
        .then(assert.fail, err => {
          assert.isTrue(AuthErrors.is(err, 'INVALID_PHONE_NUMBER'));
        });
    });

    it('passes back other errors', () => {
      const serverError = {
        code: 400,
        errno: AuthErrors.toErrno('SMS_ID_INVALID'),
      };
      sinon
        .stub(realClient, 'sendSms')
        .callsFake(() => Promise.reject(serverError));

      return client
        .sendSms('sessionToken', '1234567890', 1, {
          metricsContext: {},
        })
        .then(assert.fail, err => {
          assert.isTrue(AuthErrors.is(err, 'SMS_ID_INVALID'));
        });
    });
  });

  describe('securityEvents', () => {
    it('delegates to the fxa-js-client', () => {
      const events = [
        {
          name: 'account.login',
          verified: 1,
          createdAt: new Date().getTime(),
        },
        {
          name: 'account.create',
          verified: 1,
          createdAt: new Date().getTime(),
        },
      ];

      sinon.stub(realClient, 'securityEvents').callsFake(() => {
        return Promise.resolve(events);
      });

      return client.securityEvents('sessionToken').then(res => {
        assert.isTrue(realClient.securityEvents.calledWith('sessionToken'));
        assert.isTrue(realClient.securityEvents.calledOnce);

        assert.equal(res.length, 2);
        assert.deepEqual(res[0], events[0]);
        assert.deepEqual(res[1], events[1]);
      });
    });
  });

  describe('deleteSecurityEvents', () => {
    it('delegates to the fxa-js-client', () => {
      sinon.stub(realClient, 'deleteSecurityEvents').callsFake(() => {
        return Promise.resolve({});
      });

      return client.deleteSecurityEvents('sessionToken').then(res => {
        assert.isTrue(
          realClient.deleteSecurityEvents.calledWith('sessionToken')
        );
        assert.isTrue(realClient.deleteSecurityEvents.calledOnce);

        assert.deepEqual(res, {});
      });
    });
  });

  describe('smsStatus', () => {
    it('delegates to the fxa-js-client', () => {
      sinon.stub(realClient, 'smsStatus').callsFake(() =>
        Promise.resolve({
          country: 'GB',
          ok: true,
        })
      );

      const smsStatusOptions = { country: 'GB ' };
      return client.smsStatus('sessionToken', smsStatusOptions).then(resp => {
        assert.equal(resp.country, 'GB');
        assert.isTrue(resp.ok);

        assert.isTrue(realClient.smsStatus.calledOnce);
        assert.isTrue(
          realClient.smsStatus.calledWith('sessionToken', smsStatusOptions)
        );
      });
    });
  });

  describe('consumeSigninCode', () => {
    it('delegates to the fxa-js-client', () => {
      const resp = {
        email: 'testuser@testuser.com',
      };
      sinon
        .stub(realClient, 'consumeSigninCode')
        .callsFake(() => Promise.resolve(resp));

      return client.consumeSigninCode('thecode').then(_resp => {
        assert.strictEqual(_resp, resp);

        assert.isTrue(realClient.consumeSigninCode.calledOnce);
        assert.isTrue(realClient.consumeSigninCode.calledWith('thecode'));
      });
    });
  });

  describe('createTotpToken', () => {
    it('delegates to the fxa-js-client', () => {
      const resp = {
        qrCodeUrl: 'data:image/png;base64,iVBOR:',
        secret: 'superdupersecretcode',
      };
      sinon
        .stub(realClient, 'createTotpToken')
        .callsFake(() => Promise.resolve(resp));

      return client.createTotpToken().then(_resp => {
        assert.strictEqual(_resp, resp);
        assert.isTrue(realClient.createTotpToken.calledOnce);
      });
    });
  });

  describe('deleteTotpToken', () => {
    it('delegates to the fxa-js-client', () => {
      const resp = {};
      sinon
        .stub(realClient, 'deleteTotpToken')
        .callsFake(() => Promise.resolve(resp));

      return client.deleteTotpToken().then(_resp => {
        assert.strictEqual(_resp, resp);
        assert.isTrue(realClient.deleteTotpToken.calledOnce);
      });
    });
  });

  describe('checkTotpTokenExists', () => {
    it('delegates to the fxa-js-client', () => {
      const resp = {
        exists: true,
      };
      sinon
        .stub(realClient, 'checkTotpTokenExists')
        .callsFake(() => Promise.resolve(resp));

      return client.checkTotpTokenExists().then(_resp => {
        assert.strictEqual(_resp, resp);
        assert.isTrue(realClient.checkTotpTokenExists.calledOnce);
      });
    });
  });

  describe('verifyTotpCode', () => {
    it('delegates to the fxa-js-client', () => {
      const resp = {
        success: true,
      };
      const options = {
        service: 'someservice',
      };
      sinon
        .stub(realClient, 'verifyTotpCode')
        .callsFake(() => Promise.resolve(resp));

      return client.verifyTotpCode('code', options).then(_resp => {
        assert.strictEqual(_resp, resp);
        assert.isTrue(realClient.verifyTotpCode.calledOnce);
        assert.isTrue(realClient.verifyTotpCode.calledWith('code', options));
      });
    });
  });

  describe('createRecoveryBundle', () => {
    let sandbox;

    beforeEach(() => {
      sandbox = sinon.sandbox.create();
    });

    afterEach(() => {
      sandbox.restore();
    });

    it('delegates to the fxa-js-client', () => {
      const bundle = 'some cool base64 encrypted data';
      const keys = {
        kB: '12341234',
      };
      const recoveryKey = 'ATQ5RYC9Z5DRN4HG';
      const recoveryJwk = {
        kid: 'kid',
      };
      const uid = '1234';

      sandbox
        .stub(realClient, 'accountKeys')
        .callsFake(() => Promise.resolve(keys));
      sandbox.stub(realClient, 'sessionReauth').callsFake(() =>
        Promise.resolve({
          keyFetchToken: 'keyFetchToken',
          unwrapBKey: 'unwrapBKey',
        })
      );
      sandbox
        .stub(realClient, 'createRecoveryKey')
        .callsFake(() => Promise.resolve({ recoveryKey }));
      sandbox
        .stub(RecoveryKey, 'generateRecoveryKey')
        .callsFake(() => Promise.resolve(recoveryKey));
      sandbox
        .stub(RecoveryKey, 'getRecoveryJwk')
        .callsFake(() => Promise.resolve(recoveryJwk));
      sandbox
        .stub(RecoveryKey, 'bundleRecoveryData')
        .callsFake(() => Promise.resolve(bundle));

      return client
        .createRecoveryBundle('email', 'password', 'sessionToken', uid, true)
        .then(resp => {
          assert.isTrue(
            realClient.sessionReauth.calledOnceWith(
              'sessionToken',
              'email',
              'password',
              { keys: true, reason: VerificationReasons.RECOVERY_KEY }
            )
          );
          assert.isTrue(
            realClient.accountKeys.calledOnceWith('keyFetchToken', 'unwrapBKey')
          );
          assert.isTrue(
            realClient.createRecoveryKey.calledOnceWith(
              'sessionToken',
              recoveryJwk.kid,
              bundle,
              true
            )
          );
          assert.isTrue(RecoveryKey.generateRecoveryKey.calledOnce);
          assert.isTrue(
            RecoveryKey.getRecoveryJwk.calledOnceWith(uid, recoveryKey)
          );
          assert.isTrue(
            RecoveryKey.bundleRecoveryData.calledOnceWith(recoveryJwk, keys)
          );
          assert.deepEqual(resp, {
            recoveryKey,
            recoveryKeyId: recoveryJwk.kid,
          });
        });
    });
  });
});
