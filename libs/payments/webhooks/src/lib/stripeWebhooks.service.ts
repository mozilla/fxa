/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Injectable } from '@nestjs/common';

import { StripeEventManager } from './stripeEvents.manager';
import { StripeWebhookEventResponse } from './types';
import * as Sentry from '@sentry/nestjs';
import { SubscriptionEventsService } from './subscriptionHandler.service';

@Injectable()
export class StripeWebhookService {
  constructor(
    private stripeEventManager: StripeEventManager,
    private subscriptionEventsService: SubscriptionEventsService
  ) {}

  /**
   * Handle webhook events from Stripe by pre-processing the incoming
   * event and dispatching to the appropriate sub-handler. Log an info
   * message for events we don't yet handle.
   */
  async handleWebhookEvent(payload: any, signature: string) {
    try {
      const webhookEventResponse =
        this.stripeEventManager.constructWebhookEventResponse(
          payload,
          signature
        );
      await this.dispatchEventToHandler(webhookEventResponse);
    } catch (error) {
      Sentry.captureException(error);
      throw error;
    }
    return {};
  }

  private async dispatchEventToHandler(
    webhookResponse: StripeWebhookEventResponse
  ) {
    switch (webhookResponse.type) {
      case 'customer.subscription.deleted':
        this.subscriptionEventsService.handleCustomerSubscriptionDeleted(
          webhookResponse.event,
          webhookResponse.eventObjectData
        );
        break;
      default:
    }
  }
}
