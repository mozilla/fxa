/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { Firestore } from '@google-cloud/firestore';
import * as Sentry from '@sentry/node';
import cacheManager, {
  Cacheable,
  CacheClear,
  CacheClearStrategy,
  CacheClearStrategyContext,
  CacheUpdate,
} from '@type-cacheable/core';
import { useAdapter } from '@type-cacheable/ioredis-adapter';
import {
  createAccountCustomer,
  deleteAccountCustomer,
  getAccountCustomerByUid,
  updatePayPalBA,
} from 'fxa-shared/db/models/auth';
import {
  ACTIVE_SUBSCRIPTION_STATUSES,
  getSubscriptionUpdateEligibility,
  singlePlan,
} from 'fxa-shared/subscriptions/stripe';
import {
  AbbrevPlan,
  AbbrevProduct,
  MozillaSubscriptionTypes,
  PAYPAL_PAYMENT_ERROR_FUNDING_SOURCE,
  PAYPAL_PAYMENT_ERROR_MISSING_AGREEMENT,
  PaypalPaymentError,
  SubscriptionUpdateEligibility,
  WebSubscription,
} from 'fxa-shared/subscriptions/types';
import { StatsD } from 'hot-shots';
import ioredis from 'ioredis';
import pick from 'lodash/pick';
import moment from 'moment';
import { Logger } from 'mozlog';
import { Stripe } from 'stripe';
import { Container } from 'typedi';

import { ConfigType } from '../../config';
import error from '../error';
import Redis from '../redis';
import { subscriptionProductMetadataValidator } from '../routes/validators';
import { AuthFirestore } from '../types';
import { CurrencyHelper } from './currencies';
import { SubscriptionPurchase } from './google-play/subscription-purchase';
import { FirestoreStripeError, StripeFirestore } from './stripe-firestore';
import { AbbrevPlayPurchase } from 'fxa-shared/subscriptions/types';

export const CUSTOMER_RESOURCE = 'customers';
export const SUBSCRIPTIONS_RESOURCE = 'subscriptions';
export const PRODUCT_RESOURCE = 'products';
export const PLAN_RESOURCE = 'plans';
export const CHARGES_RESOURCE = 'charges';
export const INVOICES_RESOURCE = 'invoices';
export const PAYMENT_METHOD_RESOURCE = 'paymentMethods';

export const MOZILLA_TAX_ID = 'Tax ID';

export const STRIPE_PRODUCTS_CACHE_KEY = 'listStripeProducts';
export const STRIPE_PLANS_CACHE_KEY = 'listStripePlans';

enum STRIPE_CUSTOMER_METADATA {
  PAYPAL_AGREEMENT = 'paypalAgreementId',
}

export enum STRIPE_PRODUCT_METADATA {
  PLAY_SKU_IDS = 'playSkuIds',
}

export enum STRIPE_INVOICE_METADATA {
  PAYPAL_TRANSACTION_ID = 'paypalTransactionId',
  PAYPAL_REFUND_TRANSACTION_ID = 'paypalRefundTransactionId',
  EMAIL_SENT = 'emailSent',
  RETRY_ATTEMPTS = 'paymentAttempts',
}

const VALID_RESOURCE_TYPES = [
  CUSTOMER_RESOURCE,
  SUBSCRIPTIONS_RESOURCE,
  PRODUCT_RESOURCE,
  PLAN_RESOURCE,
  CHARGES_RESOURCE,
  INVOICES_RESOURCE,
  PAYMENT_METHOD_RESOURCE,
] as const;

export const SUBSCRIPTION_UPDATE_TYPES = {
  UPGRADE: 'upgrade',
  DOWNGRADE: 'downgrade',
  REACTIVATION: 'reactivation',
  CANCELLATION: 'cancellation',
};

export type FormattedSubscriptionForEmail = {
  productId: string;
  productName: string;
  planId: string;
  planName: string | null;
  planEmailIconURL: string;
  planDownloadURL: string;
  productMetadata: Stripe.Metadata;
};

type BillingAddressOptions = {
  city: string;
  country: string;
  line1: string;
  line2: string;
  postalCode: string;
  state: string;
};

export type PaymentBillingDetails = ReturnType<
  StripeHelper['extractBillingDetails']
> & {
  paypal_payment_error?: PaypalPaymentError;
  billing_agreement_id?: string;
};

/**
 * The CacheUpdate decorator has an _optional_ property in its options
 * parameter named `cacheKeysToClear`.  However, if you do not pass in a value
 * for cacheKeysToClear, type-cacheable will compute one from CacheUpdate's
 * context!  In our case, that leads to a cannot covert a circular reference
 * to JSON error.  Since that default behavior is not well documented, the error
 * can be very confusing.
 *
 * As a result, a value of 'noop' is passed in for cacheKeysToClear.  And to
 * prevent an actual 'DEL noop' on redis, the below CacheClearStrategy is used.
 */
class NoopCacheClearStrategy implements CacheClearStrategy {
  async handle(context: CacheClearStrategyContext): Promise<any> {}
}
const noopCacheClearStrategy = new NoopCacheClearStrategy();

export class StripeHelper {
  // Note that this isn't quite accurate, as the auth-server logger has some extras
  // attached to it in Hapi.
  private log: Logger;
  private customerCacheTtlSeconds: number;
  private plansAndProductsCacheTtlSeconds: number;
  private stripeTaxRatesCacheTtlSeconds: number;
  private webhookSecret: string;
  private stripe: Stripe;
  private redis: ioredis.Redis | undefined;
  private statsd: StatsD;
  private taxIds: { [key: string]: string };
  private firestore: Firestore;
  private stripeFirestore: StripeFirestore;
  public currencyHelper: CurrencyHelper;

  /**
   * Create a Stripe Helper with built-in caching.
   */
  constructor(log: Logger, config: ConfigType, statsd: StatsD) {
    this.log = log;
    this.customerCacheTtlSeconds = config.subhub.customerCacheTtlSeconds;
    this.plansAndProductsCacheTtlSeconds = config.subhub.plansCacheTtlSeconds;
    this.stripeTaxRatesCacheTtlSeconds =
      config.subhub.stripeTaxRatesCacheTtlSeconds;
    this.webhookSecret = config.subscriptions.stripeWebhookSecret;
    this.taxIds = config.subscriptions.taxIds;
    this.currencyHelper = Container.get(CurrencyHelper);

    // TODO (FXA-949 / issue #3922): The TTL setting here is serving double-duty for
    // both TTL and whether caching should be enabled at all. We should
    // introduce a second setting for cache enable / disable.
    const redis = this.plansAndProductsCacheTtlSeconds
      ? Redis(
          {
            ...config.redis,
            ...config.redis.subhub,
          },
          log
        )?.redis
      : undefined;

    this.stripe = new Stripe(config.subscriptions.stripeApiKey, {
      apiVersion: '2020-08-27',
      maxNetworkRetries: 3,
    });

    this.firestore = Container.get(AuthFirestore);
    const firestore_prefix = `${config.authFirestore.prefix}stripe-`;
    const customerCollectionDbRef = this.firestore.collection(
      `${firestore_prefix}customers`
    );
    this.stripeFirestore = new StripeFirestore(
      this.firestore,
      customerCollectionDbRef,
      this.stripe,
      firestore_prefix
    );

    cacheManager.setOptions({
      // Ensure the StripeHelper instance is passed into TTLBuilder functions
      excludeContext: false,
    });
    this.redis = redis;
    if (this.redis) {
      useAdapter(this.redis);
    }

    this.statsd = statsd;
    this.stripe.on('response', (response) => {
      statsd.timing('stripe_request', response.elapsed);
      // Note that we can't record the method/path as a tag
      // because ids are in the path which results in too great
      // of cardinality.
      statsd.increment('stripe_call', {
        error: (response.status >= 500).toString(),
      });
    });
  }

  /**
   * Extract an AbbrevProduct from Stripe Product
   */
  abbrevProductFromStripeProduct(product: Stripe.Product): AbbrevProduct {
    return {
      product_id: product.id,
      product_name: product.name,
      product_metadata: product.metadata,
    };
  }

  /**
   * Fetch all product data and cache it if Redis is enabled.
   *
   * Use `allProducts` below to use the cached-enhanced version.
   */
  async fetchAllProducts(): Promise<Stripe.Product[]> {
    const products = [];
    for await (const product of this.stripe.products.list()) {
      products.push(product);
    }
    return products;
  }

  /**
   * Fetches all products from stripe and returns them.
   *
   * Uses Redis caching if configured.
   */
  @Cacheable({
    cacheKey: STRIPE_PRODUCTS_CACHE_KEY,
    ttlSeconds: (args, context) => context.plansAndProductsCacheTtlSeconds,
  })
  async allProducts(): Promise<Stripe.Product[]> {
    return this.fetchAllProducts();
  }

  @CacheUpdate({
    cacheKey: STRIPE_PRODUCTS_CACHE_KEY,
    ttlSeconds: (args, context) => context.plansAndProductsCacheTtlSeconds,
    cacheKeysToClear: 'noop',
    clearStrategy: noopCacheClearStrategy,
  })
  async updateAllProducts(allProducts: Stripe.Product[]) {
    return allProducts;
  }

  async allAbbrevProducts(): Promise<AbbrevProduct[]> {
    const products = await this.allProducts();
    return products.map(this.abbrevProductFromStripeProduct);
  }

  /**
   * Fetch all active tax rates.
   */
  async fetchAllTaxRates() {
    const taxRates = [];
    for await (const taxRate of this.stripe.taxRates.list({ active: true })) {
      taxRates.push(taxRate);
    }
    return taxRates;
  }

