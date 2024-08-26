/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Injectable } from '@nestjs/common';
import { Stripe } from 'stripe';
import { StripeClient } from './stripe.client';

@Injectable()
export class PaymentMethodManager {
  constructor(private stripeClient: StripeClient) {}

  async attach(
    paymentMethodId: string,
    params: Stripe.PaymentMethodAttachParams
  ) {
    return this.stripeClient.paymentMethodsAttach(paymentMethodId, params);
  }
}
