/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Injectable } from '@nestjs/common';
import { StripeClient } from '@fxa/payments/stripe';
import { SetupIntentCancelInvalidStatusError } from './customer.error';

@Injectable()
export class SetupIntentManager {
  constructor(private stripeClient: StripeClient) {}

  async createAndConfirm(customerId: string, confirmationToken: string) {
    return this.stripeClient.setupIntentCreate({
      customer: customerId,
      confirm: true,
      confirmation_token: confirmationToken,
      automatic_payment_methods: {
        enabled: true,
        allow_redirects: 'never',
      },
      use_stripe_sdk: true,
    });
  }

  async retrieve(setupIntentId: string) {
    return this.stripeClient.setupIntentRetrieve(setupIntentId);
  }

  async cancel(setupIntentId: string, setupIntentStatus?: string) {
    if (
      setupIntentStatus &&
      ![
        'requires_payment_method',
        'requires_confirmation',
        'requires_action',
      ].includes(setupIntentStatus)
    ) {
      throw new SetupIntentCancelInvalidStatusError(
        setupIntentId,
        setupIntentStatus
      );
    }

    return this.stripeClient.setupIntentCancel(setupIntentId);
  }
}
