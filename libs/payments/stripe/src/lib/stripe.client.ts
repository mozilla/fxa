/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Inject, Injectable } from '@nestjs/common';
import { Stripe } from 'stripe';
import { Cacheable } from '@type-cacheable/core';

import {
  StripeApiList,
  StripeCustomer,
  StripeCustomerSession,
  StripeDeletedCustomer,
  StripeDeletedInvoice,
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
import {
  CaptureTimingWithStatsD,
  StatsD,
  StatsDService,
} from '@fxa/shared/metrics/statsd';
import {
  CacheFirstStrategy,
  AsyncLocalStorageAdapter,
  MemoryAdapter,
} from '@fxa/shared/db/type-cacheable';
import { cacheKeyForClient } from './cacheKeyForClient';

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
  constructor(
    private stripeConfig: StripeConfig,
    @Inject(StatsDService) public statsd: StatsD
  ) {
    this.stripe = new Stripe(
      // 'api_key_placeholder' is currently needed during build time
      // Should be able to remove in the next version
      // https://github.com/stripe/stripe-node/issues/2207
      this.stripeConfig.apiKey || 'api_key_placeholder',
      {
        apiVersion: '2024-11-20.acacia',
        maxNetworkRetries: 3,
      }
    );

    this.stripe.on('response', (response) => {
      this.statsd.timing('stripe_request', response.elapsed);
      // Note that we can't record the method/path as a tag
      // because ids are in the path which results in too great
      // of cardinality.
      this.statsd.increment('stripe_call', {
        error: (response.status >= 500).toString(),
      });
    });
  }

  constructWebhookEvent(payload: any, signature: string): Stripe.Event {
    return this.stripe.webhooks.constructEvent(
      payload,
      signature,
      this.stripeConfig.webhookSecret
    );
  }

  @CaptureTimingWithStatsD()
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

  @CaptureTimingWithStatsD()
  async customersCreate(params?: Stripe.CustomerCreateParams) {
    const result = await this.stripe.customers.create({
      ...params,
      expand: ['tax'],
    });
    return result as StripeResponse<StripeCustomer>;
  }

  @CaptureTimingWithStatsD()
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

  @CaptureTimingWithStatsD()
  async customersDelete(
    customerId: string,
    params?: Stripe.CustomerDeleteParams
  ) {
    const result = await this.stripe.customers.del(customerId, {
      ...params,
      expand: ['tax'],
    });
    return result as StripeResponse<StripeDeletedCustomer>;
  }

  @CaptureTimingWithStatsD()
  async customersSessionsCreate(params: Stripe.CustomerSessionCreateParams) {
    const result = await this.stripe.customerSessions.create(params);
    return result as StripeResponse<StripeCustomerSession>;
  }

  @Cacheable({
    cacheKey: (args: any) =>
      cacheKeyForClient('subscriptionsList', undefined, args[0]),
    strategy: new CacheFirstStrategy(),
    client: new AsyncLocalStorageAdapter(),
  })
  @CaptureTimingWithStatsD()
  async subscriptionsList(params?: Stripe.SubscriptionListParams) {
    const result = await this.stripe.subscriptions.list({
      ...params,
      expand: undefined,
    });

    return result as StripeApiList<StripeSubscription>;
  }

  @CaptureTimingWithStatsD()
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

  @CaptureTimingWithStatsD()
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

  @Cacheable({
    cacheKey: (args: any) =>
      cacheKeyForClient('subscriptionsRetrieve', args[0], args[1]),
    strategy: new CacheFirstStrategy(),
    client: new AsyncLocalStorageAdapter(),
  })
  @CaptureTimingWithStatsD()
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

  @CaptureTimingWithStatsD()
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

  @CaptureTimingWithStatsD()
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

  @CaptureTimingWithStatsD()
  async invoicesRetrieveUpcoming(
    params?: Stripe.InvoiceRetrieveUpcomingParams
  ) {
    const result = await this.stripe.invoices.retrieveUpcoming({
      ...params,
      expand: ['total_tax_amounts.tax_rate'],
    });
    return result as StripeResponse<StripeUpcomingInvoice>;
  }

  @CaptureTimingWithStatsD()
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

  @CaptureTimingWithStatsD()
  async invoicesUpdate(invoiceId: string, params?: Stripe.InvoiceUpdateParams) {
    const result = await this.stripe.invoices.update(invoiceId, {
      ...params,
      expand: undefined,
    });
    return result as StripeResponse<StripeInvoice>;
  }

  @CaptureTimingWithStatsD()
  async invoicesPay(invoiceId: string) {
    try {
      await this.stripe.invoices.pay(invoiceId, {
        paid_out_of_band: true,
      });
    } catch (err) {
      if (err.message.includes('Invoice is already paid')) {
        // This was already marked paid, we can ignore the error.
        return;
      }
      throw err;
    }
  }

  @CaptureTimingWithStatsD()
  async invoicesDelete(invoiceId: string) {
    const result = await this.stripe.invoices.del(invoiceId);
    return result as StripeResponse<StripeDeletedInvoice>;
  }

  @CaptureTimingWithStatsD()
  async invoicesVoid(invoiceId: string) {
    const result = await this.stripe.invoices.voidInvoice(invoiceId);
    return result as StripeResponse<StripeInvoice>;
  }

  @Cacheable({
    cacheKey: (args: any) =>
      cacheKeyForClient('paymentIntentRetrieve', args[0], args[1]),
    strategy: new CacheFirstStrategy(),
    client: new AsyncLocalStorageAdapter(),
  })
  @CaptureTimingWithStatsD()
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

  @CaptureTimingWithStatsD()
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

  @Cacheable({
    cacheKey: (args: any) =>
      cacheKeyForClient('paymentMethodsRetrieve', args[0], args[1]),
    strategy: new CacheFirstStrategy(),
    client: new AsyncLocalStorageAdapter(),
  })
  @CaptureTimingWithStatsD()
  async paymentMethodRetrieve(
    id: string,
    params?: Stripe.PaymentMethodRetrieveParams
  ) {
    const result = await this.stripe.paymentMethods.retrieve(id, {
      ...params,
      expand: undefined,
    });
    return result as StripeResponse<StripePaymentMethod>;
  }

  @Cacheable({
    cacheKey: (args: any) =>
      cacheKeyForClient('pricesRetrieve', args[0], args[1]),
    strategy: new CacheFirstStrategy(),
    ttlSeconds: 600,
    client: new MemoryAdapter(),
  })
  @CaptureTimingWithStatsD()
  async pricesRetrieve(id: string, params?: Stripe.PriceRetrieveParams) {
    const result = await this.stripe.prices.retrieve(id, {
      ...params,
      expand: undefined,
    });
    return result as StripeResponse<StripePrice>;
  }

  @Cacheable({
    cacheKey: (args: any) =>
      cacheKeyForClient('productsRetrieve', args[0], args[1]),
    strategy: new CacheFirstStrategy(),
    ttlSeconds: 600,
    client: new MemoryAdapter(),
  })
  @CaptureTimingWithStatsD()
  async productsRetrieve(id: string, params?: Stripe.ProductRetrieveParams) {
    const result = await this.stripe.products.retrieve(id, {
      ...params,
      expand: undefined,
    });
    return result as StripeResponse<StripeProduct>;
  }

  @Cacheable({
    cacheKey: (args: any) =>
      cacheKeyForClient('promotionCodesList', undefined, args[0]),
    strategy: new CacheFirstStrategy(),
    ttlSeconds: 600,
    client: new MemoryAdapter(),
  })
  @CaptureTimingWithStatsD()
  async promotionCodesList(params: Stripe.PromotionCodeListParams) {
    const result = await this.stripe.promotionCodes.list({
      ...params,
      expand: undefined,
    });
    return result as StripeResponse<StripeApiList<StripePromotionCode>>;
  }

  @Cacheable({
    cacheKey: (args: any) =>
      cacheKeyForClient('promotionCodesRetrieve', args[0], args[1]),
    strategy: new CacheFirstStrategy(),
    ttlSeconds: 600,
    client: new MemoryAdapter(),
  })
  @CaptureTimingWithStatsD()
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

  @CaptureTimingWithStatsD()
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

  @CaptureTimingWithStatsD()
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
