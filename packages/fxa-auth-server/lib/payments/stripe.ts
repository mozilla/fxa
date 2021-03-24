/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import * as Sentry from '@sentry/node';
import cacheManager, { Cacheable, CacheClear } from '@type-cacheable/core';
import { useAdapter } from '@type-cacheable/ioredis-adapter';
import {
  createAccountCustomer,
  deleteAccountCustomer,
  getAccountCustomerByUid,
  updatePayPalBA,
} from 'fxa-shared/db/models/auth';
import { AbbrevPlan, AbbrevProduct } from 'fxa-shared/dist/subscriptions/types';
import { StatsD } from 'hot-shots';
import ioredis from 'ioredis';
import moment from 'moment';
import { Logger } from 'mozlog';
import { Stripe } from 'stripe';
import { Container } from 'typedi';

import { ConfigType } from '../../config';
import error from '../error';
import Redis from '../redis';
import { CurrencyHelper } from './currencies';

const CUSTOMER_RESOURCE = 'customers';
const SUBSCRIPTIONS_RESOURCE = 'subscriptions';
const PRODUCT_RESOURCE = 'products';
const PLAN_RESOURCE = 'plans';
const CHARGES_RESOURCE = 'charges';
const INVOICES_RESOURCE = 'invoices';
const PAYMENT_METHOD_RESOURCE = 'paymentMethods';

enum STRIPE_CUSTOMER_METADATA {
  PAYPAL_AGREEMENT = 'paypalAgreementId',
}

export enum STRIPE_INVOICE_METADATA {
  PAYPAL_TRANSACTION_ID = 'paypalTransactionId',
  PAYPAL_REFUND_TRANSACTION_ID = 'paypalRefundTransactionId',
  EMAIL_SENT = 'emailSent',
  RETRY_ATTEMPTS = 'paymentAttempts',
}

/** Represents all subscription statuses that are considered active for a customer */
export const ACTIVE_SUBSCRIPTION_STATUSES: Stripe.Subscription['status'][] = [
  'active',
  'past_due',
  'trialing',
];

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

type BillingAddressOptions = {
  city: string;
  country: string;
  line1: string;
  line2: string;
  postalCode: string;
  state: string;
};

/**
 * Determine for two product metadata object's whether the new one
 * is a valid upgrade for the old one.
 *
 * Throws errors if necessary metadata is not present to determine
 * if its an upgrade.
 *
 * @param {AbbrevProduct['product_metadata']} oldMetadata Old product metadata
 * @param {AbbrevProduct['product_metadata']} newMetadata New product metadata
 * @returns {boolean} Whether the new product is an upgrade.
 */
function validateProductUpdate(
  oldMetadata: AbbrevProduct['product_metadata'],
  newMetadata: AbbrevProduct['product_metadata']
): boolean {
  if (!oldMetadata || !newMetadata) {
    throw error.unknownSubscriptionPlan();
  }

  const oldId = oldMetadata.productSet;
  const newId = newMetadata.productSet;
  if (!oldId || oldId !== newId) {
    // Incompatible product sets
    return false;
  }
  const oldOrder = Number.parseInt(oldMetadata.productOrder);
  const newOrder = Number.parseInt(newMetadata.productOrder);
  if (isNaN(oldOrder) || isNaN(newOrder)) {
    throw error.unknownSubscriptionPlan();
  }
  return oldOrder !== newOrder;
}

export class StripeHelper {
  // Note that this isn't quite accurate, as the auth-server logger has some extras
  // attached to it in Hapi.
  private log: Logger;
  private customerCacheTtlSeconds: number;
  private plansAndProductsCacheTtlSeconds: number;
  private webhookSecret: string;
  private stripe: Stripe;
  private redis: ioredis.Redis | undefined;
  public currencyHelper: CurrencyHelper;

