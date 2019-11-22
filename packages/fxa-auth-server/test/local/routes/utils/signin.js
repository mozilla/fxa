/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const sinon = require('sinon');
const assert = { ...sinon.assert, ...require('chai').assert };

const P = require('../../../../lib/promise');
const mocks = require('../../../mocks');
const Password = require('../../../../lib/crypto/password')({}, {});
const error = require('../../../../lib/error');
const butil = require('../../../../lib/crypto/butil');
const otpUtils = require('../../../../lib/routes/utils/otp')({}, {}, {});

const CLIENT_ADDRESS = '10.0.0.1';
const TEST_EMAIL = 'test@example.com';
const TEST_UID = 'thisisauid';
const otpOptions = {
  step: 600,
  window: 1,
  digits: 6,
};

function makeSigninUtils(options) {
  const log = options.log || mocks.mockLog();
  const config = options.config || {};
  const customs = options.customs || {};
  const db = options.db || mocks.mockDB();
  const mailer = options.mailer || {};
  return require('../../../../lib/routes/utils/signin')(
    log,
    config,
    customs,
    db,
    mailer
  );
}

describe('checkPassword', () => {
  let customs, db, signinUtils;

  beforeEach(() => {
    db = mocks.mockDB();
    customs = {
      flag: sinon.spy(() => P.resolve({})),
    };
    signinUtils = makeSigninUtils({ db, customs });
  });

  it('should check with correct password', () => {
    db.checkPassword = sinon.spy(uid => P.resolve(true));
    const authPW = Buffer.from('aaaaaaaaaaaaaaaa');
    const accountRecord = {
      uid: TEST_UID,
      verifierVersion: 0,
      authSalt: Buffer.from('bbbbbbbbbbbbbbbb'),
    };
    const password = new Password(
      authPW,
      accountRecord.authSalt,
      accountRecord.verifierVersion
    );

    return password.verifyHash().then(hash => {
      return signinUtils
        .checkPassword(accountRecord, password, CLIENT_ADDRESS)
        .then(match => {
          assert.ok(match, 'password matches, checkPassword returns true');

          assert.calledOnce(db.checkPassword);
          assert.calledWithExactly(db.checkPassword, TEST_UID, hash);

          assert.notCalled(customs.flag);
        });
    });
  });

  it('should return false when check with incorrect password', () => {
    db.checkPassword = sinon.spy(uid => P.resolve(false));
    const authPW = Buffer.from('aaaaaaaaaaaaaaaa');
    const accountRecord = {
      uid: TEST_UID,
      email: TEST_EMAIL,
      verifierVersion: 0,
      authSalt: Buffer.from('bbbbbbbbbbbbbbbb'),
    };
    const goodPassword = new Password(
      authPW,
      accountRecord.authSalt,
      accountRecord.verifierVersion
    );
    const badAuthPW = Buffer.from('cccccccccccccccc');
    const badPassword = new Password(
      badAuthPW,
      accountRecord.authSalt,
      accountRecord.verifierVersion
    );

    return P.all([goodPassword.verifyHash(), badPassword.verifyHash()]).spread(
      (goodHash, badHash) => {
        assert.notEqual(
          goodHash,
          badHash,
          'bad password actually has a different hash'
        );
        return signinUtils
          .checkPassword(accountRecord, badPassword, CLIENT_ADDRESS)
          .then(match => {
            assert.equal(
              !!match,
              false,
              'password does not match, checkPassword returns false'
            );

            assert.calledOnce(db.checkPassword);
            assert.calledWithExactly(db.checkPassword, TEST_UID, badHash);

            assert.calledOnce(customs.flag);
            assert.calledWithExactly(customs.flag, CLIENT_ADDRESS, {
              email: TEST_EMAIL,
              errno: error.ERRNO.INCORRECT_PASSWORD,
            });
          });
      }
    );
  });

  it('should error when checking account whose password must be reset', () => {
    const accountRecord = {
      uid: TEST_UID,
      email: TEST_EMAIL,
      verifierVersion: 0,
      authSalt: butil.ONES,
    };
    const incorrectAuthPW = Buffer.from('cccccccccccccccccccccccccccccccc');
    const incorrectPassword = new Password(
      incorrectAuthPW,
      accountRecord.authSalt,
      accountRecord.verifierVersion
    );

    return signinUtils
      .checkPassword(accountRecord, incorrectPassword, CLIENT_ADDRESS)
      .then(
        match => {
          assert(false, 'password check should not have succeeded');
        },
        err => {
          assert.equal(
            err.errno,
            error.ERRNO.ACCOUNT_RESET,
            'an ACCOUNT_RESET error was thrown'
          );

          assert.notCalled(db.checkPassword);

          assert.calledOnce(customs.flag);
          assert.calledWithExactly(customs.flag, CLIENT_ADDRESS, {
            email: TEST_EMAIL,
            errno: error.ERRNO.ACCOUNT_RESET,
          });
        }
      );
  });
});

