/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const sinon = require('sinon');
const assert = { ...sinon.assert, ...require('chai').assert };
const mocks = require('../../mocks');
const getRoute = require('../../routes_helpers').getRoute;
const proxyquire = require('proxyquire');
const uuid = require('uuid');
const crypto = require('crypto');
const { AppError: error } = require('@fxa/accounts/errors');

function hexString(bytes) {
  return crypto.randomBytes(bytes).toString('hex');
}

const TEST_EMAIL = 'test@example.com';

let mockOtpManager;
let mockOtpManagerCreate;
let mockOtpManagerIsValid;
let mockOtpManagerDelete;

const makeRoutes = function (options = {}, requireMocks = {}) {
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

  // Mock OtpManager
  mockOtpManagerCreate = sinon.stub().resolves('123456');
  mockOtpManagerIsValid = sinon.stub().resolves(true);
  mockOtpManagerDelete = sinon.stub().resolves();

  mockOtpManager = {
    create: mockOtpManagerCreate,
    isValid: mockOtpManagerIsValid,
    delete: mockOtpManagerDelete,
  };

  mocks.mockFxaMailer();

  const { passwordlessRoutes } = proxyquire(
    '../../../lib/routes/passwordless',
    {
      '@fxa/shared/otp': {
        OtpManager: sinon.stub().returns(mockOtpManager),
      },
      './utils/otp': {
        default: () => ({
          hasTotpToken: options.hasTotpToken || sinon.stub().resolves(false),
        }),
      },
      './utils/security-event': {
        recordSecurityEvent:
          options.recordSecurityEvent || sinon.stub().resolves(),
      },
      ...requireMocks,
    }
  );

  return passwordlessRoutes(log, db, config, customs, glean, statsd, redis);
};

function runTest(route, request, assertions) {
  return new Promise((resolve, reject) => {
    try {
      return route.handler(request).then(resolve, reject);
    } catch (err) {
      reject(err);
    }
  }).then(assertions);
}

describe('/account/passwordless/send_code', () => {
  let uid, mockLog, mockRequest, mockDB, mockCustoms, route, routes;

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
      assert.equal(mockCustoms.check.callCount, 1, 'customs.check was called');
      assert.equal(
        mockCustoms.check.args[0][1],
        TEST_EMAIL,
        'customs.check called with email'
      );
      assert.equal(
        mockCustoms.check.args[0][2],
        'passwordlessSendOtp',
        'customs.check called with correct action'
      );

      assert.equal(
        mockOtpManagerCreate.callCount,
        1,
        'otpManager.create was called'
      );
      assert.equal(
        mockOtpManagerCreate.args[0][0],
        TEST_EMAIL,
        'otpManager.create called with email for new account'
      );

      assert.deepEqual(result, {}, 'response is empty object');
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
      assert.equal(mockDB.accountRecord.callCount, 1);
      assert.equal(mockOtpManagerCreate.callCount, 1);
      assert.equal(
        mockOtpManagerCreate.args[0][0],
        uid,
        'otpManager.create called with uid for existing account'
      );
      assert.deepEqual(result, {});
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
      () => assert.fail('should have thrown'),
      (err) => {
        assert.equal(mockDB.accountRecord.callCount, 1);
        assert.equal(mockOtpManagerCreate.callCount, 0);
        assert.equal(err.errno, 206);
      }
    );
  });

  it('should apply rate limiting', () => {
    mockCustoms.check = sinon.spy(() =>
      Promise.reject(error.tooManyRequests())
    );

    return runTest(route, mockRequest).then(
      () => assert.fail('should have thrown'),
      (err) => {
        assert.equal(mockCustoms.check.callCount, 1);
        assert.equal(err.errno, error.ERRNO.THROTTLED);
      }
    );
  });
});

