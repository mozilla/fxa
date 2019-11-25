/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const { assert } = require('chai');
const getRoute = require('../../routes_helpers').getRoute;
const mocks = require('../../mocks');
const otplib = require('otplib');
const P = require('../../../lib/promise');
const sinon = require('sinon');

let log, db, customs, routes, route, request, requestOptions, mailer;
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
  });

  describe('/totp/create', () => {
    it('should create TOTP token', () => {
      return setup(
        { db: { email: TEST_EMAIL } },
        {},
        '/totp/create',
        requestOptions
      ).then(response => {
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
      ).then(assert.fail, err => {
        assert.deepEqual(err.errno, 138, 'unverified session error');
      });
    });
  });

  describe('/totp/destroy', () => {
    it('should delete TOTP token in verified session', () => {
      requestOptions.credentials.tokenVerified = true;
      return setup(
        { db: { email: TEST_EMAIL } },
        {},
        '/totp/destroy',
        requestOptions
      ).then(response => {
        assert.ok(response);
        assert.equal(
          db.deleteTotpToken.callCount,
          1,
          'called delete TOTP token'
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
          'profileDataChanged',
          'first argument was event name'
        );
        assert.equal(args[1], request, 'second argument was request object');
        assert.equal(
          args[2].uid,
          'uid',
          'third argument was event data with a uid'
        );
      });
    });

    it('should not delete TOTP token in unverified session', () => {
      requestOptions.credentials.tokenVerified = false;
      return setup(
        { db: { email: TEST_EMAIL } },
        {},
        '/totp/destroy',
        requestOptions
      ).then(assert.fail, err => {
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
      ).then(response => {
        assert.ok(response);
        assert.equal(db.totpToken.callCount, 1, 'called get TOTP token');
      });
    });

    it('should be disabled in unverified session', () => {
      requestOptions.credentials.tokenVerificationId = 'notverified';
      return setup(
        { db: { email: TEST_EMAIL } },
        {},
        '/totp/exists',
        requestOptions
      ).then(assert.fail, err => {
        assert.deepEqual(err.errno, 138, 'unverified session error');
      });
    });
  });

  describe('/session/verify/totp', () => {
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
      ).then(response => {
        assert.equal(response.success, true, 'should be valid code');
        assert.equal(db.totpToken.callCount, 1, 'called get TOTP token');
        assert.equal(db.updateTotpToken.callCount, 1, 'update TOTP token');

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
          'profileDataChanged',
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
      ).then(response => {
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
      ).then(response => {
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
        assert.equal(mailer.sendNewDeviceLoginEmail.callCount, 0);
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
      ).then(response => {
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
      });
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
  db.createTotpToken = sinon.spy(() => {
    return P.resolve({
      qrCodeUrl: 'some base64 encoded png',
      sharedSecret: secret,
    });
  });
  db.totpToken = sinon.spy(() => {
    return P.resolve({
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
  routes = makeRoutes({ log, db, customs, mailer });
  route = getRoute(routes, routePath);
  request = mocks.mockRequest(requestOptions);
  request.emitMetricsEvent = sinon.spy(() => P.resolve({}));
  return runTest(route, request);
}

function makeRoutes(options = {}) {
  const config = { step: 30, window: 1 };
  const { log, db, customs, mailer } = options;
  return require('../../../lib/routes/totp')(log, db, mailer, customs, config);
}

function runTest(route, request) {
  return route.handler(request);
}
