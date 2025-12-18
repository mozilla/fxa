/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { StripeClient } from '@fxa/payments/stripe';
import { Inject, Injectable, Logger } from '@nestjs/common';
import Stripe from 'stripe';
import { StripeWebhookEventResponse } from './types';
import { FirestoreService } from '@fxa/shared/db/firestore';
import type { CollectionReference, Firestore } from '@google-cloud/firestore';
import { StripeEventConfig } from './stripe-event.config';
import {
  createStripeEventStoreEntry,
  getStripeEventStoreEntry,
} from './stripe-event-store.repository';
import {
  StripeEventStoreEntryAlreadyExistsError,
  StripeEventStoreEntryNotFoundError,
} from './stripe-event-store.error';

@Injectable()
export class StripeEventManager {
  private stripeEventStoreCollection: CollectionReference;
  constructor(
    private stripeClient: StripeClient,
    private config: StripeEventConfig,
    @Inject(FirestoreService) private firestore: Firestore,
    private logger: Logger
  ) {
    this.stripeEventStoreCollection = this.firestore.collection(
      this.config.firestoreStripeEventStoreCollectionName
    );
  }

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

  async isProcessed(eventId: string) {
    try {
      const entry = await getStripeEventStoreEntry(
        this.stripeEventStoreCollection,
        eventId
      );
      return !!entry.processedAt;
    } catch (error) {
      if (error instanceof StripeEventStoreEntryNotFoundError) {
        return false;
      } else {
        throw error;
      }
    }
  }

  async markAsProcessed(event: Stripe.Event) {
    try {
      await createStripeEventStoreEntry(this.stripeEventStoreCollection, {
        eventId: event.id,
        processedAt: new Date(),
        eventDetails: event,
      });
    } catch (error) {
      if (error instanceof StripeEventStoreEntryAlreadyExistsError) {
        this.logger.warn(error);
      } else {
        throw error;
      }
    }
  }
}