describe('/account/passwordless/confirm_code', () => {
  let uid, mockLog, mockRequest, mockDB, mockCustoms, route, routes;

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
      assert.equal(sessionOpts.mustVerify, true);
      assert.equal(sessionOpts.tokenVerificationId, null);

      assert.equal(
        mockCustoms.check.callCount,
        2,
        'customs.check called twice'
      );
      assert.equal(
        mockCustoms.check.args[0][2],
        'passwordlessVerifyOtp',
        'first check is for verify'
      );
      assert.equal(
        mockCustoms.check.args[1][2],
        'passwordlessVerifyOtpPerDay',
        'second check is for daily limit'
      );

      assert.equal(mockOtpManagerIsValid.callCount, 1);
      assert.equal(mockOtpManagerIsValid.args[0][0], TEST_EMAIL);
      assert.equal(mockOtpManagerIsValid.args[0][1], '123456');

      assert.equal(mockOtpManagerDelete.callCount, 1);
      assert.equal(mockOtpManagerDelete.args[0][0], TEST_EMAIL);

      assert.equal(mockDB.createAccount.callCount, 1);
      const accountArgs = mockDB.createAccount.args[0][0];
      assert.equal(accountArgs.email, TEST_EMAIL);
      assert.equal(accountArgs.emailVerified, true);
      assert.equal(accountArgs.verifierSetAt, 0);

      assert.equal(mockDB.createSessionToken.callCount, 1);

      assert.equal(result.uid, uid);
      assert.equal(result.sessionToken, 'sessiontoken123');
      assert.equal(result.verified, true);
      assert.equal(result.authAt, 1234567890);
      assert.equal(result.isNewAccount, true);
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
      assert.equal(mockOtpManagerIsValid.callCount, 1);
      assert.equal(mockOtpManagerIsValid.args[0][0], uid);

      assert.equal(mockDB.createAccount.callCount, 0);
      assert.equal(mockDB.createSessionToken.callCount, 1);

      // mustVerify should always be true (defense-in-depth)
      const sessionOpts = mockDB.createSessionToken.args[0][0];
      assert.equal(sessionOpts.mustVerify, true);
      assert.equal(sessionOpts.tokenVerificationId, null);

      assert.equal(result.uid, uid);
      assert.equal(result.isNewAccount, false);
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
      () => assert.fail('should have thrown'),
      (err) => {
        assert.equal(mockOtpManagerIsValid.callCount, 1);
        assert.equal(mockOtpManagerDelete.callCount, 0);
        assert.equal(err.errno, 105);
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

    return runTest(route, mockRequest).then((result) => {
      assert.equal(hasTotpToken.callCount, 1);
      assert.equal(mockOtpManagerIsValid.callCount, 1);
      assert.equal(mockOtpManagerDelete.callCount, 1);
      assert.equal(result.uid, uid);
      assert.equal(result.sessionToken, 'sessiontoken123');
      assert.equal(result.verified, false);
      assert.ok(result.authAt);
      assert.equal(result.isNewAccount, false);
      assert.equal(result.verificationMethod, 'totp-2fa');
      assert.equal(result.verificationReason, 'login');
      // Session should be created with mustVerify=true
      const sessionTokenArgs = mockDB.createSessionToken.args[0][0];
      assert.equal(sessionTokenArgs.mustVerify, true);
      assert.ok(sessionTokenArgs.tokenVerificationId);
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
      () => assert.fail('should have thrown'),
      (err) => {
        assert.equal(mockDB.accountRecord.callCount, 1);
        assert.equal(err.errno, 206);
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
      assert.equal(mockDB.createSessionToken.callCount, 1);
      const sessionOpts = mockDB.createSessionToken.args[0][0];
      assert.equal(sessionOpts.uaBrowser, 'Firefox');
      assert.equal(sessionOpts.uaBrowserVersion, '100');
      assert.equal(sessionOpts.uaOS, 'Linux');
      assert.equal(sessionOpts.uaOSVersion, '5.15');
      assert.equal(sessionOpts.uaDeviceType, 'desktop');
      assert.equal(sessionOpts.uaFormFactor, 'desktop');
      assert.equal(sessionOpts.mustVerify, true);
      assert.equal(sessionOpts.tokenVerificationId, null);
    });
  });
});

