/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import crypto from 'crypto';
import { Container } from 'typedi';

const mocks = require('../../test/mocks');
const { getRoute } = require('../../test/routes_helpers');

const uuid = require('uuid');
const { AppError: error } = require('@fxa/accounts/errors');
const log = require('../../lib/log');
const random = require('../../lib/crypto/random');
const glean = mocks.mockGlean();

const TEST_EMAIL = 'foo@gmail.com';

function makeRoutes(options: any = {}) {
  const config = options.config || {
    verifierVersion: 0,
    smtp: {},
    passwordForgotOtp: {
      digits: 8,
    },
  };
  const log = options.log || mocks.mockLog();
  const db = options.db || {};
  const mailer = options.mailer || {};
  const Password = require('../../lib/crypto/password')(log, config);
  const customs = options.customs || {};
  const signinUtils = require('./utils/signin')(
    log,
    config,
    customs,
    db,
    mailer
  );
  config.secondaryEmail = config.secondaryEmail || {};
  return require('./password')(
    log,
    db,
    Password,
    config.smtp?.redirectDomain || '',
    mailer,
    config.verifierVersion,
    options.customs || {},
    signinUtils,
    options.push || {},
    config,
    {
      removePublicAndCanGrantTokens: () => {},
    },
    glean,
    options.authServerCacheRedis || {},
    options.statsd || {}
  );
}

function runRoute(routes: any, name: string, request: any) {
  return getRoute(routes, name).handler(request);
}

