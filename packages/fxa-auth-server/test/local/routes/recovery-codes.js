/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const sinon = require('sinon');
const assert = { ...sinon.assert, ...require('chai').assert };
const getRoute = require('../../routes_helpers').getRoute;
const mocks = require('../../mocks');
const error = require('../../../lib/error');
const { Container } = require('typedi');
const { BackupCodeManager } = require('@fxa/accounts/two-factor');
const { AccountEventsManager } = require('../../../lib/account-events');

let log, db, customs, routes, route, request, requestOptions, mailer, glean;
const TEST_EMAIL = 'test@email.com';
const UID = 'uid';
let sandbox;

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
    mailer,
    glean
  );
  route = getRoute(routes, routePath, method);
  request = mocks.mockRequest(requestOptions);
  request.emitMetricsEvent = sandbox.spy(() => Promise.resolve({}));

  return route.handler(request);
}

describe('backup authentication codes', () => {
  sandbox = sinon.createSandbox();
  const mockBackupCodeManager = {
    getCountForUserId: sandbox.fake(),
  };
  const mockAccountEventsManager = {
    recordSecurityEvent: sandbox.fake(),
  };
  beforeEach(() => {
    log = mocks.mockLog();
    customs = mocks.mockCustoms();
    mailer = mocks.mockMailer();
    db = mocks.mockDB({
      uid: UID,
      email: TEST_EMAIL,
    });
    glean = mocks.mockGlean();
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
    Container.set(BackupCodeManager, mockBackupCodeManager);
    Container.set(AccountEventsManager, mockAccountEventsManager);
  });

  afterEach(() => {
    sandbox.reset();
  });

  describe('GET /recoveryCodes', () => {
    it('should replace backup authentication codes in TOTP session', () => {
      requestOptions.credentials.authenticatorAssuranceLevel = 2;
      return runTest('/recoveryCodes', requestOptions, 'GET').then((res) => {
        assert.equal(res.recoveryCodes.length, 2, 'correct default code count');

        assert.equal(db.replaceRecoveryCodes.callCount, 1);
        const args = db.replaceRecoveryCodes.args[0];
        assert.equal(args[0], UID, 'called with uid');
        assert.equal(
          args[1],
          8,
          'called with backup authentication code count'
        );
        assert.calledOnceWithExactly(
          mockAccountEventsManager.recordSecurityEvent,
          db,
          {
            name: 'account.recovery_codes_replaced',
            uid: 'uid',
            ipAddr: '63.245.221.32',
            tokenId: undefined,
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
    it('should overwrite backup authentication codes in TOTP session', () => {
      requestOptions.credentials.authenticatorAssuranceLevel = 2;
      requestOptions.payload.recoveryCodes = ['123'];

      return runTest('/recoveryCodes', requestOptions, 'PUT').then((res) => {
        assert.equal(res.success, true, 'returns success');

        assert.equal(db.updateRecoveryCodes.callCount, 1);

        const args = db.updateRecoveryCodes.args[0];
        assert.equal(args[0], UID, 'called with uid');
        assert.deepEqual(
          args[1],
          ['123'],
          'called with backup authentication codes'
        );
        assert.calledOnceWithExactly(
          mockAccountEventsManager.recordSecurityEvent,
          db,
          {
            name: 'account.recovery_codes_created',
            uid: 'uid',
            ipAddr: '63.245.221.32',
            tokenId: undefined,
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

  describe('GET /recoveryCodes/exists', () => {
    it('should return hasBackupCodes and count', async () => {
      mockBackupCodeManager.getCountForUserId = sandbox.fake.returns({
        hasBackupCodes: true,
        count: 8,
      });

      const res = await runTest('/recoveryCodes/exists', requestOptions, 'GET');
      assert.isDefined(res);
      assert.equal(res.hasBackupCodes, true);
      assert.equal(res.count, 8);
      sandbox.assert.calledOnce(mockBackupCodeManager.getCountForUserId);
      sandbox.assert.calledWithExactly(
        mockBackupCodeManager.getCountForUserId,
        UID
      );
    });

    it('should handle empty response from backupCodeManager', async () => {
      mockBackupCodeManager.getCountForUserId = sandbox.fake.returns({});

      const res = await runTest('/recoveryCodes/exists', requestOptions, 'GET');
      assert.equal(res.hasBackupCodes, undefined);
      assert.equal(res.count, undefined);
    });
  });

  describe('POST /session/verify/recoveryCode', () => {
    it('sends email if backup authentication codes are low', async () => {
      db.consumeRecoveryCode = sandbox.spy((code) => {
        return Promise.resolve({ remaining: 1 });
      });
      await runTest('/session/verify/recoveryCode', requestOptions);
      assert.equal(mailer.sendLowRecoveryCodesEmail.callCount, 1);
      const args = mailer.sendLowRecoveryCodesEmail.args[0];
      assert.lengthOf(args, 3);
      assert.equal(args[2].numberRemaining, 1);

      assert.calledOnceWithExactly(
        mockAccountEventsManager.recordSecurityEvent,
        db,
        {
          name: 'account.recovery_codes_signin_complete',
          uid: 'uid',
          ipAddr: '63.245.221.32',
          tokenId: undefined,
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
    });

    it('should rate-limit attempts to use a backup authentication code via customs', () => {
      requestOptions.payload.code = '1234567890';
      db.consumeRecoveryCode = sandbox.spy((code) => {
        throw error.recoveryCodeNotFound();
      });
      return runTest('/session/verify/recoveryCode', requestOptions).then(
        assert.fail,
        (err) => {
          assert.equal(err.errno, error.ERRNO.RECOVERY_CODE_NOT_FOUND);
          assert.calledWithExactly(
            customs.checkAuthenticated,
            request,
            UID,
            TEST_EMAIL,
            'verifyRecoveryCode'
          );
        }
      );
    });

    it('should emit a glean event on successful verification', async () => {
      db.consumeRecoveryCode = sandbox.spy((code) => {
        return Promise.resolve({ remaining: 4 });
      });
      await runTest('/session/verify/recoveryCode', requestOptions);
      sandbox.assert.calledOnceWithExactly(
        glean.login.recoveryCodeSuccess,
        request,
        { uid: UID }
      );
    });

    it('should emit the flow complete event', async () => {
      db.consumeRecoveryCode = sandbox.spy((code) => {
        return Promise.resolve({ remaining: 4 });
      });
      await runTest('/session/verify/recoveryCode', requestOptions);
      sandbox.assert.calledTwice(request.emitMetricsEvent);
      sandbox.assert.calledWith(request.emitMetricsEvent, 'account.confirmed', {
        uid: UID,
      });
    });
  });
});