describe('passwordless CMS customization', () => {
  let uid, mockLog, mockRequest, mockDB, mockCustoms, route, routes;

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
      const requireMocks = {
        './utils/account': {
          getOptionalCmsEmailConfig: mockGetOptionalCmsEmailConfig,
        },
      };

      routes = makeRoutes(
        {
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
        },
        requireMocks
      );
      route = getRoute(routes, '/account/passwordless/send_code', 'POST');

      return runTest(route, mockRequest, () => {
        // Verify OTP was created
        assert.equal(mockOtpManagerCreate.callCount, 1);
        assert.equal(mockOtpManagerCreate.args[0][0], TEST_EMAIL);

        // Verify CMS config was fetched
        assert.equal(mockGetOptionalCmsEmailConfig.callCount, 1);

        // Check first argument (options object)
        const options = mockGetOptionalCmsEmailConfig.args[0][0];
        assert.isDefined(options.code, 'code should be in options');
        assert.isDefined(options.deviceId, 'deviceId should be in options');
        assert.isDefined(options.flowId, 'flowId should be in options');
        assert.isDefined(
          options.codeExpiryMinutes,
          'codeExpiryMinutes should be in options'
        );
        assert.equal(options.codeExpiryMinutes, 5); // 300 seconds / 60

        // Check second argument (config object)
        const config = mockGetOptionalCmsEmailConfig.args[0][1];
        assert.equal(config.emailTemplate, 'PasswordlessSignupOtpEmail');
        assert.isDefined(config.request, 'request should be in config');
        assert.isDefined(config.log, 'log should be in config');
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
      const requireMocks = {
        './utils/account': {
          getOptionalCmsEmailConfig: mockGetOptionalCmsEmailConfig,
        },
      };

      routes = makeRoutes(
        {
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
        },
        requireMocks
      );
      route = getRoute(routes, '/account/passwordless/send_code', 'POST');

      return runTest(route, mockRequest, () => {
        // Verify OTP was created with uid (not email)
        assert.equal(mockOtpManagerCreate.callCount, 1);
        assert.equal(mockOtpManagerCreate.args[0][0], uid);

        // Verify CMS config was fetched with correct template
        assert.equal(mockGetOptionalCmsEmailConfig.callCount, 1);

        // Check first argument (options object)
        const options = mockGetOptionalCmsEmailConfig.args[0][0];
        assert.isDefined(options.code, 'code should be in options');
        assert.isDefined(options.deviceId, 'deviceId should be in options');
        assert.isDefined(options.flowId, 'flowId should be in options');
        assert.isDefined(options.time, 'time should be in options');
        assert.isDefined(options.date, 'date should be in options');

        // Check second argument (config object)
        const config = mockGetOptionalCmsEmailConfig.args[0][1];
        assert.equal(config.emailTemplate, 'PasswordlessSigninOtpEmail');
        assert.isDefined(config.request, 'request should be in config');
        assert.isDefined(config.log, 'log should be in config');
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

      const requireMocks = {
        './utils/account': {
          getOptionalCmsEmailConfig: mockGetOptionalCmsEmailConfig,
        },
      };

      routes = makeRoutes(
        {
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
        },
        requireMocks
      );
      route = getRoute(routes, '/account/passwordless/send_code', 'POST');

      return runTest(route, mockRequest, () => {
        // Verify CMS config was fetched
        assert.equal(mockGetOptionalCmsEmailConfig.callCount, 1);

        // Verify the config includes CMS customization
        const cmsConfig = mockGetOptionalCmsEmailConfig.args[0][0];
        assert.isDefined(cmsConfig.code);
        assert.equal(cmsConfig.codeExpiryMinutes, 5);
      });
    });

    it('should handle CMS manager absence gracefully', () => {
      mockDB.accountRecord = sinon.spy(() =>
        Promise.reject(error.unknownAccount())
      );

      const mockGetOptionalCmsEmailConfig = sinon.stub().resolves({});

      const requireMocks = {
        './utils/account': {
          getOptionalCmsEmailConfig: mockGetOptionalCmsEmailConfig,
        },
      };

      routes = makeRoutes(
        {
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
        },
        requireMocks
      );
      route = getRoute(routes, '/account/passwordless/send_code', 'POST');

      return runTest(route, mockRequest, () => {
        // Should still work without CMS manager
        assert.equal(mockOtpManagerCreate.callCount, 1);
        assert.equal(mockGetOptionalCmsEmailConfig.callCount, 1);

        // Verify cmsManager parameter can be undefined
        const config = mockGetOptionalCmsEmailConfig.args[0][1];
        // cmsManager is optional and may be undefined
        assert.property(config, 'log');
        assert.property(config, 'request');
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

      const requireMocks = {
        './utils/account': {
          getOptionalCmsEmailConfig: mockGetOptionalCmsEmailConfig,
        },
      };

      routes = makeRoutes(
        {
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
        },
        requireMocks
      );
      route = getRoute(routes, '/account/passwordless/resend_code', 'POST');

      return runTest(route, mockRequest, () => {
        // Verify OTP was deleted and recreated
        assert.equal(mockOtpManagerDelete.callCount, 1);
        assert.equal(mockOtpManagerCreate.callCount, 1);

        // Verify CMS config was fetched
        assert.equal(mockGetOptionalCmsEmailConfig.callCount, 1);

        // Should use signin template for existing account
        const config = mockGetOptionalCmsEmailConfig.args[0][1];
        assert.equal(config.emailTemplate, 'PasswordlessSigninOtpEmail');
      });
    });
  });
});

describe('passwordless security events', () => {
  let uid,
    mockLog,
    mockRequest,
    mockDB,
    mockCustoms,
    mockRecordSecurityEvent,
    route,
    routes;

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
      assert.equal(mockRecordSecurityEvent.callCount, 1);
      assert.equal(
        mockRecordSecurityEvent.args[0][0],
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
      assert.equal(mockRecordSecurityEvent.callCount, 1);
      assert.equal(
        mockRecordSecurityEvent.args[0][0],
        'account.passwordless_login_otp_sent'
      );
      assert.isDefined(mockRecordSecurityEvent.args[0][1].account);
      assert.equal(mockRecordSecurityEvent.args[0][1].account.uid, uid);
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
      assert.equal(mockRecordSecurityEvent.callCount, 2);
      assert.equal(
        mockRecordSecurityEvent.args[0][0],
        'account.passwordless_registration_complete'
      );
      assert.equal(
        mockRecordSecurityEvent.args[1][0],
        'account.passwordless_login_otp_verified'
      );
    });
  });
});

