/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Injectable } from '@nestjs/common';
import { Stripe } from 'stripe';
import { StripeClient } from '@fxa/payments/stripe';
import { SetupIntentCancelInvalidStatusError } from './customer.error';
import type { StripeSetupIntentMetadataInput } from './types';

@Injectable()
export class SetupIntentManager {
  constructor(private stripeClient: StripeClient) {}

  async createAndConfirm(
    customerId: string,
    confirmationToken: string,
    metadata?: StripeSetupIntentMetadataInput
  ) {
    return this.stripeClient.setupIntentCreate({
      customer: customerId,
      confirm: true,
      confirmation_token: confirmationToken,
      automatic_payment_methods: {
        enabled: true,
        allow_redirects: 'never',
      },
      use_stripe_sdk: true,
      ...(metadata ? { metadata } : {}),
    });
  }

  async confirm(setupIntentId: string, confirmationTokenId: string) {
    return this.stripeClient.setupIntentConfirm(setupIntentId, {
      confirmation_token: confirmationTokenId,
    });
  }

  async update(
    setupIntentId: string,
    params: Omit<Stripe.SetupIntentUpdateParams, 'metadata'> & {
      metadata?: StripeSetupIntentMetadataInput;
    }
  ) {
    return this.stripeClient.setupIntentUpdate(setupIntentId, params);
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