  /**
   * Fetches all active tax rates from stripe and returns them.
   *
   * Uses Redis caching if configured.
   */
  @Cacheable({
    cacheKey: 'listActiveTaxRates',
    ttlSeconds: (args, context) => context.stripeTaxRatesCacheTtlSeconds,
  })
  async allTaxRates() {
    return this.fetchAllTaxRates();
  }

  /**
   * Locates a tax rate by the country code and returns it.
   *
   * @param countryCode Two letter country code.
   */
  async taxRateByCountryCode(countryCode: string) {
    const taxRates = await this.allTaxRates();
    const lcCountryCode = countryCode.toLowerCase();
    return taxRates.find((tr) => tr.country?.toLowerCase() === lcCountryCode);
  }

  /**
   * Create a stripe customer.
   */
  async createPlainCustomer(
    uid: string,
    email: string,
    displayName: string,
    idempotencyKey: string
  ): Promise<Stripe.Customer> {
    const stripeCustomer = await this.stripe.customers.create(
      {
        email,
        name: displayName,
        description: uid,
        metadata: { userid: uid },
      },
      {
        idempotency_key: idempotencyKey,
      }
    );
    await Promise.all([
      createAccountCustomer(uid, stripeCustomer.id),
      this.stripeFirestore.insertCustomerRecord(uid, stripeCustomer),
    ]);
    return stripeCustomer;
  }

  /**
   * Insert a local db record for a customer that already exist on Stripe.
   */
  async createLocalCustomer(uid: string, stripeCustomer: Stripe.Customer) {
    await createAccountCustomer(uid, stripeCustomer.id);
  }

  /**
   * Update an existing customer to use a new payment method id.
   */
  async retryInvoiceWithPaymentId(
    customerId: string,
    invoiceId: string,
    paymentMethodId: string,
    idempotencyKey: string
  ) {
    try {
      await this.stripe.paymentMethods.attach(
        paymentMethodId,
        {
          customer: customerId,
        },
        { idempotencyKey }
      );
      const customer = await this.stripe.customers.update(customerId, {
        invoice_settings: { default_payment_method: paymentMethodId },
      });
      await this.stripeFirestore.insertCustomerRecordWithBackfill(
        customer.metadata.userid,
        customer
      );
      // Try paying now instead of waiting for Stripe since this could block a
      // customer from finishing a payment
      const invoice = await this.stripe.invoices.pay(invoiceId, {
        expand: ['payment_intent'],
      });
      return invoice;
    } catch (err) {
      if (err.type === 'StripeCardError') {
        throw error.rejectedSubscriptionPaymentToken(err.message, err);
      }
      throw err;
    }
  }

  /**
   * Create a subscription for the provided customer.
   */
  async createSubscriptionWithPMI(opts: {
    customerId: string;
    priceId: string;
    paymentMethodId?: string;
    subIdempotencyKey: string;
    taxRateId?: string;
  }) {
    const {
      customerId,
      priceId,
      paymentMethodId,
      subIdempotencyKey,
      taxRateId,
    } = opts;
    const taxRates = taxRateId ? [taxRateId] : [];

    if (paymentMethodId) {
      try {
        await this.stripe.paymentMethods.attach(
          paymentMethodId,
          {
            customer: customerId,
          },
          { idempotencyKey: `pma-${subIdempotencyKey}` }
        );
      } catch (err) {
        if (err.type === 'StripeCardError') {
          throw error.rejectedSubscriptionPaymentToken(err.message, err);
        }
        throw err;
      }
      const customer = await this.stripe.customers.update(customerId, {
        invoice_settings: { default_payment_method: paymentMethodId },
      });
      await this.stripeFirestore.insertCustomerRecordWithBackfill(
        customer.metadata.userid,
        customer
      );
    }

    this.statsd.increment('stripe_subscription', {
      payment_provider: 'stripe',
    });

    const subscription = await this.stripe.subscriptions.create(
      {
        customer: customerId,
        items: [{ price: priceId }],
        expand: ['latest_invoice.payment_intent'],
        default_tax_rates: taxRates,
      },
      { idempotencyKey: `ssc-${subIdempotencyKey}` }
    );
    await this.stripeFirestore.insertSubscriptionRecordWithBackfill({
      ...subscription,
      latest_invoice: subscription.latest_invoice
        ? (subscription.latest_invoice as Stripe.Invoice).id
        : null,
    });
    return subscription;
  }

  /**
   * Create a subscription for the provided customer using PayPal.
   *
   * A subscription will be created for out-of-band payment with the
   * collection_method set to send_invoice.
   *
   * If an active/past_due subscription exists in this state for this
   * priceId, then it will be returned instead of creating a new one.
   *
   */
  async createSubscriptionWithPaypal(opts: {
    customer: Stripe.Customer;
    priceId: string;
    subIdempotencyKey: string;
    taxRateId?: string;
  }) {
    const { customer, priceId, subIdempotencyKey, taxRateId } = opts;
    const taxRates = taxRateId ? [taxRateId] : [];

    const sub = this.findCustomerSubscriptionByPlanId(customer, priceId);
    if (sub && ACTIVE_SUBSCRIPTION_STATUSES.includes(sub.status)) {
      if (sub.collection_method === 'send_invoice') {
        sub.latest_invoice = await this.expandResource(
          sub.latest_invoice,
          'invoices'
        );
        return sub;
      }
      throw error.subscriptionAlreadyExists();
    } else if (sub && sub.status === 'incomplete') {
      // Sub has never been active or charged, delete it.
      this.stripe.subscriptions.del(sub.id);
    }

    this.statsd.increment('stripe_subscription', {
      payment_provider: 'paypal',
    });

    const subscription = await this.stripe.subscriptions.create(
      {
        customer: customer.id,
        items: [{ price: priceId }],
        expand: ['latest_invoice'],
        collection_method: 'send_invoice',
        days_until_due: 1,
        default_tax_rates: taxRates,
      },
      { idempotencyKey: `ssc-${subIdempotencyKey}` }
    );
    await this.stripeFirestore.insertSubscriptionRecordWithBackfill({
      ...subscription,
      latest_invoice: subscription.latest_invoice
        ? (subscription.latest_invoice as Stripe.Invoice).id
        : null,
    });
    return subscription;
  }

  async invoicePayableWithPaypal(invoice: Stripe.Invoice): Promise<boolean> {
    if (invoice.billing_reason === 'subscription_create') {
      // We only work with non-creation invoices, initial invoices are resolved by
      // checkout code.
      return false;
    }
    const subscription = await this.expandResource(
      invoice.subscription,
      'subscriptions'
    );
    if (subscription?.collection_method !== 'send_invoice') {
      // Not a PayPal funded subscription.
      return false;
    }
    return true;
  }

  /**
   * Get Invoice object based on invoice Id
   */
  async getInvoice(id: string): Promise<Stripe.Invoice> {
    return this.stripe.invoices.retrieve(id);
  }

  /**
   * Finalizes an invoice and marks auto_advance as false.
   */
  async finalizeInvoice(invoice: Stripe.Invoice) {
    return this.stripe.invoices.finalizeInvoice(invoice.id, {
      auto_advance: false,
    });
  }

  /**
   * Updates invoice metadata with the PayPal Transaction ID.
   */
  async updateInvoiceWithPaypalTransactionId(
    invoice: Stripe.Invoice,
    transactionId: string
  ) {
    return this.stripe.invoices.update(invoice.id, {
      metadata: {
        [STRIPE_INVOICE_METADATA.PAYPAL_TRANSACTION_ID]: transactionId,
      },
    });
  }

  /**
   * Updates invoice metadata with the PayPal Refund Transaction ID.
   */
  async updateInvoiceWithPaypalRefundTransactionId(
    invoice: Stripe.Invoice,
    transactionId: string
  ) {
    return this.stripe.invoices.update(invoice.id, {
      metadata: {
        [STRIPE_INVOICE_METADATA.PAYPAL_REFUND_TRANSACTION_ID]: transactionId,
      },
    });
  }

  /**
   * Returns the Paypal transaction id for the invoice if one exists.
   */
  getInvoicePaypalTransactionId(invoice: Stripe.Invoice) {
    return invoice.metadata?.paypalTransactionId;
  }

  /**
   * Retrieve the payment attempts that have been made on this invoice via PayPal.
   *
   * This variable reflects the amount of payment attempts that have been made. It is
   * incremented *after* a payment attempt is made by any code that runs a reference
   * transaction. As such, this number could be incremented multiple times at checkout
   * or during a payment update on the subscription management page.
   *
   * The PayPal idempotencyKey has this number affixed to it in the pre-increment state.
   */
  getPaymentAttempts(invoice: Stripe.Invoice): number {
    return parseInt(
      invoice?.metadata?.[STRIPE_INVOICE_METADATA.RETRY_ATTEMPTS] ?? '0'
    );
  }

  /**
   * Update the payment attempts on an invoice after attempting via PayPal.
   *
   * Increments by 1, or sets to the attempts passed in.
   */
  async updatePaymentAttempts(invoice: Stripe.Invoice, attempts?: number) {
    const setAttempt = attempts ?? this.getPaymentAttempts(invoice) + 1;
    return this.stripe.invoices.update(invoice.id, {
      metadata: {
        [STRIPE_INVOICE_METADATA.RETRY_ATTEMPTS]: setAttempt.toString(),
      },
    });
  }

  /**
   * Get the email types that have been sent for this invoice.
   */
  getEmailTypes(invoice: Stripe.Invoice) {
    return (invoice.metadata?.[STRIPE_INVOICE_METADATA.EMAIL_SENT] ?? '')
      .split(':')
      .filter((a) => a);
  }

  /**
   * Updates the email types sent for this invoice. These types are concatentated
   * on the value of a single invoice metadata key and are thus limited to 500
   * characters.
   */
  async updateEmailSent(invoice: Stripe.Invoice, emailType: string) {
    const emailTypes = this.getEmailTypes(invoice);
    if (emailTypes.includes(emailType)) {
      return;
    }
    return this.stripe.invoices.update(invoice.id, {
      metadata: {
        [STRIPE_INVOICE_METADATA.EMAIL_SENT]: [...emailTypes, emailType].join(
          ':'
        ),
      },
    });
  }

