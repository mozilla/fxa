/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/** Migrated from test/local/routes/totp.js (Mocha → Jest). */

import sinon from 'sinon';
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
  hasConfirmed: sinon.fake(),
  removePhoneNumber: sinon.fake.resolves(true),
};
const mockBackupCodeManager = {
  deleteRecoveryCodes: sinon.fake.resolves(true),
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
    set: sinon.stub(),
    get: sinon.stub((key: any) => {
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
    del: sinon.stub(),
  };

  profile = mocks.mockProfile();
  db.consumeRecoveryCode = sinon.spy(() => {
    if (errors.consumeRecoveryCode) {
      return Promise.reject(authErrors.recoveryCodeNotFound());
    }
    return Promise.resolve({
      remaining: reqOpts.remaining || 2,
    });
  });
  db.createTotpToken = sinon.spy(() => {
    return Promise.resolve({
      qrCodeUrl: 'some base64 encoded png',
      sharedSecret: secret,
    });
  });
  db.verifyTokensWithMethod = sinon.spy(() => {
    return Promise.resolve();
  });
  db.totpToken = sinon.spy(() => {
    return Promise.resolve({
      verified: results?.totpTokenVerified || false,
      enabled: results?.totpTokenEnabled || false,
      sharedSecret:
        results.totpTokenVerified && results.totpTokenEnabled
          ? secret
          : undefined,
    });
  });
  db.replaceTotpToken = sinon.spy(() => {
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
  request.emitMetricsEvent = sinon.spy(() => Promise.resolve({}));

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
      recordSecurityEvent: sinon.fake.resolves({}),
    };

    mocks.mockOAuthClientInfo();
    fxaMailer = mocks.mockFxaMailer();

    Container.set(RecoveryPhoneService, mockRecoveryPhoneService);
    Container.set(BackupCodeManager, mockBackupCodeManager);

    glean.twoStepAuthRemove.success.reset();
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
        expect(authServerCacheRedis.set.callCount).toBe(1);

        // emits correct metrics
        expect(request.emitMetricsEvent.callCount).toBe(1);
        const args = request.emitMetricsEvent.args[0];
        expect(args[0]).toBe('totpToken.created');
        expect(args[1]['uid']).toBe('uid');
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
        expect(db.totpToken.callCount).toBe(1);
      });
    });
  });

  // Note: this endpoint only verifies sessions; setup flow is covered by /totp/setup/* tests.
  describe('/session/verify/totp', () => {
    afterEach(() => {
      glean.login.totpSuccess.reset();
      glean.login.totpFailure.reset();
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
        expect(db.totpToken.callCount).toBe(1);
        expect(db.updateTotpToken.callCount).toBe(0);

        expect(log.notifyAttachedServices.callCount).toBe(0);

        // verifies session
        expect(db.verifyTokensWithMethod.callCount).toBe(1);
        const args = db.verifyTokensWithMethod.args[0];
        expect(args[0]).toBe(sessionId);
        expect(args[1]).toBe('totp-2fa');

        // emits correct metrics
        sinon.assert.calledTwice(request.emitMetricsEvent);
        sinon.assert.calledWith(
          request.emitMetricsEvent,
          'totpToken.verified',
          { uid: 'uid' }
        );
        sinon.assert.calledWith(
          request.emitMetricsEvent,
          'account.confirmed',
          { uid: 'uid' }
        );

        // correct emails sent
        expect(fxaMailer.sendNewDeviceLoginEmail.callCount).toBe(1);
        expect(
          fxaMailer.sendPostAddTwoStepAuthenticationEmail.callCount
        ).toBe(0);

        sinon.assert.calledOnceWithExactly(
          accountEventsManager.recordSecurityEvent,
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

        sinon.assert.calledOnce(glean.login.totpSuccess);
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
        expect(db.totpToken.callCount).toBe(1);
        expect(db.updateTotpToken.callCount).toBe(0);

        expect(log.notifyAttachedServices.callCount).toBe(0);

        // verifies session
        expect(db.verifyTokensWithMethod.callCount).toBe(1);
        const args = db.verifyTokensWithMethod.args[0];
        expect(args[0]).toBe(sessionId);
        expect(args[1]).toBe('totp-2fa');

        // emits correct metrics
        sinon.assert.calledTwice(request.emitMetricsEvent);
        sinon.assert.calledWith(
          request.emitMetricsEvent,
          'totpToken.verified',
          { uid: 'uid' }
        );
        sinon.assert.calledWith(
          request.emitMetricsEvent,
          'account.confirmed',
          { uid: 'uid' }
        );

        // correct emails sent
        expect(fxaMailer.sendNewDeviceLoginEmail.callCount).toBe(1);
        expect(
          fxaMailer.sendPostAddTwoStepAuthenticationEmail.callCount
        ).toBe(0);
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
        expect(db.totpToken.callCount).toBe(1);

        // emits correct metrics
        expect(request.emitMetricsEvent.callCount).toBe(1);
        const args = request.emitMetricsEvent.args[0];
        expect(args[0]).toBe('totpToken.unverified');
        expect(args[1]['uid']).toBe('uid');

        // correct emails sent
        expect(fxaMailer.sendNewDeviceLoginEmail.callCount).toBe(0);
        expect(
          fxaMailer.sendPostAddTwoStepAuthenticationEmail.callCount
        ).toBe(0);

        sinon.assert.calledOnceWithExactly(
          accountEventsManager.recordSecurityEvent,
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

        sinon.assert.calledOnce(glean.login.totpFailure);
      });
    });
  });

  // This endpoint is used for code verification during TOTP setup only
  describe('/totp/setup/verify', () => {
    beforeEach(() => {
      glean.twoFactorAuth.setupVerifySuccess.reset();
      glean.twoFactorAuth.setupInvalidCodeError.reset();
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
      expect(authServerCacheRedis.set.callCount).toBe(2);
      sinon.assert.calledOnce(glean.twoFactorAuth.setupVerifySuccess);
      sinon.assert.calledOnceWithExactly(
        customs.checkAuthenticated,
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
        expect(authServerCacheRedis.set.callCount).toBe(0);
        sinon.assert.calledOnce(glean.twoFactorAuth.setupInvalidCodeError);
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
      glean.twoFactorAuth.codeComplete.reset();
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
      sinon.assert.calledOnce(db.replaceTotpToken);
      sinon.assert.calledOnce(db.verifyTokensWithMethod);
      expect(authServerCacheRedis.del.callCount).toBe(2);
      sinon.assert.calledOnce(profile.deleteCache);
      sinon.assert.calledOnce(log.notifyAttachedServices);
      sinon.assert.calledOnce(glean.twoFactorAuth.codeComplete);
      sinon.assert.calledOnce(fxaMailer.sendPostAddTwoStepAuthenticationEmail);
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

      sinon.assert.calledOnce(glean.resetPassword.twoFactorSuccess);
      expect(response.success).toBe(true);
      sinon.assert.calledOnceWithExactly(db.totpToken, 'uid');
      sinon.assert.calledOnceWithExactly(
        customs.checkAuthenticated,
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
      sinon.assert.calledOnceWithExactly(db.totpToken, 'uid');
      sinon.assert.calledOnceWithExactly(
        customs.checkAuthenticated,
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

      sinon.assert.calledOnce(glean.resetPassword.twoFactorRecoveryCodeSuccess);

      sinon.assert.calledOnce(fxaMailer.sendPostConsumeRecoveryCodeEmail);
      sinon.assert.notCalled(fxaMailer.sendLowRecoveryCodesEmail);

      expect(response.remaining).toBe(2);
      sinon.assert.calledOnceWithExactly(
        db.consumeRecoveryCode,
        'uid',
        '1234567890'
      );
      sinon.assert.calledOnceWithExactly(
        customs.checkAuthenticated,
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

      sinon.assert.calledOnce(fxaMailer.sendLowRecoveryCodesEmail);
      expect(response.remaining).toBe(1);
      sinon.assert.calledOnceWithExactly(
        db.consumeRecoveryCode,
        'uid',
        '1234567890'
      );
    });
  });
});
