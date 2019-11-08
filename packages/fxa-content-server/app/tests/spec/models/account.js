/* eslint-disable camelcase */
/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import Account from 'models/account';
import { assert } from 'chai';
import AuthErrors from 'lib/auth-errors';
import AttachedClient from 'models/attached-client';
import Constants from 'lib/constants';
import FxaClientWrapper from 'lib/fxa-client';
import OAuthClient from 'lib/oauth-client';
import OAuthToken from 'models/oauth-token';
import ProfileClient from 'lib/profile-client';
import ProfileErrors from 'lib/profile-errors';
import Relier from 'models/reliers/relier';
import ResumeToken from 'models/resume-token';
import SignInReasons from 'lib/sign-in-reasons';
import sinon from 'sinon';
import VerificationMethods from 'lib/verification-methods';
import VerificationReasons from 'lib/verification-reasons';

describe('models/account', function() {
  var account;
  var fxaClient;
  var metrics;
  let notifier;
  var sentryMetrics;
  var oAuthClient;
  var profileClient;
  var relier;
  var subscriptionsConfig;

  var CLIENT_ID = 'client_id';
  var EMAIL = 'user@example.domain';
  var PASSWORD = 'password';
  var PNG_URL =
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAAAAAA6fptVAAAACklEQVQYV2P4DwABAQEAWk1v8QAAAABJRU5ErkJggg==';
  var PROFILE_CLIENT_METHODS = ['getAvatar', 'deleteAvatar', 'uploadAvatar'];
  var SESSION_TOKEN = 'abc123';
  var UID = '6d940dd41e636cc156074109b8092f96';
  var URL = 'http://127.0.0.1:1112/avatar/example.jpg';

  beforeEach(function() {
    fxaClient = new FxaClientWrapper();
    metrics = {
      getFlowEventMetadata() {
        return {
          baz: 'qux',
          foo: 'bar',
        };
      },
      logEvent() {
        return {};
      },
    };
    notifier = {
      trigger: sinon.spy(),
    };
    sentryMetrics = {
      captureException(e) {
        return e;
      },
    };
    oAuthClient = new OAuthClient();
    profileClient = new ProfileClient();
    relier = new Relier();
    subscriptionsConfig = {
      managementClientId: 'foxkeh',
      managementScopes: 'quux',
    };

    account = new Account(
      {
        email: EMAIL,
        uid: UID,
      },
      {
        fxaClient: fxaClient,
        metrics: metrics,
        notifier,
        oAuthClient: oAuthClient,
        oAuthClientId: CLIENT_ID,
        profileClient: profileClient,
        sentryMetrics: sentryMetrics,
        subscriptionsConfig,
      }
    );
  });

  afterEach(function() {
    account = null;
  });

  it('emits set-email-domain event correctly', () => {
    assert.equal(notifier.trigger.callCount, 1);
    const args = notifier.trigger.args[0];
    assert.lengthOf(args, 2);
    assert.equal(args[0], 'set-email-domain');
    assert.equal(args[1], EMAIL);
  });

  describe('create w/ sessionTokenContext & accessToken, no sessionToken', () => {
    it('clears sessionTokenContext, accessToken', () => {
      // We got into a bad place where some users did not have sessionTokens
      // but had sessionTokenContext and were unable to sign in using the
      // email-first flow. If the user is in this state, forcibly remove
      // the sessionTokenContext and accessToken
      // See #999
      const badAccount = new Account({
        accessToken: 'access token',
        sessionTokenContext: 'context',
      });
      assert.isFalse(badAccount.has('accessToken'));
      assert.isFalse(badAccount.has('sessionToken'));
      assert.isFalse(badAccount.has('sessionTokenContext'));
    });
  });

  describe('set', function() {
    describe('`password` field on an object', function() {
      it('is not allowed', function() {
        assert.throws(function() {
          account.set({
            password: PASSWORD,
          });
        });
      });
    });

    describe('`password` attribute', function() {
      it('is not allowed', function() {
        assert.throws(function() {
          account.set('password', PASSWORD);
        });
      });
    });

    describe('all other attributes', function() {
      it('is allowed', function() {
        account.set('email', EMAIL);
        account.set({
          displayName: 'name',
        });
      });
    });
  });

  describe('unset', () => {
    describe('sessionToken', () => {
      it('also removes accessToken and sessionTokenContext', () => {
        account.set({
          accessToken: 'access token',
          sessionToken: 'session token',
          sessionTokenContext: 'session token context',
        });

        account.unset('sessionToken');
        assert.isFalse(account.has('accessToken'));
        assert.isFalse(account.has('sessionTokenContext'));
      });
    });
  });

  describe('fetch', function() {
    it('does not fetch without a sessionToken', function() {
      return account.fetch().then(function() {
        assert.isUndefined(account.get('verified'));
        assert.isUndefined(account.get('accessToken'));
        assert.isUndefined(account.get('sessionToken'));
      });
    });

    it('sets verified state', function() {
      account.set('sessionToken', SESSION_TOKEN);
      sinon.stub(fxaClient, 'recoveryEmailStatus').callsFake(function() {
        return Promise.resolve({ verified: true });
      });

      return account.fetch().then(function() {
        assert.isTrue(account.get('verified'), 'verified');
      });
    });

    it('fails to set verified state with error', function() {
      account.set('sessionToken', SESSION_TOKEN);
      sinon.stub(fxaClient, 'recoveryEmailStatus').callsFake(function() {
        return Promise.reject(AuthErrors.toError('UNKNOWN_ACCOUNT'));
      });
      return account.fetch().then(function() {
        assert.isTrue(fxaClient.recoveryEmailStatus.calledWith(SESSION_TOKEN));
        assert.isUndefined(account.get('verified'));
      });
    });

    it('fails to fetch with other errors', function() {
      account.set('sessionToken', SESSION_TOKEN);
      sinon.stub(fxaClient, 'recoveryEmailStatus').callsFake(function() {
        return Promise.reject(AuthErrors.toError('UNKNOWN_ACCOUNT'));
      });
      return account.fetch().then(function() {
        assert.isUndefined(account.get('verified'));
      });
    });

    it('reports uncaught errors', () => {
      const errorMsg = 'Something went wrong!';
      account.set({
        accessToken: 'access token',
        sessionToken: SESSION_TOKEN,
      });
      sinon.spy(account._sentryMetrics, 'captureException');
      sinon.stub(account, 'sessionStatus').callsFake(() => {
        return Promise.reject(new Error(errorMsg));
      });

      return account.fetch().then(() => {
        assert.isTrue(account._sentryMetrics.captureException.called);
        assert.equal(
          account._sentryMetrics.captureException.args[0][0].message,
          errorMsg
        );
      });
    });

    it('does not report report UNAUTHORIZED errors', () => {
      account.set({
        accessToken: 'access token',
        sessionToken: SESSION_TOKEN,
      });

      sinon.spy(account._sentryMetrics, 'captureException');
      sinon.stub(account, 'sessionStatus').callsFake(() => {
        return Promise.reject(AuthErrors.toError('UNAUTHORIZED'));
      });

      return account.fetch().then(() => {
        assert.isFalse(account._sentryMetrics.captureException.called);
      });
    });

    describe('with an invalid sessionToken', function() {
      beforeEach(function() {
        account.set({
          accessToken: 'access token',
          sessionToken: SESSION_TOKEN,
          sessionTokenContext: Constants.SYNC_SERVICE,
        });

        sinon.stub(fxaClient, 'recoveryEmailStatus').callsFake(function() {
          return Promise.reject(AuthErrors.toError('INVALID_TOKEN'));
        });

        return account.fetch();
      });

      it('invalidates the session and access tokens', function() {
        assert.isFalse(account.has('accessToken'));
        assert.isFalse(account.has('sessionToken'));
        assert.isFalse(account.has('sessionTokenContext'));
      });
    });
  });

  describe('sessionStatus', function() {
    describe('account does not have a sessionToken', function() {
      var err;

      beforeEach(function() {
        account.unset('sessionToken');
        return account.sessionStatus().then(assert.fail, function(_err) {
          err = _err;
        });
      });

      it('rejects with INVALID_TOKEN', function() {
        assert.isTrue(AuthErrors.is(err, 'INVALID_TOKEN'));
      });
    });

    describe('account has a valid sessionToken', () => {
      let resp;
      const CANONICAL_EMAIL = 'testuser@testuser.com';

      beforeEach(() => {
        account.set({
          email: CANONICAL_EMAIL.toUpperCase(),
          sessionToken: 'session token',
          sessionTokenContext: 'foo',
        });

        sinon.stub(fxaClient, 'recoveryEmailStatus').callsFake(() =>
          Promise.resolve({
            email: CANONICAL_EMAIL,
            verified: true,
          })
        );

        return account.sessionStatus().then(_resp => {
          resp = _resp;
        });
      });

      it('resolves with the session information, updates the model', () => {
        assert.deepEqual(resp, { email: CANONICAL_EMAIL, verified: true });
        assert.equal(account.get('email'), CANONICAL_EMAIL);
        assert.isTrue(account.get('verified'));
        assert.equal(account.get('sessionToken'), 'session token');
        assert.equal(account.get('sessionTokenContext'), 'foo');
      });
    });

    describe('account has an invalid sessionToken', () => {
      let error;

      beforeEach(() => {
        account.set({
          accessToken: 'access token',
          email: 'testuser@testuser.com',
          sessionToken: 'session token',
          sessionTokenContext: 'foo',
          verified: true,
        });

        sinon
          .stub(fxaClient, 'recoveryEmailStatus')
          .callsFake(() => Promise.reject(AuthErrors.toError('INVALID_TOKEN')));

        return account.sessionStatus().then(assert.fail, _err => {
          error = _err;
        });
      });

      it('Removes accessToken, sessionToken, sessionTokenContext, updates the model', () => {
        assert.isTrue(AuthErrors.is(error, 'INVALID_TOKEN'));

        assert.equal(account.get('email'), 'testuser@testuser.com');
        assert.isTrue(account.get('verified'));
        assert.isFalse(account.has('accessToken'));
        assert.isFalse(account.has('sessionToken'));
        assert.isFalse(account.has('sessionTokenContext'));
      });
    });
  });

  describe('sessionVerificationStatus', () => {
    describe('account does not have a sessionToken', function() {
      var err;

      beforeEach(function() {
        account.unset('sessionToken');
        return account.sessionStatus().then(assert.fail, function(_err) {
          err = _err;
        });
      });

      it('rejects with INVALID_TOKEN', function() {
        assert.isTrue(AuthErrors.is(err, 'INVALID_TOKEN'));
      });
    });

    describe('account has a valid sessionToken', () => {
      let resp;

      beforeEach(() => {
        account.set({
          email: 'testuser@testuser.com',
          sessionToken: 'session token',
          sessionTokenContext: 'foo',
          verified: true,
        });

        sinon.stub(fxaClient, 'sessionVerificationStatus').callsFake(() =>
          Promise.resolve({
            email: 'TESTUSER@TESTUSER.com',
            emailVerified: true,
            sessionVerified: true,
            verified: true,
          })
        );

        return account.sessionVerificationStatus().then(_resp => {
          resp = _resp;
        });
      });

      it('resolves with the session information, does not update the model', () => {
        assert.deepEqual(resp, {
          email: 'TESTUSER@TESTUSER.com',
          emailVerified: true,
          sessionVerified: true,
          verified: true,
        });

        assert.equal(account.get('email'), 'testuser@testuser.com');
        assert.equal(account.get('sessionToken'), 'session token');
        assert.equal(account.get('sessionTokenContext'), 'foo');
        assert.isTrue(account.get('verified'));
      });
    });

    describe('account has an invalid sessionToken', () => {
      let error;

      beforeEach(() => {
        account.set({
          accessToken: 'access token',
          email: 'testuser@testuser.com',
          sessionToken: 'session token',
          sessionTokenContext: 'foo',
          verified: true,
        });

        sinon
          .stub(fxaClient, 'sessionVerificationStatus')
          .callsFake(() => Promise.reject(AuthErrors.toError('INVALID_TOKEN')));

        return account.sessionVerificationStatus().then(assert.fail, _err => {
          error = _err;
        });
      });

      it('Removes accessToken, sessionToken, sessionTokenContext, updates the model', () => {
        assert.isTrue(AuthErrors.is(error, 'INVALID_TOKEN'));
        assert.equal(account.get('email'), 'testuser@testuser.com');
        assert.isTrue(account.get('verified'));

        assert.isFalse(account.has('accessToken'));
        assert.isFalse(account.has('sessionToken'));
        assert.isFalse(account.has('sessionTokenContext'));
      });
    });
  });

  describe('signIn', () => {
    beforeEach(() => {
      notifier.trigger.resetHistory();
    });

    describe('with a password and no sessionToken', () => {
      describe('unverified, reason === undefined', () => {
        beforeEach(() => {
          sinon.stub(fxaClient, 'signIn').callsFake(() => {
            return Promise.resolve({
              sessionToken: SESSION_TOKEN,
              uid: UID,
              verificationMethod: VerificationMethods.EMAIL,
              verificationReason: VerificationReasons.SIGN_UP,
              verified: false,
            });
          });

          sinon.stub(fxaClient, 'signUpResend').callsFake(() => {
            return Promise.resolve();
          });

          return account.signIn(PASSWORD, relier, {
            resume: 'resume token',
            unblockCode: 'unblock code',
          });
        });

        it('delegates to the fxaClient', () => {
          assert.isTrue(
            fxaClient.signIn.calledWith(EMAIL, PASSWORD, relier, {
              metricsContext: {
                baz: 'qux',
                foo: 'bar',
              },
              reason: SignInReasons.SIGN_IN,
              resume: 'resume token',
              skipCaseError: true,
              unblockCode: 'unblock code',
            })
          );
        });

        it('does not resend a signUp email', () => {
          assert.isFalse(fxaClient.signUpResend.called);
        });

        it('updates the account with the returned data', () => {
          assert.isFalse(account.get('verified'));
          assert.equal(account.get('sessionToken'), SESSION_TOKEN);
          assert.equal(account.get('uid'), UID);
        });

        it('emits set-uid event correctly', () => {
          assert.equal(notifier.trigger.callCount, 1);
          const args = notifier.trigger.args[0];
          assert.lengthOf(args, 2);
          assert.equal(args[0], 'set-uid');
          assert.equal(args[1], UID);
        });
      });

      describe('verified account, unverified session', () => {
        beforeEach(() => {
          sinon.stub(fxaClient, 'signIn').callsFake(() => {
            return Promise.resolve({
              sessionToken: SESSION_TOKEN,
              verificationMethod: VerificationMethods.EMAIL,
              verificationReason: VerificationReasons.SIGN_IN,
              verified: false,
            });
          });

          sinon.stub(fxaClient, 'signUpResend').callsFake(() => {
            return Promise.resolve();
          });

          return account.signIn(PASSWORD, relier, { resume: 'resume token' });
        });

        it('delegates to the fxaClient', () => {
          assert.isTrue(fxaClient.signIn.calledWith(EMAIL, PASSWORD, relier));
        });

        it('does not delegate to the fxaClient to send re-confirmation email', () => {
          assert.isFalse(fxaClient.signUpResend.called);
        });

        it('updates the account with the returned data', () => {
          assert.equal(
            account.get('verificationMethod'),
            VerificationMethods.EMAIL
          );
          assert.equal(
            account.get('verificationReason'),
            VerificationReasons.SIGN_IN
          );
          assert.equal(account.get('sessionToken'), SESSION_TOKEN);
          assert.isFalse(account.get('verified'));
          assert.equal(account.get('uid'), UID);
        });

        it('emits set-uid event correctly', () => {
          assert.equal(notifier.trigger.callCount, 1);
          const args = notifier.trigger.args[0];
          assert.lengthOf(args, 2);
          assert.equal(args[0], 'set-uid');
          assert.equal(args[1], UID);
        });
      });

      describe('verified account, verified session', () => {
        beforeEach(() => {
          sinon.stub(fxaClient, 'signIn').callsFake(() => {
            return Promise.resolve({
              sessionToken: SESSION_TOKEN,
              verified: true,
            });
          });

          return account.signIn(PASSWORD, relier, {
            resume: 'resume token',
            unblockCode: 'unblock code',
          });
        });

        it('delegates to the fxaClient', () => {
          assert.isTrue(
            fxaClient.signIn.calledWith(EMAIL, PASSWORD, relier, {
              metricsContext: {
                baz: 'qux',
                foo: 'bar',
              },
              reason: SignInReasons.SIGN_IN,
              resume: 'resume token',
              skipCaseError: true,
              unblockCode: 'unblock code',
            })
          );
        });

        it('updates the account with the returned data', () => {
          assert.isTrue(account.get('verified'));
          assert.equal(account.get('sessionToken'), SESSION_TOKEN);
          assert.equal(account.get('uid'), UID);
        });

        it('emits set-uid event correctly', () => {
          assert.equal(notifier.trigger.callCount, 1);
          const args = notifier.trigger.args[0];
          assert.lengthOf(args, 2);
          assert.equal(args[0], 'set-uid');
          assert.equal(args[1], UID);
        });
      });

      describe('INCORRECT_EMAIL_CASE', () => {
        let upperCaseEmail;

        beforeEach(() => {
          upperCaseEmail = EMAIL.toUpperCase();

          sinon.stub(fxaClient, 'signIn').callsFake(() => {
            if (fxaClient.signIn.callCount === 1) {
              const err = AuthErrors.toError('INCORRECT_EMAIL_CASE');
              err.email = EMAIL;
              return Promise.reject(err);
            } else {
              return Promise.resolve({});
            }
          });

          account.set('email', upperCaseEmail);
          return account.signIn(PASSWORD, relier, {
            resume: 'resume token',
            unblockCode: 'unblock code',
          });
        });

        it('re-tries with the normalized email, updates model with normalized email', () => {
          const firstExpectedOptions = {
            metricsContext: {
              baz: 'qux',
              foo: 'bar',
            },
            reason: SignInReasons.SIGN_IN,
            resume: 'resume token',
            skipCaseError: true,
            unblockCode: 'unblock code',
          };

          const secondExpectedOptions = {
            metricsContext: {
              baz: 'qux',
              foo: 'bar',
            },
            originalLoginEmail: upperCaseEmail,
            reason: SignInReasons.SIGN_IN,
            resume: 'resume token',
            skipCaseError: true,
            unblockCode: 'unblock code',
          };

          assert.equal(fxaClient.signIn.callCount, 2);
          assert.isTrue(
            fxaClient.signIn.calledWith(
              upperCaseEmail,
              PASSWORD,
              relier,
              firstExpectedOptions
            )
          );
          assert.isTrue(
            fxaClient.signIn.calledWith(
              EMAIL,
              PASSWORD,
              relier,
              secondExpectedOptions
            )
          );

          assert.equal(account.get('email'), EMAIL);
          assert.equal(account.get('originalLoginEmail'), upperCaseEmail);
        });
      });

      ['REQUEST_BLOCKED', 'THROTTLED'].forEach(errorName => {
        describe(errorName, () => {
          const primaryEmail = 'primaryEmail@email.com';
          const oldPrimaryEmail = EMAIL;

          beforeEach(() => {
            sinon.stub(fxaClient, 'signIn').callsFake(() => {
              if (fxaClient.signIn.callCount === 1) {
                const err = AuthErrors.toError('INCORRECT_EMAIL_CASE');
                err.email = oldPrimaryEmail;
                return Promise.reject(err);
              } else if (fxaClient.signIn.callCount === 2) {
                const err = AuthErrors.toError(errorName);
                return Promise.reject(err);
              } else {
                return Promise.resolve({});
              }
            });

            account.set('email', primaryEmail);
            return account
              .signIn(PASSWORD, relier, {
                unblockCode: 'unblock code',
              })
              .then(assert.fail, err => {
                assert.isTrue(AuthErrors.is(err, errorName));
              });
          });

          it('re-tries login and restores email to primary email address', () => {
            assert.equal(fxaClient.signIn.callCount, 2);
            let args = fxaClient.signIn.args[0];
            assert.equal(
              args[0],
              primaryEmail,
              'sign-in first called with primary email'
            );
            args = fxaClient.signIn.args[1];
            assert.equal(
              args[0],
              oldPrimaryEmail,
              'sign-in then called with old primary email'
            );
            assert.equal(
              account.get('email'),
              primaryEmail,
              'primary email restored'
            );
          });
        });
      });

      describe('error', () => {
        let err;

        beforeEach(() => {
          sinon.stub(fxaClient, 'signIn').callsFake(() => {
            return Promise.reject(AuthErrors.toError('UNKNOWN_ACCOUNT'));
          });

          return account.signIn(PASSWORD, relier).then(assert.fail, _err => {
            err = _err;
          });
        });

        it('delegates to the fxaClient', () => {
          assert.isTrue(fxaClient.signIn.calledWith(EMAIL, PASSWORD, relier));
        });

        it('propagates the error', () => {
          assert.isTrue(AuthErrors.is(err, 'UNKNOWN_ACCOUNT'));
        });

        it('does not emit set-uid event', () => {
          assert.equal(notifier.trigger.callCount, 0);
        });
      });
    });

    describe('with a password and a sessionToken', () => {
      beforeEach(() => {
        account.set('sessionToken', SESSION_TOKEN);
      });

      describe('unverified, reason === undefined', () => {
        beforeEach(() => {
          sinon.stub(fxaClient, 'sessionReauth').callsFake(() => {
            return Promise.resolve({
              uid: UID,
              verificationMethod: VerificationMethods.EMAIL,
              verificationReason: VerificationReasons.SIGN_UP,
              verified: false,
            });
          });

          sinon.stub(fxaClient, 'signIn').callsFake(() => {
            return Promise.resolve({});
          });

          return account.signIn(PASSWORD, relier, {
            resume: 'resume token',
            unblockCode: 'unblock code',
          });
        });

        it('delegates to fxaClient.sessionReauth', () => {
          assert.isTrue(
            fxaClient.sessionReauth.calledWith(
              SESSION_TOKEN,
              EMAIL,
              PASSWORD,
              relier,
              {
                metricsContext: {
                  baz: 'qux',
                  foo: 'bar',
                },
                reason: SignInReasons.SIGN_IN,
                resume: 'resume token',
                skipCaseError: true,
                unblockCode: 'unblock code',
              }
            )
          );
        });

        it('does not call fxaClient.signIn', () => {
          assert.isFalse(fxaClient.signIn.called);
        });

        it('updates the account with the returned data', () => {
          assert.isFalse(account.get('verified'));
          assert.equal(account.get('sessionToken'), SESSION_TOKEN);
          assert.equal(account.get('uid'), UID);
        });

        it('emits set-uid event correctly', () => {
          assert.equal(notifier.trigger.callCount, 1);
          const args = notifier.trigger.args[0];
          assert.lengthOf(args, 2);
          assert.equal(args[0], 'set-uid');
          assert.equal(args[1], UID);
        });
      });

      describe('verified account, unverified session', () => {
        beforeEach(() => {
          sinon.stub(fxaClient, 'sessionReauth').callsFake(() => {
            return Promise.resolve({
              verificationMethod: VerificationMethods.EMAIL,
              verificationReason: VerificationReasons.SIGN_IN,
              verified: false,
            });
          });

          sinon.stub(fxaClient, 'signIn').callsFake(() => {
            return Promise.resolve({});
          });

          return account.signIn(PASSWORD, relier, { resume: 'resume token' });
        });

        it('delegates to the fxaClient.sessionReauth', () => {
          assert.isTrue(
            fxaClient.sessionReauth.calledWith(
              SESSION_TOKEN,
              EMAIL,
              PASSWORD,
              relier
            )
          );
        });

        it('does not call fxaClient.signIn', () => {
          assert.isFalse(fxaClient.signIn.called);
        });

        it('updates the account with the returned data', () => {
          assert.equal(
            account.get('verificationMethod'),
            VerificationMethods.EMAIL
          );
          assert.equal(
            account.get('verificationReason'),
            VerificationReasons.SIGN_IN
          );
          assert.equal(account.get('sessionToken'), SESSION_TOKEN);
          assert.isFalse(account.get('verified'));
          assert.equal(account.get('uid'), UID);
        });

        it('emits set-uid event correctly', () => {
          assert.equal(notifier.trigger.callCount, 1);
          const args = notifier.trigger.args[0];
          assert.lengthOf(args, 2);
          assert.equal(args[0], 'set-uid');
          assert.equal(args[1], UID);
        });
      });

      describe('verified account, verified session', () => {
        beforeEach(() => {
          sinon.stub(fxaClient, 'sessionReauth').callsFake(() => {
            return Promise.resolve({ verified: true });
          });

          sinon.stub(fxaClient, 'signIn').callsFake(() => {
            return Promise.resolve({});
          });

          return account.signIn(PASSWORD, relier, {
            resume: 'resume token',
            unblockCode: 'unblock code',
          });
        });

        it('delegates to the fxaClient', () => {
          assert.isTrue(
            fxaClient.sessionReauth.calledWith(
              SESSION_TOKEN,
              EMAIL,
              PASSWORD,
              relier,
              {
                metricsContext: {
                  baz: 'qux',
                  foo: 'bar',
                },
                reason: SignInReasons.SIGN_IN,
                resume: 'resume token',
                skipCaseError: true,
                unblockCode: 'unblock code',
              }
            )
          );
        });

        it('does not call fxaClient.signIn', () => {
          assert.isFalse(fxaClient.signIn.called);
        });

        it('updates the account with the returned data', () => {
          assert.isTrue(account.get('verified'));
          assert.equal(account.get('sessionToken'), SESSION_TOKEN);
          assert.equal(account.get('uid'), UID);
        });

        it('emits set-uid event correctly', () => {
          assert.equal(notifier.trigger.callCount, 1);
          const args = notifier.trigger.args[0];
          assert.lengthOf(args, 2);
          assert.equal(args[0], 'set-uid');
          assert.equal(args[1], UID);
        });
      });

      describe('INCORRECT_EMAIL_CASE', () => {
        let upperCaseEmail;

        beforeEach(() => {
          upperCaseEmail = EMAIL.toUpperCase();

          sinon.stub(fxaClient, 'sessionReauth').callsFake(() => {
            if (fxaClient.sessionReauth.callCount === 1) {
              const err = AuthErrors.toError('INCORRECT_EMAIL_CASE');
              err.email = EMAIL;
              return Promise.reject(err);
            } else {
              return Promise.resolve({});
            }
          });

          account.set('email', upperCaseEmail);
          return account.signIn(PASSWORD, relier, {
            resume: 'resume token',
            unblockCode: 'unblock code',
          });
        });

        it('re-tries with the normalized email, updates model with normalized email', () => {
          const firstExpectedOptions = {
            metricsContext: {
              baz: 'qux',
              foo: 'bar',
            },
            reason: SignInReasons.SIGN_IN,
            resume: 'resume token',
            skipCaseError: true,
            unblockCode: 'unblock code',
          };

          const secondExpectedOptions = {
            metricsContext: {
              baz: 'qux',
              foo: 'bar',
            },
            originalLoginEmail: upperCaseEmail,
            reason: SignInReasons.SIGN_IN,
            resume: 'resume token',
            skipCaseError: true,
            unblockCode: 'unblock code',
          };

          assert.equal(fxaClient.sessionReauth.callCount, 2);
          assert.isTrue(
            fxaClient.sessionReauth.calledWith(
              SESSION_TOKEN,
              upperCaseEmail,
              PASSWORD,
              relier,
              firstExpectedOptions
            )
          );
          assert.isTrue(
            fxaClient.sessionReauth.calledWith(
              SESSION_TOKEN,
              EMAIL,
              PASSWORD,
              relier,
              secondExpectedOptions
            )
          );

          assert.equal(account.get('email'), EMAIL);
        });
      });

      describe('invalid session', () => {
        const NEW_SESSION_TOKEN = 'new session token';

        beforeEach(() => {
          sinon.stub(fxaClient, 'sessionReauth').callsFake(() => {
            return Promise.reject(AuthErrors.toError('INVALID_TOKEN'));
          });

          sinon.stub(fxaClient, 'signIn').callsFake(() => {
            return Promise.resolve({
              sessionToken: NEW_SESSION_TOKEN,
              verified: true,
            });
          });

          sinon.stub(account, 'discardSessionToken');
          return account.signIn(PASSWORD, relier);
        });

        it('delegates to the fxaClient', () => {
          assert.isTrue(
            fxaClient.sessionReauth.calledWith(
              SESSION_TOKEN,
              EMAIL,
              PASSWORD,
              relier
            )
          );
        });

        it('invalidates the stored session', () => {
          assert.isTrue(account.discardSessionToken.called);
        });

        it('does a fresh login to get a new session token', () => {
          assert.isTrue(fxaClient.signIn.calledWith(EMAIL, PASSWORD, relier));
        });

        it('updates the account with the new session data', () => {
          assert.isTrue(account.get('verified'));
          assert.equal(account.get('sessionToken'), NEW_SESSION_TOKEN);
          assert.equal(account.get('uid'), UID);
        });

        it('emits set-uid event correctly', () => {
          assert.equal(notifier.trigger.callCount, 1);
          const args = notifier.trigger.args[0];
          assert.lengthOf(args, 2);
          assert.equal(args[0], 'set-uid');
          assert.equal(args[1], UID);
        });
      });

      describe('error', () => {
        let err;

        beforeEach(() => {
          sinon.stub(fxaClient, 'sessionReauth').callsFake(() => {
            return Promise.reject(AuthErrors.toError('UNEXPECTED_ERROR'));
          });

          sinon.stub(fxaClient, 'signIn').callsFake(() => {
            return Promise.resolve({});
          });

          return account.signIn(PASSWORD, relier).then(assert.fail, _err => {
            err = _err;
          });
        });

        it('delegates to the fxaClient', () => {
          assert.isTrue(
            fxaClient.sessionReauth.calledWith(
              SESSION_TOKEN,
              EMAIL,
              PASSWORD,
              relier
            )
          );
        });

        it('propagates the error', () => {
          assert.isTrue(AuthErrors.is(err, 'UNEXPECTED_ERROR'));
        });

        it('does not call fxaClient.signIn', () => {
          assert.equal(fxaClient.signIn.callCount, 0);
        });

        it('does not emit set-uid event', () => {
          assert.equal(notifier.trigger.callCount, 0);
        });
      });
    });

    describe('with a sessionToken and no password', function() {
      describe('unverified', function() {
        beforeEach(function() {
          account.set('sessionToken', SESSION_TOKEN);

          sinon.stub(fxaClient, 'recoveryEmailStatus').callsFake(function() {
            return Promise.resolve({
              verificationMethod: VerificationMethods.EMAIL,
              verificationReason: VerificationReasons.SIGN_IN,
              verified: false,
            });
          });

          sinon.stub(fxaClient, 'signUpResend').callsFake(function() {
            return Promise.resolve();
          });

          return account.signIn(null, relier);
        });

        it('delegates to the fxaClient', function() {
          assert.isTrue(
            fxaClient.recoveryEmailStatus.calledWith(SESSION_TOKEN)
          );
        });

        it('does not resend a signUp email', function() {
          assert.isFalse(fxaClient.signUpResend.called);
        });

        it('updates the account with the returned data', function() {
          assert.isFalse(account.get('verified'));
          assert.equal(account.get('sessionToken'), SESSION_TOKEN);
          assert.equal(
            account.get('verificationReason'),
            VerificationReasons.SIGN_IN
          );
          assert.equal(
            account.get('verificationMethod'),
            VerificationMethods.EMAIL
          );
        });
      });

      describe('verified', function() {
        beforeEach(function() {
          account.set('sessionToken', SESSION_TOKEN);
          sinon.stub(fxaClient, 'recoveryEmailStatus').callsFake(function() {
            return Promise.resolve({ verified: true });
          });

          return account.signIn(null, relier);
        });

        it('delegates to the fxaClient', function() {
          assert.isTrue(
            fxaClient.recoveryEmailStatus.calledWith(SESSION_TOKEN)
          );
        });

        it('updates the account with the returned data', function() {
          assert.isTrue(account.get('verified'));
        });
      });

      describe('error', function() {
        var err;

        beforeEach(function() {
          account.set('sessionToken', SESSION_TOKEN);
          sinon.stub(fxaClient, 'recoveryEmailStatus').callsFake(function() {
            return Promise.reject(AuthErrors.toError('UNKNOWN_ACCOUNT'));
          });

          return account.signIn(null, relier).then(assert.fail, function(_err) {
            err = _err;
          });
        });

        it('delegates to the fxaClient', function() {
          assert.isTrue(
            fxaClient.recoveryEmailStatus.calledWith(SESSION_TOKEN)
          );
        });

        it('propagates the error', function() {
          assert.isTrue(AuthErrors.is(err, 'UNKNOWN_ACCOUNT'));
        });
      });

      describe('neither password nor sessionToken', function() {
        var err;

        beforeEach(function() {
          account.unset('sessionToken');

          return account.signIn(null, relier).then(assert.fail, function(_err) {
            err = _err;
          });
        });

        it('throws an `UNEXPECTED_ERROR`', function() {
          assert.isTrue(AuthErrors.is(err, 'UNEXPECTED_ERROR'));
        });
      });
    });
  });

  describe('signUp', function() {
    beforeEach(function() {
      account.set('needsOptedInToMarketingEmail', true);
      sinon.stub(fxaClient, 'signUp').callsFake(function() {
        return Promise.resolve({
          sessionToken: SESSION_TOKEN,
          verified: false,
        });
      });

      return account.signUp(PASSWORD, relier, { resume: 'resume token' });
    });

    it('delegates to the fxaClient', function() {
      assert.isTrue(
        fxaClient.signUp.calledWith(EMAIL, PASSWORD, relier, {
          metricsContext: {
            baz: 'qux',
            foo: 'bar',
          },
          resume: 'resume token',
          verificationMethod: undefined,
        })
      );
    });

    it('updates the account with the returned data', function() {
      assert.isFalse(account.get('verified'));
      assert.equal(account.get('sessionToken'), SESSION_TOKEN);
    });
  });

  describe('retrySignUp', function() {
    beforeEach(function() {
      account.set('sessionToken', SESSION_TOKEN);
      sinon.stub(fxaClient, 'signUpResend').callsFake(function() {
        return Promise.resolve();
      });

      return account.retrySignUp(relier, { resume: 'resume token' });
    });

    it('delegates to the fxaClient', function() {
      assert.isTrue(
        fxaClient.signUpResend.calledWith(relier, SESSION_TOKEN, {
          resume: 'resume token',
        })
      );
    });
  });

  describe('verifySignUp', function() {
    beforeEach(() => {
      notifier.trigger.resetHistory();
    });

    describe('without email opt-in', function() {
      beforeEach(function() {
        sinon.stub(fxaClient, 'verifyCode').callsFake(function() {
          return Promise.resolve();
        });

        account.set('uid', UID);
        return account.verifySignUp('CODE');
      });

      it('delegates to the fxaClient', function() {
        const options = sinon.match({
          marketingOptIn: sinon.match.typeOf('undefined'),
        });
        assert.isTrue(fxaClient.verifyCode.calledWith(UID, 'CODE', options));
      });

      it('did not call notifier.trigger', () => {
        assert.equal(notifier.trigger.callCount, 0);
      });
    });

    describe('with email opt-in', function() {
      beforeEach(function() {
        sinon.stub(fxaClient, 'verifyCode').callsFake(function() {
          return Promise.resolve();
        });

        account.set({
          needsOptedInToMarketingEmail: true,
          uid: UID,
        });

        return account.verifySignUp('CODE');
      });

      it('delegates to the fxaClient', function() {
        const options = sinon.match.has('marketingOptIn', true);
        assert.isTrue(fxaClient.verifyCode.calledWith(UID, 'CODE', options));
      });

      it('called notifier.trigger correctly', () => {
        assert.equal(notifier.trigger.callCount, 2);

        let args = notifier.trigger.args[0];
        assert.lengthOf(args, 1);
        assert.equal(args[0], 'flow.initialize');

        args = notifier.trigger.args[1];
        assert.lengthOf(args, 2);
        assert.equal(args[0], 'flow.event');
        assert.deepEqual(args[1], { event: 'newsletter.subscribed' });
      });
    });
  });

  describe('signOut', () => {
    beforeEach(() => {
      notifier.trigger.resetHistory();
      sinon
        .stub(fxaClient, 'sessionDestroy')
        .callsFake(() => Promise.resolve());

      account.set('sessionToken', SESSION_TOKEN);

      return account.signOut();
    });

    it('calls the correct fxaClient method', () => {
      assert.isTrue(fxaClient.sessionDestroy.calledOnce);
      assert.isTrue(fxaClient.sessionDestroy.calledWith(SESSION_TOKEN));
    });

    it('emits clear-uid event correctly', () => {
      assert.equal(notifier.trigger.callCount, 1);
      const args = notifier.trigger.args[0];
      assert.lengthOf(args, 1);
      assert.equal(args[0], 'clear-uid');
    });
  });

  describe('destroy', function() {
    beforeEach(function() {
      notifier.trigger.resetHistory();
      sinon.stub(fxaClient, 'deleteAccount').callsFake(function() {
        return Promise.resolve();
      });

      sinon.spy(account, 'trigger');

      account.set({
        email: EMAIL,
      });

      return account.destroy(PASSWORD);
    });

    it('delegates to the fxaClient method', function() {
      assert.isTrue(fxaClient.deleteAccount.calledWith(EMAIL, PASSWORD));
    });

    it('triggers a `destroy` message when complete', function() {
      assert.isTrue(account.trigger.calledWith('destroy', account));
    });

    it('emits clear-uid event correctly', () => {
      assert.equal(notifier.trigger.callCount, 1);
      const args = notifier.trigger.args[0];
      assert.lengthOf(args, 1);
      assert.equal(args[0], 'clear-uid');
    });
  });

  describe('createOAuthToken', function() {
    var accessToken = 'access token';

    beforeEach(function() {
      account.set('sessionToken', SESSION_TOKEN);
      sinon.stub(fxaClient, 'createOAuthToken').callsFake(function() {
        return Promise.resolve({ access_token: accessToken });
      });
    });

    it('can fetch an oauth access token', function() {
      return account
        .createOAuthToken(CLIENT_ID, { scope: 'scope' })
        .then(function(token) {
          assert.equal(token.get('token'), accessToken);
          assert.isTrue(
            fxaClient.createOAuthToken.calledWith(SESSION_TOKEN, CLIENT_ID, {
              scope: 'scope',
            })
          );
        });
    });

    it('fails to fetch when unauthorized', function() {
      fxaClient.createOAuthToken.restore();
      sinon.stub(fxaClient, 'createOAuthToken').callsFake(function() {
        return Promise.reject(AuthErrors.toError('UNAUTHORIZED'));
      });
      return account
        .createOAuthToken(CLIENT_ID, { scope: 'scope' })
        .then(assert.fail, function(err) {
          assert.isTrue(AuthErrors.is(err, 'UNAUTHORIZED'));
        });
    });

    it('rejects with INVALID_TOKEN', function() {
      account.unset('sessionToken');
      return account
        .createOAuthToken(CLIENT_ID, { scope: 'scope' })
        .then(assert.fail, function(err) {
          assert.isTrue(AuthErrors.is(err, 'INVALID_TOKEN'));
        });
    });
  });

  describe('createOAuthCode', function() {
    beforeEach(function() {
      account.set('sessionToken', SESSION_TOKEN);
      sinon.stub(fxaClient, 'createOAuthCode').callsFake(function() {
        return Promise.resolve({
          code: 'foo',
          redirect: 'bar',
          state: 'baz',
        });
      });
    });

    it('can fetch an oauth access token', function() {
      return account
        .createOAuthCode(CLIENT_ID, 'state', { scope: 'scope' })
        .then(function(result) {
          assert.equal(result.code, 'foo');
          assert.equal(result.redirect, 'bar');
          assert.equal(result.state, 'baz');

          assert.isTrue(
            fxaClient.createOAuthCode.calledWith(
              SESSION_TOKEN,
              CLIENT_ID,
              'state',
              {
                scope: 'scope',
              }
            )
          );
        });
    });

    it('fails to fetch when unauthorized', function() {
      fxaClient.createOAuthCode.restore();
      sinon.stub(fxaClient, 'createOAuthCode').callsFake(function() {
        return Promise.reject(AuthErrors.toError('UNAUTHORIZED'));
      });
      return account
        .createOAuthCode(CLIENT_ID, 'state', { scope: 'scope' })
        .then(assert.fail, function(err) {
          assert.isTrue(AuthErrors.is(err, 'UNAUTHORIZED'));
        });
    });

    it('rejects with INVALID_TOKEN', function() {
      account.unset('sessionToken');
      return account
        .createOAuthCode(CLIENT_ID, 'state', { scope: 'scope' })
        .then(assert.fail, function(err) {
          assert.isTrue(AuthErrors.is(err, 'INVALID_TOKEN'));
        });
    });
  });

  describe('getOAuthScopedKeyData', function() {
    beforeEach(function() {
      account.set('sessionToken', SESSION_TOKEN);
      sinon.stub(fxaClient, 'getOAuthScopedKeyData').callsFake(function() {
        return Promise.resolve({
          identifier: 'foo',
          keyRotationSecret: 'bar',
          keyRotationTimestamp: 'baz',
        });
      });
    });

    it('can fetch an oauth access token', function() {
      return account
        .getOAuthScopedKeyData(CLIENT_ID, 'scope')
        .then(function(result) {
          assert.equal(result.identifier, 'foo');
          assert.equal(result.keyRotationSecret, 'bar');
          assert.equal(result.keyRotationTimestamp, 'baz');

          assert.isTrue(
            fxaClient.getOAuthScopedKeyData.calledWith(
              SESSION_TOKEN,
              CLIENT_ID,
              'scope'
            )
          );
        });
    });

    it('fails to fetch when unauthorized', function() {
      fxaClient.getOAuthScopedKeyData.restore();
      sinon.stub(fxaClient, 'getOAuthScopedKeyData').callsFake(function() {
        return Promise.reject(AuthErrors.toError('UNAUTHORIZED'));
      });
      return account
        .getOAuthScopedKeyData(CLIENT_ID, 'scope')
        .then(assert.fail, function(err) {
          assert.isTrue(AuthErrors.is(err, 'UNAUTHORIZED'));
        });
    });

    it('rejects with INVALID_TOKEN', function() {
      account.unset('sessionToken');
      return account
        .getOAuthScopedKeyData(CLIENT_ID, 'scope')
        .then(assert.fail, function(err) {
          assert.isTrue(AuthErrors.is(err, 'INVALID_TOKEN'));
        });
    });
  });

  describe('profileClient', function() {
    var accessToken = 'access token';

    beforeEach(function() {
      account.set('verified', true);
      sinon.stub(account, 'fetch').callsFake(function() {
        return Promise.resolve();
      });
    });

    it('rejects if not verified', function() {
      account.set('verified', false);

      return account.profileClient().then(assert.fail, function(err) {
        assert.isTrue(account.fetch.called);
        assert.isTrue(AuthErrors.is(err, 'UNVERIFIED_ACCOUNT'));
      });
    });

    it('has a profile client', function() {
      sinon.stub(account, 'createOAuthToken').callsFake(function() {
        return Promise.resolve(new OAuthToken({ token: accessToken }));
      });
      return account.profileClient().then(function(profileClient) {
        assert.ok(profileClient);
        assert.isTrue(account.createOAuthToken.called);
      });
    });

    it('profile client fails if not authorized', function() {
      sinon.stub(account, 'createOAuthToken').callsFake(function() {
        return Promise.reject(ProfileErrors.toError('UNAUTHORIZED'));
      });
      return account.profileClient().then(assert.fail, function(err) {
        assert.isTrue(ProfileErrors.is(err, 'UNAUTHORIZED'));
        assert.isTrue(account.createOAuthToken.called);
      });
    });
  });

  describe('with an access token', function() {
    var accessToken = 'token';
    beforeEach(function() {
      account.set('verified', true);
      account.set('accessToken', accessToken);
      sinon.stub(account, 'fetch').callsFake(function() {
        return Promise.resolve();
      });
    });

    describe('avatars', function() {
      beforeEach(function() {
        sinon.stub(account, 'profileClient').callsFake(function() {
          return Promise.resolve(profileClient);
        });
      });

      it('gets an avatar', function() {
        sinon.stub(profileClient, 'getAvatar').callsFake(function() {
          return Promise.resolve({ avatar: URL, id: 'foo' });
        });
        return account.getAvatar().then(function(result) {
          assert.isTrue(profileClient.getAvatar.calledWith(accessToken));
          assert.equal(result.avatar, URL);
          assert.equal(result.id, 'foo');
        });
      });

      it('delete an avatar', function() {
        var ID = 'deadbeef';
        sinon.stub(profileClient, 'deleteAvatar').callsFake(function() {
          return Promise.resolve();
        });

        return account.deleteAvatar(ID).then(function() {
          assert.isTrue(profileClient.deleteAvatar.calledWith(accessToken, ID));
        });
      });

      it('upload an image', function() {
        var DATA = 'image data';
        sinon.stub(profileClient, 'uploadAvatar').callsFake(function() {
          return { url: URL };
        });

        return account.uploadAvatar(DATA).then(function(result) {
          assert.isTrue(
            profileClient.uploadAvatar.calledWith(accessToken, DATA)
          );
          assert.equal(result.url, URL);
        });
      });
    });
  });

  describe('with a valid sessionToken, without an access token', function() {
    beforeEach(function() {
      var tokens = 0;
      sinon.stub(account, 'fetch').callsFake(function() {
        return Promise.resolve();
      });
      account.set('verified', true);

      sinon.stub(account, 'createOAuthToken').callsFake(function() {
        // returns "token1" then "token2", etc.
        return Promise.resolve(new OAuthToken({ token: 'token' + ++tokens }));
      });
    });

    PROFILE_CLIENT_METHODS.forEach(function(method) {
      it('retries on ' + method, function() {
        sinon.stub(profileClient, method).callsFake(function() {
          return Promise.reject(ProfileErrors.toError('UNAUTHORIZED'));
        });
        return account[method]().then(assert.fail, function(err) {
          assert.isTrue(account.createOAuthToken.calledTwice);
          assert.isTrue(profileClient[method].calledTwice);
          assert.isTrue(ProfileErrors.is(err, 'UNAUTHORIZED'));
          assert.isUndefined(account.get('accessToken'));
        });
      });

      it('retries and succeeds on ' + method, function() {
        sinon.stub(profileClient, method).callsFake(function(token) {
          if (token === 'token1') {
            return Promise.reject(ProfileErrors.toError('UNAUTHORIZED'));
          } else {
            return Promise.resolve();
          }
        });
        return account[method]().then(function() {
          assert.isTrue(account.createOAuthToken.calledTwice);
          assert.isTrue(profileClient[method].calledTwice);
          assert.equal(account.get('accessToken'), 'token2');
        });
      });

      it('throws other errors on ' + method, function() {
        sinon.stub(profileClient, method).callsFake(function() {
          return Promise.reject(ProfileErrors.toError('UNKNOWN_ACCOUNT'));
        });
        return account[method]().then(assert.fail, function(err) {
          assert.isTrue(ProfileErrors.is(err, 'UNKNOWN_ACCOUNT'));
          assert.isTrue(account.createOAuthToken.calledOnce);
          assert.isTrue(profileClient[method].calledOnce);
          assert.equal(account.get('accessToken'), 'token1');
        });
      });
    });
  });

  describe('with an invalid sessionToken', function() {
    PROFILE_CLIENT_METHODS.forEach(function(method) {
      describe(method, function() {
        var err;
        var accessTokenChangeSpy;
        var sessionTokenChangeSpy;
        var sessionTokenContextChangeSpy;

        beforeEach(function() {
          sinon.stub(account, 'fetch').callsFake(function() {
            return Promise.resolve();
          });

          account.set(
            {
              accessToken: 'access token',
              sessionToken: 'session token',
              sessionTokenContext: 'session token context',
              verified: true,
            },
            { silent: true }
          );

          sinon.stub(profileClient, method).callsFake(function() {
            return Promise.reject(ProfileErrors.toError('INVALID_TOKEN'));
          });

          accessTokenChangeSpy = sinon.spy();
          account.on('change:accessToken', accessTokenChangeSpy);

          sessionTokenChangeSpy = sinon.spy();
          account.on('change:sessionToken', sessionTokenChangeSpy);

          sessionTokenContextChangeSpy = sinon.spy();
          account.on(
            'change:sessionTokenContext',
            sessionTokenContextChangeSpy
          );

          return account[method]().then(assert.fail, function(_err) {
            err = _err;
          });
        });

        it('unsets the expected fields ' + method, function() {
          assert.isFalse(account.has('accessToken'));
          assert.isFalse(account.has('sessionToken'));
          assert.isFalse(account.has('sessionTokenContext'));
        });

        it('triggers the `change` event on the expected fields', function() {
          assert.isTrue(accessTokenChangeSpy.called);
          assert.isTrue(sessionTokenChangeSpy.called);
          assert.isTrue(sessionTokenContextChangeSpy.called);
        });

        it('rejects with the correct error', function() {
          assert.isTrue(ProfileErrors.is(err, 'INVALID_TOKEN'));
        });
      });
    });
  });

  describe('without a valid sessionToken, without an access token', function() {
    beforeEach(function() {
      sinon.stub(account, 'fetch').callsFake(function() {
        return Promise.resolve();
      });
      account.set('verified', true);

      sinon.stub(account, 'createOAuthToken').callsFake(function() {
        return Promise.reject(ProfileErrors.toError('UNAUTHORIZED'));
      });
    });

    PROFILE_CLIENT_METHODS.forEach(function(method) {
      it('retries on ' + method, function() {
        var spy = sinon.spy(profileClient, method);
        return account[method]().then(assert.fail, function(err) {
          assert.isTrue(account.createOAuthToken.calledTwice);
          assert.isFalse(spy.called);
          assert.isTrue(ProfileErrors.is(err, 'UNAUTHORIZED'));
          assert.isUndefined(account.get('accessToken'));
        });
      });
    });
  });

  describe('with an unverified account', function() {
    beforeEach(function() {
      sinon.stub(account, 'profileClient').callsFake(function() {
        return Promise.reject(AuthErrors.toError('UNVERIFIED_ACCOUNT'));
      });
    });

    PROFILE_CLIENT_METHODS.forEach(function(method) {
      it('rejects on ' + method, function() {
        sinon.spy(profileClient, method);
        return account[method]().then(assert.fail, function(err) {
          assert.isTrue(account.profileClient.called);
          assert.isFalse(profileClient[method].called);
          assert.isTrue(AuthErrors.is(err, 'UNVERIFIED_ACCOUNT'));
        });
      });
    });
  });

  it('isFromSync returns true in the right context', function() {
    account.set('sessionTokenContext', Constants.SESSION_TOKEN_USED_FOR_SYNC);
    assert.isTrue(account.isFromSync());
  });

  it('isFromSync returns false in the wrong context', function() {
    account.set('sessionTokenContext', 'foo');
    assert.isFalse(account.isFromSync());
  });

  describe('initialization', function() {
    describe('with all valid keys', function() {
      beforeEach(function() {
        account = new Account({
          email: EMAIL,
          sessionToken: SESSION_TOKEN,
          uid: UID,
        });
      });

      it('sets the data', function() {
        assert.ok(account.get('email'));
        assert.isFalse(account.has('foo'));
      });
    });

    describe('with no data', function() {
      beforeEach(function() {
        account = new Account();
      });

      it('is fine', function() {
        assert.isUndefined(account.get('email'));
      });
    });

    describe('with an invalid field', function() {
      var err;

      beforeEach(function() {
        try {
          account = new Account({ foo: 'foo' });
        } catch (_err) {
          err = _err;
        }
      });

      it('throws', function() {
        assert.equal(err.message, 'foo cannot be set on an Account');
      });
    });
  });

  describe('set', function() {
    beforeEach(function() {
      account = new Account({});
    });

    describe('with an object with all valid keys', function() {
      beforeEach(function() {
        account.set({
          displayName: 'fx user',
          email: 'a@a.com',
        });
      });

      it('succeeds', function() {
        assert.equal(account.get('displayName'), 'fx user');
        assert.equal(account.get('email'), 'a@a.com');
      });
    });

    describe('with an object with an invalid keys', function() {
      var err;

      beforeEach(function() {
        try {
          account.set({
            displayName: 'fx user',
            email: 'a@a.com',
            foo: 'foo',
          });
        } catch (_err) {
          err = _err;
        }
      });

      it('throws', function() {
        assert.equal(err.message, 'foo cannot be set on an Account');
      });
    });

    describe('with a valid key/value', function() {
      beforeEach(function() {
        account.set('displayName', 'fx user');
      });

      it('succeeds', function() {
        assert.equal(account.get('displayName'), 'fx user');
      });
    });

    describe('with an invalid key/value', function() {
      var err;

      beforeEach(function() {
        try {
          account.set('foo', 'foo');
        } catch (_err) {
          err = _err;
        }
      });

      it('throws', function() {
        assert.equal(err.message, 'foo cannot be set on an Account');
      });
    });
  });

  describe('toJSON', function() {
    it('is disabled and throws', function() {
      // toJSOn is disabled to avoid unintentional data leaks. Use pick
      assert.throws(function() {
        account.toJSON();
      });
    });
  });

  it('toPersistentJSON returns data for the right keys', function() {
    account = new Account({
      accessToken: 'token',
      email: EMAIL,
      grantedPermissions: {
        'some-client-id': ['profile:email', 'profile:uid'],
      },
      sessionToken: SESSION_TOKEN,
      uid: UID,
    });

    var data = account.toPersistentJSON();

    assert.isUndefined(data.accountData);
    assert.isUndefined(data.foo);
    assert.isUndefined(data.accessToken);
    assert.ok(data.email);
    // grantedPermissions are converted to permissions
    assert.isUndefined(data.grantedPermissions);
    assert.ok(data.permissions);
    assert.isTrue(data.permissions['some-client-id']['profile:email']);
  });

  describe('isDefault', function() {
    it('true for empty account', function() {
      assert.isTrue(new Account().isDefault());
    });

    it('true for account with data that is not in one of its allowed keys', function() {
      assert.isTrue(new Account({}).isDefault());
    });

    it('not true for account with data', function() {
      assert.isFalse(new Account({ email: 'a@a.com' }).isDefault());
    });
  });

  describe('isSignedIn', function() {
    it('returns `false` if the model has no sessionToken', function() {
      account.unset('sessionToken');
      return account.isSignedIn().then(function(isSignedIn) {
        assert.isFalse(isSignedIn);
      });
    });

    it('returns `false` if the sessionToken is expired', function() {
      account.set('sessionToken', 'exipred token');
      sinon.stub(fxaClient, 'sessionStatus').callsFake(function() {
        return Promise.reject(AuthErrors.toError('INVALID_TOKEN'));
      });

      return account.isSignedIn().then(function(isSignedIn) {
        assert.isFalse(isSignedIn);
      });
    });

    it('returns `true` if the sessionToken is valid', function() {
      account.set('sessionToken', 'valid token');
      sinon.stub(fxaClient, 'sessionStatus').callsFake(function() {
        return Promise.resolve();
      });

      return account.isSignedIn().then(function(isSignedIn) {
        assert.isTrue(isSignedIn);
      });
    });
  });

  describe('fetchCurrentProfileImage', function() {
    it('returns profile image', function() {
      sinon.stub(account, 'getAvatar').callsFake(function() {
        return Promise.resolve({ avatar: PNG_URL, id: 'foo' });
      });

      sinon.spy(account, 'setProfileImage');

      return account.fetchCurrentProfileImage().then(function(profileImage) {
        assert.equal(profileImage.get('url'), PNG_URL);
        assert.equal(profileImage.get('id'), 'foo');
        assert.isTrue(profileImage.has('img'));
        assert.isTrue(account.get('hadProfileImageSetBefore'));
        assert.isTrue(account.setProfileImage.calledWith(profileImage));
      });
    });

    it('errors on getAvatar returns error', function() {
      sinon.stub(account, 'getAvatar').callsFake(function() {
        return Promise.reject(ProfileErrors.toError('UNAUTHORIZED'));
      });

      return account.fetchCurrentProfileImage().then(
        function() {
          assert.catch('Unexpected success');
        },
        function(err) {
          assert.isTrue(ProfileErrors.is(err, 'UNAUTHORIZED'));
        }
      );
    });

    it('errors on profileImage fetch returns error', function() {
      sinon.stub(account, 'getAvatar').callsFake(function() {
        return Promise.resolve({ avatar: 'bad url', id: 'foo' });
      });

      return account.fetchCurrentProfileImage().then(
        function() {
          assert.catch('Unexpected success');
        },
        function(err) {
          assert.isTrue(ProfileErrors.is(err, 'IMAGE_LOAD_ERROR'));
        }
      );
    });
  });

  describe('fetchProfile', function() {
    it('returns profile', function() {
      var name = 'snoopy';
      sinon.stub(account, 'getProfile').callsFake(function() {
        return Promise.resolve({
          avatar: PNG_URL,
          avatarDefault: false,
          displayName: name,
        });
      });

      sinon.spy(account, 'setProfileImage');

      return account.fetchProfile().then(function() {
        assert.equal(account.get('profileImageUrl'), PNG_URL);
        assert.equal(account.get('profileImageUrlDefault'), false);
        assert.isTrue(account.setProfileImage.called);
        assert.equal(account.setProfileImage.args[0][0].get('url'), PNG_URL);
        assert.isTrue(account.get('hadProfileImageSetBefore'));
        assert.equal(account.get('displayName'), name);
      });
    });

    it('caches requests to avoid multiple XHR requests, as long as no account data was updated', function() {
      sinon.stub(account, 'getProfile').callsFake(function() {
        return Promise.resolve({ avatar: PNG_URL, displayName: name });
      });

      return account
        .fetchProfile()
        .then(function() {
          return account.fetchProfile();
        })
        .then(function() {
          assert.equal(account.getProfile.callCount, 1);
        });
    });

    it('avoids returning stale data by re-requesting profile data if any account data was set after the initial fetch', function() {
      sinon.stub(account, 'getProfile').callsFake(function() {
        return Promise.resolve({ avatar: PNG_URL, displayName: name });
      });

      return account
        .fetchProfile()
        .then(function() {
          account.set('displayName', 'test user');
          return account.fetchProfile();
        })
        .then(function() {
          assert.equal(account.getProfile.callCount, 2);
        });
    });
  });

  describe('changePassword', function() {
    it('returns `INCORRECT_PASSWORD` error if old password is incorrect (event if passwords are the same)', function() {
      sinon.stub(fxaClient, 'checkPassword').callsFake(function() {
        return Promise.reject(AuthErrors.toError('INCORRECT_PASSWORD'));
      });

      return account
        .changePassword('bad_password', 'bad_password', relier)
        .then(assert.fail, function(err) {
          assert.isTrue(AuthErrors.is(err, 'INCORRECT_PASSWORD'));
        });
    });

    it('returns `PASSWORD_MUST_BE_DIFFERENT` error if both passwords are the same and the first password is correct', function() {
      sinon.stub(fxaClient, 'checkPassword').callsFake(function() {
        return Promise.resolve();
      });

      return account
        .changePassword('password', 'password', relier)
        .then(assert.fail, function(err) {
          assert.ok(AuthErrors.is(err, 'PASSWORDS_MUST_BE_DIFFERENT'));
        });
    });

    it('changes from old to new password', function() {
      var oldPassword = 'password';
      var newPassword = 'new_password';

      account.set({
        sessionToken: 'sessionToken',
        sessionTokenContext: 'foo',
      });

      sinon.stub(fxaClient, 'checkPassword').callsFake(function() {
        return Promise.resolve();
      });

      sinon.stub(fxaClient, 'changePassword').callsFake(function() {
        return Promise.resolve({
          keyFetchToken: 'new keyFetchToken',
          sessionToken: 'new sessionToken',
          uid: 'uid',
          verified: true,
        });
      });

      return account
        .changePassword(oldPassword, newPassword, relier)
        .then(function() {
          assert.isTrue(
            fxaClient.checkPassword.calledWith(
              EMAIL,
              oldPassword,
              'sessionToken'
            )
          );
          assert.isTrue(
            fxaClient.changePassword.calledWith(
              EMAIL,
              oldPassword,
              newPassword,
              'sessionToken',
              'foo',
              relier
            )
          );

          assert.equal(account.get('keyFetchToken'), 'new keyFetchToken');
          assert.equal(account.get('sessionToken'), 'new sessionToken');
          assert.equal(account.get('sessionTokenContext'), 'foo');
          assert.equal(account.get('uid'), 'uid');
          assert.isTrue(account.get('verified'));
        });
    });
  });

  describe('completePasswordReset', function() {
    it('completes the password reset', function() {
      account.set('email', EMAIL);
      var token = 'token';
      var code = 'code';

      sinon.stub(fxaClient, 'completePasswordReset').callsFake(function() {
        return Promise.resolve({
          keyFetchToken: 'new keyFetchToken',
          sessionToken: 'new sessionToken',
          uid: 'uid',
          verified: true,
        });
      });

      return account
        .completePasswordReset(PASSWORD, token, code, relier)
        .then(function() {
          assert.isTrue(
            fxaClient.completePasswordReset.calledWith(
              EMAIL,
              PASSWORD,
              token,
              code,
              relier
            )
          );

          assert.ok(account.get('keyFetchToken'), 'new keyFetchToken');
          assert.equal(account.get('sessionToken'), 'new sessionToken');
          assert.equal(account.get('uid'), 'uid');
          assert.isTrue(account.get('verified'));
        });
    });
  });

  describe('fetchAttachedClients', function() {
    beforeEach(() => {
      account.set('sessionToken', SESSION_TOKEN);

      sinon.stub(fxaClient, 'attachedClients').callsFake(() => {
        return Promise.resolve([
          {
            deviceId: 'device-1',
            deviceType: 'desktop',
            isCurrentSession: false,
            name: 'alpha',
            sessionTokenId: 'session-1',
          },
          {
            isCurrentSession: false,
            name: 'session',
            sessionTokenId: 'foo',
          },
          {
            deviceId: 'device-2',
            deviceType: 'mobile',
            isCurrentSession: true,
            name: 'beta',
            sessionTokenId: 'session-2',
          },
        ]);
      });
    });

    it('fetches the list of attached clients from the back end', function() {
      return account.fetchAttachedClients().then(result => {
        assert.isTrue(fxaClient.attachedClients.calledWith(SESSION_TOKEN));
        assert.equal(result.length, 3);
        assert.equal(result[0].name, 'alpha');
        assert.equal(result[0].deviceType, 'desktop');
        assert.ok(!result[0].isCurrentSession);

        assert.equal(result[1].name, 'session');
        assert.equal(result[1].deviceType, undefined);
        assert.ok(!result[1].isCurrentSession);

        assert.equal(result[2].name, 'beta');
        assert.equal(result[2].deviceType, 'mobile');
        assert.ok(result[2].isCurrentSession);
      });
    });
  });

  describe('destroyAttachedClient for a session', function() {
    var client;

    beforeEach(function() {
      account.set('sessionToken', SESSION_TOKEN);

      client = new AttachedClient({
        sessionTokenId: 'session-1',
        lastAccessTime: 100,
        lastAccessTimeFormatted: 'a few seconds ago',
        name: 'alpha',
        userAgent: 'Firefox 50',
      });
      sinon.spy(client, 'destroy');

      sinon.stub(fxaClient, 'attachedClientDestroy').callsFake(function() {
        return Promise.resolve();
      });

      return account.destroyAttachedClient(client);
    });

    it('tells the backend to destroy the client with correct ids', function() {
      assert.isTrue(
        fxaClient.attachedClientDestroy.calledWith(SESSION_TOKEN, {
          clientId: null,
          deviceId: null,
          refreshTokenId: null,
          sessionTokenId: 'session-1',
        })
      );
      assert.isTrue(client.destroy.calledOnce);
    });
  });

  describe('destroyAttachedClient for a device', function() {
    var client;

    beforeEach(function() {
      account.set('sessionToken', SESSION_TOKEN);

      client = new AttachedClient({
        deviceId: 'device-1',
        sessionTokenId: 'session-1',
        lastAccessTime: 100,
        lastAccessTimeFormatted: 'a few seconds ago',
        name: 'alpha',
        userAgent: 'Firefox 50',
      });
      sinon.spy(client, 'destroy');

      sinon.stub(fxaClient, 'attachedClientDestroy').callsFake(function() {
        return Promise.resolve();
      });

      return account.destroyAttachedClient(client);
    });

    it('tells the backend to destroy the client with correct ids', function() {
      assert.isTrue(
        fxaClient.attachedClientDestroy.calledWith(SESSION_TOKEN, {
          clientId: null,
          deviceId: 'device-1',
          refreshTokenId: null,
          sessionTokenId: 'session-1',
        })
      );
      assert.isTrue(client.destroy.calledOnce);
    });
  });

  describe('destroyAttachedClient for an oauth app with refresh token', function() {
    var client;

    beforeEach(function() {
      account.set('sessionToken', SESSION_TOKEN);

      client = new AttachedClient({
        refreshTokenId: 'refresh-1',
        clientId: 'client-1',
        lastAccessTime: 100,
        lastAccessTimeFormatted: 'a few seconds ago',
        name: 'alpha',
        userAgent: 'Firefox 50',
      });
      sinon.spy(client, 'destroy');

      sinon.stub(fxaClient, 'attachedClientDestroy').callsFake(function() {
        return Promise.resolve();
      });

      return account.destroyAttachedClient(client);
    });

    it('tells the backend to destroy the client with correct ids', function() {
      assert.isTrue(
        fxaClient.attachedClientDestroy.calledWith(SESSION_TOKEN, {
          clientId: 'client-1',
          deviceId: null,
          refreshTokenId: 'refresh-1',
          sessionTokenId: null,
        })
      );
      assert.isTrue(client.destroy.calledOnce);
    });
  });

  describe('destroyAttachedClient for an oauth app without refresh tokens', function() {
    var client;

    beforeEach(function() {
      account.set('sessionToken', SESSION_TOKEN);

      client = new AttachedClient({
        clientId: 'client-1',
        lastAccessTime: 100,
        lastAccessTimeFormatted: 'a few seconds ago',
        name: 'alpha',
        userAgent: 'Firefox 50',
      });
      sinon.spy(client, 'destroy');

      sinon.stub(fxaClient, 'attachedClientDestroy').callsFake(function() {
        return Promise.resolve();
      });

      return account.destroyAttachedClient(client);
    });

    it('tells the backend to destroy the client with correct ids', function() {
      assert.isTrue(
        fxaClient.attachedClientDestroy.calledWith(SESSION_TOKEN, {
          clientId: 'client-1',
          deviceId: null,
          refreshTokenId: null,
          sessionTokenId: null,
        })
      );
      assert.isTrue(client.destroy.calledOnce);
    });
  });

  describe('resetPassword', function() {
    var relier;

    beforeEach(function() {
      account.set('email', EMAIL);

      relier = {};

      sinon.stub(fxaClient, 'passwordReset').callsFake(function() {
        return Promise.resolve();
      });

      return account.resetPassword(relier, {
        resume: 'resume token',
      });
    });

    it('delegates to the fxaClient', function() {
      assert.isTrue(fxaClient.passwordReset.calledOnce);
      assert.isTrue(
        fxaClient.passwordReset.calledWith(EMAIL, relier, {
          metricsContext: metrics.getFlowEventMetadata(),
          resume: 'resume token',
        })
      );
    });
  });

  describe('retryResetPassword', function() {
    var relier;

    beforeEach(function() {
      account.set('email', EMAIL);

      relier = {};

      sinon.stub(fxaClient, 'passwordResetResend').callsFake(function() {
        return Promise.resolve();
      });

      return account.retryResetPassword('password forgot token', relier, {
        resume: 'resume token',
      });
    });

    it('delegates to the fxaClient', function() {
      assert.isTrue(fxaClient.passwordResetResend.calledOnce);
      assert.isTrue(
        fxaClient.passwordResetResend.calledWith(
          EMAIL,
          'password forgot token',
          relier,
          {
            metricsContext: metrics.getFlowEventMetadata(),
            resume: 'resume token',
          }
        )
      );
    });
  });

  describe('accountKeys', function() {
    function setup(accountData) {
      account.clear();
      account.set(accountData);

      sinon.stub(fxaClient, 'accountKeys').callsFake(function() {
        return Promise.resolve('account keys');
      });

      return account.accountKeys();
    }

    describe('without a `keyFetchToken`', function() {
      var result;

      beforeEach(function() {
        return setup({ unwrapBKey: 'unwrap b key' }).then(function(_result) {
          result = _result;
        });
      });

      it('resolves to null', function() {
        assert.isNull(result);
      });

      it('does not delegate to the fxaClient', function() {
        assert.isFalse(fxaClient.accountKeys.called);
      });
    });

    describe('without an `unwrapBKey`', function() {
      var result;

      beforeEach(function() {
        return setup({ keyFetchToken: 'key fetch token' }).then(function(
          _result
        ) {
          result = _result;
        });
      });

      it('resolves to null', function() {
        assert.isNull(result);
      });

      it('does not delegate to the fxaClient', function() {
        assert.isFalse(fxaClient.accountKeys.called);
      });
    });

    describe('with both a `keyFetchToken` and `unwrapBKey`', function() {
      var result;

      beforeEach(function() {
        return setup({
          keyFetchToken: 'key fetch token',
          unwrapBKey: 'unwrap b key',
        }).then(function(_result) {
          result = _result;
        });
      });

      it('delegates to the fxaClient', function() {
        assert.isTrue(
          fxaClient.accountKeys.calledWith('key fetch token', 'unwrap b key')
        );
      });

      it('resolves to the fxaClient result', function() {
        assert.equal(result, 'account keys');
      });
    });
  });

  describe('setClientPermissions/getClientPermissions/getClientPermission', function() {
    var savedPermissions = {
      'profile:display_name': false,
      'profile:email': true,
    };

    beforeEach(function() {
      account.setClientPermissions(CLIENT_ID, savedPermissions);
    });

    describe('getClientPermissions', function() {
      var clientPermissions;

      beforeEach(function() {
        clientPermissions = account.getClientPermissions(CLIENT_ID);
      });

      it('returns the permissions for a client', function() {
        assert.deepEqual(clientPermissions, savedPermissions);
      });

      it('returns `{}` if client has no permissions', function() {
        assert.deepEqual(account.getClientPermissions('unknown'), {});
      });
    });

    describe('getClientPermission', function() {
      it('returns the permissions for a client', function() {
        assert.isFalse(
          account.getClientPermission(CLIENT_ID, 'profile:display_name')
        );
        assert.isTrue(account.getClientPermission(CLIENT_ID, 'profile:email'));
      });

      it('returns `undefined` if client has no permissions', function() {
        assert.isUndefined(
          account.getClientPermission('unknown', 'profile:email')
        );
      });

      it('returns `undefined` if permissions is not found', function() {
        assert.isUndefined(account.getClientPermission(CLIENT_ID, 'unknown'));
      });
    });
  });

  describe('hasSeenPermissions', function() {
    beforeEach(function() {
      var savedPermissions = {
        'profile:display_name': false,
        'profile:email': true,
      };
      account.setClientPermissions(CLIENT_ID, savedPermissions);
    });

    describe('if the client has seen all the permissions', function() {
      it('returns true', function() {
        assert.isTrue(
          account.hasSeenPermissions(CLIENT_ID, ['profile:display_name'])
        );
        assert.isTrue(
          account.hasSeenPermissions(CLIENT_ID, [
            'profile:display_name',
            'profile:email',
          ])
        );
      });
    });

    describe('if the client has not seen all the permissions', function() {
      it('returns false', function() {
        assert.isFalse(
          account.hasSeenPermissions(CLIENT_ID, [
            'profile:display_name',
            'profile:email',
            'profile:uid',
          ])
        );
      });
    });
  });

  describe('getPermissionsWithValues', function() {
    var permissions;

    beforeEach(function() {
      account.clear();
      account.set({
        displayName: 'Test user',
        email: 'testuser@testuser.com',
        uid: 'users id',
      });
    });

    describe('with known about permissions', function() {
      beforeEach(function() {
        permissions = account.getPermissionsWithValues([
          'profile:email',
          'profile:display_name',
          'profile:avatar',
          'profile:uid',
        ]);
      });

      it('returns requested permissions if the account has a value', function() {
        assert.equal(permissions.length, 3);

        assert.equal(permissions[0], 'profile:email');
        assert.equal(permissions[1], 'profile:display_name');
        assert.equal(permissions[2], 'profile:uid');
      });
    });

    describe('with an unknown permission', function() {
      beforeEach(function() {
        permissions = account.getPermissionsWithValues([
          'profile:email',
          'profile:unknown',
        ]);
      });

      it('filters the unknown permission', function() {
        assert.lengthOf(permissions, 1);
        assert.equal(permissions[0], 'profile:email');
      });
    });
  });

  describe('_upgradeGrantedPermissions', function() {
    beforeEach(function() {
      account.set('grantedPermissions', {
        client_id: ['profile:email', 'profile:uid'], //eslint-disable-line camelcase
      });
      account._upgradeGrantedPermissions();
    });

    it('converts `grantedPermissions` to `permissions`', function() {
      var permissions = account.getClientPermissions('client_id');
      assert.lengthOf(Object.keys(permissions), 2);
      assert.isTrue(permissions['profile:email']);
      assert.isTrue(permissions['profile:uid']);
    });

    it('deletes `grantedPermissions`', function() {
      assert.isFalse(account.has('grantedPermissions'));
    });
  });

  describe('checkUidExists', function() {
    beforeEach(function() {
      account.set('uid', UID);

      sinon.stub(fxaClient, 'checkAccountExists').callsFake(function() {
        return Promise.resolve();
      });

      return account.checkUidExists();
    });

    it('delegates to the fxaClient', function() {
      assert.isTrue(fxaClient.checkAccountExists.calledWith(UID));
    });
  });

  describe('accountProfile', function() {
    beforeEach(function() {
      account.set('sessionToken', 'sessionToken');
      sinon.stub(fxaClient, 'accountProfile').callsFake(function() {
        return Promise.resolve();
      });

      return account.accountProfile();
    });

    it('delegates to the fxaClient', function() {
      assert.isTrue(fxaClient.accountProfile.calledWith('sessionToken'));
    });
  });

  describe('settingsData:', () => {
    let result;

    beforeEach(() => {
      account.set('sessionToken', 'wibble');
      sinon
        .stub(fxaClient, 'account')
        .callsFake(() => Promise.resolve({ foo: 'bar' }));

      return account.settingsData().then(r => (result = r));
    });

    it('returned the correct result', () => {
      assert.deepEqual(result, { foo: 'bar' });
    });

    it('called fxaClient.account', () => {
      assert.equal(fxaClient.account.callCount, 1);
      const args = fxaClient.account.args[0];
      assert.lengthOf(args, 1);
      assert.equal(args[0], 'wibble');
    });

    describe('second call to settingsData:', () => {
      beforeEach(() => {
        return account.settingsData().then(r => (result = r));
      });

      it('returned the correct result', () => {
        assert.deepEqual(result, { foo: 'bar' });
      });

      it('did not call fxaClient.account a second time', () => {
        assert.equal(fxaClient.account.callCount, 1);
      });
    });

    describe('second call to settingsData with force=true:', () => {
      beforeEach(() => {
        return account.settingsData({ force: true }).then(r => (result = r));
      });

      it('returned the correct result', () => {
        assert.deepEqual(result, { foo: 'bar' });
      });

      it('called fxaClient.account a second time', () => {
        assert.equal(fxaClient.account.callCount, 2);
      });
    });
  });

  describe('settingsData without sessionToken:', () => {
    let err;

    beforeEach(() => {
      account.unset('sessionToken');
      sinon
        .stub(fxaClient, 'account')
        .callsFake(() => Promise.resolve({ foo: 'bar' }));

      return account.settingsData().catch(e => (err = e));
    });

    it('failed', () => {
      assert.instanceOf(err, Error);
      assert.equal(err.message, 'Invalid token');
    });

    it('did not call fxaClient.account', () => {
      assert.equal(fxaClient.account.callCount, 0);
    });
  });

  describe('checkEmailExists', function() {
    beforeEach(function() {
      account.set('email', EMAIL);

      sinon.stub(fxaClient, 'checkAccountExistsByEmail').callsFake(function() {
        return Promise.resolve();
      });

      return account.checkEmailExists();
    });

    it('delegates to the fxaClient', function() {
      assert.isTrue(fxaClient.checkAccountExistsByEmail.calledWith(EMAIL));
    });
  });

  describe('isPasswordResetComplete', () => {
    beforeEach(() => {
      sinon
        .stub(fxaClient, 'isPasswordResetComplete')
        .callsFake(() => Promise.resolve());

      return account.isPasswordResetComplete('token');
    });

    it('delegates to the fxaClient', () => {
      assert.isTrue(fxaClient.isPasswordResetComplete.calledWith('token'));
    });
  });

  describe('sendUnblockEmail', () => {
    beforeEach(() => {
      account.set('email', EMAIL);

      sinon
        .stub(fxaClient, 'sendUnblockEmail')
        .callsFake(() => Promise.resolve({}));
      return account.sendUnblockEmail();
    });

    it('delegates to the fxaClient with the metricsContext', () => {
      const metricsContext = metrics.getFlowEventMetadata();
      assert.isTrue(
        fxaClient.sendUnblockEmail.calledWith(EMAIL, { metricsContext })
      );
    });
  });

  describe('rejectUnblockCode', () => {
    beforeEach(() => {
      account.set('uid', UID);

      sinon
        .stub(fxaClient, 'rejectUnblockCode')
        .callsFake(() => Promise.resolve({}));

      return account.rejectUnblockCode('code');
    });

    it('delegates to the fxaClient', () => {
      assert.isTrue(fxaClient.rejectUnblockCode.calledWith(UID, 'code'));
    });
  });

  describe('populateFromResumeToken', () => {
    describe('ResumeToken contains `email`', () => {
      beforeEach(() => {
        const resumeToken = new ResumeToken({ email: EMAIL });

        account.unset('email');
        account.populateFromResumeToken(resumeToken);
      });

      it('populates `email`', () => {
        assert.equal(account.get('email'), EMAIL);
      });
    });

    describe('ResumeToken does not contain `email`', () => {
      beforeEach(() => {
        const resumeToken = new ResumeToken({});

        account.unset('email');
        account.populateFromResumeToken(resumeToken);
      });

      it('does not populate `email`', () => {
        assert.isFalse(account.has('email'));
      });
    });
  });

  describe('sendSms', () => {
    const flowEventMetaData = {
      startTime: Date.now(),
    };

    beforeEach(() => {
      sinon.stub(fxaClient, 'sendSms').callsFake(() => Promise.resolve());
      sinon
        .stub(metrics, 'getFlowEventMetadata')
        .callsFake(() => flowEventMetaData);

      account.set('sessionToken', 'sessionToken');
      return account.sendSms('1234567890', 1, {
        features: ['signinCodes'],
      });
    });

    it('delegates to the fxa-client', () => {
      assert.isTrue(fxaClient.sendSms.calledOnce);
      assert.isTrue(
        fxaClient.sendSms.calledWith('sessionToken', '1234567890', 1, {
          features: ['signinCodes'],
          metricsContext: flowEventMetaData,
        })
      );
    });
  });

  describe('smsStatus', () => {
    beforeEach(() => {
      sinon.stub(fxaClient, 'smsStatus').callsFake(() =>
        Promise.resolve({
          country: 'GB',
          ok: true,
        })
      );
    });

    describe('sessionToken not available', () => {
      it('does not delegate to fxa-client, resolves with `false`', () => {
        account.unset('sessionToken');

        return account.smsStatus().then(response => {
          assert.isFalse(response.ok);

          assert.isFalse(fxaClient.smsStatus.called);
        });
      });
    });

    describe('sessionToken available', () => {
      it('delegates to the fxa-client, returns response', () => {
        account.set('sessionToken', 'sessionToken');

        const smsStatusOptions = { country: 'GB' };
        return account.smsStatus(smsStatusOptions).then(response => {
          assert.equal(response.country, 'GB');
          assert.isTrue(response.ok);

          assert.isTrue(fxaClient.smsStatus.calledOnce);
          assert.isTrue(
            fxaClient.smsStatus.calledWith('sessionToken', smsStatusOptions)
          );
        });
      });
    });
  });

  describe('verifyTotpCode', () => {
    const flowEventMetaData = {
      startTime: Date.now(),
    };

    beforeEach(() => {
      sinon
        .stub(fxaClient, 'verifyTotpCode')
        .callsFake(() => Promise.resolve());
      sinon
        .stub(metrics, 'getFlowEventMetadata')
        .callsFake(() => flowEventMetaData);

      account.set('sessionToken', 'sessionToken');
      return account.verifyTotpCode('000000', 'service');
    });

    it('delegates to the fxa-client', () => {
      assert.isTrue(fxaClient.verifyTotpCode.calledOnce);
      assert.isTrue(
        fxaClient.verifyTotpCode.calledWith('sessionToken', '000000', {
          metricsContext: flowEventMetaData,
          service: 'service',
        })
      );
    });
  });

  describe('_fetchShortLivedSubscriptionsOAuthToken', () => {
    it('calls createOAuthToken with the correct arguments', () => {
      const createOAuthTokenStub = sinon.stub(account, 'createOAuthToken');
      account._fetchShortLivedSubscriptionsOAuthToken();
      assert.isTrue(createOAuthTokenStub.calledOnce);
      assert.isTrue(
        createOAuthTokenStub.calledWith(
          subscriptionsConfig.managementClientId,
          { scope: subscriptionsConfig.managementScopes, ttl: 30 }
        )
      );
    });
  });

  describe('fetchSubscriptionPlans', () => {
    it('delegates to the fxa-client', () => {
      const token = 'tickettoride';
      const plans = [{ product_id: 'foo', plan: 'bar' }];
      sinon
        .stub(account, 'createOAuthToken')
        .resolves(new OAuthToken({ token }));
      const plansStub = sinon
        .stub(fxaClient, 'getSubscriptionPlans')
        .resolves(plans);

      return account.fetchSubscriptionPlans().then(resp => {
        assert.isTrue(plansStub.calledWith(token));
        assert.deepEqual(resp, plans);
      });
    });
  });

  describe('fetchActiveSubscriptions', () => {
    it('delegates to the fxa-client', () => {
      const token = 'tickettoride';
      const subs = [{ sid: 'foo' }];
      sinon.stub(account, 'createOAuthToken').callsFake(function() {
        return Promise.resolve(new OAuthToken({ token }));
      });
      const subsStub = sinon
        .stub(fxaClient, 'getActiveSubscriptions')
        .callsFake(function() {
          return Promise.resolve(subs);
        });

      return account.fetchActiveSubscriptions().then(resp => {
        assert.isTrue(subsStub.calledWith(token));
        assert.deepEqual(resp, subs);
      });
    });
  });

  describe('hasSubscriptions', () => {
    it('resolves to false when settingsData has no subscriptions data', function() {
      account._settingsData = {};
      return account.hasSubscriptions().then(hasSub => {
        assert.isFalse(hasSub);
      });
    });

    it('resolves to false when settingsData has an empty subscriptions list', function() {
      account._settingsData = { subscriptions: [] };
      return account.hasSubscriptions().then(hasSub => {
        assert.isFalse(hasSub);
      });
    });

    it('resolves to true when settingsData has a subscription', function() {
      account._settingsData = { subscriptions: [{ x: 'yz' }] };
      return account.hasSubscriptions().then(hasSub => {
        assert.isTrue(hasSub);
      });
    });
  });

  describe('createSupportTicket', () => {
    it('delegates to the fxa-client', () => {
      const token = 'tickettoride';
      const ticket = { topic: 'TESTO', message: 'testo?' };
      const ticketResp = { success: true, ticket: 123 };
      sinon.stub(account, 'createOAuthToken').callsFake(function() {
        return Promise.resolve(new OAuthToken({ token }));
      });
      const ticketStub = sinon
        .stub(fxaClient, 'createSupportTicket')
        .callsFake(function() {
          return Promise.resolve(ticketResp);
        });

      account.createSupportTicket(ticket).then(resp => {
        assert.isTrue(ticketStub.calledWith(token, ticket));
        assert.deepEqual(resp, ticketResp);
      });
    });
  });

  describe('securityEvents', () => {
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

    it('gets the security events', () => {
      account.set('sessionToken', SESSION_TOKEN);
      sinon.stub(fxaClient, 'securityEvents').callsFake(() => {
        return Promise.resolve(events);
      });

      return account.securityEvents().then(res => {
        assert.isTrue(fxaClient.securityEvents.calledOnce);
        assert.isTrue(fxaClient.securityEvents.calledWith(SESSION_TOKEN));

        assert.equal(res.length, 2);
        assert.deepEqual(res, events);
      });
    });
  });

  describe('deleteSecurityEvents', () => {
    it('deletes the security events', () => {
      account.set('sessionToken', SESSION_TOKEN);
      sinon.stub(fxaClient, 'deleteSecurityEvents').callsFake(() => {
        return Promise.resolve({});
      });

      return account.deleteSecurityEvents().then(res => {
        assert.isTrue(fxaClient.deleteSecurityEvents.calledOnce);
        assert.isTrue(fxaClient.deleteSecurityEvents.calledWith(SESSION_TOKEN));
        assert.deepEqual(res, {});
      });
    });
  });
});
