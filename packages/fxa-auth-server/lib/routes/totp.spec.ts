/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Container } from 'typedi';
import { AppError as authErrors } from '@fxa/accounts/errors';
import { RecoveryPhoneService } from '@fxa/accounts/recovery-phone';
import { BackupCodeManager } from '@fxa/accounts/two-factor';
import crypto from 'crypto';

const otplib = require('otplib');

const mocks = require('../../test/mocks');
const getRoute = require('../../test/routes_helpers').getRoute;
const { AccountEventsManager } = require('../account-events');

let log: any,
  db: any,
  customs: any,
  routes: any,
  route: any,
  request: any,
  requestOptions: any,
  mailer: any,
  fxaMailer: any,
  profile: any,
  accountEventsManager: any,
  authServerCacheRedis: any;

const glean = mocks.mockGlean();
const mockRecoveryPhoneService = {
  hasConfirmed: jest.fn(),
  removePhoneNumber: jest.fn().mockResolvedValue(true),
};
const mockBackupCodeManager = {
  deleteRecoveryCodes: jest.fn().mockResolvedValue(true),
};

const TEST_EMAIL = 'test@email.com';
const secret = 'KE3TGQTRNIYFO2KOPE4G6ULBOV2FQQTN';
const sessionId = 'id';

function setup(results: any, errors: any, routePath: string, reqOpts: any) {
  results = results || {};
  errors = errors || {};
  log = mocks.mockLog();
  customs = mocks.mockCustoms(errors.customs);
  mailer = mocks.mockMailer();
  db = mocks.mockDB(results.db, errors.db);
  authServerCacheRedis = {
    set: jest.fn(),
    get: jest.fn((key: any) => {
      if (results.redis) {
        if (key && key.includes(':secret:')) {
          return Promise.resolve(results.redis.secret || null);
        }
        if (key && key.includes(':verified:')) {
          return Promise.resolve(results.redis.verifiedDigest || null);
        }
      }
      return Promise.resolve(results.redis ? results.redis.secret : null);
    }),
    del: jest.fn(),
  };

  profile = mocks.mockProfile();
  db.consumeRecoveryCode = jest.fn(() => {
    if (errors.consumeRecoveryCode) {
      return Promise.reject(authErrors.recoveryCodeNotFound());
    }
    return Promise.resolve({
      remaining: reqOpts.remaining || 2,
    });
  });
  db.createTotpToken = jest.fn(() => {
    return Promise.resolve({
      qrCodeUrl: 'some base64 encoded png',
      sharedSecret: secret,
    });
  });
  db.verifyTokensWithMethod = jest.fn(() => {
    return Promise.resolve();
  });
  db.totpToken = jest.fn(() => {
    return Promise.resolve({
      verified: results?.totpTokenVerified || false,
      enabled: results?.totpTokenEnabled || false,
      sharedSecret:
        results.totpTokenVerified && results.totpTokenEnabled
          ? secret
          : undefined,
    });
  });
  db.replaceTotpToken = jest.fn(() => {
    if (errors.replaceTotpToken) {
      return Promise.reject('Error replacing TOTP token');
    }
    return Promise.resolve();
  });
  const statsd = mocks.mockStatsd();
  routes = makeRoutes({
    log,
    db,
    customs,
    mailer,
    glean,
    profile,
    authServerCacheRedis,
    statsd,
  });
  route = getRoute(routes, routePath);
  request = mocks.mockRequest(reqOpts);
  request.emitMetricsEvent = jest.fn(() => Promise.resolve({}));

  return route.handler(request);
}

function makeRoutes(options: any = {}) {
  const config = {
    step: 30,
    window: 1,
    recoveryCodes: {
      notifyLowCount: 1,
    },
  };
  Container.set(AccountEventsManager, accountEventsManager);
  const {
    log,
    db,
    customs,
    mailer,
    glean,
    profile,
    authServerCacheRedis,
    statsd,
  } = options;
  return require('./totp')(
    log,
    db,
    mailer,
    customs,
    config,
    glean,
    profile,
    undefined,
    authServerCacheRedis,
    statsd
  );
}

