/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

import { assert } from 'chai';
import sinon from 'sinon';
import { deepCopy } from './util';
import { MozillaSubscriptionTypes } from 'fxa-shared/subscriptions/types';

import {
  appStoreSubscriptionPurchaseToAppStoreSubscriptionDTO,
  playStoreSubscriptionPurchaseToPlayStoreSubscriptionDTO,
} from '../../../lib/payments/iap/iap-formatter.ts';

const mockExtraStripeInfo = {
  price_id: 'price_lol',
  product_id: 'prod_lol',
  product_name: 'LOL Product',
};

describe('playStoreSubscriptionPurchaseToPlayStoreSubscriptionDTO', () => {
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
    ...mockExtraStripeInfo,
    _subscription_type: MozillaSubscriptionTypes.IAP_GOOGLE,
  };

  const mockFormattedPlayStoreSubscription = {
    auto_renewing: mockPlayStoreSubscriptionPurchase.autoRenewing,
    expiry_time_millis: mockPlayStoreSubscriptionPurchase.expiryTimeMillis,
    package_name: mockPlayStoreSubscriptionPurchase.packageName,
    sku: mockPlayStoreSubscriptionPurchase.sku,
    ...mockExtraStripeInfo,
    _subscription_type: MozillaSubscriptionTypes.IAP_GOOGLE,
  };

  it('formats an appended PlayStoreSubscriptionPurchase', () => {
    const subscription =
      playStoreSubscriptionPurchaseToPlayStoreSubscriptionDTO(
        deepCopy(mockAppendedPlayStoreSubscriptionPurchase)
      );
    assert.deepEqual(subscription, mockFormattedPlayStoreSubscription);
  });

  it('formats an appended PlayStoreSubscriptionPurchase with optional properties', () => {
    const appendedSubscriptionWithOptions = deepCopy(
      mockAppendedPlayStoreSubscriptionPurchase
    );
    appendedSubscriptionWithOptions.cancelReason = 1;
    const subscription =
      playStoreSubscriptionPurchaseToPlayStoreSubscriptionDTO(
        appendedSubscriptionWithOptions
      );
    const expected = deepCopy(mockFormattedPlayStoreSubscription);
    expected.cancel_reason = appendedSubscriptionWithOptions.cancelReason;
    assert.deepEqual(subscription, expected);
  });
});

describe('appStoreSubscriptionPurchaseToAppStoreSubscriptionDTO', () => {
  const mockAppStoreSubscriptionPurchase = {
    autoRenewStatus: 1,
    productId: 'wow',
    bundleId: 'hmm',
    isEntitlementActive: sinon.fake.returns(true),
  };

  const mockAppendedAppStoreSubscriptionPurchase = {
    ...mockAppStoreSubscriptionPurchase,
    ...mockExtraStripeInfo,
    _subscription_type: MozillaSubscriptionTypes.IAP_APPLE,
  };

  const mockFormattedAppStoreSubscription = {
    _subscription_type: MozillaSubscriptionTypes.IAP_APPLE,
    app_store_product_id: 'wow',
    auto_renewing: true,
    bundle_id: 'hmm',
    ...mockExtraStripeInfo,
  };

  it('formats an appended AppStoreSubscriptionPurchase', () => {
    const subscription = appStoreSubscriptionPurchaseToAppStoreSubscriptionDTO(
      deepCopy(mockAppendedAppStoreSubscriptionPurchase)
    );
    assert.deepEqual(subscription, mockFormattedAppStoreSubscription);
  });

  it('formats an appended AppStoreSubscriptionPurchase with optional properties', () => {
    const appendedSubscriptionWithOptions = deepCopy(
      mockAppendedAppStoreSubscriptionPurchase
    );
    appendedSubscriptionWithOptions.expiresDate = 1234567890;
    appendedSubscriptionWithOptions.isInBillingRetry = true;
    const subscription = appStoreSubscriptionPurchaseToAppStoreSubscriptionDTO(
      appendedSubscriptionWithOptions
    );
    const expected = deepCopy(mockFormattedAppStoreSubscription);
    expected.expiry_time_millis = appendedSubscriptionWithOptions.expiresDate;
    expected.is_in_billing_retry_period =
      appendedSubscriptionWithOptions.isInBillingRetry;
    assert.deepEqual(subscription, expected);
  });
});