describe('checkCustomsAndLoadAccount', () => {
  let config, customs, db, log, request, checkCustomsAndLoadAccount;

  beforeEach(() => {
    db = mocks.mockDB({
      uid: TEST_UID,
      email: TEST_EMAIL,
    });
    log = mocks.mockLog();
    customs = {
      check: sinon.spy(() => P.resolve()),
      flag: sinon.spy(() => P.resolve({})),
    };
    config = {
      signinUnblock: {
        forcedEmailAddresses: /^blockme.+$/,
        codeLifetime: 30000,
      },
    };
    request = mocks.mockRequest({
      log,
      clientAddress: CLIENT_ADDRESS,
      payload: {},
    });
    request.emitMetricsEvent = sinon.spy(() => P.resolve());
    checkCustomsAndLoadAccount = makeSigninUtils({ log, config, db, customs })
      .checkCustomsAndLoadAccount;
  });

  it('should load the account record when customs allows the request', () => {
    return checkCustomsAndLoadAccount(request, TEST_EMAIL).then(res => {
      assert.equal(res.didSigninUnblock, false, 'did not do signin unblock');
      assert.ok(res.accountRecord, 'accountRecord was returned');
      assert.equal(
        res.accountRecord.email,
        TEST_EMAIL,
        'accountRecord has correct email'
      );

      assert.calledOnce(customs.check);
      assert.calledWithExactly(
        customs.check,
        request,
        TEST_EMAIL,
        'accountLogin'
      );

      assert.calledOnce(db.accountRecord);
      assert.calledWithExactly(db.accountRecord, TEST_EMAIL);

      assert.callOrder(customs.check, db.accountRecord);
    });
  });

  it('should throw non-customs errors directly back to the caller', () => {
    customs.check = sinon.spy(() => {
      throw new Error('unexpected!');
    });
    return checkCustomsAndLoadAccount(request, TEST_EMAIL).then(
      () => {
        assert.fail('should not succeed');
      },
      err => {
        assert.equal(
          err.message,
          'unexpected!',
          'the error was propagated to caller'
        );
        assert.calledOnce(customs.check);
        assert.notCalled(db.accountRecord);
        assert.notCalled(request.emitMetricsEvent);
      }
    );
  });

  it('should re-throw customs errors when no unblock code is specified', () => {
    const origErr = error.tooManyRequests();
    customs.check = sinon.spy(() => P.reject(origErr));
    return checkCustomsAndLoadAccount(request, TEST_EMAIL).then(
      () => {
        assert.fail('should not succeed');
      },
      err => {
        assert.deepEqual(
          err,
          origErr,
          'the original error was propagated to caller'
        );
        assert.calledOnce(customs.check);
        assert.notCalled(db.accountRecord);
        assert.calledOnce(request.emitMetricsEvent);
        assert.calledWithExactly(
          request.emitMetricsEvent,
          'account.login.blocked'
        );
      }
    );
  });

  it('login attempts on an unknown account should be flagged with customs', () => {
    db.accountRecord = sinon.spy(() => P.reject(error.unknownAccount()));
    return checkCustomsAndLoadAccount(request, TEST_EMAIL).then(
      () => {
        assert.fail('should not succeed');
      },
      err => {
        assert.equal(
          err.errno,
          error.ERRNO.ACCOUNT_UNKNOWN,
          'the correct error was thrown'
        );
        assert.calledOnce(customs.check);
        assert.calledOnce(db.accountRecord);
        assert.calledOnce(customs.flag);
        assert.calledWithExactly(customs.flag, CLIENT_ADDRESS, {
          email: TEST_EMAIL,
          errno: error.ERRNO.ACCOUNT_UNKNOWN,
        });
      }
    );
  });

  it('login attempts on an unknown account should be flagged with customs', () => {
    db.accountRecord = sinon.spy(() => P.reject(error.unknownAccount()));
    return checkCustomsAndLoadAccount(request, TEST_EMAIL).then(
      () => {
        assert.fail('should not succeed');
      },
      err => {
        assert.equal(
          err.errno,
          error.ERRNO.ACCOUNT_UNKNOWN,
          'the correct error was thrown'
        );
        assert.calledOnce(customs.check);
        assert.calledOnce(db.accountRecord);
        assert.calledOnce(customs.flag);
        assert.calledWithExactly(customs.flag, CLIENT_ADDRESS, {
          email: TEST_EMAIL,
          errno: error.ERRNO.ACCOUNT_UNKNOWN,
        });
      }
    );
  });

  it('email addresses matching a configured regex get forcibly blocked', () => {
    const email = `blockme-${TEST_EMAIL}`;
    return checkCustomsAndLoadAccount(request, email).then(
      () => {
        assert.fail('should not succeed');
      },
      err => {
        assert.equal(
          err.errno,
          error.ERRNO.REQUEST_BLOCKED,
          'the correct error was thrown'
        );
        assert.equal(
          err.output.payload.verificationMethod,
          'email-captcha',
          'the error can be unblocked'
        );

        assert.notCalled(customs.check);
        assert.notCalled(db.accountRecord);
        assert.notCalled(customs.flag);

        assert.calledOnce(request.emitMetricsEvent);
        assert.calledWithExactly(
          request.emitMetricsEvent,
          'account.login.blocked'
        );
      }
    );
  });

  it('a valid unblock code can bypass a customs block', () => {
    customs.check = sinon.spy(() =>
      P.reject(error.tooManyRequests(60, null, true))
    );
    request.payload.unblockCode = 'VaLiD';
    db.consumeUnblockCode = sinon.spy(() =>
      P.resolve({ createdAt: Date.now() })
    );
    return checkCustomsAndLoadAccount(request, TEST_EMAIL).then(res => {
      assert.equal(res.didSigninUnblock, true, 'did ignin unblock');
      assert.ok(res.accountRecord, 'accountRecord was returned');
      assert.equal(
        res.accountRecord.email,
        TEST_EMAIL,
        'accountRecord has correct email'
      );

      assert.calledOnce(customs.check);
      assert.calledOnce(db.accountRecord);

      assert.calledOnce(db.consumeUnblockCode);
      assert.calledWithExactly(db.consumeUnblockCode, TEST_UID, 'VALID'); // unblockCode got uppercased

      assert.calledTwice(request.emitMetricsEvent);
      assert.calledWithExactly(
        request.emitMetricsEvent.getCall(0),
        'account.login.blocked'
      );
      assert.calledWithExactly(
        request.emitMetricsEvent.getCall(1),
        'account.login.confirmedUnblockCode'
      );
    });
  });

  it('unblock codes are not checked for non-unblockable customs errors', () => {
    customs.check = sinon.spy(() =>
      P.reject(error.tooManyRequests(60, null, false))
    );
    request.payload.unblockCode = 'VALID';
    db.consumeUnblockCode = sinon.spy(() =>
      P.resolve({ createdAt: Date.now() })
    );
    return checkCustomsAndLoadAccount(request, TEST_EMAIL).then(
      () => {
        assert.fail('should not succeed');
      },
      err => {
        assert.equal(
          err.errno,
          error.ERRNO.THROTTLED,
          'the correct error was thrown'
        );
        assert.calledOnce(customs.check);
        assert.notCalled(db.accountRecord);
        assert.notCalled(db.consumeUnblockCode);
        assert.notCalled(customs.flag);
      }
    );
  });

  it('unblock codes are not checked for non-customs errors', () => {
    customs.check = sinon.spy(() => P.reject(error.serviceUnavailable()));
    request.payload.unblockCode = 'VALID';
    db.consumeUnblockCode = sinon.spy(() =>
      P.resolve({ createdAt: Date.now() })
    );
    return checkCustomsAndLoadAccount(request, TEST_EMAIL).then(
      () => {
        assert.fail('should not succeed');
      },
      err => {
        assert.equal(
          err.errno,
          error.ERRNO.SERVER_BUSY,
          'the correct error was thrown'
        );
        assert.calledOnce(customs.check);
        assert.notCalled(db.accountRecord);
        assert.notCalled(db.consumeUnblockCode);
        assert.notCalled(customs.flag);
      }
    );
  });

  it('unblock codes are not checked when the account does not exist', () => {
    customs.check = sinon.spy(() =>
      P.reject(error.tooManyRequests(60, null, true))
    );
    request.payload.unblockCode = 'VALID';
    db.accountRecord = sinon.spy(() => P.reject(error.unknownAccount()));
    db.consumeUnblockCode = sinon.spy(() =>
      P.resolve({ createdAt: Date.now() })
    );
    return checkCustomsAndLoadAccount(request, TEST_EMAIL).then(
      () => {
        assert.fail('should not succeed');
      },
      err => {
        assert.equal(
          err.errno,
          error.ERRNO.THROTTLED,
          'the ACCOUNT_UNKNOWN error was hidden by the customs block'
        );
        assert.calledOnce(customs.check);
        assert.calledOnce(db.accountRecord);
        assert.notCalled(db.consumeUnblockCode);
        assert.calledOnce(customs.flag);
        assert.calledWithExactly(customs.flag, CLIENT_ADDRESS, {
          email: TEST_EMAIL,
          errno: error.ERRNO.ACCOUNT_UNKNOWN,
        });
      }
    );
  });

  it('invalid unblock codes are rejected and reported to customs', () => {
    customs.check = sinon.spy(() => P.reject(error.requestBlocked(true)));
    request.payload.unblockCode = 'INVALID';
    db.consumeUnblockCode = sinon.spy(() =>
      P.reject(error.invalidUnblockCode())
    );
    return checkCustomsAndLoadAccount(request, TEST_EMAIL).then(
      () => {
        assert.fail('should not succeed');
      },
      err => {
        assert.equal(
          err.errno,
          error.ERRNO.INVALID_UNBLOCK_CODE,
          'the correct error was thrown'
        );
        assert.calledOnce(customs.check);
        assert.calledOnce(db.accountRecord);
        assert.calledOnce(db.consumeUnblockCode);

        assert.calledTwice(request.emitMetricsEvent);
        assert.calledWithExactly(
          request.emitMetricsEvent.getCall(0),
          'account.login.blocked'
        );
        assert.calledWithExactly(
          request.emitMetricsEvent.getCall(1),
          'account.login.invalidUnblockCode'
        );

        assert.calledOnce(customs.flag);
        assert.calledWithExactly(customs.flag, CLIENT_ADDRESS, {
          email: TEST_EMAIL,
          errno: error.ERRNO.INVALID_UNBLOCK_CODE,
        });
      }
    );
  });

  it('expired unblock codes are rejected as invalid', () => {
    customs.check = sinon.spy(() => P.reject(error.requestBlocked(true)));
    request.payload.unblockCode = 'EXPIRED';
    db.consumeUnblockCode = sinon.spy(() =>
      P.resolve({
        createdAt: Date.now() - config.signinUnblock.codeLifetime * 2,
      })
    );
    return checkCustomsAndLoadAccount(request, TEST_EMAIL).then(
      () => {
        assert.fail('should not succeed');
      },
      err => {
        assert.equal(
          err.errno,
          error.ERRNO.INVALID_UNBLOCK_CODE,
          'the correct error was thrown'
        );
        assert.calledOnce(customs.check);
        assert.calledOnce(db.accountRecord);
        assert.calledOnce(db.consumeUnblockCode);

        assert.calledTwice(request.emitMetricsEvent);
        assert.calledWithExactly(
          request.emitMetricsEvent.getCall(0),
          'account.login.blocked'
        );
        assert.calledWithExactly(
          request.emitMetricsEvent.getCall(1),
          'account.login.invalidUnblockCode'
        );

        assert.equal(log.info.callCount, 2);
        assert.equal(log.info.args[1][0], 'Account.login.unblockCode.expired');

        assert.calledOnce(customs.flag);
        assert.calledWithExactly(customs.flag, CLIENT_ADDRESS, {
          email: TEST_EMAIL,
          errno: error.ERRNO.INVALID_UNBLOCK_CODE,
        });
      }
    );
  });

  it('unexpected errors when checking an unblock code, cause the original customs error to be rethrown', () => {
    customs.check = sinon.spy(() => P.reject(error.requestBlocked(true)));
    request.payload.unblockCode = 'WHOOPSY';
    db.consumeUnblockCode = sinon.spy(() =>
      P.reject(error.serviceUnavailable())
    );
    return checkCustomsAndLoadAccount(request, TEST_EMAIL).then(
      () => {
        assert.fail('should not succeed');
      },
      err => {
        assert.equal(
          err.errno,
          error.ERRNO.REQUEST_BLOCKED,
          'the original customs error was re-thrown'
        );
        assert.calledOnce(customs.check);
        assert.calledOnce(db.accountRecord);
        assert.calledOnce(db.consumeUnblockCode);
        assert.notCalled(customs.flag);
      }
    );
  });
});

