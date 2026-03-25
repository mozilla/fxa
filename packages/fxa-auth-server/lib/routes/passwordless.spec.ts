/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import sinon from 'sinon';
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

let mockOtpManagerCreate: sinon.SinonStub;
let mockOtpManagerIsValid: sinon.SinonStub;
let mockOtpManagerDelete: sinon.SinonStub;
let mockOtpManager: {
  create: sinon.SinonStub;
  isValid: sinon.SinonStub;
  delete: sinon.SinonStub;
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
let hasTotpTokenStub: sinon.SinonStub;

jest.mock('./utils/otp', () => ({
  __esModule: true,
  default: () => ({
    hasTotpToken: (...args: any[]) => hasTotpTokenStub(...args),
  }),
}));

// `./utils/security-event` named export `recordSecurityEvent`.
let recordSecurityEventStub: sinon.SinonStub;

jest.mock('./utils/security-event', () => ({
  recordSecurityEvent: (...args: any[]) => recordSecurityEventStub(...args),
}));

// `./utils/account` named export `getOptionalCmsEmailConfig`.
// We default to a stub that returns `{}`. Individual tests that care about
// CMS behaviour will override via `jest.doMock` + `jest.resetModules`, or
// we simply reassign the stub per-test.
let getOptionalCmsEmailConfigStub: sinon.SinonStub;

jest.mock('./utils/account', () => ({
  getOptionalCmsEmailConfig: (...args: any[]) =>
    getOptionalCmsEmailConfigStub(...args),
}));

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
  mockOtpManagerCreate = sinon.stub().resolves('123456');
  mockOtpManagerIsValid = sinon.stub().resolves(true);
  mockOtpManagerDelete = sinon.stub().resolves();

  mockOtpManager = {
    create: mockOtpManagerCreate,
    isValid: mockOtpManagerIsValid,
    delete: mockOtpManagerDelete,
  };

  // Wire up option-driven stubs
  hasTotpTokenStub = options.hasTotpToken || sinon.stub().resolves(false);
  recordSecurityEventStub =
    options.recordSecurityEvent || sinon.stub().resolves();
  getOptionalCmsEmailConfigStub =
    options.getOptionalCmsEmailConfig || sinon.stub().resolves({});

  mocks.mockFxaMailer();

  // Now require the module under test. Because all mocks above are wired
  // through jest.mock() at the module level, the fresh `require` picks them
  // up automatically.
  const { passwordlessRoutes } = require('./passwordless');
  return passwordlessRoutes(log, db, config, customs, glean, statsd, redis);
}

