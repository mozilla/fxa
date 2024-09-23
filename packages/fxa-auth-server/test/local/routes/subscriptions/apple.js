/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

import sinon from 'sinon';
import { Container } from 'typedi';
const assert = { ...sinon.assert, ...require('chai').assert };

import mocks from '../../../mocks';
import { AppleIapHandler } from '../../../../lib/routes/subscriptions/apple';
import { PurchaseUpdateError } from '../../../../lib/payments/iap/apple-app-store/types/errors';
import error from '../../../../lib/error';
import { AuthLogger } from '../../../../lib/types';
import { AppleIAP } from '../../../../lib/payments/iap/apple-app-store/apple-iap';
import { IAPConfig } from '../../../../lib/payments/iap/iap-config';
import { OAUTH_SCOPE_SUBSCRIPTIONS_IAP } from 'fxa-shared/oauth/constants';
import { CapabilityService } from '../../../../lib/payments/capability';
import { CertificateValidationError } from 'app-store-server-api/dist/cjs/Errors';

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
  let iapConfig;
  let appleIap;
  let log;
  let appleIapHandler;
  let mockCapabilityService;

  beforeEach(() => {
    log = mocks.mockLog();
    appleIap = {};
    Container.set(AuthLogger, log);
    iapConfig = {};
    Container.set(IAPConfig, iapConfig);
    Container.set(AppleIAP, appleIap);
    mockCapabilityService = {};
    mockCapabilityService.iapUpdate = sinon.fake.resolves({});
    Container.set(CapabilityService, mockCapabilityService);
    appleIapHandler = new AppleIapHandler();
  });

  afterEach(() => {
    Container.reset();
    sinon.restore();
  });

  describe('registerOriginalTransactionId', () => {
    const request = {
      ...VALID_REQUEST,
      params: { appName: 'test' },
      payload: { originalTransactionId: 'testTransactionId' },
    };

    it('returns valid with new products', async () => {
      appleIap.purchaseManager = {
        registerToUserAccount: sinon.fake.resolves({}),
      };
      iapConfig.getBundleId = sinon.fake.resolves('testPackage');
      const result = await appleIapHandler.registerOriginalTransactionId(
        request
      );
      assert.calledOnce(appleIap.purchaseManager.registerToUserAccount);
      assert.calledOnce(iapConfig.getBundleId);
      assert.calledOnce(mockCapabilityService.iapUpdate);
      assert.deepEqual(result, { transactionIdValid: true });
    });

    it('throws on invalid package', async () => {
      appleIap.purchaseManager = {
        registerToUserAccount: sinon.fake.resolves({}),
      };
      iapConfig.getBundleId = sinon.fake.resolves(undefined);
      try {
        await appleIapHandler.registerOriginalTransactionId(request);
        assert.fail('Expected failure');
      } catch (err) {
        assert.calledOnce(iapConfig.getBundleId);
        assert.strictEqual(err.errno, error.ERRNO.IAP_UNKNOWN_APPNAME);
      }
    });

    it('throws on invalid transaction id', async () => {
      const libraryError = new Error('Purchase is not registerable');
      libraryError.name = PurchaseUpdateError.INVALID_ORIGINAL_TRANSACTION_ID;

      appleIap.purchaseManager = {
        registerToUserAccount: sinon.fake.rejects(libraryError),
      };
      iapConfig.getBundleId = sinon.fake.resolves('testPackage');
      try {
        await appleIapHandler.registerOriginalTransactionId(request);
        assert.fail('Expected failure');
      } catch (err) {
        assert.strictEqual(err.errno, error.ERRNO.IAP_INVALID_TOKEN);
        assert.calledOnce(appleIap.purchaseManager.registerToUserAccount);
        assert.calledOnce(iapConfig.getBundleId);
      }
    });

    it('throws on conflict', async () => {
      const libraryError = new Error('Purchase is not registerable');
      libraryError.name = PurchaseUpdateError.CONFLICT;

      appleIap.purchaseManager = {
        registerToUserAccount: sinon.fake.rejects(libraryError),
      };
      iapConfig.getBundleId = sinon.fake.resolves('testPackage');
      try {
        await appleIapHandler.registerOriginalTransactionId(request);
        assert.fail('Expected failure');
      } catch (err) {
        assert.strictEqual(
          err.errno,
          error.ERRNO.IAP_PURCHASE_ALREADY_REGISTERED
        );
        assert.calledOnce(appleIap.purchaseManager.registerToUserAccount);
        assert.calledOnce(iapConfig.getBundleId);
      }
    });

    it('throws on unknown errors', async () => {
      appleIap.purchaseManager = {
        registerToUserAccount: sinon.fake.rejects(new Error('Unknown error')),
      };
      iapConfig.getBundleId = sinon.fake.resolves('testPackage');
      try {
        await appleIapHandler.registerOriginalTransactionId(request);
        assert.fail('Expected failure');
      } catch (err) {
        assert.strictEqual(err.errno, error.ERRNO.BACKEND_SERVICE_FAILURE);
        assert.calledOnce(appleIap.purchaseManager.registerToUserAccount);
        assert.calledOnce(iapConfig.getBundleId);
      }
    });
  });
  describe('processNotification', () => {
    const mockBundleId = 'testPackage';
    const mockOriginalTransactionId = '123';

    let mockDecodedNotificationPayload;
    let mockPurchase;
    let mockRequest;
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
        decodeNotificationPayload: sinon.fake.resolves({
          bundleId: mockBundleId,
          originalTransactionId: mockOriginalTransactionId,
          decodedPayload: mockDecodedNotificationPayload,
        }),
        getSubscriptionPurchase: sinon.fake.resolves(mockPurchase),
        processNotification: sinon.fake.resolves({}),
      };
    });

    it('handles a notification that requires profile updating', async () => {
      const result = await appleIapHandler.processNotification(mockRequest);
      assert.deepEqual(result, {});
      assert.calledOnceWithExactly(
        appleIap.purchaseManager.decodeNotificationPayload,
        mockRequest.payload.signedPayload
      );
      assert.calledOnce(appleIap.purchaseManager.getSubscriptionPurchase);
      assert.calledOnce(appleIap.purchaseManager.processNotification);
      assert.calledOnce(mockCapabilityService.iapUpdate);
      assert.calledOnceWithExactly(
        log.debug,
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
      assert.deepEqual(result, {});
      assert.calledOnceWithExactly(
        log.debug,
        'appleIap.processNotification.decodedPayload',
        {
          bundleId: mockBundleId,
          originalTransactionId: mockOriginalTransactionId,
          notificationType: mockDecodedNotificationPayload.notificationType,
        }
      );
    });

    it('throws an unauthorized error on certificate validation failure', async () => {
      appleIap.purchaseManager.decodeNotificationPayload = sinon.fake.rejects(
        new CertificateValidationError()
      );
      try {
        await appleIapHandler.processNotification(mockRequest);
        assert.fail('Should have thrown.');
      } catch (err) {
        assert.equal(err.output.statusCode, 401);
        assert.equal(err.message, 'Unauthorized for route');
      }
    });

    it('rethrows any other type of error if decoding the notification fails', async () => {
      appleIap.purchaseManager.decodeNotificationPayload = sinon.fake.rejects(
        new Error('Yikes')
      );
      try {
        await appleIapHandler.processNotification(mockRequest);
        assert.fail('Should have thrown.');
      } catch (err) {
        assert.equal(err.message, 'Yikes');
      }
    });

    it('Still processes the notification if the purchase is not found in Firestore', async () => {
      appleIap.purchaseManager.getSubscriptionPurchase =
        sinon.fake.resolves(null);
      const result = await appleIapHandler.processNotification(mockRequest);
      assert.deepEqual(result, {});
      assert.calledOnce(appleIap.purchaseManager.processNotification);
    });

    it('Still processes the notification if there is no user id but does not broadcast', async () => {
      mockPurchase.userId = null;
      const result = await appleIapHandler.processNotification(mockRequest);
      assert.deepEqual(result, {});
      assert.calledOnce(appleIap.purchaseManager.processNotification);
      assert.notCalled(mockCapabilityService.iapUpdate);
    });
  });
});
