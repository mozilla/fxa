/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const sinon = require('sinon');
const assert = { ...sinon.assert, ...require('chai').assert };
const { Container } = require('typedi');
const { AppConfig } = require('../../../../lib/types');
const { PlayBilling } = require('../../../../lib/payments/google-play');
const {
  PlaySubscriptions,
} = require('../../../../lib/payments/google-play/subscriptions');

describe('PlaySubscriptions', () => {
  const mockConfig = { subscriptions: { enabled: true } };
  const UID = 'uid8675309';
  const sandbox = sinon.createSandbox();

  let playSubscriptions, mockPlayBilling;

  beforeEach(() => {
    Container.set(AppConfig, mockConfig);
    mockPlayBilling = {
      userManager: {},
      purchaseManager: {},
    };
    Container.set(PlayBilling, mockPlayBilling);
    playSubscriptions = new PlaySubscriptions();
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
      expiryTimeMillis: Date.now(),
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
        .resolves([mockSubscriptionPurchase]);
      const result = await playSubscriptions.getSubscriptions(UID);
      assert.calledOnceWithExactly(
        mockPlayBilling.userManager.queryCurrentSubscriptions,
        UID
      );
      assert.deepEqual([expected], result);
    });
  });
});
