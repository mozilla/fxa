/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const sinon = require('sinon');
const assert = { ...sinon.assert, ...require('chai').assert };
const { Container } = require('typedi');

const mocks = require('../../../mocks');
const Password = require('../../../../lib/crypto/password')({}, {});
const { AppError: error } = require('@fxa/accounts/errors');
const butil = require('../../../../lib/crypto/butil');
const otpUtils = require('../../../../lib/routes/utils/otp').default(
  {},
  { histogram: () => {} }
);
const { AppConfig } = require('../../../../lib/types');
const { AccountEventsManager } = require('../../../../lib/account-events');
const { RelyingPartyConfigurationManager } = require('@fxa/shared/cms');
const glean = mocks.mockGlean();

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
  config.authFirestore = config.authFirestore || {};
  config.securityHistory = config.securityHistory || {};
  Container.set(AppConfig, config);
  Container.set(AccountEventsManager, new AccountEventsManager());
  const customs = options.customs || {};
  const db = options.db || mocks.mockDB();
  const mailer = options.mailer || {};
  const cadReminders = options.cadReminders || mocks.mockCadReminders();
  return require('../../../../lib/routes/utils/signin')(
    log,
    config,
    customs,
    db,
    mailer,
    cadReminders,
    glean
  );
}

describe('checkPassword', () => {
  let customs, db, signinUtils;

  beforeEach(() => {
    mocks.mockOAuthClientInfo();
    db = mocks.mockDB();
    customs = {
      v2Enabled: sinon.spy(() => true),
      check: sinon.spy(() => Promise.resolve(false)),
      flag: sinon.spy(() => Promise.resolve({})),
    };
    signinUtils = makeSigninUtils({ db, customs });
  });

  it('should check with correct password', () => {
    db.checkPassword = sinon.spy((uid) =>
      Promise.resolve({
        v1: true,
        v2: false,
      })
    );
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

    return password.verifyHash().then((hash) => {
      return signinUtils
        .checkPassword(accountRecord, password, {
          app: { clientAddress: CLIENT_ADDRESS },
        })
        .then((match) => {
          assert.ok(match, 'password matches, checkPassword returns true');

          assert.calledOnce(db.checkPassword);
          assert.calledWithExactly(db.checkPassword, TEST_UID, hash);

          assert.notCalled(customs.flag);
        });
    });
  });

  it('should return false when check with incorrect password', () => {
    db.checkPassword = sinon.spy((uid) => Promise.resolve(false));
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

    return Promise.all([
      goodPassword.verifyHash(),
      badPassword.verifyHash(),
    ]).then(([goodHash, badHash]) => {
      assert.notEqual(
        goodHash,
        badHash,
        'bad password actually has a different hash'
      );
      return signinUtils
        .checkPassword(accountRecord, badPassword, {
          app: { clientAddress: CLIENT_ADDRESS },
        })
        .then((match) => {
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
    });
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
      .checkPassword(accountRecord, incorrectPassword, {
        app: { clientAddress: CLIENT_ADDRESS },
      })
      .then(
        (match) => {
          assert(false, 'password check should not have succeeded');
        },
        (err) => {
          assert.equal(
            err.errno,
            error.ERRNO.ACCOUNT_RESET,
            'an ACCOUNT_RESET error was thrown'
          );

          assert.calledOnce(customs.check);
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

describe('checkEmailAddress', () => {
  let accountRecord, checkEmailAddress;

  beforeEach(() => {
    accountRecord = {
      uid: 'testUid',
      primaryEmail: { normalizedEmail: 'primary@example.com' },
    };
    checkEmailAddress = makeSigninUtils({}).checkEmailAddress;
  });

  it('should return true when email matches primary after normalization', () => {
    assert.ok(
      checkEmailAddress(accountRecord, 'primary@example.com'),
      'matches primary'
    );
    assert.ok(
      checkEmailAddress(accountRecord, 'PrIMArY@example.com'),
      'matches primary when lowercased'
    );
  });

  it('should throw when email does not match primary after normalization', () => {
    assert.throws(
      () => checkEmailAddress(accountRecord, 'secondary@test.net'),
      'Sign in with this email type is not currently supported'
    );
    assert.throws(
      () => checkEmailAddress(accountRecord, 'something@else.org'),
      'Sign in with this email type is not currently supported'
    );
  });

  describe('with originalLoginEmail parameter', () => {
    it('should return true when originalLoginEmail matches primry after normalization', () => {
      assert.ok(
        checkEmailAddress(accountRecord, 'other@email', 'primary@example.com'),
        'matches primary'
      );
      assert.ok(
        checkEmailAddress(accountRecord, 'other@email', 'PrIMArY@example.com'),
        'matches primary when lowercased'
      );
    });

    it('should throw when originalLoginEmail does not match primary after normalization', () => {
      assert.throws(
        () =>
          checkEmailAddress(accountRecord, 'other@email', 'secondary@test.net'),
        'Sign in with this email type is not currently supported'
      );
      assert.throws(
        () =>
          checkEmailAddress(accountRecord, 'other@email', 'something@else.org'),
        'Sign in with this email type is not currently supported'
      );
    });
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
      v2Enabled: sinon.spy(() => true),
      check: sinon.spy(() => Promise.resolve()),
      flag: sinon.spy(() => Promise.resolve({})),
      resetV2: sinon.spy(() => Promise.resolve()),
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
    request.emitMetricsEvent = sinon.spy(() => Promise.resolve());
    checkCustomsAndLoadAccount = makeSigninUtils({
      log,
      config,
      db,
      customs,
    }).checkCustomsAndLoadAccount;
  });

  it('should load the account record when customs allows the request', () => {
    return checkCustomsAndLoadAccount(request, TEST_EMAIL).then((res) => {
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
      (err) => {
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
    customs.check = sinon.spy(() => Promise.reject(origErr));
    return checkCustomsAndLoadAccount(request, TEST_EMAIL).then(
      () => {
        assert.fail('should not succeed');
      },
      (err) => {
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
    db.accountRecord = sinon.spy(() => Promise.reject(error.unknownAccount()));
    return checkCustomsAndLoadAccount(request, TEST_EMAIL).then(
      () => {
        assert.fail('should not succeed');
      },
      (err) => {
        assert.equal(
          err.errno,
          error.ERRNO.ACCOUNT_UNKNOWN,
          'the correct error was thrown'
        );
        assert.calledTwice(customs.check);
        assert.calledWithMatch(
          customs.check,
          sinon.match.object,
          TEST_EMAIL,
          'accountLogin'
        );
        assert.calledWithMatch(
          customs.check,
          sinon.match.object,
          TEST_EMAIL,
          'loadAccountFailed'
        );
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
    db.accountRecord = sinon.spy(() => Promise.reject(error.unknownAccount()));
    return checkCustomsAndLoadAccount(request, TEST_EMAIL).then(
      () => {
        assert.fail('should not succeed');
      },
      (err) => {
        assert.equal(
          err.errno,
          error.ERRNO.ACCOUNT_UNKNOWN,
          'the correct error was thrown'
        );
        assert.calledTwice(customs.check);
        assert.calledWithMatch(
          customs.check,
          sinon.match.object,
          TEST_EMAIL,
          'accountLogin'
        );
        assert.calledWithMatch(
          customs.check,
          sinon.match.object,
          TEST_EMAIL,
          'loadAccountFailed'
        );
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
      (err) => {
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
      Promise.reject(error.tooManyRequests(60, null, true))
    );
    request.payload.unblockCode = 'VaLiD';
    db.consumeUnblockCode = sinon.spy(() =>
      Promise.resolve({ createdAt: Date.now() })
    );
    return checkCustomsAndLoadAccount(request, TEST_EMAIL).then((res) => {
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
      Promise.reject(error.tooManyRequests(60, null, false))
    );
    request.payload.unblockCode = 'VALID';
    db.consumeUnblockCode = sinon.spy(() =>
      Promise.resolve({ createdAt: Date.now() })
    );
    return checkCustomsAndLoadAccount(request, TEST_EMAIL).then(
      () => {
        assert.fail('should not succeed');
      },
      (err) => {
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
    customs.check = sinon.spy(() => Promise.reject(error.serviceUnavailable()));
    request.payload.unblockCode = 'VALID';
    db.consumeUnblockCode = sinon.spy(() =>
      Promise.resolve({ createdAt: Date.now() })
    );
    return checkCustomsAndLoadAccount(request, TEST_EMAIL).then(
      () => {
        assert.fail('should not succeed');
      },
      (err) => {
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
    customs.check = sinon.spy((_request, _email, action) => {
      if (action === 'accountLogin') {
        return Promise.reject(error.tooManyRequests(60, null, true));
      }
      return Promise.resolve(false);
    });
    request.payload.unblockCode = 'VALID';
    db.accountRecord = sinon.spy(() => Promise.reject(error.unknownAccount()));
    db.consumeUnblockCode = sinon.spy(() =>
      Promise.resolve({ createdAt: Date.now() })
    );
    return checkCustomsAndLoadAccount(request, TEST_EMAIL).then(
      () => {
        assert.fail('should not succeed');
      },
      (err) => {
        assert.equal(
          err.errno,
          error.ERRNO.THROTTLED,
          'the ACCOUNT_UNKNOWN error was hidden by the customs block'
        );
        assert.calledTwice(customs.check);
        assert.calledWithMatch(
          customs.check,
          sinon.match.object,
          TEST_EMAIL,
          'accountLogin'
        );
        assert.calledWithMatch(
          customs.check,
          sinon.match.object,
          TEST_EMAIL,
          'loadAccountFailed'
        );
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
    customs.check = sinon.spy((request, email, action) => {
      if (action === 'accountLogin') {
        return Promise.reject(error.requestBlocked(true));
      }
      return Promise.resolve(false);
    });
    request.payload.unblockCode = 'INVALID';
    db.consumeUnblockCode = sinon.spy(() =>
      Promise.reject(error.invalidUnblockCode())
    );
    return checkCustomsAndLoadAccount(request, TEST_EMAIL).then(
      () => {
        assert.fail('should not succeed');
      },
      (err) => {
        assert.equal(
          err.errno,
          error.ERRNO.INVALID_UNBLOCK_CODE,
          'the correct error was thrown'
        );
        assert.calledTwice(customs.check);
        assert.calledWithMatch(
          customs.check,
          sinon.match.object,
          TEST_EMAIL,
          'accountLogin'
        );
        assert.calledWithMatch(
          customs.check,
          sinon.match.object,
          TEST_EMAIL,
          'unblockCodeFailed'
        );
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
    customs.check = sinon.spy((_request, _email, action) => {
      if (action === 'accountLogin') {
        return Promise.reject(error.requestBlocked(true));
      }
      return Promise.resolve(false);
    });
    request.payload.unblockCode = 'EXPIRED';
    db.consumeUnblockCode = sinon.spy(() =>
      Promise.resolve({
        createdAt: Date.now() - config.signinUnblock.codeLifetime * 2,
      })
    );
    return checkCustomsAndLoadAccount(request, TEST_EMAIL).then(
      () => {
        assert.fail('should not succeed');
      },
      (err) => {
        assert.equal(
          err.errno,
          error.ERRNO.INVALID_UNBLOCK_CODE,
          'the correct error was thrown'
        );
        assert.calledTwice(customs.check);
        assert.calledWithMatch(
          customs.check.getCall(0),
          sinon.match.object,
          TEST_EMAIL,
          'accountLogin'
        );
        assert.calledWithMatch(
          customs.check.getCall(1),
          sinon.match.object,
          TEST_EMAIL,
          'unblockCodeFailed'
        );
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

  it('unexpected errors when checking an unblock code, cause the original customs error to be rethrown', () => {
    customs.check = sinon.spy(() => Promise.reject(error.requestBlocked(true)));
    request.payload.unblockCode = 'WHOOPSY';
    db.consumeUnblockCode = sinon.spy(() =>
      Promise.reject(error.serviceUnavailable())
    );
    return checkCustomsAndLoadAccount(request, TEST_EMAIL).then(
      () => {
        assert.fail('should not succeed');
      },
      (err) => {
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
    fxaMailer,
    metricsContext,
    request,
    accountRecord,
    sessionToken,
    sendSigninNotifications,
    clock;
  const defaultMockRequestData = (log, metricsContext) => ({
    log,
    metricsContext,
    clientAddress: CLIENT_ADDRESS,
    headers: {
      'user-agent': 'test user-agent',
      'x-sigsci-requestid': 'test-sigsci-id',
      'client-ja4': 'test-ja4',
    },
    query: {
      keys: false,
    },
    payload: {
      metricsContext: {
        deviceId: 'wibble',
        flowBeginTime: Date.now(),
        flowId:
          'F1031DF1031DF1031DF1031DF1031DF1031DF1031DF1031DF1031DF1031DF103',
        clientId: '00f00f',
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

  beforeEach(() => {
    // Freeze time at a specific timestamp for consistent test assertions
    clock = sinon.useFakeTimers(1769555935958);

    db = mocks.mockDB();
    log = mocks.mockLog();
    mailer = mocks.mockMailer();
    mocks.mockOAuthClientInfo();
    fxaMailer = mocks.mockFxaMailer();
    metricsContext = mocks.mockMetricsContext();
    request = mocks.mockRequest(defaultMockRequestData(log, metricsContext));
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
      tokenVerified: true,
    };
    config = {
      otp: otpOptions,
      servicesWithEmailVerification: ['e6eb0d1e856335fc'],
    };

    sendSigninNotifications = makeSigninUtils({
      log,
      db,
      mailer,
      config,
    }).sendSigninNotifications;
  });

  afterEach(() => {
    if (clock) {
      clock.restore();
    }
  });

  after(() => {
    Container.reset();
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
        service: undefined,
        userAgent: 'test user-agent',
        sigsciRequestId: 'test-sigsci-id',
        clientJa4: 'test-ja4',
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
        service: undefined,
        uid: TEST_UID,
        userAgent: 'test user-agent',
        country: 'United States',
        countryCode: 'US',
      });

      assert.notCalled(fxaMailer.sendVerifyEmail);
      assert.notCalled(fxaMailer.sendVerifyLoginEmail);
      assert.notCalled(fxaMailer.sendVerifyLoginCodeEmail);

      assert.calledOnce(db.securityEvent);
      assert.calledWithExactly(db.securityEvent, {
        name: 'account.login',
        uid: TEST_UID,
        ipAddr: CLIENT_ADDRESS,
        tokenId: 'SESSIONTOKEN',
        additionalInfo: {
          userAgent: 'test user-agent',
          location: {
            city: 'Mountain View',
            country: 'United States',
            countryCode: 'US',
            state: 'California',
            stateCode: 'CA',
          },
        },
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

        assert.calledOnce(fxaMailer.sendVerifyEmail);
        assert.calledWithExactly(fxaMailer.sendVerifyEmail, {
          to: 'test@example.com',
          cc: [],
          metricsEnabled: true,
          uid: 'thisisauid',
          deviceId: 'wibble',
          flowId:
            'F1031DF1031DF1031DF1031DF1031DF1031DF1031DF1031DF1031DF1031DF103',
          flowBeginTime: 1769555935958,
          entrypoint: undefined,
          sync: false,
          acceptLanguage: 'en-US',
          date: 'Tuesday, Jan 27, 2026',
          time: '3:18:55 PM (PST)',
          timeZone: 'America/Los_Angeles',
          location: {
            stateCode: 'CA',
            country: 'United States',
            city: 'Mountain View',
          },
          device: {
            uaBrowser: 'Firefox Mobile',
            uaOS: 'iOS',
            uaOSVersion: '11',
          },
          code: 'emailVerifyCode',
          resume: 'myResumeToken',
          service: undefined,
          redirectTo: 'redirectMeTo',
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

        assert.calledOnce(fxaMailer.sendVerifyEmail);
        assert.calledWithExactly(fxaMailer.sendVerifyEmail, {
          to: 'test@example.com',
          cc: [],
          metricsEnabled: true,
          uid: 'thisisauid',
          deviceId: 'wibble',
          flowId:
            'F1031DF1031DF1031DF1031DF1031DF1031DF1031DF1031DF1031DF1031DF103',
          flowBeginTime: 1769555935958,
          entrypoint: undefined,
          sync: false,
          acceptLanguage: 'en-US',
          date: 'Tuesday, Jan 27, 2026',
          time: '3:18:55 PM (PST)',
          timeZone: 'America/Los_Angeles',
          location: {
            stateCode: 'CA',
            country: 'United States',
            city: 'Mountain View',
          },
          device: {
            uaBrowser: 'Firefox Mobile',
            uaOS: 'iOS',
            uaOSVersion: '11',
          },
          code: 'tokenVerifyCode',
          resume: 'myResumeToken',
          service: undefined,
          redirectTo: 'redirectMeTo',
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
          service: undefined,
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

      assert.notCalled(fxaMailer.sendVerifyLoginEmail);
      assert.notCalled(fxaMailer.sendVerifyLoginCodeEmail);

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
          service: undefined,
          uid: TEST_UID,
          userAgent: 'test user-agent',
          country: 'United States',
          countryCode: 'US',
        });

        assert.notCalled(fxaMailer.sendVerifyEmail);
        assert.notCalled(fxaMailer.sendVerifyLoginEmail);
        assert.notCalled(fxaMailer.sendVerifyLoginCodeEmail);
        assert.notCalled(fxaMailer.sendNewDeviceLoginEmail);

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
      sessionToken.mustVerify = true;
    });

    it('emits correct notifications when verificationMethod is not specified', () => {
      return sendSigninNotifications(
        request,
        accountRecord,
        sessionToken,
        undefined
      ).then(() => {
        assert.notCalled(fxaMailer.sendVerifyEmail);
        assert.notCalled(mailer.sendVerifyLoginCodeEmail);
        assert.calledOnce(fxaMailer.sendVerifyLoginEmail);
        assert.calledWithExactly(fxaMailer.sendVerifyLoginEmail, {
          to: TEST_EMAIL,
          cc: [],
          metricsEnabled: true,
          uid: TEST_UID,
          deviceId: request.payload.metricsContext.deviceId,
          flowId: request.payload.metricsContext.flowId,
          flowBeginTime: request.payload.metricsContext.flowBeginTime,
          entrypoint: undefined,
          sync: false,
          acceptLanguage: 'en-US',
          date: 'Tuesday, Jan 27, 2026',
          time: '3:18:55 PM (PST)',
          timeZone: 'America/Los_Angeles',
          location: {
            stateCode: 'CA',
            country: 'United States',
            city: 'Mountain View',
          },
          device: {
            uaBrowser: 'Firefox Mobile',
            uaOS: 'iOS',
            uaOSVersion: '11',
          },
          code: 'tokenVerifyCode',
          clientName: 'sync',
          redirectTo: request.payload.redirectTo,
          service: undefined,
          resume: request.payload.resume,
        });

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
        assert.notCalled(fxaMailer.sendVerifyEmail);
        assert.notCalled(fxaMailer.sendVerifyLoginCodeEmail);
        assert.calledOnce(fxaMailer.sendVerifyLoginEmail);

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
      const oauthClientInfoMock = mocks.mockOAuthClientInfo({
        fetch: sinon.stub().resolves({ name: undefined }),
      });
      // Re-initialize sendSigninNotifications to pick up the new mock
      const localSendSigninNotifications = makeSigninUtils({
        log,
        db,
        mailer,
        config,
      }).sendSigninNotifications;
      return localSendSigninNotifications(
        request,
        accountRecord,
        sessionToken,
        'email-2fa'
      ).then(() => {
        assert.notCalled(fxaMailer.sendVerifyEmail);
        assert.notCalled(fxaMailer.sendVerifyLoginEmail);
        assert.calledOnce(fxaMailer.sendVerifyLoginCodeEmail);

        const expectedCode = otpUtils.generateOtpCode(
          accountRecord.primaryEmail.emailCode,
          otpOptions
        );
        assert.calledWithMatch(fxaMailer.sendVerifyLoginCodeEmail, {
          to: TEST_EMAIL,
          cc: [],
          metricsEnabled: true,
          uid: TEST_UID,
          code: expectedCode,
          redirectTo: request.payload.redirectTo,
          resume: request.payload.resume,
          serviceName: undefined,
        });

        assert.calledOnce(oauthClientInfoMock.fetch);

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
        assert.notCalled(fxaMailer.sendVerifyEmail);
        assert.notCalled(fxaMailer.sendVerifyLoginEmail);
        assert.notCalled(fxaMailer.sendVerifyLoginCodeEmail);

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
        service: undefined,
        uid: TEST_UID,
        userAgent: 'test user-agent',
        country: 'United States',
        countryCode: 'US',
      });
      assert.calledOnce(db.securityEvent);
    });
  });

  describe('email verification sending', () => {
    beforeEach(() => {
      mocks.mockOAuthClientInfo();
      sessionToken.tokenVerified = false;
    });

    it('passes service parameter correctly when request wantsKeys', () => {
      mocks.mockOAuthClientInfo();
      request.query.keys = true;
      request.query.service = 'sync';
      return sendSigninNotifications(
        request,
        accountRecord,
        sessionToken,
        'email-otp'
      ).then(() => {
        assert.calledOnce(fxaMailer.sendVerifyLoginCodeEmail);
        const callArgs = fxaMailer.sendVerifyLoginCodeEmail.getCall(0).args[0];
        assert.equal(callArgs.serviceName, 'sync');
      });
    });

    it('passes service parameter correctly when service is undefined', () => {
      const oauthClientInfoMock = mocks.mockOAuthClientInfo();
      request.payload.service = undefined;

      // Re-initialize sendSigninNotifications to pick up the new oauthClientInfoMock
      const localSendSigninNotifications = makeSigninUtils({
        log,
        db,
        mailer,
        config,
      }).sendSigninNotifications;

      return localSendSigninNotifications(
        request,
        accountRecord,
        sessionToken,
        'email-otp'
      ).then(() => {
        assert.calledOnce(fxaMailer.sendVerifyLoginCodeEmail);
        assert.calledOnce(oauthClientInfoMock.fetch);
        assert.calledWith(oauthClientInfoMock.fetch, undefined);
      });
    });

    it('passes service parameter correctly for email-2fa when service is sync', () => {
      request.query.keys = true;
      request.query.service = 'sync';
      return sendSigninNotifications(
        request,
        accountRecord,
        sessionToken,
        'email-2fa'
      ).then(() => {
        assert.calledOnce(fxaMailer.sendVerifyLoginCodeEmail);
        const callArgs = fxaMailer.sendVerifyLoginCodeEmail.getCall(0).args[0];
        assert.equal(callArgs.serviceName, 'sync');
        assert.notCalled(fxaMailer.sendVerifyEmail);
        assert.notCalled(fxaMailer.sendVerifyLoginEmail);
      });
    });

    it('sends verification email when service is VPN', () => {
      request.payload.service = 'e6eb0d1e856335fc';
      return sendSigninNotifications(
        request,
        accountRecord,
        sessionToken,
        'email-otp'
      ).then(() => {
        assert.calledOnce(fxaMailer.sendVerifyLoginCodeEmail);
        assert.notCalled(fxaMailer.sendVerifyEmail);
        assert.notCalled(fxaMailer.sendVerifyLoginEmail);
      });
    });

    it('does NOT send verification email when service is a non-whitelisted RP', () => {
      request.payload.service = 'some-other-service';
      return sendSigninNotifications(
        request,
        accountRecord,
        sessionToken,
        'email-otp'
      ).then(() => {
        assert.notCalled(fxaMailer.sendVerifyLoginCodeEmail);
        assert.notCalled(fxaMailer.sendVerifyEmail);
        assert.notCalled(fxaMailer.sendVerifyLoginEmail);
      });
    });

    it('sends verification email when passwordChangeRequired is true, regardless of service', () => {
      request.payload.service = 'some-other-service';
      return sendSigninNotifications(
        request,
        accountRecord,
        sessionToken,
        'email-otp',
        true // passwordChangeRequired
      ).then(() => {
        assert.calledOnce(fxaMailer.sendVerifyLoginCodeEmail);
        assert.notCalled(fxaMailer.sendVerifyEmail);
        assert.notCalled(fxaMailer.sendVerifyLoginEmail);
      });
    });
  });

  describe('when using CMS for emails', () => {
    it('uses CMS content for verifyLoginCode email', () => {
      sessionToken.tokenVerified = false;
      sessionToken.tokenVerificationId = 'tokenVerifyCode';
      sessionToken.mustVerify = true;
      mocks.mockOAuthClientInfo({
        fetch: sinon.stub().resolves({ name: 'mockOauthClientName' }),
      });
      const rpCmsConfig = {
        clientId: '00f00f',
        shared: {
          emailFromName: 'Testo Inc.',
          emailLogoUrl: 'http://img.exmpl.gg/logo.svg',
        },
        VerifyLoginCodeEmail: {
          subject: 'Verify Login',
          headline: 'Is it You?',
          description: 'Use the code:',
        },
      };
      Container.set(RelyingPartyConfigurationManager, {
        fetchCMSData: sinon.stub().resolves({
          relyingParties: [rpCmsConfig],
        }),
      });
      const defaultReqData = defaultMockRequestData(log, metricsContext);
      const req = mocks.mockRequest({
        ...defaultReqData,
        payload: {
          ...defaultReqData.payload,
          metricsContext: {
            ...defaultReqData.payload.metricsContext,
            service: '00f00f',
            entrypoint: 'testo',
          },
        },
      });
      const signinUtils = makeSigninUtils({ log, db, mailer, config });
      return signinUtils
        .sendSigninNotifications(req, accountRecord, sessionToken, 'email-2fa')
        .then(() => {
          assert.notCalled(fxaMailer.sendVerifyEmail);
          assert.notCalled(fxaMailer.sendVerifyLoginEmail);
          assert.calledOnce(fxaMailer.sendVerifyLoginCodeEmail);

          const expectedCode = otpUtils.generateOtpCode(
            accountRecord.primaryEmail.emailCode,
            otpOptions
          );
          assert.calledWithMatch(fxaMailer.sendVerifyLoginCodeEmail, {
            to: TEST_EMAIL,
            cc: [],
            metricsEnabled: true,
            uid: TEST_UID,
            code: expectedCode,
            deviceId: req.payload.metricsContext.deviceId,
            flowId: req.payload.metricsContext.flowId,
            flowBeginTime: req.payload.metricsContext.flowBeginTime,
            entrypoint: 'testo',
            redirectTo: req.payload.redirectTo,
            resume: req.payload.resume,
            serviceName: 'mockOauthClientName',
            cmsRpClientId: rpCmsConfig.clientId,
            cmsRpFromName: rpCmsConfig.shared?.emailFromName,
            logoUrl: rpCmsConfig?.shared?.emailLogoUrl,
            logoAltText: rpCmsConfig?.shared?.emailLogoAltText,
            logoWidth: rpCmsConfig?.shared?.emailLogoWidth,
            subject: rpCmsConfig.VerifyLoginCodeEmail.subject,
            headline: rpCmsConfig.VerifyLoginCodeEmail.headline,
            description: rpCmsConfig.VerifyLoginCodeEmail.description,
          });
        });
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
      db.sessions = sinon.spy(() => Promise.resolve([sessionToken]));
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
      db.sessions = sinon.spy(() =>
        Promise.resolve([{}, {}, {}, sessionToken])
      );
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
    mocks.mockOAuthClientInfo();
    db = mocks.mockDB();
    password = {
      unwrap: sinon.spy(() => Promise.resolve(Buffer.from('abcdef123456'))),
    };
    db.createKeyFetchToken = sinon.spy(() =>
      Promise.resolve({ id: 'KEY_FETCH_TOKEN' })
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
    ).then((res) => {
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
    mocks.mockOAuthClientInfo();
    getSessionVerificationStatus = makeSigninUtils(
      {}
    ).getSessionVerificationStatus;
  });

  it('correctly reports verified sessions as verified', () => {
    const sessionToken = {
      emailVerified: true,
      tokenVerified: true,
    };
    const res = getSessionVerificationStatus(sessionToken);
    assert.deepEqual(res, { sessionVerified: true });
  });

  it('correctly reports unverified accounts as unverified', () => {
    const sessionToken = {
      emailVerified: false,
      tokenVerified: false,
      mustVerify: false,
    };
    const res = getSessionVerificationStatus(sessionToken);
    assert.deepEqual(res, {
      sessionVerified: false,
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
      sessionVerified: false,
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
      sessionVerified: false,
      verificationMethod: 'email-2fa',
      verificationReason: 'login',
    });
  });

  it('does not echo invalid custom verificationMethod param for signups', () => {
    const sessionToken = {
      emailVerified: false,
      tokenVerified: false,
      mustVerify: true,
    };
    const res = getSessionVerificationStatus(sessionToken, 'email-2fa');
    assert.deepEqual(res, {
      sessionVerified: false,
      verificationMethod: 'email',
      verificationReason: 'signup',
    });
  });

  it('correctly echos valid custom verificationMethod param for signups', () => {
    const sessionToken = {
      emailVerified: false,
      tokenVerified: false,
      mustVerify: true,
    };
    const res = getSessionVerificationStatus(sessionToken, 'email-otp');
    assert.deepEqual(res, {
      sessionVerified: false,
      verificationMethod: 'email-otp',
      verificationReason: 'signup',
    });
  });
});

describe('cleanupReminders', () => {
  let cleanupReminders, mockCadReminders;

  beforeEach(() => {
    mocks.mockOAuthClientInfo();
    mockCadReminders = mocks.mockCadReminders();
    cleanupReminders = makeSigninUtils({
      cadReminders: mockCadReminders,
    }).cleanupReminders;
  });

  it('correctly calls cadReminders delete for verified session', async () => {
    await cleanupReminders({ sessionVerified: true }, { uid: '123' });
    assert.calledOnce(mockCadReminders.delete);
    assert.calledWithExactly(mockCadReminders.delete, '123');
  });

  it('does not call cadReminders delete for unverified session', async () => {
    await cleanupReminders({ sessionVerified: false }, { uid: '123' });
    assert.notCalled(mockCadReminders.delete);
  });
});
