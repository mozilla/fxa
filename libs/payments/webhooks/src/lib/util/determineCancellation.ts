/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { StripeInvoice, StripeSubscription } from '@fxa/payments/stripe';
import {
  SubPlatPaymentMethodType,
} from '@fxa/payments/customer';

export enum CancellationReason {
  CustomerInitiated = 'customer_initiated',
  Involuntary = 'involuntary',
  Redundant = 'redundant',
}

const STRIPE_PAYMENT_PROVIDER_TYPES = new Set([
  SubPlatPaymentMethodType.Card,
  SubPlatPaymentMethodType.GooglePay,
  SubPlatPaymentMethodType.ApplePay,
  SubPlatPaymentMethodType.Link,
  SubPlatPaymentMethodType.Stripe,
]);

export const determineCancellation = (
  paymentProvider: SubPlatPaymentMethodType,
  subscription: StripeSubscription,
  latestInvoice?: StripeInvoice
): CancellationReason | undefined => {
  if (subscription.metadata['redundantCancellation'] === 'true') {
    return CancellationReason.Redundant;
  }

  if (paymentProvider === SubPlatPaymentMethodType.PayPal) {
    if (!latestInvoice) {
      return undefined;
    } else {
      return latestInvoice.status !== 'uncollectible'
        ? CancellationReason.CustomerInitiated
        : CancellationReason.Involuntary;
    }
  } else if (STRIPE_PAYMENT_PROVIDER_TYPES.has(paymentProvider)) {
    return subscription.cancellation_details
      ? subscription.cancellation_details?.reason === 'cancellation_requested'
        ? CancellationReason.CustomerInitiated
        : CancellationReason.Involuntary
      : undefined;
  } else {
    return undefined;
  }
};
