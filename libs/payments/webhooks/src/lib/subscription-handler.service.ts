/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {
  CustomerDeletedError,
  CustomerManager,
  InvoiceManager,
  SubscriptionManager,
  PaymentMethodManager,
  PaymentProvider,
  PaymentProvidersType,
} from '@fxa/payments/customer';
import { PaymentsEmitterService } from '@fxa/payments/events';
import { Inject, Injectable } from '@nestjs/common';
import Stripe from 'stripe';
import {
  CancellationReason,
  determineCancellation,
} from './util/determineCancellation';
import { StatsD, StatsDService } from '@fxa/shared/metrics/statsd';

@Injectable()
export class SubscriptionEventsService {
  constructor(
    private subscriptionManager: SubscriptionManager,
    private customerManager: CustomerManager,
    private invoiceManager: InvoiceManager,
    private emitterService: PaymentsEmitterService,
    private paymentMethodManager: PaymentMethodManager,
    @Inject(StatsDService) private statsd: StatsD
  ) {}

  async handleCustomerSubscriptionDeleted(
    event: Stripe.Event,
    eventSubscription: Stripe.Subscription
  ) {
    const subscription = await this.subscriptionManager.retrieve(
      eventSubscription.id
    );
    const price = subscription.items.data[0].price;

    let paymentProvider: PaymentProvidersType | undefined;
    let determinedCancellation: CancellationReason | undefined;
    let uid: string | undefined;
    try {
      const customer = await this.customerManager.retrieve(
        subscription.customer
      );
      uid = customer.metadata['userid'];
      const paymentMethod = await this.paymentMethodManager.determineType(
        customer,
        [subscription]
      );
      paymentProvider = paymentMethod?.provider;

      const latestInvoice =
        paymentProvider === PaymentProvider.PayPal &&
        subscription.latest_invoice
          ? await this.invoiceManager.retrieve(subscription.latest_invoice)
          : undefined;

      determinedCancellation =
        paymentProvider &&
        determineCancellation(paymentProvider, subscription, latestInvoice);
    } catch (err) {
      if (err instanceof CustomerDeletedError) {
        paymentProvider = undefined;
        determinedCancellation = undefined;
      } else {
        throw err;
      }
    }

    // If cancellationReason could not be determined, assume it was not voluntary
    const cancellationReason =
      determinedCancellation ?? CancellationReason.Involuntary;

    this.emitterService.getEmitter().emit('subscriptionEnded', {
      productId: price.product,
      priceId: price.id,
      priceInterval: price.recurring?.interval,
      priceIntervalCount: price.recurring?.interval_count,
      paymentProvider,
      providerEventId: event.id,
      cancellationReason,
      uid,
    });
  }

  async handleCustomerSubscriptionUpdated(
    event: Stripe.Event,
    eventSubscription: Stripe.Subscription
  ) {
    const previousAttributes = event.data
      .previous_attributes as Partial<Stripe.Subscription> | undefined;

    if (previousAttributes?.status === 'trialing') {
      const price = eventSubscription.items.data[0].price;
      const productId =
        typeof price.product === 'string' ? price.product : price.product.id;

      const conversionStatus: 'successful' | 'unsuccessful' =
        eventSubscription.status === 'active' ? 'successful' : 'unsuccessful';

      const customerId =
        typeof eventSubscription.customer === 'string'
          ? eventSubscription.customer
          : eventSubscription.customer.id;

      let uid: string | undefined;
      let billingCountry: string | undefined;
      try {
        const customer = await this.customerManager.retrieve(customerId);
        uid = customer.metadata['userid'];
        billingCountry = customer.address?.country ?? undefined;
      } catch (err) {
        if (!(err instanceof CustomerDeletedError)) {
          throw err;
        }
      }

      this.statsd.increment('subscription.trial_conversion', {
        status: conversionStatus,
        product_id: productId,
      });

      this.emitterService.getEmitter().emit('trialConverted', {
        productId,
        priceId: price.id,
        conversionStatus,
        providerEventId: event.id,
        uid,
        billingCountry,
      });
    }
  }
}
