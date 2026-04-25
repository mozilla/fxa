/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { faker } from '@faker-js/faker';

import type {
  AppleIapSubscription,
  BillingAndSubscriptionsResponse,
  GoogleIapSubscription,
  PriceInfo,
  WebSubscription,
} from './billing-and-subscriptions.schema';

export const PriceInfoFactory = (override?: Partial<PriceInfo>): PriceInfo => ({
  amount: faker.number.int({ min: 100, max: 10000 }),
  currency: faker.finance.currencyCode().toLowerCase(),
  interval: faker.helpers.arrayElement(['day', 'week', 'month', 'year']),
  interval_count: 1,
  ...override,
});

export const WebSubscriptionFactory = (
  override?: Partial<WebSubscription>
): WebSubscription => ({
  _subscription_type: 'web',
  created: faker.number.int(),
  current_period_end: faker.number.int(),
  current_period_start: faker.number.int(),
  cancel_at_period_end: false,
  end_at: null,
  plan_id: `price_${faker.string.alphanumeric({ length: 24 })}`,
  product_id: `prod_${faker.string.alphanumeric({ length: 14 })}`,
  priceInfo: PriceInfoFactory(),
  status: 'active',
  subscription_id: `sub_${faker.string.alphanumeric({ length: 24 })}`,
  ...override,
});

export const GoogleIapSubscriptionFactory = (
  override?: Partial<GoogleIapSubscription>
): GoogleIapSubscription => ({
  _subscription_type: 'iap_google',
  auto_renewing: true,
  expiry_time_millis: faker.number.int(),
  package_name: faker.internet.domainName(),
  sku: faker.string.alphanumeric({ length: 16 }),
  price_id: `price_${faker.string.alphanumeric({ length: 24 })}`,
  product_id: `prod_${faker.string.alphanumeric({ length: 14 })}`,
  product_name: faker.commerce.productName(),
  priceInfo: PriceInfoFactory(),
  ...override,
});

export const AppleIapSubscriptionFactory = (
  override?: Partial<AppleIapSubscription>
): AppleIapSubscription => ({
  _subscription_type: 'iap_apple',
  app_store_product_id: faker.string.alphanumeric({ length: 16 }),
  auto_renewing: true,
  bundle_id: faker.internet.domainName(),
  price_id: `price_${faker.string.alphanumeric({ length: 24 })}`,
  product_id: `prod_${faker.string.alphanumeric({ length: 14 })}`,
  product_name: faker.commerce.productName(),
  priceInfo: PriceInfoFactory(),
  ...override,
});

export const BillingAndSubscriptionsResponseFactory = (
  override?: Partial<BillingAndSubscriptionsResponse>
): BillingAndSubscriptionsResponse => ({
  subscriptions: [],
  ...override,
});

export const IapOfferingFactory = (
  override: {
    storeId?: string;
    stripePlanChoice?: string;
    interval?: string;
  } = {}
) => ({
  storeID: override.storeId ?? faker.string.alphanumeric({ length: 16 }),
  interval: override.interval ?? 'monthly',
  offering: {
    apiIdentifier: 'offering-x',
    commonContent: { supportUrl: 'https://support', localizations: [] },
    defaultPurchase: {
      stripePlanChoices: [
        {
          stripePlanChoice:
            override.stripePlanChoice ??
            `price_${faker.string.alphanumeric({ length: 24 })}`,
        },
      ],
      purchaseDetails: {
        productName: 'Mock Product',
        webIcon: 'https://icon',
        localizations: [],
      },
    },
    subGroups: [],
  },
});

export const AppleIapPurchaseFactory = (
  override: Record<string, unknown> = {}
) => ({
  productId: faker.string.alphanumeric({ length: 16 }),
  bundleId: 'org.mozilla.mock',
  originalTransactionId: `otx_${faker.string.alphanumeric({ length: 12 })}`,
  expiresDate: faker.number.int(),
  isInBillingRetry: false,
  willRenew: () => true,
  isEntitlementActive: () => true,
  currency: 'usd',
  ...override,
});

export const GoogleIapPurchaseFactory = (
  override: Record<string, unknown> = {}
) => ({
  sku: faker.string.alphanumeric({ length: 16 }),
  packageName: 'org.mozilla.mock',
  purchaseToken: `tok_${faker.string.alphanumeric({ length: 12 })}`,
  autoRenewing: true,
  expiryTimeMillis: faker.number.int(),
  priceCurrencyCode: 'usd',
  cancelReason: undefined,
  isEntitlementActive: () => true,
  ...override,
});
