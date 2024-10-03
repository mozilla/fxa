/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Injectable } from '@nestjs/common';
import { Stripe } from 'stripe';

import {
  StripeApiList,
  StripeCustomer,
  StripeDeletedCustomer,
  StripeInvoice,
  StripePaymentIntent,
  StripePaymentMethod,
  StripePrice,
  StripeProduct,
  StripePromotionCode,
  StripeResponse,
  StripeSubscription,
  StripeUpcomingInvoice,
} from './stripe.client.types';
import { StripeConfig } from './stripe.config';

/**
 * A wrapper for Stripe that enforces that results have deterministic typings
 * that represent their expanded/unexpanded state.
 *
 * Naming for methods within this file should follow the way the corresponding Stripe method is named:
 *
 * this.stripe.aBC.xYZ should be wrapped in a method named aBCxYZ
 *
 * For example:
 * this.stripe.customers.retrieve is wrapped in a method named retrieveCustomer
 *
 */
@Injectable()
export class StripeClient {
  private readonly stripe: Stripe;
  constructor(private stripeConfig: StripeConfig) {
    this.stripe = new Stripe(this.stripeConfig.apiKey, {
      apiVersion: '2024-04-10',
      maxNetworkRetries: 3,
    });
  }

  async customersRetrieve(
    customerId: string,
    params?: Stripe.CustomerRetrieveParams
  ) {
    const result = await this.stripe.customers.retrieve(customerId, {
      ...params,
      expand: ['tax'],
    });
    return result as StripeResponse<StripeCustomer | StripeDeletedCustomer>;
  }

  async customersCreate(params?: Stripe.CustomerCreateParams) {
    const result = await this.stripe.customers.create({
      ...params,
      expand: ['tax'],
    });
    return result as StripeResponse<StripeCustomer>;
  }

  async customersUpdate(
    customerId: string,
    params?: Stripe.CustomerUpdateParams
  ) {
    const result = await this.stripe.customers.update(customerId, {
      ...params,
      expand: ['tax'],
    });

    return result as StripeResponse<StripeCustomer>;
  }

  async subscriptionsList(params?: Stripe.SubscriptionListParams) {
    const result = await this.stripe.subscriptions.list({
      ...params,
      expand: undefined,
    });

    return result as StripeApiList<StripeSubscription>;
  }

  async subscriptionsCreate(
    params: Stripe.SubscriptionCreateParams,
    options?: Stripe.RequestOptions
  ) {
    const result = await this.stripe.subscriptions.create(
      {
        ...params,
        expand: undefined,
      },
      options
    );

    return result as StripeResponse<StripeSubscription>;
  }

  async subscriptionsCancel(
    id: string,
    params?: Stripe.SubscriptionCancelParams
  ) {
    const result = await this.stripe.subscriptions.cancel(id, {
      ...params,
      expand: undefined,
    });

    return result as StripeResponse<StripeSubscription>;
  }

  async subscriptionsRetrieve(
    id: string,
    params?: Stripe.SubscriptionRetrieveParams
  ) {
    const result = await this.stripe.subscriptions.retrieve(id, {
      ...params,
      expand: undefined,
    });

    return result as StripeResponse<StripeSubscription>;
  }

  async subscriptionsUpdate(
    id: string,
    params?: Stripe.SubscriptionUpdateParams
  ) {
    const result = await this.stripe.subscriptions.update(id, {
      ...params,
      expand: undefined,
    });

    return result as StripeResponse<StripeSubscription>;
  }

  async invoicesRetrieve(
    id: string,
    params?: Stripe.PaymentMethodAttachParams
  ) {
    const result = await this.stripe.invoices.retrieve(id, {
      ...params,
      expand: undefined,
    });
    return result as StripeResponse<StripeInvoice>;
  }

  async invoicesRetrieveUpcoming(
    params?: Stripe.InvoiceRetrieveUpcomingParams
  ) {
    const result = await this.stripe.invoices.retrieveUpcoming({
      ...params,
      expand: ['total_tax_amounts.tax_rate'],
    });
    return result as StripeResponse<StripeUpcomingInvoice>;
  }

  async invoicesFinalizeInvoice(
    invoiceId: string,
    params?: Stripe.InvoiceFinalizeInvoiceParams
  ) {
    const result = await this.stripe.invoices.finalizeInvoice(invoiceId, {
      ...params,
      expand: undefined,
    });
    return result as StripeResponse<StripeInvoice>;
  }

  async paymentIntentRetrieve(
    paymentIntentId: string,
    params?: Stripe.PaymentIntentRetrieveParams
  ) {
    const result = await this.stripe.paymentIntents.retrieve(paymentIntentId, {
      ...params,
      expand: undefined,
    });
    return result as StripeResponse<StripePaymentIntent>;
  }

  async paymentMethodsAttach(
    id: string,
    params: Stripe.PaymentMethodAttachParams
  ) {
    const result = await this.stripe.paymentMethods.attach(id, {
      ...params,
      expand: undefined,
    });
    return result as StripeResponse<StripePaymentMethod>;
  }

  async pricesRetrieve(id: string, params?: Stripe.PriceRetrieveParams) {
    const result = await this.stripe.prices.retrieve(id, {
      ...params,
      expand: undefined,
    });
    return result as StripeResponse<StripePrice>;
  }

  async productsRetrieve(id: string, params?: Stripe.ProductRetrieveParams) {
    const result = await this.stripe.products.retrieve(id, {
      ...params,
      expand: undefined,
    });
    return result as StripeResponse<StripeProduct>;
  }

  async promotionCodesList(params: Stripe.PromotionCodeListParams) {
    const result = await this.stripe.promotionCodes.list({
      ...params,
      expand: undefined,
    });
    return result as StripeResponse<StripeApiList<StripePromotionCode>>;
  }

  async promotionCodesRetrieve(
    id: string,
    params?: Stripe.PromotionCodeRetrieveParams
  ) {
    const result = await this.stripe.promotionCodes.retrieve(id, {
      ...params,
      expand: undefined,
    });
    return result as StripeResponse<StripePromotionCode>;
  }

  async paymentIntentConfirm(
    paymentIntentId: string,
    params?: Stripe.PaymentIntentConfirmParams
  ) {
    const result = await this.stripe.paymentIntents.confirm(paymentIntentId, {
      ...params,
      expand: undefined,
    });
    return result as StripeResponse<StripePaymentIntent>;
  }

  async paymentIntentCancel(
    paymentIntentId: string,
    params?: Stripe.PaymentIntentCancelParams
  ) {
    const result = await this.stripe.paymentIntents.cancel(paymentIntentId, {
      ...params,
      expand: undefined,
    });
    return result as StripeResponse<StripePaymentIntent>;
  }
}
