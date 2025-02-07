/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { StripeClient } from '@fxa/payments/stripe';
import { Injectable } from '@nestjs/common';
import Stripe from 'stripe';
import { StripeWebhookEventResponse } from './types';

@Injectable()
export class StripeEventManager {
  constructor(private stripeClient: StripeClient) {}

  constructWebhookEventResponse(
    payload: any,
    signature: string
  ): StripeWebhookEventResponse {
    const stripeEvent = this.stripeClient.constructWebhookEvent(
      payload,
      signature
    );

    switch (stripeEvent.type) {
      case 'customer.subscription.deleted':
        return {
          type: 'customer.subscription.deleted',
          event: stripeEvent,
          eventObjectData: stripeEvent.data.object as Stripe.Subscription,
        };
      default:
        return {
          type: stripeEvent.type,
          event: stripeEvent,
          eventObjectData: stripeEvent.data.object,
        };
    }
  }
}
