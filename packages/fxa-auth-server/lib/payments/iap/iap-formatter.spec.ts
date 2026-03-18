/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/** Migrated from test/local/payments/iap-formatter.js (Mocha → Jest). */

import sinon from 'sinon';
import { MozillaSubscriptionTypes } from 'fxa-shared/subscriptions/types';

import {
  appStoreSubscriptionPurchaseToAppStoreSubscriptionDTO,
  playStoreSubscriptionPurchaseToPlayStoreSubscriptionDTO,
} from './iap-formatter';

const { deepCopy } = require('../../../test/local/payments/util');

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
    expect(subscription).toEqual(mockFormattedPlayStoreSubscription);
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
    expect(subscription).toEqual(expected);
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
      deepCopy(mockAppendedAppStoreSubscriptionPurchase) as any
    );
    expect(subscription).toEqual(mockFormattedAppStoreSubscription);
  });

  it('formats an appended AppStoreSubscriptionPurchase with optional properties', () => {
    const appendedSubscriptionWithOptions = deepCopy(
      mockAppendedAppStoreSubscriptionPurchase
    );
    appendedSubscriptionWithOptions.expiresDate = 1234567890;
    appendedSubscriptionWithOptions.isInBillingRetry = true;
    const subscription = appStoreSubscriptionPurchaseToAppStoreSubscriptionDTO(
      appendedSubscriptionWithOptions as any
    );
    const expected = deepCopy(mockFormattedAppStoreSubscription);
    expected.expiry_time_millis = appendedSubscriptionWithOptions.expiresDate;
    expected.is_in_billing_retry_period =
      appendedSubscriptionWithOptions.isInBillingRetry;
    expect(subscription).toEqual(expected);
  });
});
