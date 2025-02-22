/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const sinon = require('sinon');
const assert = { ...sinon.assert, ...require('chai').assert };
const getRoute = require('../../routes_helpers').getRoute;
const mocks = require('../../mocks');
const otplib = require('otplib');
const { Container } = require('typedi');
const { AccountEventsManager } = require('../../../lib/account-events');
const authErrors = require('../../../lib/error');
const { RecoveryPhoneService } = require('@fxa/accounts/recovery-phone');
const { BackupCodeManager } = require('@fxa/accounts/two-factor');

let log,
  db,
  customs,
  routes,
  route,
  request,
  requestOptions,
  mailer,
  profile,
  accountEventsManager;

const glean = mocks.mockGlean();
const mockRecoveryPhoneService = {
  removePhoneNumber: sinon.fake.resolves(true),
};
const mockBackupCodeManager = {
  deleteRecoveryCodes: sinon.fake.resolves(true),
};

const TEST_EMAIL = 'test@email.com';
const secret = 'KE3TGQTRNIYFO2KOPE4G6ULBOV2FQQTN';
const sessionId = 'id';

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

    Container.set(RecoveryPhoneService, mockRecoveryPhoneService);
    Container.set(BackupCodeManager, mockBackupCodeManager);

    glean.twoStepAuthRemove.success.reset();
  });

  after(() => {
    Container.reset();
  });

  describe('/totp/create', () => {
    it('should create TOTP token', () => {
      return setup(
        { db: { email: TEST_EMAIL } },
        {},
        '/totp/create',
        requestOptions
      ).then((response) => {
        assert.ok(response.qrCodeUrl);
        assert.ok(response.secret);
        assert.equal(
          db.createTotpToken.callCount,
          1,
          'called create TOTP token'
        );

        // emits correct metrics
        assert.equal(
          request.emitMetricsEvent.callCount,
          1,
          'called emitMetricsEvent'
        );
        const args = request.emitMetricsEvent.args[0];
        assert.equal(
          args[0],
          'totpToken.created',
          'called emitMetricsEvent with correct event'
        );
        assert.equal(
          args[1]['uid'],
          'uid',
          'called emitMetricsEvent with correct event'
        );
      });
    });

    it('should be disabled in unverified session', () => {
      requestOptions.credentials.tokenVerificationId = 'notverified';
      return setup(
        { db: { email: TEST_EMAIL } },
        {},
        '/totp/create',
        requestOptions
      ).then(assert.fail, (err) => {
        assert.deepEqual(err.errno, 138, 'unverified session error');
      });
    });
  });

  describe('/totp/destroy', () => {
    it('should delete TOTP token in verified session', () => {
      requestOptions.credentials.tokenVerified = true;
      return setup(
        { db: { email: TEST_EMAIL }, profile },
        {},
        '/totp/destroy',
        requestOptions
      ).then((response) => {
        assert.ok(response);
        assert.equal(
          db.deleteTotpToken.callCount,
          1,
          'called delete TOTP token'
        );
        assert.equal(
          profile.deleteCache.callCount,
          1,
          'called profile client delete cache'
        );
        assert.equal(
          profile.deleteCache.getCall(0).args[0],
          'uid',
          'called profile client delete cache'
        );

        assert.equal(
          log.notifyAttachedServices.callCount,
          1,
          'called notifyAttachedServices'
        );
        const args = log.notifyAttachedServices.args[0];
        assert.equal(
          args.length,
          3,
          'log.notifyAttachedServices was passed three arguments'
        );
        assert.equal(
          args[0],
          'profileDataChange',
          'first argument was event name'
        );
        assert.equal(args[2].uid, 'uid');

        assert.equal(
          db.verifyTokensWithMethod.callCount,
          1,
          'called db.verifyTokensWithMethod'
        );
        const dbArgs = db.verifyTokensWithMethod.args[0];
        assert.equal(dbArgs[0], sessionId, 'first argument was sessionId');
        assert.equal(
          dbArgs[1],
          'email-2fa',
          `second argument was reduced verification level`
        );

        assert.calledOnceWithExactly(
          accountEventsManager.recordSecurityEvent,
          db,
          {
            name: 'account.two_factor_removed',
            uid: 'uid',
            ipAddr: '63.245.221.32',
            tokenId: 'id',
          }
        );
        assert.equal(mockRecoveryPhoneService.removePhoneNumber.callCount, 1);
        assert.equal(
          mockRecoveryPhoneService.removePhoneNumber.args[0][0],
          'uid'
        );
        assert.equal(glean.twoStepAuthPhoneRemove.success.callCount, 1);
        assert.equal(mockBackupCodeManager.deleteRecoveryCodes.callCount, 1);
        assert.equal(
          mockBackupCodeManager.deleteRecoveryCodes.args[0][0],
          'uid'
        );
        assert.equal(glean.twoStepAuthRemove.success.callCount, 1);
      });
    });

    it('should not delete TOTP token in unverified session', () => {
      requestOptions.credentials.tokenVerified = false;
      return setup(
        { db: { email: TEST_EMAIL } },
        {},
        '/totp/destroy',
        requestOptions
      ).then(assert.fail, (err) => {
        assert.deepEqual(err.errno, 138, 'unverified session error');
        assert.equal(
          log.notifyAttachedServices.callCount,
          0,
          'did not call notifyAttachedServices'
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
      ).then((response) => {
        assert.ok(response);
        assert.equal(db.totpToken.callCount, 1, 'called get TOTP token');
      });
    });
  });

  describe('/session/verify/totp', () => {
    afterEach(() => {
      glean.login.totpSuccess.reset();
      glean.twoFactorAuth.codeComplete();
    });

    it('should enable and verify TOTP token', () => {
      const authenticator = new otplib.authenticator.Authenticator();
      authenticator.options = Object.assign({}, otplib.authenticator.options, {
        secret,
      });
      requestOptions.payload = {
        code: authenticator.generate(secret),
      };
      return setup(
        {
          db: { email: TEST_EMAIL },
          totpTokenVerified: false,
          totpTokenEnabled: false,
        },
        {},
        '/session/verify/totp',
        requestOptions
      ).then((response) => {
        assert.equal(response.success, true, 'should be valid code');
        assert.equal(db.totpToken.callCount, 1, 'called get TOTP token');
        assert.equal(db.updateTotpToken.callCount, 1, 'update TOTP token');

        assert.equal(
          profile.deleteCache.callCount,
          1,
          'called profile client delete cache'
        );
        assert.equal(
          profile.deleteCache.getCall(0).args[0],
          'uid',
          'called profile client delete cache'
        );

        assert.equal(
          log.notifyAttachedServices.callCount,
          1,
          'call notifyAttachedServices'
        );
        let args = log.notifyAttachedServices.args[0];
        assert.equal(
          args.length,
          3,
          'log.notifyAttachedServices was passed three arguments'
        );
        assert.equal(
          args[0],
          'profileDataChange',
          'first argument was event name'
        );
        assert.equal(args[1], request, 'second argument was request object');
        assert.equal(
          args[2].uid,
          'uid',
          'third argument was event data with a uid'
        );

        // verifies session
        assert.equal(
          db.verifyTokensWithMethod.callCount,
          1,
          'call verify session'
        );
        args = db.verifyTokensWithMethod.args[0];
        assert.equal(sessionId, args[0], 'called with correct session id');
        assert.equal('totp-2fa', args[1], 'called with correct method');

        // emits correct metrics
        assert.equal(
          request.emitMetricsEvent.callCount,
          1,
          'called emitMetricsEvent'
        );
        args = request.emitMetricsEvent.args[0];
        assert.equal(
          args[0],
          'totpToken.verified',
          'called emitMetricsEvent with correct event'
        );
        assert.equal(
          args[1]['uid'],
          'uid',
          'called emitMetricsEvent with correct event'
        );

        // correct emails sent
        assert.equal(mailer.sendNewDeviceLoginEmail.callCount, 0);
        assert.equal(mailer.sendPostAddTwoStepAuthenticationEmail.callCount, 1);

        assert.calledWithExactly(accountEventsManager.recordSecurityEvent, db, {
          name: 'account.two_factor_added',
          uid: 'uid',
          ipAddr: '63.245.221.32',
          tokenId: 'id',
        });

        sinon.assert.calledOnce(glean.twoFactorAuth.codeComplete);

        assert.calledWithExactly(accountEventsManager.recordSecurityEvent, db, {
          name: 'account.two_factor_challenge_success',
          uid: 'uid',
          ipAddr: '63.245.221.32',
          tokenId: 'id',
        });
      });
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
      ).then((response) => {
        assert.equal(response.success, true, 'should be valid code');
        assert.equal(db.totpToken.callCount, 1, 'called get TOTP token');
        assert.equal(
          db.updateTotpToken.callCount,
          0,
          'did not call update TOTP token'
        );

        assert.equal(
          log.notifyAttachedServices.callCount,
          0,
          'did not call notifyAttachedServices'
        );

        // verifies session
        assert.equal(
          db.verifyTokensWithMethod.callCount,
          1,
          'call verify session'
        );
        let args = db.verifyTokensWithMethod.args[0];
        assert.equal(sessionId, args[0], 'called with correct session id');
        assert.equal('totp-2fa', args[1], 'called with correct method');

        // emits correct metrics
        assert.equal(
          request.emitMetricsEvent.callCount,
          1,
          'called emitMetricsEvent'
        );
        args = request.emitMetricsEvent.args[0];
        assert.equal(
          args[0],
          'totpToken.verified',
          'called emitMetricsEvent with correct event'
        );
        assert.equal(
          args[1]['uid'],
          'uid',
          'called emitMetricsEvent with correct event'
        );

        // correct emails sent
        assert.equal(mailer.sendNewDeviceLoginEmail.callCount, 1);
        assert.equal(mailer.sendPostAddTwoStepAuthenticationEmail.callCount, 0);

        assert.calledOnceWithExactly(
          accountEventsManager.recordSecurityEvent,
          db,
          {
            name: 'account.two_factor_challenge_success',
            uid: 'uid',
            ipAddr: '63.245.221.32',
            tokenId: 'id',
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
      ).then((response) => {
        assert.equal(response.success, true, 'should be valid code');
        assert.equal(db.totpToken.callCount, 1, 'called get TOTP token');
        assert.equal(
          db.updateTotpToken.callCount,
          0,
          'did not call update TOTP token'
        );

        assert.equal(
          log.notifyAttachedServices.callCount,
          0,
          'did not call notifyAttachedServices'
        );

        // verifies session
        assert.equal(
          db.verifyTokensWithMethod.callCount,
          1,
          'call verify session'
        );
        let args = db.verifyTokensWithMethod.args[0];
        assert.equal(sessionId, args[0], 'called with correct session id');
        assert.equal('totp-2fa', args[1], 'called with correct method');

        // emits correct metrics
        assert.equal(
          request.emitMetricsEvent.callCount,
          1,
          'called emitMetricsEvent'
        );
        args = request.emitMetricsEvent.args[0];
        assert.equal(
          args[0],
          'totpToken.verified',
          'called emitMetricsEvent with correct event'
        );
        assert.equal(
          args[1]['uid'],
          'uid',
          'called emitMetricsEvent with correct event'
        );

        // correct emails sent
        assert.equal(mailer.sendNewDeviceLoginEmail.callCount, 1);
        assert.equal(mailer.sendPostAddTwoStepAuthenticationEmail.callCount, 0);
      });
    });

    it('should return false for invalid TOTP code', () => {
      requestOptions.payload = {
        code: 'NOTVALID',
      };
      return setup(
        { db: { email: TEST_EMAIL } },
        {},
        '/session/verify/totp',
        requestOptions
      ).then((response) => {
        assert.equal(response.success, false, 'should be valid code');
        assert.equal(db.totpToken.callCount, 1, 'called get TOTP token');

        // emits correct metrics
        assert.equal(
          request.emitMetricsEvent.callCount,
          1,
          'called emitMetricsEvent'
        );
        const args = request.emitMetricsEvent.args[0];
        assert.equal(
          args[0],
          'totpToken.unverified',
          'called emitMetricsEvent with correct event'
        );
        assert.equal(
          args[1]['uid'],
          'uid',
          'called emitMetricsEvent with correct event'
        );

        // correct emails sent
        assert.equal(mailer.sendNewDeviceLoginEmail.callCount, 0);
        assert.equal(mailer.sendPostAddTwoStepAuthenticationEmail.callCount, 0);

        assert.calledOnceWithExactly(
          accountEventsManager.recordSecurityEvent,
          db,
          {
            name: 'account.two_factor_challenge_failure',
            uid: 'uid',
            ipAddr: '63.245.221.32',
            tokenId: 'id',
          }
        );

        sinon.assert.calledOnce(glean.login.totpFailure);
      });
    });
  });

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
        { db: { email: TEST_EMAIL } },
        {},
        '/totp/verify',
        requestOptions
      );

      assert.calledOnce(glean.resetPassword.twoFactorSuccess);
      assert.isTrue(response.success);
      assert.calledOnceWithExactly(db.totpToken, 'uid');
      assert.calledOnceWithExactly(
        customs.checkAuthenticated,
        request,
        'uid',
        'verifyTotpCode'
      );
    });

    it('should fail for a invalid totp code', async () => {
      requestOptions.payload = {
        code: '123123',
      };
      const response = await setup(
        { db: { email: TEST_EMAIL } },
        {},
        '/totp/verify',
        requestOptions
      );

      assert.isFalse(response.success);
      assert.calledOnceWithExactly(db.totpToken, 'uid');
      assert.calledOnceWithExactly(
        customs.checkAuthenticated,
        request,
        'uid',
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

      assert.calledOnce(glean.resetPassword.twoFactorRecoveryCodeSuccess);

      assert.calledOnce(mailer.sendPostConsumeRecoveryCodeEmail);
      assert.notCalled(mailer.sendLowRecoveryCodesEmail);

      assert.equal(response.remaining, 2);
      assert.calledOnceWithExactly(db.consumeRecoveryCode, 'uid', '1234567890');
      assert.calledOnceWithExactly(
        customs.check,
        request,
        TEST_EMAIL,
        'verifyRecoveryCode'
      );
    });

    it('should fail for invalid recovery code', async () => {
      requestOptions.payload.code = '1234567890';
      try {
        await setup(
          { db: { email: TEST_EMAIL } },
          { consumeRecoveryCode: true },
          '/totp/verify/recoveryCode',
          requestOptions
        );

        assert.fail();
      } catch (err) {
        assert.equal(err.errno, 156);
        assert.deepEqual(err.message, 'Backup authentication code not found.');
      }
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

      assert.calledOnce(mailer.sendLowRecoveryCodesEmail);
      assert.equal(response.remaining, 1);
      assert.calledOnceWithExactly(db.consumeRecoveryCode, 'uid', '1234567890');
    });
  });
});

