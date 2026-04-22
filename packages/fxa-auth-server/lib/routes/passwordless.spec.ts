/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import crypto from 'crypto';
import * as uuid from 'uuid';
import { AppError as error } from '@fxa/accounts/errors';

const mocks = require('../../test/mocks');
const { getRoute } = require('../../test/routes_helpers');

function hexString(bytes: number) {
  return crypto.randomBytes(bytes).toString('hex');
}

const TEST_EMAIL = 'test@example.com';

// Suppress moment-timezone warnings caused by swapped args in
// constructLocalTimeAndDateStrings (acceptLanguage passed as timeZone).
// This is a pre-existing bug in the route code, not a test issue.
beforeAll(() => {
  jest.spyOn(console, 'error').mockImplementation(() => {});
});
afterAll(() => {
  jest.restoreAllMocks();
});

// --- Module-level stubs for mocked dependencies ---

let mockOtpManagerCreate: jest.Mock;
let mockOtpManagerIsValid: jest.Mock;
let mockOtpManagerDelete: jest.Mock;
let mockOtpManager: {
  create: jest.Mock;
  isValid: jest.Mock;
  delete: jest.Mock;
};

// Top-level mocks for modules that are always mocked the same way.
// `@fxa/shared/otp`, `./utils/otp`, and `./utils/security-event` are
// resolved via proxyquire in the Mocha file. Here we use jest.mock() for
// the static mocks and pass option-driven stubs through the route factory.

jest.mock('@fxa/shared/otp', () => {
  // The real module exports `OtpManager` as a class. The route file calls
  // `new OtpManager(...)`. We return whatever `mockOtpManager` points to at
  // call time so each test gets fresh stubs.
  return {
    OtpManager: jest.fn().mockImplementation(() => {
      return mockOtpManager;
    }),
    // Re-export anything else the module may expose (OtpStorage type, etc.)
    __esModule: true,
  };
});

// `./utils/otp` default export is a factory `(db, statsd) => OtpUtils`.
// The route only calls `otpUtils.hasTotpToken(uid)`.
let hasTotpTokenStub: jest.Mock;

jest.mock('./utils/otp', () => ({
  __esModule: true,
  default: () => ({
    hasTotpToken: (...args: any[]) => hasTotpTokenStub(...args),
  }),
}));

// `./utils/security-event` named export `recordSecurityEvent`.
let recordSecurityEventStub: jest.Mock;

jest.mock('./utils/security-event', () => ({
  recordSecurityEvent: (...args: any[]) => recordSecurityEventStub(...args),
}));

// `./utils/account` named export `getOptionalCmsEmailConfig`.
// We default to a stub that returns `{}`. Individual tests that care about
// CMS behaviour will override via `jest.doMock` + `jest.resetModules`, or
// we simply reassign the stub per-test.
let getOptionalCmsEmailConfigStub: jest.Mock;

jest.mock('./utils/account', () => {
  const actual = jest.requireActual('./utils/account');
  return {
    ...actual,
    getOptionalCmsEmailConfig: (...args: any[]) =>
      getOptionalCmsEmailConfigStub(...args),
  };
});

// ---------------------------------------------------------------------------
// Route factory (mirrors the Mocha `makeRoutes`)
// ---------------------------------------------------------------------------

function makeRoutes(options: any = {}) {
  const config = options.config || {};
  config.passwordlessOtp = config.passwordlessOtp || {
    enabled: true,
    ttl: 300,
    digits: 6,
    allowedClientServices: {},
  };
  config.verifierVersion = config.verifierVersion || 0;
  config.gleanMetrics = config.gleanMetrics || {
    enabled: true,
  };

  const log = options.log || mocks.mockLog();
  const db = options.db || mocks.mockDB();
  const customs = options.customs || {
    check: () => Promise.resolve(true),
    v2Enabled: () => true,
  };
  const glean = options.glean || mocks.mockGlean();
  const statsd = options.statsd || mocks.mockStatsd();
  const redis = options.authServerCacheRedis || {
    get: async () => null,
    set: async () => 'OK',
    del: async () => 0,
  };

  // Refresh per-test OtpManager stubs
  mockOtpManagerCreate = jest.fn().mockResolvedValue('123456');
  mockOtpManagerIsValid = jest.fn().mockResolvedValue(true);
  mockOtpManagerDelete = jest.fn().mockResolvedValue(undefined);

  mockOtpManager = {
    create: mockOtpManagerCreate,
    isValid: mockOtpManagerIsValid,
    delete: mockOtpManagerDelete,
  };

  // Wire up option-driven stubs
  hasTotpTokenStub = options.hasTotpToken || jest.fn().mockResolvedValue(false);
  recordSecurityEventStub =
    options.recordSecurityEvent || jest.fn().mockResolvedValue(undefined);
  getOptionalCmsEmailConfigStub =
    options.getOptionalCmsEmailConfig || jest.fn().mockResolvedValue({});

  mocks.mockFxaMailer();

  // Now require the module under test. Because all mocks above are wired
  // through jest.mock() at the module level, the fresh `require` picks them
  // up automatically.
  const { passwordlessRoutes } = require('./passwordless');
  return passwordlessRoutes(log, db, config, customs, glean, statsd, redis);
}

