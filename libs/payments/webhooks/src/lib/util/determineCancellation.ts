/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { StripeInvoice, StripeSubscription } from '@fxa/payments/stripe';
import { PaymentProvider, PaymentProvidersType } from '@fxa/payments/customer';

export enum CancellationReason {
  CustomerInitiated = 'customer_initiated',
  Involuntary = 'involuntary',
  Redundant = 'redundant',
}

export const determineCancellation = (
  paymentProvider: PaymentProvidersType,
  subscription: StripeSubscription,
  latestInvoice?: StripeInvoice
): CancellationReason | undefined => {
  if (subscription.metadata['redundantCancellation'] === 'true') {
    return CancellationReason.Redundant;
  }

  if (paymentProvider === PaymentProvider.PayPal) {
    if (!latestInvoice) {
      return undefined;
    } else {
      return latestInvoice.status !== 'uncollectible'
        ? CancellationReason.CustomerInitiated
        : CancellationReason.Involuntary;
    }
  } else if (paymentProvider === PaymentProvider.Stripe) {
    return subscription.cancellation_details
      ? subscription.cancellation_details?.reason === 'cancellation_requested'
        ? CancellationReason.CustomerInitiated
        : CancellationReason.Involuntary
      : undefined;
  } else {
    return undefined;
  }
};
