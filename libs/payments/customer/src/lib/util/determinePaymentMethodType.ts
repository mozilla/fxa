/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { StripeCustomer, StripeSubscription } from '@fxa/payments/stripe';

interface StripePaymentMethod {
  type: 'stripe';
  paymentMethodId: string;
}

interface PayPalPaymentMethod {
  type: 'external_paypal';
}

type PaymentMethodTypeResponse =
  | StripePaymentMethod
  | PayPalPaymentMethod
  | null;

export const determinePaymentMethodType = (
  customer?: StripeCustomer,
  subscriptions?: StripeSubscription[]
): PaymentMethodTypeResponse => {
  // First check if payment method is PayPal
  // Note, this needs to happen first since a customer could also have a
  // default payment method. However if PayPal is set as the payment method,
  // it should take precedence.
  if (
    subscriptions?.length &&
    subscriptions[0].collection_method === 'send_invoice'
  ) {
    return {
      type: 'external_paypal',
    };
  }

  if (customer?.invoice_settings.default_payment_method) {
    return {
      type: 'stripe',
      paymentMethodId: customer.invoice_settings.default_payment_method,
    };
  }

  return null;
};
