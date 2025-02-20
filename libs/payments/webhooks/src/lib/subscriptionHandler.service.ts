/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {
  CustomerDeletedError,
  CustomerManager,
  determinePaymentMethodType,
  InvoiceManager,
  SubscriptionManager,
} from '@fxa/payments/customer';
import { PaymentsEmitterService } from '@fxa/payments/events';
import { PaymentProvidersType } from '@fxa/payments/metrics';
import { Injectable } from '@nestjs/common';
import Stripe from 'stripe';
import { determineCancellation } from './util/determineCancellation';

@Injectable()
export class SubscriptionEventsService {
  constructor(
    private subscriptionManager: SubscriptionManager,
    private customerManager: CustomerManager,
    private invoiceManager: InvoiceManager,
    private emitterService: PaymentsEmitterService
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
    let voluntaryCancellation: boolean | undefined;
    try {
      const customer = await this.customerManager.retrieve(
        subscription.customer
      );
      const paymentMethodType = determinePaymentMethodType(customer, [
        subscription,
      ]);
      if (paymentMethodType?.type === 'stripe') {
        paymentProvider = 'card';
      } else if (paymentMethodType?.type === 'external_paypal') {
        paymentProvider = 'external_paypal';
      }

      const latestInvoice =
        paymentProvider === 'external_paypal' && subscription.latest_invoice
          ? await this.invoiceManager.retrieve(subscription.latest_invoice)
          : undefined;

      voluntaryCancellation =
        paymentProvider &&
        determineCancellation(paymentProvider, subscription, latestInvoice);
    } catch (err) {
      if (err instanceof CustomerDeletedError) {
        paymentProvider = undefined;
        voluntaryCancellation = undefined;
      } else {
        throw err;
      }
    }

    this.emitterService.getEmitter().emit('subscriptionEnded', {
      productId: price.product,
      priceId: price.id,
      priceInterval: price.recurring?.interval,
      priceIntervalCount: price.recurring?.interval_count,
      paymentProvider: paymentProvider,
      providerEventId: event.id,
      subscriptionId: subscription.id,
      voluntaryCancellation,
    });
  }
}
