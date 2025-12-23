/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {
  SubPlatPaymentMethodType,
  SubplatInterval,
} from '@fxa/payments/customer';

export interface AppleIapPurchase {
  storeId: string;
  expiresDate?: number;
}

export interface AppleIapSubscriptionContent extends AppleIapPurchase {
  productName: string;
  supportUrl: string;
  webIcon: string;
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
  webIcon: string;
}

export interface GoogleIapPurchaseResult {
  storeIds: string[];
  purchaseDetails: GoogleIapPurchase[];
}

export type CancelFlowResult =
  | { flowType: 'not_found' }
  | {
      flowType: 'cancel';
      active: boolean;
      cancelAtPeriodEnd: boolean;
      currentPeriodEnd: number;
      productName: string;
      supportUrl: string;
      webIcon: string;
    };

export type StaySubscribedFlowResult =
  | { flowType: 'not_found' }
  | {
      flowType: 'stay_subscribed';
      active: boolean;
      cancelAtPeriodEnd: boolean;
      currency: string;
      currentPeriodEnd: number;
      defaultPaymentMethodType?: SubPlatPaymentMethodType;
      last4?: string;
      nextInvoiceTax?: number;
      nextInvoiceTotal?: number;
      productName: string;
      webIcon: string;
    };

export interface SubscriptionContent {
  id: string;
  cancelAtPeriodEnd: boolean;
  productName: string;
  offeringApiIdentifier: string;
  supportUrl: string;
  webIcon: string;
  canResubscribe: boolean;
  currency: string;
  interval?: SubplatInterval;
  creditApplied: number | null;
  currentInvoiceDate: number;
  currentInvoiceTax: number;
  currentInvoiceTotal: number;
  currentInvoiceUrl?: string | null;
  currentPeriodEnd: number;
  nextInvoiceDate: number;
  nextInvoiceTax?: number;
  nextInvoiceTotal?: number;
  nextPromotionName?: string | null;
  promotionName?: string | null;
  isEligibleForChurnStaySubscribed: boolean;
  churnStaySubscribedCtaMessage?: string | null;
}

export enum ChurnErrorReason {
  OfferExpired = 'no_churn_intervention_found',
  DiscountAlreadyApplied = 'discount_already_applied',
  SubscriptionNotActive = 'subscription_not_active',
  SubscriptionStillActive = 'subscription_still_active',
  GeneralError = 'general_error',
}
