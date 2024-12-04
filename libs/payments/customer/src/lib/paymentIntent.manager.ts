/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Injectable } from '@nestjs/common';
import { Stripe } from 'stripe';
import { StripeClient } from '@fxa/payments/stripe';

@Injectable()
export class PaymentIntentManager {
  constructor(private stripeClient: StripeClient) {}

  async confirm(
    paymentIntentId: string,
    params: Stripe.PaymentIntentConfirmParams
  ) {
    return this.stripeClient.paymentIntentConfirm(paymentIntentId, params);
  }

  async retrieve(paymentIntentId: string) {
    return this.stripeClient.paymentIntentRetrieve(paymentIntentId);
  }
}
