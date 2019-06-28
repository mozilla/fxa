/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const sinon = require('sinon');
const assert = { ...sinon.assert, ...require('chai').assert };
const getRoute = require('../../routes_helpers').getRoute;
const mocks = require('../../mocks');
const error = require('../../../lib/error');
const P = require('../../../lib/promise');

let log, db, customs, routes, route, request, requestOptions, mailer;
const TEST_EMAIL = 'test@email.com';
const UID = 'uid';

function runTest(routePath, requestOptions) {
  const config = { recoveryCodes: {} };
  routes = require('../../../lib/routes/recovery-codes')(
    log,
    db,
    config,
    customs,
    mailer
  );
  route = getRoute(routes, routePath);
  request = mocks.mockRequest(requestOptions);
  request.emitMetricsEvent = sinon.spy(() => P.resolve({}));

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

  describe('/recoveryCodes', () => {
    it('should replace recovery codes in TOTP session', () => {
      requestOptions.credentials.authenticatorAssuranceLevel = 2;
      return runTest('/recoveryCodes', requestOptions).then(res => {
        assert.equal(res.recoveryCodes.length, 2, 'correct default code count');

        assert.equal(db.replaceRecoveryCodes.callCount, 1);
        let args = db.replaceRecoveryCodes.args[0];
        assert.equal(args[0], UID, 'called with uid');
        assert.equal(args[1], 8, 'called with recovery code count');

        assert.equal(log.info.callCount, 2);
        args = log.info.args[1];
        assert.equal(args[0], 'account.recoveryCode.replaced');
        assert.equal(args[1].uid, UID);
      });
    });

    it("should't replace codes in non-TOTP verified session", () => {
      requestOptions.credentials.authenticatorAssuranceLevel = 1;
      return runTest('/recoveryCodes', requestOptions).then(
        assert.fail,
        err => {
          assert.equal(err.errno, error.ERRNO.SESSION_UNVERIFIED);
        }
      );
    });
  });

  describe('/session/verify/recoveryCode', () => {
    it('should rate-limit attempts to use a recovery code via customs', () => {
      requestOptions.payload.code = '1234567890';
      db.consumeRecoveryCode = sinon.spy(code => {
        throw error.recoveryCodeNotFound();
      });
      return runTest('/session/verify/recoveryCode', requestOptions).then(
        assert.fail,
        err => {
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
