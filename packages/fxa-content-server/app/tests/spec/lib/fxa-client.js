/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define(function (require, exports, module) {
  'use strict';

  var $ = require('jquery');
  var AuthErrors = require('lib/auth-errors');
  var chai = require('chai');
  var Constants = require('lib/constants');
  var FxaClient = require('fxaClient');
  var FxaClientWrapper = require('lib/fxa-client');
  var OAuthRelier = require('models/reliers/oauth');
  var p = require('lib/promise');
  var ResumeToken = require('models/resume-token');
  var sinon = require('sinon');
  var testHelpers = require('../../lib/helpers');

  var STATE = 'state';
  var SERVICE = 'sync';
  var REDIRECT_TO = 'https://sync.firefox.com';
  var AUTH_SERVER_URL = 'http://127.0.0.1:9000';

  var assert = chai.assert;
  var email;
  var password = 'password';
  var client;
  var realClient;
  var relier;
  var resumeToken;

  function trim(str) {
    return $.trim(str);
  }

  describe('lib/fxa-client', function () {
    beforeEach(function () {
      email = ' ' + testHelpers.createEmail() + ' ';
      relier = new OAuthRelier();
      relier.set('state', STATE);
      relier.set('service', SERVICE);
      relier.set('redirectTo', REDIRECT_TO);

      resumeToken = ResumeToken.stringify({
        state: STATE,
        verificationRedirect: Constants.VERIFICATION_REDIRECT_NO
      });

      realClient = new FxaClient(AUTH_SERVER_URL);

      client = new FxaClientWrapper({
        client: realClient
      });
    });

    it('initializes client from authServerUrl', function () {
      client = new FxaClientWrapper({
        authServerUrl: AUTH_SERVER_URL
      });
    });

    describe('errors', function () {
      describe('realClient client returns a promise', function () {
        it('are normalized to be AuthErrors based', function () {
          // taken from the fxa-auth-server @
          // https://github.com/mozilla/fxa-auth-server/blob/9dcdcd9b142a2ed93fc55ac187a501a7a2005c6b/lib/error.js#L290-L308
          sinon.stub(realClient, 'signUp', function () {
            return p.reject({
              code: 429,
              errno: 114,
              error: 'Too Many Requests',
              message: 'Client has sent too many requests',
              retryAfter: 30
            });
          });

          return client.signUp(email, password, relier)
            .fail(function (err) {
              assert.equal(err.message, AuthErrors.toMessage(114));
              assert.equal(err.namespace, AuthErrors.NAMESPACE);
              assert.equal(err.code, 429);
              assert.equal(err.errno, 114);
              assert.equal(err.retryAfter, 30);
              realClient.signUp.restore();
            });
        });
      });

      describe('realClient does not return a promise', function () {
        it('does not normalize', function () {
          sinon.stub(realClient, 'signUp', function () {
            return true;
          });

          return client._getClient()
            .then(function (wrappedClient) {
              assert.isTrue(wrappedClient.signUp(email, password, relier));
            });
        });
      });
    });

    describe('signUp', function () {
      it('Sync signUp signs up a user with email/password and returns keys', function () {
        sinon.stub(realClient, 'signUp', function () {
          return p({
            keyFetchToken: 'keyFetchToken',
            unwrapBKey: 'unwrapBKey'
          });
        });

        sinon.stub(relier, 'wantsKeys', function () {
          return true;
        });

        sinon.stub(relier, 'isSync', function () {
          return true;
        });

        return client.signUp(email, password, relier, { customizeSync: true, resume: resumeToken })
          .then(function (sessionData) {
            assert.isTrue(realClient.signUp.calledWith(trim(email), password, {
              keys: true,
              redirectTo: REDIRECT_TO,
              resume: resumeToken,
              service: SERVICE
            }));

            // The following should only be set for Sync
            assert.equal(sessionData.unwrapBKey, 'unwrapBKey');
            assert.equal(sessionData.keyFetchToken, 'keyFetchToken');
            assert.equal(sessionData.customizeSync, true);
          });
      });

      it('non-Sync signUp signs up a user with email/password does not request keys', function () {
        sinon.stub(realClient, 'signUp', function () {
          return p({});
        });

        relier.set('service', 'chronicle');
        assert.isFalse(relier.wantsKeys());
        // customizeSync should be ignored
        return client.signUp(email, password, relier, { customizeSync: true, resume: resumeToken })
          .then(function (sessionData) {
            assert.isTrue(realClient.signUp.calledWith(trim(email), password, {
              keys: false,
              redirectTo: REDIRECT_TO,
              resume: resumeToken,
              service: 'chronicle'
            }));

            // These should not be returned by default
            assert.isFalse('unwrapBKey' in sessionData);
            assert.isFalse('keyFetchToken' in sessionData);
            // The following should only be set for Sync
            assert.isFalse('customizeSync' in sessionData);
          });
      });

      it('non-Sync signUp requests keys if the relier explicitly wants them', function () {
        sinon.stub(realClient, 'signUp', function () {
          return p({
            keyFetchToken: 'keyFetchToken',
            unwrapBKey: 'unwrapBKey'
          });
        });

        relier.set('service', 'chronicle');
        relier.set('keys', true);
        assert.isTrue(relier.wantsKeys());
        return client.signUp(email, password, relier, { customizeSync: true, resume: resumeToken })
          .then(function (sessionData) {
            assert.isTrue(realClient.signUp.calledWith(trim(email), password, {
              keys: true,
              redirectTo: REDIRECT_TO,
              resume: resumeToken,
              service: 'chronicle'
            }));

            assert.equal(sessionData.unwrapBKey, 'unwrapBKey');
            assert.equal(sessionData.keyFetchToken, 'keyFetchToken');
            // The following should only be set for Sync
            assert.isFalse('customizeSync' in sessionData);
          });
      });

      it('a throttled signUp returns a THROTTLED error', function () {
        sinon.stub(realClient, 'signUp', function () {
          return p.reject({
            code: 429,
            errno: 114,
            error: 'Too Many Requests',
            message: 'Client has sent too many requests'
          });
        });

        return client.signUp(email, password, relier)
          .then(assert.fail, function (err) {
            assert.isTrue(AuthErrors.is(err, 'THROTTLED'));
          });
      });

      it('signUp a preverified user using preVerifyToken', function () {
        var preVerifyToken = 'somebiglongtoken';
        relier.set('preVerifyToken', preVerifyToken);

        sinon.stub(realClient, 'signUp', function () {
          return p({});
        });

        sinon.stub(relier, 'wantsKeys', function () {
          return true;
        });

        return client.signUp(email, password, relier, {
          preVerifyToken: preVerifyToken,
          resume: resumeToken
        })
        .then(function () {
          assert.isTrue(realClient.signUp.calledWith(trim(email), password, {
            keys: true,
            preVerifyToken: preVerifyToken,
            redirectTo: REDIRECT_TO,
            resume: resumeToken,
            service: SERVICE
          }));
        });
      });

      it('signUp a user with an invalid preVerifyToken retries the signup without the token', function () {
        var preVerifyToken = 'somebiglongtoken';
        relier.set('preVerifyToken', preVerifyToken);
        sinon.stub(relier, 'wantsKeys', function () {
          return true;
        });

        // we are going to take over from here.
        testHelpers.removeFxaClientSpy(realClient);

        var count = 0;
        sinon.stub(realClient, 'signUp', function () {
          count++;
          if (count === 1) {
            assert.isTrue(realClient.signUp.calledWith(trim(email), password, {
              keys: true,
              preVerifyToken: preVerifyToken,
              redirectTo: REDIRECT_TO,
              resume: resumeToken,
              service: SERVICE
            }));

            return p.reject(AuthErrors.toError('INVALID_VERIFICATION_CODE'));
          } else if (count === 2) {
            assert.isTrue(realClient.signUp.calledWith(trim(email), password, {
              keys: true,
              redirectTo: REDIRECT_TO,
              resume: resumeToken,
              service: SERVICE
            }));

            return p({});
          }
        });

        return client.signUp(email, password, relier, { resume: resumeToken })
          .then(function () {
            assert.equal(realClient.signUp.callCount, 2);
          });
      });
    });

    describe('signUpResend', function () {
      it('resends the validation email', function () {
        var sessionToken = 'session token';

        sinon.stub(realClient, 'recoveryEmailResendCode', function () {
          return p();
        });

        return client.signUpResend(relier, sessionToken, { resume: resumeToken })
          .then(function () {
            var params = {
              redirectTo: REDIRECT_TO,
              resume: resumeToken,
              service: SERVICE
            };
            assert.isTrue(
                realClient.recoveryEmailResendCode.calledWith(
                    sessionToken,
                    params
                ));
          });
      });
    });

    describe('verifyCode', function () {
      it('can successfully complete', function () {
        sinon.stub(realClient, 'verifyCode', function () {
          return p({});
        });

        return client.verifyCode('uid', 'code')
          .then(function () {
            assert.isTrue(realClient.verifyCode.calledWith('uid', 'code'));
          });
      });

      it('throws any errors', function () {
        sinon.stub(realClient, 'verifyCode', function () {
          return p.reject(AuthErrors.toError('INVALID_VERIFICATION_CODE'));
        });

        return client.verifyCode('uid', 'code')
          .then(assert.fail, function (err) {
            assert.isTrue(realClient.verifyCode.calledWith('uid', 'code'));
            assert.isTrue(AuthErrors.is(err, 'INVALID_VERIFICATION_CODE'));
          });
      });
    });

    describe('signIn', function () {
      it('signin with unknown user should fail', function () {
        sinon.stub(realClient, 'signIn', function () {
          return p.reject(AuthErrors.toError('UNKNOWN_ACCOUNT'));
        });

        return client.signIn('unknown@unknown.com', 'password', relier)
          .then(assert.fail, function (err) {
            assert.isTrue(AuthErrors.is(err, 'UNKNOWN_ACCOUNT'));
          });
      });

      it('Sync signIn signs in a user with email/password and returns keys', function () {
        sinon.stub(realClient, 'signIn', function () {
          return p({
            keyFetchToken: 'keyFetchToken',
            unwrapBKey: 'unwrapBKey'
          });
        });

        sinon.stub(relier, 'wantsKeys', function () {
          return true;
        });

        sinon.stub(relier, 'isSync', function () {
          return true;
        });

        relier.set('service', 'sync');
        return client.signIn(email, password, relier, { customizeSync: true })
          .then(function (sessionData) {
            assert.isTrue(realClient.signIn.calledWith(trim(email), password, {
              keys: true,
              reason: client.SIGNIN_REASON.SIGN_IN,
              service: 'sync'
            }));

            assert.equal(sessionData.unwrapBKey, 'unwrapBKey');
            assert.equal(sessionData.keyFetchToken, 'keyFetchToken');
            // The following should only be set for Sync
            assert.equal(sessionData.customizeSync, true);
          });
      });

      it('non-Sync signIn signs a user in with email/password and does not request keys', function () {
        sinon.stub(realClient, 'signIn', function () {
          return p({});
        });

        relier.set('service', 'chronicle');
        assert.isFalse(relier.wantsKeys());
        // customizeSync should be ignored.
        return client.signIn(email, password, relier, { customizeSync: true })
          .then(function (sessionData) {
            assert.isTrue(realClient.signIn.calledWith(trim(email), password, {
              keys: false,
              reason: client.SIGNIN_REASON.SIGN_IN,
              service: 'chronicle'
            }));

            // These should not be returned by default
            assert.isFalse('unwrapBKey' in sessionData);
            assert.isFalse('keyFetchToken' in sessionData);
            // The following should only be set for Sync
            assert.isFalse('customizeSync' in sessionData);
          });
      });

      it('non-Sync signIn requests keys if the relier explicitly wants them', function () {
        sinon.stub(realClient, 'signIn', function () {
          return p({
            keyFetchToken: 'keyFetchToken',
            unwrapBKey: 'unwrapBKey'
          });
        });

        relier.set('service', 'chronicle');
        relier.set('keys', true);
        assert.isTrue(relier.wantsKeys());
        return client.signIn(email, password, relier, { customizeSync: true })
          .then(function (sessionData) {
            assert.isTrue(realClient.signIn.calledWith(trim(email), password, {
              keys: true,
              reason: client.SIGNIN_REASON.SIGN_IN,
              service: 'chronicle'
            }));

            assert.equal(sessionData.unwrapBKey, 'unwrapBKey');
            assert.equal(sessionData.keyFetchToken, 'keyFetchToken');
            // The following should only be set for Sync
            assert.isFalse('customizeSync' in sessionData);
          });
      });

      it('Sync signIn informs browser of customizeSync option', function () {
        sinon.stub(relier, 'isSync', function () {
          return true;
        });

        sinon.stub(relier, 'wantsKeys', function () {
          return true;
        });

        sinon.stub(realClient, 'signIn', function () {
          return p({});
        });

        return client.signIn(email, password, relier, { customizeSync: true })
          .then(function (result) {
            assert.isTrue(realClient.signIn.calledWith(trim(email), password, {
              keys: true,
              reason: client.SIGNIN_REASON.SIGN_IN,
              service: 'sync'
            }));

            assert.isTrue(result.customizeSync);
          });
      });

      it('passes along an optional `reason`', function () {
        sinon.stub(relier, 'wantsKeys', function () {
          return true;
        });

        sinon.stub(realClient, 'signIn', function () {
          return p({});
        });

        return client.signIn(email, password, relier, { reason: client.SIGNIN_REASON.PASSWORD_CHANGE })
          .then(function () {
            assert.isTrue(realClient.signIn.calledWith(trim(email), password, {
              keys: true,
              reason: client.SIGNIN_REASON.PASSWORD_CHANGE,
              service: 'sync'
            }));
          });
      });
    });

    describe('passwordReset', function () {
      it('requests a password reset', function () {
        sinon.stub(realClient, 'passwordForgotSendCode', function () {
          return p({
            passwordForgotToken: 'token'
          });
        });

        return client.passwordReset(email, relier, { resume: resumeToken })
          .then(function () {
            var params = {
              redirectTo: REDIRECT_TO,
              resume: resumeToken,
              service: SERVICE
            };
            assert.isTrue(
                realClient.passwordForgotSendCode.calledWith(
                    trim(email),
                    params
                ));
          });
      });
    });

    describe('passwordResetResend', function () {
      it('resends the validation email', function () {
        var passwordForgotToken = 'token';
        sinon.stub(realClient, 'passwordForgotSendCode', function () {
          return p({
            passwordForgotToken: passwordForgotToken
          });
        });

        sinon.stub(realClient, 'passwordForgotResendCode', function () {
          return p({});
        });

        return client.passwordReset(email, relier, { resume: resumeToken })
          .then(function () {
            return client.passwordResetResend(email, passwordForgotToken, relier, { resume: resumeToken });
          })
          .then(function () {
            var params = {
              redirectTo: REDIRECT_TO,
              resume: resumeToken,
              service: SERVICE
            };
            assert.isTrue(
                realClient.passwordForgotResendCode.calledWith(
                    trim(email),
                    passwordForgotToken,
                    params
                ));
          });
      });
    });

    describe('completePasswordReset', function () {
      it('completes the password reset', function () {
        var token = 'token';
        var code = 'code';

        sinon.stub(realClient, 'passwordForgotVerifyCode', function () {
          return p({
            accountResetToken: 'reset_token'
          });
        });

        sinon.stub(realClient, 'accountReset', function () {
          return p(true);
        });

        return client.completePasswordReset(email, password, token, code)
          .then(function () {
            assert.isTrue(realClient.passwordForgotVerifyCode.calledWith(
                code, token));
            assert.isTrue(realClient.accountReset.calledWith(
                trim(email), password));
          });
      });
    });

    describe('signOut', function () {
      it('signs the user out', function () {
        sinon.stub(realClient, 'sessionDestroy', function () {
          return p();
        });

        return client.signOut('session token')
          .then(function () {
            assert.isTrue(realClient.sessionDestroy.called);
          });
      });
    });

    describe('checkAccountExists', function () {
      it('returns true if an account exists', function () {
        sinon.stub(realClient, 'accountStatus', function () {
          return p({ exists: true });
        });

        return client.checkAccountExists('uid')
          .then(function (accountExists) {
            assert.isTrue(accountExists);
          });
      });

      it('returns false if an account does not exist', function () {
        sinon.stub(realClient, 'accountStatus', function () {
          return p({ exists: false });
        });

        return client.checkAccountExists('uid')
          .then(function (accountExists) {
            assert.isFalse(accountExists);
          });
      });

      it('throws other errors from the auth server', function () {
        sinon.stub(realClient, 'accountStatus', function () {
          return p.reject(new Error('missing uid'));
        });

        return client.checkAccountExists()
          .then(assert.fail, function (err) {
            assert.equal(err.message, 'missing uid');
          });
      });
    });

    describe('checkPassword', function () {
      it('returns error if password is incorrect', function () {
        email = trim(email);

        sinon.stub(realClient, 'signIn', function () {
          return p.reject(AuthErrors.toError('INCORRECT_PASSWORD'));
        });

        sinon.stub(realClient, 'sessionDestroy', sinon.spy());

        return client.checkPassword(email, password)
          .then(assert.fail, function (err) {
            assert.isTrue(AuthErrors.is(err, 'INCORRECT_PASSWORD'));
            assert.isTrue(realClient.signIn.calledWith(
              email,
              password,
              {
                reason: client.SIGNIN_REASON.PASSWORD_CHECK
              }
            ));
            assert.isFalse(realClient.sessionDestroy.called);
          });
      });

      it('succeeds if password is correct', function () {
        email = trim(email);

        sinon.stub(realClient, 'signIn', function () {
          return p({
            sessionToken: 'session token'
          });
        });

        sinon.stub(realClient, 'sessionDestroy', function () {
          return p();
        });

        return client.checkPassword(email, password)
          .then(function () {
            assert.isTrue(realClient.signIn.calledWith(
              email,
              password,
              {
                reason: client.SIGNIN_REASON.PASSWORD_CHECK
              }
            ));
            assert.isTrue(realClient.sessionDestroy.calledWith('session token'));
          });
      });
    });

    describe('changePassword', function () {
      it('changes the user\'s password', function () {
        sinon.stub(realClient, 'passwordChange', function () {
          return p();
        });

        return client.changePassword(email, password, 'new_password', relier)
          .then(function () {
            assert.isTrue(realClient.passwordChange.calledWith(
                    trim(email), password, 'new_password'));
          });
      });
    });

    describe('isPasswordResetComplete', function () {
      it('password status incomplete', function () {
        sinon.stub(realClient, 'passwordForgotStatus', function () {
          return p();
        });

        return client.isPasswordResetComplete('token')
          .then(function (complete) {
            // cache the token so it's not cleared after the password change
            assert.isFalse(complete);
          });
      });

      it('password status complete', function () {
        sinon.stub(realClient, 'passwordForgotStatus', function () {
          return p.reject(AuthErrors.toError('INVALID_TOKEN'));
        });

        return client.isPasswordResetComplete('token')
          .then(function (complete) {
            assert.isTrue(complete);
          });
      });

      it('throws other errors', function () {
        sinon.stub(realClient, 'passwordForgotStatus', function () {
          return p.reject(AuthErrors.toError('UNEXPECTED_ERROR'));
        });

        return client.isPasswordResetComplete('token')
          .then(assert.fail, function (err) {
            assert.isTrue(AuthErrors.is(err, 'UNEXPECTED_ERROR'));
          });
      });
    });

    describe('deleteAccount', function () {
      it('deletes the user\'s account', function () {
        sinon.stub(realClient, 'accountDestroy', function () {
          return p();
        });

        return client.deleteAccount(email, password)
          .then(null, function (err) {
            assert.isTrue(realClient.accountDestroy.calledWith(trim(email)));
            // this test is necessary because errors in deleteAccount
            // should not be propagated to the final done's error
            // handler
            throw new Error('unexpected failure: ' + err.message);
          });
      });
    });

    describe('sessionStatus', function () {
      it('checks sessionStatus', function () {
        sinon.stub(realClient, 'sessionStatus', function () {
          return p();
        });

        return client.sessionStatus('sessiontoken')
          .then(function () {
            assert.isTrue(realClient.sessionStatus.calledWith('sessiontoken'));
          });
      });
    });

    describe('certificateSign', function () {
      it('signs certificate', function () {
        var publicKey = {
          algorithm: 'RS',
          e: '65537',
          n: '47593859672356105035714943391967496145446066925677857909539347' +
             '68202714280652973091341316862993582789079872007974809511698859' +
             '885077002492642203267408776123'
        };
        var duration = 86400000;

        sinon.stub(realClient, 'certificateSign', function () {
          return p('cert_is_returned');
        });

        return client.certificateSign(publicKey, duration)
          .then(function (cert) {
            assert.ok(cert);
          });
      });
    });

    describe('isSignedIn', function () {
      it('resolves to false if no sessionToken passed in', function () {
        return client.isSignedIn()
            .then(function (isSignedIn) {
              assert.isFalse(isSignedIn);
            });
      });

      it('resolves to false if invalid sessionToken passed in', function () {
        sinon.stub(realClient, 'sessionStatus', function () {
          return p.reject(AuthErrors.toError('INVALID_TOKEN'));
        });

        return client.isSignedIn('not a real token')
            .then(function (isSignedIn) {
              assert.isFalse(isSignedIn);
            });
      });

      it('resolves to true with a valid sessionToken', function () {
        sinon.stub(realClient, 'sessionStatus', function () {
          return p({});
        });

        return client.isSignedIn('token')
          .then(function (isSignedIn) {
            assert.isTrue(isSignedIn);
          });
      });

      it('throws any other errors', function () {
        sinon.stub(realClient, 'sessionStatus', function () {
          return p.reject(AuthErrors.toError('UNEXPECTED_ERROR'));
        });

        return client.isSignedIn('token')
          .then(assert.fail, function (err) {
            assert.isTrue(AuthErrors.is(err, 'UNEXPECTED_ERROR'));
          });
      });
    });

    describe('getRandomBytes', function () {
      it('snags some entropy from somewhere', function () {
        sinon.stub(realClient, 'getRandomBytes', function () {
          return p('some random bytes');
        });

        return client.getRandomBytes()
            .then(function (bytes) {
              assert.ok(bytes);
              assert.isTrue(realClient.getRandomBytes.called);
            });
      });
    });

    describe('accountKeys', function () {
      it('fetches account keys on request', function () {
        sinon.stub(realClient, 'accountKeys', function () {
          return p({
            kA: 'kA',
            kB: 'kB'
          });
        });

        return client.accountKeys('keyFetchToken', 'unwrapBKey')
          .then(function (keys) {
            assert.isTrue(realClient.accountKeys.calledWith('keyFetchToken', 'unwrapBKey'));
            assert.equal(keys.kA, 'kA');
            assert.equal(keys.kB, 'kB');
          });
      });
    });

    describe('completeAccountUnlock', function () {
      it('resends an account unlock email', function () {
        sinon.stub(realClient, 'accountUnlockVerifyCode', function () {
          return p();
        });

        return client.completeAccountUnlock()
          .then(function () {
            assert.isTrue(realClient.accountUnlockVerifyCode.called);
          });
      });
    });

    describe('sendAccountUnlockEmail', function () {
      it('sends an account unlock email', function () {
        sinon.stub(realClient, 'accountUnlockResendCode', function () {
          return p();
        });

        return client.sendAccountUnlockEmail(
          'testuser@testuser.com',
          relier,
          {
            resume: 'resume token'
          }
        )
        .then(function () {
          assert.isTrue(realClient.accountUnlockResendCode.calledWith(
            'testuser@testuser.com',
            {
              redirectTo: relier.get('redirectTo'),
              resume: 'resume token',
              service: relier.get('service')
            }
          ));
        });
      });
    });

    describe('deviceList', function () {
      beforeEach(function () {
        sinon.stub(realClient, 'deviceList', function () {
          return p();
        });
        return client.deviceList('session token');
      });

      it('calls `deviceList` of the realClient', function () {
        assert.isTrue(realClient.deviceList.calledWith('session token'));
      });
    });

    describe('deviceDestroy', function () {
      beforeEach(function () {
        sinon.stub(realClient, 'deviceDestroy', function () {
          return p();
        });
        return client.deviceDestroy('session token', 'device id');
      });

      it('calls `deviceDestroy` of the realClient', function () {
        assert.isTrue(
          realClient.deviceDestroy.calledWith('session token', 'device id'));
      });
    });
  });
});