  /**
   * Create a Stripe Helper with built-in caching.
   */
  constructor(log: Logger, config: ConfigType, statsd?: StatsD) {
    this.log = log;
    this.customerCacheTtlSeconds = config.subhub.customerCacheTtlSeconds;
    this.plansAndProductsCacheTtlSeconds = config.subhub.plansCacheTtlSeconds;
    this.webhookSecret = config.subscriptions.stripeWebhookSecret;
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
      apiVersion: '2020-03-02',
      maxNetworkRetries: 3,
    });
    cacheManager.setOptions({
      // Ensure the StripeHelper instance is passed into TTLBuilder functions
      excludeContext: false,
    });
    this.redis = redis;
    if (this.redis) {
      useAdapter(this.redis);
    }

    if (statsd) {
      this.stripe.on('response', (response) => {
        statsd.timing('stripe_request', response.elapsed);
      });
    }
  }

  /**
   * Fetch all product data and cache it if Redis is enabled.
   *
   * Use `allProducts` below to use the cached-enhanced version.
   *
   * @returns {Promise<AbbrevProduct[]>} All the products.
   */
  async fetchAllProducts() {
    const products = [];
    for await (const product of this.stripe.products.list()) {
      products.push(this.abbrevProductFromStripeProduct(product));
    }
    return products;
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
   * Fetches all products from stripe and returns them.
   *
   * Uses Redis caching if configured.
   *
   * @returns {Promise<AbbrevProduct[]>} All the products.
   */
  @Cacheable({
    cacheKey: 'listProducts',
    ttlSeconds: (args, context) => context.plansAndProductsCacheTtlSeconds,
  })
  async allProducts() {
    return this.fetchAllProducts();
  }

  /** BEGIN: NEW FLOW HELPERS FOR PAYMENT METHODS
   *
   * The following methods until the END are for the new payment method
   * oriented flows that utilize client logic to determine appropriate actions.
   *
   **/

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
    await createAccountCustomer(uid, stripeCustomer.id);
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
      await this.stripe.customers.update(customerId, {
        invoice_settings: { default_payment_method: paymentMethodId },
      });
      // Try paying now instead of waiting for Stripe since this could block a
      // customer from finishing a payment
      await this.stripe.invoices.pay(invoiceId);
    } catch (err) {
      if (err.type === 'StripeCardError') {
        throw error.rejectedSubscriptionPaymentToken(err.message, err);
      }
      throw err;
    }
    return this.stripe.invoices.retrieve(invoiceId, {
      expand: ['payment_intent'],
    });
  }

  /**
   * Create a subscription for the provided customer.
   */
  async createSubscriptionWithPMI(opts: {
    customerId: string;
    priceId: string;
    paymentMethodId?: string;
    subIdempotencyKey: string;
  }) {
    const { customerId, priceId, paymentMethodId, subIdempotencyKey } = opts;

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
      await this.stripe.customers.update(customerId, {
        invoice_settings: { default_payment_method: paymentMethodId },
      });
    }

    return this.stripe.subscriptions.create(
      {
        customer: customerId,
        items: [{ price: priceId }],
        expand: ['latest_invoice.payment_intent'],
      },
      { idempotencyKey: `ssc-${subIdempotencyKey}` }
    );
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
  }) {
    const { customer, priceId, subIdempotencyKey } = opts;

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

    return this.stripe.subscriptions.create(
      {
        customer: customer.id,
        items: [{ price: priceId }],
        expand: ['latest_invoice'],
        collection_method: 'send_invoice',
        days_until_due: 1,
      },
      { idempotencyKey: `ssc-${subIdempotencyKey}` }
    );
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
   *
   * @param id
   */
  async getInvoice(id: string): Promise<Stripe.Invoice> {
    return this.stripe.invoices.retrieve(id);
  }

  /**
   * Finalizes an invoice and marks auto_advance as false.
   *
   * @param invoice
   */
  async finalizeInvoice(invoice: Stripe.Invoice) {
    return this.stripe.invoices.finalizeInvoice(invoice.id, {
      auto_advance: false,
    });
  }

  /**
   * Updates invoice metadata with the PayPal Transaction ID.
   *
   * @param invoice
   * @param transactionId
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
   *
   * @param invoice
   * @param transactionId
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
   *
   * @param invoice
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
   *
   * @param invoice
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
   *
   * @param invoice
   * @param attempts
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
   *
   * @param invoice
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
   *
   * @param invoice
   * @param emailType
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
   *
   * @param invoice
   */
  async payInvoiceOutOfBand(invoice: Stripe.Invoice) {
    return this.stripe.invoices.pay(invoice.id, { paid_out_of_band: true });
  }

  /**
   * Update the customer object to add customer's PayPal billing address.
   *
   * @param customer_id
   * @param city
   * @param country
   * @param line1
   * @param line2
   * @param postal_code
   * @param state
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
    return this.stripe.customers.update(customer_id, { address });
  }

  /**
   * Update the customer object to add a PayPal Billing Agreement ID.
   *
   * This is a no-op if the billing agreement is already attached to the customer.
   *
   * @param customer
   * @param agreementId
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
    return this.stripe.customers.update(customer.id, {
      metadata: { [STRIPE_CUSTOMER_METADATA.PAYPAL_AGREEMENT]: agreementId },
    });
  }

  /**
   * Remove the PayPal Billing Agreement ID from a customer.
   *
   * @param customer
   * @param agreementId
   */
  async removeCustomerPaypalAgreement(
    uid: string,
    customerId: string,
    billingAgreementId: string
  ) {
    return [
      this.stripe.customers.update(customerId, {
        metadata: { [STRIPE_CUSTOMER_METADATA.PAYPAL_AGREEMENT]: null },
      }),
      updatePayPalBA(uid, billingAgreementId, 'Cancelled', Date.now()),
    ];
  }

  /**
   * Get the PayPal billing agreement id to use for this customer if available.
   *
   * @param customer
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
   *
   * @param created
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
   *
   * @param invoice
   */
  markUncollectible(invoice: Stripe.Invoice) {
    return this.stripe.invoices.markUncollectible(invoice.id);
  }

  /**
   * Updates subscription to cancelled status
   *
   * @param subscriptionId
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
    return this.stripe.customers.update(customerId, {
      invoice_settings: { default_payment_method: paymentMethodId },
    });
  }

  /**
   * Remove all sources from a customer.
   *
   * For users that are using payment methods, we no longer wish to store
   * sources so we remove them all.
   *
   * Returns the deleted cards.
   *
   * @param customerId
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
          (this.stripe.customers.deleteSource(
            customerId,
            s.id
          ) as unknown) as Promise<Stripe.Card>
      )
    );
  }

  /** END: NEW FLOW HELPERS FOR PAYMENT METHODS **/

  /**
   * Fetch a customer record from Stripe by id and return its userid metadata
   * and the email.
   */
  async getCustomerUidEmailFromSubscription(sub: Stripe.Subscription) {
    if (typeof sub.customer !== 'string')
      throw error.internalValidationError(
        'getCustomerUidEmailFromSubscription',
        { sub_id: sub.id }
      );
    const customer = await this.stripe.customers.retrieve(sub.customer);
    if (customer.deleted) {
      // Deleted customers lost their metadata so we can't send events for them
      return { uid: null, email: null };
    }
    const uid = customer.metadata.userid;
    const email = customer.email;
    if (!uid || !email) {
      const message = !uid
        ? 'FxA UID does not exist on customer metadata.'
        : 'Stripe customer is missing email';
      Sentry.withScope((scope) => {
        scope.setContext('stripeEvent', {
          customer: { id: customer.id },
        });
        Sentry.captureMessage(message, Sentry.Severity.Error);
      });
      throw error.internalValidationError(
        'getCustomerUidEmailFromSubscription',
        customer,
        new Error(message)
      );
    }
    return {
      uid,
      email,
    };
  }

  /**
   * Update a customer's default payment method
   */
  async updateCustomerPaymentMethod(
    customerId: string,
    paymentToken: string
  ): Promise<Stripe.Customer> {
    try {
      return await this.stripe.customers.update(customerId, {
        source: paymentToken,
      });
    } catch (err) {
      if (err.type === 'StripeCardError') {
        throw error.rejectedSubscriptionPaymentToken(err.message, err);
      }
      throw err;
    }
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
   *
   * @param customer
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
   * Returns whether or not the customer has any active subscriptions that
   * have an open invoice (payment has not been processed).
   *
   * @param customer
   */
  hasOpenInvoice(customer: Stripe.Customer) {
    const subscription = customer.subscriptions?.data.find(
      (sub) =>
        ACTIVE_SUBSCRIPTION_STATUSES.includes(sub.status) &&
        (sub.latest_invoice as Stripe.Invoice).status === 'open'
    );
    return !!subscription;
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
      const additionalSubscriptions = await this.fetchAllSubscriptionsForCustomer(
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
   * Find and return a subscription for a customer of the given plan id.
   *
   * @param customer
   * @param planId
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
   * Fetches all plans from stripe and returns them.
   *
   * Use `allPlans` below to use the cached-enhanced version.
   */
  async fetchAllPlans(): Promise<AbbrevPlan[]> {
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

      plans.push({
        amount: item.amount,
        currency: item.currency,
        interval_count: item.interval_count,
        interval: item.interval,
        plan_id: item.id,
        plan_metadata: item.metadata,
        plan_name: item.nickname || '',
        product_id: item.product.id,
        product_metadata: item.product.metadata,
        product_name: item.product.name,
      });
    }
    return plans;
  }

  /**
   * Fetches all plans from stripe and returns them.
   *
   * Uses Redis caching if configured.
   */
  @Cacheable({
    cacheKey: 'listPlans',
    ttlSeconds: (args, context) => context.plansAndProductsCacheTtlSeconds,
  })
  async allPlans(): Promise<AbbrevPlan[]> {
    return this.fetchAllPlans();
  }

  /**
   * Find a plan by id or error if its not a valid planId.
   */
  async findPlanById(planId: string): Promise<AbbrevPlan> {
    const plans = await this.allPlans();
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
    const allPlans = await this.allPlans();
    const currentPlan = allPlans
      .filter((plan) => plan.plan_id === currentPlanId)
      .shift();

    const newPlan = allPlans
      .filter((plan) => plan.plan_id === newPlanId)
      .shift();
    if (!newPlan || !currentPlan) {
      throw error.unknownSubscriptionPlan();
    }

    if (currentPlanId === newPlanId) {
      throw error.subscriptionAlreadyChanged();
    }

    if (
      !validateProductUpdate(
        currentPlan.product_metadata,
        newPlan.product_metadata
      )
    ) {
      throw error.invalidPlanUpdate();
    }
  }

  /**
   * Change a subscription to the new plan.
   *
   * Note that this call does not verify its a valid upgrade, the
   * `verifyPlanUpgradeForSubscription` should be done first to
   * validate this is an appropraite change for tier use.
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

    return await this.stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: false,
      items: [
        {
          id: subscription.items.data[0].id,
          plan: newPlanId,
        },
      ],
      metadata: updatedMetadata,
    });
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

    await this.stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true,
      metadata: {
        ...(subscription.metadata || {}),
        cancelled_for_customer_at: moment().unix(),
      },
    });
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

    return this.stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: false,
      metadata: {
        ...(subscription.metadata || {}),
        cancelled_for_customer_at: '',
      },
    });
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

  /**
   * Formats Stripe subscriptions for a customer into an appropriate response.
   */
  async subscriptionsToResponse(
    subscriptions: Stripe.ApiList<Stripe.Subscription>
  ) {
    const subs = [];
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

      const product = await this.expandResource(
        // @ts-ignore
        sub.plan.product,
        PRODUCT_RESOURCE
      );

      // @ts-ignore
      const product_id = product.id;
      // @ts-ignore
      const product_name = product.name;

      // FIXME: Note that the plan is only set if the subscription contains a single
      // plan. Multiple product support will require changes here to fetch all
      // plans for this subscription.
      subs.push({
        created: sub.created,
        current_period_end: sub.current_period_end,
        current_period_start: sub.current_period_start,
        cancel_at_period_end: sub.cancel_at_period_end,
        end_at: sub.ended_at,
        // @ts-ignore
        latest_invoice: latestInvoice.number,
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
      if (!sub.plan) {
        throw error.internalValidationError(
          'formatSubscriptionsForSupport',
          sub,
          new Error(`Unexpected multiple plans for subscription: ${sub.id}`)
        );
      }
      const product = await this.expandResource(
        sub.plan.product,
        PRODUCT_RESOURCE
      );

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
   * Extract invoice details for billing emails
   */
  async extractInvoiceDetailsForEmail(latestInvoice: Stripe.Invoice | string) {
    const invoice = await this.expandResource(latestInvoice, INVOICES_RESOURCE);
    const customer = await this.expandResource(
      invoice.customer,
      CUSTOMER_RESOURCE
    );
    if (customer.deleted === true) {
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

  async extractCardDetails({ charge }: { charge: Stripe.Charge | null }) {
    let lastFour: string | null = null;
    let cardType: string | null = null;
    if (charge?.payment_method_details?.card) {
      ({
        brand: cardType,
        last4: lastFour,
      } = charge.payment_method_details.card);
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

    let subscriptions = [];

    for (const subscription of customer.subscriptions.data) {
      if (ACTIVE_SUBSCRIPTION_STATUSES.includes(subscription.status)) {
        if (!subscription.plan) {
          throw error.internalValidationError(
            'extractSourceDetailsForEmail',
            customer,
            new Error(
              `Multiple plans for a subscription not supported: ${subscription.id}`
            )
          );
        }

        const plan = await this.expandResource(
          subscription.plan,
          PLAN_RESOURCE
        );
        const abbrevProduct = await this.expandAbbrevProductForPlan(plan);

        const {
          product_id: productId,
          product_name: productName,
        } = abbrevProduct;
        const { id: planId, nickname: planName } = plan;
        const productMetadata = this.mergeMetadata(plan, abbrevProduct);
        const {
          emailIconURL: planEmailIconURL = '',
          downloadURL: planDownloadURL = '',
        } = productMetadata;

        subscriptions.push({
          productId,
          productName,
          planId,
          planName,
          planEmailIconURL,
          planDownloadURL,
          productMetadata,
        });
      }
    }

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

    if (!subscription.plan) {
      throw error.internalValidationError(
        'extractSubscriptionUpdateEventDetailsForEmail',
        event,
        new Error(
          `Multiple plans for a subscription not supported: ${subscription.id}`
        )
      );
    }

    const previousAttributes = eventData.previous_attributes;
    const planNew = subscription.plan;
    const planIdNew = subscription.plan.id;
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
    const {
      product_id: productIdNew,
      product_name: productNameNew,
    } = abbrevProductNew;
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

    const {
      lastFour,
      cardType,
    } = await this.extractCustomerDefaultPaymentDetails({
      uid,
      email,
    });

    const upcomingInvoice = await this.stripe.invoices.retrieveUpcoming({
      subscription: subscription.id,
    });
    const {
      total: invoiceTotalInCents,
      currency: invoiceTotalCurrency,
      next_payment_attempt: nextInvoiceDate,
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
      // TODO: According to Stripe, this value will be null for invoices where collection_method=send_invoice
      // Our subscriptions use collection_method=charge_automatically - so this shouldn't happen?
      // Do trial subscriptions run into this?
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
        source = customer.sources.data.find(
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
    const {
      product_id: productIdOld,
      product_name: productNameOld,
    } = abbrevProductOld;
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

    // @ts-ignore
    return this.stripe[resourceType].retrieve(resource);
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

    // If we already have an expanded Product, just extract from that.
    if (typeof plan.product === 'object') {
      return checkDeletedProduct(plan.product);
    }

    // Next, look for product details in cache
    const products = await this.allProducts();
    const productCached = products.find((p) => p.product_id === plan.product);
    if (productCached) {
      return productCached;
    }

    // Finally, do a direct Stripe fetch if none of the above works.
    return checkDeletedProduct(
      await this.stripe.products.retrieve(plan.product)
    );
  }

  /**
   * Metadata consists of product metadata with per-plan overrides.
   *
   * @param {Plan} plan
   * @param {AbbrevProduct} abbrevProduct
   */
  mergeMetadata(plan: Stripe.Plan, abbrevProduct: AbbrevProduct) {
    return {
      ...abbrevProduct.product_metadata,
      ...plan.metadata,
    };
  }
}

/**
 * Create a Stripe Helper with built-in caching.
 */
export function createStripeHelper(log: any, config: any, statsd?: StatsD) {
  return new StripeHelper(log, config, statsd);
}