  /**
   * Pays an invoice out of band.
   */
  async payInvoiceOutOfBand(invoice: Stripe.Invoice) {
    return this.stripe.invoices.pay(invoice.id, { paid_out_of_band: true });
  }

  /**
   * Update the customer object to add customer's PayPal billing address.
   */
  async updateCustomerBillingAddress(
    customer_id: string,
    options: BillingAddressOptions
  ): Promise<Stripe.Customer> {
    const address = {
      city: options.city,
      country: options.country,
      line1: options.line1,
      line2: options.line2,
      postal_code: options.postalCode,
      state: options.state,
    };
    const customer = await this.stripe.customers.update(customer_id, {
      address,
    });
    await this.stripeFirestore.insertCustomerRecordWithBackfill(
      customer.metadata.userid,
      customer
    );
    return customer;
  }

  /**
   * Update the customer object to add a PayPal Billing Agreement ID.
   *
   * This is a no-op if the billing agreement is already attached to the customer.
   */
  async updateCustomerPaypalAgreement(
    customer: Stripe.Customer,
    agreementId: string
  ): Promise<Stripe.Customer> {
    if (
      customer.metadata[STRIPE_CUSTOMER_METADATA.PAYPAL_AGREEMENT] ===
      agreementId
    ) {
      return customer;
    }
    const updatedCustomer = await this.stripe.customers.update(customer.id, {
      metadata: { [STRIPE_CUSTOMER_METADATA.PAYPAL_AGREEMENT]: agreementId },
    });
    await this.stripeFirestore.insertCustomerRecordWithBackfill(
      customer.metadata.userid,
      updatedCustomer
    );
    return updatedCustomer;
  }

  /**
   * Remove the PayPal Billing Agreement ID from a customer.
   */
  async removeCustomerPaypalAgreement(
    uid: string,
    customerId: string,
    billingAgreementId: string
  ) {
    const [customer] = await Promise.all([
      this.stripe.customers.update(customerId, {
        metadata: { [STRIPE_CUSTOMER_METADATA.PAYPAL_AGREEMENT]: null },
      }),
      updatePayPalBA(uid, billingAgreementId, 'Cancelled', Date.now()),
    ]);
    return this.stripeFirestore.insertCustomerRecordWithBackfill(uid, customer);
  }

  /**
   * Get the PayPal billing agreement id to use for this customer if available.
   */
  getCustomerPaypalAgreement(customer: Stripe.Customer): string | undefined {
    return customer.metadata[STRIPE_CUSTOMER_METADATA.PAYPAL_AGREEMENT];
  }

  /**
   * Fetch all open invoices for manually invoiced subscriptions that are active.
   *
   * Note that created times for Stripe are in seconds since epoch and that
   * invoices can be open for subscriptions that are cancelled, thus the extra
   * subscription check before returning an invoice.
   */
  async *fetchOpenInvoices(
    created: Stripe.InvoiceListParams['created'],
    customerId?: string
  ) {
    for await (const invoice of this.stripe.invoices.list({
      customer: customerId,
      limit: 100,
      collection_method: 'send_invoice',
      status: 'open',
      created,
      expand: ['data.customer', 'data.subscription'],
    })) {
      const subscription = invoice.subscription as Stripe.Subscription;
      if (ACTIVE_SUBSCRIPTION_STATUSES.includes(subscription.status)) {
        yield invoice;
      }
    }
  }

  /**
   * Updates the invoice to uncollectible
   */
  markUncollectible(invoice: Stripe.Invoice) {
    return this.stripe.invoices.markUncollectible(invoice.id);
  }

  /**
   * Updates subscription to cancelled status
   */
  async cancelSubscription(
    subscriptionId: string
  ): Promise<Stripe.Subscription> {
    return this.stripe.subscriptions.del(subscriptionId);
  }

  /**
   * Create a SetupIntent for a customer.
   */
  async createSetupIntent(customerId: string): Promise<Stripe.SetupIntent> {
    return this.stripe.setupIntents.create({ customer: customerId });
  }

  /**
   * Updates the default payment method used for invoices for the customer
   */
  async updateDefaultPaymentMethod(
    customerId: string,
    paymentMethodId: string
  ): Promise<Stripe.Customer> {
    const customer = await this.stripe.customers.update(customerId, {
      invoice_settings: { default_payment_method: paymentMethodId },
    });
    await this.stripeFirestore.insertCustomerRecordWithBackfill(
      customer.metadata.userid,
      customer
    );
    return customer;
  }

  /**
   * Remove all sources from a customer.
   *
   * For users that are using payment methods, we no longer wish to store
   * sources so we remove them all.
   *
   * Returns the deleted cards.
   */
  async removeSources(customerId: string): Promise<Stripe.Card[]> {
    const sources = await this.stripe.customers.listSources(customerId, {
      object: 'card',
    });
    if (sources.data.length === 0) {
      return [];
    }
    return Promise.all(
      sources.data.map(
        (s) =>
          this.stripe.customers.deleteSource(
            customerId,
            s.id
          ) as unknown as Promise<Stripe.Card>
      )
    );
  }

  async getPaymentMethod(
    paymentMethodId: string
  ): Promise<Stripe.PaymentMethod> {
    return await this.stripe.paymentMethods.retrieve(paymentMethodId);
  }

  getPaymentProvider(customer: Stripe.Customer) {
    const subscription = customer.subscriptions?.data.find((sub) =>
      ACTIVE_SUBSCRIPTION_STATUSES.includes(sub.status)
    );
    if (subscription) {
      return subscription.collection_method === 'send_invoice'
        ? 'paypal'
        : 'stripe';
    }
    return 'not_chosen';
  }

  /**
   * Returns whether or not the customer has any active subscriptions that
   * are require a payment method on file (not marked to be cancelled).
   */
  hasSubscriptionRequiringPaymentMethod(customer: Stripe.Customer) {
    const subscription = customer.subscriptions?.data.find(
      (sub) =>
        ACTIVE_SUBSCRIPTION_STATUSES.includes(sub.status) &&
        !sub.cancel_at_period_end
    );
    return !!subscription;
  }

  /**
   * Returns true if the FxA account with uid has an active subscription.
   */
  async hasActiveSubscription(uid: string): Promise<Boolean> {
    const customer = await this.fetchCustomer(uid, ['subscriptions']);
    if (!customer) {
      return false;
    }
    const subscription = customer.subscriptions?.data.find((sub) =>
      ACTIVE_SUBSCRIPTION_STATUSES.includes(sub.status)
    );
    return !!subscription;
  }

  /**
   * Returns whether or not the customer has any active subscriptions that
   * have an open invoice (payment has not been processed).
   */
  hasOpenInvoice(customer: Stripe.Customer) {
    const subscription = customer.subscriptions?.data.find(
      (sub) =>
        ACTIVE_SUBSCRIPTION_STATUSES.includes(sub.status) &&
        (sub.latest_invoice as Stripe.Invoice).status === 'open'
    );
    return !!subscription;
  }

  /**
   * Adds the appropriate tax id if found to the customer based on passed in
   * currency or the customers existing currency.
   **/
  async addTaxIdToCustomer(customer: Stripe.Customer, currency?: string) {
    const taxId =
      this.taxIds[
        currency?.toUpperCase() ?? customer.currency?.toUpperCase() ?? ''
      ];
    if (taxId) {
      const updatedCustomer = await this.stripe.customers.update(customer.id, {
        invoice_settings: {
          custom_fields: [{ name: MOZILLA_TAX_ID, value: taxId }],
        },
      });
      await this.stripeFirestore.insertCustomerRecordWithBackfill(
        customer.metadata.userid,
        updatedCustomer
      );
    }
  }

  /**
   * Returns the correct tax id for a customer.
   */
  getTaxIdForCustomer(customer: Stripe.Customer) {
    return this.taxIds[customer.currency?.toUpperCase() ?? ''];
  }

  /**
   * Returns the customers tax id if they have one.
   **/
  customerTaxId(customer: Stripe.Customer) {
    return customer.invoice_settings.custom_fields?.find(
      (field) => field.name === MOZILLA_TAX_ID
    );
  }

  async detachPaymentMethod(
    paymentMethodId: string
  ): Promise<Stripe.PaymentMethod> {
    return await this.stripe.paymentMethods.detach(paymentMethodId);
  }

  /**
   * Fetch a customer for the record from Stripe based on user id.
   */
  async fetchCustomer(
    uid: string,
    expand?: string[]
  ): Promise<Stripe.Customer | void> {
    const accountCustomer = await getAccountCustomerByUid(uid);
    if (
      accountCustomer === undefined ||
      accountCustomer.stripeCustomerId === undefined
    ) {
      return;
    }

    const customer = await this.stripe.customers.retrieve(
      accountCustomer.stripeCustomerId,
      { expand }
    );

    if (customer.deleted) {
      await deleteAccountCustomer(uid);
      return;
    }

    // Since the uid is just metadata and it isn't required when creating a new
    // customer _on Stripe dashboard_, we have an edge case where the customer
    // is created on Stripe and locally via the `customer.created` event, but
    // the uid metadata is still missing.  Throwing an error here causes a
    // profile fetch to fail, thus would block the user completely.
    //
    // Customers created through our regular flow will always have their uid in
    // the metadata.
    //
    // So, we'll only throw an error if the uid metadata is found and it does
    // not match.

    if (customer.metadata.userid && customer.metadata.userid !== uid) {
      // Duplicate email with non-match uid
      const err = new Error(
        `Stripe Customer: ${customer.id} has mismatched uid in metadata.`
      );
      throw error.backendServiceFailure('stripe', 'fetchCustomer', {}, err);
    }

    // We need to get all the subscriptions for a customer
    if (customer.subscriptions && customer.subscriptions.has_more) {
      const additionalSubscriptions =
        await this.fetchAllSubscriptionsForCustomer(
          customer.id,
          customer.subscriptions.data[customer.subscriptions.data.length - 1].id
        );
      customer.subscriptions.data.push(...additionalSubscriptions);
      customer.subscriptions.has_more = false;
    }

    return customer;
  }