describe('sendSigninNotifications', () => {
  let db,
    config,
    log,
    mailer,
    metricsContext,
    request,
    accountRecord,
    sessionToken,
    sendSigninNotifications;

  beforeEach(() => {
    db = mocks.mockDB();
    log = mocks.mockLog();
    mailer = mocks.mockMailer();
    metricsContext = mocks.mockMetricsContext();
    request = mocks.mockRequest({
      log,
      metricsContext,
      clientAddress: CLIENT_ADDRESS,
      headers: {
        'user-agent': 'test user-agent',
      },
      query: {
        keys: false,
      },
      payload: {
        service: 'testservice',
        metricsContext: {
          deviceId: 'wibble',
          flowBeginTime: Date.now(),
          flowId:
            'F1031DF1031DF1031DF1031DF1031DF1031DF1031DF1031DF1031DF1031DF103',
          utmCampaign: 'utm campaign',
          utmContent: 'utm content',
          utmMedium: 'utm medium',
          utmSource: 'utm source',
          utmTerm: 'utm term',
        },
        reason: 'signin',
        redirectTo: 'redirectMeTo',
        resume: 'myResumeToken',
      },
      uaBrowser: 'Firefox Mobile',
      uaBrowserVersion: '9',
      uaOS: 'iOS',
      uaOSVersion: '11',
      uaDeviceType: 'tablet',
      uaFormFactor: 'iPad',
    });
    accountRecord = {
      uid: TEST_UID,
      primaryEmail: {
        email: TEST_EMAIL,
        isVerified: true,
        emailCode: '123123',
      },
      emails: [{ email: TEST_EMAIL, isVerified: true, isPrimary: true }],
    };
    sessionToken = {
      id: 'SESSIONTOKEN',
      uid: TEST_UID,
      email: TEST_EMAIL,
      mustVerify: false,
    };
    config = {
      otp: otpOptions,
    };

    sendSigninNotifications = makeSigninUtils({ log, db, mailer, config })
      .sendSigninNotifications;
  });

  it('emits correct notifications when no verifications are required', () => {
    return sendSigninNotifications(
      request,
      accountRecord,
      sessionToken,
      undefined
    ).then(() => {
      assert.calledOnce(metricsContext.setFlowCompleteSignal);
      assert.calledWithExactly(
        metricsContext.setFlowCompleteSignal,
        'account.login',
        'login'
      );

      assert.calledOnce(metricsContext.stash);
      assert.calledWithExactly(metricsContext.stash, sessionToken);

      assert.calledOnce(db.sessions);
      assert.calledWithExactly(db.sessions, TEST_UID);

      assert.calledOnce(log.activityEvent);
      assert.calledWithExactly(log.activityEvent, {
        country: 'United States',
        event: 'account.login',
        region: 'California',
        service: 'testservice',
        userAgent: 'test user-agent',
        uid: TEST_UID,
      });

      assert.calledTwice(log.flowEvent);
      assert.calledWithMatch(log.flowEvent.getCall(0), {
        event: 'account.login',
      });
      assert.calledWithMatch(log.flowEvent.getCall(1), {
        event: 'flow.complete',
      });

      assert.calledOnce(log.notifyAttachedServices);
      assert.calledWithExactly(log.notifyAttachedServices, 'login', request, {
        deviceCount: 0,
        email: TEST_EMAIL,
        service: 'testservice',
        uid: TEST_UID,
        userAgent: 'test user-agent',
        country: 'United States',
        countryCode: 'US',
      });

      assert.notCalled(mailer.sendVerifyEmail);
      assert.notCalled(mailer.sendVerifyLoginEmail);
      assert.notCalled(mailer.sendVerifyLoginCodeEmail);

      assert.calledOnce(db.securityEvent);
      assert.calledWithExactly(db.securityEvent, {
        name: 'account.login',
        uid: TEST_UID,
        ipAddr: CLIENT_ADDRESS,
        tokenId: 'SESSIONTOKEN',
      });
    });
  });

  describe('when when signing in with an unverified account', () => {
    beforeEach(() => {
      accountRecord.primaryEmail.isVerified = false;
      accountRecord.primaryEmail.emailCode = 'emailVerifyCode';
    });

    it('emits correct notifications when signing in with an unverified account, session verification not required', () => {
      return sendSigninNotifications(
        request,
        accountRecord,
        sessionToken,
        undefined
      ).then(() => {
        assert.calledOnce(metricsContext.setFlowCompleteSignal);
        assert.calledWithExactly(
          metricsContext.setFlowCompleteSignal,
          'account.login',
          'login'
        );

        assert.calledOnce(metricsContext.stash);

        assert.calledOnce(mailer.sendVerifyEmail);
        assert.calledWithExactly(mailer.sendVerifyEmail, [], accountRecord, {
          acceptLanguage: 'en-US',
          code: 'emailVerifyCode',
          deviceId: request.payload.metricsContext.deviceId,
          flowBeginTime: request.payload.metricsContext.flowBeginTime,
          flowId: request.payload.metricsContext.flowId,
          ip: CLIENT_ADDRESS,
          location: {
            city: 'Mountain View',
            country: 'United States',
            countryCode: 'US',
            state: 'California',
            stateCode: 'CA',
          },
          service: 'testservice',
          redirectTo: request.payload.redirectTo,
          resume: request.payload.resume,
          uid: TEST_UID,
          uaBrowser: 'Firefox Mobile',
          uaBrowserVersion: '9',
          uaOS: 'iOS',
          uaOSVersion: '11',
          uaDeviceType: 'tablet',
        });

        assert.calledThrice(log.flowEvent);
        assert.calledWithMatch(log.flowEvent.getCall(0), {
          event: 'account.login',
        });
        assert.calledWithMatch(log.flowEvent.getCall(1), {
          event: 'flow.complete',
        });
        assert.calledWithMatch(log.flowEvent.getCall(2), {
          event: 'email.verification.sent',
        });
      });
    });

    it('emits correct notifications when session verification required', () => {
      sessionToken.tokenVerified = false;
      sessionToken.tokenVerificationId = 'tokenVerifyCode';
      sessionToken.mustVerify = true;
      return sendSigninNotifications(
        request,
        accountRecord,
        sessionToken,
        undefined
      ).then(() => {
        assert.calledOnce(metricsContext.setFlowCompleteSignal);
        assert.calledWithExactly(
          metricsContext.setFlowCompleteSignal,
          'account.confirmed',
          'login'
        );

        assert.calledTwice(metricsContext.stash);
        assert.calledWithExactly(metricsContext.stash.getCall(0), sessionToken);
        assert.calledWithExactly(metricsContext.stash.getCall(1), {
          uid: TEST_UID,
          id: 'tokenVerifyCode',
        });

        assert.calledOnce(mailer.sendVerifyEmail);
        assert.calledWithExactly(mailer.sendVerifyEmail, [], accountRecord, {
          acceptLanguage: 'en-US',
          code: 'tokenVerifyCode', // the token verification code is used if available
          deviceId: request.payload.metricsContext.deviceId,
          flowBeginTime: request.payload.metricsContext.flowBeginTime,
          flowId: request.payload.metricsContext.flowId,
          ip: CLIENT_ADDRESS,
          location: {
            city: 'Mountain View',
            country: 'United States',
            countryCode: 'US',
            state: 'California',
            stateCode: 'CA',
          },
          service: 'testservice',
          redirectTo: request.payload.redirectTo,
          resume: request.payload.resume,
          uid: TEST_UID,
          uaBrowser: 'Firefox Mobile',
          uaBrowserVersion: '9',
          uaOS: 'iOS',
          uaOSVersion: '11',
          uaDeviceType: 'tablet',
        });

        assert.calledTwice(log.flowEvent);
        assert.calledWithMatch(log.flowEvent.getCall(0), {
          event: 'account.login',
        });
        assert.calledWithMatch(log.flowEvent.getCall(1), {
          event: 'email.verification.sent',
        });

        assert.calledOnce(log.notifyAttachedServices);
        assert.calledWithExactly(log.notifyAttachedServices, 'login', request, {
          deviceCount: 0,
          email: TEST_EMAIL,
          service: 'testservice',
          uid: TEST_UID,
          userAgent: 'test user-agent',
          country: 'United States',
          countryCode: 'US',
        });
      });
    });

    afterEach(() => {
      assert.calledOnce(db.sessions);
      assert.calledOnce(log.activityEvent);

      assert.notCalled(mailer.sendVerifyLoginEmail);
      assert.notCalled(mailer.sendVerifyLoginCodeEmail);

      assert.calledOnce(db.securityEvent);
    });
  });

  describe('when signing in with a verified account, session already verified', () => {
    it('emits correct notifications, and sends no emails', () => {
      sessionToken.tokenVerified = true;
      sessionToken.mustVerify = true;
      return sendSigninNotifications(
        request,
        accountRecord,
        sessionToken,
        undefined
      ).then(() => {
        assert.calledOnce(metricsContext.setFlowCompleteSignal);
        assert.calledWithExactly(
          metricsContext.setFlowCompleteSignal,
          'account.login',
          'login'
        );

        assert.calledOnce(metricsContext.stash);
        assert.calledOnce(db.sessions);
        assert.calledOnce(log.activityEvent);
        assert.calledOnce(log.notifyAttachedServices);
        assert.calledWithExactly(log.notifyAttachedServices, 'login', request, {
          deviceCount: 0,
          email: TEST_EMAIL,
          service: 'testservice',
          uid: TEST_UID,
          userAgent: 'test user-agent',
          country: 'United States',
          countryCode: 'US',
        });

        assert.notCalled(mailer.sendVerifyEmail);
        assert.notCalled(mailer.sendVerifyLoginEmail);
        assert.notCalled(mailer.sendVerifyLoginCodeEmail);
        assert.notCalled(mailer.sendNewDeviceLoginEmail);

        assert.calledTwice(log.flowEvent);
        assert.calledWithMatch(log.flowEvent.getCall(0), {
          event: 'account.login',
        });
        assert.calledWithMatch(log.flowEvent.getCall(1), {
          event: 'flow.complete',
        });

        assert.calledOnce(db.securityEvent);
      });
    });
  });

  describe('when signing in with a verified account, unverified session', () => {
    beforeEach(() => {
      sessionToken.tokenVerified = false;
      sessionToken.tokenVerificationId = 'tokenVerifyCode';
      sessionToken.tokenVerificationCode = 'tokenVerifyShortCode';
      sessionToken.mustVerify = true;
    });

    it('emits correct notifications when verificationMethod is not specified', () => {
      return sendSigninNotifications(
        request,
        accountRecord,
        sessionToken,
        undefined
      ).then(() => {
        assert.notCalled(mailer.sendVerifyEmail);
        assert.notCalled(mailer.sendVerifyLoginCodeEmail);
        assert.calledOnce(mailer.sendVerifyLoginEmail);
        assert.calledWithExactly(
          mailer.sendVerifyLoginEmail,
          accountRecord.emails,
          accountRecord,
          {
            acceptLanguage: 'en-US',
            code: 'tokenVerifyCode',
            deviceId: request.payload.metricsContext.deviceId,
            flowBeginTime: request.payload.metricsContext.flowBeginTime,
            flowId: request.payload.metricsContext.flowId,
            ip: CLIENT_ADDRESS,
            location: {
              city: 'Mountain View',
              country: 'United States',
              countryCode: 'US',
              state: 'California',
              stateCode: 'CA',
            },
            redirectTo: request.payload.redirectTo,
            resume: request.payload.resume,
            service: 'testservice',
            timeZone: 'America/Los_Angeles',
            uaBrowser: 'Firefox Mobile',
            uaBrowserVersion: '9',
            uaOS: 'iOS',
            uaOSVersion: '11',
            uaDeviceType: 'tablet',
            uid: TEST_UID,
          }
        );

        assert.calledTwice(log.flowEvent);
        assert.calledWithMatch(log.flowEvent.getCall(0), {
          event: 'account.login',
        });
        assert.calledWithMatch(log.flowEvent.getCall(1), {
          event: 'email.confirmation.sent',
        });
      });
    });

    it('emits correct notifications when verificationMethod=email', () => {
      return sendSigninNotifications(
        request,
        accountRecord,
        sessionToken,
        'email'
      ).then(() => {
        assert.notCalled(mailer.sendVerifyEmail);
        assert.notCalled(mailer.sendVerifyLoginCodeEmail);
        assert.calledOnce(mailer.sendVerifyLoginEmail);

        assert.calledTwice(log.flowEvent);
        assert.calledWithMatch(log.flowEvent.getCall(0), {
          event: 'account.login',
        });
        assert.calledWithMatch(log.flowEvent.getCall(1), {
          event: 'email.confirmation.sent',
        });
      });
    });

    it('emits correct notifications when verificationMethod=email-2fa', () => {
      return sendSigninNotifications(
        request,
        accountRecord,
        sessionToken,
        'email-2fa'
      ).then(() => {
        assert.notCalled(mailer.sendVerifyEmail);
        assert.notCalled(mailer.sendVerifyLoginEmail);
        assert.calledOnce(mailer.sendVerifyLoginCodeEmail);

        const expectedCode = otpUtils.generateOtpCode(
          accountRecord.primaryEmail.emailCode,
          otpOptions
        );
        assert.calledWithExactly(
          mailer.sendVerifyLoginCodeEmail,
          accountRecord.emails,
          accountRecord,
          {
            acceptLanguage: 'en-US',
            code: expectedCode,
            deviceId: request.payload.metricsContext.deviceId,
            flowBeginTime: request.payload.metricsContext.flowBeginTime,
            flowId: request.payload.metricsContext.flowId,
            ip: CLIENT_ADDRESS,
            location: {
              city: 'Mountain View',
              country: 'United States',
              countryCode: 'US',
              state: 'California',
              stateCode: 'CA',
            },
            redirectTo: request.payload.redirectTo,
            resume: request.payload.resume,
            service: 'testservice',
            timeZone: 'America/Los_Angeles',
            uaBrowser: 'Firefox Mobile',
            uaBrowserVersion: '9',
            uaOS: 'iOS',
            uaOSVersion: '11',
            uaDeviceType: 'tablet',
            uid: TEST_UID,
          }
        );

        assert.calledTwice(log.flowEvent);
        assert.calledWithMatch(log.flowEvent.getCall(0), {
          event: 'account.login',
        });
        assert.calledWithMatch(log.flowEvent.getCall(1), {
          event: 'email.tokencode.sent',
        });
      });
    });

    it('emits correct notifications when verificationMethod=email-captcha', () => {
      return sendSigninNotifications(
        request,
        accountRecord,
        sessionToken,
        'email-captcha'
      ).then(() => {
        assert.notCalled(mailer.sendVerifyEmail);
        assert.notCalled(mailer.sendVerifyLoginEmail);
        assert.notCalled(mailer.sendVerifyLoginCodeEmail);

        assert.calledOnce(log.flowEvent);
        assert.calledWithMatch(log.flowEvent, { event: 'account.login' });
      });
    });

    afterEach(() => {
      assert.calledOnce(metricsContext.setFlowCompleteSignal);
      assert.calledWithExactly(
        metricsContext.setFlowCompleteSignal,
        'account.confirmed',
        'login'
      );

      assert.calledTwice(metricsContext.stash);
      assert.calledWithExactly(metricsContext.stash.getCall(0), sessionToken);
      assert.calledWithExactly(metricsContext.stash.getCall(1), {
        uid: TEST_UID,
        id: 'tokenVerifyCode',
      });

      assert.calledOnce(db.sessions);
      assert.calledOnce(log.activityEvent);
      assert.calledOnce(log.notifyAttachedServices);
      assert.calledWithExactly(log.notifyAttachedServices, 'login', request, {
        deviceCount: 0,
        email: TEST_EMAIL,
        service: 'testservice',
        uid: TEST_UID,
        userAgent: 'test user-agent',
        country: 'United States',
        countryCode: 'US',
      });
      assert.calledOnce(db.securityEvent);
    });
  });

  describe('when signing in for another reason', () => {
    beforeEach(() => {
      request.payload.reason = 'blee';
    });

    it('does not notify attached services of login', async () => {
      await sendSigninNotifications(
        request,
        accountRecord,
        sessionToken,
        'email-2fa'
      );
      assert.notCalled(log.notifyAttachedServices);
    });
  });

  describe('when signing in with service=sync', () => {
    beforeEach(() => {
      request.payload.service = 'sync';
    });

    it('emits correct notifications with one active session', () => {
      db.sessions = sinon.spy(() => P.resolve([sessionToken]));
      return sendSigninNotifications(
        request,
        accountRecord,
        sessionToken,
        undefined
      ).then(() => {
        assert.calledOnce(log.notifyAttachedServices);
        assert.calledWithExactly(log.notifyAttachedServices, 'login', request, {
          service: 'sync',
          uid: TEST_UID,
          email: TEST_EMAIL,
          deviceCount: 1,
          userAgent: 'test user-agent',
          country: 'United States',
          countryCode: 'US',
        });
      });
    });

    it('emits correct notifications  with many active sessions', () => {
      db.sessions = sinon.spy(() => P.resolve([{}, {}, {}, sessionToken]));
      return sendSigninNotifications(
        request,
        accountRecord,
        sessionToken,
        undefined
      ).then(() => {
        assert.calledOnce(log.notifyAttachedServices);
        assert.calledWithExactly(log.notifyAttachedServices, 'login', request, {
          service: 'sync',
          uid: TEST_UID,
          email: TEST_EMAIL,
          deviceCount: 4,
          userAgent: 'test user-agent',
          country: 'United States',
          countryCode: 'US',
        });
      });
    });

    afterEach(() => {
      assert.calledOnce(metricsContext.setFlowCompleteSignal);
      assert.calledWithExactly(
        metricsContext.setFlowCompleteSignal,
        'account.signed',
        'login'
      );

      assert.calledOnce(metricsContext.stash);
      assert.calledOnce(db.sessions);
      assert.calledOnce(log.activityEvent);

      assert.calledOnce(log.flowEvent);
      assert.calledWithMatch(log.flowEvent, { event: 'account.login' });

      assert.calledOnce(db.securityEvent);
    });
  });
});

