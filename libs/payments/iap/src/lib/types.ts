/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

export interface FirestoreAppleIapPurchaseRecord {
  userId: string;
  autoRenewStatus: number;
  autoRenewProductId: string;
  bundleId: string;
  environment: string;
  inAppOwnershipType: string;
  originalPurchaseDate: number;
  originalTransactionId: string;
  productId: string;
  status: number;
  transactionId: string;
  type: string;
  verifiedAt: number;
  currency: string;
  price: number;
  storefront: string;
  expiresDate: number;
  purchaseDate: number;
  renewalCurrency: string;
  renewalPrice: number;
  latestNotificationType: string;
  formOfPayment: 'APPLE_APP_STORE';
}

export interface FirestoreGoogleIapPurchaseRecord {
  purchaseToken: string;
  startTimeMillis: number;
  orderId: string;
  kind: string;
  formOfPayment: 'GOOGLE_PLAY';
  developerPayload: string | null;
  skuType: string;
  priceCurrencyCode: string;
  priceAmountMicros: number;
  countryCode: string;
  replacedByAnotherPurchase: boolean;
  packageName: string;
  paymentState: number;
  sku: string;
  userId: string;
  acknowledgementState: number;
  userCancellationTimeMillis: number;
  cancelReason?: number;
  autoRenewing: boolean;
  cancelSurveyResult?: {
    cancelSurveyReason: number;
  };
  isMutable: boolean;
  expiryTimeMillis: number;
  verifiedAt: number;
  latestNotificationType?: number;
}