describe('totp', () => {
  beforeEach(() => {
    requestOptions = {
      metricsContext: mocks.mockMetricsContext(),
      credentials: {
        uid: 'uid',
        email: TEST_EMAIL,
        authenticatorAssuranceLevel: 1,
        id: sessionId,
      },
      log: log,
      payload: {
        metricsContext: {
          flowBeginTime: Date.now(),
          flowId:
            '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',
        },
      },
    };
    accountEventsManager = {
      recordSecurityEvent: jest.fn().mockResolvedValue({}),
    };

    mocks.mockOAuthClientInfo();
    fxaMailer = mocks.mockFxaMailer();

    Container.set(RecoveryPhoneService, mockRecoveryPhoneService);
    Container.set(BackupCodeManager, mockBackupCodeManager);

    glean.twoStepAuthRemove.success.mockClear();
  });

  afterAll(() => {
    Container.reset();
  });

  describe('/totp/create', () => {
    it('should create TOTP token', () => {
      return setup(
        { db: { email: TEST_EMAIL, emailVerified: true } },
        {},
        '/totp/create',
        requestOptions
      ).then((response: any) => {
        expect(response.qrCodeUrl).toBeTruthy();
        expect(response.secret).toBeTruthy();
        expect(authServerCacheRedis.set).toHaveBeenCalledTimes(1);

        // emits correct metrics
        expect(request.emitMetricsEvent).toHaveBeenCalledTimes(1);
        expect(request.emitMetricsEvent).toHaveBeenNthCalledWith(
          1,
          'totpToken.created',
          expect.objectContaining({ uid: 'uid' })
        );
      });
    });
  });

  describe('/totp/exists', () => {
    it('should check for TOTP token', () => {
      return setup(
        { db: { email: TEST_EMAIL } },
        {},
        '/totp/exists',
        requestOptions
      ).then((response: any) => {
        expect(response).toBeTruthy();
        expect(db.totpToken).toHaveBeenCalledTimes(1);
      });
    });
  });

  // Note: this endpoint only verifies sessions; setup flow is covered by /totp/setup/* tests.
  describe('/session/verify/totp', () => {
    afterEach(() => {
      glean.login.totpSuccess.mockClear();
      glean.login.totpFailure.mockClear();
    });

    it('should verify session with TOTP token - sync', () => {
      const authenticator = new otplib.authenticator.Authenticator();
      authenticator.options = Object.assign({}, otplib.authenticator.options, {
        secret,
      });
      requestOptions.payload = {
        code: authenticator.generate(secret),
        service: 'sync',
      };

      return setup(
        {
          db: { email: TEST_EMAIL },
          totpTokenVerified: true,
          totpTokenEnabled: true,
        },
        {},
        '/session/verify/totp',
        requestOptions
      ).then((response: any) => {
        expect(response.success).toBe(true);
        expect(db.totpToken).toHaveBeenCalledTimes(1);
        expect(db.updateTotpToken).toHaveBeenCalledTimes(0);

        expect(log.notifyAttachedServices).toHaveBeenCalledTimes(0);

        // verifies session
        expect(db.verifyTokensWithMethod).toHaveBeenCalledTimes(1);
        expect(db.verifyTokensWithMethod).toHaveBeenNthCalledWith(
          1,
          sessionId,
          'totp-2fa'
        );

        // emits correct metrics
        expect(request.emitMetricsEvent).toHaveBeenCalledTimes(2);
        expect(request.emitMetricsEvent).toHaveBeenCalledWith(
          'totpToken.verified',
          { uid: 'uid' }
        );
        expect(request.emitMetricsEvent).toHaveBeenCalledWith(
          'account.confirmed',
          {
            uid: 'uid',
          }
        );

        // correct emails sent
        expect(fxaMailer.sendNewDeviceLoginEmail).toHaveBeenCalledTimes(1);
        expect(
          fxaMailer.sendPostAddTwoStepAuthenticationEmail
        ).toHaveBeenCalledTimes(0);

        expect(accountEventsManager.recordSecurityEvent).toHaveBeenCalledTimes(
          1
        );
        expect(accountEventsManager.recordSecurityEvent).toHaveBeenCalledWith(
          db,
          {
            name: 'account.two_factor_challenge_success',
            uid: 'uid',
            ipAddr: '63.245.221.32',
            tokenId: 'id',
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
          }
        );

        expect(glean.login.totpSuccess).toHaveBeenCalledTimes(1);
      });
    });

    it('should verify session with TOTP token - non sync', () => {
      const authenticator = new otplib.authenticator.Authenticator();
      authenticator.options = Object.assign({}, otplib.authenticator.options, {
        secret,
      });
      requestOptions.payload = {
        code: authenticator.generate(secret),
        service: 'not sync',
      };
      return setup(
        {
          db: { email: TEST_EMAIL },
          totpTokenVerified: true,
          totpTokenEnabled: true,
        },
        {},
        '/session/verify/totp',
        requestOptions
      ).then((response: any) => {
        expect(response.success).toBe(true);
        expect(db.totpToken).toHaveBeenCalledTimes(1);
        expect(db.updateTotpToken).toHaveBeenCalledTimes(0);

        expect(log.notifyAttachedServices).toHaveBeenCalledTimes(0);

        // verifies session
        expect(db.verifyTokensWithMethod).toHaveBeenCalledTimes(1);
        expect(db.verifyTokensWithMethod).toHaveBeenNthCalledWith(
          1,
          sessionId,
          'totp-2fa'
        );

        // emits correct metrics
        expect(request.emitMetricsEvent).toHaveBeenCalledTimes(2);
        expect(request.emitMetricsEvent).toHaveBeenCalledWith(
          'totpToken.verified',
          { uid: 'uid' }
        );
        expect(request.emitMetricsEvent).toHaveBeenCalledWith(
          'account.confirmed',
          {
            uid: 'uid',
          }
        );

        // correct emails sent
        expect(fxaMailer.sendNewDeviceLoginEmail).toHaveBeenCalledTimes(1);
        expect(
          fxaMailer.sendPostAddTwoStepAuthenticationEmail
        ).toHaveBeenCalledTimes(0);
      });
    });

    it('should return false for invalid TOTP code', () => {
      requestOptions.payload = {
        code: 'NOTVALID',
      };
      return setup(
        {
          db: { email: TEST_EMAIL },
          totpTokenVerified: true,
          totpTokenEnabled: true,
        },
        {},
        '/session/verify/totp',
        requestOptions
      ).then((response: any) => {
        expect(response.success).toBe(false);
        expect(db.totpToken).toHaveBeenCalledTimes(1);

        // emits correct metrics
        expect(request.emitMetricsEvent).toHaveBeenCalledTimes(1);
        expect(request.emitMetricsEvent).toHaveBeenNthCalledWith(
          1,
          'totpToken.unverified',
          expect.objectContaining({ uid: 'uid' })
        );

        // correct emails sent
        expect(fxaMailer.sendNewDeviceLoginEmail).toHaveBeenCalledTimes(0);
        expect(
          fxaMailer.sendPostAddTwoStepAuthenticationEmail
        ).toHaveBeenCalledTimes(0);

        expect(accountEventsManager.recordSecurityEvent).toHaveBeenCalledTimes(
          1
        );
        expect(accountEventsManager.recordSecurityEvent).toHaveBeenCalledWith(
          db,
          {
            name: 'account.two_factor_challenge_failure',
            uid: 'uid',
            ipAddr: '63.245.221.32',
            tokenId: 'id',
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
          }
        );

        expect(glean.login.totpFailure).toHaveBeenCalledTimes(1);
      });
    });
  });

  // This endpoint is used for code verification during TOTP setup only
  describe('/totp/setup/verify', () => {
    beforeEach(() => {
      glean.twoFactorAuth.setupVerifySuccess.mockClear();
      glean.twoFactorAuth.setupInvalidCodeError.mockClear();
    });

    it('should verify a valid totp code', async () => {
      requestOptions.credentials.tokenVerified = true;
      const authenticator = new otplib.authenticator.Authenticator();
      authenticator.options = Object.assign({}, otplib.authenticator.options, {
        secret,
      });
      requestOptions.payload = {
        code: authenticator.generate(secret),
      };

      const response = await setup(
        { db: { email: TEST_EMAIL, emailVerified: true }, redis: { secret } },
        {},
        '/totp/setup/verify',
        requestOptions
      );
      expect(response.success).toBe(true);
      // Confirm we touched Redis to set both secret and verified digest
      expect(authServerCacheRedis.set).toHaveBeenCalledTimes(2);
      expect(glean.twoFactorAuth.setupVerifySuccess).toHaveBeenCalledTimes(1);
      expect(customs.checkAuthenticated).toHaveBeenCalledTimes(1);
      expect(customs.checkAuthenticated).toHaveBeenCalledWith(
        request,
        'uid',
        TEST_EMAIL,
        'verifyTotpCode'
      );
    });

    it('should fail for an invalid totp code', async () => {
      requestOptions.credentials.tokenVerified = true;
      requestOptions.payload = {
        code: '123123',
      };

      try {
        await setup(
          { db: { email: TEST_EMAIL, emailVerified: true }, redis: { secret } },
          {},
          '/totp/setup/verify',
          requestOptions
        );
        throw new Error('Expected invalid code error');
      } catch (err: any) {
        expect(err.errno).toBe(
          authErrors.ERRNO.INVALID_TOKEN_VERIFICATION_CODE
        );
        expect(authServerCacheRedis.set).toHaveBeenCalledTimes(0);
        expect(glean.twoFactorAuth.setupInvalidCodeError).toHaveBeenCalledTimes(
          1
        );
      }
    });

    it('should fail for a missing secret', async () => {
      requestOptions.credentials.tokenVerified = true;
      requestOptions.payload = { code: '123123' };
      await expect(
        setup(
          { db: { email: TEST_EMAIL, emailVerified: true } },
          {},
          '/totp/setup/verify',
          requestOptions
        )
      ).rejects.toMatchObject({ errno: authErrors.ERRNO.TOTP_TOKEN_NOT_FOUND });
    });
  });

  describe('/totp/setup/complete', () => {
    beforeEach(() => {
      glean.twoFactorAuth.codeComplete.mockClear();
    });

    it('should complete the setup process', async () => {
      requestOptions.credentials.tokenVerified = true;
      const verifiedDigest = crypto
        .createHash('sha256')
        .update(secret)
        .digest('hex');
      const response = await setup(
        {
          db: { email: TEST_EMAIL, emailVerified: true },
          redis: { secret, verifiedDigest },
        },
        {},
        '/totp/setup/complete',
        requestOptions
      );
      expect(response.success).toBe(true);
      expect(db.replaceTotpToken).toHaveBeenCalledTimes(1);
      expect(db.verifyTokensWithMethod).toHaveBeenCalledTimes(1);
      expect(authServerCacheRedis.del).toHaveBeenCalledTimes(2);
      expect(profile.deleteCache).toHaveBeenCalledTimes(1);
      expect(log.notifyAttachedServices).toHaveBeenCalledTimes(1);
      expect(glean.twoFactorAuth.codeComplete).toHaveBeenCalledTimes(1);
      expect(
        fxaMailer.sendPostAddTwoStepAuthenticationEmail
      ).toHaveBeenCalledTimes(1);
    });

    it('should fail for a missing secret', async () => {
      requestOptions.credentials.tokenVerified = true;
      await expect(
        setup(
          { db: { email: TEST_EMAIL, emailVerified: true } },
          {},
          '/totp/setup/complete',
          requestOptions
        )
      ).rejects.toMatchObject({ errno: authErrors.ERRNO.TOTP_TOKEN_NOT_FOUND });
    });

    it('should fail if setup not verified', async () => {
      requestOptions.credentials.tokenVerified = true;
      const responsePromise = setup(
        {
          db: { email: TEST_EMAIL, emailVerified: true },
          redis: { secret, verifiedDigest: 'mismatch' },
        },
        {},
        '/totp/setup/complete',
        requestOptions
      );
      await expect(responsePromise).rejects.toThrow(
        authErrors.invalidTokenVerficationCode().message
      );
    });
  });

  // This endpoint is used for password reset only
  describe('/totp/verify', () => {
    it('should verify a valid totp code', async () => {
      const authenticator = new otplib.authenticator.Authenticator();
      authenticator.options = Object.assign({}, otplib.authenticator.options, {
        secret,
      });
      requestOptions.payload = {
        code: authenticator.generate(secret),
      };
      const response = await setup(
        {
          db: { email: TEST_EMAIL },
          totpTokenVerified: true,
          totpTokenEnabled: true,
        },
        {},
        '/totp/verify',
        requestOptions
      );

      expect(glean.resetPassword.twoFactorSuccess).toHaveBeenCalledTimes(1);
      expect(response.success).toBe(true);
      expect(db.totpToken).toHaveBeenCalledTimes(1);
      expect(db.totpToken).toHaveBeenCalledWith('uid');
      expect(customs.checkAuthenticated).toHaveBeenCalledTimes(1);
      expect(customs.checkAuthenticated).toHaveBeenCalledWith(
        request,
        'uid',
        TEST_EMAIL,
        'verifyTotpCode'
      );
    });

    it('should fail for a invalid totp code', async () => {
      requestOptions.payload = {
        code: '123123',
      };
      const response = await setup(
        {
          db: { email: TEST_EMAIL },
          totpTokenVerified: true,
          totpTokenEnabled: true,
        },
        {},
        '/totp/verify',
        requestOptions
      );

      expect(response.success).toBe(false);
      expect(db.totpToken).toHaveBeenCalledTimes(1);
      expect(db.totpToken).toHaveBeenCalledWith('uid');
      expect(customs.checkAuthenticated).toHaveBeenCalledTimes(1);
      expect(customs.checkAuthenticated).toHaveBeenCalledWith(
        request,
        'uid',
        TEST_EMAIL,
        'verifyTotpCode'
      );
    });
  });

  describe('/totp/verify/recoveryCode', () => {
    it('should verify recovery code', async () => {
      requestOptions.payload.code = '1234567890';
      requestOptions.credentials = {
        uid: 'uid',
        email: TEST_EMAIL,
      };
      const response = await setup(
        { db: { email: TEST_EMAIL } },
        {},
        '/totp/verify/recoveryCode',
        requestOptions
      );

      expect(
        glean.resetPassword.twoFactorRecoveryCodeSuccess
      ).toHaveBeenCalledTimes(1);

      expect(fxaMailer.sendPostConsumeRecoveryCodeEmail).toHaveBeenCalledTimes(
        1
      );
      expect(fxaMailer.sendLowRecoveryCodesEmail).not.toHaveBeenCalled();

      expect(response.remaining).toBe(2);
      expect(db.consumeRecoveryCode).toHaveBeenCalledTimes(1);
      expect(db.consumeRecoveryCode).toHaveBeenCalledWith('uid', '1234567890');
      expect(customs.checkAuthenticated).toHaveBeenCalledTimes(1);
      expect(customs.checkAuthenticated).toHaveBeenCalledWith(
        request,
        'uid',
        TEST_EMAIL,
        'verifyRecoveryCode'
      );
    });

    it('should fail for invalid recovery code', async () => {
      requestOptions.payload.code = '1234567890';
      await expect(
        setup(
          { db: { email: TEST_EMAIL } },
          { consumeRecoveryCode: true },
          '/totp/verify/recoveryCode',
          requestOptions
        )
      ).rejects.toMatchObject({
        errno: 156,
        message: 'Backup authentication code not found.',
      });
    });

    it('sends low recovery codes email', async () => {
      requestOptions.payload.code = '1234567890';
      requestOptions.credentials = {
        uid: 'uid',
        email: TEST_EMAIL,
      };
      requestOptions.remaining = 1;
      const response = await setup(
        { db: { email: TEST_EMAIL } },
        {},
        '/totp/verify/recoveryCode',
        requestOptions
      );

      expect(fxaMailer.sendLowRecoveryCodesEmail).toHaveBeenCalledTimes(1);
      expect(response.remaining).toBe(1);
      expect(db.consumeRecoveryCode).toHaveBeenCalledTimes(1);
      expect(db.consumeRecoveryCode).toHaveBeenCalledWith('uid', '1234567890');
    });
  });
});
