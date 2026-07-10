/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Container } from 'typedi';
import { MozillaSubscriptionTypes } from 'fxa-shared/subscriptions/types';

import { AppConfig } from '../../../types';
import { AppleIAP } from './apple-iap';
import { AppStoreSubscriptions } from './subscriptions';

const { StripeHelper } = require('../../stripe');
const { deepCopy } = require('../../../../test/local/payments/util');

describe('AppStoreSubscriptions', () => {
  const UID = 'uid8675309';

  let appStoreSubscriptions: any;
  let mockAppleIap: any;
  let mockStripeHelper: any;
  let mockConfig: any;

  const mockAppStoreSubscriptionPurchase = {
    autoRenewStatus: 1,
    productId: 'wow',
    bundleId: 'hmm',
    isEntitlementActive: jest.fn().mockReturnValue(true),
  };

  const mockAppendedAppStoreSubscriptionPurchase = {
    ...mockAppStoreSubscriptionPurchase,
    price_id: 'price_123',
    product_id: 'prod_123',
    product_name: 'Cooking with Foxkeh',
    _subscription_type: MozillaSubscriptionTypes.IAP_APPLE,
  };

  beforeEach(() => {
    mockConfig = { subscriptions: { enabled: true } };
    mockAppleIap = {
      purchaseManager: {
        queryCurrentSubscriptionPurchases: jest
          .fn()
          .mockResolvedValue([mockAppStoreSubscriptionPurchase]),
      },
    };
    Container.set(AppleIAP, mockAppleIap);
    mockStripeHelper = {
      addPriceInfoToIapPurchases: jest
        .fn()
        .mockResolvedValue([mockAppendedAppStoreSubscriptionPurchase]),
    };
    Container.set(StripeHelper, mockStripeHelper);
    Container.set(AppConfig, mockConfig);
    appStoreSubscriptions = new AppStoreSubscriptions();
  });

  afterEach(() => {
    Container.reset();
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('throws if subscriptions are not enabled', async () => {
      mockConfig.subscriptions.enabled = false;
      expect(() => new AppStoreSubscriptions()).toThrow(
        'An internal validation check failed.'
      );
    });
    it('throws if StripeHelper is undefined', async () => {
      Container.remove(StripeHelper);
      expect(() => new AppStoreSubscriptions()).toThrow(
        'An internal validation check failed.'
      );
    });
  });

  describe('getSubscriptions', () => {
    it('returns active App Store subscription purchases', async () => {
      const result = await appStoreSubscriptions.getSubscriptions(UID);
      expect(
        mockAppleIap.purchaseManager.queryCurrentSubscriptionPurchases
      ).toHaveBeenCalledTimes(1);
      expect(
        mockAppleIap.purchaseManager.queryCurrentSubscriptionPurchases
      ).toHaveBeenCalledWith(UID);
      expect(mockStripeHelper.addPriceInfoToIapPurchases).toHaveBeenCalledTimes(
        1
      );
      expect(mockStripeHelper.addPriceInfoToIapPurchases).toHaveBeenCalledWith(
        [mockAppStoreSubscriptionPurchase],
        MozillaSubscriptionTypes.IAP_APPLE
      );
      const expected = [mockAppendedAppStoreSubscriptionPurchase];
      expect(expected).toEqual(result);
    });
    it('returns [] if no active App Store subscriptions are found', async () => {
      const mockInactivePurchase = deepCopy(mockAppStoreSubscriptionPurchase);
      mockInactivePurchase.isEntitlementActive = jest
        .fn()
        .mockReturnValue(false);
      mockAppleIap.purchaseManager.queryCurrentSubscriptionPurchases = jest
        .fn()
        .mockResolvedValue([mockInactivePurchase]);
      // In this case, we expect the length of the array returned by
      // addPriceInfoToIapPurchases to equal the length the array passed into it.
      mockStripeHelper.addPriceInfoToIapPurchases = jest
        .fn()
        .mockImplementation((arg: any) => Promise.resolve(arg));
      const expected: any[] = [];
      const result = await appStoreSubscriptions.getSubscriptions(UID);
      expect(result).toEqual(expected);
    });
    it('returns [] if AppleIAP is undefined', async () => {
      Container.remove(AppleIAP);
      appStoreSubscriptions = new AppStoreSubscriptions();
      const expected: any[] = [];
      const result = await appStoreSubscriptions.getSubscriptions(UID);
      expect(result).toEqual(expected);
    });
  });
});
