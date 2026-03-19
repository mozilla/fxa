/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/** Migrated from test/local/payments/iap/google-play/subscriptions.js (Mocha → Jest). */

import sinon from 'sinon';
import { Container } from 'typedi';
import { MozillaSubscriptionTypes } from 'fxa-shared/subscriptions/types';

import { AppConfig } from '../../../types';
import { PlayBilling } from '.';
import { PlaySubscriptions } from './subscriptions';

const { StripeHelper } = require('../../stripe');
const { deepCopy } = require('../../../../test/local/payments/util');

describe('PlaySubscriptions', () => {
  const UID = 'uid8675309';
  const sandbox = sinon.createSandbox();

  let playSubscriptions: any;
  let mockPlayBilling: any;
  let mockStripeHelper: any;
  let mockConfig: any;

  // No cancelReason = 1
  const mockPlayStoreSubscriptionPurchase = {
    kind: 'androidpublisher#subscriptionPurchase',
    startTimeMillis: `${Date.now() - 10000}`,
    expiryTimeMillis: `${Date.now() + 10000}`,
    autoRenewing: true,
    priceCurrencyCode: 'JPY',
    priceAmountMicros: '99000000',
    countryCode: 'JP',
    developerPayload: '',
    paymentState: 1,
    orderId: 'GPA.3313-5503-3858-32549',
    packageName: 'testPackage',
    purchaseToken: 'testToken',
    sku: 'sku',
    verifiedAt: Date.now(),
    isEntitlementActive: sinon.fake.returns(true),
  };

  const mockAppendedPlayStoreSubscriptionPurchase = {
    ...mockPlayStoreSubscriptionPurchase,
    price_id: 'price_lol',
    product_id: 'prod_lol',
    product_name: 'LOL Product',
    _subscription_type: MozillaSubscriptionTypes.IAP_GOOGLE,
  };

  beforeEach(() => {
    mockConfig = { subscriptions: { enabled: true } };
    mockPlayBilling = {
      userManager: {
        queryCurrentSubscriptions: sinon
          .stub()
          .resolves([mockPlayStoreSubscriptionPurchase]),
      },
      purchaseManager: {},
    };
    Container.set(PlayBilling, mockPlayBilling);
    mockStripeHelper = {
      addPriceInfoToIapPurchases: sinon
        .stub()
        .resolves([mockAppendedPlayStoreSubscriptionPurchase]),
    };
    Container.set(StripeHelper, mockStripeHelper);
    Container.set(AppConfig, mockConfig);
    playSubscriptions = new PlaySubscriptions();
  });

  afterEach(() => {
    Container.reset();
    sandbox.reset();
  });

  describe('constructor', () => {
    it('throws if subscriptions are not enabled', async () => {
      mockConfig.subscriptions.enabled = false;
      expect(() => new PlaySubscriptions()).toThrow(
        'An internal validation check failed.'
      );
    });
    it('throws if StripeHelper is undefined', async () => {
      Container.remove(StripeHelper);
      expect(() => new PlaySubscriptions()).toThrow(
        'An internal validation check failed.'
      );
    });
  });

  describe('getSubscriptions', () => {
    it('returns active Google Play subscription purchases', async () => {
      const result = await playSubscriptions.getSubscriptions(UID);
      sinon.assert.calledOnceWithExactly(
        mockPlayBilling.userManager.queryCurrentSubscriptions,
        UID
      );
      sinon.assert.calledOnceWithExactly(
        mockStripeHelper.addPriceInfoToIapPurchases,
        [mockPlayStoreSubscriptionPurchase],
        MozillaSubscriptionTypes.IAP_GOOGLE
      );
      const expected = [mockAppendedPlayStoreSubscriptionPurchase];
      expect(expected).toEqual(result);
    });

    it('returns [] if no active Play subscriptions are found', async () => {
      const mockInactivePurchase = deepCopy(mockPlayStoreSubscriptionPurchase);
      mockInactivePurchase.isEntitlementActive = sinon.fake.returns(false);
      mockPlayBilling.userManager.queryCurrentSubscriptions = sinon
        .stub()
        .resolves([mockInactivePurchase]);
      // In this case, we expect the length of the array returned by
      // addPriceInfoToIapPurchases to equal the length the array passed into it.
      mockStripeHelper.addPriceInfoToIapPurchases = sinon.stub().resolvesArg(0);
      const expected: any[] = [];
      const result = await playSubscriptions.getSubscriptions(UID);
      expect(result).toEqual(expected);
    });
    it('returns [] if PlayBilling is undefined', async () => {
      Container.remove(PlayBilling);
      playSubscriptions = new PlaySubscriptions();
      const expected: any[] = [];
      const result = await playSubscriptions.getSubscriptions(UID);
      expect(result).toEqual(expected);
    });
  });
});