  static customerCacheKey = (args: any[]) => `customer-${args[0]}|${args[1]}`;

  @Cacheable({
    cacheKey: StripeHelper.customerCacheKey,
    ttlSeconds: (args, context) => context.customerCacheTtlSeconds,
  })
  async cachedCustomer(
    uid: string,
    email: string
  ): Promise<Stripe.Customer | void> {
    return this.fetchCustomer(uid, [
      'sources',
      'subscriptions',
      'invoice_settings.default_payment_method',
    ]);
  }

  /**
   * Fetch a customer for the record from Stripe based on user ID & email.
   *
   * Uses Redis caching if configured.
   */
  async customer({
    uid,
    email,
    forceRefresh = false,
  }: {
    uid: string;
    email: string;
    forceRefresh?: boolean;
  }): Promise<Stripe.Customer | undefined> {
    if (forceRefresh) {
      await this.removeCustomerFromCache(uid, email);
    }
    return (await this.cachedCustomer(uid, email)) || undefined;
  }

  /**
   * On FxA deletion, if the user is a Stripe Customer:
   * - delete the stripe customer to delete
   * - remove the cache entry
   */
  async removeCustomer(uid: string, email: string) {
    const customer = await getAccountCustomerByUid(uid);
    if (customer && customer.stripeCustomerId) {
      await this.stripe.customers.del(customer.stripeCustomerId);
      const recordsDeleted = await deleteAccountCustomer(uid);
      if (recordsDeleted === 0) {
        this.log.error(
          `StripeHelper.removeCustomer failed to remove AccountCustomer record for uid ${uid}`,
          {}
        );
      }
      await this.removeCustomerFromCache(uid, email);
    }
  }

  /**
   * Fetch a subscription for a customer from Stripe.
   *
   * Uses Redis caching if configured.
   */
  async subscriptionForCustomer(
    uid: string,
    email: string,
    subscriptionId: string
  ): Promise<Stripe.Subscription | void> {
    const customer = await this.customer({ uid, email });
    if (!customer) {
      return;
    }

    return customer.subscriptions?.data.find(
      (subscription) => subscription.id === subscriptionId
    );
  }

  /**
   * Return a list of skus for a given product.
   */
  productToPlaySkus(product: AbbrevProduct) {
    const productSkus =
      product.product_metadata[STRIPE_PRODUCT_METADATA.PLAY_SKU_IDS] || '';
    return productSkus
      .trim()
      .split(',')
      .map((c) => c.trim().toLowerCase())
      .filter((c) => !!c);
  }

  /**
   * Fetch all product ids that correspond to a list of Play SubscriptionPurchases.
   */
  async purchasesToProductIds(purchases: SubscriptionPurchase[]) {
    const products = await this.allAbbrevProducts();
    const purchasedSkus = purchases.map((purchase) =>
      purchase.sku.toLowerCase()
    );
    const purchasedProducts = [];
    for (const product of products) {
      const playSkus = this.productToPlaySkus(product);
      if (playSkus.some((sku) => purchasedSkus.includes(sku))) {
        purchasedProducts.push(product.product_id);
      }
    }
    return purchasedProducts;
  }

  /**
   * Append any matching product ids to their corresponding AbbrevPlayPurchase.
   */
  async appendAbbrevPlayPurchasesWithProductIds(
    purchases: AbbrevPlayPurchase[]
  ): Promise<(AbbrevPlayPurchase & { product_id: string })[]> {
    const products = await this.allAbbrevProducts();
    const appendedAbbrevPlayPurchases = [];
    for (const product of products) {
      const playSkus = this.productToPlaySkus(product);
      const matchingAbbrevPlayPurchases = purchases.filter((purchase) =>
        playSkus.includes(purchase.sku.toLowerCase())
      );
      for (const matchingAbbrevPlayPurchase of matchingAbbrevPlayPurchases) {
        appendedAbbrevPlayPurchases.push({
          ...matchingAbbrevPlayPurchase,
          product_id: product.product_id,
        });
      }
    }
    return appendedAbbrevPlayPurchases;
  }

  /**
   * Fetch a list of subscriptions for a customer from Stripe.
   */
  async fetchAllSubscriptionsForCustomer(
    customerId: string,
    startAfterSubscriptionId: string
  ): Promise<Stripe.Subscription[]> {
    let getMore = true;
    const subscriptions = [];
    let startAfter = startAfterSubscriptionId;

    while (getMore) {
      const moreSubs = await this.stripe.subscriptions.list({
        customer: customerId,
        starting_after: startAfter,
      });

      subscriptions.push(...moreSubs.data);

      getMore = moreSubs.has_more;
      startAfter = moreSubs.data[moreSubs.data.length - 1].id;
    }
    return subscriptions;
  }

  /**
   * Find all active subscriptions for the given `planId`. Filter out
   * any subscriptions marked as `cancel_at_period_end`.
   *
   * It is expected that the `customer` is expanded.
   */
  async *findActiveSubscriptionsByPlanId(
    planId: string,
    currentPeriodEnd: Stripe.RangeQueryParam,
    limit: number = 50
  ) {
    const params: Stripe.SubscriptionListParams = {
      price: planId,
      current_period_end: currentPeriodEnd,
      limit,
      expand: ['data.customer'],
    };
    for await (const subscription of this.stripe.subscriptions.list(params)) {
      if (
        !ACTIVE_SUBSCRIPTION_STATUSES.includes(subscription.status) ||
        subscription.cancel_at_period_end
      ) {
        continue;
      }
      yield subscription;
    }
  }

  /**
   * Find and return a subscription for a customer of the given plan id.
   */
  findCustomerSubscriptionByPlanId(
    customer: Stripe.Customer,
    planId: string
  ): Stripe.Subscription | undefined {
    if (!customer.subscriptions) {
      throw error.internalValidationError(
        'findCustomerSubscriptionByPlanId',
        {
          customerId: customer.id,
        },
        'Expected subscriptions to be loaded.'
      );
    }
    return customer.subscriptions.data.find(
      (sub) => sub.items.data.find((item) => item.plan.id === planId) != null
    );
  }

  /**
   * Delete a cached customer record based on user ID & email.
   */
  async refreshCachedCustomer(
    uid: string,
    email: string
  ): Promise<Stripe.Customer | undefined> {
    try {
      return await this.customer({ uid, email, forceRefresh: true });
    } catch (err) {
      this.log.error(`subhub.refreshCachedCustomer.failed`, { err });
      return;
    }
  }

  /**
   * Remove the cache entry for a customer account
   * This is to be used on account deletion
   */
  @CacheClear({ cacheKey: StripeHelper.customerCacheKey })
  async removeCustomerFromCache(uid: string, email: string) {}

  /**
   * Fetches all plans that are attached to a product from the cached products
   */
  async fetchPlansByProductId(productId: string): Promise<Stripe.Plan[]> {
    const allPlans = await this.allPlans();
    return allPlans.filter(
      (plan) => (plan.product as Stripe.Product).id === productId
    );
  }

  /**
   * Fetches a product by its id from cached products.
   */
  async fetchProductById(
    productId: string
  ): Promise<Stripe.Product | undefined> {
    const allProducts = await this.allProducts();
    return allProducts.find((p) => p.id === productId);
  }

  /**
   * Fetches all plans from stripe and returns them.
   *
   * Use `allPlans` below to use the cached-enhanced version.
   */
  async fetchAllPlans(): Promise<Stripe.Plan[]> {
    const plans = [];
    for await (const item of this.stripe.plans.list({
      active: true,
      expand: ['data.product'],
    })) {
      if (!item.product) {
        this.log.error(
          `fetchAllPlans - Plan "${item.id}" missing Product`,
          item
        );
        continue;
      }

      if (typeof item.product === 'string') {
        this.log.error(
          `fetchAllPlans - Plan "${item.id}" failed to load Product`,
          item
        );
        continue;
      }

      if (item.product.deleted === true) {
        this.log.error(
          `fetchAllPlans - Plan "${item.id}" associated with Deleted Product`,
          item
        );
        continue;
      }

      const result = subscriptionProductMetadataValidator.validate({
        ...item.product.metadata,
        ...item.metadata,
      });

      if (result?.error) {
        const msg = `fetchAllPlans - Plan "${item.id}"'s metadata failed validation`;
        this.log.error(msg, { error: result.error, plan: item });

        Sentry.withScope((scope) => {
          scope.setContext('validationError', {
            error: result.error,
          });
          Sentry.captureMessage(msg, Sentry.Severity.Error);
        });

        continue;
      }

      plans.push(item);
    }
    return plans;
  }

  /**
   * Fetches all plans from stripe and returns them.
   *
   * Uses Redis caching if configured.
   */
  @Cacheable({
    cacheKey: STRIPE_PLANS_CACHE_KEY,
    ttlSeconds: (args, context) => context.plansAndProductsCacheTtlSeconds,
  })
  async allPlans(): Promise<Stripe.Plan[]> {
    return this.fetchAllPlans();
  }

  @CacheUpdate({
    cacheKey: STRIPE_PLANS_CACHE_KEY,
    ttlSeconds: (args, context) => context.plansAndProductsCacheTtlSeconds,
    cacheKeysToClear: 'noop',
    clearStrategy: noopCacheClearStrategy,
  })
  async updateAllPlans(allPlans: Stripe.Plan[]) {
    return allPlans;
  }