describe('createKeyFetchToken', () => {
  let password,
    db,
    metricsContext,
    request,
    accountRecord,
    sessionToken,
    createKeyFetchToken;

  beforeEach(() => {
    db = mocks.mockDB();
    password = {
      unwrap: sinon.spy(() => P.resolve(Buffer.from('abcdef123456'))),
    };
    db.createKeyFetchToken = sinon.spy(() =>
      P.resolve({ id: 'KEY_FETCH_TOKEN' })
    );
    metricsContext = mocks.mockMetricsContext();
    request = mocks.mockRequest({
      metricsContext,
    });
    accountRecord = {
      uid: TEST_UID,
      kA: Buffer.from('fedcba012345'),
      wrapWrapKb: Buffer.from('012345fedcba'),
      primaryEmail: { isVerified: true },
    };
    sessionToken = {
      id: 'SESSIONTOKEN',
      uid: TEST_UID,
      email: TEST_EMAIL,
      tokenVerificationId: 'tokenVerifyCode',
    };
    createKeyFetchToken = makeSigninUtils({ db }).createKeyFetchToken;
  });

  it('creates a keyFetchToken using unwrapped wrapKb', () => {
    return createKeyFetchToken(
      request,
      accountRecord,
      password,
      sessionToken
    ).then(res => {
      assert.deepEqual(
        res,
        { id: 'KEY_FETCH_TOKEN' },
        'returned the keyFetchToken'
      );

      assert.calledOnce(password.unwrap);
      assert.calledWithExactly(password.unwrap, accountRecord.wrapWrapKb);

      assert.calledOnce(db.createKeyFetchToken);
      assert.calledWithExactly(db.createKeyFetchToken, {
        uid: TEST_UID,
        kA: accountRecord.kA,
        wrapKb: Buffer.from('abcdef123456'),
        emailVerified: true,
        tokenVerificationId: 'tokenVerifyCode',
      });
    });
  });

  it('stashes metricsContext on the keyFetchToken', () => {
    return createKeyFetchToken(
      request,
      accountRecord,
      password,
      sessionToken
    ).then(() => {
      assert.calledOnce(metricsContext.stash);
      assert.calledOn(metricsContext.stash, request);
      assert.calledWithExactly(metricsContext.stash, { id: 'KEY_FETCH_TOKEN' });
    });
  });
});

