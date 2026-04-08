/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import sinon from 'sinon';
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
      v2Enabled: sinon.spy(() => true),
      check: sinon.spy(() => Promise.resolve(false)),
      flag: sinon.spy(() => Promise.resolve({})),
    };
    signinUtils = makeSigninUtils({ db, customs });
  });

  it('should check with correct password', () => {
    db.checkPassword = sinon.spy((uid: any) =>
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

          sinon.assert.calledOnce(db.checkPassword);
          sinon.assert.calledWithExactly(db.checkPassword, TEST_UID, hash);

          sinon.assert.notCalled(customs.flag);
        });
    });
  });

  it('should return false when check with incorrect password', () => {
    db.checkPassword = sinon.spy((uid: any) => Promise.resolve(false));
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

          sinon.assert.calledOnce(db.checkPassword);
          sinon.assert.calledWithExactly(db.checkPassword, TEST_UID, badHash);

          sinon.assert.calledOnce(customs.flag);
          sinon.assert.calledWithExactly(customs.flag, CLIENT_ADDRESS, {
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

          sinon.assert.calledOnce(customs.check);
          sinon.assert.notCalled(db.checkPassword);

          sinon.assert.calledOnce(customs.flag);
          sinon.assert.calledWithExactly(customs.flag, CLIENT_ADDRESS, {
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
    return checkCustomsAndLoadAccount(request, TEST_EMAIL).then((res: any) => {
      expect(res.didSigninUnblock).toBe(false);
      expect(res.accountRecord).toBeTruthy();
      expect(res.accountRecord.email).toBe(TEST_EMAIL);

      sinon.assert.calledOnce(customs.check);
      sinon.assert.calledWithExactly(
        customs.check,
        request,
        TEST_EMAIL,
        'accountLogin'
      );

      sinon.assert.calledOnce(db.accountRecord);
      sinon.assert.calledWithExactly(db.accountRecord, TEST_EMAIL);

      sinon.assert.callOrder(customs.check, db.accountRecord);
    });
  });

  it('should throw non-customs errors directly back to the caller', () => {
    customs.check = sinon.spy(() => {
      throw new Error('unexpected!');
    });
    return checkCustomsAndLoadAccount(request, TEST_EMAIL).then(
      () => {
        throw new Error('should not succeed');
      },
      (err: any) => {
        expect(err.message).toBe('unexpected!');
        sinon.assert.calledOnce(customs.check);
        sinon.assert.notCalled(db.accountRecord);
        sinon.assert.notCalled(request.emitMetricsEvent);
      }
    );
  });

  it('should re-throw customs errors when no unblock code is specified', () => {
    const origErr = error.tooManyRequests();
    customs.check = sinon.spy(() => Promise.reject(origErr));
    return checkCustomsAndLoadAccount(request, TEST_EMAIL).then(
      () => {
        throw new Error('should not succeed');
      },
      (err: any) => {
        expect(err).toEqual(origErr);
        sinon.assert.calledOnce(customs.check);
        sinon.assert.notCalled(db.accountRecord);
        sinon.assert.calledOnce(request.emitMetricsEvent);
        sinon.assert.calledWithExactly(
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
        throw new Error('should not succeed');
      },
      (err: any) => {
        expect(err.errno).toBe(error.ERRNO.ACCOUNT_UNKNOWN);
        sinon.assert.calledTwice(customs.check);
        sinon.assert.calledWithMatch(
          customs.check,
          sinon.match.object,
          TEST_EMAIL,
          'accountLogin'
        );
        sinon.assert.calledWithMatch(
          customs.check,
          sinon.match.object,
          TEST_EMAIL,
          'loadAccountFailed'
        );
        sinon.assert.calledOnce(db.accountRecord);
        sinon.assert.calledOnce(customs.flag);
        sinon.assert.calledWithExactly(customs.flag, CLIENT_ADDRESS, {
          email: TEST_EMAIL,
          errno: error.ERRNO.ACCOUNT_UNKNOWN,
        });
      }
    );
  });

  it('login attempts on an unknown account should be flagged with customs (duplicate)', () => {
    db.accountRecord = sinon.spy(() => Promise.reject(error.unknownAccount()));
    return checkCustomsAndLoadAccount(request, TEST_EMAIL).then(
      () => {
        throw new Error('should not succeed');
      },
      (err: any) => {
        expect(err.errno).toBe(error.ERRNO.ACCOUNT_UNKNOWN);
        sinon.assert.calledTwice(customs.check);
        sinon.assert.calledWithMatch(
          customs.check,
          sinon.match.object,
          TEST_EMAIL,
          'accountLogin'
        );
        sinon.assert.calledWithMatch(
          customs.check,
          sinon.match.object,
          TEST_EMAIL,
          'loadAccountFailed'
        );
        sinon.assert.calledOnce(db.accountRecord);
        sinon.assert.calledOnce(customs.flag);
        sinon.assert.calledWithExactly(customs.flag, CLIENT_ADDRESS, {
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

        sinon.assert.notCalled(customs.check);
        sinon.assert.notCalled(db.accountRecord);
        sinon.assert.notCalled(customs.flag);

        sinon.assert.calledOnce(request.emitMetricsEvent);
        sinon.assert.calledWithExactly(
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
    return checkCustomsAndLoadAccount(request, TEST_EMAIL).then((res: any) => {
      expect(res.didSigninUnblock).toBe(true);
      expect(res.accountRecord).toBeTruthy();
      expect(res.accountRecord.email).toBe(TEST_EMAIL);

      sinon.assert.calledOnce(customs.check);
      sinon.assert.calledOnce(db.accountRecord);

      sinon.assert.calledOnce(db.consumeUnblockCode);
      sinon.assert.calledWithExactly(db.consumeUnblockCode, TEST_UID, 'VALID');

      sinon.assert.calledTwice(request.emitMetricsEvent);
      sinon.assert.calledWithExactly(
        request.emitMetricsEvent.getCall(0),
        'account.login.blocked'
      );
      sinon.assert.calledWithExactly(
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
        throw new Error('should not succeed');
      },
      (err: any) => {
        expect(err.errno).toBe(error.ERRNO.THROTTLED);
        sinon.assert.calledOnce(customs.check);
        sinon.assert.notCalled(db.accountRecord);
        sinon.assert.notCalled(db.consumeUnblockCode);
        sinon.assert.notCalled(customs.flag);
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
        throw new Error('should not succeed');
      },
      (err: any) => {
        expect(err.errno).toBe(error.ERRNO.SERVER_BUSY);
        sinon.assert.calledOnce(customs.check);
        sinon.assert.notCalled(db.accountRecord);
        sinon.assert.notCalled(db.consumeUnblockCode);
        sinon.assert.notCalled(customs.flag);
      }
    );
  });

  it('unblock codes are not checked when the account does not exist', () => {
    customs.check = sinon.spy((_request: any, _email: any, action: any) => {
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
        throw new Error('should not succeed');
      },
      (err: any) => {
        expect(err.errno).toBe(error.ERRNO.THROTTLED);
        sinon.assert.calledTwice(customs.check);
        sinon.assert.calledWithMatch(
          customs.check,
          sinon.match.object,
          TEST_EMAIL,
          'accountLogin'
        );
        sinon.assert.calledWithMatch(
          customs.check,
          sinon.match.object,
          TEST_EMAIL,
          'loadAccountFailed'
        );
        sinon.assert.calledOnce(db.accountRecord);
        sinon.assert.notCalled(db.consumeUnblockCode);
        sinon.assert.calledOnce(customs.flag);
        sinon.assert.calledWithExactly(customs.flag, CLIENT_ADDRESS, {
          email: TEST_EMAIL,
          errno: error.ERRNO.ACCOUNT_UNKNOWN,
        });
      }
    );
  });

  it('invalid unblock codes are rejected and reported to customs', () => {
    customs.check = sinon.spy((request: any, email: any, action: any) => {
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
        throw new Error('should not succeed');
      },
      (err: any) => {
        expect(err.errno).toBe(error.ERRNO.INVALID_UNBLOCK_CODE);
        sinon.assert.calledTwice(customs.check);
        sinon.assert.calledWithMatch(
          customs.check,
          sinon.match.object,
          TEST_EMAIL,
          'accountLogin'
        );
        sinon.assert.calledWithMatch(
          customs.check,
          sinon.match.object,
          TEST_EMAIL,
          'unblockCodeFailed'
        );
        sinon.assert.calledOnce(db.consumeUnblockCode);

        sinon.assert.calledTwice(request.emitMetricsEvent);
        sinon.assert.calledWithExactly(
          request.emitMetricsEvent.getCall(0),
          'account.login.blocked'
        );
        sinon.assert.calledWithExactly(
          request.emitMetricsEvent.getCall(1),
          'account.login.invalidUnblockCode'
        );

        sinon.assert.calledOnce(customs.flag);
        sinon.assert.calledWithExactly(customs.flag, CLIENT_ADDRESS, {
          email: TEST_EMAIL,
          errno: error.ERRNO.INVALID_UNBLOCK_CODE,
        });
      }
    );
  });

  it('expired unblock codes are rejected as invalid', () => {
    customs.check = sinon.spy((_request: any, _email: any, action: any) => {
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
        throw new Error('should not succeed');
      },
      (err: any) => {
        expect(err.errno).toBe(error.ERRNO.INVALID_UNBLOCK_CODE);
        sinon.assert.calledTwice(customs.check);
        sinon.assert.calledWithMatch(
          customs.check.getCall(0),
          sinon.match.object,
          TEST_EMAIL,
          'accountLogin'
        );
        sinon.assert.calledWithMatch(
          customs.check.getCall(1),
          sinon.match.object,
          TEST_EMAIL,
          'unblockCodeFailed'
        );
        sinon.assert.calledOnce(db.accountRecord);
        sinon.assert.calledOnce(db.consumeUnblockCode);

        sinon.assert.calledTwice(request.emitMetricsEvent);
        sinon.assert.calledWithExactly(
          request.emitMetricsEvent.getCall(0),
          'account.login.blocked'
        );
        sinon.assert.calledWithExactly(
          request.emitMetricsEvent.getCall(1),
          'account.login.invalidUnblockCode'
        );

        sinon.assert.calledOnce(customs.flag);
        sinon.assert.calledWithExactly(customs.flag, CLIENT_ADDRESS, {
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
        throw new Error('should not succeed');
      },
      (err: any) => {
        expect(err.errno).toBe(error.ERRNO.REQUEST_BLOCKED);
        sinon.assert.calledOnce(customs.check);
        sinon.assert.calledOnce(db.accountRecord);
        sinon.assert.calledOnce(db.consumeUnblockCode);
        sinon.assert.notCalled(customs.flag);
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
      clock.restore();
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
      sinon.assert.calledOnce(metricsContext.setFlowCompleteSignal);
      sinon.assert.calledWithExactly(
        metricsContext.setFlowCompleteSignal,
        'account.login',
        'login'
      );

      sinon.assert.calledOnce(metricsContext.stash);
      sinon.assert.calledWithExactly(metricsContext.stash, sessionToken);

      sinon.assert.calledOnce(db.sessions);
      sinon.assert.calledWithExactly(db.sessions, TEST_UID);

      sinon.assert.calledOnce(log.activityEvent);
      sinon.assert.calledWithExactly(log.activityEvent, {
        country: 'United States',
        event: 'account.login',
        region: 'California',
        service: undefined,
        userAgent: 'test user-agent',
        sigsciRequestId: 'test-sigsci-id',
        clientJa4: 'test-ja4',
        uid: TEST_UID,
      });

      sinon.assert.calledTwice(log.flowEvent);
      sinon.assert.calledWithMatch(log.flowEvent.getCall(0), {
        event: 'account.login',
      });
      sinon.assert.calledWithMatch(log.flowEvent.getCall(1), {
        event: 'flow.complete',
      });

      sinon.assert.calledOnce(log.notifyAttachedServices);
      sinon.assert.calledWithExactly(
        log.notifyAttachedServices,
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

      sinon.assert.notCalled(fxaMailer.sendVerifyEmail);
      sinon.assert.notCalled(fxaMailer.sendVerifyLoginEmail);
      sinon.assert.notCalled(fxaMailer.sendVerifyLoginCodeEmail);

      sinon.assert.calledOnce(db.securityEvent);
      sinon.assert.calledWithExactly(db.securityEvent, {
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
        sinon.assert.calledOnce(metricsContext.setFlowCompleteSignal);
        sinon.assert.calledWithExactly(
          metricsContext.setFlowCompleteSignal,
          'account.login',
          'login'
        );

        sinon.assert.calledOnce(metricsContext.stash);

        sinon.assert.calledOnce(fxaMailer.sendVerifyEmail);
        sinon.assert.calledWithExactly(fxaMailer.sendVerifyEmail, {
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

        sinon.assert.calledThrice(log.flowEvent);
        sinon.assert.calledWithMatch(log.flowEvent.getCall(0), {
          event: 'account.login',
        });
        sinon.assert.calledWithMatch(log.flowEvent.getCall(1), {
          event: 'flow.complete',
        });
        sinon.assert.calledWithMatch(log.flowEvent.getCall(2), {
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
        sinon.assert.calledOnce(metricsContext.setFlowCompleteSignal);
        sinon.assert.calledWithExactly(
          metricsContext.setFlowCompleteSignal,
          'account.confirmed',
          'login'
        );

        sinon.assert.calledTwice(metricsContext.stash);
        sinon.assert.calledWithExactly(
          metricsContext.stash.getCall(0),
          sessionToken
        );
        sinon.assert.calledWithExactly(metricsContext.stash.getCall(1), {
          uid: TEST_UID,
          id: 'tokenVerifyCode',
        });

        sinon.assert.calledOnce(fxaMailer.sendVerifyEmail);
        sinon.assert.calledWithExactly(fxaMailer.sendVerifyEmail, {
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

        sinon.assert.calledTwice(log.flowEvent);
        sinon.assert.calledWithMatch(log.flowEvent.getCall(0), {
          event: 'account.login',
        });
        sinon.assert.calledWithMatch(log.flowEvent.getCall(1), {
          event: 'email.verification.sent',
        });

        sinon.assert.calledOnce(log.notifyAttachedServices);
        sinon.assert.calledWithExactly(
          log.notifyAttachedServices,
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
      sinon.assert.calledOnce(db.sessions);
      sinon.assert.calledOnce(log.activityEvent);

      sinon.assert.notCalled(fxaMailer.sendVerifyLoginEmail);
      sinon.assert.notCalled(fxaMailer.sendVerifyLoginCodeEmail);

      sinon.assert.calledOnce(db.securityEvent);
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
        sinon.assert.calledOnce(metricsContext.setFlowCompleteSignal);
        sinon.assert.calledWithExactly(
          metricsContext.setFlowCompleteSignal,
          'account.login',
          'login'
        );

        sinon.assert.calledOnce(metricsContext.stash);
        sinon.assert.calledOnce(db.sessions);
        sinon.assert.calledOnce(log.activityEvent);
        sinon.assert.calledOnce(log.notifyAttachedServices);
        sinon.assert.calledWithExactly(
          log.notifyAttachedServices,
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

        sinon.assert.notCalled(fxaMailer.sendVerifyEmail);
        sinon.assert.notCalled(fxaMailer.sendVerifyLoginEmail);
        sinon.assert.notCalled(fxaMailer.sendVerifyLoginCodeEmail);
        sinon.assert.notCalled(fxaMailer.sendNewDeviceLoginEmail);

        sinon.assert.calledTwice(log.flowEvent);
        sinon.assert.calledWithMatch(log.flowEvent.getCall(0), {
          event: 'account.login',
        });
        sinon.assert.calledWithMatch(log.flowEvent.getCall(1), {
          event: 'flow.complete',
        });

        sinon.assert.calledOnce(db.securityEvent);
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
        sinon.assert.notCalled(fxaMailer.sendVerifyEmail);
        sinon.assert.notCalled(mailer.sendVerifyLoginCodeEmail);
        sinon.assert.calledOnce(fxaMailer.sendVerifyLoginEmail);
        sinon.assert.calledWithExactly(fxaMailer.sendVerifyLoginEmail, {
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

        sinon.assert.calledTwice(log.flowEvent);
        sinon.assert.calledWithMatch(log.flowEvent.getCall(0), {
          event: 'account.login',
        });
        sinon.assert.calledWithMatch(log.flowEvent.getCall(1), {
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
        sinon.assert.notCalled(fxaMailer.sendVerifyEmail);
        sinon.assert.notCalled(fxaMailer.sendVerifyLoginCodeEmail);
        sinon.assert.calledOnce(fxaMailer.sendVerifyLoginEmail);

        sinon.assert.calledTwice(log.flowEvent);
        sinon.assert.calledWithMatch(log.flowEvent.getCall(0), {
          event: 'account.login',
        });
        sinon.assert.calledWithMatch(log.flowEvent.getCall(1), {
          event: 'email.confirmation.sent',
        });
      });
    });

    it('emits correct notifications when verificationMethod=email-2fa', () => {
      const oauthClientInfoMock = mocks.mockOAuthClientInfo({
        fetch: sinon.stub().resolves({ name: undefined }),
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
        sinon.assert.notCalled(fxaMailer.sendVerifyEmail);
        sinon.assert.notCalled(fxaMailer.sendVerifyLoginEmail);
        sinon.assert.calledOnce(fxaMailer.sendVerifyLoginCodeEmail);

        const expectedCode = otpUtils.generateOtpCode(
          accountRecord.primaryEmail.emailCode,
          otpOptions
        );
        sinon.assert.calledWithMatch(fxaMailer.sendVerifyLoginCodeEmail, {
          to: TEST_EMAIL,
          cc: [],
          metricsEnabled: true,
          uid: TEST_UID,
          code: expectedCode,
          redirectTo: request.payload.redirectTo,
          resume: request.payload.resume,
          serviceName: undefined,
        });

        sinon.assert.calledOnce(oauthClientInfoMock.fetch);

        sinon.assert.calledTwice(log.flowEvent);
        sinon.assert.calledWithMatch(log.flowEvent.getCall(0), {
          event: 'account.login',
        });
        sinon.assert.calledWithMatch(log.flowEvent.getCall(1), {
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
        sinon.assert.notCalled(fxaMailer.sendVerifyEmail);
        sinon.assert.notCalled(fxaMailer.sendVerifyLoginEmail);
        sinon.assert.notCalled(fxaMailer.sendVerifyLoginCodeEmail);

        sinon.assert.calledOnce(log.flowEvent);
        sinon.assert.calledWithMatch(log.flowEvent, { event: 'account.login' });
      });
    });

    afterEach(() => {
      sinon.assert.calledOnce(metricsContext.setFlowCompleteSignal);
      sinon.assert.calledWithExactly(
        metricsContext.setFlowCompleteSignal,
        'account.confirmed',
        'login'
      );

      sinon.assert.calledTwice(metricsContext.stash);
      sinon.assert.calledWithExactly(
        metricsContext.stash.getCall(0),
        sessionToken
      );
      sinon.assert.calledWithExactly(metricsContext.stash.getCall(1), {
        uid: TEST_UID,
        id: 'tokenVerifyCode',
      });

      sinon.assert.calledOnce(db.sessions);
      sinon.assert.calledOnce(log.activityEvent);
      sinon.assert.calledOnce(log.notifyAttachedServices);
      sinon.assert.calledWithExactly(
        log.notifyAttachedServices,
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
      sinon.assert.calledOnce(db.securityEvent);
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
        sinon.assert.calledOnce(fxaMailer.sendVerifyLoginCodeEmail);
        const callArgs = fxaMailer.sendVerifyLoginCodeEmail.getCall(0).args[0];
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
        sinon.assert.calledOnce(fxaMailer.sendVerifyLoginCodeEmail);
        sinon.assert.calledOnce(oauthClientInfoMock.fetch);
        sinon.assert.calledWith(oauthClientInfoMock.fetch, undefined);
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
        sinon.assert.calledOnce(fxaMailer.sendVerifyLoginCodeEmail);
        const callArgs = fxaMailer.sendVerifyLoginCodeEmail.getCall(0).args[0];
        expect(callArgs.serviceName).toBe('sync');
        sinon.assert.notCalled(fxaMailer.sendVerifyEmail);
        sinon.assert.notCalled(fxaMailer.sendVerifyLoginEmail);
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
        sinon.assert.calledOnce(fxaMailer.sendVerifyLoginCodeEmail);
        sinon.assert.notCalled(fxaMailer.sendVerifyEmail);
        sinon.assert.notCalled(fxaMailer.sendVerifyLoginEmail);
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
        sinon.assert.notCalled(fxaMailer.sendVerifyLoginCodeEmail);
        sinon.assert.notCalled(fxaMailer.sendVerifyEmail);
        sinon.assert.notCalled(fxaMailer.sendVerifyLoginEmail);
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
        sinon.assert.calledOnce(fxaMailer.sendVerifyLoginCodeEmail);
        sinon.assert.notCalled(fxaMailer.sendVerifyEmail);
        sinon.assert.notCalled(fxaMailer.sendVerifyLoginEmail);
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
          sinon.assert.notCalled(fxaMailer.sendVerifyEmail);
          sinon.assert.notCalled(fxaMailer.sendVerifyLoginEmail);
          sinon.assert.calledOnce(fxaMailer.sendVerifyLoginCodeEmail);

          const expectedCode = otpUtils.generateOtpCode(
            accountRecord.primaryEmail.emailCode,
            otpOptions
          );
          sinon.assert.calledWithMatch(fxaMailer.sendVerifyLoginCodeEmail, {
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
      sinon.assert.notCalled(log.notifyAttachedServices);
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
        sinon.assert.calledOnce(log.notifyAttachedServices);
        sinon.assert.calledWithExactly(
          log.notifyAttachedServices,
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
      db.sessions = sinon.spy(() =>
        Promise.resolve([{}, {}, {}, sessionToken])
      );
      return sendSigninNotifications(
        request,
        accountRecord,
        sessionToken,
        undefined
      ).then(() => {
        sinon.assert.calledOnce(log.notifyAttachedServices);
        sinon.assert.calledWithExactly(
          log.notifyAttachedServices,
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
      sinon.assert.calledOnce(metricsContext.setFlowCompleteSignal);
      sinon.assert.calledWithExactly(
        metricsContext.setFlowCompleteSignal,
        'account.signed',
        'login'
      );

      sinon.assert.calledOnce(metricsContext.stash);
      sinon.assert.calledOnce(db.sessions);
      sinon.assert.calledOnce(log.activityEvent);

      sinon.assert.calledOnce(log.flowEvent);
      sinon.assert.calledWithMatch(log.flowEvent, { event: 'account.login' });

      sinon.assert.calledOnce(db.securityEvent);
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
    ).then((res: any) => {
      expect(res).toEqual({ id: 'KEY_FETCH_TOKEN' });

      sinon.assert.calledOnce(password.unwrap);
      sinon.assert.calledWithExactly(password.unwrap, accountRecord.wrapWrapKb);

      sinon.assert.calledOnce(db.createKeyFetchToken);
      sinon.assert.calledWithExactly(db.createKeyFetchToken, {
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
      sinon.assert.calledOnce(metricsContext.stash);
      sinon.assert.calledOn(metricsContext.stash, request);
      sinon.assert.calledWithExactly(metricsContext.stash, {
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
    sinon.assert.calledOnce(mockCadReminders.delete);
    sinon.assert.calledWithExactly(mockCadReminders.delete, '123');
  });

  it('does not call cadReminders delete for unverified session', async () => {
    await cleanupReminders({ sessionVerified: false }, { uid: '123' });
    sinon.assert.notCalled(mockCadReminders.delete);
  });
});
