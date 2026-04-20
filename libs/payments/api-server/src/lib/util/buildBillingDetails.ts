/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { getCustomerPaypalAgreement } from '@fxa/payments/customer';
import type {
  StripeCustomer,
  StripePaymentMethod,
  StripeSubscription,
} from '@fxa/payments/stripe';

import type { BillingAndSubscriptionsResponse } from '../billing-and-subscriptions.schema';
import { hasSubscriptionRequiringPaymentMethod } from './hasSubscriptionRequiringPaymentMethod';

export const PAYPAL_PAYMENT_ERROR_MISSING_AGREEMENT = 'missing_agreement';
export const PAYPAL_PAYMENT_ERROR_FUNDING_SOURCE = 'funding_source';

export type BillingDetails = Pick<
  BillingAndSubscriptionsResponse,
  | 'billing_name'
  | 'exp_month'
  | 'exp_year'
  | 'last4'
  | 'payment_provider'
  | 'payment_type'
  | 'paypal_payment_error'
  | 'brand'
>;

/**
 * Shape the billing details returned by the billing-and-subscriptions
 * endpoint. Pure: callers pre-compute the payment provider, default payment
 * method, and whether any open invoice has retry attempts.
 */
export const buildBillingDetails = (input: {
  customer: StripeCustomer;
  activeSubscriptions: StripeSubscription[];
  paymentProvider: 'stripe' | 'paypal' | undefined;
  defaultPaymentMethod: StripePaymentMethod | undefined;
  hasOpenInvoiceWithRetry: boolean;
}): BillingDetails => {
  const {
    customer,
    activeSubscriptions,
    paymentProvider,
    defaultPaymentMethod,
    hasOpenInvoiceWithRetry,
  } = input;

  const details: BillingDetails = {};

  if (paymentProvider) {
    details.payment_provider = paymentProvider;
  }

  if (defaultPaymentMethod?.card) {
    details.billing_name =
      defaultPaymentMethod.billing_details.name ?? undefined;
    details.payment_type = defaultPaymentMethod.card.funding;
    details.last4 = defaultPaymentMethod.card.last4;
    details.exp_month = defaultPaymentMethod.card.exp_month;
    details.exp_year = defaultPaymentMethod.card.exp_year;
    details.brand = defaultPaymentMethod.card.brand;
  }

  if (
    paymentProvider === 'paypal' &&
    hasSubscriptionRequiringPaymentMethod(activeSubscriptions)
  ) {
    if (!getCustomerPaypalAgreement(customer)) {
      details.paypal_payment_error = PAYPAL_PAYMENT_ERROR_MISSING_AGREEMENT;
    } else if (hasOpenInvoiceWithRetry) {
      details.paypal_payment_error = PAYPAL_PAYMENT_ERROR_FUNDING_SOURCE;
    }
  }

  return details;
};