describe('getSessionVerificationStatus', () => {
  let getSessionVerificationStatus;

  beforeEach(() => {
    getSessionVerificationStatus = makeSigninUtils({})
      .getSessionVerificationStatus;
  });

  it('correctly reports verified sessions as verified', () => {
    const sessionToken = {
      emailVerified: true,
      tokenVerified: true,
    };
    const res = getSessionVerificationStatus(sessionToken);
    assert.deepEqual(res, { verified: true });
  });

  it('correctly reports unverified sessions with mustVerify=false as verified', () => {
    const sessionToken = {
      emailVerified: true,
      tokenVerified: false,
      mustVerify: false,
    };
    const res = getSessionVerificationStatus(sessionToken);
    assert.deepEqual(res, { verified: true });
  });

  it('correctly reports unverified accounts as unverified', () => {
    const sessionToken = {
      emailVerified: false,
      tokenVerified: false,
      mustVerify: false,
    };
    const res = getSessionVerificationStatus(sessionToken);
    assert.deepEqual(res, {
      verified: false,
      verificationMethod: 'email',
      verificationReason: 'signup',
    });
  });

  it('correctly reports unverified sessions with mustVerify=true as unverified', () => {
    const sessionToken = {
      emailVerified: true,
      tokenVerified: false,
      mustVerify: true,
    };
    const res = getSessionVerificationStatus(sessionToken);
    assert.deepEqual(res, {
      verified: false,
      verificationMethod: 'email',
      verificationReason: 'login',
    });
  });

  it('correctly echos custom verificationMethod param for logins', () => {
    const sessionToken = {
      emailVerified: true,
      tokenVerified: false,
      mustVerify: true,
    };
    const res = getSessionVerificationStatus(sessionToken, 'email-2fa');
    assert.deepEqual(res, {
      verified: false,
      verificationMethod: 'email-2fa',
      verificationReason: 'login',
    });
  });

  it('does not echo custom verificationMethod param for signups', () => {
    const sessionToken = {
      emailVerified: false,
      tokenVerified: false,
      mustVerify: true,
    };
    const res = getSessionVerificationStatus(sessionToken, 'email-2fa');
    assert.deepEqual(res, {
      verified: false,
      verificationMethod: 'email',
      verificationReason: 'signup',
    });
  });
});