  async allAbbrevPlans(): Promise<AbbrevPlan[]> {
    const plans = await this.allPlans();
    return plans.map((p) => ({
      amount: p.amount,
      currency: p.currency,
      interval_count: p.interval_count,
      interval: p.interval,
      plan_id: p.id,
      plan_metadata: p.metadata,
      plan_name: p.nickname || '',
      product_id: (p.product as Stripe.Product).id,
      product_metadata: (p.product as Stripe.Product).metadata,
      product_name: (p.product as Stripe.Product).name,
    }));
  }

  /**
   * Find a plan by id or error if it's not a valid planId.
   */
  async findPlanById(planId: string): Promise<AbbrevPlan> {
    const plans = await this.allAbbrevPlans();
    const selectedPlan = plans.find((p) => p.plan_id === planId);
    if (!selectedPlan) {
      throw error.unknownSubscriptionPlan(planId);
    }
    return selectedPlan;
  }

  /**
   * Verify that the `planId` is a valid upgrade for the `currentPlanId`.
   *
   * Throws an error if its an invalid upgrade.
   */
  async verifyPlanUpdateForSubscription(
    currentPlanId: string,
    newPlanId: string
  ): Promise<void> {
    if (currentPlanId === newPlanId) {
      throw error.subscriptionAlreadyChanged();
    }

    const allPlans = await this.allAbbrevPlans();
    const currentPlan = allPlans.find((plan) => plan.plan_id === currentPlanId);
    const newPlan = allPlans.find((plan) => plan.plan_id === newPlanId);

    if (!newPlan || !currentPlan) {
      throw error.unknownSubscriptionPlan();
    }

    const planUpdateEligibility = getSubscriptionUpdateEligibility(
      currentPlan,
      newPlan
    );

    // We only allow upgrades
    if (planUpdateEligibility !== SubscriptionUpdateEligibility.UPGRADE) {
      throw error.invalidPlanUpdate();
    }
  }

  /**
   * Change a subscription to the new plan.
   *
   * Note that this call does not verify its a valid upgrade, the
   * `verifyPlanUpgradeForSubscription` should be done first to
   * validate this is an appropriate change for tier use.
   */
  async changeSubscriptionPlan(
    subscriptionId: string,
    newPlanId: string
  ): Promise<Stripe.Subscription> {
    const subscription = await this.stripe.subscriptions.retrieve(
      subscriptionId
    );
    const currentPlanId = subscription.items.data[0].plan.id;
    if (currentPlanId === newPlanId) {
      throw error.subscriptionAlreadyChanged();
    }

    const updatedMetadata = {
      ...subscription.metadata,
      previous_plan_id: currentPlanId,
      plan_change_date: moment().unix(),
    };

    const newSubscription = await this.stripe.subscriptions.update(
      subscriptionId,
      {
        cancel_at_period_end: false,
        items: [
          {
            id: subscription.items.data[0].id,
            plan: newPlanId,
          },
        ],
        metadata: updatedMetadata,
      }
    );
    await this.stripeFirestore.insertSubscriptionRecordWithBackfill(
      newSubscription
    );
    return newSubscription;
  }

  /**
   * Cancel a given subscription for a customer
   * If the subscription does not belong to the customer, throw an error
   */
  async cancelSubscriptionForCustomer(
    uid: string,
    email: string,
    subscriptionId: string
  ): Promise<void> {
    const subscription = await this.subscriptionForCustomer(
      uid,
      email,
      subscriptionId
    );
    if (!subscription) {
      throw error.unknownSubscription();
    }

    const newSubscription = await this.stripe.subscriptions.update(
      subscriptionId,
      {
        cancel_at_period_end: true,
        metadata: {
          ...(subscription.metadata || {}),
          cancelled_for_customer_at: moment().unix(),
        },
      }
    );
    await this.stripeFirestore.insertSubscriptionRecordWithBackfill(
      newSubscription
    );
  }

  /**
   * Reactivate a given subscription for a customer
   * If a customer has an active subscription that is set to cancel at the period end:
   *  1. Update the subscription to remain active at the period end
   *  2. Verify that after the update the subscription is still in an active state
   *    True: return the updated Subscription
   *    False: throw an error
   * If the customer does not own the subscription, throw an error
   */
  async reactivateSubscriptionForCustomer(
    uid: string,
    email: string,
    subscriptionId: string
  ): Promise<Stripe.Subscription> {
    const subscription = await this.subscriptionForCustomer(
      uid,
      email,
      subscriptionId
    );
    if (!subscription) {
      throw error.unknownSubscription();
    }

    if (!ACTIVE_SUBSCRIPTION_STATUSES.includes(subscription.status)) {
      const err = new Error(
        `Reactivated subscription (${subscriptionId}) is not active/trialing`
      );
      throw error.backendServiceFailure(
        'stripe',
        'reactivateSubscription',
        {},
        err
      );
    }

    const newSubscription = await this.stripe.subscriptions.update(
      subscriptionId,
      {
        cancel_at_period_end: false,
        metadata: {
          ...(subscription.metadata || {}),
          cancelled_for_customer_at: '',
        },
      }
    );
    await this.stripeFirestore.insertSubscriptionRecordWithBackfill(
      newSubscription
    );
    return newSubscription;
  }

  /**
   * Attempt to pay invoice by invoice id
   * Throws payment failed error on failure
   */
  async payInvoice(invoiceId: string): Promise<Stripe.Invoice> {
    let invoice;

    try {
      invoice = await this.stripe.invoices.pay(invoiceId, {
        expand: ['payment_intent'],
      });
    } catch (err) {
      if (err.code === 'card_declined') {
        throw error.paymentFailed();
      }
      throw err;
    }

    if (!this.paidInvoice(invoice)) {
      throw error.paymentFailed();
    }

    return invoice;
  }

  /**
   * Verify that the invoice was paid successfully.
   *
   * Note that the invoice *must have the `payment_intent` expanded*
   * or this function will fail.
   */
  paidInvoice(invoice: Stripe.Subscription['latest_invoice']): boolean {
    if (
      !invoice ||
      typeof invoice === 'string' ||
      !invoice.payment_intent ||
      typeof invoice.payment_intent === 'string'
    ) {
      throw error.internalValidationError('paidInvoice', {
        invoice: invoice,
      });
    }
    return (
      invoice.status === 'paid' && invoice.payment_intent.status === 'succeeded'
    );
  }

  /**
   * Retrieve a PaymentIntent from an invoice
   */
  async fetchPaymentIntentFromInvoice(
    invoice: Stripe.Invoice
  ): Promise<Stripe.PaymentIntent> {
    if (!invoice.payment_intent) {
      // We don't have any code working with draft invoices, so
      // this should not be hit... yet. PayPal support *will* likely operate
      // on draft invoices though.
      throw error.internalValidationError(
        'fetchPaymentIntentFromInvoice',
        invoice,
        new Error(`Invoice not finalized: ${invoice.id}`)
      );
    }
    if (typeof invoice.payment_intent !== 'string') {
      return invoice.payment_intent;
    }
    return this.stripe.paymentIntents.retrieve(invoice.payment_intent);
  }

  /**
   * Extract the source country from a subscription payment details.
   *
   * Requires the `latest_invoice.payment_intent` to be expanded during
   * subscription load.
   */
  extractSourceCountryFromSubscription(
    subscription: Stripe.Subscription
  ): null | string {
    // Eliminate all the optional values and ensure they were expanded such
    // that they're not a string.
    if (
      !subscription.latest_invoice ||
      typeof subscription.latest_invoice === 'string' ||
      !subscription.latest_invoice.payment_intent ||
      typeof subscription.latest_invoice.payment_intent === 'string'
    ) {
      return null;
    }

    if (subscription.latest_invoice.payment_intent.charges.data.length !== 0) {
      // Get the country from the payment details.
      // However, historically there were (rare) instances where `charges` was
      // not found in the object graph, hence the defensive code.
      // There's only one charge (the latest), per Stripe's docs.
      const paymentMethodDetails =
        subscription.latest_invoice.payment_intent.charges.data[0]
          .payment_method_details;

      if (paymentMethodDetails?.card?.country) {
        return paymentMethodDetails.card.country;
      }
    } else {
      Sentry.withScope((scope) => {
        scope.setContext('stripeSubscription', {
          subscription: { id: subscription.id },
        });
        Sentry.captureMessage(
          'Payment charges not found in subscription payment intent on subscription creation.',
          Sentry.Severity.Warning
        );
      });
    }
    return null;
  }

  async getBillingDetailsAndSubscriptions(uid: string) {
    const customer = await this.fetchCustomer(uid, [
      'subscriptions.data.latest_invoice',
      'invoice_settings.default_payment_method',
    ]);

    if (!customer) {
      return null;
    }

    const billingDetails = this.extractBillingDetails(
      customer
    ) as PaymentBillingDetails;

    if (billingDetails.payment_provider === 'paypal') {
      billingDetails.billing_agreement_id =
        this.getCustomerPaypalAgreement(customer);
    }

    if (
      billingDetails.payment_provider === 'paypal' &&
      this.hasSubscriptionRequiringPaymentMethod(customer)
    ) {
      if (!this.getCustomerPaypalAgreement(customer)) {
        billingDetails.paypal_payment_error =
          PAYPAL_PAYMENT_ERROR_MISSING_AGREEMENT;
      } else if (this.hasOpenInvoice(customer)) {
        billingDetails.paypal_payment_error =
          PAYPAL_PAYMENT_ERROR_FUNDING_SOURCE;
      }
    }

    const detailsAndSubs: {
      customerId: string;
      subscriptions: WebSubscription[];
    } & PaymentBillingDetails = {
      customerId: customer.id,
      subscriptions: [],
      ...billingDetails,
    };

    if (customer.subscriptions) {
      detailsAndSubs.subscriptions = await this.subscriptionsToResponse(
        customer.subscriptions
      );
    }

    return detailsAndSubs;
  }

