/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {
  CustomerDeletedError,
  CustomerManager,
  InvoiceManager,
  SubscriptionManager,
  PaymentMethodManager,
  SubPlatPaymentMethodType,
} from '@fxa/payments/customer';
import { PaymentsEmitterService } from '@fxa/payments/events';
import { Injectable } from '@nestjs/common';
import Stripe from 'stripe';
import {
  CancellationReason,
  determineCancellation,
} from './util/determineCancellation';

@Injectable()
export class SubscriptionEventsService {
  constructor(
    private subscriptionManager: SubscriptionManager,
    private customerManager: CustomerManager,
    private invoiceManager: InvoiceManager,
    private emitterService: PaymentsEmitterService,
    private paymentMethodManager: PaymentMethodManager
  ) {}

  async handleCustomerSubscriptionDeleted(
    event: Stripe.Event,
    eventSubscription: Stripe.Subscription
  ) {
    const subscription = await this.subscriptionManager.retrieve(
      eventSubscription.id
    );
    const price = subscription.items.data[0].price;

    let paymentProvider: SubPlatPaymentMethodType | undefined;
    let determinedCancellation: CancellationReason | undefined;
    let uid: string | undefined;
    try {
      const customer = await this.customerManager.retrieve(
        subscription.customer
      );
      uid = customer.metadata['userid'];
      const paymentMethodType = await this.paymentMethodManager.determineType(
        customer,
        [subscription]
      );
      paymentProvider = paymentMethodType?.type;

      const latestInvoice =
        paymentProvider === SubPlatPaymentMethodType.PayPal &&
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
      paymentProvider: paymentProvider,
      providerEventId: event.id,
      cancellationReason,
      uid,
    });
  }
}