describe('/password', () => {
  let mockAccountEventsManager: any;
  let mockFxaMailer: any;

  beforeEach(() => {
    // mailer mock must be done before route creation/require
    // otherwise it won't pickup the mock we define because
    // of module caching
    mocks.mockOAuthClientInfo();
    mockFxaMailer = mocks.mockFxaMailer();
    mockAccountEventsManager = mocks.mockAccountEventsManager();
    glean.resetPassword.emailSent.mockClear();
  });

  afterEach(() => {
    Container.reset();
    mocks.unMockAccountEventsManager();
  });

  describe('/forgot/send_otp', () => {
    const mockConfig = {
      passwordForgotOtp: {
        digits: 8,
        ttl: 300,
      },
    };
    const mockCustoms = mocks.mockCustoms();
    const uid = uuid.v4({}, Buffer.alloc(16)).toString('hex');
    const mockDB = mocks.mockDB({
      email: TEST_EMAIL,
      uid,
      emailVerified: true,
    });
    const mockMailer = mocks.mockMailer();
    const mockMetricsContext = mocks.mockMetricsContext();
    const mockLog = mocks.mockLog('ERROR', 'test', {
      stdout: {
        on: jest.fn(),
        write: jest.fn(),
      },
      stderr: {
        on: jest.fn(),
        write: jest.fn(),
      },
    });
    mockLog.flowEvent = jest.fn(() => {
      return Promise.resolve();
    });
    const mockRedis = {
      set: jest.fn(),
      get: jest.fn(),
      del: jest.fn(),
    };
    const mockStatsd = { increment: jest.fn() };

    it('sends an OTP when enabled', () => {
      const passwordRoutes = makeRoutes({
        config: mockConfig,
        customs: mockCustoms,
        db: mockDB,
        mailer: mockMailer,
        metricsContext: mockMetricsContext,
        log: mockLog,
        authServerCacheRedis: mockRedis,
        statsd: mockStatsd,
      });

      const mockRequest = mocks.mockRequest({
        log: mockLog,
        payload: {
          email: TEST_EMAIL,
          metricsContext: {
            deviceId: 'wibble',
            flowId:
              'F1031DF1031DF1031DF1031DF1031DF1031DF1031DF1031DF1031DF1031DF103',
            flowBeginTime: Date.now() - 1,
          },
        },
        query: {},
        metricsContext: mockMetricsContext,
      });
      return runRoute(
        passwordRoutes,
        '/password/forgot/send_otp',
        mockRequest
      ).then((response: any) => {
        expect(mockFxaMailer.sendPasswordForgotOtpEmail).toHaveBeenCalledTimes(
          1
        );
        expect(mockDB.accountRecord).toHaveBeenCalledTimes(1);
        expect(mockRedis.set).toHaveBeenCalledTimes(1);

        // an eight digit code was set
        // TODO FXA-7852 check that the same code was pass to the email
        expect(mockRedis.set.mock.calls[0][1]).toMatch(/^\d{8}$/);

        expect(mockRequest.validateMetricsContext).toHaveBeenCalledTimes(1);
        expect(mockCustoms.check).toHaveBeenCalledTimes(1);
        expect(mockCustoms.check).toHaveBeenCalledWith(
          mockRequest,
          TEST_EMAIL,
          'passwordForgotSendOtp'
        );

        expect(mockFxaMailer.sendPasswordForgotOtpEmail).toHaveBeenCalledTimes(
          1
        );

        expect(mockMetricsContext.setFlowCompleteSignal).toHaveBeenCalledTimes(
          1
        );
        expect(
          mockMetricsContext.setFlowCompleteSignal
        ).toHaveBeenNthCalledWith(1, 'account.reset');

        expect(mockLog.flowEvent).toHaveBeenCalledTimes(2);
        expect(mockLog.flowEvent).toHaveBeenNthCalledWith(
          1,
          expect.objectContaining({ event: 'password.forgot.send_otp.start' })
        );
        expect(mockLog.flowEvent).toHaveBeenNthCalledWith(
          2,
          expect.objectContaining({
            event: 'password.forgot.send_otp.completed',
          })
        );

        expect(glean.resetPassword.otpEmailSent).toHaveBeenCalledTimes(1);
        expect(glean.resetPassword.otpEmailSent).toHaveBeenCalledWith(
          mockRequest
        );

        expect(
          mockAccountEventsManager.recordSecurityEvent
        ).toHaveBeenCalledWith(
          expect.anything(),
          expect.objectContaining({
            name: 'account.password_reset_otp_sent',
            ipAddr: '63.245.221.32',
            uid,
            tokenId: undefined,
          })
        );
      });
    });

    it('throws unknownAccount error when email is not verified', async () => {
      const unverifiedMockDB = mocks.mockDB({
        email: TEST_EMAIL,
        uid,
        emailVerified: false,
      });
      const passwordRoutes = makeRoutes({
        config: mockConfig,
        customs: mockCustoms,
        db: unverifiedMockDB,
        mailer: mockMailer,
        metricsContext: mockMetricsContext,
        log: mockLog,
        authServerCacheRedis: mockRedis,
        statsd: mockStatsd,
      });

      const mockRequest = mocks.mockRequest({
        log: mockLog,
        payload: {
          email: TEST_EMAIL,
          metricsContext: {
            deviceId: 'wibble',
            flowId:
              'F1031DF1031DF1031DF1031DF1031DF1031DF1031DF1031DF1031DF1031DF103',
            flowBeginTime: Date.now() - 1,
          },
        },
        query: {},
        metricsContext: mockMetricsContext,
      });

      try {
        await runRoute(
          passwordRoutes,
          '/password/forgot/send_otp',
          mockRequest
        );
        throw new Error('should have thrown unknownAccount error');
      } catch (err: any) {
        expect(err.errno).toBe(102);
      }
    });
  });

  describe('/forgot/verify_otp', () => {
    const mockConfig = {
      passwordForgotOtp: {
        digits: 8,
        ttl: 300,
      },
    };
    const mockCustoms = mocks.mockCustoms();
    const uid = uuid.v4({}, Buffer.alloc(16)).toString('hex');
    const mockDB = mocks.mockDB({
      email: TEST_EMAIL,
      uid,
      passCode: '486008',
    });
    const mockMailer = mocks.mockMailer();
    const mockMetricsContext = mocks.mockMetricsContext();
    const mockLog = mocks.mockLog('ERROR', 'test', {
      stdout: {
        on: jest.fn(),
        write: jest.fn(),
      },
      stderr: {
        on: jest.fn(),
        write: jest.fn(),
      },
    });
    mockLog.flowEvent = jest.fn(() => {
      return Promise.resolve();
    });
    const code = '97236000';
    const mockRedis = {
      set: jest.fn(),
      get: jest.fn().mockReturnValue(code),
      del: jest.fn(),
    };
    const mockStatsd = { increment: jest.fn() };

    const mockRequest = mocks.mockRequest({
      log: mockLog,
      payload: {
        email: TEST_EMAIL,
        code,
        metricsContext: {
          deviceId: 'wibble',
          flowId:
            'F1031DF1031DF1031DF1031DF1031DF1031DF1031DF1031DF1031DF1031DF103',
          flowBeginTime: Date.now() - 1,
        },
      },
      query: {},
      metricsContext: mockMetricsContext,
    });

    it('verifies an OTP when enabled', () => {
      const passwordRoutes = makeRoutes({
        config: mockConfig,
        customs: mockCustoms,
        db: mockDB,
        mailer: mockMailer,
        metricsContext: mockMetricsContext,
        log: mockLog,
        authServerCacheRedis: mockRedis,
        statsd: mockStatsd,
      });

      return runRoute(
        passwordRoutes,
        '/password/forgot/verify_otp',
        mockRequest
      ).then((response: any) => {
        expect(mockDB.accountRecord).toHaveBeenCalledTimes(1);

        expect(mockRedis.get).toHaveBeenCalledTimes(1);
        expect(mockRedis.del).toHaveBeenCalledTimes(1);
        expect(mockRedis.get).toHaveBeenNthCalledWith(
          1,
          expect.stringMatching(new RegExp(uid))
        );

        expect(mockRequest.validateMetricsContext).toHaveBeenCalledTimes(1);

        expect(mockCustoms.check).toHaveBeenCalledWith(
          mockRequest,
          TEST_EMAIL,
          'passwordForgotVerifyOtp'
        );

        expect(mockCustoms.check).toHaveBeenCalledWith(
          mockRequest,
          TEST_EMAIL,
          'passwordForgotVerifyOtpPerDay'
        );

        expect(mockStatsd.increment).toHaveBeenCalledTimes(2);
        expect(mockStatsd.increment).toHaveBeenCalledWith(
          'otp.passwordForgot.attempt',
          {}
        );
        expect(mockStatsd.increment).toHaveBeenCalledWith(
          'otp.passwordForgot.verified',
          {}
        );

        expect(mockLog.flowEvent).toHaveBeenCalledTimes(2);
        expect(mockLog.flowEvent).toHaveBeenNthCalledWith(
          1,
          expect.objectContaining({ event: 'password.forgot.verify_otp.start' })
        );
        expect(mockLog.flowEvent).toHaveBeenNthCalledWith(
          2,
          expect.objectContaining({
            event: 'password.forgot.verify_otp.completed',
          })
        );

        expect(mockDB.createPasswordForgotToken).toHaveBeenCalledTimes(1);
        const args = mockDB.createPasswordForgotToken.mock.calls[0];
        expect(args.length).toBe(1);
        expect(args[0].uid).toEqual(uid);

        expect(response.token).toMatch(/^(?:[a-fA-F0-9]{2}){32}$/);
        expect(response.code).toBe('486008');

        expect(glean.resetPassword.otpVerified).toHaveBeenCalledTimes(1);
        expect(glean.resetPassword.otpVerified).toHaveBeenCalledWith(
          mockRequest
        );

        expect(
          mockAccountEventsManager.recordSecurityEvent
        ).toHaveBeenCalledWith(
          expect.anything(),
          expect.objectContaining({
            name: 'account.password_reset_otp_verified',
            ipAddr: '63.245.221.32',
            uid,
            tokenId: undefined,
          })
        );
      });
    });
  });

  it('/forgot/verify_code', () => {
    const mockCustoms = mocks.mockCustoms();
    const uid = uuid.v4({}, Buffer.alloc(16)).toString('hex');
    const accountResetToken = {
      data: crypto.randomBytes(16).toString('hex'),
      id: crypto.randomBytes(16).toString('hex'),
      uid,
    };
    const passwordForgotTokenId = crypto.randomBytes(16).toString('hex');
    const mockDB = mocks.mockDB({
      accountResetToken: accountResetToken,
      email: TEST_EMAIL,
      passCode: 'abcdef',
      passwordForgotTokenId,
      uid,
    });
    const mockMailer = mocks.mockMailer();
    const mockMetricsContext = mocks.mockMetricsContext();
    const mockLog = log('ERROR', 'test', {
      stdout: {
        on: jest.fn(),
        write: jest.fn(),
      },
      stderr: {
        on: jest.fn(),
        write: jest.fn(),
      },
    });
    mockLog.flowEvent = jest.fn(() => {
      return Promise.resolve();
    });
    const passwordRoutes = makeRoutes({
      customs: mockCustoms,
      db: mockDB,
      mailer: mockMailer,
      metricsContext: mockMetricsContext,
    });

    const mockRequest = mocks.mockRequest({
      log: mockLog,
      credentials: {
        email: TEST_EMAIL,
        id: passwordForgotTokenId,
        passCode: Buffer.from('abcdef', 'hex'),
        ttl: function () {
          return 17;
        },
        uid,
      },
      metricsContext: mockMetricsContext,
      payload: {
        code: 'abcdef',
        metricsContext: {
          deviceId: 'wibble',
          flowId:
            'F1031DF1031DF1031DF1031DF1031DF1031DF1031DF1031DF1031DF1031DF103',
          flowBeginTime: Date.now() - 1,
        },
      },
      query: {},
    });
    return runRoute(
      passwordRoutes,
      '/password/forgot/verify_code',
      mockRequest
    ).then((response: any) => {
      expect(Object.keys(response)).toEqual(['accountResetToken']);
      expect(response.accountResetToken).toBe(accountResetToken.data);

      expect(mockCustoms.check).toHaveBeenCalledTimes(1);

      expect(mockDB.forgotPasswordVerified).toHaveBeenCalledTimes(1);
      let args = mockDB.forgotPasswordVerified.mock.calls[0];
      expect(args.length).toBe(1);
      expect(args[0].uid).toEqual(uid);

      expect(mockRequest.validateMetricsContext).toHaveBeenCalledTimes(0);
      expect(mockLog.flowEvent).toHaveBeenCalledTimes(2);
      expect(mockLog.flowEvent).toHaveBeenNthCalledWith(
        1,
        expect.objectContaining({ event: 'password.forgot.verify_code.start' })
      );
      expect(mockLog.flowEvent).toHaveBeenNthCalledWith(
        2,
        expect.objectContaining({
          event: 'password.forgot.verify_code.completed',
        })
      );

      expect(mockMetricsContext.propagate).toHaveBeenCalledTimes(1);
      args = mockMetricsContext.propagate.mock.calls[0];
      expect(args).toHaveLength(2);
      expect(args[0].id).toBe(passwordForgotTokenId);
      expect(args[0].uid).toBe(uid);
      expect(args[1].id).toBe(accountResetToken.id);
      expect(args[1].uid).toBe(uid);

      expect(mockFxaMailer.sendPasswordResetEmail).toHaveBeenCalledTimes(1);
      const passwordResetArgs =
        mockFxaMailer.sendPasswordResetEmail.mock.calls[0];
      expect(passwordResetArgs[0].uid).toBe(uid);
      expect(passwordResetArgs[0].deviceId).toBe('wibble');
    });
  });

  describe('/password/change/start', () => {
    it('should start password change', async () => {
      const uid = uuid.v4({}, Buffer.alloc(16)).toString('hex');
      const mockDB = mocks.mockDB({
        email: TEST_EMAIL,
        uid,
        emailVerified: true,
      });
      const mockPush = mocks.mockPush();
      const mockMailer = mocks.mockMailer();
      const mockLog = mocks.mockLog();
      const mockSessionToken = await mockDB.createSessionToken({});
      const mockRequest = mocks.mockRequest({
        payload: {
          email: TEST_EMAIL,
          oldAuthPW: crypto.randomBytes(32).toString('hex'),
        },
        query: {
          keys: 'true',
        },
        auth: {
          credentials: mockSessionToken,
        },
        log: mockLog,
        uaBrowser: 'Firefox',
        uaBrowserVersion: '57',
        uaOS: 'Mac OS X',
        uaOSVersion: '10.11',
      });
      const mockCustoms = mocks.mockCustoms();
      const mockStatsd = mocks.mockStatsd();
      const passwordRoutes = makeRoutes({
        db: mockDB,
        push: mockPush,
        mailer: mockMailer,
        log: mockLog,
        customs: mockCustoms,
        statsd: mockStatsd,
      });

      mockDB.checkPassword = jest.fn(() =>
        Promise.resolve({
          v1: true,
          v2: false,
        })
      );

      const response = await runRoute(
        passwordRoutes,
        '/password/change/start',
        mockRequest
      );

      expect(mockCustoms.checkAuthenticated).toHaveBeenCalledWith(
        mockRequest,
        uid,
        TEST_EMAIL,
        'authenticatedPasswordChange'
      );
      expect(mockDB.accountRecord).toHaveBeenCalledWith(TEST_EMAIL);
      expect(mockDB.createKeyFetchToken).toHaveBeenCalledTimes(1);
      expect(mockDB.createPasswordChangeToken).toHaveBeenCalledWith({ uid });

      expect(response.keyFetchToken).toBeTruthy();
      expect(response.passwordChangeToken).toBeTruthy();
    });

    it('should start password change with session token', async () => {
      const uid = uuid.v4({}, Buffer.alloc(16)).toString('hex');
      const mockDB = mocks.mockDB({
        email: TEST_EMAIL,
        uid,
        emailVerified: true,
      });
      const mockSession = await mockDB.createSessionToken({});
      const mockPush = mocks.mockPush();
      const mockMailer = mocks.mockMailer();
      const mockLog = mocks.mockLog();
      const mockStatsd = mocks.mockStatsd();
      const mockRequest = mocks.mockRequest({
        credentials: mockSession,
        payload: {
          email: TEST_EMAIL,
          oldAuthPW: crypto.randomBytes(32).toString('hex'),
        },
        query: {
          keys: 'true',
        },
        log: mockLog,
        uaBrowser: 'Firefox',
        uaBrowserVersion: '57',
        uaOS: 'Mac OS X',
        uaOSVersion: '10.11',
      });
      const mockCustoms = mocks.mockCustoms();
      const passwordRoutes = makeRoutes({
        db: mockDB,
        push: mockPush,
        mailer: mockMailer,
        log: mockLog,
        customs: mockCustoms,
        statsd: mockStatsd,
      });

      mockDB.checkPassword = jest.fn(() =>
        Promise.resolve({
          v1: true,
          v2: false,
        })
      );

      const response = await runRoute(
        passwordRoutes,
        '/password/change/start',
        mockRequest
      );

      expect(mockCustoms.checkAuthenticated).toHaveBeenCalledWith(
        mockRequest,
        uid,
        TEST_EMAIL,
        'authenticatedPasswordChange'
      );
      expect(mockDB.accountRecord).toHaveBeenCalledWith(TEST_EMAIL);
      expect(mockDB.createKeyFetchToken).toHaveBeenCalledTimes(1);
      expect(mockDB.createPasswordChangeToken).toHaveBeenCalledWith({ uid });

      expect(response.keyFetchToken).toBeTruthy();
      expect(response.passwordChangeToken).toBeTruthy();
    });
  });

  describe('/change/finish', () => {
    it('smoke', () => {
      const uid = uuid.v4({}, Buffer.alloc(16)).toString('hex');
      const devices = [
        { uid: uid, id: crypto.randomBytes(16) },
        { uid: uid, id: crypto.randomBytes(16) },
      ];
      const mockDB = mocks.mockDB({
        email: TEST_EMAIL,
        uid,
        devices,
      });
      const mockPush = mocks.mockPush();
      const mockMailer = mocks.mockMailer();
      const mockLog = mocks.mockLog();
      const mockRequest = mocks.mockRequest({
        credentials: {
          uid: uid,
        },
        devices,
        payload: {
          authPW: crypto.randomBytes(32).toString('hex'),
          wrapKb: crypto.randomBytes(32).toString('hex'),
          sessionToken: crypto.randomBytes(32).toString('hex'),
        },
        query: {
          keys: 'true',
        },
        log: mockLog,
        uaBrowser: 'Firefox',
        uaBrowserVersion: '57',
        uaOS: 'Mac OS X',
        uaOSVersion: '10.11',
      });
      const passwordRoutes = makeRoutes({
        db: mockDB,
        push: mockPush,
        mailer: mockMailer,
        log: mockLog,
      });

      return runRoute(
        passwordRoutes,
        '/password/change/finish',
        mockRequest
      ).then((response: any) => {
        expect(mockDB.deletePasswordChangeToken).toHaveBeenCalledTimes(1);
        expect(mockDB.resetAccount).toHaveBeenCalledTimes(1);
        expect(mockDB.resetAccount.mock.calls[0][2]).toBe(undefined);

        expect(mockPush.notifyPasswordChanged).toHaveBeenCalledTimes(1);
        expect(mockPush.notifyPasswordChanged).toHaveBeenNthCalledWith(1, uid, [
          devices[1],
        ]);

        expect(mockDB.account).toHaveBeenCalledTimes(1);
        expect(mockFxaMailer.sendPasswordChangedEmail).toHaveBeenCalledTimes(1);
        const passwordChangedArgs =
          mockFxaMailer.sendPasswordChangedEmail.mock.calls[0];
        expect(passwordChangedArgs[0].to).toBe(TEST_EMAIL);
        expect(passwordChangedArgs[0].location.city).toBe('Mountain View');
        expect(passwordChangedArgs[0].location.country).toBe('United States');
        expect(passwordChangedArgs[0].timeZone).toBe('America/Los_Angeles');
        expect(passwordChangedArgs[0].uid).toBe(uid);

        expect(mockLog.activityEvent).toHaveBeenCalledTimes(1);
        expect(mockLog.activityEvent).toHaveBeenNthCalledWith(1, {
          country: 'United States',
          event: 'account.changedPassword',
          region: 'California',
          service: undefined,
          uid: uid.toString('hex'),
          userAgent: 'test user-agent',
          sigsciRequestId: 'test-sigsci-id',
          clientJa4: 'test-ja4',
        });

        expect(mockDB.createSessionToken).toHaveBeenCalledTimes(1);
        const sessionTokenArgs = mockDB.createSessionToken.mock.calls[0];
        expect(sessionTokenArgs.length).toBe(1);
        expect(sessionTokenArgs[0].uaBrowser).toBe('Firefox');
        expect(sessionTokenArgs[0].uaBrowserVersion).toBe('57');
        expect(sessionTokenArgs[0].uaOS).toBe('Mac OS X');
        expect(sessionTokenArgs[0].uaOSVersion).toBe('10.11');
        expect(sessionTokenArgs[0].uaDeviceType).toBe(null);
        expect(sessionTokenArgs[0].uaFormFactor).toBe(null);

        expect(
          mockAccountEventsManager.recordSecurityEvent
        ).toHaveBeenCalledWith(
          expect.anything(),
          expect.objectContaining({
            name: 'account.password_changed',
            ipAddr: '63.245.221.32',
            uid: mockRequest.auth.credentials.uid,
            tokenId: mockRequest.auth.credentials.id,
          })
        );

        expect(
          mockAccountEventsManager.recordSecurityEvent
        ).toHaveBeenCalledWith(
          expect.anything(),
          expect.objectContaining({
            name: 'account.password_reset_success',
            ipAddr: '63.245.221.32',
            uid: mockRequest.auth.credentials.uid,
            tokenId: mockRequest.auth.credentials.id,
          })
        );
      });
    });

    it('succeeds even if notification blocked', () => {
      const uid = uuid.v4({}, Buffer.alloc(16)).toString('hex');
      const mockDB = mocks.mockDB({
        email: TEST_EMAIL,
        uid: uid,
      });
      const mockPush = mocks.mockPush();
      const mockMailer = {
        sendPasswordChangedEmail: jest.fn(() => {
          return Promise.reject(error.emailBouncedHard());
        }),
      };
      const mockLog = mocks.mockLog();

      // Configure mockFxaMailer to reject for this test
      mockFxaMailer.sendPasswordChangedEmail.mockRejectedValue(
        error.emailBouncedHard()
      );

      const mockRequest = mocks.mockRequest({
        credentials: {
          uid: uid,
        },
        payload: {
          authPW: crypto.randomBytes(32).toString('hex'),
          wrapKb: crypto.randomBytes(32).toString('hex'),
          sessionToken: crypto.randomBytes(32).toString('hex'),
        },
        query: {
          keys: 'true',
        },
        log: mockLog,
      });
      const passwordRoutes = makeRoutes({
        config: {
          domain: 'wibble',
          smtp: {},
          passwordForgotOtp: { digits: 8 },
        },
        db: mockDB,
        push: mockPush,
        mailer: mockMailer,
        log: mockLog,
      });

      return runRoute(
        passwordRoutes,
        '/password/change/finish',
        mockRequest
      ).then((response: any) => {
        expect(mockDB.deletePasswordChangeToken).toHaveBeenCalledTimes(1);
        expect(mockDB.resetAccount).toHaveBeenCalledTimes(1);
        expect(mockDB.resetAccount.mock.calls[0][2]).toBe(undefined);

        expect(mockPush.notifyPasswordChanged).toHaveBeenCalledTimes(1);
        expect(mockPush.notifyPasswordChanged).toHaveBeenNthCalledWith(
          1,
          uid,
          expect.anything()
        );

        const notifyArgs = mockLog.notifyAttachedServices.mock.calls[0];
        expect(notifyArgs.length).toBe(3);
        expect(notifyArgs[0]).toBe('passwordChange');
        expect(notifyArgs[1]).toBe(mockRequest);
        expect(notifyArgs[2].uid).toBe(uid);

        expect(mockDB.account).toHaveBeenCalledTimes(1);
        expect(mockFxaMailer.sendPasswordChangedEmail).toHaveBeenCalledTimes(1);

        expect(mockLog.activityEvent).toHaveBeenCalledTimes(1);
        expect(mockLog.activityEvent).toHaveBeenNthCalledWith(1, {
          country: 'United States',
          event: 'account.changedPassword',
          region: 'California',
          service: undefined,
          uid: uid.toString('hex'),
          userAgent: 'test user-agent',
          sigsciRequestId: 'test-sigsci-id',
          clientJa4: 'test-ja4',
        });
      });
    });

    it('upgrades to v2', async () => {
      const uid = uuid.v4({}, Buffer.alloc(16)).toString('hex');
      const mockDB = mocks.mockDB({
        email: TEST_EMAIL,
        uid,
        // Signals that v1 password has not changed, and we have
        // a password upgrade scenario
        isPasswordMatchV1: true,
      });
      const mockPush = mocks.mockPush();
      const mockMailer = {
        sendPasswordChangedEmail: jest.fn(() => {
          return Promise.resolve();
        }),
      };
      const mockLog = mocks.mockLog();
      const mockRequest = mocks.mockRequest({
        credentials: {
          uid: uid,
        },
        payload: {
          authPW: crypto.randomBytes(32).toString('hex'),
          wrapKb: crypto.randomBytes(32).toString('hex'),
          authPWVersion2: crypto.randomBytes(32).toString('hex'),
          wrapKbVersion2: crypto.randomBytes(32).toString('hex'),
          clientSalt:
            'identity.mozilla.com/picl/v1/quickStretchV2:0123456789abcdef0123456789abcdef',
          sessionToken: crypto.randomBytes(32).toString('hex'),
        },
        query: {
          keys: 'true',
        },
        log: mockLog,
      });

      const passwordRoutes = makeRoutes({
        config: {
          domain: 'wibble',
          smtp: {},
          passwordForgotOtp: { digits: 8 },
        },
        db: mockDB,
        push: mockPush,
        mailer: mockMailer,
        log: mockLog,
      });

      return runRoute(
        passwordRoutes,
        '/password/change/finish',
        mockRequest
      ).then((response: any) => {
        expect(mockDB.deletePasswordChangeToken).toHaveBeenCalledTimes(1);
        expect(mockDB.resetAccount).toHaveBeenCalledTimes(1);
        expect(mockDB.resetAccount.mock.calls[0][2]).toBe(true);

        // Notifications should not go out since we are just upgrading the account.
        // In this case, the raw password value would still be the same.
        expect(mockPush.notifyPasswordChanged).toHaveBeenCalledTimes(0);
        expect(mockLog.notifyAttachedServices).toHaveBeenCalledTimes(0);
        expect(mockMailer.sendPasswordChangedEmail).toHaveBeenCalledTimes(0);
        expect(mockLog.activityEvent).toHaveBeenCalledTimes(0);
      });
    });
  });

  describe('/password/create', () => {
    let mockRequest: any,
      passwordRoutes: any,
      mockDB: any,
      uid: any,
      mockMailer: any;

    beforeEach(async () => {
      uid = uuid.v4({}, Buffer.alloc(16)).toString('hex');
      mockDB = mocks.mockDB({
        uid,
        email: TEST_EMAIL,
        verifierSetAt: 0,
      });
      mockMailer = mocks.mockMailer();
      const mockLog = mocks.mockLog();
      const authPW = await random.hex(32);
      passwordRoutes = makeRoutes({
        db: mockDB,
        mailer: mockMailer,
      });

      mockRequest = mocks.mockRequest({
        log: mockLog,
        credentials: {
          email: TEST_EMAIL,
          uid,
        },
        payload: {
          authPW,
        },
      });
    });

    it('should create password', async () => {
      const res = await runRoute(
        passwordRoutes,
        '/password/create',
        mockRequest
      );
      expect(mockDB.account).toHaveBeenCalledTimes(1);
      expect(mockDB.createPassword).toHaveBeenCalledTimes(1);
      expect(res).toEqual(1584397692000);

      expect(mockAccountEventsManager.recordSecurityEvent).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          name: 'account.password_added',
          ipAddr: '63.245.221.32',
          uid: mockRequest.auth.credentials.uid,
          tokenId: mockRequest.auth.credentials.id,
        })
      );
    });

    it('should fail if password already created', async () => {
      mockDB = mocks.mockDB({
        uid,
        email: TEST_EMAIL,
        verifierSetAt: Date.now(),
      });
      passwordRoutes = makeRoutes({
        db: mockDB,
        mailer: mockMailer,
      });

      try {
        await runRoute(passwordRoutes, '/password/create', mockRequest);
        throw new Error('should not set password');
      } catch (err: any) {
        expect(err.errno).toBe(206);
      }
    });

    it('should succeed if in totp verified session', async () => {
      mockDB.totpToken = jest.fn(() => {
        return {
          verified: true,
          enabled: true,
        };
      });
      mockDB.getLinkedAccounts = jest.fn(() => {
        return Promise.resolve([{ enabled: true }]);
      });
      passwordRoutes = makeRoutes({
        db: mockDB,
        mailer: mockMailer,
      });
      mockRequest.auth.credentials.authenticatorAssuranceLevel = 2;
      const res = await runRoute(
        passwordRoutes,
        '/password/create',
        mockRequest
      );
      expect(mockDB.account).toHaveBeenCalledTimes(1);
      expect(mockDB.createPassword).toHaveBeenCalledTimes(1);
      expect(mockDB.getLinkedAccounts).toHaveBeenCalledTimes(1);
      expect(glean.thirdPartyAuth.setPasswordComplete).toHaveBeenCalledTimes(1);
      expect(res).toEqual(1584397692000);
    });
  });

  describe('/mfa/password/change', () => {
    let mockDB: any,
      mockMailer: any,
      mockPush: any,
      mockLog: any,
      mockStatsd: any,
      mockCustoms: any,
      uid: any;

    beforeEach(() => {
      uid = uuid.v4({}, Buffer.alloc(16)).toString('hex');
      mockDB = mocks.mockDB({
        email: TEST_EMAIL,
        uid,
        emailVerified: true,
        isPasswordMatchV1: true, // Enable password verification for tests
        devices: [
          { uid, id: crypto.randomBytes(16) },
          { uid, id: crypto.randomBytes(16) },
        ],
      });
      mockMailer = mocks.mockMailer();
      mockPush = mocks.mockPush();
      mockLog = mocks.mockLog();
      mockStatsd = mocks.mockStatsd();
      mockCustoms = mocks.mockCustoms();
    });

    it('should successfully change password with JWT authentication and V1 creds', async () => {
      const oldAuthPW = crypto.randomBytes(32).toString('hex');
      const authPW = crypto.randomBytes(32).toString('hex');
      const wrapKb = crypto.randomBytes(32).toString('hex');

      const mockRequest = mocks.mockRequest({
        log: mockLog,
        auth: {
          credentials: {
            uid,
            email: TEST_EMAIL,
            emailVerified: true,
            tokenVerified: true,
            deviceId: crypto.randomBytes(16).toString('hex'),
            authenticatorAssuranceLevel: 2,
            lastAuthAt: () => Date.now(),
            data: crypto.randomBytes(32).toString('hex'),
          },
        },
        payload: {
          email: TEST_EMAIL,
          oldAuthPW,
          authPW,
          wrapKb,
        },
        query: { keys: 'true' },
        uaBrowser: 'Firefox',
        uaBrowserVersion: '57',
        uaOS: 'Mac OS X',
        uaOSVersion: '10.11',
      });

      const passwordRoutes = makeRoutes({
        db: mockDB,
        mailer: mockMailer,
        push: mockPush,
        log: mockLog,
        statsd: mockStatsd,
        customs: mockCustoms,
      });

      const response = await runRoute(
        passwordRoutes,
        '/mfa/password/change',
        mockRequest
      );

      expect(response.uid).toBeTruthy();
      expect(response.sessionToken).toBeTruthy();
      expect(response.verified).toBeTruthy();
      expect(response.authAt).toBeTruthy();
      expect(response.keyFetchToken).toBeTruthy();

      // Verify database calls
      expect(mockDB.account).toHaveBeenCalledTimes(1);
      expect(mockDB.resetAccount).toHaveBeenCalledTimes(1);
      expect(mockDB.resetAccount).toHaveBeenCalledWith(
        expect.objectContaining({ uid }),
        expect.anything()
      );

      // Verify key fetch tokens are created and returned
      expect(mockDB.createKeyFetchToken).toHaveBeenCalledTimes(1);

      // Verify session token creation
      expect(mockDB.createSessionToken).toHaveBeenCalledTimes(1);

      // Verify notifications
      expect(mockPush.notifyPasswordChanged).toHaveBeenCalledTimes(1);
      expect(mockFxaMailer.sendPasswordChangedEmail).toHaveBeenCalledTimes(1);

      // Verify security events
      expect(mockAccountEventsManager.recordSecurityEvent).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          name: 'account.password_changed',
          ipAddr: '63.245.221.32',
          uid,
        })
      );

      expect(mockAccountEventsManager.recordSecurityEvent).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          name: 'account.password_reset_success',
          ipAddr: '63.245.221.32',
          uid,
        })
      );
    });

    it('should successfully change password with JWT authentication and V2 creds', async () => {
      const oldAuthPW = crypto.randomBytes(32).toString('hex');
      const authPW = crypto.randomBytes(32).toString('hex');
      const authPWVersion2 = crypto.randomBytes(32).toString('hex');
      const wrapKb = crypto.randomBytes(32).toString('hex');
      const wrapKbVersion2 = crypto.randomBytes(32).toString('hex');
      const clientSalt =
        'identity.mozilla.com/picl/v1/quickStretchV2:0123456789abcdef0123456789abcdef';

      const mockRequest = mocks.mockRequest({
        log: mockLog,
        auth: {
          strategy: 'mfa',
          credentials: {
            uid,
            email: TEST_EMAIL,
            emailVerified: true,
            tokenVerified: true,
            authenticatorAssuranceLevel: 2,
            lastAuthAt: () => Date.now(),
            data: crypto.randomBytes(32).toString('hex'),
          },
        },
        payload: {
          email: TEST_EMAIL,
          oldAuthPW,
          authPW,
          authPWVersion2,
          wrapKb,
          wrapKbVersion2,
          clientSalt,
        },
        query: { keys: 'true' },
      });

      const passwordRoutes = makeRoutes({
        db: mockDB,
        mailer: mockMailer,
        push: mockPush,
        log: mockLog,
        customs: mockCustoms,
      });

      const response = await runRoute(
        passwordRoutes,
        '/mfa/password/change',
        mockRequest
      );

      // Verify V2 credentials are handled
      const resetAccountCall = mockDB.resetAccount.mock.calls[0][1];
      expect(resetAccountCall.verifyHashVersion2).toBeTruthy();
      expect(resetAccountCall.wrapWrapKbVersion2).toBeTruthy();
      expect(resetAccountCall.clientSalt).toBe(clientSalt);

      expect(response.sessionToken).toBeTruthy();
      expect(response.keyFetchToken).toBeTruthy();
    });

    it('should handle password upgrade scenario', async () => {
      const oldAuthPW = crypto.randomBytes(32).toString('hex');
      const authPW = crypto.randomBytes(32).toString('hex');
      const authPWVersion2 = crypto.randomBytes(32).toString('hex');
      const wrapKb = crypto.randomBytes(32).toString('hex');
      const wrapKbVersion2 = crypto.randomBytes(32).toString('hex');
      const clientSalt =
        'identity.mozilla.com/picl/v1/quickStretchV2:0123456789abcdef0123456789abcdef';

      mockDB.account = jest.fn(() => ({
        uid,
        email: TEST_EMAIL,
        authSalt: crypto.randomBytes(32).toString('hex'),
        verifierVersion: 0,
        verifyHash: crypto.randomBytes(32).toString('hex'),
        wrapWrapKb: crypto.randomBytes(32).toString('hex'),
      }));

      // Mock signinUtils.checkPassword to return true for upgrade scenario
      mockDB.checkPassword = jest.fn(() =>
        Promise.resolve({ v1: true, v2: false })
      );

      const passwordRoutes = makeRoutes({
        db: mockDB,
        mailer: mockMailer,
        push: mockPush,
        log: mockLog,
        customs: mockCustoms,
      });

      const mockRequest = mocks.mockRequest({
        log: mockLog,
        auth: {
          strategy: 'mfa',
          credentials: {
            uid,
            email: TEST_EMAIL,
            emailVerified: true,
            tokenVerified: true,
            authenticatorAssuranceLevel: 2,
            lastAuthAt: () => Date.now(),
            data: crypto.randomBytes(32).toString('hex'),
          },
        },
        payload: {
          email: TEST_EMAIL,
          oldAuthPW,
          authPW,
          authPWVersion2,
          wrapKb,
          wrapKbVersion2,
          clientSalt,
        },
        query: {},
      });

      const response = await runRoute(
        passwordRoutes,
        '/mfa/password/change',
        mockRequest
      );

      // Verify upgrade scenario is handled
      expect(mockDB.resetAccount.mock.calls[0][2]).toBe(true); // isPasswordUpgrade flag

      // Notifications should be skipped during password upgrade
      expect(mockPush.notifyPasswordChanged).not.toHaveBeenCalled();
      expect(mockMailer.sendPasswordChangedEmail).not.toHaveBeenCalled();

      expect(response.sessionToken).toBeTruthy();
      expect(response.keyFetchToken).toBeFalsy();
    });

    it('should include sessionVerified in the response reflecting token verification status', async () => {
      const oldAuthPW = crypto.randomBytes(32).toString('hex');
      const authPW = crypto.randomBytes(32).toString('hex');
      const wrapKb = crypto.randomBytes(32).toString('hex');

      const mockRequest = mocks.mockRequest({
        log: mockLog,
        auth: {
          credentials: {
            uid,
            email: TEST_EMAIL,
            emailVerified: true,
            tokenVerified: true,
            deviceId: crypto.randomBytes(16).toString('hex'),
            authenticatorAssuranceLevel: 2,
            lastAuthAt: () => Date.now(),
            data: crypto.randomBytes(32).toString('hex'),
          },
        },
        payload: {
          email: TEST_EMAIL,
          oldAuthPW,
          authPW,
          wrapKb,
        },
        query: {},
      });

      const passwordRoutes = makeRoutes({
        db: mockDB,
        mailer: mockMailer,
        push: mockPush,
        log: mockLog,
        statsd: mockStatsd,
        customs: mockCustoms,
      });

      const response = await runRoute(
        passwordRoutes,
        '/mfa/password/change',
        mockRequest
      );

      // sessionVerified must be present so that client-side storage correctly
      // reflects the verified session after a password change.
      expect(response.sessionVerified).toBe(true);

      // verified (deprecated compat field) should remain present and consistent
      expect(response.verified).toBe(true);
    });
  });
});
