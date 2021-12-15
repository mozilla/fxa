/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const sinon = require('sinon');
const assert = { ...sinon.assert, ...require('chai').assert };
const getRoute = require('../../routes_helpers').getRoute;
const mocks = require('../../mocks');
const error = require('../../../lib/error');

let log, db, customs, routes, route, request, requestOptions, mailer;
const TEST_EMAIL = 'test@email.com';
const UID = 'uid';

function runTest(routePath, requestOptions, method) {
  const config = {
    recoveryCodes: {
      count: 8,
      length: 10,
      notifyLowCount: 2,
    },
  };
  routes = require('../../../lib/routes/recovery-codes')(
    log,
    db,
    config,
    customs,
    mailer
  );
  route = getRoute(routes, routePath, method);
  request = mocks.mockRequest(requestOptions);
  request.emitMetricsEvent = sinon.spy(() => Promise.resolve({}));

  return route.handler(request);
}

describe('recovery codes', () => {
  beforeEach(() => {
    log = mocks.mockLog();
    customs = mocks.mockCustoms();
    mailer = mocks.mockMailer();
    db = mocks.mockDB({
      uid: UID,
      email: TEST_EMAIL,
    });
    requestOptions = {
      metricsContext: mocks.mockMetricsContext(),
      credentials: {
        uid: 'uid',
        email: TEST_EMAIL,
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

  describe('GET /recoveryCodes', () => {
    it('should replace recovery codes in TOTP session', () => {
      requestOptions.credentials.authenticatorAssuranceLevel = 2;
      return runTest('/recoveryCodes', requestOptions, 'GET').then((res) => {
        assert.equal(res.recoveryCodes.length, 2, 'correct default code count');

        assert.equal(db.replaceRecoveryCodes.callCount, 1);
        const args = db.replaceRecoveryCodes.args[0];
        assert.equal(args[0], UID, 'called with uid');
        assert.equal(args[1], 8, 'called with recovery code count');
      });
    });

    it("should't replace codes in non-TOTP verified session", () => {
      requestOptions.credentials.authenticatorAssuranceLevel = 1;
      return runTest('/recoveryCodes', requestOptions, 'GET').then(
        assert.fail,
        (err) => {
          assert.equal(err.errno, error.ERRNO.SESSION_UNVERIFIED);
        }
      );
    });
  });

  describe('PUT /recoveryCodes', () => {
    it('should overwrite recovery codes in TOTP session', () => {
      requestOptions.credentials.authenticatorAssuranceLevel = 2;
      requestOptions.payload.recoveryCodes = ['123'];

      return runTest('/recoveryCodes', requestOptions, 'PUT').then((res) => {
        assert.equal(res.success, true, 'returns success');

        assert.equal(db.updateRecoveryCodes.callCount, 1);

        const args = db.updateRecoveryCodes.args[0];
        assert.equal(args[0], UID, 'called with uid');
        assert.deepEqual(args[1], ['123'], 'called with recovery codes');
      });
    });

    it("should't overwrite codes for non-TOTP verified session", () => {
      requestOptions.credentials.authenticatorAssuranceLevel = 1;
      requestOptions.payload.recoveryCodes = ['123'];
      return runTest('/recoveryCodes', requestOptions, 'PUT').then(
        assert.fail,
        (err) => {
          assert.equal(err.errno, error.ERRNO.SESSION_UNVERIFIED);
        }
      );
    });
  });

  describe('/session/verify/recoveryCode', () => {
    it('sends email if recovery codes are low', async () => {
      db.consumeRecoveryCode = sinon.spy((code) => {
        return Promise.resolve({ remaining: 1 });
      });
      await runTest('/session/verify/recoveryCode', requestOptions);
      assert.equal(mailer.sendLowRecoveryCodesEmail.callCount, 1);
      const args = mailer.sendLowRecoveryCodesEmail.args[0];
      assert.lengthOf(args, 3);
      assert.equal(args[2].numberRemaining, 1);
    });

    it('should rate-limit attempts to use a recovery code via customs', () => {
      requestOptions.payload.code = '1234567890';
      db.consumeRecoveryCode = sinon.spy((code) => {
        throw error.recoveryCodeNotFound();
      });
      return runTest('/session/verify/recoveryCode', requestOptions).then(
        assert.fail,
        (err) => {
          assert.equal(err.errno, error.ERRNO.RECOVERY_CODE_NOT_FOUND);
          assert.calledWithExactly(
            customs.check,
            request,
            TEST_EMAIL,
            'verifyRecoveryCode'
          );
        }
      );
    });
  });
});
