/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { PaymentProvidersType } from '@fxa/payments/metrics';
import { StripeInvoice, StripeSubscription } from '@fxa/payments/stripe';

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
  if (subscription.metadata['redundantCancellation']) {
    return CancellationReason.Redundant;
  }

  if (paymentProvider === 'external_paypal') {
    if (!latestInvoice) {
      return undefined;
    } else {
      return latestInvoice.status !== 'uncollectible'
        ? CancellationReason.CustomerInitiated
        : CancellationReason.Involuntary;
    }
  } else if (paymentProvider === 'card') {
    return subscription.cancellation_details
      ? subscription.cancellation_details?.reason === 'cancellation_requested'
        ? CancellationReason.CustomerInitiated
        : CancellationReason.Involuntary
      : undefined;
  } else {
    return undefined;
  }
};
