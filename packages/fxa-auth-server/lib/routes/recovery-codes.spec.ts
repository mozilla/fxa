/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Container } from 'typedi';
import { AppError as error } from '@fxa/accounts/errors';
import { BackupCodeManager } from '@fxa/accounts/two-factor';

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
  glean: any;
const TEST_EMAIL = 'test@email.com';
const UID = 'uid';

const mockBackupCodeManager = {
  getCountForUserId: jest.fn(),
};
const mockAccountEventsManager = {
  recordSecurityEvent: jest.fn(),
};

function runTest(routePath: string, requestOptions: any, method?: string) {
  const config = {
    recoveryCodes: {
      count: 8,
      length: 10,
      notifyLowCount: 2,
    },
  };
  routes = require('./recovery-codes')(log, db, config, customs, mailer, glean);
  route = getRoute(routes, routePath, method);
  request = mocks.mockRequest(requestOptions);
  request.emitMetricsEvent = jest.fn(() => Promise.resolve({}));

  return route.handler(request);
}

describe('backup authentication codes', () => {
  beforeEach(() => {
    log = mocks.mockLog();
    customs = mocks.mockCustoms();
    mailer = mocks.mockMailer();
    fxaMailer = mocks.mockFxaMailer();
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
    jest.clearAllMocks();
  });

  afterAll(() => {
    Container.reset();
  });

  describe('GET /recoveryCodes', () => {
    it('should replace backup authentication codes in TOTP session', () => {
      requestOptions.credentials.authenticatorAssuranceLevel = 2;
      return runTest('/recoveryCodes', requestOptions, 'GET').then(
        (res: any) => {
          expect(res.recoveryCodes).toHaveLength(2);

          expect(db.replaceRecoveryCodes).toHaveBeenCalledTimes(1);
          expect(db.replaceRecoveryCodes).toHaveBeenNthCalledWith(1, UID, 8);
          expect(
            mockAccountEventsManager.recordSecurityEvent
          ).toHaveBeenCalledTimes(1);
          expect(
            mockAccountEventsManager.recordSecurityEvent
          ).toHaveBeenCalledWith(db, {
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
          });
        }
      );
    });
  });

  describe('PUT /recoveryCodes', () => {
    it('should overwrite backup authentication codes in TOTP session', () => {
      requestOptions.credentials.authenticatorAssuranceLevel = 2;
      requestOptions.payload.recoveryCodes = ['123'];

      return runTest('/recoveryCodes', requestOptions, 'PUT').then(
        (res: any) => {
          expect(res.success).toBe(true);

          expect(db.updateRecoveryCodes).toHaveBeenCalledTimes(1);
          expect(db.updateRecoveryCodes).toHaveBeenNthCalledWith(1, UID, [
            '123',
          ]);
          expect(
            mockAccountEventsManager.recordSecurityEvent
          ).toHaveBeenCalledTimes(1);
          expect(
            mockAccountEventsManager.recordSecurityEvent
          ).toHaveBeenCalledWith(db, {
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
          });
        }
      );
    });
  });

  describe('GET /recoveryCodes/exists', () => {
    it('should return hasBackupCodes and count', async () => {
      mockBackupCodeManager.getCountForUserId = jest.fn().mockReturnValue({
        hasBackupCodes: true,
        count: 8,
      });

      const res = await runTest('/recoveryCodes/exists', requestOptions, 'GET');
      expect(res).toBeDefined();
      expect(res.hasBackupCodes).toBe(true);
      expect(res.count).toBe(8);
      expect(mockBackupCodeManager.getCountForUserId).toHaveBeenCalledTimes(1);
      expect(mockBackupCodeManager.getCountForUserId).toHaveBeenCalledWith(UID);
    });

    it('should handle empty response from backupCodeManager', async () => {
      mockBackupCodeManager.getCountForUserId = jest.fn().mockReturnValue({});

      const res = await runTest('/recoveryCodes/exists', requestOptions, 'GET');
      expect(res.hasBackupCodes).toBeUndefined();
      expect(res.count).toBeUndefined();
    });
  });

  describe('POST /session/verify/recoveryCode', () => {
    it('sends email if backup authentication codes are low', async () => {
      db.consumeRecoveryCode = jest.fn((_code: any) => {
        return Promise.resolve({ remaining: 1 });
      });
      await runTest('/session/verify/recoveryCode', requestOptions);
      expect(fxaMailer.sendLowRecoveryCodesEmail).toHaveBeenCalledTimes(1);
      expect(fxaMailer.sendLowRecoveryCodesEmail).toHaveBeenNthCalledWith(
        1,
        expect.objectContaining({ numberRemaining: 1 })
      );

      expect(
        mockAccountEventsManager.recordSecurityEvent
      ).toHaveBeenCalledTimes(1);
      expect(mockAccountEventsManager.recordSecurityEvent).toHaveBeenCalledWith(
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

    it('should rate-limit attempts to use a backup authentication code via customs', async () => {
      requestOptions.payload.code = '1234567890';
      db.consumeRecoveryCode = jest.fn((_code: any) => {
        throw error.recoveryCodeNotFound();
      });
      try {
        await runTest('/session/verify/recoveryCode', requestOptions);
        throw new Error('should have thrown');
      } catch (err: any) {
        expect(err.errno).toBe(error.ERRNO.RECOVERY_CODE_NOT_FOUND);
        expect(customs.checkAuthenticated).toHaveBeenCalledWith(
          request,
          UID,
          TEST_EMAIL,
          'verifyRecoveryCode'
        );
      }
    });

    it('should emit a glean event on successful verification', async () => {
      db.consumeRecoveryCode = jest.fn((_code: any) => {
        return Promise.resolve({ remaining: 4 });
      });
      await runTest('/session/verify/recoveryCode', requestOptions);
      expect(glean.login.recoveryCodeSuccess).toHaveBeenCalledTimes(1);
      expect(glean.login.recoveryCodeSuccess).toHaveBeenCalledWith(request, {
        uid: UID,
      });
    });

    it('should emit the flow complete event', async () => {
      db.consumeRecoveryCode = jest.fn((_code: any) => {
        return Promise.resolve({ remaining: 4 });
      });
      await runTest('/session/verify/recoveryCode', requestOptions);
      expect(request.emitMetricsEvent).toHaveBeenCalledTimes(2);
      expect(request.emitMetricsEvent).toHaveBeenCalledWith(
        'account.confirmed',
        {
          uid: UID,
        }
      );
    });
  });
});