function setup(results, errors, routePath, requestOptions) {
  results = results || {};
  errors = errors || {};
  log = mocks.mockLog();
  customs = mocks.mockCustoms(errors.customs);
  mailer = mocks.mockMailer();
  db = mocks.mockDB(results.db, errors.db);
  profile = mocks.mockProfile();
  db.consumeRecoveryCode = sinon.spy(() => {
    if (errors.consumeRecoveryCode) {
      return Promise.reject(authErrors.recoveryCodeNotFound());
    }
    return Promise.resolve({
      remaining: requestOptions.remaining || 2,
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
      verified:
        typeof results.totpTokenVerified === 'undefined'
          ? true
          : results.totpTokenVerified,
      enabled:
        typeof results.totpTokenEnabled === 'undefined'
          ? true
          : results.totpTokenEnabled,
      sharedSecret: secret,
    });
  });
  const statsd = mocks.mockStatsd();
  routes = makeRoutes({ log, db, customs, mailer, glean, profile, statsd });
  route = getRoute(routes, routePath);
  request = mocks.mockRequest(requestOptions);
  request.emitMetricsEvent = sinon.spy(() => Promise.resolve({}));

  return runTest(route, request);
}

function makeRoutes(options = {}) {
  const config = {
    step: 30,
    window: 1,
    recoveryCodes: {
      notifyLowCount: 1,
    },
  };
  Container.set(AccountEventsManager, accountEventsManager);
  const { log, db, customs, mailer, glean, profile, statsd } = options;
  return require('../../../lib/routes/totp')(
    log,
    db,
    mailer,
    customs,
    config,
    glean,
    profile,
    undefined,
    statsd
  );
}

function runTest(route, request) {
  return route.handler(request);
}
