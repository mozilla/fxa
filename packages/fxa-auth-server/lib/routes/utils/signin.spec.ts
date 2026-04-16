/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Container } from 'typedi';

const mocks = require('../../../test/mocks');
const Password = require('../../crypto/password')({}, {});
const { AppError: error } = require('@fxa/accounts/errors');
const butil = require('../../crypto/butil');
const otpUtils = require('./otp').default({}, { histogram: () => {} });
const { AppConfig } = require('../../types');
const { AccountEventsManager } = require('../../account-events');
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

function makeSigninUtils(options: any) {
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
  return require('./signin')(
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
  let customs: any, db: any, signinUtils: any;

  beforeEach(() => {
    mocks.mockOAuthClientInfo();
    db = mocks.mockDB();
    customs = {
      v2Enabled: jest.fn(() => true),
      check: jest.fn(() => Promise.resolve(false)),
      flag: jest.fn(() => Promise.resolve({})),
    };
    signinUtils = makeSigninUtils({ db, customs });
  });

  it('should check with correct password', () => {
    db.checkPassword = jest.fn((uid: any) =>
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

    return password.verifyHash().then((hash: any) => {
      return signinUtils
        .checkPassword(accountRecord, password, {
          app: { clientAddress: CLIENT_ADDRESS },
        })
        .then((match: any) => {
          expect(match).toBeTruthy();

          expect(db.checkPassword).toHaveBeenCalledTimes(1);
          expect(db.checkPassword).toHaveBeenCalledWith(TEST_UID, hash);

          expect(customs.flag).not.toHaveBeenCalled();
        });
    });
  });

  it('should return false when check with incorrect password', () => {
    db.checkPassword = jest.fn((uid: any) => Promise.resolve(false));
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
    ]).then(([goodHash, badHash]: any[]) => {
      expect(goodHash).not.toBe(badHash);
      return signinUtils
        .checkPassword(accountRecord, badPassword, {
          app: { clientAddress: CLIENT_ADDRESS },
        })
        .then((match: any) => {
          expect(!!match).toBe(false);

          expect(db.checkPassword).toHaveBeenCalledTimes(1);
          expect(db.checkPassword).toHaveBeenCalledWith(TEST_UID, badHash);

          expect(customs.flag).toHaveBeenCalledTimes(1);
          expect(customs.flag).toHaveBeenCalledWith(CLIENT_ADDRESS, {
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
        (match: any) => {
          throw new Error('password check should not have succeeded');
        },
        (err: any) => {
          expect(err.errno).toBe(error.ERRNO.ACCOUNT_RESET);

          expect(customs.check).toHaveBeenCalledTimes(1);
          expect(db.checkPassword).not.toHaveBeenCalled();

          expect(customs.flag).toHaveBeenCalledTimes(1);
          expect(customs.flag).toHaveBeenCalledWith(CLIENT_ADDRESS, {
            email: TEST_EMAIL,
            errno: error.ERRNO.ACCOUNT_RESET,
          });
        }
      );
  });
});

describe('checkEmailAddress', () => {
  let accountRecord: any, checkEmailAddress: any;

  beforeEach(() => {
    accountRecord = {
      uid: 'testUid',
      primaryEmail: { normalizedEmail: 'primary@example.com' },
    };
    checkEmailAddress = makeSigninUtils({}).checkEmailAddress;
  });

  it('should return true when email matches primary after normalization', () => {
    expect(
      checkEmailAddress(accountRecord, 'primary@example.com')
    ).toBeTruthy();
    expect(
      checkEmailAddress(accountRecord, 'PrIMArY@example.com')
    ).toBeTruthy();
  });

  it('should throw when email does not match primary after normalization', () => {
    expect(() =>
      checkEmailAddress(accountRecord, 'secondary@test.net')
    ).toThrow('Sign in with this email type is not currently supported');
    expect(() =>
      checkEmailAddress(accountRecord, 'something@else.org')
    ).toThrow('Sign in with this email type is not currently supported');
  });

  describe('with originalLoginEmail parameter', () => {
    it('should return true when originalLoginEmail matches primry after normalization', () => {
      expect(
        checkEmailAddress(accountRecord, 'other@email', 'primary@example.com')
      ).toBeTruthy();
      expect(
        checkEmailAddress(accountRecord, 'other@email', 'PrIMArY@example.com')
      ).toBeTruthy();
    });

    it('should throw when originalLoginEmail does not match primary after normalization', () => {
      expect(() =>
        checkEmailAddress(accountRecord, 'other@email', 'secondary@test.net')
      ).toThrow('Sign in with this email type is not currently supported');
      expect(() =>
        checkEmailAddress(accountRecord, 'other@email', 'something@else.org')
      ).toThrow('Sign in with this email type is not currently supported');
    });
  });
});

describe('checkCustomsAndLoadAccount', () => {
  let config: any,
    customs: any,
    db: any,
    log: any,
    request: any,
    checkCustomsAndLoadAccount: any;

  beforeEach(() => {
    db = mocks.mockDB({
      uid: TEST_UID,
      email: TEST_EMAIL,
    });
    log = mocks.mockLog();
    customs = {
      v2Enabled: jest.fn(() => true),
      check: jest.fn(() => Promise.resolve()),
      flag: jest.fn(() => Promise.resolve({})),
      resetV2: jest.fn(() => Promise.resolve()),
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
    request.emitMetricsEvent = jest.fn(() => Promise.resolve());
    checkCustomsAndLoadAccount = makeSigninUtils({
      log,
      config,
      db,
      customs,
    }).checkCustomsAndLoadAccount;
  });

  it('should load the account record when customs allows the request', () => {
    return checkCustomsAndLoadAccount(request, TEST_EMAIL).then((res: any) => {
      expect(res.didSigninUnblock).toBe(false);
      expect(res.accountRecord).toBeTruthy();
      expect(res.accountRecord.email).toBe(TEST_EMAIL);

      expect(customs.check).toHaveBeenCalledTimes(1);
      expect(customs.check).toHaveBeenCalledWith(
        request,
        TEST_EMAIL,
        'accountLogin'
      );

      expect(db.accountRecord).toHaveBeenCalledTimes(1);
      expect(db.accountRecord).toHaveBeenCalledWith(TEST_EMAIL);

      expect(customs.check).toHaveBeenCalled();
      expect(db.accountRecord).toHaveBeenCalled();
    });
  });

  it('should throw non-customs errors directly back to the caller', () => {
    customs.check = jest.fn(() => {
      throw new Error('unexpected!');
    });
    return checkCustomsAndLoadAccount(request, TEST_EMAIL).then(
      () => {
        throw new Error('should not succeed');
      },
      (err: any) => {
        expect(err.message).toBe('unexpected!');
        expect(customs.check).toHaveBeenCalledTimes(1);
        expect(db.accountRecord).not.toHaveBeenCalled();
        expect(request.emitMetricsEvent).not.toHaveBeenCalled();
      }
    );
  });

  it('should re-throw customs errors when no unblock code is specified', () => {
    const origErr = error.tooManyRequests();
    customs.check = jest.fn(() => Promise.reject(origErr));
    return checkCustomsAndLoadAccount(request, TEST_EMAIL).then(
      () => {
        throw new Error('should not succeed');
      },
      (err: any) => {
        expect(err).toEqual(origErr);
        expect(customs.check).toHaveBeenCalledTimes(1);
        expect(db.accountRecord).not.toHaveBeenCalled();
        expect(request.emitMetricsEvent).toHaveBeenCalledTimes(1);
        expect(request.emitMetricsEvent).toHaveBeenCalledWith(
          'account.login.blocked'
        );
      }
    );
  });

  it('login attempts on an unknown account should be flagged with customs', () => {
    db.accountRecord = jest.fn(() => Promise.reject(error.unknownAccount()));
    return checkCustomsAndLoadAccount(request, TEST_EMAIL).then(
      () => {
        throw new Error('should not succeed');
      },
      (err: any) => {
        expect(err.errno).toBe(error.ERRNO.ACCOUNT_UNKNOWN);
        expect(customs.check).toHaveBeenCalledTimes(2);
        expect(customs.check).toHaveBeenCalledWith(
          expect.any(Object),
          TEST_EMAIL,
          'accountLogin'
        );
        expect(customs.check).toHaveBeenCalledWith(
          expect.any(Object),
          TEST_EMAIL,
          'loadAccountFailed'
        );
        expect(db.accountRecord).toHaveBeenCalledTimes(1);
        expect(customs.flag).toHaveBeenCalledTimes(1);
        expect(customs.flag).toHaveBeenCalledWith(CLIENT_ADDRESS, {
          email: TEST_EMAIL,
          errno: error.ERRNO.ACCOUNT_UNKNOWN,
        });
      }
    );
  });

  it('login attempts on an unknown account should be flagged with customs (duplicate)', () => {
    db.accountRecord = jest.fn(() => Promise.reject(error.unknownAccount()));
    return checkCustomsAndLoadAccount(request, TEST_EMAIL).then(
      () => {
        throw new Error('should not succeed');
      },
      (err: any) => {
        expect(err.errno).toBe(error.ERRNO.ACCOUNT_UNKNOWN);
        expect(customs.check).toHaveBeenCalledTimes(2);
        expect(customs.check).toHaveBeenCalledWith(
          expect.any(Object),
          TEST_EMAIL,
          'accountLogin'
        );
        expect(customs.check).toHaveBeenCalledWith(
          expect.any(Object),
          TEST_EMAIL,
          'loadAccountFailed'
        );
        expect(db.accountRecord).toHaveBeenCalledTimes(1);
        expect(customs.flag).toHaveBeenCalledTimes(1);
        expect(customs.flag).toHaveBeenCalledWith(CLIENT_ADDRESS, {
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
        throw new Error('should not succeed');
      },
      (err: any) => {
        expect(err.errno).toBe(error.ERRNO.REQUEST_BLOCKED);
        expect(err.output.payload.verificationMethod).toBe('email-captcha');

        expect(customs.check).not.toHaveBeenCalled();
        expect(db.accountRecord).not.toHaveBeenCalled();
        expect(customs.flag).not.toHaveBeenCalled();

        expect(request.emitMetricsEvent).toHaveBeenCalledTimes(1);
        expect(request.emitMetricsEvent).toHaveBeenCalledWith(
          'account.login.blocked'
        );
      }
    );
  });

  it('a valid unblock code can bypass a customs block', () => {
    customs.check = jest.fn(() =>
      Promise.reject(error.tooManyRequests(60, null, true))
    );
    request.payload.unblockCode = 'VaLiD';
    db.consumeUnblockCode = jest.fn(() =>
      Promise.resolve({ createdAt: Date.now() })
    );
    return checkCustomsAndLoadAccount(request, TEST_EMAIL).then((res: any) => {
      expect(res.didSigninUnblock).toBe(true);
      expect(res.accountRecord).toBeTruthy();
      expect(res.accountRecord.email).toBe(TEST_EMAIL);

      expect(customs.check).toHaveBeenCalledTimes(1);
      expect(db.accountRecord).toHaveBeenCalledTimes(1);

      expect(db.consumeUnblockCode).toHaveBeenCalledTimes(1);
      expect(db.consumeUnblockCode).toHaveBeenCalledWith(TEST_UID, 'VALID');

      expect(request.emitMetricsEvent).toHaveBeenCalledTimes(2);
      expect(request.emitMetricsEvent).toHaveBeenNthCalledWith(
        1,
        'account.login.blocked'
      );
      expect(request.emitMetricsEvent).toHaveBeenNthCalledWith(
        2,
        'account.login.confirmedUnblockCode'
      );
    });
  });

  it('unblock codes are not checked for non-unblockable customs errors', () => {
    customs.check = jest.fn(() =>
      Promise.reject(error.tooManyRequests(60, null, false))
    );
    request.payload.unblockCode = 'VALID';
    db.consumeUnblockCode = jest.fn(() =>
      Promise.resolve({ createdAt: Date.now() })
    );
    return checkCustomsAndLoadAccount(request, TEST_EMAIL).then(
      () => {
        throw new Error('should not succeed');
      },
      (err: any) => {
        expect(err.errno).toBe(error.ERRNO.THROTTLED);
        expect(customs.check).toHaveBeenCalledTimes(1);
        expect(db.accountRecord).not.toHaveBeenCalled();
        expect(db.consumeUnblockCode).not.toHaveBeenCalled();
        expect(customs.flag).not.toHaveBeenCalled();
      }
    );
  });

  it('unblock codes are not checked for non-customs errors', () => {
    customs.check = jest.fn(() => Promise.reject(error.serviceUnavailable()));
    request.payload.unblockCode = 'VALID';
    db.consumeUnblockCode = jest.fn(() =>
      Promise.resolve({ createdAt: Date.now() })
    );
    return checkCustomsAndLoadAccount(request, TEST_EMAIL).then(
      () => {
        throw new Error('should not succeed');
      },
      (err: any) => {
        expect(err.errno).toBe(error.ERRNO.SERVER_BUSY);
        expect(customs.check).toHaveBeenCalledTimes(1);
        expect(db.accountRecord).not.toHaveBeenCalled();
        expect(db.consumeUnblockCode).not.toHaveBeenCalled();
        expect(customs.flag).not.toHaveBeenCalled();
      }
    );
  });

  it('unblock codes are not checked when the account does not exist', () => {
    customs.check = jest.fn((_request: any, _email: any, action: any) => {
      if (action === 'accountLogin') {
        return Promise.reject(error.tooManyRequests(60, null, true));
      }
      return Promise.resolve(false);
    });
    request.payload.unblockCode = 'VALID';
    db.accountRecord = jest.fn(() => Promise.reject(error.unknownAccount()));
    db.consumeUnblockCode = jest.fn(() =>
      Promise.resolve({ createdAt: Date.now() })
    );
    return checkCustomsAndLoadAccount(request, TEST_EMAIL).then(
      () => {
        throw new Error('should not succeed');
      },
      (err: any) => {
        expect(err.errno).toBe(error.ERRNO.THROTTLED);
        expect(customs.check).toHaveBeenCalledTimes(2);
        expect(customs.check).toHaveBeenCalledWith(
          expect.any(Object),
          TEST_EMAIL,
          'accountLogin'
        );
        expect(customs.check).toHaveBeenCalledWith(
          expect.any(Object),
          TEST_EMAIL,
          'loadAccountFailed'
        );
        expect(db.accountRecord).toHaveBeenCalledTimes(1);
        expect(db.consumeUnblockCode).not.toHaveBeenCalled();
        expect(customs.flag).toHaveBeenCalledTimes(1);
        expect(customs.flag).toHaveBeenCalledWith(CLIENT_ADDRESS, {
          email: TEST_EMAIL,
          errno: error.ERRNO.ACCOUNT_UNKNOWN,
        });
      }
    );
  });

  it('invalid unblock codes are rejected and reported to customs', () => {
    customs.check = jest.fn((request: any, email: any, action: any) => {
      if (action === 'accountLogin') {
        return Promise.reject(error.requestBlocked(true));
      }
      return Promise.resolve(false);
    });
    request.payload.unblockCode = 'INVALID';
    db.consumeUnblockCode = jest.fn(() =>
      Promise.reject(error.invalidUnblockCode())
    );
    return checkCustomsAndLoadAccount(request, TEST_EMAIL).then(
      () => {
        throw new Error('should not succeed');
      },
      (err: any) => {
        expect(err.errno).toBe(error.ERRNO.INVALID_UNBLOCK_CODE);
        expect(customs.check).toHaveBeenCalledTimes(2);
        expect(customs.check).toHaveBeenCalledWith(
          expect.any(Object),
          TEST_EMAIL,
          'accountLogin'
        );
        expect(customs.check).toHaveBeenCalledWith(
          expect.any(Object),
          TEST_EMAIL,
          'unblockCodeFailed'
        );
        expect(db.consumeUnblockCode).toHaveBeenCalledTimes(1);

        expect(request.emitMetricsEvent).toHaveBeenCalledTimes(2);
        expect(request.emitMetricsEvent).toHaveBeenNthCalledWith(
          1,
          'account.login.blocked'
        );
        expect(request.emitMetricsEvent).toHaveBeenNthCalledWith(
          2,
          'account.login.invalidUnblockCode'
        );

        expect(customs.flag).toHaveBeenCalledTimes(1);
        expect(customs.flag).toHaveBeenCalledWith(CLIENT_ADDRESS, {
          email: TEST_EMAIL,
          errno: error.ERRNO.INVALID_UNBLOCK_CODE,
        });
      }
    );
  });

  it('expired unblock codes are rejected as invalid', () => {
    customs.check = jest.fn((_request: any, _email: any, action: any) => {
      if (action === 'accountLogin') {
        return Promise.reject(error.requestBlocked(true));
      }
      return Promise.resolve(false);
    });
    request.payload.unblockCode = 'EXPIRED';
    db.consumeUnblockCode = jest.fn(() =>
      Promise.resolve({
        createdAt: Date.now() - config.signinUnblock.codeLifetime * 2,
      })
    );
    return checkCustomsAndLoadAccount(request, TEST_EMAIL).then(
      () => {
        throw new Error('should not succeed');
      },
      (err: any) => {
        expect(err.errno).toBe(error.ERRNO.INVALID_UNBLOCK_CODE);
        expect(customs.check).toHaveBeenCalledTimes(2);
        expect(customs.check).toHaveBeenNthCalledWith(
          1,
          expect.any(Object),
          TEST_EMAIL,
          'accountLogin'
        );
        expect(customs.check).toHaveBeenNthCalledWith(
          2,
          expect.any(Object),
          TEST_EMAIL,
          'unblockCodeFailed'
        );
        expect(db.accountRecord).toHaveBeenCalledTimes(1);
        expect(db.consumeUnblockCode).toHaveBeenCalledTimes(1);

        expect(request.emitMetricsEvent).toHaveBeenCalledTimes(2);
        expect(request.emitMetricsEvent).toHaveBeenNthCalledWith(
          1,
          'account.login.blocked'
        );
        expect(request.emitMetricsEvent).toHaveBeenNthCalledWith(
          2,
          'account.login.invalidUnblockCode'
        );

        expect(customs.flag).toHaveBeenCalledTimes(1);
        expect(customs.flag).toHaveBeenCalledWith(CLIENT_ADDRESS, {
          email: TEST_EMAIL,
          errno: error.ERRNO.INVALID_UNBLOCK_CODE,
        });
      }
    );
  });

  it('unexpected errors when checking an unblock code, cause the original customs error to be rethrown', () => {
    customs.check = jest.fn(() => Promise.reject(error.requestBlocked(true)));
    request.payload.unblockCode = 'WHOOPSY';
    db.consumeUnblockCode = jest.fn(() =>
      Promise.reject(error.serviceUnavailable())
    );
    return checkCustomsAndLoadAccount(request, TEST_EMAIL).then(
      () => {
        throw new Error('should not succeed');
      },
      (err: any) => {
        expect(err.errno).toBe(error.ERRNO.REQUEST_BLOCKED);
        expect(customs.check).toHaveBeenCalledTimes(1);
        expect(db.accountRecord).toHaveBeenCalledTimes(1);
        expect(db.consumeUnblockCode).toHaveBeenCalledTimes(1);
        expect(customs.flag).not.toHaveBeenCalled();
      }
    );
  });
});

describe('sendSigninNotifications', () => {
  let db: any,
    config: any,
    log: any,
    mailer: any,
    fxaMailer: any,
    metricsContext: any,
    request: any,
    accountRecord: any,
    sessionToken: any,
    sendSigninNotifications: any,
    clock: any;
  const defaultMockRequestData = (log: any, metricsContext: any) => ({
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
    clock = jest.useFakeTimers({ now: 1769555935958 });

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
      servicesWithEmailVerification: ['32aaeb6f1c21316a'],
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
      jest.useRealTimers();
    }
  });

  afterAll(() => {
    Container.reset();
  });

  it('emits correct notifications when no verifications are required', () => {
    return sendSigninNotifications(
      request,
      accountRecord,
      sessionToken,
      undefined
    ).then(() => {
      expect(metricsContext.setFlowCompleteSignal).toHaveBeenCalledTimes(1);
      expect(metricsContext.setFlowCompleteSignal).toHaveBeenCalledWith(
        'account.login',
        'login'
      );

      expect(metricsContext.stash).toHaveBeenCalledTimes(1);
      expect(metricsContext.stash).toHaveBeenCalledWith(sessionToken);

      expect(db.sessions).toHaveBeenCalledTimes(1);
      expect(db.sessions).toHaveBeenCalledWith(TEST_UID);

      expect(log.activityEvent).toHaveBeenCalledTimes(1);
      expect(log.activityEvent).toHaveBeenCalledWith({
        country: 'United States',
        event: 'account.login',
        region: 'California',
        service: undefined,
        userAgent: 'test user-agent',
        sigsciRequestId: 'test-sigsci-id',
        clientJa4: 'test-ja4',
        uid: TEST_UID,
      });

      expect(log.flowEvent).toHaveBeenCalledTimes(2);
      expect(log.flowEvent.mock.calls[0][0]).toEqual(
        expect.objectContaining({
          event: 'account.login',
        })
      );
      expect(log.flowEvent.mock.calls[1][0]).toEqual(
        expect.objectContaining({
          event: 'flow.complete',
        })
      );

      expect(log.notifyAttachedServices).toHaveBeenCalledTimes(1);
      expect(log.notifyAttachedServices).toHaveBeenCalledWith(
        'login',
        request,
        {
          deviceCount: 0,
          email: TEST_EMAIL,
          service: undefined,
          uid: TEST_UID,
          userAgent: 'test user-agent',
          country: 'United States',
          countryCode: 'US',
        }
      );

      expect(fxaMailer.sendVerifyEmail).not.toHaveBeenCalled();
      expect(fxaMailer.sendVerifyLoginEmail).not.toHaveBeenCalled();
      expect(fxaMailer.sendVerifyLoginCodeEmail).not.toHaveBeenCalled();

      expect(db.securityEvent).toHaveBeenCalledTimes(1);
      expect(db.securityEvent).toHaveBeenCalledWith({
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
        expect(metricsContext.setFlowCompleteSignal).toHaveBeenCalledTimes(1);
        expect(metricsContext.setFlowCompleteSignal).toHaveBeenCalledWith(
          'account.login',
          'login'
        );

        expect(metricsContext.stash).toHaveBeenCalledTimes(1);

        expect(fxaMailer.sendVerifyEmail).toHaveBeenCalledTimes(1);
        expect(fxaMailer.sendVerifyEmail).toHaveBeenCalledWith({
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

        expect(log.flowEvent).toHaveBeenCalledTimes(3);
        expect(log.flowEvent.mock.calls[0][0]).toEqual(
          expect.objectContaining({
            event: 'account.login',
          })
        );
        expect(log.flowEvent.mock.calls[1][0]).toEqual(
          expect.objectContaining({
            event: 'flow.complete',
          })
        );
        expect(log.flowEvent.mock.calls[2][0]).toEqual(
          expect.objectContaining({
            event: 'email.verification.sent',
          })
        );
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
        expect(metricsContext.setFlowCompleteSignal).toHaveBeenCalledTimes(1);
        expect(metricsContext.setFlowCompleteSignal).toHaveBeenCalledWith(
          'account.confirmed',
          'login'
        );

        expect(metricsContext.stash).toHaveBeenCalledTimes(2);
        expect(metricsContext.stash).toHaveBeenNthCalledWith(1, sessionToken);
        expect(metricsContext.stash).toHaveBeenNthCalledWith(2, {
          uid: TEST_UID,
          id: 'tokenVerifyCode',
        });

        expect(fxaMailer.sendVerifyEmail).toHaveBeenCalledTimes(1);
        expect(fxaMailer.sendVerifyEmail).toHaveBeenCalledWith({
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

        expect(log.flowEvent).toHaveBeenCalledTimes(2);
        expect(log.flowEvent.mock.calls[0][0]).toEqual(
          expect.objectContaining({
            event: 'account.login',
          })
        );
        expect(log.flowEvent.mock.calls[1][0]).toEqual(
          expect.objectContaining({
            event: 'email.verification.sent',
          })
        );

        expect(log.notifyAttachedServices).toHaveBeenCalledTimes(1);
        expect(log.notifyAttachedServices).toHaveBeenCalledWith(
          'login',
          request,
          {
            deviceCount: 0,
            email: TEST_EMAIL,
            service: undefined,
            uid: TEST_UID,
            userAgent: 'test user-agent',
            country: 'United States',
            countryCode: 'US',
          }
        );
      });
    });

    afterEach(() => {
      expect(db.sessions).toHaveBeenCalledTimes(1);
      expect(log.activityEvent).toHaveBeenCalledTimes(1);

      expect(fxaMailer.sendVerifyLoginEmail).not.toHaveBeenCalled();
      expect(fxaMailer.sendVerifyLoginCodeEmail).not.toHaveBeenCalled();

      expect(db.securityEvent).toHaveBeenCalledTimes(1);
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
        expect(metricsContext.setFlowCompleteSignal).toHaveBeenCalledTimes(1);
        expect(metricsContext.setFlowCompleteSignal).toHaveBeenCalledWith(
          'account.login',
          'login'
        );

        expect(metricsContext.stash).toHaveBeenCalledTimes(1);
        expect(db.sessions).toHaveBeenCalledTimes(1);
        expect(log.activityEvent).toHaveBeenCalledTimes(1);
        expect(log.notifyAttachedServices).toHaveBeenCalledTimes(1);
        expect(log.notifyAttachedServices).toHaveBeenCalledWith(
          'login',
          request,
          {
            deviceCount: 0,
            email: TEST_EMAIL,
            service: undefined,
            uid: TEST_UID,
            userAgent: 'test user-agent',
            country: 'United States',
            countryCode: 'US',
          }
        );

        expect(fxaMailer.sendVerifyEmail).not.toHaveBeenCalled();
        expect(fxaMailer.sendVerifyLoginEmail).not.toHaveBeenCalled();
        expect(fxaMailer.sendVerifyLoginCodeEmail).not.toHaveBeenCalled();
        expect(fxaMailer.sendNewDeviceLoginEmail).not.toHaveBeenCalled();

        expect(log.flowEvent).toHaveBeenCalledTimes(2);
        expect(log.flowEvent.mock.calls[0][0]).toEqual(
          expect.objectContaining({
            event: 'account.login',
          })
        );
        expect(log.flowEvent.mock.calls[1][0]).toEqual(
          expect.objectContaining({
            event: 'flow.complete',
          })
        );

        expect(db.securityEvent).toHaveBeenCalledTimes(1);
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
        expect(fxaMailer.sendVerifyEmail).not.toHaveBeenCalled();
        expect(mailer.sendVerifyLoginCodeEmail).not.toHaveBeenCalled();
        expect(fxaMailer.sendVerifyLoginEmail).toHaveBeenCalledTimes(1);
        expect(fxaMailer.sendVerifyLoginEmail).toHaveBeenCalledWith({
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

        expect(log.flowEvent).toHaveBeenCalledTimes(2);
        expect(log.flowEvent.mock.calls[0][0]).toEqual(
          expect.objectContaining({
            event: 'account.login',
          })
        );
        expect(log.flowEvent.mock.calls[1][0]).toEqual(
          expect.objectContaining({
            event: 'email.confirmation.sent',
          })
        );
      });
    });

    it('emits correct notifications when verificationMethod=email', () => {
      return sendSigninNotifications(
        request,
        accountRecord,
        sessionToken,
        'email'
      ).then(() => {
        expect(fxaMailer.sendVerifyEmail).not.toHaveBeenCalled();
        expect(fxaMailer.sendVerifyLoginCodeEmail).not.toHaveBeenCalled();
        expect(fxaMailer.sendVerifyLoginEmail).toHaveBeenCalledTimes(1);

        expect(log.flowEvent).toHaveBeenCalledTimes(2);
        expect(log.flowEvent.mock.calls[0][0]).toEqual(
          expect.objectContaining({
            event: 'account.login',
          })
        );
        expect(log.flowEvent.mock.calls[1][0]).toEqual(
          expect.objectContaining({
            event: 'email.confirmation.sent',
          })
        );
      });
    });

    it('emits correct notifications when verificationMethod=email-2fa', () => {
      const oauthClientInfoMock = mocks.mockOAuthClientInfo({
        fetch: jest.fn().mockResolvedValue({ name: undefined }),
      });
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
        expect(fxaMailer.sendVerifyEmail).not.toHaveBeenCalled();
        expect(fxaMailer.sendVerifyLoginEmail).not.toHaveBeenCalled();
        expect(fxaMailer.sendVerifyLoginCodeEmail).toHaveBeenCalledTimes(1);

        const expectedCode = otpUtils.generateOtpCode(
          accountRecord.primaryEmail.emailCode,
          otpOptions
        );
        expect(fxaMailer.sendVerifyLoginCodeEmail).toHaveBeenCalledWith(
          expect.objectContaining({
            to: TEST_EMAIL,
            cc: [],
            metricsEnabled: true,
            uid: TEST_UID,
            code: expectedCode,
            redirectTo: request.payload.redirectTo,
            resume: request.payload.resume,
            serviceName: undefined,
          })
        );

        expect(oauthClientInfoMock.fetch).toHaveBeenCalledTimes(1);

        expect(log.flowEvent).toHaveBeenCalledTimes(2);
        expect(log.flowEvent.mock.calls[0][0]).toEqual(
          expect.objectContaining({
            event: 'account.login',
          })
        );
        expect(log.flowEvent.mock.calls[1][0]).toEqual(
          expect.objectContaining({
            event: 'email.tokencode.sent',
          })
        );
      });
    });

    it('emits correct notifications when verificationMethod=email-captcha', () => {
      return sendSigninNotifications(
        request,
        accountRecord,
        sessionToken,
        'email-captcha'
      ).then(() => {
        expect(fxaMailer.sendVerifyEmail).not.toHaveBeenCalled();
        expect(fxaMailer.sendVerifyLoginEmail).not.toHaveBeenCalled();
        expect(fxaMailer.sendVerifyLoginCodeEmail).not.toHaveBeenCalled();

        expect(log.flowEvent).toHaveBeenCalledTimes(1);
        expect(log.flowEvent).toHaveBeenCalledWith(
          expect.objectContaining({ event: 'account.login' })
        );
      });
    });

    afterEach(() => {
      expect(metricsContext.setFlowCompleteSignal).toHaveBeenCalledTimes(1);
      expect(metricsContext.setFlowCompleteSignal).toHaveBeenCalledWith(
        'account.confirmed',
        'login'
      );

      expect(metricsContext.stash).toHaveBeenCalledTimes(2);
      expect(metricsContext.stash).toHaveBeenNthCalledWith(1, sessionToken);
      expect(metricsContext.stash).toHaveBeenNthCalledWith(2, {
        uid: TEST_UID,
        id: 'tokenVerifyCode',
      });

      expect(db.sessions).toHaveBeenCalledTimes(1);
      expect(log.activityEvent).toHaveBeenCalledTimes(1);
      expect(log.notifyAttachedServices).toHaveBeenCalledTimes(1);
      expect(log.notifyAttachedServices).toHaveBeenCalledWith(
        'login',
        request,
        {
          deviceCount: 0,
          email: TEST_EMAIL,
          service: undefined,
          uid: TEST_UID,
          userAgent: 'test user-agent',
          country: 'United States',
          countryCode: 'US',
        }
      );
      expect(db.securityEvent).toHaveBeenCalledTimes(1);
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
        expect(fxaMailer.sendVerifyLoginCodeEmail).toHaveBeenCalledTimes(1);
        const callArgs = fxaMailer.sendVerifyLoginCodeEmail.mock.calls[0][0];
        expect(callArgs.serviceName).toBe('sync');
      });
    });

    it('passes service parameter correctly when service is undefined', () => {
      const oauthClientInfoMock = mocks.mockOAuthClientInfo();
      request.payload.service = undefined;

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
        expect(fxaMailer.sendVerifyLoginCodeEmail).toHaveBeenCalledTimes(1);
        expect(oauthClientInfoMock.fetch).toHaveBeenCalledTimes(1);
        expect(oauthClientInfoMock.fetch).toHaveBeenCalledWith(undefined);
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
        expect(fxaMailer.sendVerifyLoginCodeEmail).toHaveBeenCalledTimes(1);
        const callArgs = fxaMailer.sendVerifyLoginCodeEmail.mock.calls[0][0];
        expect(callArgs.serviceName).toBe('sync');
        expect(fxaMailer.sendVerifyEmail).not.toHaveBeenCalled();
        expect(fxaMailer.sendVerifyLoginEmail).not.toHaveBeenCalled();
      });
    });

    it('sends verification email when service is in servicesWithEmailVerification', () => {
      request.payload.service = '32aaeb6f1c21316a';
      return sendSigninNotifications(
        request,
        accountRecord,
        sessionToken,
        'email-otp'
      ).then(() => {
        expect(fxaMailer.sendVerifyLoginCodeEmail).toHaveBeenCalledTimes(1);
        expect(fxaMailer.sendVerifyEmail).not.toHaveBeenCalled();
        expect(fxaMailer.sendVerifyLoginEmail).not.toHaveBeenCalled();
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
        expect(fxaMailer.sendVerifyLoginCodeEmail).not.toHaveBeenCalled();
        expect(fxaMailer.sendVerifyEmail).not.toHaveBeenCalled();
        expect(fxaMailer.sendVerifyLoginEmail).not.toHaveBeenCalled();
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
        expect(fxaMailer.sendVerifyLoginCodeEmail).toHaveBeenCalledTimes(1);
        expect(fxaMailer.sendVerifyEmail).not.toHaveBeenCalled();
        expect(fxaMailer.sendVerifyLoginEmail).not.toHaveBeenCalled();
      });
    });
  });

  describe('when using CMS for emails', () => {
    it('uses CMS content for verifyLoginCode email', () => {
      sessionToken.tokenVerified = false;
      sessionToken.tokenVerificationId = 'tokenVerifyCode';
      sessionToken.mustVerify = true;
      mocks.mockOAuthClientInfo({
        fetch: jest.fn().mockResolvedValue({ name: 'mockOauthClientName' }),
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
        fetchCMSData: jest.fn().mockResolvedValue({
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
          expect(fxaMailer.sendVerifyEmail).not.toHaveBeenCalled();
          expect(fxaMailer.sendVerifyLoginEmail).not.toHaveBeenCalled();
          expect(fxaMailer.sendVerifyLoginCodeEmail).toHaveBeenCalledTimes(1);

          const expectedCode = otpUtils.generateOtpCode(
            accountRecord.primaryEmail.emailCode,
            otpOptions
          );
          expect(fxaMailer.sendVerifyLoginCodeEmail).toHaveBeenCalledWith(
            expect.objectContaining({
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
              logoAltText: (rpCmsConfig?.shared as any)?.emailLogoAltText,
              logoWidth: (rpCmsConfig?.shared as any)?.emailLogoWidth,
              subject: rpCmsConfig.VerifyLoginCodeEmail.subject,
              headline: rpCmsConfig.VerifyLoginCodeEmail.headline,
              description: rpCmsConfig.VerifyLoginCodeEmail.description,
            })
          );
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
      expect(log.notifyAttachedServices).not.toHaveBeenCalled();
    });
  });

  describe('when signing in with service=sync', () => {
    beforeEach(() => {
      request.payload.service = 'sync';
    });

    it('emits correct notifications with one active session', () => {
      db.sessions = jest.fn(() => Promise.resolve([sessionToken]));
      return sendSigninNotifications(
        request,
        accountRecord,
        sessionToken,
        undefined
      ).then(() => {
        expect(log.notifyAttachedServices).toHaveBeenCalledTimes(1);
        expect(log.notifyAttachedServices).toHaveBeenCalledWith(
          'login',
          request,
          {
            service: 'sync',
            uid: TEST_UID,
            email: TEST_EMAIL,
            deviceCount: 1,
            userAgent: 'test user-agent',
            country: 'United States',
            countryCode: 'US',
          }
        );
      });
    });

    it('emits correct notifications  with many active sessions', () => {
      db.sessions = jest.fn(() => Promise.resolve([{}, {}, {}, sessionToken]));
      return sendSigninNotifications(
        request,
        accountRecord,
        sessionToken,
        undefined
      ).then(() => {
        expect(log.notifyAttachedServices).toHaveBeenCalledTimes(1);
        expect(log.notifyAttachedServices).toHaveBeenCalledWith(
          'login',
          request,
          {
            service: 'sync',
            uid: TEST_UID,
            email: TEST_EMAIL,
            deviceCount: 4,
            userAgent: 'test user-agent',
            country: 'United States',
            countryCode: 'US',
          }
        );
      });
    });

    afterEach(() => {
      expect(metricsContext.setFlowCompleteSignal).toHaveBeenCalledTimes(1);
      expect(metricsContext.setFlowCompleteSignal).toHaveBeenCalledWith(
        'account.signed',
        'login'
      );

      expect(metricsContext.stash).toHaveBeenCalledTimes(1);
      expect(db.sessions).toHaveBeenCalledTimes(1);
      expect(log.activityEvent).toHaveBeenCalledTimes(1);

      expect(log.flowEvent).toHaveBeenCalledTimes(1);
      expect(log.flowEvent).toHaveBeenCalledWith(
        expect.objectContaining({ event: 'account.login' })
      );

      expect(db.securityEvent).toHaveBeenCalledTimes(1);
    });
  });
});

describe('createKeyFetchToken', () => {
  let password: any,
    db: any,
    metricsContext: any,
    request: any,
    accountRecord: any,
    sessionToken: any,
    createKeyFetchToken: any;

  beforeEach(() => {
    mocks.mockOAuthClientInfo();
    db = mocks.mockDB();
    password = {
      unwrap: jest.fn(() => Promise.resolve(Buffer.from('abcdef123456'))),
    };
    db.createKeyFetchToken = jest.fn(() =>
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
    ).then((res: any) => {
      expect(res).toEqual({ id: 'KEY_FETCH_TOKEN' });

      expect(password.unwrap).toHaveBeenCalledTimes(1);
      expect(password.unwrap).toHaveBeenCalledWith(accountRecord.wrapWrapKb);

      expect(db.createKeyFetchToken).toHaveBeenCalledTimes(1);
      expect(db.createKeyFetchToken).toHaveBeenCalledWith({
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
      expect(metricsContext.stash).toHaveBeenCalledTimes(1);
      expect(metricsContext.stash).toHaveBeenCalled();
      expect(metricsContext.stash).toHaveBeenCalledWith({
        id: 'KEY_FETCH_TOKEN',
      });
    });
  });
});

describe('getSessionVerificationStatus', () => {
  let getSessionVerificationStatus: any;

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
    expect(res).toEqual({ sessionVerified: true });
  });

  it('correctly reports unverified accounts as unverified', () => {
    const sessionToken = {
      emailVerified: false,
      tokenVerified: false,
      mustVerify: false,
    };
    const res = getSessionVerificationStatus(sessionToken);
    expect(res).toEqual({
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
    expect(res).toEqual({
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
    expect(res).toEqual({
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
    expect(res).toEqual({
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
    expect(res).toEqual({
      sessionVerified: false,
      verificationMethod: 'email-otp',
      verificationReason: 'signup',
    });
  });
});

describe('cleanupReminders', () => {
  let cleanupReminders: any, mockCadReminders: any;

  beforeEach(() => {
    mocks.mockOAuthClientInfo();
    mockCadReminders = mocks.mockCadReminders();
    cleanupReminders = makeSigninUtils({
      cadReminders: mockCadReminders,
    }).cleanupReminders;
  });

  it('correctly calls cadReminders delete for verified session', async () => {
    await cleanupReminders({ sessionVerified: true }, { uid: '123' });
    expect(mockCadReminders.delete).toHaveBeenCalledTimes(1);
    expect(mockCadReminders.delete).toHaveBeenCalledWith('123');
  });

  it('does not call cadReminders delete for unverified session', async () => {
    await cleanupReminders({ sessionVerified: false }, { uid: '123' });
    expect(mockCadReminders.delete).not.toHaveBeenCalled();
  });
});
