/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const sinon = require('sinon');
const assert = { ...sinon.assert, ...require('chai').assert };
const { Container } = require('typedi');
const {
  AppleIAP,
} = require('../../../../../lib/payments/iap/apple-app-store/apple-iap');
const {
  AppStoreSubscriptions,
} = require('../../../../../lib/payments/iap/apple-app-store/subscriptions');
const { MozillaSubscriptionTypes } = require('fxa-shared/subscriptions/types');
const { AppConfig } = require('../../../../../lib/types');
const { StripeHelper } = require('../../../../../lib/payments/stripe');
const { deepCopy } = require('../../util');

describe('AppStoreSubscriptions', () => {
  const UID = 'uid8675309';
  const sandbox = sinon.createSandbox();

  let appStoreSubscriptions, mockAppleIap, mockStripeHelper, mockConfig;

  const mockAppStoreSubscriptionPurchase = {
    autoRenewStatus: 1,
    productId: 'wow',
    bundleId: 'hmm',
    isEntitlementActive: sinon.fake.returns(true),
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
        queryCurrentSubscriptionPurchases: sinon
          .stub()
          .resolves([mockAppStoreSubscriptionPurchase]),
      },
    };
    Container.set(AppleIAP, mockAppleIap);
    mockStripeHelper = {
      addPriceInfoToIapPurchases: sinon
        .stub()
        .resolves([mockAppendedAppStoreSubscriptionPurchase]),
    };
    Container.set(StripeHelper, mockStripeHelper);
    Container.set(AppConfig, mockConfig);
    appStoreSubscriptions = new AppStoreSubscriptions();
  });

  afterEach(() => {
    Container.reset();
    sandbox.reset();
  });

  describe('constructor', () => {
    it('throws if subscriptions are not enabled', async () => {
      mockConfig.subscriptions.enabled = false;
      try {
        appStoreSubscriptions = new AppStoreSubscriptions();
        assert.fail('Should have thrown');
      } catch (error) {
        assert.equal(error.message, 'An internal validation check failed.');
      }
    });
    it('throws if StripeHelper is undefined', async () => {
      Container.remove(StripeHelper);
      try {
        appStoreSubscriptions = new AppStoreSubscriptions();
        assert.fail('Should have thrown');
      } catch (error) {
        assert.equal(error.message, 'An internal validation check failed.');
      }
    });
  });

  describe('getSubscriptions', () => {
    it('returns active App Store subscription purchases', async () => {
      const result = await appStoreSubscriptions.getSubscriptions(UID);
      assert.calledOnceWithExactly(
        mockAppleIap.purchaseManager.queryCurrentSubscriptionPurchases,
        UID
      );
      assert.calledOnceWithExactly(
        mockStripeHelper.addPriceInfoToIapPurchases,
        [mockAppStoreSubscriptionPurchase],
        MozillaSubscriptionTypes.IAP_APPLE
      );
      const expected = [mockAppendedAppStoreSubscriptionPurchase];
      assert.deepEqual(expected, result);
    });
    it('returns [] if no active App Store subscriptions are found', async () => {
      const mockInactivePurchase = deepCopy(mockAppStoreSubscriptionPurchase);
      mockInactivePurchase.isEntitlementActive = sinon.fake.returns(false);
      mockAppleIap.purchaseManager.queryCurrentSubscriptionPurchases = sinon
        .stub()
        .resolves([mockInactivePurchase]);
      // In this case, we expect the length of the array returned by
      // addPriceInfoToIapPurchases to equal the length the array passed into it.
      mockStripeHelper.addPriceInfoToIapPurchases = sinon.stub().resolvesArg(0);
      const expected = [];
      const result = await appStoreSubscriptions.getSubscriptions(UID);
      assert.deepEqual(result, expected);
    });
    it('returns [] if AppleIAP is undefined', async () => {
      Container.remove(AppleIAP);
      appStoreSubscriptions = new AppStoreSubscriptions();
      const expected = [];
      const result = await appStoreSubscriptions.getSubscriptions(UID);
      assert.deepEqual(result, expected);
    });
  });
});