  /**
   * Extracts billing details if a customer has a source on file.
   */
  extractBillingDetails(customer: Stripe.Customer) {
    const defaultPayment = customer.invoice_settings.default_payment_method;
    const paymentProvider = this.getPaymentProvider(customer);

    if (defaultPayment) {
      if (typeof defaultPayment === 'string') {
        // This should always be expanded here.
        throw error.backendServiceFailure('stripe', 'paymentExpansion');
      }

      if (defaultPayment.card) {
        return {
          billing_name: defaultPayment.billing_details.name,
          payment_provider: paymentProvider,
          payment_type: defaultPayment.card.funding,
          last4: defaultPayment.card.last4,
          exp_month: defaultPayment.card.exp_month,
          exp_year: defaultPayment.card.exp_year,
          brand: defaultPayment.card.brand,
        };
      }
    }
    if (customer.sources && customer.sources.data.length > 0) {
      // Currently assume a single source, and we can only access these attributes
      // on cards.
      const src = customer.sources.data[0];
      if (src.object === 'card') {
        return {
          billing_name: src.name,
          payment_provider: paymentProvider,
          payment_type: src.funding,
          last4: src.last4,
          exp_month: src.exp_month,
          exp_year: src.exp_year,
          brand: src.brand,
        };
      }
    }

    return {
      payment_provider: paymentProvider,
    };
  }

  /**
   * Formats Stripe subscriptions for a customer into an appropriate response.
   */
  async subscriptionsToResponse(
    subscriptions: Stripe.ApiList<Stripe.Subscription>
  ): Promise<WebSubscription[]> {
    const subs = [];
    const products = await this.allAbbrevProducts();
    for (const sub of subscriptions.data) {
      let failure_code, failure_message;

      // Don't include incomplete/incomplete_expired subscriptions as we pretend they
      // don't exist. When a user tries to sign-up, if an incomplete is found, it will
      // then be used correctly.
      if (sub.status === 'incomplete' || sub.status === 'incomplete_expired') {
        continue;
      }

      let latestInvoice = sub.latest_invoice;
      if (typeof latestInvoice === 'string') {
        latestInvoice = await this.stripe.invoices.retrieve(latestInvoice, {
          expand: ['charge'],
        });
      }

      // If this is a charge-automatically payment that is past_due, attempt
      // to get details of why it failed. The caller should expand the last_invoice
      // calls by passing ['data.subscriptions.data.latest_invoice'] to `fetchCustomer`
      // as the `expand` argument or this will not fetch the failure code/message.
      if (
        sub.status === 'past_due' &&
        sub.collection_method === 'charge_automatically' &&
        latestInvoice &&
        latestInvoice.charge
      ) {
        let charge = latestInvoice.charge;
        if (typeof latestInvoice.charge === 'string') {
          charge = await this.stripe.charges.retrieve(latestInvoice.charge);
        }

        if (typeof charge !== 'string') {
          failure_code = charge.failure_code;
          failure_message = charge.failure_message;
        }
      }

      // @ts-ignore
      const product = products.find((p) => p.product_id === sub.plan.product);

      const { product_id, product_name } = product!;

      // FIXME: Note that the plan is only set if the subscription contains a single
      // plan. Multiple product support will require changes here to fetch all
      // plans for this subscription.
      subs.push({
        _subscription_type: MozillaSubscriptionTypes.WEB,
        created: sub.created,
        current_period_end: sub.current_period_end,
        current_period_start: sub.current_period_start,
        cancel_at_period_end: sub.cancel_at_period_end,
        end_at: sub.ended_at,
        latest_invoice: latestInvoice!.number!,
        // @ts-ignore
        plan_id: sub.plan.id,
        product_name,
        product_id,
        status: sub.status,
        subscription_id: sub.id,
        failure_code,
        failure_message,
      });
    }
    return subs;
  }

  /**
   * Formats Stripe subscriptions with information needed to provide support.
   */
  async formatSubscriptionsForSupport(
    subscriptions: Stripe.ApiList<Stripe.Subscription>
  ) {
    const subs = [];
    for (const sub of subscriptions.data) {
      const plan = singlePlan(sub);
      if (!plan) {
        throw error.internalValidationError(
          'formatSubscriptionsForSupport',
          sub,
          new Error(`Unexpected multiple items for subscription: ${sub.id}`)
        );
      }
      const product = await this.expandResource(plan.product, PRODUCT_RESOURCE);

      if (!product || product.deleted) {
        throw error.internalValidationError(
          'formatSubscriptionsForSupport',
          sub,
          new Error(`Product invalid for subcription: ${sub.id}`)
        );
      }
      const product_name = product.name;

      let previous_product = null;
      let plan_changed = null;

      if (sub.metadata.previous_plan_id !== undefined) {
        const previousPlan = await this.findPlanById(
          sub.metadata.previous_plan_id
        );
        previous_product = previousPlan.product_name;
        plan_changed = Number(sub.metadata.plan_change_date);
      }

      // FIXME: Note that the plan is only set if the subscription contains a single
      // plan. Multiple product support will require changes here to fetch all
      // plans for this subscription.
      subs.push({
        created: sub.created,
        current_period_end: sub.current_period_end,
        current_period_start: sub.current_period_start,
        plan_changed,
        previous_product,
        product_name,
        status: sub.status,
        subscription_id: sub.id,
      });
    }
    return subs;
  }

  /**
   * Use the Stripe lib to authenticate and get a webhook event.
   */
  constructWebhookEvent(payload: any, signature: string): Stripe.Event {
    return this.stripe.webhooks.constructEvent(
      payload,
      signature,
      this.webhookSecret
    );
  }

  /**
   * Extract invoice details for billing emails.
   *
   * Note that this function throws an error in the following cases:
   *   - Stripe customer is deleted.
   *   - No plan in the invoice.
   *   - No product attached to the plan.
   *   - No email on the customer object.
   */
  async extractInvoiceDetailsForEmail(invoice: Stripe.Invoice) {
    const customer = await this.expandResource(
      invoice.customer,
      CUSTOMER_RESOURCE
    );
    if (!customer || customer.deleted) {
      throw error.unknownCustomer(invoice.customer);
    }

    // Dig up & expand objects in the invoice that usually come as just IDs
    const { plan } = invoice.lines.data[0];
    if (!plan) {
      // No plan is present if this is not a subscription or proration, which
      // should never happen as we only have subscriptions.
      throw error.internalValidationError(
        'extractInvoiceDetailsForEmail',
        invoice.lines.data[0],
        new Error(`Unexpected line item: ${invoice.lines.data[0].id}`)
      );
    }
    const [abbrevProduct, charge] = await Promise.all([
      this.expandAbbrevProductForPlan(plan),
      this.expandResource(invoice.charge, CHARGES_RESOURCE),
    ]);

    if (!abbrevProduct) {
      throw error.internalValidationError(
        'extractInvoiceDetailsForEmail',
        invoice,
        new Error(`No product attached to plan ${plan.id}`)
      );
    }

    if (!customer.email) {
      throw error.internalValidationError(
        'extractInvoiceDetailsForEmail',
        { customerId: customer.id },
        'Customer missing email.'
      );
    }

    const {
      email,
      metadata: { userid: uid },
    } = customer;
    const { product_id: productId, product_name: productName } = abbrevProduct;
    const {
      number: invoiceNumber,
      created: invoiceDate,
      currency: invoiceTotalCurrency,
      total: invoiceTotalInCents,
      hosted_invoice_url: invoiceLink,
      lines: {
        data: [
          {
            period: { end: nextInvoiceDate },
          },
        ],
      },
    } = invoice;
    const { id: planId, nickname: planName } = plan;
    const productMetadata = this.mergeMetadata(plan, abbrevProduct);
    const {
      emailIconURL: planEmailIconURL = '',
      downloadURL: planDownloadURL = '',
    } = productMetadata;

    const { lastFour, cardType } = await this.extractCardDetails({
      charge,
    });

    const payment_provider = this.getPaymentProvider(customer);

    return {
      uid,
      email,
      cardType,
      lastFour,
      payment_provider,
      invoiceLink,
      invoiceNumber,
      invoiceTotalInCents,
      invoiceTotalCurrency,
      invoiceDate: new Date(invoiceDate * 1000),
      nextInvoiceDate: new Date(nextInvoiceDate * 1000),
      productId,
      productName,
      planId,
      planName,
      planEmailIconURL,
      planDownloadURL,
      productMetadata,
    };
  }

  async formatSubscriptionForEmail(
    subscription: Stripe.Subscription
  ): Promise<FormattedSubscriptionForEmail> {
    const subPlan = singlePlan(subscription);
    if (!subPlan) {
      throw error.internalValidationError(
        'formatSubscription',
        subscription,
        new Error(
          `Multiple items for a subscription not supported: ${subscription.id}`
        )
      );
    }
    const plan = await this.expandResource(subPlan, PLAN_RESOURCE);
    const abbrevProduct = await this.expandAbbrevProductForPlan(plan);
    const { product_id: productId, product_name: productName } = abbrevProduct;
    const { id: planId, nickname: planName } = plan;
    const productMetadata = this.mergeMetadata(plan, abbrevProduct);
    const {
      emailIconURL: planEmailIconURL = '',
      downloadURL: planDownloadURL = '',
    } = productMetadata;
    return {
      productId,
      productName,
      planId,
      planName,
      planEmailIconURL,
      planDownloadURL,
      productMetadata,
    };
  }

