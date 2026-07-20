/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { faker } from '@faker-js/faker';
import { SubplatInterval } from '@fxa/payments/customer';
import {
  AppleIapPurchase,
  AppleIapPurchaseResult,
  AppleIapSubscriptionContent,
  CancelFlowResult,
  GoogleIapPurchase,
  GoogleIapPurchaseResult,
  GoogleIapSubscriptionContent,
  StaySubscribedFlowResult,
  SubscriptionContent,
  TrialSubscriptionContent,
} from '../types';

export const AppleIapPurchaseFactory = (
  override?: Partial<AppleIapPurchase>
): AppleIapPurchase => ({
  storeId: faker.string.sample(),
  expiresDate: faker.date.future().getDate(),
  ...override,
});

export const AppleIapSubscriptionContentFactory = (
  override?: Partial<AppleIapSubscriptionContent>
): AppleIapSubscriptionContent => ({
  ...AppleIapPurchaseFactory(),
  productName: faker.string.sample(),
  supportUrl: faker.internet.url(),
  webIcon: faker.internet.url(),
  ...override,
});

export const AppleIapPurchaseResultFactory = (
  override?: Partial<AppleIapPurchaseResult>
): AppleIapPurchaseResult => ({
  storeIds: [faker.string.sample()],
  purchaseDetails: [AppleIapPurchaseFactory()],
  ...override,
});

export const GoogleIapPurchaseFactory = (
  override?: Partial<GoogleIapPurchase>
): GoogleIapPurchase => ({
  storeId: faker.string.sample(),
  autoRenewing: true,
  expiryTimeMillis: faker.date.future().getDate(),
  packageName: faker.string.sample(),
  sku: faker.string.sample(),
  ...override,
});

export const GoogleIapSubscriptionContentFactory = (
  override?: Partial<GoogleIapSubscriptionContent>
): GoogleIapSubscriptionContent => ({
  ...GoogleIapPurchaseFactory(),
  productName: faker.string.sample(),
  supportUrl: faker.internet.url(),
  webIcon: faker.internet.url(),
  ...override,
});

export const GoogleIapPurchaseResultFactory = (
  override?: Partial<GoogleIapPurchaseResult>
): GoogleIapPurchaseResult => ({
  storeIds: [faker.string.sample()],
  purchaseDetails: [GoogleIapPurchaseFactory()],
  ...override,
});

export const SubscriptionContentFactory = (
  override?: Partial<SubscriptionContent>
): SubscriptionContent => ({
  id: `sub_${faker.string.alphanumeric({ length: 24 })}`,
  cancelAtPeriodEnd: false,
  productName: faker.string.sample(),
  offeringApiIdentifier: faker.string.sample(),
  supportUrl: faker.internet.url(),
  webIcon: faker.internet.url(),
  canResubscribe: false,
  currency: faker.finance.currencyCode().toLowerCase(),
  interval: faker.helpers.enumValue(SubplatInterval),
  creditApplied: faker.number.int({ min: 0 }),
  currentInvoiceDate: faker.date.past().getDate(),
  currentInvoiceTax: faker.number.int({ min: 1, max: 1000 }),
  currentInvoiceTotal: faker.number.int({ min: 1, max: 1000 }),
  currentPeriodEnd: faker.date.future().getDate(),
  nextInvoiceDate: faker.date.future().getDate(),
  nextInvoiceTax: faker.number.int({ min: 1, max: 1000 }),
  nextInvoiceTotal: faker.number.int({ min: 1, max: 1000 }),
  currentInvoiceUrl: faker.internet.url(),
  nextPromotionName: null,
  promotionName: null,
  isEligibleForChurnCancel: faker.datatype.boolean(),
  isEligibleForChurnStaySubscribed: faker.datatype.boolean(),
  isEligibleForOffer: faker.datatype.boolean(),
  churnStaySubscribedCtaMessage: faker.string.sample(),
  ...override,
});

type CancelFlowContent = Extract<CancelFlowResult, { flowType: 'cancel' }>;

export const CancelFlowContentFactory = (
  override?: Partial<CancelFlowContent>
): CancelFlowContent => ({
  flowType: 'cancel',
  active: true,
  cancelAtPeriodEnd: false,
  currency: faker.finance.currencyCode().toLowerCase(),
  currentPeriodEnd: faker.date.future().getDate(),
  productName: faker.string.sample(),
  supportUrl: faker.internet.url(),
  webIcon: faker.internet.url(),
  ...override,
});

type StaySubscribedFlowContent = Extract<
  StaySubscribedFlowResult,
  { flowType: 'stay_subscribed' }
>;

export const StaySubscribedFlowContentFactory = (
  override?: Partial<StaySubscribedFlowContent>
): StaySubscribedFlowContent => ({
  flowType: 'stay_subscribed',
  active: true,
  cancelAtPeriodEnd: true,
  currency: faker.finance.currencyCode().toLowerCase(),
  currentPeriodEnd: faker.date.future().getDate(),
  productName: faker.string.sample(),
  webIcon: faker.internet.url(),
  ...override,
});

export const TrialSubscriptionContentFactory = (
  override?: Partial<TrialSubscriptionContent>
): TrialSubscriptionContent => ({
  id: `sub_${faker.string.alphanumeric({ length: 24 })}`,
  productName: faker.string.sample(),
  offeringApiIdentifier: faker.string.sample(),
  supportUrl: faker.internet.url(),
  webIcon: faker.internet.url(),
  currency: faker.finance.currencyCode().toLowerCase(),
  interval: faker.helpers.enumValue(SubplatInterval),
  cancelAtPeriodEnd: false,
  trialEnd: Math.floor(faker.date.future().getTime() / 1000),
  trialStart: Math.floor(faker.date.past().getTime() / 1000),
  nextInvoiceTotal: faker.number.int({ min: 1, max: 1000 }),
  nextInvoiceTax: faker.number.int({ min: 1, max: 1000 }),
  conversionStatus: 'active',
  failedInvoiceDate: undefined,
  failedInvoiceTotal: undefined,
  failedInvoiceTax: undefined,
  failedInvoiceUrl: undefined,
  ...override,
});