describe('passwordless statsd metrics', () => {
  let uid, mockLog, mockRequest, mockDB, mockCustoms, mockStatsd, route, routes;

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
      assert.equal(mockStatsd.increment.callCount, 1);
      assert.equal(
        mockStatsd.increment.args[0][0],
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
      assert.isAtLeast(mockStatsd.increment.callCount, 2);
      const incrementCalls = mockStatsd.increment
        .getCalls()
        .map((c) => c.args[0]);
      assert.include(incrementCalls, 'passwordless.registration.success');
      assert.include(incrementCalls, 'passwordless.confirmCode.success');
    });
  });
});

describe('/account/passwordless/resend_code', () => {
  let uid, mockLog, mockRequest, mockDB, mockCustoms, route, routes;

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
      assert.equal(mockCustoms.check.callCount, 1);
      assert.equal(mockCustoms.check.args[0][1], TEST_EMAIL);
      assert.equal(mockCustoms.check.args[0][2], 'passwordlessSendOtp');

      assert.equal(mockOtpManagerDelete.callCount, 1);
      assert.equal(mockOtpManagerDelete.args[0][0], TEST_EMAIL);

      assert.equal(mockOtpManagerCreate.callCount, 1);
      assert.equal(mockOtpManagerCreate.args[0][0], TEST_EMAIL);

      assert.deepEqual(result, {});
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
      assert.equal(mockCustoms.check.callCount, 1);
      assert.equal(mockCustoms.check.args[0][1], TEST_EMAIL);
      assert.equal(mockCustoms.check.args[0][2], 'passwordlessSendOtp');

      assert.equal(mockOtpManagerDelete.callCount, 1);
      assert.equal(mockOtpManagerDelete.args[0][0], uid);

      assert.equal(mockOtpManagerCreate.callCount, 1);
      assert.equal(mockOtpManagerCreate.args[0][0], uid);

      assert.deepEqual(result, {});
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
      () => assert.fail('should have thrown'),
      (err) => {
        assert.equal(mockDB.accountRecord.callCount, 1);
        assert.equal(mockOtpManagerDelete.callCount, 0);
        assert.equal(mockOtpManagerCreate.callCount, 0);
        assert.equal(err.errno, 206);
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
    assert.equal(routes.length, 3);
    assert.equal(routes[0].path, '/account/passwordless/send_code');
    assert.equal(routes[1].path, '/account/passwordless/confirm_code');
    assert.equal(routes[2].path, '/account/passwordless/resend_code');
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

    assert.equal(routes.length, 3);
    assert.equal(routes[0].path, '/account/passwordless/send_code');
    assert.equal(routes[0].method, 'POST');
    assert.equal(routes[1].path, '/account/passwordless/confirm_code');
    assert.equal(routes[1].method, 'POST');
    assert.equal(routes[2].path, '/account/passwordless/resend_code');
    assert.equal(routes[2].method, 'POST');
  });
});