  async formatSubscriptionsForEmails(
    customer: Readonly<Stripe.Customer>
  ): Promise<FormattedSubscriptionForEmail[]> {
    if (!customer.subscriptions) {
      return [];
    }

    let formattedSubscriptions = [];

    for (const subscription of customer.subscriptions.data) {
      if (ACTIVE_SUBSCRIPTION_STATUSES.includes(subscription.status)) {
        const formattedSubscription = await this.formatSubscriptionForEmail(
          subscription
        );
        formattedSubscriptions.push(formattedSubscription);
      }
    }

    return formattedSubscriptions;
  }

  async extractCardDetails({ charge }: { charge: Stripe.Charge | null }) {
    let lastFour: string | null = null;
    let cardType: string | null = null;
    if (charge?.payment_method_details?.card) {
      ({ brand: cardType, last4: lastFour } =
        charge.payment_method_details.card);
    }
    return { lastFour, cardType };
  }

  /**
   * Extract source details for billing emails
   */
  async extractSourceDetailsForEmail(source: Stripe.Source | Stripe.Card) {
    if (source.object !== 'card') {
      // We shouldn't get here - all sources should currently be cards.
      throw error.internalValidationError(
        'extractSourceDetailsForEmail',
        source,
        new Error(`Payment source was not card: ${source.id}`)
      );
    }
    if (!source.customer) {
      // We shouldn't get here - our sources should be attached to customers.
      throw error.internalValidationError(
        'extractSourceDetailsForEmail',
        source,
        new Error(`Customer was not found on source: ${source.id}`)
      );
    }

    const customer = await this.expandResource(
      source.customer,
      CUSTOMER_RESOURCE
    );
    if (customer.deleted === true) {
      throw error.unknownCustomer(source.customer);
    }

    if (!customer.subscriptions) {
      throw error.internalValidationError(
        'extractSourceDetailsForEmail',
        customer,
        new Error(`No subscriptions found for customer: ${customer.id}`)
      );
    }

    const subscriptions = await this.formatSubscriptionsForEmails(customer);

    if (subscriptions.length === 0) {
      throw error.missingSubscriptionForSourceError(
        'extractSourceDetailsForEmail',
        source
      );
    }
    if (!customer.email) {
      throw error.internalValidationError(
        'extractSourceDetailsForEmail',
        { customerId: customer.id },
        'Customer missing email.'
      );
    }

    const {
      email,
      metadata: { userid: uid },
    } = customer;

    return {
      uid,
      email,
      subscriptions,
    };
  }

  /**
   * Extract subscription update details for billing emails
   */
  async extractSubscriptionUpdateEventDetailsForEmail(event: Stripe.Event) {
    if (event.type !== 'customer.subscription.updated') {
      throw error.internalValidationError(
        'extractSubscriptionUpdateEventDetailsForEmail',
        event,
        new Error('Event was not of type customer.subscription.updated')
      );
    }

    const eventData = event.data;
    const subscription = eventData.object as Stripe.Subscription;
    const customer = await this.expandResource(
      subscription.customer,
      'customers'
    );
    if (customer.deleted === true) {
      throw error.unknownCustomer(subscription.customer);
    }

    let invoice = subscription.latest_invoice;
    if (typeof invoice === 'string') {
      // if we have to do a fetch, go ahead and ensure we also get the additional needed resource
      invoice = await this.stripe.invoices.retrieve(invoice, {
        expand: ['charge'],
      });
    }

    const {
      email,
      metadata: { userid: uid },
    } = customer;

    const planNew = singlePlan(subscription);
    if (!planNew) {
      throw error.internalValidationError(
        'extractSubscriptionUpdateEventDetailsForEmail',
        event,
        new Error(
          `Multiple items for a subscription not supported: ${subscription.id}`
        )
      );
    }

    const previousAttributes = eventData.previous_attributes;
    const planIdNew = planNew.id;
    // This may be in error, its not obvious what previous attributes must exist
    // @ts-ignore
    const planOld = previousAttributes.plan;
    const cancelAtPeriodEndNew = subscription.cancel_at_period_end;
    // @ts-ignore
    const cancelAtPeriodEndOld = previousAttributes.cancel_at_period_end;

    const abbrevProductNew = await this.expandAbbrevProductForPlan(planNew);
    const {
      interval: productPaymentCycle,
      amount: paymentAmountNewInCents,
      currency: paymentAmountNewCurrency,
    } = planNew;
    const { product_id: productIdNew, product_name: productNameNew } =
      abbrevProductNew;
    const productNewMetadata = this.mergeMetadata(planNew, abbrevProductNew);
    const {
      productOrder: productOrderNew,
      emailIconURL: productIconURLNew = '',
      downloadURL: productDownloadURLNew = '',
    } = productNewMetadata;

    const baseDetails = {
      uid,
      email,
      planId: planIdNew,
      productId: productIdNew,
      productIdNew,
      productNameNew,
      productIconURLNew,
      productDownloadURLNew,
      planIdNew,
      paymentAmountNewInCents,
      paymentAmountNewCurrency,
      productPaymentCycle,
      closeDate: event.created,
      productMetadata: productNewMetadata,
    };

    if (!invoice) {
      throw error.internalValidationError(
        'extractSubscriptionUpdateEventDetailsForEmail',
        event,
        new Error(`Invoice expected for subscription: ${subscription.id}`)
      );
    }

    if (!cancelAtPeriodEndOld && cancelAtPeriodEndNew && !planOld) {
      return this.extractSubscriptionUpdateCancellationDetailsForEmail(
        subscription,
        baseDetails,
        invoice
      );
    } else if (cancelAtPeriodEndOld && !cancelAtPeriodEndNew && !planOld) {
      return this.extractSubscriptionUpdateReactivationDetailsForEmail(
        subscription,
        baseDetails,
        invoice
      );
    } else if (!cancelAtPeriodEndNew && planOld) {
      return this.extractSubscriptionUpdateUpgradeDowngradeDetailsForEmail(
        subscription,
        baseDetails,
        invoice,
        customer,
        productOrderNew,
        planOld
      );
    }

    // unknown update scenario, but let's return some details anyway
    return baseDetails;
  }

  /**
   * Helper for extractSubscriptionUpdateEventDetailsForEmail to further
   * extract details in cancellation case
   */
  async extractSubscriptionUpdateCancellationDetailsForEmail(
    subscription: Stripe.Subscription,
    baseDetails: any,
    invoice: Stripe.Invoice
  ) {
    const { current_period_end: serviceLastActiveDate } = subscription;

    const {
      uid,
      email,
      planId,
      productId,
      productNameNew: productName,
      productIconURLNew: planEmailIconURL,
    } = baseDetails;

    const {
      total: invoiceTotalInCents,
      currency: invoiceTotalCurrency,
      created: invoiceDate,
    } = invoice;

    return {
      updateType: SUBSCRIPTION_UPDATE_TYPES.CANCELLATION,
      email,
      uid,
      productId,
      planId,
      planEmailIconURL,
      productName,
      invoiceDate: new Date(invoiceDate * 1000),
      invoiceTotalInCents,
      invoiceTotalCurrency,
      serviceLastActiveDate: new Date(serviceLastActiveDate * 1000),
    };
  }

  /**
   * Helper for extractSubscriptionUpdateEventDetailsForEmail to further
   * extract details in reactivation case
   *
   * @param {Subscription} subscription
   * @param {*} baseDetails
   * @param {Invoice} invoice
   */
  async extractSubscriptionUpdateReactivationDetailsForEmail(
    subscription: Stripe.Subscription,
    baseDetails: any,
    invoice: Stripe.Invoice
  ) {
    const {
      uid,
      email,
      planId,
      productId,
      productNameNew: productName,
      productIconURLNew: planEmailIconURL,
    } = baseDetails;

    const { lastFour, cardType } =
      await this.extractCustomerDefaultPaymentDetails({
        uid,
        email,
      });

    const upcomingInvoice = await this.stripe.invoices.retrieveUpcoming({
      subscription: subscription.id,
    });
    const {
      total: invoiceTotalInCents,
      currency: invoiceTotalCurrency,
      created: nextInvoiceDate,
    } = upcomingInvoice;

    return {
      updateType: SUBSCRIPTION_UPDATE_TYPES.REACTIVATION,
      email,
      uid,
      productId,
      planId,
      planEmailIconURL,
      productName,
      invoiceTotalInCents,
      invoiceTotalCurrency,
      cardType,
      lastFour,
      nextInvoiceDate: nextInvoiceDate
        ? new Date(nextInvoiceDate * 1000)
        : null,
    };
  }

  async extractCustomerDefaultPaymentDetails({
    uid,
    email,
  }: {
    uid: string;
    email: string;
  }) {
    let lastFour = null;
    let cardType = null;

    const customer = await this.customer({ uid, email });
    if (!customer) {
      throw error.unknownCustomer(uid);
    }

    if (customer.invoice_settings.default_payment_method) {
      // Post-SCA customer with a default PaymentMethod
      // default_payment_method *should* be expanded, but just in case...
      const paymentMethod = await this.expandResource(
        customer.invoice_settings.default_payment_method,
        'paymentMethods'
      );
      if (paymentMethod.card) {
        ({ last4: lastFour, brand: cardType } = paymentMethod.card);
      }
      // PaymentMethods should all be cards, but email templates should
      // already handle undefined lastFour and cardType gracefully
    } else if (customer.default_source) {
      // Legacy pre-SCA customer still using a Source rather than PaymentMethod
      let source: Stripe.Card;
      if (typeof customer.default_source !== 'string') {
        // We don't expand this resource in cached customer, but it seemed to happen once
        source = customer.default_source as Stripe.Card;
      } else {
        // We *do* expand sources, so just do a local lookup by ID.
        source = customer.sources?.data.find(
          (s) => s.id === customer.default_source
        ) as Stripe.Card;
      }
      ({ last4: lastFour, brand: cardType } = source);
    }

    return { lastFour, cardType };
  }

