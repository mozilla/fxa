/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { faker } from '@faker-js/faker';
import type {
  FirestoreAppleIapPurchaseRecord,
  FirestoreGoogleIapPurchaseRecord,
} from './types';
import { SubscriptionStatus } from 'app-store-server-api';
import { PaymentState, SkuType } from './google/types';
import {
  APPLE_APP_STORE_FORM_OF_PAYMENT,
  GOOGLE_PLAY_FORM_OF_PAYMENT,
} from './constants';

export const FirestoreAppleIapPurchaseRecordFactory = (
  override?: Partial<FirestoreAppleIapPurchaseRecord>
): FirestoreAppleIapPurchaseRecord => ({
  userId: faker.string.uuid(),
  autoRenewStatus: 1,
  autoRenewProductId: faker.commerce.product(),
  bundleId: faker.string.uuid(),
  environment: faker.helpers.arrayElement(['Sandbox', 'Production']),
  inAppOwnershipType: 'PURCHASED',
  originalPurchaseDate: faker.date.past().getTime(),
  originalTransactionId: faker.string.uuid(),
  productId: faker.commerce.product(),
  status: SubscriptionStatus.Active,
  transactionId: faker.string.uuid(),
  type: 'Auto-Renewable Subscription',
  verifiedAt: faker.date.recent().getTime(),
  currency: faker.finance.currencyCode(),
  price: faker.number.float({ min: 0.99, max: 99.99 }),
  storefront: faker.location.countryCode('alpha-2'),
  expiresDate: faker.date.future().getTime(),
  purchaseDate: faker.date.past().getTime(),
  renewalCurrency: faker.finance.currencyCode(),
  renewalPrice: faker.number.float({ min: 0.99, max: 99.99 }),
  latestNotificationType: 'DID_RENEW',
  formOfPayment: APPLE_APP_STORE_FORM_OF_PAYMENT,
  ...override,
});

export const FirestoreGoogleIapPurchaseRecordFactory = (
  override?: Partial<FirestoreGoogleIapPurchaseRecord>
): FirestoreGoogleIapPurchaseRecord => ({
  purchaseToken: faker.string.uuid(),
  startTimeMillis: faker.date.past().getTime(),
  orderId: faker.string.uuid(),
  kind: 'androidpublisher#subscriptionPurchase',
  formOfPayment: GOOGLE_PLAY_FORM_OF_PAYMENT,
  developerPayload: null,
  skuType: SkuType.SUBS,
  priceCurrencyCode: faker.finance.currencyCode(),
  priceAmountMicros: faker.number.int({ min: 100_000, max: 10_000_000 }),
  countryCode: faker.location.countryCode('alpha-2'),
  replacedByAnotherPurchase: false,
  packageName: faker.internet.domainName(),
  paymentState: PaymentState.RECEIVED,
  sku: faker.commerce.product(),
  userId: faker.string.uuid(),
  acknowledgementState: 0,
  userCancellationTimeMillis: faker.date.recent().getTime(),
  cancelReason: undefined,
  autoRenewing: true,
  cancelSurveyResult: undefined,
  isMutable: true,
  expiryTimeMillis: faker.date.future().getTime(),
  verifiedAt: faker.date.recent().getTime(),
  latestNotificationType: undefined,
  ...override,
});