describe('passwordless service validation', () => {
  let uid, mockLog, mockDB, mockCustoms, mockRequest, routes, route;

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
        () => assert.fail('should have thrown'),
        (err) => {
          assert.equal(err.errno, error.ERRNO.FEATURE_NOT_ENABLED);
          // Rate limiting runs before allowlist check (which happens after account lookup)
          assert.equal(mockCustoms.check.callCount, 1);
          assert.equal(mockOtpManagerCreate.callCount, 0);
        }
      );
    });

    it('should reject requests with any clientId', () => {
      mockRequest.payload.clientId = 'ea3ca969f8c6bb0d';
      return route.handler(mockRequest).then(
        () => assert.fail('should have thrown'),
        (err) => {
          assert.equal(err.errno, error.ERRNO.FEATURE_NOT_ENABLED);
          assert.equal(mockCustoms.check.callCount, 1);
          assert.equal(mockOtpManagerCreate.callCount, 0);
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
        () => assert.fail('should have thrown'),
        (err) => {
          assert.equal(err.errno, error.ERRNO.FEATURE_NOT_ENABLED);
          assert.equal(mockCustoms.check.callCount, 1);
          assert.equal(mockOtpManagerCreate.callCount, 0);
        }
      );
    });

    it('should reject requests with disallowed clientId', () => {
      mockRequest.payload.clientId = 'not-allowed-client';
      return route.handler(mockRequest).then(
        () => assert.fail('should have thrown'),
        (err) => {
          assert.equal(err.errno, error.ERRNO.FEATURE_NOT_ENABLED);
          assert.equal(mockCustoms.check.callCount, 1);
          assert.equal(mockOtpManagerCreate.callCount, 0);
        }
      );
    });

    it('should allow requests with allowed clientId (ea3ca969f8c6bb0d)', () => {
      mockRequest.payload.clientId = 'ea3ca969f8c6bb0d';
      return runTest(route, mockRequest, () => {
        assert.equal(mockCustoms.check.callCount, 1);
        assert.equal(mockOtpManagerCreate.callCount, 1);
      });
    });

    it('should allow requests with allowed clientId (dcdb5ae7add825d2)', () => {
      mockRequest.payload.clientId = 'dcdb5ae7add825d2';
      return runTest(route, mockRequest, () => {
        assert.equal(mockCustoms.check.callCount, 1);
        assert.equal(mockOtpManagerCreate.callCount, 1);
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
        () => assert.fail('should have thrown'),
        (err) => {
          assert.equal(err.errno, error.ERRNO.FEATURE_NOT_ENABLED);
          // Rate limiting runs before allowlist check (2 checks: verify + daily)
          assert.equal(mockCustoms.check.callCount, 2);
        }
      );
    });

    it('should reject confirm_code with disallowed clientId for new account', () => {
      mockDB.accountRecord = sinon.spy(() =>
        Promise.reject(error.unknownAccount())
      );
      mockRequest.payload.clientId = 'not-allowed-client';
      return route.handler(mockRequest).then(
        () => assert.fail('should have thrown'),
        (err) => {
          assert.equal(err.errno, error.ERRNO.FEATURE_NOT_ENABLED);
          assert.equal(mockCustoms.check.callCount, 2);
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
      return runTest(route, mockRequest, (result) => {
        assert.equal(mockCustoms.check.callCount, 2);
        assert.isString(result.uid);
        assert.isString(result.sessionToken);
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
      return runTest(route, mockRequest, (result) => {
        assert.isString(result.uid);
        assert.isString(result.sessionToken);
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
        () => assert.fail('should have thrown'),
        (err) => {
          assert.equal(err.errno, error.ERRNO.FEATURE_NOT_ENABLED);
          // Rate limiting runs before allowlist check
          assert.equal(mockCustoms.check.callCount, 1);
        }
      );
    });

    it('should reject resend_code with disallowed clientId', () => {
      mockRequest.payload.clientId = 'not-allowed-client';
      return route.handler(mockRequest).then(
        () => assert.fail('should have thrown'),
        (err) => {
          assert.equal(err.errno, error.ERRNO.FEATURE_NOT_ENABLED);
          assert.equal(mockCustoms.check.callCount, 1);
        }
      );
    });

    it('should allow resend_code with allowed clientId', () => {
      mockRequest.payload.clientId = 'ea3ca969f8c6bb0d';
      return runTest(route, mockRequest, () => {
        assert.equal(mockCustoms.check.callCount, 1);
        assert.equal(mockOtpManagerDelete.callCount, 1);
        assert.equal(mockOtpManagerCreate.callCount, 1);
      });
    });
  });
});

describe('existing passwordless accounts bypass flag and allowlist', () => {
  let uid, mockLog, mockDB, mockCustoms, mockRequest;

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
      const route = getRoute(routes, '/account/passwordless/send_code', 'POST');
      mockDB.accountRecord = sinon.spy(() =>
        Promise.resolve({
          uid,
          email: TEST_EMAIL,
          verifierSetAt: 0,
          emails: [{ email: TEST_EMAIL, isPrimary: true }],
        })
      );

      return runTest(route, mockRequest, (result) => {
        assert.deepEqual(result, {});
        assert.equal(mockOtpManagerCreate.callCount, 1);
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
      mockDB.accountRecord = sinon.spy(() =>
        Promise.resolve({
          uid,
          email: TEST_EMAIL,
          verifierSetAt: 0,
          emails: [{ email: TEST_EMAIL, isPrimary: true }],
        })
      );

      return runTest(route, mockRequest, (result) => {
        assert.deepEqual(result, {});
        assert.equal(mockOtpManagerCreate.callCount, 1);
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
      mockDB.accountRecord = sinon.spy(() =>
        Promise.reject(error.unknownAccount())
      );

      return route.handler(mockRequest).then(
        () => assert.fail('should have thrown'),
        (err) => {
          assert.equal(err.errno, error.ERRNO.FEATURE_NOT_ENABLED);
          assert.equal(mockOtpManagerCreate.callCount, 0);
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

      return runTest(route, mockRequest, (result) => {
        assert.equal(result.uid, uid);
        assert.isString(result.sessionToken);
        assert.equal(result.verified, true);
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
        assert.deepEqual(result, {});
        assert.equal(mockOtpManagerDelete.callCount, 1);
        assert.equal(mockOtpManagerCreate.callCount, 1);
      });
    });
  });
});