  /**
   * Helper for extractSubscriptionUpdateEventDetailsForEmail to further
   * extract details in upgrade & downgrade cases.
   */
  async extractSubscriptionUpdateUpgradeDowngradeDetailsForEmail(
    subscription: Stripe.Subscription,
    baseDetails: any,
    invoice: Stripe.Invoice,
    customer: Stripe.Customer,
    productOrderNew: string,
    planOld: Stripe.Plan
  ) {
    const upcomingInvoice = await this.stripe.invoices.retrieveUpcoming({
      subscription: subscription.id,
    });

    const { id: invoiceId, number: invoiceNumber } = invoice;

    const {
      currency: paymentProratedCurrency,
      amount_due: paymentProratedInCents,
    } = upcomingInvoice;

    // https://github.com/mozilla/subhub/blob/e224feddcdcbafaf0f3cd7d52691d29d94157de5/src/hub/vendor/customer.py#L643
    const abbrevProductOld = await this.expandAbbrevProductForPlan(planOld);
    const {
      amount: paymentAmountOldInCents,
      currency: paymentAmountOldCurrency,
    } = planOld;
    const { product_id: productIdOld, product_name: productNameOld } =
      abbrevProductOld;
    const {
      productOrder: productOrderOld,
      emailIconURL: productIconURLOld = '',
      downloadURL: productDownloadURLOld = '',
    } = this.mergeMetadata(planOld, abbrevProductOld);

    const updateType =
      productOrderNew > productOrderOld
        ? SUBSCRIPTION_UPDATE_TYPES.UPGRADE
        : SUBSCRIPTION_UPDATE_TYPES.DOWNGRADE;

    return {
      ...baseDetails,
      updateType,
      productIdOld,
      productNameOld,
      productIconURLOld,
      productDownloadURLOld,
      paymentAmountOldInCents,
      paymentAmountOldCurrency,
      invoiceNumber,
      invoiceId,
      paymentProratedInCents,
      paymentProratedCurrency,
    };
  }

  /**
   * Accept a string ID or resource object, return a resource object after
   * retrieving (if necessary)
   *
   * @template T
   * @param {string | T} resource
   * @param {string} resourceType
   *
   * @returns {Promise<T>}
   */
  async expandResource<T>(
    resource: string | T,
    resourceType: typeof VALID_RESOURCE_TYPES[number]
  ): Promise<T> {
    if (typeof resource !== 'string') {
      return resource;
    }

    if (!VALID_RESOURCE_TYPES.includes(resourceType)) {
      const errorMsg = `stripeHelper.expandResource was provided an invalid resource type: ${resourceType}`;
      const error = new Error(errorMsg);
      this.log.error(`stripeHelper.expandResource.failed`, { error });
      throw error;
    }

    switch (resourceType) {
      case CUSTOMER_RESOURCE:
        const customer = await this.stripeFirestore.retrieveAndFetchCustomer(
          resource
        );
        const subscriptions =
          await this.stripeFirestore.retrieveCustomerSubscriptions(resource);
        if (subscriptions.length) {
          (customer as any).subscriptions = {
            data: subscriptions as any,
            has_more: false,
          };
        }
        // @ts-ignore
        return customer;
      case SUBSCRIPTIONS_RESOURCE:
        // @ts-ignore
        return this.stripeFirestore.retrieveAndFetchSubscription(resource);
      case INVOICES_RESOURCE:
        try {
          const invoice = await this.stripeFirestore.retrieveInvoice(resource);
          // @ts-ignore
          return invoice;
        } catch (err) {
          if (err.name === FirestoreStripeError.FIRESTORE_INVOICE_NOT_FOUND) {
            const invoice = await this.stripe.invoices.retrieve(resource);
            await this.stripeFirestore.retrieveAndFetchCustomer(
              invoice.customer as string
            );
            await this.stripeFirestore.insertInvoiceRecord(invoice);
            // @ts-ignore
            return invoice;
          }
          throw err;
        }
    }

    // @ts-ignore
    return this.stripe[resourceType].retrieve(resource);
  }

  /**
   * Process a customer event that needs to be saved to Firestore.
   */
  async processCustomerEventToFirestore(event: Stripe.Event) {
    const { data } = event;
    let customer: Partial<Stripe.Customer>;
    if (data.previous_attributes) {
      customer = pick(data.object, [
        'id',
        'metadata',
        ...Object.keys(data.previous_attributes),
      ]);
    } else {
      customer = data.object;
    }
    // Ensure the customer and its subscriptions exist in Firestore.
    // Note that we still insert the object here in case we've already
    // fetched the customer previously.
    return this.stripeFirestore.insertCustomerRecordWithBackfill(
      customer.metadata!.userid,
      customer
    );
  }

  /**
   * Process a subscription event that needs to be saved to Firestore.
   */
  async processSubscriptionEventToFirestore(event: Stripe.Event) {
    const { data } = event;
    let subscription: Partial<Stripe.Subscription>;
    if (data.previous_attributes) {
      subscription = pick(data.object, [
        'id',
        'customer',
        ...Object.keys(data.previous_attributes),
      ]);
    } else {
      subscription = data.object;
      // If we have no prior attributes, such that this is a full object
      // insert, we can insert without checking for prior one.
      return this.stripeFirestore.insertSubscriptionRecordWithBackfill(
        subscription
      );
    }

    // If we already have a subscription, we can insert the update.
    try {
      await this.stripeFirestore.retrieveSubscription(subscription.id!);
      return this.stripeFirestore.insertSubscriptionRecord(subscription);
    } catch (err) {
      if (err.name === FirestoreStripeError.FIRESTORE_SUBSCRIPTION_NOT_FOUND) {
        return this.stripeFirestore.insertSubscriptionRecordWithBackfill(
          data.object
        );
      }
      throw err;
    }
  }

  /**
   * Process a invoice event that needs to be saved to Firestore.
   */
  async processInvoiceEventToFirestore(event: Stripe.Event) {
    const { data } = event;

    let invoice: Partial<Stripe.Invoice>;
    if (data.previous_attributes) {
      invoice = pick(data.object, [
        'id',
        'customer',
        'subscription',
        ...Object.keys(data.previous_attributes),
      ]);
    } else {
      invoice = data.object;
    }

    try {
      await this.stripeFirestore.retrieveInvoice(invoice.id!);
      return this.stripeFirestore.insertInvoiceRecord(invoice);
    } catch (err) {
      if (err.name !== FirestoreStripeError.FIRESTORE_INVOICE_NOT_FOUND) {
        await this.stripeFirestore.retrieveAndFetchSubscription(
          invoice.subscription as string
        );
        // Now that the subscription is fetched, we must check to see if we have
        // a prior invoice. If we don't, we need a complete invoice record inserted.
        return this.stripeFirestore.insertInvoiceRecord(data.object);
      }
      throw err;
    }
  }

  /**
   * Process a webhook event from Stripe and if needed, save it to Firestore.
   */
  async processWebhookEventToFirestore(event: Stripe.Event) {
    const { type, data } = event;
    // Note that we must insert before any event handled by the general
    // webhook code to ensure the object is up to date in Firestore before
    // our code handles the event.
    let handled = true;
    try {
      switch (type as Stripe.WebhookEndpointUpdateParams.EnabledEvent) {
        case 'invoice.created':
        case 'invoice.finalized':
        case 'invoice.paid':
        case 'invoice.payment_failed':
        case 'invoice.updated':
        case 'invoice.deleted':
          await this.processInvoiceEventToFirestore(event);
          break;
        case 'customer.created':
        case 'customer.updated':
          if (!event.request?.id) {
            await this.processCustomerEventToFirestore(event);
          }
          break;
        case 'customer.deleted':
          await this.processCustomerEventToFirestore(event);
          break;
        case 'customer.subscription.created':
        case 'customer.subscription.updated':
          if (!event.request?.id) {
            await this.processSubscriptionEventToFirestore(event);
          }
          break;
        case 'customer.subscription.deleted':
          await this.processSubscriptionEventToFirestore(event);
          break;
        default: {
          handled = false;
          break;
        }
      }
    } catch (err) {
      if (err.name === FirestoreStripeError.STRIPE_CUSTOMER_DELETED) {
        // We cannot back-fill Firestore with records for deleted customers
        // as they're missing necessary metadata for us to know which user
        // the customer belongs to.
        return handled;
      }
      throw err;
    }
    return handled;
  }

  /**
   * Accept a Stripe Plan, attempt to expand an AbbrevProduct from cache
   * or Stripe fetch
   */
  async expandAbbrevProductForPlan(plan: Stripe.Plan): Promise<AbbrevProduct> {
    // @ts-ignore
    const checkDeletedProduct = (product) => {
      if (product.deleted === true) {
        throw error.unknownSubscriptionPlan(plan.id);
      }
      return this.abbrevProductFromStripeProduct(product);
    };

    // The "plan" argument might not have any product info on it.
    const planWithProductId = await this.findPlanById(plan.id);

    // Next, look for product details in cache
    const products = await this.allAbbrevProducts();
    const productCached = products.find(
      (p) => p.product_id === planWithProductId.product_id
    );
    if (productCached) {
      return productCached;
    }

    // Finally, do a direct Stripe fetch if none of the above works.
    return checkDeletedProduct(
      await this.stripe.products.retrieve(planWithProductId.product_id)
    );
  }

  /**
   * Metadata consists of product metadata with per-plan overrides.
   *
   * @param {Plan} plan
   * @param {AbbrevProduct} abbrevProduct
   */
  mergeMetadata(
    plan: Stripe.Plan,
    abbrevProduct: AbbrevProduct
  ): Stripe.Metadata {
    return {
      ...abbrevProduct.product_metadata,
      ...plan.metadata,
    };
  }
}

/**
 * Create a Stripe Helper with built-in caching.
 */
export function createStripeHelper(log: any, config: any, statsd: StatsD) {
  return new StripeHelper(log, config, statsd);
}
