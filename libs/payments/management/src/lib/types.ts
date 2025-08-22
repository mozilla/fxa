/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { SubplatInterval } from '@fxa/payments/customer';

export interface AppleIapPurchase {
  storeId: string;
  expiresDate?: number;
}

export interface AppleIapSubscriptionContent extends AppleIapPurchase {
  productName: string;
  supportUrl: string;
}

export interface AppleIapPurchaseResult {
  storeIds: string[];
  purchaseDetails: AppleIapPurchase[];
}

export interface GoogleIapPurchase {
  storeId: string;
  autoRenewing: boolean;
  expiryTimeMillis: number;
  packageName: string;
  sku: string;
}

export interface GoogleIapSubscriptionContent extends GoogleIapPurchase {
  productName: string;
  supportUrl: string;
}

export interface GoogleIapPurchaseResult {
  storeIds: string[];
  purchaseDetails: GoogleIapPurchase[];
}

export interface SubscriptionContent {
  id: string;
  cancelAtPeriodEnd: boolean;
  productName: string;
  supportUrl: string;
  webIcon: string;
  canResubscribe: boolean;
  currency: string;
  interval?: SubplatInterval;
  currentInvoiceTax: number;
  currentInvoiceTotal: number;
  currentPeriodEnd: number;
  nextInvoiceDate: number;
  nextInvoiceTax?: number;
  nextInvoiceTotal?: number;
  promotionName?: string | null;
}
