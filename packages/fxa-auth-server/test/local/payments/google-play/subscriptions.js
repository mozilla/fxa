/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const sinon = require('sinon');
const assert = { ...sinon.assert, ...require('chai').assert };
const { Container } = require('typedi');
const { PlayBilling } = require('../../../../lib/payments/google-play');
const {
  PlaySubscriptions,
  abbrevPlayPurchaseFromSubscriptionPurchase,
} = require('../../../../lib/payments/google-play/subscriptions');

describe('PlaySubscriptions', () => {
  const mockConfig = { subscriptions: { enabled: true } };
  const UID = 'uid8675309';
  const sandbox = sinon.createSandbox();

  let playSubscriptions, mockPlayBilling;

  beforeEach(() => {
    mockPlayBilling = {
      userManager: {},
      purchaseManager: {},
    };
    Container.set(PlayBilling, mockPlayBilling);
    playSubscriptions = new PlaySubscriptions(mockConfig);
  });

  afterEach(() => {
    Container.reset();
    sandbox.reset();
  });

  describe('getSubscriptions', () => {
    const mockSubscriptionPurchase = {
      sku: 'play_1234',
      isEntitlementActive: sinon.fake.returns(true),
      autoRenewing: true,
      expiryTimeMillis: Date.now() + 99999,
      packageName: 'org.mozilla.cooking.with.foxkeh',
      cancelReason: 1,
    };

    it('returns an active play subscription purchase with abbreviated properties', async () => {
      const expected = {
        sku: mockSubscriptionPurchase.sku,
        auto_renewing: mockSubscriptionPurchase.autoRenewing,
        expiry_time_millis: mockSubscriptionPurchase.expiryTimeMillis,
        package_name: mockSubscriptionPurchase.packageName,
        cancel_reason: mockSubscriptionPurchase.cancelReason,
      };
      mockPlayBilling.userManager.queryCurrentSubscriptions = sinon
        .stub()
        .resolves([
          {
            ...mockSubscriptionPurchase,
            isEntitlementActive: () => true,
          },
        ]);
      const result = await playSubscriptions.getSubscriptions(UID);
      assert.calledOnceWithExactly(
        mockPlayBilling.userManager.queryCurrentSubscriptions,
        UID
      );
      assert.deepEqual([expected], result);
    });

    it('returns an empty list when there are no subscriptions', async () => {
      mockPlayBilling.userManager.queryCurrentSubscriptions = sinon
        .stub()
        .resolves([]);
      const actual = await playSubscriptions.getSubscriptions(UID);
      assert.calledOnceWithExactly(
        mockPlayBilling.userManager.queryCurrentSubscriptions,
        UID
      );
      assert.deepEqual(actual, []);
    });

    it('returns an empty list when there are no active subscriptions', async () => {
      mockPlayBilling.userManager.queryCurrentSubscriptions = sinon
        .stub()
        .resolves([
          {
            ...mockSubscriptionPurchase,
            isEntitlementActive: () => false,
          },
        ]);
      const actual = await playSubscriptions.getSubscriptions(UID);
      assert.calledOnceWithExactly(
        mockPlayBilling.userManager.queryCurrentSubscriptions,
        UID
      );
      assert.deepEqual(actual, []);
    });

    it('returns an empty list when the PlayBilling dependency is not present', async () => {
      Container.remove(PlayBilling);
      playSubscriptions = new PlaySubscriptions(mockConfig);
      const actual = await playSubscriptions.getSubscriptions(UID);
      assert.deepEqual(actual, []);
    });
  });
});

describe('abbrevPlayPurchaseFromSubscriptionPurchase', () => {
  const subscriptionPurchase = {
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
  };

  it('returns an object with the AbbrevPlayPurchase properties', () => {
    const actual =
      abbrevPlayPurchaseFromSubscriptionPurchase(subscriptionPurchase);
    assert.deepEqual(actual, {
      auto_renewing: subscriptionPurchase.autoRenewing,
      expiry_time_millis: subscriptionPurchase.expiryTimeMillis,
      package_name: subscriptionPurchase.packageName,
      sku: subscriptionPurchase.sku,
    });
  });

  it('includes the cancelReason when present', () => {
    const actual = abbrevPlayPurchaseFromSubscriptionPurchase({
      ...subscriptionPurchase,
      cancelReason: 5,
    });
    assert.deepEqual(actual, {
      auto_renewing: subscriptionPurchase.autoRenewing,
      expiry_time_millis: subscriptionPurchase.expiryTimeMillis,
      package_name: subscriptionPurchase.packageName,
      sku: subscriptionPurchase.sku,
      cancel_reason: 5,
    });
  });
});