function runTest(
  route: any,
  request: any,
  assertions?: (result: any) => void
) {
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
      check: sinon.spy(() => Promise.resolve()),
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
    mockOtpManagerCreate.resetHistory();
    mockOtpManagerIsValid.resetHistory();
    mockOtpManagerDelete.resetHistory();
  });

  it('should send OTP for new account', () => {
    mockDB.accountRecord = sinon.spy(() =>
      Promise.reject(error.unknownAccount())
    );

    return runTest(route, mockRequest, (result) => {
      expect(mockCustoms.check.callCount).toBe(1);
      expect(mockCustoms.check.args[0][1]).toBe(TEST_EMAIL);
      expect(mockCustoms.check.args[0][2]).toBe('passwordlessSendOtp');

      expect(mockOtpManagerCreate.callCount).toBe(1);
      expect(mockOtpManagerCreate.args[0][0]).toBe(TEST_EMAIL);

      expect(result).toEqual({});
    });
  });

  it('should send OTP for existing passwordless account', () => {
    mockDB.accountRecord = sinon.spy(() =>
      Promise.resolve({
        uid,
        email: TEST_EMAIL,
        verifierSetAt: 0,
        emails: [{ email: TEST_EMAIL, isPrimary: true }],
      })
    );

    return runTest(route, mockRequest, (result) => {
      expect(mockDB.accountRecord.callCount).toBe(1);
      expect(mockOtpManagerCreate.callCount).toBe(1);
      expect(mockOtpManagerCreate.args[0][0]).toBe(uid);
      expect(result).toEqual({});
    });
  });

  it('should reject account with password', () => {
    mockDB.accountRecord = sinon.spy(() =>
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
        expect(mockDB.accountRecord.callCount).toBe(1);
        expect(mockOtpManagerCreate.callCount).toBe(0);
        expect(err.errno).toBe(206);
      }
    );
  });

  it('should apply rate limiting', () => {
    mockCustoms.check = sinon.spy(() =>
      Promise.reject(error.tooManyRequests())
    );

    return runTest(route, mockRequest).then(
      () => {
        throw new Error('should have thrown');
      },
      (err) => {
        expect(mockCustoms.check.callCount).toBe(1);
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
      check: sinon.spy(() => Promise.resolve()),
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
    mockOtpManagerCreate.resetHistory();
    mockOtpManagerIsValid.resetHistory();
    mockOtpManagerDelete.resetHistory();
  });

  it('should create new account and session for valid code', () => {
    mockDB.accountRecord = sinon.spy(() =>
      Promise.reject(error.unknownAccount())
    );
    mockDB.createAccount = sinon.spy(() =>
      Promise.resolve({
        uid,
        email: TEST_EMAIL,
        emailCode: hexString(16),
        verifierSetAt: 0,
      })
    );
    mockDB.createSessionToken = sinon.spy(() =>
      Promise.resolve({
        data: 'sessiontoken123',
        emailVerified: true,
        tokenVerified: true,
        lastAuthAt: () => 1234567890,
      })
    );

    return runTest(route, mockRequest, (result) => {
      // mustVerify should always be true (defense-in-depth)
      const sessionOpts = mockDB.createSessionToken.args[0][0];
      expect(sessionOpts.mustVerify).toBe(true);
      expect(sessionOpts.tokenVerificationId).toBe(null);

      expect(mockCustoms.check.callCount).toBe(2);
      expect(mockCustoms.check.args[0][2]).toBe('passwordlessVerifyOtp');
      expect(mockCustoms.check.args[1][2]).toBe(
        'passwordlessVerifyOtpPerDay'
      );

      expect(mockOtpManagerIsValid.callCount).toBe(1);
      expect(mockOtpManagerIsValid.args[0][0]).toBe(TEST_EMAIL);
      expect(mockOtpManagerIsValid.args[0][1]).toBe('123456');

      expect(mockOtpManagerDelete.callCount).toBe(1);
      expect(mockOtpManagerDelete.args[0][0]).toBe(TEST_EMAIL);

      expect(mockDB.createAccount.callCount).toBe(1);
      const accountArgs = mockDB.createAccount.args[0][0];
      expect(accountArgs.email).toBe(TEST_EMAIL);
      expect(accountArgs.emailVerified).toBe(true);
      expect(accountArgs.verifierSetAt).toBe(0);

      expect(mockDB.createSessionToken.callCount).toBe(1);

      expect(result.uid).toBe(uid);
      expect(result.sessionToken).toBe('sessiontoken123');
      expect(result.verified).toBe(true);
      expect(result.authAt).toBe(1234567890);
      expect(result.isNewAccount).toBe(true);
    });
  });

  it('should create session for existing account with valid code', () => {
    mockDB.accountRecord = sinon.spy(() =>
      Promise.resolve({
        uid,
        email: TEST_EMAIL,
        emailCode: hexString(16),
        verifierSetAt: 0,
      })
    );
    mockDB.createSessionToken = sinon.spy(() =>
      Promise.resolve({
        data: 'sessiontoken123',
        emailVerified: true,
        tokenVerified: true,
        lastAuthAt: () => 1234567890,
      })
    );

    return runTest(route, mockRequest, (result) => {
      expect(mockOtpManagerIsValid.callCount).toBe(1);
      expect(mockOtpManagerIsValid.args[0][0]).toBe(uid);

      expect(mockDB.createAccount.callCount).toBe(0);
      expect(mockDB.createSessionToken.callCount).toBe(1);

      // mustVerify should always be true (defense-in-depth)
      const sessionOpts = mockDB.createSessionToken.args[0][0];
      expect(sessionOpts.mustVerify).toBe(true);
      expect(sessionOpts.tokenVerificationId).toBe(null);

      expect(result.uid).toBe(uid);
      expect(result.isNewAccount).toBe(false);
    });
  });

  it('should emit glean registration.complete with reason otp for new account', () => {
    const mockGlean = mocks.mockGlean();
    mockDB.accountRecord = sinon.spy(() =>
      Promise.reject(error.unknownAccount())
    );
    mockDB.createAccount = sinon.spy(() =>
      Promise.resolve({
        uid,
        email: TEST_EMAIL,
        emailCode: hexString(16),
        verifierSetAt: 0,
      })
    );
    mockDB.createSessionToken = sinon.spy(() =>
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
      sinon.assert.calledOnce(mockGlean.registration.complete);
      sinon.assert.calledWithMatch(
        mockGlean.registration.complete,
        mockRequest,
        {
          uid,
          reason: 'otp',
        }
      );
    });
  });

  it('should emit glean login.complete with reason otp for existing account', () => {
    const mockGlean = mocks.mockGlean();
    mockDB.accountRecord = sinon.spy(() =>
      Promise.resolve({
        uid,
        email: TEST_EMAIL,
        emailCode: hexString(16),
        verifierSetAt: 0,
      })
    );
    mockDB.createSessionToken = sinon.spy(() =>
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
      sinon.assert.calledOnce(mockGlean.login.complete);
      sinon.assert.calledWithMatch(mockGlean.login.complete, mockRequest, {
        uid,
        reason: 'otp',
      });
    });
  });

  it('should reject invalid OTP code', () => {
    mockDB.accountRecord = sinon.spy(() =>
      Promise.resolve({
        uid,
        email: TEST_EMAIL,
        verifierSetAt: 0,
      })
    );
    mockOtpManagerIsValid.resolves(false);

    return runTest(route, mockRequest).then(
      () => {
        throw new Error('should have thrown');
      },
      (err) => {
        expect(mockOtpManagerIsValid.callCount).toBe(1);
        expect(mockOtpManagerDelete.callCount).toBe(0);
        expect(err.errno).toBe(105);
      }
    );
  });

  it('should return unverified session with verificationMethod for TOTP accounts', () => {
    mockDB.accountRecord = sinon.spy(() =>
      Promise.resolve({
        uid,
        email: TEST_EMAIL,
        verifierSetAt: 0,
      })
    );
    mockDB.createSessionToken = sinon.spy(() =>
      Promise.resolve({
        data: 'sessiontoken123',
        emailVerified: true,
        tokenVerified: false,
        lastAuthAt: () => Date.now(),
      })
    );

    const hasTotpToken = sinon.stub().resolves(true);
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
      expect(hasTotpToken.callCount).toBe(1);
      expect(mockOtpManagerIsValid.callCount).toBe(1);
      expect(mockOtpManagerDelete.callCount).toBe(1);
      expect(result.uid).toBe(uid);
      expect(result.sessionToken).toBe('sessiontoken123');
      expect(result.verified).toBe(false);
      expect(result.authAt).toBeTruthy();
      expect(result.isNewAccount).toBe(false);
      expect(result.verificationMethod).toBe('totp-2fa');
      expect(result.verificationReason).toBe('login');
      // Session should be created with mustVerify=true
      const sessionTokenArgs = mockDB.createSessionToken.args[0][0];
      expect(sessionTokenArgs.mustVerify).toBe(true);
      expect(sessionTokenArgs.tokenVerificationId).toBeTruthy();
    });
  });

  it('should reject account with password set', () => {
    mockDB.accountRecord = sinon.spy(() =>
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
        expect(mockDB.accountRecord.callCount).toBe(1);
        expect(err.errno).toBe(206);
      }
    );
  });

  it('should include user agent info in session token', () => {
    mockDB.accountRecord = sinon.spy(() =>
      Promise.resolve({
        uid,
        email: TEST_EMAIL,
        emailCode: hexString(16),
        verifierSetAt: 0,
      })
    );
    mockDB.createSessionToken = sinon.spy(() =>
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
      expect(mockDB.createSessionToken.callCount).toBe(1);
      const sessionOpts = mockDB.createSessionToken.args[0][0];
      expect(sessionOpts.uaBrowser).toBe('Firefox');
      expect(sessionOpts.uaBrowserVersion).toBe('100');
      expect(sessionOpts.uaOS).toBe('Linux');
      expect(sessionOpts.uaOSVersion).toBe('5.15');
      expect(sessionOpts.uaDeviceType).toBe('desktop');
      expect(sessionOpts.uaFormFactor).toBe('desktop');
      expect(sessionOpts.mustVerify).toBe(true);
      expect(sessionOpts.tokenVerificationId).toBe(null);
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
      check: sinon.spy(() => Promise.resolve()),
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
    mockOtpManagerCreate.resetHistory();
    mockOtpManagerIsValid.resetHistory();
    mockOtpManagerDelete.resetHistory();
  });

  describe('send_code with CMS configuration', () => {
    beforeEach(() => {
      mockDB.accountRecord = sinon.spy(() =>
        Promise.reject(error.unknownAccount())
      );
    });

    it('should call getOptionalCmsEmailConfig for new account', () => {
      const mockGetOptionalCmsEmailConfig = sinon.stub().resolves({});

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
        expect(mockOtpManagerCreate.callCount).toBe(1);
        expect(mockOtpManagerCreate.args[0][0]).toBe(TEST_EMAIL);

        // Verify CMS config was fetched
        expect(mockGetOptionalCmsEmailConfig.callCount).toBe(1);

        // Check first argument (options object)
        const options = mockGetOptionalCmsEmailConfig.args[0][0];
        expect(options.code).toBeDefined();
        expect(options.deviceId).toBeDefined();
        expect(options.flowId).toBeDefined();
        expect(options.codeExpiryMinutes).toBeDefined();
        expect(options.codeExpiryMinutes).toBe(5); // 300 seconds / 60

        // Check second argument (config object)
        const config = mockGetOptionalCmsEmailConfig.args[0][1];
        expect(config.emailTemplate).toBe('PasswordlessSignupOtpEmail');
        expect(config.request).toBeDefined();
        expect(config.log).toBeDefined();
      });
    });

    it('should call getOptionalCmsEmailConfig for existing account', () => {
      mockDB.accountRecord = sinon.spy(() =>
        Promise.resolve({
          uid,
          email: TEST_EMAIL,
          verifierSetAt: 0,
          emails: [{ email: TEST_EMAIL, isPrimary: true }],
        })
      );

      const mockGetOptionalCmsEmailConfig = sinon.stub().resolves({});

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
        expect(mockOtpManagerCreate.callCount).toBe(1);
        expect(mockOtpManagerCreate.args[0][0]).toBe(uid);

        // Verify CMS config was fetched with correct template
        expect(mockGetOptionalCmsEmailConfig.callCount).toBe(1);

        // Check first argument (options object)
        const options = mockGetOptionalCmsEmailConfig.args[0][0];
        expect(options.code).toBeDefined();
        expect(options.deviceId).toBeDefined();
        expect(options.flowId).toBeDefined();
        expect(options.time).toBeDefined();
        expect(options.date).toBeDefined();

        // Check second argument (config object)
        const config = mockGetOptionalCmsEmailConfig.args[0][1];
        expect(config.emailTemplate).toBe('PasswordlessSigninOtpEmail');
        expect(config.request).toBeDefined();
        expect(config.log).toBeDefined();
      });
    });

    it('should send email with CMS customization when available', () => {
      mockDB.accountRecord = sinon.spy(() =>
        Promise.reject(error.unknownAccount())
      );

      const mockGetOptionalCmsEmailConfig = sinon.stub().resolves({
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
        expect(mockGetOptionalCmsEmailConfig.callCount).toBe(1);

        // Verify the config includes CMS customization
        const cmsConfig = mockGetOptionalCmsEmailConfig.args[0][0];
        expect(cmsConfig.code).toBeDefined();
        expect(cmsConfig.codeExpiryMinutes).toBe(5);
      });
    });

    it('should handle CMS manager absence gracefully', () => {
      mockDB.accountRecord = sinon.spy(() =>
        Promise.reject(error.unknownAccount())
      );

      const mockGetOptionalCmsEmailConfig = sinon.stub().resolves({});

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
        expect(mockOtpManagerCreate.callCount).toBe(1);
        expect(mockGetOptionalCmsEmailConfig.callCount).toBe(1);

        // Verify cmsManager parameter can be undefined
        const config = mockGetOptionalCmsEmailConfig.args[0][1];
        // cmsManager is optional and may be undefined
        expect(config).toHaveProperty('log');
        expect(config).toHaveProperty('request');
      });
    });

    it('should pass correct email template for resend_code', () => {
      mockDB.accountRecord = sinon.spy(() =>
        Promise.resolve({
          uid,
          email: TEST_EMAIL,
          verifierSetAt: 0,
          emails: [{ email: TEST_EMAIL, isPrimary: true }],
        })
      );

      const mockGetOptionalCmsEmailConfig = sinon.stub().resolves({});

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
        expect(mockOtpManagerDelete.callCount).toBe(1);
        expect(mockOtpManagerCreate.callCount).toBe(1);

        // Verify CMS config was fetched
        expect(mockGetOptionalCmsEmailConfig.callCount).toBe(1);

        // Should use signin template for existing account
        const config = mockGetOptionalCmsEmailConfig.args[0][1];
        expect(config.emailTemplate).toBe('PasswordlessSigninOtpEmail');
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
    mockRecordSecurityEvent: sinon.SinonStub,
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
      check: sinon.spy(() => Promise.resolve()),
      v2Enabled: () => true,
    };
    mockRecordSecurityEvent = sinon.stub().resolves();
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
    mockOtpManagerCreate.resetHistory();
    mockOtpManagerIsValid.resetHistory();
    mockOtpManagerDelete.resetHistory();
  });

  it('should record security event when OTP is sent for new account', () => {
    mockDB.accountRecord = sinon.spy(() =>
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
      expect(mockRecordSecurityEvent.callCount).toBe(1);
      expect(mockRecordSecurityEvent.args[0][0]).toBe(
        'account.passwordless_login_otp_sent'
      );
    });
  });

  it('should record security event when OTP is sent for existing account', () => {
    mockDB.accountRecord = sinon.spy(() =>
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
      expect(mockRecordSecurityEvent.callCount).toBe(1);
      expect(mockRecordSecurityEvent.args[0][0]).toBe(
        'account.passwordless_login_otp_sent'
      );
      expect(mockRecordSecurityEvent.args[0][1].account).toBeDefined();
      expect(mockRecordSecurityEvent.args[0][1].account.uid).toBe(uid);
    });
  });

  it('should record security event when valid OTP is confirmed for new account', () => {
    mockDB.accountRecord = sinon.spy(() =>
      Promise.reject(error.unknownAccount())
    );
    mockDB.createAccount = sinon.spy(() =>
      Promise.resolve({
        uid,
        email: TEST_EMAIL,
        emailCode: hexString(16),
        verifierSetAt: 0,
      })
    );
    mockDB.createSessionToken = sinon.spy(() =>
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
      expect(mockRecordSecurityEvent.callCount).toBe(2);
      expect(mockRecordSecurityEvent.args[0][0]).toBe(
        'account.passwordless_registration_complete'
      );
      expect(mockRecordSecurityEvent.args[1][0]).toBe(
        'account.passwordless_login_otp_verified'
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
      check: sinon.spy(() => Promise.resolve()),
      v2Enabled: () => true,
    };
    mockStatsd = mocks.mockStatsd();
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
    mockOtpManagerCreate.resetHistory();
    mockOtpManagerIsValid.resetHistory();
    mockOtpManagerDelete.resetHistory();
  });

  it('should increment statsd counter when OTP is sent', () => {
    mockDB.accountRecord = sinon.spy(() =>
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
      expect(mockStatsd.increment.callCount).toBe(1);
      expect(mockStatsd.increment.args[0][0]).toBe(
        'passwordless.sendCode.success'
      );
    });
  });

  it('should increment statsd counter for successful registration', () => {
    mockDB.accountRecord = sinon.spy(() =>
      Promise.reject(error.unknownAccount())
    );
    mockDB.createAccount = sinon.spy(() =>
      Promise.resolve({
        uid,
        email: TEST_EMAIL,
        emailCode: hexString(16),
        verifierSetAt: 0,
      })
    );
    mockDB.createSessionToken = sinon.spy(() =>
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
      expect(mockStatsd.increment.callCount).toBeGreaterThanOrEqual(2);
      const incrementCalls = mockStatsd.increment
        .getCalls()
        .map((c: any) => c.args[0]);
      expect(incrementCalls).toContain('passwordless.registration.success');
      expect(incrementCalls).toContain('passwordless.confirmCode.success');
    });
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
      check: sinon.spy(() => Promise.resolve()),
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
    mockOtpManagerCreate.resetHistory();
    mockOtpManagerDelete.resetHistory();
  });

  it('should delete old code and send new one for new account', () => {
    mockDB.accountRecord = sinon.spy(() =>
      Promise.reject(error.unknownAccount())
    );

    return runTest(route, mockRequest, (result) => {
      // Verify rate limiting was called
      expect(mockCustoms.check.callCount).toBe(1);
      expect(mockCustoms.check.args[0][1]).toBe(TEST_EMAIL);
      expect(mockCustoms.check.args[0][2]).toBe('passwordlessSendOtp');

      expect(mockOtpManagerDelete.callCount).toBe(1);
      expect(mockOtpManagerDelete.args[0][0]).toBe(TEST_EMAIL);

      expect(mockOtpManagerCreate.callCount).toBe(1);
      expect(mockOtpManagerCreate.args[0][0]).toBe(TEST_EMAIL);

      expect(result).toEqual({});
    });
  });

  it('should delete old code and send new one for existing account', () => {
    mockDB.accountRecord = sinon.spy(() =>
      Promise.resolve({
        uid,
        email: TEST_EMAIL,
        verifierSetAt: 0,
        emails: [{ email: TEST_EMAIL, isPrimary: true }],
      })
    );

    return runTest(route, mockRequest, (result) => {
      // Verify rate limiting was called
      expect(mockCustoms.check.callCount).toBe(1);
      expect(mockCustoms.check.args[0][1]).toBe(TEST_EMAIL);
      expect(mockCustoms.check.args[0][2]).toBe('passwordlessSendOtp');

      expect(mockOtpManagerDelete.callCount).toBe(1);
      expect(mockOtpManagerDelete.args[0][0]).toBe(uid);

      expect(mockOtpManagerCreate.callCount).toBe(1);
      expect(mockOtpManagerCreate.args[0][0]).toBe(uid);

      expect(result).toEqual({});
    });
  });

  it('should reject account with password', () => {
    mockDB.accountRecord = sinon.spy(() =>
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
        expect(mockDB.accountRecord.callCount).toBe(1);
        expect(mockOtpManagerDelete.callCount).toBe(0);
        expect(mockOtpManagerCreate.callCount).toBe(0);
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
      check: sinon.spy(() => Promise.resolve()),
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
      mockDB.accountRecord = sinon.spy(() =>
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
          expect(mockCustoms.check.callCount).toBe(1);
          expect(mockOtpManagerCreate.callCount).toBe(0);
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
          expect(mockCustoms.check.callCount).toBe(1);
          expect(mockOtpManagerCreate.callCount).toBe(0);
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
      mockDB.accountRecord = sinon.spy(() =>
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
          expect(mockCustoms.check.callCount).toBe(1);
          expect(mockOtpManagerCreate.callCount).toBe(0);
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
          expect(mockCustoms.check.callCount).toBe(1);
          expect(mockOtpManagerCreate.callCount).toBe(0);
        }
      );
    });

    it('should allow requests with allowed clientId (ea3ca969f8c6bb0d)', () => {
      mockRequest.payload.clientId = 'ea3ca969f8c6bb0d';
      return runTest(route, mockRequest, () => {
        expect(mockCustoms.check.callCount).toBe(1);
        expect(mockOtpManagerCreate.callCount).toBe(1);
      });
    });

    it('should allow requests with allowed clientId (dcdb5ae7add825d2)', () => {
      mockRequest.payload.clientId = 'dcdb5ae7add825d2';
      return runTest(route, mockRequest, () => {
        expect(mockCustoms.check.callCount).toBe(1);
        expect(mockOtpManagerCreate.callCount).toBe(1);
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
      mockDB.accountRecord = sinon.spy(() =>
        Promise.reject(error.unknownAccount())
      );
      return route.handler(mockRequest).then(
        () => {
          throw new Error('should have thrown');
        },
        (err: any) => {
          expect(err.errno).toBe(error.ERRNO.FEATURE_NOT_ENABLED);
          // Rate limiting runs before allowlist check (2 checks: verify + daily)
          expect(mockCustoms.check.callCount).toBe(2);
        }
      );
    });

    it('should reject confirm_code with disallowed clientId for new account', () => {
      mockDB.accountRecord = sinon.spy(() =>
        Promise.reject(error.unknownAccount())
      );
      mockRequest.payload.clientId = 'not-allowed-client';
      return route.handler(mockRequest).then(
        () => {
          throw new Error('should have thrown');
        },
        (err: any) => {
          expect(err.errno).toBe(error.ERRNO.FEATURE_NOT_ENABLED);
          expect(mockCustoms.check.callCount).toBe(2);
        }
      );
    });

    it('should allow confirm_code with allowed clientId', () => {
      mockDB.accountRecord = sinon.spy(() => ({
        uid,
        email: TEST_EMAIL,
        emailVerified: true,
        verifierSetAt: 0,
      }));
      mockRequest.payload.clientId = 'ea3ca969f8c6bb0d';
      return runTest(route, mockRequest, (result: any) => {
        expect(mockCustoms.check.callCount).toBe(2);
        expect(typeof result.uid).toBe('string');
        expect(typeof result.sessionToken).toBe('string');
      });
    });

    it('should bypass allowlist for existing passwordless account on confirm_code', () => {
      // Existing passwordless accounts bypass the allowlist
      mockDB.accountRecord = sinon.spy(() => ({
        uid,
        email: TEST_EMAIL,
        emailVerified: true,
        verifierSetAt: 0,
      }));
      mockDB.createSessionToken = sinon.spy(() =>
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
      mockDB.accountRecord = sinon.spy(() =>
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
          expect(mockCustoms.check.callCount).toBe(1);
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
          expect(mockCustoms.check.callCount).toBe(1);
        }
      );
    });

    it('should allow resend_code with allowed clientId', () => {
      mockRequest.payload.clientId = 'ea3ca969f8c6bb0d';
      return runTest(route, mockRequest, () => {
        expect(mockCustoms.check.callCount).toBe(1);
        expect(mockOtpManagerDelete.callCount).toBe(1);
        expect(mockOtpManagerCreate.callCount).toBe(1);
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
      check: sinon.spy(() => Promise.resolve()),
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
    mockOtpManagerCreate.resetHistory();
    mockOtpManagerIsValid.resetHistory();
    mockOtpManagerDelete.resetHistory();
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
      const route = getRoute(
        routes,
        '/account/passwordless/send_code',
        'POST'
      );
      mockDB.accountRecord = sinon.spy(() =>
        Promise.resolve({
          uid,
          email: TEST_EMAIL,
          verifierSetAt: 0,
          emails: [{ email: TEST_EMAIL, isPrimary: true }],
        })
      );

      return runTest(route, mockRequest, (result) => {
        expect(result).toEqual({});
        expect(mockOtpManagerCreate.callCount).toBe(1);
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
      const route = getRoute(
        routes,
        '/account/passwordless/send_code',
        'POST'
      );
      mockDB.accountRecord = sinon.spy(() =>
        Promise.resolve({
          uid,
          email: TEST_EMAIL,
          verifierSetAt: 0,
          emails: [{ email: TEST_EMAIL, isPrimary: true }],
        })
      );

      return runTest(route, mockRequest, (result) => {
        expect(result).toEqual({});
        expect(mockOtpManagerCreate.callCount).toBe(1);
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
      const route = getRoute(
        routes,
        '/account/passwordless/send_code',
        'POST'
      );
      mockDB.accountRecord = sinon.spy(() =>
        Promise.reject(error.unknownAccount())
      );

      return route.handler(mockRequest).then(
        () => {
          throw new Error('should have thrown');
        },
        (err: any) => {
          expect(err.errno).toBe(error.ERRNO.FEATURE_NOT_ENABLED);
          expect(mockOtpManagerCreate.callCount).toBe(0);
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
      mockDB.accountRecord = sinon.spy(() =>
        Promise.resolve({
          uid,
          email: TEST_EMAIL,
          emailCode: hexString(16),
          verifierSetAt: 0,
        })
      );
      mockDB.createSessionToken = sinon.spy(() =>
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
      mockDB.accountRecord = sinon.spy(() =>
        Promise.resolve({
          uid,
          email: TEST_EMAIL,
          verifierSetAt: 0,
          emails: [{ email: TEST_EMAIL, isPrimary: true }],
        })
      );

      return runTest(route, mockRequest, (result) => {
        expect(result).toEqual({});
        expect(mockOtpManagerDelete.callCount).toBe(1);
        expect(mockOtpManagerCreate.callCount).toBe(1);
      });
    });
  });
});