function runTest(route: any, request: any, assertions?: (result: any) => void) {
  return new Promise((resolve, reject) => {
    try {
      return route.handler(request).then(resolve, reject);
    } catch (err) {
      reject(err);
    }
  }).then(assertions);
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('/account/passwordless/send_code', () => {
  let uid: string,
    mockLog: any,
    mockRequest: any,
    mockDB: any,
    mockCustoms: any,
    route: any,
    routes: any;

  beforeEach(() => {
    uid = uuid.v4({}, Buffer.alloc(16)).toString('hex');
    mockLog = mocks.mockLog();
    mockDB = mocks.mockDB({
      uid,
      email: TEST_EMAIL,
      emailVerified: true,
      verifierSetAt: 0,
    });
    mockCustoms = {
      check: jest.fn(() => Promise.resolve()),
      v2Enabled: () => true,
    };
    mockRequest = mocks.mockRequest({
      log: mockLog,
      payload: {
        email: TEST_EMAIL,
        clientId: 'test-client-id',
        metricsContext: {
          deviceId: 'device123',
          flowId: 'flow123',
          flowBeginTime: Date.now(),
        },
      },
    });

    routes = makeRoutes({
      log: mockLog,
      db: mockDB,
      customs: mockCustoms,
      config: {
        passwordlessOtp: {
          enabled: true,
          ttl: 300,
          digits: 6,
          allowedClientServices: {
            'test-client-id': { allowedServices: ['*'] },
          },
        },
      },
    });
    route = getRoute(routes, '/account/passwordless/send_code', 'POST');
  });

  afterEach(() => {
    mockOtpManagerCreate.mockClear();
    mockOtpManagerIsValid.mockClear();
    mockOtpManagerDelete.mockClear();
  });

  it('should send OTP for new account', () => {
    mockDB.accountRecord = jest.fn(() =>
      Promise.reject(error.unknownAccount())
    );

    return runTest(route, mockRequest, (result) => {
      expect(mockCustoms.check).toHaveBeenCalledTimes(1);
      expect(mockCustoms.check).toHaveBeenNthCalledWith(
        1,
        expect.anything(),
        TEST_EMAIL,
        'passwordlessSendOtp'
      );

      expect(mockOtpManagerCreate).toHaveBeenCalledTimes(1);
      expect(mockOtpManagerCreate).toHaveBeenNthCalledWith(1, TEST_EMAIL);

      expect(result).toEqual({});
    });
  });

  it('should send OTP for existing passwordless account', () => {
    mockDB.accountRecord = jest.fn(() =>
      Promise.resolve({
        uid,
        email: TEST_EMAIL,
        verifierSetAt: 0,
        emails: [{ email: TEST_EMAIL, isPrimary: true }],
      })
    );

    return runTest(route, mockRequest, (result) => {
      expect(mockDB.accountRecord).toHaveBeenCalledTimes(1);
      expect(mockOtpManagerCreate).toHaveBeenCalledTimes(1);
      expect(mockOtpManagerCreate).toHaveBeenNthCalledWith(1, uid);
      expect(result).toEqual({});
    });
  });

  it('should reject account with password', () => {
    mockDB.accountRecord = jest.fn(() =>
      Promise.resolve({
        uid,
        email: TEST_EMAIL,
        verifierSetAt: Date.now(),
      })
    );

    return runTest(route, mockRequest).then(
      () => {
        throw new Error('should have thrown');
      },
      (err) => {
        expect(mockDB.accountRecord).toHaveBeenCalledTimes(1);
        expect(mockOtpManagerCreate).toHaveBeenCalledTimes(0);
        expect(err.errno).toBe(206);
      }
    );
  });

  it('should apply rate limiting', () => {
    mockCustoms.check = jest.fn(() => Promise.reject(error.tooManyRequests()));

    return runTest(route, mockRequest).then(
      () => {
        throw new Error('should have thrown');
      },
      (err) => {
        expect(mockCustoms.check).toHaveBeenCalledTimes(1);
        expect(err.errno).toBe(error.ERRNO.THROTTLED);
      }
    );
  });
});

describe('/account/passwordless/confirm_code', () => {
  let uid: string,
    mockLog: any,
    mockRequest: any,
    mockDB: any,
    mockCustoms: any,
    route: any,
    routes: any;

  beforeEach(() => {
    uid = uuid.v4({}, Buffer.alloc(16)).toString('hex');
    mockLog = mocks.mockLog();
    mockDB = mocks.mockDB({
      uid,
      email: TEST_EMAIL,
      emailCode: hexString(16),
      emailVerified: true,
      verifierSetAt: 0,
    });
    mockCustoms = {
      check: jest.fn(() => Promise.resolve()),
      v2Enabled: () => true,
    };
    mockRequest = mocks.mockRequest({
      log: mockLog,
      payload: {
        email: TEST_EMAIL,
        code: '123456',
        clientId: 'test-client-id',
        metricsContext: {
          deviceId: 'device123',
          flowId: 'flow123',
          flowBeginTime: Date.now(),
        },
      },
    });

    routes = makeRoutes({
      log: mockLog,
      db: mockDB,
      customs: mockCustoms,
      config: {
        passwordlessOtp: {
          enabled: true,
          ttl: 300,
          digits: 6,
          allowedClientServices: {
            'test-client-id': { allowedServices: ['*'] },
          },
        },
      },
    });
    route = getRoute(routes, '/account/passwordless/confirm_code', 'POST');
  });

  afterEach(() => {
    mockOtpManagerCreate.mockClear();
    mockOtpManagerIsValid.mockClear();
    mockOtpManagerDelete.mockClear();
  });

  it('should create new account and session for valid code', () => {
    mockDB.accountRecord = jest.fn(() =>
      Promise.reject(error.unknownAccount())
    );
    mockDB.createAccount = jest.fn(() =>
      Promise.resolve({
        uid,
        email: TEST_EMAIL,
        emailCode: hexString(16),
        verifierSetAt: 0,
      })
    );
    mockDB.createSessionToken = jest.fn(() =>
      Promise.resolve({
        data: 'sessiontoken123',
        emailVerified: true,
        tokenVerified: true,
        lastAuthAt: () => 1234567890,
      })
    );

    return runTest(route, mockRequest, (result) => {
      // mustVerify should always be true (defense-in-depth)
      const sessionOpts = mockDB.createSessionToken.mock.calls[0][0];
      expect(sessionOpts.mustVerify).toBe(true);
      expect(sessionOpts.tokenVerificationId).toBe(null);

      expect(mockCustoms.check).toHaveBeenCalledTimes(2);
      expect(mockCustoms.check).toHaveBeenNthCalledWith(
        1,
        expect.anything(),
        expect.anything(),
        'passwordlessVerifyOtp'
      );
      expect(mockCustoms.check).toHaveBeenNthCalledWith(
        2,
        expect.anything(),
        expect.anything(),
        'passwordlessVerifyOtpPerDay'
      );

      expect(mockOtpManagerIsValid).toHaveBeenCalledTimes(1);
      expect(mockOtpManagerIsValid).toHaveBeenNthCalledWith(
        1,
        TEST_EMAIL,
        '123456'
      );

      expect(mockOtpManagerDelete).toHaveBeenCalledTimes(1);
      expect(mockOtpManagerDelete).toHaveBeenNthCalledWith(1, TEST_EMAIL);

      expect(mockDB.createAccount).toHaveBeenCalledTimes(1);
      expect(mockDB.createAccount).toHaveBeenNthCalledWith(
        1,
        expect.objectContaining({
          email: TEST_EMAIL,
          emailVerified: true,
          verifierSetAt: 0,
        })
      );

      expect(mockDB.createSessionToken).toHaveBeenCalledTimes(1);

      expect(result.uid).toBe(uid);
      expect(result.sessionToken).toBe('sessiontoken123');
      expect(result.verified).toBe(true);
      expect(result.authAt).toBe(1234567890);
      expect(result.isNewAccount).toBe(true);

      // Should emit SNS verified + login + profileDataChange events so
      // Basket/Braze learn about the new passwordless account. Missing
      // these calls was the root cause of the basket regression (FXA-13416).
      const notifyEvents = mockLog.notifyAttachedServices.mock.calls.map(
        (call: any[]) => call[0]
      );
      expect(notifyEvents).toContain('verified');
      expect(notifyEvents).toContain('login');
      expect(notifyEvents).toContain('profileDataChange');
      expect(mockLog.notifyAttachedServices).toHaveBeenCalledWith(
        'verified',
        mockRequest,
        expect.objectContaining({ email: TEST_EMAIL, uid })
      );
    });
  });

  it('should create session for existing account with valid code', () => {
    mockDB.accountRecord = jest.fn(() =>
      Promise.resolve({
        uid,
        email: TEST_EMAIL,
        emailCode: hexString(16),
        verifierSetAt: 0,
      })
    );
    mockDB.createSessionToken = jest.fn(() =>
      Promise.resolve({
        data: 'sessiontoken123',
        emailVerified: true,
        tokenVerified: true,
        lastAuthAt: () => 1234567890,
      })
    );
    mockDB.sessions = jest.fn(() => Promise.resolve([{}, {}, {}]));

    return runTest(route, mockRequest, (result) => {
      expect(mockOtpManagerIsValid).toHaveBeenCalledTimes(1);
      expect(mockOtpManagerIsValid).toHaveBeenNthCalledWith(
        1,
        uid,
        expect.anything()
      );

      expect(mockDB.createAccount).toHaveBeenCalledTimes(0);
      expect(mockDB.createSessionToken).toHaveBeenCalledTimes(1);

      // mustVerify should always be true (defense-in-depth)
      const sessionOpts = mockDB.createSessionToken.mock.calls[0][0];
      expect(sessionOpts.mustVerify).toBe(true);
      expect(sessionOpts.tokenVerificationId).toBe(null);

      expect(result.uid).toBe(uid);
      expect(result.isNewAccount).toBe(false);

      // Existing account: login event only, no verified, no
      // profileDataChange. deviceCount should come from db.sessions.
      const notifyEvents = mockLog.notifyAttachedServices.mock.calls.map(
        (call: any[]) => call[0]
      );
      expect(notifyEvents).toEqual(['login']);
      expect(mockLog.notifyAttachedServices).toHaveBeenCalledWith(
        'login',
        mockRequest,
        expect.objectContaining({ email: TEST_EMAIL, uid, deviceCount: 3 })
      );
    });
  });

  it('should emit glean registration.complete with reason otp for new account', () => {
    const mockGlean = mocks.mockGlean();
    mockDB.accountRecord = jest.fn(() =>
      Promise.reject(error.unknownAccount())
    );
    mockDB.createAccount = jest.fn(() =>
      Promise.resolve({
        uid,
        email: TEST_EMAIL,
        emailCode: hexString(16),
        verifierSetAt: 0,
      })
    );
    mockDB.createSessionToken = jest.fn(() =>
      Promise.resolve({
        data: 'sessiontoken123',
        emailVerified: true,
        tokenVerified: true,
        lastAuthAt: () => 1234567890,
      })
    );

    routes = makeRoutes({
      log: mockLog,
      db: mockDB,
      customs: mockCustoms,
      glean: mockGlean,
      config: {
        passwordlessOtp: {
          enabled: true,
          ttl: 300,
          digits: 6,
          allowedClientServices: {
            'test-client-id': { allowedServices: ['*'] },
          },
        },
      },
    });
    route = getRoute(routes, '/account/passwordless/confirm_code', 'POST');

    return runTest(route, mockRequest, () => {
      expect(mockGlean.registration.complete).toHaveBeenCalledTimes(1);
      expect(mockGlean.registration.complete).toHaveBeenCalledWith(
        mockRequest,
        expect.objectContaining({
          uid,
          reason: 'otp',
        })
      );
    });
  });

  it('should emit glean login.complete with reason otp for existing account', () => {
    const mockGlean = mocks.mockGlean();
    mockDB.accountRecord = jest.fn(() =>
      Promise.resolve({
        uid,
        email: TEST_EMAIL,
        emailCode: hexString(16),
        verifierSetAt: 0,
      })
    );
    mockDB.createSessionToken = jest.fn(() =>
      Promise.resolve({
        data: 'sessiontoken123',
        emailVerified: true,
        tokenVerified: true,
        lastAuthAt: () => 1234567890,
      })
    );

    routes = makeRoutes({
      log: mockLog,
      db: mockDB,
      customs: mockCustoms,
      glean: mockGlean,
      config: {
        passwordlessOtp: {
          enabled: true,
          ttl: 300,
          digits: 6,
          allowedClientServices: {
            'test-client-id': { allowedServices: ['*'] },
          },
        },
      },
    });
    route = getRoute(routes, '/account/passwordless/confirm_code', 'POST');

    return runTest(route, mockRequest, () => {
      expect(mockGlean.login.complete).toHaveBeenCalledTimes(1);
      expect(mockGlean.login.complete).toHaveBeenCalledWith(
        mockRequest,
        expect.objectContaining({
          uid,
          reason: 'otp',
        })
      );
    });
  });

  it('should reject invalid OTP code', () => {
    mockDB.accountRecord = jest.fn(() =>
      Promise.resolve({
        uid,
        email: TEST_EMAIL,
        verifierSetAt: 0,
      })
    );
    mockOtpManagerIsValid.mockResolvedValue(false);

    return runTest(route, mockRequest).then(
      () => {
        throw new Error('should have thrown');
      },
      (err) => {
        expect(mockOtpManagerIsValid).toHaveBeenCalledTimes(1);
        expect(mockOtpManagerDelete).toHaveBeenCalledTimes(0);
        expect(err.errno).toBe(105);
      }
    );
  });

  it('should return unverified session with verificationMethod for TOTP accounts', () => {
    mockDB.accountRecord = jest.fn(() =>
      Promise.resolve({
        uid,
        email: TEST_EMAIL,
        verifierSetAt: 0,
      })
    );
    mockDB.createSessionToken = jest.fn(() =>
      Promise.resolve({
        data: 'sessiontoken123',
        emailVerified: true,
        tokenVerified: false,
        lastAuthAt: () => Date.now(),
      })
    );

    const hasTotpToken = jest.fn().mockResolvedValue(true);
    routes = makeRoutes({
      log: mockLog,
      db: mockDB,
      customs: mockCustoms,
      hasTotpToken,
      config: {
        passwordlessOtp: {
          enabled: true,
          ttl: 300,
          digits: 6,
          allowedClientServices: {
            'test-client-id': { allowedServices: ['*'] },
          },
        },
      },
    });
    route = getRoute(routes, '/account/passwordless/confirm_code', 'POST');

    return runTest(route, mockRequest).then((result: any) => {
      expect(hasTotpToken).toHaveBeenCalledTimes(1);
      expect(mockOtpManagerIsValid).toHaveBeenCalledTimes(1);
      expect(mockOtpManagerDelete).toHaveBeenCalledTimes(1);
      expect(result.uid).toBe(uid);
      expect(result.sessionToken).toBe('sessiontoken123');
      expect(result.verified).toBe(false);
      expect(result.authAt).toBeTruthy();
      expect(result.isNewAccount).toBe(false);
      expect(result.verificationMethod).toBe('totp-2fa');
      expect(result.verificationReason).toBe('login');
      // Session should be created with mustVerify=true
      const sessionTokenArgs = mockDB.createSessionToken.mock.calls[0][0];
      expect(sessionTokenArgs.mustVerify).toBe(true);
      expect(sessionTokenArgs.tokenVerificationId).toBeTruthy();
    });
  });

  it('should reject account with password set', () => {
    mockDB.accountRecord = jest.fn(() =>
      Promise.resolve({
        uid,
        email: TEST_EMAIL,
        verifierSetAt: Date.now(),
      })
    );

    return runTest(route, mockRequest).then(
      () => {
        throw new Error('should have thrown');
      },
      (err) => {
        expect(mockDB.accountRecord).toHaveBeenCalledTimes(1);
        expect(err.errno).toBe(206);
      }
    );
  });

  it('should include user agent info in session token', () => {
    mockDB.accountRecord = jest.fn(() =>
      Promise.resolve({
        uid,
        email: TEST_EMAIL,
        emailCode: hexString(16),
        verifierSetAt: 0,
      })
    );
    mockDB.createSessionToken = jest.fn(() =>
      Promise.resolve({
        data: 'sessiontoken123',
        emailVerified: true,
        tokenVerified: true,
        lastAuthAt: () => 1234567890,
      })
    );
    mockRequest.app.ua = {
      browser: 'Firefox',
      browserVersion: '100',
      os: 'Linux',
      osVersion: '5.15',
      deviceType: 'desktop',
      formFactor: 'desktop',
    };

    return runTest(route, mockRequest, () => {
      expect(mockDB.createSessionToken).toHaveBeenCalledTimes(1);
      expect(mockDB.createSessionToken).toHaveBeenNthCalledWith(
        1,
        expect.objectContaining({
          uaBrowser: 'Firefox',
          uaBrowserVersion: '100',
          uaOS: 'Linux',
          uaOSVersion: '5.15',
          uaDeviceType: 'desktop',
          uaFormFactor: 'desktop',
          mustVerify: true,
          tokenVerificationId: null,
        })
      );
    });
  });
});

describe('passwordless CMS customization', () => {
  let uid: string,
    mockLog: any,
    mockRequest: any,
    mockDB: any,
    mockCustoms: any,
    route: any,
    routes: any;

  beforeEach(() => {
    uid = uuid.v4({}, Buffer.alloc(16)).toString('hex');
    mockLog = mocks.mockLog();
    mockDB = mocks.mockDB({
      uid,
      email: TEST_EMAIL,
      emailVerified: true,
      verifierSetAt: 0,
    });
    mockCustoms = {
      check: jest.fn(() => Promise.resolve()),
      v2Enabled: () => true,
    };
    mockRequest = mocks.mockRequest({
      log: mockLog,
      payload: {
        email: TEST_EMAIL,
        clientId: 'test-client-id',
        metricsContext: {
          deviceId: 'device123',
          flowId: 'flow123',
          flowBeginTime: Date.now(),
        },
      },
    });
  });

  afterEach(() => {
    mockOtpManagerCreate.mockClear();
    mockOtpManagerIsValid.mockClear();
    mockOtpManagerDelete.mockClear();
  });

  describe('send_code with CMS configuration', () => {
    beforeEach(() => {
      mockDB.accountRecord = jest.fn(() =>
        Promise.reject(error.unknownAccount())
      );
    });

    it('should call getOptionalCmsEmailConfig for new account', () => {
      const mockGetOptionalCmsEmailConfig = jest.fn().mockResolvedValue({});

      routes = makeRoutes({
        log: mockLog,
        db: mockDB,
        customs: mockCustoms,
        getOptionalCmsEmailConfig: mockGetOptionalCmsEmailConfig,
        config: {
          passwordlessOtp: {
            enabled: true,
            ttl: 300,
            digits: 6,
            allowedClientServices: {
              'test-client-id': { allowedServices: ['*'] },
            },
          },
        },
      });
      route = getRoute(routes, '/account/passwordless/send_code', 'POST');

      return runTest(route, mockRequest, () => {
        // Verify OTP was created
        expect(mockOtpManagerCreate).toHaveBeenCalledTimes(1);
        expect(mockOtpManagerCreate).toHaveBeenNthCalledWith(1, TEST_EMAIL);

        // Verify CMS config was fetched
        expect(mockGetOptionalCmsEmailConfig).toHaveBeenCalledTimes(1);
        expect(mockGetOptionalCmsEmailConfig).toHaveBeenNthCalledWith(
          1,
          expect.objectContaining({
            code: expect.anything(),
            deviceId: expect.anything(),
            flowId: expect.anything(),
            codeExpiryMinutes: 5,
          }),
          expect.objectContaining({
            emailTemplate: 'PasswordlessSignupOtpEmail',
            request: expect.anything(),
            log: expect.anything(),
          })
        );
      });
    });

    it('should call getOptionalCmsEmailConfig for existing account', () => {
      mockDB.accountRecord = jest.fn(() =>
        Promise.resolve({
          uid,
          email: TEST_EMAIL,
          verifierSetAt: 0,
          emails: [{ email: TEST_EMAIL, isPrimary: true }],
        })
      );

      const mockGetOptionalCmsEmailConfig = jest.fn().mockResolvedValue({});

      routes = makeRoutes({
        log: mockLog,
        db: mockDB,
        customs: mockCustoms,
        getOptionalCmsEmailConfig: mockGetOptionalCmsEmailConfig,
        config: {
          passwordlessOtp: {
            enabled: true,
            ttl: 300,
            digits: 6,
            allowedClientServices: {
              'test-client-id': { allowedServices: ['*'] },
            },
          },
        },
      });
      route = getRoute(routes, '/account/passwordless/send_code', 'POST');

      return runTest(route, mockRequest, () => {
        // Verify OTP was created with uid (not email)
        expect(mockOtpManagerCreate).toHaveBeenCalledTimes(1);
        expect(mockOtpManagerCreate).toHaveBeenNthCalledWith(1, uid);

        // Verify CMS config was fetched with correct template
        expect(mockGetOptionalCmsEmailConfig).toHaveBeenCalledTimes(1);
        expect(mockGetOptionalCmsEmailConfig).toHaveBeenNthCalledWith(
          1,
          expect.objectContaining({
            code: expect.anything(),
            deviceId: expect.anything(),
            flowId: expect.anything(),
            time: expect.anything(),
            date: expect.anything(),
          }),
          expect.objectContaining({
            emailTemplate: 'PasswordlessSigninOtpEmail',
            request: expect.anything(),
            log: expect.anything(),
          })
        );
      });
    });

    it('should send email with CMS customization when available', () => {
      mockDB.accountRecord = jest.fn(() =>
        Promise.reject(error.unknownAccount())
      );

      const mockGetOptionalCmsEmailConfig = jest.fn().mockResolvedValue({
        emailConfig: {
          subject: 'Custom Verification Code',
          description: 'Your custom OTP code',
          logoUrl: 'https://example.com/logo.png',
        },
      });

      routes = makeRoutes({
        log: mockLog,
        db: mockDB,
        customs: mockCustoms,
        getOptionalCmsEmailConfig: mockGetOptionalCmsEmailConfig,
        config: {
          passwordlessOtp: {
            enabled: true,
            ttl: 300,
            digits: 6,
            allowedClientServices: {
              'test-client-id': { allowedServices: ['*'] },
            },
          },
        },
      });
      route = getRoute(routes, '/account/passwordless/send_code', 'POST');

      return runTest(route, mockRequest, () => {
        // Verify CMS config was fetched
        expect(mockGetOptionalCmsEmailConfig).toHaveBeenCalledTimes(1);
        expect(mockGetOptionalCmsEmailConfig).toHaveBeenNthCalledWith(
          1,
          expect.objectContaining({
            code: expect.anything(),
            codeExpiryMinutes: 5,
          }),
          expect.anything()
        );
      });
    });

    it('should handle CMS manager absence gracefully', () => {
      mockDB.accountRecord = jest.fn(() =>
        Promise.reject(error.unknownAccount())
      );

      const mockGetOptionalCmsEmailConfig = jest.fn().mockResolvedValue({});

      routes = makeRoutes({
        log: mockLog,
        db: mockDB,
        customs: mockCustoms,
        getOptionalCmsEmailConfig: mockGetOptionalCmsEmailConfig,
        config: {
          passwordlessOtp: {
            enabled: true,
            ttl: 300,
            digits: 6,
            allowedClientServices: {
              'test-client-id': { allowedServices: ['*'] },
            },
          },
        },
      });
      route = getRoute(routes, '/account/passwordless/send_code', 'POST');

      return runTest(route, mockRequest, () => {
        // Should still work without CMS manager
        expect(mockOtpManagerCreate).toHaveBeenCalledTimes(1);
        expect(mockGetOptionalCmsEmailConfig).toHaveBeenCalledTimes(1);

        // Verify cmsManager parameter can be undefined
        expect(mockGetOptionalCmsEmailConfig).toHaveBeenNthCalledWith(
          1,
          expect.anything(),
          expect.objectContaining({
            log: expect.anything(),
            request: expect.anything(),
          })
        );
      });
    });

    it('should pass correct email template for resend_code', () => {
      mockDB.accountRecord = jest.fn(() =>
        Promise.resolve({
          uid,
          email: TEST_EMAIL,
          verifierSetAt: 0,
          emails: [{ email: TEST_EMAIL, isPrimary: true }],
        })
      );

      const mockGetOptionalCmsEmailConfig = jest.fn().mockResolvedValue({});

      routes = makeRoutes({
        log: mockLog,
        db: mockDB,
        customs: mockCustoms,
        getOptionalCmsEmailConfig: mockGetOptionalCmsEmailConfig,
        config: {
          passwordlessOtp: {
            enabled: true,
            ttl: 300,
            digits: 6,
            allowedClientServices: {
              'test-client-id': { allowedServices: ['*'] },
            },
          },
        },
      });
      route = getRoute(routes, '/account/passwordless/resend_code', 'POST');

      return runTest(route, mockRequest, () => {
        // Verify OTP was deleted and recreated
        expect(mockOtpManagerDelete).toHaveBeenCalledTimes(1);
        expect(mockOtpManagerCreate).toHaveBeenCalledTimes(1);

        // Verify CMS config was fetched with signin template
        expect(mockGetOptionalCmsEmailConfig).toHaveBeenCalledTimes(1);
        expect(mockGetOptionalCmsEmailConfig).toHaveBeenNthCalledWith(
          1,
          expect.anything(),
          expect.objectContaining({
            emailTemplate: 'PasswordlessSigninOtpEmail',
          })
        );
      });
    });
  });
});

describe('passwordless security events', () => {
  let uid: string,
    mockLog: any,
    mockRequest: any,
    mockDB: any,
    mockCustoms: any,
    mockRecordSecurityEvent: jest.Mock,
    route: any,
    routes: any;

  beforeEach(() => {
    uid = uuid.v4({}, Buffer.alloc(16)).toString('hex');
    mockLog = mocks.mockLog();
    mockDB = mocks.mockDB({
      uid,
      email: TEST_EMAIL,
      emailCode: hexString(16),
      emailVerified: true,
      verifierSetAt: 0,
    });
    mockCustoms = {
      check: jest.fn(() => Promise.resolve()),
      v2Enabled: () => true,
    };
    mockRecordSecurityEvent = jest.fn().mockResolvedValue(undefined);
    mockRequest = mocks.mockRequest({
      log: mockLog,
      payload: {
        email: TEST_EMAIL,
        clientId: 'test-client-id',
        metricsContext: {
          deviceId: 'device123',
          flowId: 'flow123',
          flowBeginTime: Date.now(),
        },
      },
    });
  });

  afterEach(() => {
    mockOtpManagerCreate.mockClear();
    mockOtpManagerIsValid.mockClear();
    mockOtpManagerDelete.mockClear();
  });

  it('should record security event when OTP is sent for new account', () => {
    mockDB.accountRecord = jest.fn(() =>
      Promise.reject(error.unknownAccount())
    );

    routes = makeRoutes({
      log: mockLog,
      db: mockDB,
      customs: mockCustoms,
      recordSecurityEvent: mockRecordSecurityEvent,
      config: {
        passwordlessOtp: {
          enabled: true,
          ttl: 300,
          digits: 6,
          allowedClientServices: {
            'test-client-id': { allowedServices: ['*'] },
          },
        },
      },
    });
    route = getRoute(routes, '/account/passwordless/send_code', 'POST');

    return runTest(route, mockRequest, () => {
      expect(mockRecordSecurityEvent).toHaveBeenCalledTimes(1);
      expect(mockRecordSecurityEvent).toHaveBeenNthCalledWith(
        1,
        'account.passwordless_login_otp_sent',
        expect.anything()
      );
    });
  });

  it('should record security event when OTP is sent for existing account', () => {
    mockDB.accountRecord = jest.fn(() =>
      Promise.resolve({
        uid,
        email: TEST_EMAIL,
        verifierSetAt: 0,
        emails: [{ email: TEST_EMAIL, isPrimary: true }],
      })
    );

    routes = makeRoutes({
      log: mockLog,
      db: mockDB,
      customs: mockCustoms,
      recordSecurityEvent: mockRecordSecurityEvent,
      config: {
        passwordlessOtp: {
          enabled: true,
          ttl: 300,
          digits: 6,
          allowedClientServices: {
            'test-client-id': { allowedServices: ['*'] },
          },
        },
      },
    });
    route = getRoute(routes, '/account/passwordless/send_code', 'POST');

    return runTest(route, mockRequest, () => {
      expect(mockRecordSecurityEvent).toHaveBeenCalledTimes(1);
      expect(mockRecordSecurityEvent).toHaveBeenNthCalledWith(
        1,
        'account.passwordless_login_otp_sent',
        expect.objectContaining({
          account: expect.objectContaining({ uid }),
        })
      );
    });
  });

  it('should record security event when valid OTP is confirmed for new account', () => {
    mockDB.accountRecord = jest.fn(() =>
      Promise.reject(error.unknownAccount())
    );
    mockDB.createAccount = jest.fn(() =>
      Promise.resolve({
        uid,
        email: TEST_EMAIL,
        emailCode: hexString(16),
        verifierSetAt: 0,
      })
    );
    mockDB.createSessionToken = jest.fn(() =>
      Promise.resolve({
        data: 'sessiontoken123',
        emailVerified: true,
        tokenVerified: true,
        lastAuthAt: () => 1234567890,
      })
    );

    mockRequest.payload.code = '123456';

    routes = makeRoutes({
      log: mockLog,
      db: mockDB,
      customs: mockCustoms,
      recordSecurityEvent: mockRecordSecurityEvent,
      config: {
        passwordlessOtp: {
          enabled: true,
          ttl: 300,
          digits: 6,
          allowedClientServices: {
            'test-client-id': { allowedServices: ['*'] },
          },
        },
      },
    });
    route = getRoute(routes, '/account/passwordless/confirm_code', 'POST');

    return runTest(route, mockRequest, () => {
      // Should record two events: registration_complete and otp_verified
      expect(mockRecordSecurityEvent).toHaveBeenCalledTimes(2);
      expect(mockRecordSecurityEvent).toHaveBeenNthCalledWith(
        1,
        'account.passwordless_registration_complete',
        expect.anything()
      );
      expect(mockRecordSecurityEvent).toHaveBeenNthCalledWith(
        2,
        'account.passwordless_login_otp_verified',
        expect.anything()
      );
    });
  });
});

describe('passwordless statsd metrics', () => {
  let uid: string,
    mockLog: any,
    mockRequest: any,
    mockDB: any,
    mockCustoms: any,
    mockStatsd: any,
    route: any,
    routes: any;

  beforeEach(() => {
    uid = uuid.v4({}, Buffer.alloc(16)).toString('hex');
    mockLog = mocks.mockLog();
    mockDB = mocks.mockDB({
      uid,
      email: TEST_EMAIL,
      emailCode: hexString(16),
      emailVerified: true,
      verifierSetAt: 0,
    });
    mockCustoms = {
      check: jest.fn(() => Promise.resolve()),
      v2Enabled: () => true,
    };
    mockStatsd = mocks.mockStatsd();
    mockRequest = mocks.mockRequest({
      log: mockLog,
      payload: {
        email: TEST_EMAIL,
        clientId: 'test-client-id',
        service: 'test-service',
        metricsContext: {
          deviceId: 'device123',
          flowId: 'flow123',
          flowBeginTime: Date.now(),
        },
      },
      app: {
        clientIdTag: 'test-client-id',
        serviceTag: 'test-service',
      },
    });
  });

  afterEach(() => {
    mockOtpManagerCreate.mockClear();
    mockOtpManagerIsValid.mockClear();
    mockOtpManagerDelete.mockClear();
  });

  it('should increment statsd counter when OTP is sent', () => {
    mockDB.accountRecord = jest.fn(() =>
      Promise.reject(error.unknownAccount())
    );

    routes = makeRoutes({
      log: mockLog,
      db: mockDB,
      customs: mockCustoms,
      statsd: mockStatsd,
      config: {
        passwordlessOtp: {
          enabled: true,
          ttl: 300,
          digits: 6,
          allowedClientServices: {
            'test-client-id': { allowedServices: ['*'] },
          },
        },
      },
    });
    route = getRoute(routes, '/account/passwordless/send_code', 'POST');

    return runTest(route, mockRequest, () => {
      expect(mockStatsd.increment).toHaveBeenCalledTimes(1);
      expect(mockStatsd.increment).toHaveBeenNthCalledWith(
        1,
        'passwordless.sendCode.success',
        expect.objectContaining({ isResend: 'false' })
      );
    });
  });

  it('should increment statsd counter when OTP is resent', () => {
    mockDB.accountRecord = jest.fn(() =>
      Promise.resolve({
        uid,
        email: TEST_EMAIL,
        verifierSetAt: 0,
        emails: [{ email: TEST_EMAIL, isPrimary: true }],
      })
    );

    routes = makeRoutes({
      log: mockLog,
      db: mockDB,
      customs: mockCustoms,
      statsd: mockStatsd,
      config: {
        passwordlessOtp: {
          enabled: true,
          ttl: 300,
          digits: 6,
          allowedClientServices: {
            'test-client-id': { allowedServices: ['*'] },
          },
        },
      },
    });
    route = getRoute(routes, '/account/passwordless/resend_code', 'POST');

    return runTest(route, mockRequest, () => {
      expect(mockStatsd.increment).toHaveBeenCalledTimes(1);
      expect(mockStatsd.increment).toHaveBeenNthCalledWith(
        1,
        'passwordless.sendCode.success',
        expect.objectContaining({ isResend: 'true' })
      );
    });
  });

  it('should increment statsd counter for successful registration', () => {
    mockDB.accountRecord = jest.fn(() =>
      Promise.reject(error.unknownAccount())
    );
    mockDB.createAccount = jest.fn(() =>
      Promise.resolve({
        uid,
        email: TEST_EMAIL,
        emailCode: hexString(16),
        verifierSetAt: 0,
      })
    );
    mockDB.createSessionToken = jest.fn(() =>
      Promise.resolve({
        data: 'sessiontoken123',
        emailVerified: true,
        tokenVerified: true,
        lastAuthAt: () => 1234567890,
      })
    );

    mockRequest.payload.code = '123456';

    routes = makeRoutes({
      log: mockLog,
      db: mockDB,
      customs: mockCustoms,
      statsd: mockStatsd,
      config: {
        passwordlessOtp: {
          enabled: true,
          ttl: 300,
          digits: 6,
          allowedClientServices: {
            'test-client-id': { allowedServices: ['*'] },
          },
        },
      },
    });
    route = getRoute(routes, '/account/passwordless/confirm_code', 'POST');

    return runTest(route, mockRequest, () => {
      // Should increment both registration.success and confirmCode.success
      expect(mockStatsd.increment.mock.calls.length).toBeGreaterThanOrEqual(2);
      const incrementCalls = mockStatsd.increment.mock.calls.map(
        (c: any) => c[0]
      );
      expect(incrementCalls).toContain('passwordless.registration.success');
      expect(incrementCalls).toContain('passwordless.confirmCode.success');

      // confirmCode.success should include isNewAccount tag
      const confirmCall = mockStatsd.increment.mock.calls.find(
        (c: any) => c[0] === 'passwordless.confirmCode.success'
      );
      expect(confirmCall).toBeDefined();
      expect(confirmCall[1]).toEqual(
        expect.objectContaining({ isNewAccount: 'true' })
      );
    });
  });

  it('should increment passwordless.blocked when client is not allowed', () => {
    mockDB.accountRecord = jest.fn(() =>
      Promise.reject(error.unknownAccount())
    );

    routes = makeRoutes({
      log: mockLog,
      db: mockDB,
      customs: mockCustoms,
      statsd: mockStatsd,
      config: {
        passwordlessOtp: {
          enabled: true,
          ttl: 300,
          digits: 6,
          allowedClientServices: {},
        },
      },
    });
    route = getRoute(routes, '/account/passwordless/send_code', 'POST');

    return runTest(route, mockRequest).then(
      () => {
        throw new Error('should have failed');
      },
      () => {
        const blockedCall = mockStatsd.increment.mock.calls.find(
          (c: any) => c[0] === 'passwordless.blocked'
        );
        expect(blockedCall).toBeDefined();
        expect(blockedCall[1]).toEqual(
          expect.objectContaining({
            reason: 'clientNotAllowed',
            clientId: 'test-client-id',
            service: 'test-service',
          })
        );
      }
    );
  });
});

describe('/account/passwordless/resend_code', () => {
  let uid: string,
    mockLog: any,
    mockRequest: any,
    mockDB: any,
    mockCustoms: any,
    route: any,
    routes: any;

  beforeEach(() => {
    uid = uuid.v4({}, Buffer.alloc(16)).toString('hex');
    mockLog = mocks.mockLog();
    mockDB = mocks.mockDB({
      uid,
      email: TEST_EMAIL,
      emailVerified: true,
      verifierSetAt: 0,
    });
    mockCustoms = {
      check: jest.fn(() => Promise.resolve()),
      v2Enabled: () => true,
    };
    mockRequest = mocks.mockRequest({
      log: mockLog,
      payload: {
        email: TEST_EMAIL,
        clientId: 'test-client-id',
        metricsContext: {
          deviceId: 'device123',
          flowId: 'flow123',
          flowBeginTime: Date.now(),
        },
      },
    });

    routes = makeRoutes({
      log: mockLog,
      db: mockDB,
      customs: mockCustoms,
      config: {
        passwordlessOtp: {
          enabled: true,
          ttl: 300,
          digits: 6,
          allowedClientServices: {
            'test-client-id': { allowedServices: ['*'] },
          },
        },
      },
    });
    route = getRoute(routes, '/account/passwordless/resend_code', 'POST');
  });

  afterEach(() => {
    mockOtpManagerCreate.mockClear();
    mockOtpManagerDelete.mockClear();
  });

  it('should delete old code and send new one for new account', () => {
    mockDB.accountRecord = jest.fn(() =>
      Promise.reject(error.unknownAccount())
    );

    return runTest(route, mockRequest, (result) => {
      // Verify rate limiting was called
      expect(mockCustoms.check).toHaveBeenCalledTimes(1);
      expect(mockCustoms.check).toHaveBeenNthCalledWith(
        1,
        expect.anything(),
        TEST_EMAIL,
        'passwordlessSendOtp'
      );

      expect(mockOtpManagerDelete).toHaveBeenCalledTimes(1);
      expect(mockOtpManagerDelete).toHaveBeenNthCalledWith(1, TEST_EMAIL);

      expect(mockOtpManagerCreate).toHaveBeenCalledTimes(1);
      expect(mockOtpManagerCreate).toHaveBeenNthCalledWith(1, TEST_EMAIL);

      expect(result).toEqual({});
    });
  });

  it('should delete old code and send new one for existing account', () => {
    mockDB.accountRecord = jest.fn(() =>
      Promise.resolve({
        uid,
        email: TEST_EMAIL,
        verifierSetAt: 0,
        emails: [{ email: TEST_EMAIL, isPrimary: true }],
      })
    );

    return runTest(route, mockRequest, (result) => {
      // Verify rate limiting was called
      expect(mockCustoms.check).toHaveBeenCalledTimes(1);
      expect(mockCustoms.check).toHaveBeenNthCalledWith(
        1,
        expect.anything(),
        TEST_EMAIL,
        'passwordlessSendOtp'
      );

      expect(mockOtpManagerDelete).toHaveBeenCalledTimes(1);
      expect(mockOtpManagerDelete).toHaveBeenNthCalledWith(1, uid);

      expect(mockOtpManagerCreate).toHaveBeenCalledTimes(1);
      expect(mockOtpManagerCreate).toHaveBeenNthCalledWith(1, uid);

      expect(result).toEqual({});
    });
  });

  it('should reject account with password', () => {
    mockDB.accountRecord = jest.fn(() =>
      Promise.resolve({
        uid,
        email: TEST_EMAIL,
        verifierSetAt: Date.now(),
      })
    );

    return runTest(route, mockRequest).then(
      () => {
        throw new Error('should have thrown');
      },
      (err) => {
        expect(mockDB.accountRecord).toHaveBeenCalledTimes(1);
        expect(mockOtpManagerDelete).toHaveBeenCalledTimes(0);
        expect(mockOtpManagerCreate).toHaveBeenCalledTimes(0);
        expect(err.errno).toBe(206);
      }
    );
  });
});

describe('passwordless routes feature flags', () => {
  it('should always register routes even when feature disabled', () => {
    const routes = makeRoutes({
      config: {
        passwordlessOtp: {
          enabled: false,
          ttl: 300,
          digits: 6,
        },
      },
    });

    // Routes are always registered so existing passwordless users can sign in
    expect(routes.length).toBe(3);
    expect(routes[0].path).toBe('/account/passwordless/send_code');
    expect(routes[1].path).toBe('/account/passwordless/confirm_code');
    expect(routes[2].path).toBe('/account/passwordless/resend_code');
  });

  it('should return routes when feature enabled', () => {
    const routes = makeRoutes({
      config: {
        passwordlessOtp: {
          enabled: true,
          ttl: 300,
          digits: 6,
        },
      },
    });

    expect(routes.length).toBe(3);
    expect(routes[0].path).toBe('/account/passwordless/send_code');
    expect(routes[0].method).toBe('POST');
    expect(routes[1].path).toBe('/account/passwordless/confirm_code');
    expect(routes[1].method).toBe('POST');
    expect(routes[2].path).toBe('/account/passwordless/resend_code');
    expect(routes[2].method).toBe('POST');
  });
});

describe('passwordless service validation', () => {
  let uid: string,
    mockLog: any,
    mockDB: any,
    mockCustoms: any,
    mockRequest: any,
    routes: any,
    route: any;

  beforeEach(() => {
    uid = uuid.v4({}, Buffer.alloc(16)).toString('hex');
    mockLog = mocks.mockLog();
    mockDB = mocks.mockDB({
      uid,
      email: TEST_EMAIL,
      emailVerified: true,
      verifierSetAt: 0,
    });
    mockCustoms = {
      check: jest.fn(() => Promise.resolve()),
      v2Enabled: () => true,
    };
    mockRequest = mocks.mockRequest({
      log: mockLog,
      payload: {
        email: TEST_EMAIL,
        metricsContext: {
          deviceId: 'device123',
          flowId: 'flow123',
          flowBeginTime: Date.now(),
        },
      },
    });
  });

  describe('when allowedClientServices is empty', () => {
    beforeEach(() => {
      routes = makeRoutes({
        log: mockLog,
        db: mockDB,
        customs: mockCustoms,
        config: {
          passwordlessOtp: {
            enabled: true,
            ttl: 300,
            digits: 6,
            allowedClientServices: {},
          },
        },
      });
      route = getRoute(routes, '/account/passwordless/send_code', 'POST');
      mockDB.accountRecord = jest.fn(() =>
        Promise.reject(error.unknownAccount())
      );
    });

    it('should reject requests without clientId', () => {
      return route.handler(mockRequest).then(
        () => {
          throw new Error('should have thrown');
        },
        (err: any) => {
          expect(err.errno).toBe(error.ERRNO.FEATURE_NOT_ENABLED);
          // Rate limiting runs before allowlist check (which happens after account lookup)
          expect(mockCustoms.check).toHaveBeenCalledTimes(1);
          expect(mockOtpManagerCreate).toHaveBeenCalledTimes(0);
        }
      );
    });

    it('should reject requests with any clientId', () => {
      mockRequest.payload.clientId = 'ea3ca969f8c6bb0d';
      return route.handler(mockRequest).then(
        () => {
          throw new Error('should have thrown');
        },
        (err: any) => {
          expect(err.errno).toBe(error.ERRNO.FEATURE_NOT_ENABLED);
          expect(mockCustoms.check).toHaveBeenCalledTimes(1);
          expect(mockOtpManagerCreate).toHaveBeenCalledTimes(0);
        }
      );
    });
  });

  describe('when allowedClientServices is configured', () => {
    beforeEach(() => {
      routes = makeRoutes({
        log: mockLog,
        db: mockDB,
        customs: mockCustoms,
        config: {
          passwordlessOtp: {
            enabled: true,
            ttl: 300,
            digits: 6,
            allowedClientServices: {
              ea3ca969f8c6bb0d: { allowedServices: ['*'] },
              dcdb5ae7add825d2: { allowedServices: ['*'] },
            },
          },
        },
      });
      route = getRoute(routes, '/account/passwordless/send_code', 'POST');
      mockDB.accountRecord = jest.fn(() =>
        Promise.reject(error.unknownAccount())
      );
    });

    it('should reject requests without clientId', () => {
      return route.handler(mockRequest).then(
        () => {
          throw new Error('should have thrown');
        },
        (err: any) => {
          expect(err.errno).toBe(error.ERRNO.FEATURE_NOT_ENABLED);
          expect(mockCustoms.check).toHaveBeenCalledTimes(1);
          expect(mockOtpManagerCreate).toHaveBeenCalledTimes(0);
        }
      );
    });

    it('should reject requests with disallowed clientId', () => {
      mockRequest.payload.clientId = 'not-allowed-client';
      return route.handler(mockRequest).then(
        () => {
          throw new Error('should have thrown');
        },
        (err: any) => {
          expect(err.errno).toBe(error.ERRNO.FEATURE_NOT_ENABLED);
          expect(mockCustoms.check).toHaveBeenCalledTimes(1);
          expect(mockOtpManagerCreate).toHaveBeenCalledTimes(0);
        }
      );
    });

    it('should allow requests with allowed clientId (ea3ca969f8c6bb0d)', () => {
      mockRequest.payload.clientId = 'ea3ca969f8c6bb0d';
      return runTest(route, mockRequest, () => {
        expect(mockCustoms.check).toHaveBeenCalledTimes(1);
        expect(mockOtpManagerCreate).toHaveBeenCalledTimes(1);
      });
    });

    it('should allow requests with allowed clientId (dcdb5ae7add825d2)', () => {
      mockRequest.payload.clientId = 'dcdb5ae7add825d2';
      return runTest(route, mockRequest, () => {
        expect(mockCustoms.check).toHaveBeenCalledTimes(1);
        expect(mockOtpManagerCreate).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('confirm_code clientId validation', () => {
    beforeEach(() => {
      routes = makeRoutes({
        log: mockLog,
        db: mockDB,
        customs: mockCustoms,
        config: {
          passwordlessOtp: {
            enabled: true,
            ttl: 300,
            digits: 6,
            allowedClientServices: {
              ea3ca969f8c6bb0d: { allowedServices: ['*'] },
            },
          },
        },
      });
      route = getRoute(routes, '/account/passwordless/confirm_code', 'POST');
      mockRequest.payload.code = '123456';
    });

    it('should reject confirm_code without clientId for new account', () => {
      // Use new account (not existing passwordless) so allowlist is enforced
      mockDB.accountRecord = jest.fn(() =>
        Promise.reject(error.unknownAccount())
      );
      return route.handler(mockRequest).then(
        () => {
          throw new Error('should have thrown');
        },
        (err: any) => {
          expect(err.errno).toBe(error.ERRNO.FEATURE_NOT_ENABLED);
          // Rate limiting runs before allowlist check (2 checks: verify + daily)
          expect(mockCustoms.check).toHaveBeenCalledTimes(2);
        }
      );
    });

    it('should reject confirm_code with disallowed clientId for new account', () => {
      mockDB.accountRecord = jest.fn(() =>
        Promise.reject(error.unknownAccount())
      );
      mockRequest.payload.clientId = 'not-allowed-client';
      return route.handler(mockRequest).then(
        () => {
          throw new Error('should have thrown');
        },
        (err: any) => {
          expect(err.errno).toBe(error.ERRNO.FEATURE_NOT_ENABLED);
          expect(mockCustoms.check).toHaveBeenCalledTimes(2);
        }
      );
    });

    it('should allow confirm_code with allowed clientId', () => {
      mockDB.accountRecord = jest.fn(() => ({
        uid,
        email: TEST_EMAIL,
        emailVerified: true,
        verifierSetAt: 0,
      }));
      mockRequest.payload.clientId = 'ea3ca969f8c6bb0d';
      return runTest(route, mockRequest, (result: any) => {
        expect(mockCustoms.check).toHaveBeenCalledTimes(2);
        expect(typeof result.uid).toBe('string');
        expect(typeof result.sessionToken).toBe('string');
      });
    });

    it('should bypass allowlist for existing passwordless account on confirm_code', () => {
      // Existing passwordless accounts bypass the allowlist
      mockDB.accountRecord = jest.fn(() => ({
        uid,
        email: TEST_EMAIL,
        emailVerified: true,
        verifierSetAt: 0,
      }));
      mockDB.createSessionToken = jest.fn(() =>
        Promise.resolve({
          data: 'sessiontoken123',
          emailVerified: true,
          tokenVerified: true,
          lastAuthAt: () => 1234567890,
        })
      );
      // No clientId — would normally be rejected
      return runTest(route, mockRequest, (result: any) => {
        expect(typeof result.uid).toBe('string');
        expect(typeof result.sessionToken).toBe('string');
      });
    });
  });

  describe('resend_code clientId validation', () => {
    beforeEach(() => {
      routes = makeRoutes({
        log: mockLog,
        db: mockDB,
        customs: mockCustoms,
        config: {
          passwordlessOtp: {
            enabled: true,
            ttl: 300,
            digits: 6,
            allowedClientServices: {
              ea3ca969f8c6bb0d: { allowedServices: ['*'] },
            },
          },
        },
      });
      route = getRoute(routes, '/account/passwordless/resend_code', 'POST');
      mockDB.accountRecord = jest.fn(() =>
        Promise.reject(error.unknownAccount())
      );
    });

    it('should reject resend_code without clientId', () => {
      return route.handler(mockRequest).then(
        () => {
          throw new Error('should have thrown');
        },
        (err: any) => {
          expect(err.errno).toBe(error.ERRNO.FEATURE_NOT_ENABLED);
          // Rate limiting runs before allowlist check
          expect(mockCustoms.check).toHaveBeenCalledTimes(1);
        }
      );
    });

    it('should reject resend_code with disallowed clientId', () => {
      mockRequest.payload.clientId = 'not-allowed-client';
      return route.handler(mockRequest).then(
        () => {
          throw new Error('should have thrown');
        },
        (err: any) => {
          expect(err.errno).toBe(error.ERRNO.FEATURE_NOT_ENABLED);
          expect(mockCustoms.check).toHaveBeenCalledTimes(1);
        }
      );
    });

    it('should allow resend_code with allowed clientId', () => {
      mockRequest.payload.clientId = 'ea3ca969f8c6bb0d';
      return runTest(route, mockRequest, () => {
        expect(mockCustoms.check).toHaveBeenCalledTimes(1);
        expect(mockOtpManagerDelete).toHaveBeenCalledTimes(1);
        expect(mockOtpManagerCreate).toHaveBeenCalledTimes(1);
      });
    });
  });
});

describe('existing passwordless accounts bypass flag and allowlist', () => {
  let uid: string,
    mockLog: any,
    mockDB: any,
    mockCustoms: any,
    mockRequest: any;

  beforeEach(() => {
    uid = uuid.v4({}, Buffer.alloc(16)).toString('hex');
    mockLog = mocks.mockLog();
    mockDB = mocks.mockDB({
      uid,
      email: TEST_EMAIL,
      emailVerified: true,
      verifierSetAt: 0,
    });
    mockCustoms = {
      check: jest.fn(() => Promise.resolve()),
      v2Enabled: () => true,
    };
    mockRequest = mocks.mockRequest({
      log: mockLog,
      payload: {
        email: TEST_EMAIL,
        metricsContext: {
          deviceId: 'device123',
          flowId: 'flow123',
          flowBeginTime: Date.now(),
        },
      },
    });
  });

  afterEach(() => {
    mockOtpManagerCreate.mockClear();
    mockOtpManagerIsValid.mockClear();
    mockOtpManagerDelete.mockClear();
  });

  describe('send_code', () => {
    it('should succeed for existing passwordless account with empty allowlist', () => {
      const routes = makeRoutes({
        log: mockLog,
        db: mockDB,
        customs: mockCustoms,
        config: {
          passwordlessOtp: {
            enabled: true,
            ttl: 300,
            digits: 6,
            allowedClientServices: {},
          },
        },
      });
      const route = getRoute(routes, '/account/passwordless/send_code', 'POST');
      mockDB.accountRecord = jest.fn(() =>
        Promise.resolve({
          uid,
          email: TEST_EMAIL,
          verifierSetAt: 0,
          emails: [{ email: TEST_EMAIL, isPrimary: true }],
        })
      );

      return runTest(route, mockRequest, (result) => {
        expect(result).toEqual({});
        expect(mockOtpManagerCreate).toHaveBeenCalledTimes(1);
      });
    });

    it('should succeed for existing passwordless account with feature flag OFF', () => {
      const routes = makeRoutes({
        log: mockLog,
        db: mockDB,
        customs: mockCustoms,
        config: {
          passwordlessOtp: {
            enabled: false,
            ttl: 300,
            digits: 6,
            allowedClientServices: {},
          },
        },
      });
      const route = getRoute(routes, '/account/passwordless/send_code', 'POST');
      mockDB.accountRecord = jest.fn(() =>
        Promise.resolve({
          uid,
          email: TEST_EMAIL,
          verifierSetAt: 0,
          emails: [{ email: TEST_EMAIL, isPrimary: true }],
        })
      );

      return runTest(route, mockRequest, (result) => {
        expect(result).toEqual({});
        expect(mockOtpManagerCreate).toHaveBeenCalledTimes(1);
      });
    });

    it('should still reject new account with empty allowlist even when flag ON', () => {
      const routes = makeRoutes({
        log: mockLog,
        db: mockDB,
        customs: mockCustoms,
        config: {
          passwordlessOtp: {
            enabled: true,
            ttl: 300,
            digits: 6,
            allowedClientServices: {},
          },
        },
      });
      const route = getRoute(routes, '/account/passwordless/send_code', 'POST');
      mockDB.accountRecord = jest.fn(() =>
        Promise.reject(error.unknownAccount())
      );

      return route.handler(mockRequest).then(
        () => {
          throw new Error('should have thrown');
        },
        (err: any) => {
          expect(err.errno).toBe(error.ERRNO.FEATURE_NOT_ENABLED);
          expect(mockOtpManagerCreate).toHaveBeenCalledTimes(0);
        }
      );
    });
  });

  describe('confirm_code', () => {
    it('should succeed for existing passwordless account with empty allowlist', () => {
      const routes = makeRoutes({
        log: mockLog,
        db: mockDB,
        customs: mockCustoms,
        config: {
          passwordlessOtp: {
            enabled: true,
            ttl: 300,
            digits: 6,
            allowedClientServices: {},
          },
        },
      });
      const route = getRoute(
        routes,
        '/account/passwordless/confirm_code',
        'POST'
      );
      mockRequest.payload.code = '123456';
      mockDB.accountRecord = jest.fn(() =>
        Promise.resolve({
          uid,
          email: TEST_EMAIL,
          emailCode: hexString(16),
          verifierSetAt: 0,
        })
      );
      mockDB.createSessionToken = jest.fn(() =>
        Promise.resolve({
          data: 'sessiontoken123',
          emailVerified: true,
          tokenVerified: true,
          lastAuthAt: () => 1234567890,
        })
      );

      return runTest(route, mockRequest, (result: any) => {
        expect(result.uid).toBe(uid);
        expect(typeof result.sessionToken).toBe('string');
        expect(result.verified).toBe(true);
      });
    });
  });

  describe('resend_code', () => {
    it('should succeed for existing passwordless account with empty allowlist', () => {
      const routes = makeRoutes({
        log: mockLog,
        db: mockDB,
        customs: mockCustoms,
        config: {
          passwordlessOtp: {
            enabled: true,
            ttl: 300,
            digits: 6,
            allowedClientServices: {},
          },
        },
      });
      const route = getRoute(
        routes,
        '/account/passwordless/resend_code',
        'POST'
      );
      mockDB.accountRecord = jest.fn(() =>
        Promise.resolve({
          uid,
          email: TEST_EMAIL,
          verifierSetAt: 0,
          emails: [{ email: TEST_EMAIL, isPrimary: true }],
        })
      );

      return runTest(route, mockRequest, (result) => {
        expect(result).toEqual({});
        expect(mockOtpManagerDelete).toHaveBeenCalledTimes(1);
        expect(mockOtpManagerCreate).toHaveBeenCalledTimes(1);
      });
    });
  });
});
