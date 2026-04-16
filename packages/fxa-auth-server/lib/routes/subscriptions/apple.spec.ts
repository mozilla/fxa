/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Container } from 'typedi';

const mocks = require('../../../test/mocks');
const { AppleIapHandler } = require('./apple');
const {
  PurchaseUpdateError,
} = require('../../payments/iap/apple-app-store/types/errors');
const { AppError: error } = require('@fxa/accounts/errors');
const { AuthLogger } = require('../../types');
const { AppleIAP } = require('../../payments/iap/apple-app-store/apple-iap');
const { IAPConfig } = require('../../payments/iap/iap-config');
const { OAUTH_SCOPE_SUBSCRIPTIONS_IAP } = require('fxa-shared/oauth/constants');
const { CapabilityService } = require('../../payments/capability');
const {
  CertificateValidationError,
} = require('app-store-server-api/dist/cjs/Errors');

const MOCK_SCOPES = [OAUTH_SCOPE_SUBSCRIPTIONS_IAP];
const VALID_REQUEST = {
  auth: {
    credentials: {
      scope: MOCK_SCOPES,
      user: `uid1234`,
      email: `test@testing.com`,
    },
  },
};

describe('AppleIapHandler', () => {
  let iapConfig: any;
  let appleIap: any;
  let log: any;
  let appleIapHandler: any;
  let mockCapabilityService: any;

  beforeEach(() => {
    log = mocks.mockLog();
    appleIap = {};
    Container.set(AuthLogger, log);
    iapConfig = {};
    Container.set(IAPConfig, iapConfig);
    Container.set(AppleIAP, appleIap);
    mockCapabilityService = {};
    mockCapabilityService.iapUpdate = jest.fn().mockResolvedValue({});
    Container.set(CapabilityService, mockCapabilityService);
    appleIapHandler = new AppleIapHandler();
  });

  afterEach(() => {
    Container.reset();
    jest.restoreAllMocks();
  });

  describe('registerOriginalTransactionId', () => {
    const request = {
      ...VALID_REQUEST,
      params: { appName: 'test' },
      payload: { originalTransactionId: 'testTransactionId' },
    };

    it('returns valid with new products', async () => {
      appleIap.purchaseManager = {
        registerToUserAccount: jest.fn().mockResolvedValue({}),
      };
      iapConfig.getBundleId = jest.fn().mockResolvedValue('testPackage');
      const result =
        await appleIapHandler.registerOriginalTransactionId(request);
      expect(
        appleIap.purchaseManager.registerToUserAccount
      ).toHaveBeenCalledTimes(1);
      expect(iapConfig.getBundleId).toHaveBeenCalledTimes(1);
      expect(mockCapabilityService.iapUpdate).toHaveBeenCalledTimes(1);
      expect(result).toEqual({ transactionIdValid: true });
    });

    it('throws on invalid package', async () => {
      appleIap.purchaseManager = {
        registerToUserAccount: jest.fn().mockResolvedValue({}),
      };
      iapConfig.getBundleId = jest.fn().mockResolvedValue(undefined);
      try {
        await appleIapHandler.registerOriginalTransactionId(request);
        throw new Error('Expected failure');
      } catch (err: any) {
        expect(iapConfig.getBundleId).toHaveBeenCalledTimes(1);
        expect(err.errno).toBe(error.ERRNO.IAP_UNKNOWN_APPNAME);
      }
    });

    it('throws on invalid transaction id', async () => {
      const libraryError = new Error('Purchase is not registerable');
      libraryError.name = PurchaseUpdateError.INVALID_ORIGINAL_TRANSACTION_ID;

      appleIap.purchaseManager = {
        registerToUserAccount: jest.fn().mockRejectedValue(libraryError),
      };
      iapConfig.getBundleId = jest.fn().mockResolvedValue('testPackage');
      try {
        await appleIapHandler.registerOriginalTransactionId(request);
        throw new Error('Expected failure');
      } catch (err: any) {
        expect(err.errno).toBe(error.ERRNO.IAP_INVALID_TOKEN);
        expect(
          appleIap.purchaseManager.registerToUserAccount
        ).toHaveBeenCalledTimes(1);
        expect(iapConfig.getBundleId).toHaveBeenCalledTimes(1);
      }
    });

    it('throws on conflict', async () => {
      const libraryError = new Error('Purchase is not registerable');
      libraryError.name = PurchaseUpdateError.CONFLICT;

      appleIap.purchaseManager = {
        registerToUserAccount: jest.fn().mockRejectedValue(libraryError),
      };
      iapConfig.getBundleId = jest.fn().mockResolvedValue('testPackage');
      try {
        await appleIapHandler.registerOriginalTransactionId(request);
        throw new Error('Expected failure');
      } catch (err: any) {
        expect(err.errno).toBe(error.ERRNO.IAP_PURCHASE_ALREADY_REGISTERED);
        expect(
          appleIap.purchaseManager.registerToUserAccount
        ).toHaveBeenCalledTimes(1);
        expect(iapConfig.getBundleId).toHaveBeenCalledTimes(1);
      }
    });

    it('throws on unknown errors', async () => {
      appleIap.purchaseManager = {
        registerToUserAccount: jest
          .fn()
          .mockRejectedValue(new Error('Unknown error')),
      };
      iapConfig.getBundleId = jest.fn().mockResolvedValue('testPackage');
      try {
        await appleIapHandler.registerOriginalTransactionId(request);
        throw new Error('Expected failure');
      } catch (err: any) {
        expect(err.errno).toBe(error.ERRNO.BACKEND_SERVICE_FAILURE);
        expect(
          appleIap.purchaseManager.registerToUserAccount
        ).toHaveBeenCalledTimes(1);
        expect(iapConfig.getBundleId).toHaveBeenCalledTimes(1);
      }
    });
  });

  describe('processNotification', () => {
    const mockBundleId = 'testPackage';
    const mockOriginalTransactionId = '123';

    let mockDecodedNotificationPayload: any;
    let mockPurchase: any;
    let mockRequest: any;

    beforeEach(() => {
      mockDecodedNotificationPayload = {
        notificationType: 'WOW',
        subtype: 'IMPRESS',
      };
      mockPurchase = {
        userId: 'test1234',
      };
      mockRequest = {
        payload: {
          signedPayload: 'base64 encoded string',
        },
      };
      appleIap.purchaseManager = {
        decodeNotificationPayload: jest.fn().mockResolvedValue({
          bundleId: mockBundleId,
          originalTransactionId: mockOriginalTransactionId,
          decodedPayload: mockDecodedNotificationPayload,
        }),
        getSubscriptionPurchase: jest.fn().mockResolvedValue(mockPurchase),
        processNotification: jest.fn().mockResolvedValue({}),
      };
    });

    it('handles a notification that requires profile updating', async () => {
      const result = await appleIapHandler.processNotification(mockRequest);
      expect(result).toEqual({});
      expect(
        appleIap.purchaseManager.decodeNotificationPayload
      ).toHaveBeenCalledTimes(1);
      expect(
        appleIap.purchaseManager.decodeNotificationPayload
      ).toHaveBeenCalledWith(mockRequest.payload.signedPayload);
      expect(
        appleIap.purchaseManager.getSubscriptionPurchase
      ).toHaveBeenCalledTimes(1);
      expect(
        appleIap.purchaseManager.processNotification
      ).toHaveBeenCalledTimes(1);
      expect(mockCapabilityService.iapUpdate).toHaveBeenCalledTimes(1);
      expect(log.debug).toHaveBeenCalledTimes(1);
      expect(log.debug).toHaveBeenCalledWith(
        'appleIap.processNotification.decodedPayload',
        {
          bundleId: mockBundleId,
          originalTransactionId: mockOriginalTransactionId,
          notificationType: mockDecodedNotificationPayload.notificationType,
          notificationSubtype: mockDecodedNotificationPayload.subtype,
        }
      );
    });

    it("doesn't log a notificationSubtype when omitted from the notification", async () => {
      delete mockDecodedNotificationPayload.subtype;
      const result = await appleIapHandler.processNotification(mockRequest);
      expect(result).toEqual({});
      expect(log.debug).toHaveBeenCalledTimes(1);
      expect(log.debug).toHaveBeenCalledWith(
        'appleIap.processNotification.decodedPayload',
        {
          bundleId: mockBundleId,
          originalTransactionId: mockOriginalTransactionId,
          notificationType: mockDecodedNotificationPayload.notificationType,
        }
      );
    });

    it('throws an unauthorized error on certificate validation failure', async () => {
      appleIap.purchaseManager.decodeNotificationPayload = jest
        .fn()
        .mockRejectedValue(new CertificateValidationError());
      try {
        await appleIapHandler.processNotification(mockRequest);
        throw new Error('Should have thrown.');
      } catch (err: any) {
        expect(err.output.statusCode).toBe(401);
        expect(err.message).toBe('Unauthorized for route');
      }
    });

    it('rethrows any other type of error if decoding the notification fails', async () => {
      appleIap.purchaseManager.decodeNotificationPayload = jest
        .fn()
        .mockRejectedValue(new Error('Yikes'));
      try {
        await appleIapHandler.processNotification(mockRequest);
        throw new Error('Should have thrown.');
      } catch (err: any) {
        expect(err.message).toBe('Yikes');
      }
    });

    it('Still processes the notification if the purchase is not found in Firestore', async () => {
      appleIap.purchaseManager.getSubscriptionPurchase = jest
        .fn()
        .mockResolvedValue(null);
      const result = await appleIapHandler.processNotification(mockRequest);
      expect(result).toEqual({});
      expect(
        appleIap.purchaseManager.processNotification
      ).toHaveBeenCalledTimes(1);
    });

    it('Still processes the notification if there is no user id but does not broadcast', async () => {
      mockPurchase.userId = null;
      const result = await appleIapHandler.processNotification(mockRequest);
      expect(result).toEqual({});
      expect(
        appleIap.purchaseManager.processNotification
      ).toHaveBeenCalledTimes(1);
      expect(mockCapabilityService.iapUpdate).not.toHaveBeenCalled();
    });
  });
});
