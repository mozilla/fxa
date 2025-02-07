/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { PaymentProvidersType } from '@fxa/payments/metrics';
import { StripeInvoice, StripeSubscription } from '@fxa/payments/stripe';

export const determineCancellation = (
  paymentProvider: PaymentProvidersType,
  subscription: StripeSubscription,
  latestInvoice?: StripeInvoice
) => {
  if (paymentProvider === 'external_paypal') {
    if (!latestInvoice) {
      return undefined;
    } else {
      return latestInvoice.status !== 'uncollectible';
    }
  } else if (paymentProvider === 'card') {
    return subscription.cancellation_details
      ? subscription.cancellation_details?.reason === 'cancellation_requested'
      : undefined;
  } else {
    return undefined;
  }
};
