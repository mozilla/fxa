/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Firestore } from '@google-cloud/firestore';
import * as Sentry from '@sentry/node';
import { SeverityLevel } from '@sentry/core';
import {
  Cacheable,
  CacheClearStrategy,
  CacheClearStrategyContext,
  CacheUpdate,
} from '@type-cacheable/core';
import {
  createAccountCustomer,
  deleteAccountCustomer,
  getAccountCustomerByUid,
  getUidAndEmailByStripeCustomerId,
  updatePayPalBA,
} from 'fxa-shared/db/models/auth';
import * as Coupon from 'fxa-shared/dto/auth/payments/coupon';
import {
  getIapPurchaseType,
  isAppStoreSubscriptionPurchase,
  isPlayStoreSubscriptionPurchase,
} from 'fxa-shared/payments/iap/util';
import {
  CHARGES_RESOURCE,
  CUSTOMER_RESOURCE,
  INVOICES_RESOURCE,
  PAYMENT_METHOD_RESOURCE,
  PLAN_RESOURCE,
  PRODUCT_RESOURCE,
  STRIPE_PLANS_CACHE_KEY,
  STRIPE_PRICE_METADATA,
  STRIPE_PRODUCTS_CACHE_KEY,
  StripeHelper as StripeHelperBase,
  SUBSCRIPTIONS_RESOURCE,
} from 'fxa-shared/payments/stripe';
import { PlanConfig } from 'fxa-shared/subscriptions/configuration/plan';
import {
  ACTIVE_SUBSCRIPTION_STATUSES,
  getMinimumAmount,
  singlePlan,
} from 'fxa-shared/subscriptions/stripe';
import {
  AbbrevPlan,
  AbbrevProduct,
  MozillaSubscriptionTypes,
  PAYPAL_PAYMENT_ERROR_FUNDING_SOURCE,
  PAYPAL_PAYMENT_ERROR_MISSING_AGREEMENT,
  PaypalPaymentError,
  WebSubscription,
  InvoicePreview,
} from 'fxa-shared/subscriptions/types';
import { StatsD } from 'hot-shots';
import ioredis from 'ioredis';
import moment from 'moment';
import { Logger } from 'mozlog';
import { Stripe } from 'stripe';
import { Container } from 'typedi';

import { ConfigType } from '../../config';
import error from '../error';
import { GoogleMapsService } from '../google-maps-services';
import Redis from '../redis';
import { subscriptionProductMetadataValidator } from '../routes/validators';
import {
  formatMetadataValidationErrorMessage,
  reportValidationError,
} from 'fxa-shared/sentry/report-validation-error';
import { AppConfig, AuthFirestore, AuthLogger, TaxAddress } from '../types';
import { PaymentConfigManager } from './configuration/manager';
import { CurrencyHelper } from './currencies';
import { AppStoreSubscriptionPurchase } from './iap/apple-app-store/subscription-purchase';
import { PlayStoreSubscriptionPurchase } from './iap/google-play/subscription-purchase';
import {
  StripeFirestoreMultiError,
  FirestoreStripeError,
  StripeFirestore,
} from './stripe-firestore';
import { stripeInvoiceToLatestInvoiceItemsDTO } from './stripe-formatter';
import { generateIdempotencyKey, roundTime } from './utils';
import { ProductConfigurationManager } from '@fxa/shared/cms';
import { reportSentryError, reportSentryMessage } from '../sentry';
import { StripeMapperService } from '@fxa/payments/legacy';

// Maintains backwards compatibility. Some type defs hoisted to fxa-shared/payments/stripe
export * from 'fxa-shared/payments/stripe';

export const MOZILLA_TAX_ID = 'Tax ID';
export const STRIPE_TAX_RATES_CACHE_KEY = 'listStripeTaxRates';
export const SUBSCRIPTION_PROMOTION_CODE_METADATA_KEY = 'appliedPromotionCode';
export enum STRIPE_CUSTOMER_METADATA {
  PAYPAL_AGREEMENT = 'paypalAgreementId',
}
export enum STRIPE_PRODUCT_METADATA {
  PROMOTION_CODES = 'promotionCodes',
}

export enum STRIPE_INVOICE_METADATA {
  PAYPAL_TRANSACTION_ID = 'paypalTransactionId',
  PAYPAL_REFUND_TRANSACTION_ID = 'paypalRefundTransactionId',
  PAYPAL_REFUND_REASON = 'paypalRefundRefused',
  EMAIL_SENT = 'emailSent',
  RETRY_ATTEMPTS = 'paymentAttempts',
}

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
  planSuccessActionButtonURL: string;
  planConfig: Partial<PlanConfig>;
  productMetadata: Stripe.Metadata;
};

export type BillingAddressOptions = {
  city: string;
  country: string;
  line1: string;
  line2: string;
  postalCode: string;
  state: string;
};

export type PaymentBillingDetails = Awaited<
  ReturnType<StripeHelper['extractBillingDetails']> // eslint-disable-line no-use-before-define
> & {
  paypal_payment_error?: PaypalPaymentError;
  billing_agreement_id?: string;
};

// The countries we need region data for
export const COUNTRIES_LONG_NAME_TO_SHORT_NAME_MAP = {
  // The long name is used in the BigQuery metrics logs; the short name is used
  // in the Stripe customer billing address.  The long names are also used to
  // index into the country to states maps.
  'United States': 'US',
  Canada: 'CA',
} as { [key: string]: string };

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

export class StripeHelper extends StripeHelperBase {
  // Base class requirements
  public override readonly stripe: Stripe;
  protected override readonly stripeFirestore: StripeFirestore;
  protected override readonly paymentConfigManager?: PaymentConfigManager;
  protected override readonly redis?: ioredis.Redis;
  protected override readonly productConfigurationManager?:
    | ProductConfigurationManager
    | undefined;
  protected override readonly stripeMapperService?: StripeMapperService;

  // Note that this isn't quite accurate, as the auth-server logger has some extras
  // attached to it in Hapi.
  private plansAndProductsCacheTtlSeconds: number;
  private stripeTaxRatesCacheTtlSeconds: number;
  private webhookSecret: string;
  private taxIds: { [key: string]: string };
  private firestore: Firestore;
  readonly googleMapsService: GoogleMapsService;
  public currencyHelper: CurrencyHelper;

  /**
   * Create a Stripe Helper with built-in caching.
   */
  constructor(log: Logger, config: ConfigType, statsd: StatsD) {
    super(config, statsd, log);

    // TODO (FXA-949 / issue #3922): The TTL setting here is serving double-duty for
    // both TTL and whether caching should be enabled at all. We should
    // introduce a second setting for cache enable / disable.
    this.redis = config.subhub.plansCacheTtlSeconds
      ? Redis(
          {
            ...config.redis,
            ...config.redis.subhub,
          },
          log
        )?.redis
      : undefined;

    this.stripe = new Stripe(config.subscriptions.stripeApiKey, {
      apiVersion: '2024-11-20.acacia',
      maxNetworkRetries: 3,
    });

    // Set the app config and logger for any downstream dependencies that
    // expect them to exist.
    if (!Container.has(AppConfig)) {
      Container.set(AppConfig, config);
    }
    if (!Container.has(AuthLogger)) {
      Container.set(AuthLogger, log);
    }

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

    if (config.subscriptions.productConfigsFirestore.enabled === true) {
      this.paymentConfigManager = Container.get(PaymentConfigManager);
    }
    this.googleMapsService = Container.get(GoogleMapsService);
    this.plansAndProductsCacheTtlSeconds = config.subhub.plansCacheTtlSeconds;
    this.stripeTaxRatesCacheTtlSeconds =
      config.subhub.stripeTaxRatesCacheTtlSeconds;
    this.webhookSecret = config.subscriptions.stripeWebhookSecret;
    this.taxIds = config.subscriptions.taxIds;
    this.currencyHelper = Container.get(CurrencyHelper);
    if (Container.has(ProductConfigurationManager)) {
      this.productConfigurationManager = Container.get(
        ProductConfigurationManager
      );

      this.stripeMapperService = new StripeMapperService(
        this.productConfigurationManager,
        { ttl: this.config.cms.legacyMapper.mapperCacheTTL }
      );
    }

    // Initializes caching
    this.initRedis();

    // Listens to stripe events
    this.initStripe();
  }

  async checkStripeAPIKey() {
    try {
      await this.stripe.customers.list({ limit: 1 });
    } catch (error) {
      if (error.type === 'StripeAuthenticationError') {
        this.log.error('checkStripeAPIKey', {
          error,
          rawMesage: error.raw.message,
        });
        if (['dev', 'development'].includes(this.config.env)) {
          console.error(`
!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
!!!-----------------------------------!!!
!!!-----------------------------------!!!
!!!--- Stripe Authentication Error ---!!!
!!!---- Check your Stripe API Key ----!!!
!!!-----------------------------------!!!
!!!-----------------------------------!!!
!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
`);
        }
      }
    }
  }

  /**
   * Validates state of stripe plan
   * @param plan
   * @returns true if plan is valid
   */
  protected override async validatePlan(plan: Stripe.Plan): Promise<boolean> {
    const { error } = await subscriptionProductMetadataValidator.validateAsync({
      ...plan.metadata,
      ...(plan.product as Stripe.Product)?.metadata,
    });

    if (error) {
      const msg = formatMetadataValidationErrorMessage(plan.id, error as any);
      this.log.error(`fetchAllPlans: ${msg}`, { error, plan: plan });
      reportValidationError(msg, error as any);
      return false;
    }

    return true;
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
    const taxRates = new Array<Stripe.TaxRate>();
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
    cacheKey: STRIPE_TAX_RATES_CACHE_KEY,
    ttlSeconds: (args, context) => context.stripeTaxRatesCacheTtlSeconds,
  })
  async allTaxRates() {
    return this.fetchAllTaxRates();
  }

  @CacheUpdate({
    cacheKey: STRIPE_TAX_RATES_CACHE_KEY,
    ttlSeconds: (args, context) => context.stripeTaxRatesCacheTtlSeconds,
    cacheKeysToClear: 'noop',
    clearStrategy: noopCacheClearStrategy,
  })
  async updateAllTaxRates(allTaxRates: Stripe.TaxRate[]) {
    return allTaxRates;
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
  async createPlainCustomer(args: {
    uid: string;
    email: string;
    displayName: string;
    idempotencyKey: string;
    taxAddress?: TaxAddress;
  }): Promise<Stripe.Customer> {
    const { uid, email, displayName, idempotencyKey, taxAddress } = args;

    const shipping = taxAddress
      ? {
          name: email,
          address: {
            country: taxAddress.countryCode,
            postal_code: taxAddress.postalCode,
          },
        }
      : undefined;

    const stripeCustomer = await this.stripe.customers.create(
      {
        email,
        name: displayName,
        description: uid,
        metadata: {
          userid: uid,
          geoip_date: new Date().toString(),
        },
        shipping,
      },
      {
        idempotencyKey,
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
    return createAccountCustomer(uid, stripeCustomer.id);
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
      const paymentMethod = await this.stripe.paymentMethods.attach(
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
      await this.stripeFirestore.insertPaymentMethodRecord(paymentMethod);
      // Try paying now instead of waiting for Stripe since this could block a
      // customer from finishing a payment
      const invoice = await this.stripe.invoices.pay(invoiceId, {
        expand: ['payment_intent'],
      });
      await this.stripeFirestore.insertInvoiceRecord(invoice);
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
    promotionCode?: Stripe.PromotionCode;
    automaticTax: boolean;
  }) {
    const {
      customerId,
      priceId,
      paymentMethodId,
      promotionCode,
      automaticTax,
    } = opts;

    let paymentMethod;
    if (paymentMethodId) {
      try {
        paymentMethod = await this.stripe.paymentMethods.attach(
          paymentMethodId,
          {
            customer: customerId,
          }
          // At the moment the frontend creates a new paymentMethod before every call to this method.
          // If we were to reuse the same idempotencyKey we'd get the idempotency_error from Stripe.
          // https://stripe.com/docs/api/errors
          // As a potential alternative approach, we could compare paymentMethod fingerprints before
          // attaching it to paymentMethods.
          // { idempotencyKey: `pma-${subIdempotencyKey}` }
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
      await this.stripeFirestore.insertPaymentMethodRecord(paymentMethod);
    }

    this.statsd.increment('stripe_subscription', {
      payment_provider: 'stripe',
    });

    const subIdempotencyKey = generateIdempotencyKey([
      customerId,
      priceId,
      paymentMethod?.card?.fingerprint || '',
      roundTime(),
    ]);

    const createParams: Stripe.SubscriptionCreateParams = {
      customer: customerId,
      items: [{ price: priceId }],
      expand: ['latest_invoice.payment_intent.latest_charge'],
      promotion_code: promotionCode?.id,
      automatic_tax: {
        enabled: automaticTax,
      },
    };

    const subscription = await this.stripe.subscriptions.create(createParams, {
      idempotencyKey: `ssc-${subIdempotencyKey}`,
    });

    const paymentIntent = (subscription.latest_invoice as Stripe.Invoice)
      .payment_intent as Stripe.PaymentIntent;

    if (paymentIntent?.last_payment_error) {
      await this.cancelSubscription(subscription.id);

      throw error.rejectedSubscriptionPaymentToken(
        paymentIntent.last_payment_error.code,
        new Error(
          `Subscription creation failed with error code ${paymentIntent.last_payment_error.code}`
        )
      );
    }

    const updatedSubscription = await this.postSubscriptionCreationUpdates({
      subscription,
      promotionCode,
    });

    return updatedSubscription;
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
    promotionCode?: Stripe.PromotionCode;
    subIdempotencyKey: string;
    automaticTax: boolean;
  }) {
    const {
      customer,
      priceId,
      promotionCode,
      subIdempotencyKey,
      automaticTax,
    } = opts;

    const sub = this.findCustomerSubscriptionByPlanId(customer, priceId);
    if (sub && ACTIVE_SUBSCRIPTION_STATUSES.includes(sub.status)) {
      if (sub.collection_method === 'send_invoice') {
        sub.latest_invoice = await this.expandResource(
          sub.latest_invoice,
          INVOICES_RESOURCE
        );
        return sub;
      }
      throw error.subscriptionAlreadyExists();
    } else if (sub && sub.status === 'incomplete') {
      // Sub has never been active or charged, delete it.
      this.stripe.subscriptions.cancel(sub.id);
    }

    this.statsd.increment('stripe_subscription', {
      payment_provider: 'paypal',
    });

    const createParams: Stripe.SubscriptionCreateParams = {
      customer: customer.id,
      items: [{ price: priceId }],
      expand: ['latest_invoice'],
      collection_method: 'send_invoice',
      days_until_due: 1,
      promotion_code: promotionCode?.id,
      automatic_tax: {
        enabled: automaticTax,
      },
    };

    const subscription = await this.stripe.subscriptions.create(createParams, {
      idempotencyKey: `ssc-${subIdempotencyKey}`,
    });

    const updatedSubscription = await this.postSubscriptionCreationUpdates({
      subscription,
      promotionCode,
    });

    return updatedSubscription;
  }

  private async postSubscriptionCreationUpdates({
    subscription,
    promotionCode,
  }: {
    subscription: Stripe.Response<Stripe.Subscription>;
    promotionCode?: Stripe.PromotionCode;
  }) {
    // Save the promotion code into the subscription's metadata now that the
    // subscription has been successfully created.
    if (
      promotionCode &&
      (subscription.latest_invoice as Stripe.Invoice).discount
    ) {
      const subscriptionMetadata = {
        ...subscription.metadata,
        [SUBSCRIPTION_PROMOTION_CODE_METADATA_KEY]: promotionCode.code,
      };
      subscription.metadata = subscriptionMetadata;
      await this.stripe.subscriptions.update(subscription.id, {
        metadata: subscriptionMetadata,
      });
    }

    await this.stripeFirestore.insertSubscriptionRecordWithBackfill({
      ...subscription,
      latest_invoice: subscription.latest_invoice
        ? (subscription.latest_invoice as Stripe.Invoice).id
        : null,
    });

    return subscription;
  }

  /**
   * Previews an invoice for a customer in the provided country with a
   * subscription of the given priceId and a possible discount applied.
   *
   * The discount parameter is optional and can be either a coupon id or
   * a promotion code.
   */
  async previewInvoice({
    customer,
    priceId,
    promotionCode,
    taxAddress,
    isUpgrade,
    sourcePlan,
  }: {
    customer?: Stripe.Customer;
    priceId: string;
    promotionCode?: string;
    taxAddress?: TaxAddress;
    isUpgrade?: boolean;
    sourcePlan?: AbbrevPlan;
  }): Promise<InvoicePreview> {
    const params: Stripe.InvoiceRetrieveUpcomingParams = {};

    const { currency: planCurrency } = await this.findAbbrevPlanById(priceId);

    if (promotionCode) {
      const stripePromotionCode = await this.findValidPromoCode(
        promotionCode,
        priceId
      );
      if (stripePromotionCode) {
        params['coupon'] = stripePromotionCode.coupon.id;
      }
    }

    const automaticTax = !!(
      (customer &&
        this.isCustomerTaxableWithSubscriptionCurrency(
          customer,
          planCurrency
        )) ||
      (!customer &&
        taxAddress &&
        this.currencyHelper.isCurrencyCompatibleWithCountry(
          planCurrency,
          taxAddress.countryCode
        ))
    );

    const shipping =
      !customer && taxAddress
        ? {
            name: '',
            address: {
              country: taxAddress.countryCode,
              postal_code: taxAddress.postalCode,
            },
          }
        : undefined;

    const requestObject: Stripe.InvoiceRetrieveUpcomingParams = {
      customer: customer?.id,
      automatic_tax: {
        enabled: automaticTax,
      },
      customer_details: {
        tax_exempt: 'none', // Param required when shipping address not present
        shipping,
      },
      subscription_items: [{ price: priceId }],
      expand: ['total_tax_amounts.tax_rate'],
      ...params,
    };

    try {
      const firstInvoice =
        await this.stripe.invoices.retrieveUpcoming(requestObject);

      let proratedInvoice;
      if (isUpgrade && requestObject.subscription_items?.length) {
        try {
          requestObject.subscription_proration_behavior = 'always_invoice';
          requestObject.subscription_proration_date = Math.floor(
            Date.now() / 1000
          );
          const subscriptionItem = customer?.subscriptions?.data
            .flatMap((sub) => sub.items.data)
            ?.find((sub) => sub.plan.id === sourcePlan?.plan_id);

          requestObject.subscription_items[0].id = subscriptionItem?.id;
          requestObject.subscription = subscriptionItem?.subscription;

          proratedInvoice =
            await this.stripe.invoices.retrieveUpcoming(requestObject);
        } catch (error: any) {
          Sentry.withScope((scope) => {
            scope.setContext('previewInvoice.proratedInvoice', {
              error: error,
              msg: error.message,
            });
            reportSentryMessage(
              `Invoice Preview Error: Prorated Invoice Preview`,
              'error' as SeverityLevel
            );
          });
          this.log.error('subscriptions.previewInvoice.proratedInvoice', error);
        }
      }

      return [firstInvoice, proratedInvoice];
    } catch (e: any) {
      this.log.warn('stripe.previewInvoice.automatic_tax', {
        postalCode: taxAddress?.postalCode,
        countryCode: taxAddress?.countryCode,
        priceId,
        promotionCode,
      });

      throw e;
    }
  }

  /**
   * Previews the subsequent invoice for a specific subscription
   */
  async previewInvoiceBySubscriptionId({
    subscriptionId,
    includeCanceled,
  }: {
    subscriptionId: string;
    includeCanceled?: boolean;
  }) {
    return this.stripe.invoices.retrieveUpcoming({
      subscription: subscriptionId,
      ...(includeCanceled && { subscription_cancel_at_period_end: false }),
    });
  }

  /** Fetch a coupon with `applies_to` expanded. */
  async getCoupon(couponId: string) {
    return this.stripe.coupons.retrieve(couponId, {
      expand: ['applies_to'],
    });
  }

  /**
   * Determines whether a given promotion code is
   * a valid code in the system for the given price, and if it hasn't
   * expired.
   *
   * Note that this does not check whether the coupon has been redeemed to
   * many times, whether its valid for a first time customer, or any of the
   * other conditions that may apply to its use.
   */
  async findValidPromoCode(
    code: string,
    priceId: string
  ): Promise<Stripe.PromotionCode | undefined> {
    const nowSecs = Date.now() / 1000;

    // Determine if code exists, is active, and has not expired.
    const promotionCode = await this.findPromoCodeByCode(code, true);
    if (
      !promotionCode ||
      (promotionCode.expires_at && promotionCode.expires_at < nowSecs)
    ) {
      return;
    }

    // Is the coupon valid given redemptions/expiration and product restrictions?
    if (!promotionCode.coupon.valid) {
      return;
    }

    // Is the coupon valid for this price?
    const planContainsPromo = await this.checkPromotionCodeForPlan(
      code,
      priceId
    );
    if (!planContainsPromo) {
      return;
    }

    return promotionCode;
  }

  /**
   * Check various properties in Promotion Code or Coupon and if they are valid.
   * If the properties are invalid, then return what's making it invalid.
   * Current invalid states include:
   * - Expired
   * - Maximally redeemed
   */
  checkPromotionAndCouponProperties({
    valid,
    redeem_by: redeemBy,
    max_redemptions: maxRedemptions,
    times_redeemed: timesRedeemed,
  }: {
    valid: boolean;
    redeem_by: number | null;
    max_redemptions: number | null;
    times_redeemed: number;
  }) {
    let expired = false;
    let maximallyRedeemed = false;

    if (!valid) {
      if (redeemBy) {
        const expiry = new Date(redeemBy * 1000);
        const now = new Date();
        expired = now > expiry;
      } else {
        expired = false;
      }

      if (maxRedemptions) {
        maximallyRedeemed = timesRedeemed >= maxRedemptions;
      } else {
        maximallyRedeemed = false;
      }
    }

    return {
      valid,
      expired,
      maximallyRedeemed,
    };
  }

  /**
   * Verify that the Promotion Code and Coupon are valid.
   * If either are not valid, then return what's making it invalid.
   * Current invalid states include:
   * - Expired
   * - Maximally redeemed
   */
  async verifyPromotionAndCoupon(
    priceId: string,
    promotionCode: Stripe.PromotionCode
  ) {
    const { coupon } = promotionCode;

    const verifyCoupon = this.checkPromotionAndCouponProperties(coupon);
    const verifyPromotionCode = this.checkPromotionAndCouponProperties({
      ...promotionCode,
      valid: promotionCode.active,
      redeem_by: promotionCode.expires_at,
    });

    const validCouponDuration = await this.validateCouponDurationForPlan(
      priceId,
      promotionCode.code,
      coupon
    );

    return {
      valid:
        verifyCoupon.valid && verifyPromotionCode.valid && validCouponDuration,
      expired: verifyCoupon.expired || verifyPromotionCode.expired,
      maximallyRedeemed:
        verifyCoupon.maximallyRedeemed || verifyPromotionCode.maximallyRedeemed,
    };
  }

  /**
   * Validate that the Coupon Duration is valid for a plan interval.
   * Currently checking if the coupon duration is applied for the entire
   * plan interval.
   */
  async validateCouponDurationForPlan(
    priceId: string,
    promotionCode: string,
    coupon: Stripe.Coupon
  ) {
    const {
      duration: couponDuration,
      duration_in_months: couponDurationInMonths,
    } = coupon;
    // If the coupon duration is repeating, check if the duration months will be
    // applied for a whole plan interval. Currently we do not want to support
    // coupons being applied for part of the plan interval.
    if (couponDuration === 'repeating') {
      const { interval: priceInterval, interval_count: priceIntervalCount } =
        await this.findAbbrevPlanById(priceId);

      // Currently we only support coupons for year and month plan intervals.
      if (['month', 'year'].includes(priceInterval) && couponDurationInMonths) {
        const multiplier = priceInterval === 'year' ? 12 : 1;
        if (!(couponDurationInMonths % (priceIntervalCount * multiplier))) {
          return true;
        } else {
          Sentry.withScope((scope) => {
            scope.setContext('validateCouponDurationForPlan', {
              promotionCode,
              priceId,
              couponDuration,
              couponDurationInMonths,
              priceInterval,
              priceIntervalCount,
            });
            reportSentryMessage(
              'Coupon duration does not apply for entire plan interval',
              'error' as SeverityLevel
            );
          });
          return false;
        }
      } else {
        return false;
      }
    } else {
      return true;
    }
  }

  /**
   * Retrieve details about a coupon for a given priceId and possible
   * promotion code for a customer in the provided country. Will also
   * provide the discount amount for the subscription via
   * previewInvoice return value. Coupon details are returned
   * regardless of current validity (expiry, redeemability).
   *
   * Throws invalidPromoCode error if the promotion code does not
   * exist for the provided priceId.
   */
  async retrieveCouponDetails({
    priceId,
    promotionCode,
    taxAddress,
  }: {
    priceId: string;
    promotionCode: string;
    taxAddress?: TaxAddress;
  }): Promise<Coupon.couponDetailsSchema> {
    const stripePromotionCode = await this.retrievePromotionCodeForPlan(
      promotionCode,
      priceId
    );

    if (stripePromotionCode?.coupon.id) {
      const stripeCoupon: Stripe.Coupon = stripePromotionCode.coupon;

      const couponDetails: Coupon.couponDetailsSchema = {
        promotionCode: promotionCode,
        type: stripeCoupon.duration,
        durationInMonths: stripeCoupon.duration_in_months,
        valid: false,
        maximallyRedeemed: false,
        expired: false,
      };

      const verifiedPromotionAndCoupon = await this.verifyPromotionAndCoupon(
        priceId,
        stripePromotionCode
      );

      if (verifiedPromotionAndCoupon.valid) {
        try {
          const invoicePreview = (
            await this.previewInvoice({
              priceId,
              promotionCode,
              taxAddress,
            })
          )[0];

          const { currency, discount, total, total_discount_amounts } =
            invoicePreview;

          const minAmount = getMinimumAmount(currency);
          if (total !== 0 && minAmount && total < minAmount) {
            throw error.invalidPromoCode(promotionCode);
          }

          if (discount && total_discount_amounts) {
            couponDetails.discountAmount = total_discount_amounts[0].amount;
          }
        } catch (err) {
          if (
            err instanceof error &&
            err.errno === error.ERRNO.INVALID_PROMOTION_CODE
          ) {
            throw err;
          } else {
            verifiedPromotionAndCoupon.valid = false;
            Sentry.withScope((scope) => {
              scope.setContext('retrieveCouponDetails', {
                priceId,
                promotionCode,
              });
              reportSentryError(err);
            });
          }
        }
      }

      return {
        ...couponDetails,
        ...verifiedPromotionAndCoupon,
      };
    } else {
      throw error.invalidPromoCode(promotionCode);
    }
  }

  /**
   * Retrieves the stripe promotionCode object for a plan regardless of current validity.
   */
  async retrievePromotionCodeForPlan(
    code: string,
    priceId: string
  ): Promise<Stripe.PromotionCode | undefined> {
    const promotionCode = await this.findPromoCodeByCode(code, undefined);
    if (!promotionCode) {
      return;
    }

    const planContainsPromo = await this.checkPromotionCodeForPlan(
      code,
      priceId
    );

    if (!planContainsPromo) {
      return;
    }

    return promotionCode;
  }

  /**
   * Checks plan meta-data to see if promotion code applies.
   */
  async checkPromotionCodeForPlan(
    code: string,
    priceId: string
  ): Promise<boolean> {
    const price = await this.findAbbrevPlanById(priceId);
    const validPromotionCodes: string[] = [];
    if (
      price.plan_metadata &&
      price.plan_metadata[STRIPE_PRICE_METADATA.PROMOTION_CODES]
    ) {
      validPromotionCodes.push(
        ...price.plan_metadata[STRIPE_PRICE_METADATA.PROMOTION_CODES]
          .split(',')
          .map((c) => c.trim())
      );
    }
    if (
      price.product_metadata &&
      price.product_metadata[STRIPE_PRODUCT_METADATA.PROMOTION_CODES]
    ) {
      validPromotionCodes.push(
        ...price.product_metadata[STRIPE_PRODUCT_METADATA.PROMOTION_CODES]
          .split(',')
          .map((c) => c.trim())
      );
    }

    // promotion codes are possibily staying in Stripe metadata instead of
    // moving into Firestore configuration docs, but we can just check all three
    // places...
    // the abbrev plans do not have the promotion codes in them since they
    // are for the front end
    const planConfigs: Partial<PlanConfig> = await this.maybeGetPlanConfig(
      price.plan_id
    );
    validPromotionCodes.push(...(planConfigs.promotionCodes || []));

    return validPromotionCodes.includes(code);
  }

  /**
   * Queries Stripe for promotion codes and returns a matching one if
   * found.
   */
  async findPromoCodeByCode(
    code: string,
    active?: boolean
  ): Promise<Stripe.PromotionCode | undefined> {
    const promoCodes = await this.stripe.promotionCodes.list({
      active,
      code,
    });
    return promoCodes.data.find((c) => c.code === code);
  }

  async invoicePayableWithPaypal(invoice: Stripe.Invoice): Promise<boolean> {
    if (invoice.billing_reason === 'subscription_create') {
      // We only work with non-creation invoices, initial invoices are resolved by
      // checkout code.
      return false;
    }
    const subscription = await this.expandResource(
      invoice.subscription,
      SUBSCRIPTIONS_RESOURCE
    );
    if (subscription?.collection_method !== 'send_invoice') {
      // Not a PayPal funded subscription.
      return false;
    }
    return true;
  }

  /**
   * Get Card for a customer.
   */
  async getCard(customerId: string, cardId: string): Promise<Stripe.Card> {
    return this.stripe.customers.retrieveSource(
      customerId,
      cardId
    ) as Promise<Stripe.Card>;
  }

  /**
   * Get Invoice object based on invoice Id
   */
  async getInvoice(id: string): Promise<Stripe.Invoice> {
    return this.expandResource<Stripe.Invoice>(id, INVOICES_RESOURCE);
  }

  /*
   * Expand the discounts property of an invoice
   * TODO: We may be able to remove this method in the future if we want to add logic
   * to expandResource to check if the discounts property is expanded.
   */
  getInvoiceWithDiscount(invoiceId: string) {
    return this.stripe.invoices.retrieve(invoiceId, { expand: ['discounts'] });
  }

  /**
   * Finalizes an invoice and marks auto_advance as false.
   */
  async finalizeInvoice(invoice: Stripe.Invoice) {
    if (!invoice.id) throw new Error('Invoice ID must be provided');
    return this.stripe.invoices.finalizeInvoice(invoice.id, {
      auto_advance: false,
    });
  }

  /**
   *
   * @param paymentIntentId
   * @param reason
   * @returns
   */
  async refundPayment(
    paymentIntentId: string,
    reason: Stripe.RefundCreateParams.Reason
  ) {
    return await this.stripe.refunds.create({
      payment_intent: paymentIntentId,
      reason,
    });
  }

  /**
   * Attempts to refund all of the invoices passed, provided they're created via Stripe
   * This will invisibly do nothing if the invoice is not billed through Stripe, so be mindful
   * if using it elsewhere and need confirmation of a refund.
   */
  async refundInvoices(invoices: Stripe.Invoice[]) {
    const stripeInvoices = invoices.filter(
      (invoice) => invoice.collection_method === 'charge_automatically'
    );
    for (const invoice of stripeInvoices) {
      const chargeId =
        typeof invoice.charge === 'string'
          ? invoice.charge
          : invoice.charge?.id;
      if (!chargeId) continue;

      const charge = await this.stripe.charges.retrieve(chargeId);
      if (charge.refunded) continue;

      try {
        await this.stripe.refunds.create({
          charge: chargeId,
        });
        this.log.info('refundInvoices', {
          invoiceId: invoice.id,
          priceId: this.getPriceIdFromInvoice(invoice),
          total: invoice.total,
          currency: invoice.currency,
        });
      } catch (error) {
        this.log.error('StripeHelper.refundInvoices', {
          error,
          invoiceId: invoice.id,
        });
        if (
          [
            'StripeRateLimitError',
            'StripeAPIError',
            'StripeConnectionError',
            'StripeAuthenticationError',
          ].includes(error.type)
        ) {
          throw error;
        }
      }
    }

    return;
  }

  /**
   * Updates invoice metadata with the PayPal Transaction ID.
   */
  async updateInvoiceWithPaypalTransactionId(
    invoice: Stripe.Invoice,
    transactionId: string
  ) {
    if (!invoice.id) throw new Error('Invoice ID must be provided');
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
    if (!invoice.id) throw new Error('Invoice ID must be provided');
    return this.stripe.invoices.update(invoice.id, {
      metadata: {
        [STRIPE_INVOICE_METADATA.PAYPAL_REFUND_TRANSACTION_ID]: transactionId,
      },
    });
  }

  /**
   * Updates invoice metadata with the reason the PayPal Refund failed.
   */
  async updateInvoiceWithPaypalRefundReason(
    invoice: Stripe.Invoice,
    reason: string
  ) {
    if (!invoice.id) throw new Error('Invoice ID must be provided');
    return this.stripe.invoices.update(invoice.id, {
      metadata: {
        [STRIPE_INVOICE_METADATA.PAYPAL_REFUND_REASON]: reason,
      },
    });
  }

  /**
   * Returns the Paypal transaction id for the invoice if one exists.
   */
  getInvoicePaypalRefundTransactionId(invoice: Stripe.Invoice) {
    return invoice.metadata?.paypalRefundTransactionId;
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
    if (!invoice.id) throw new Error('Invoice ID must be provided');
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
   * Updates the email types sent for this invoice. These types are concatenated
   * on the value of a single invoice metadata key and are thus limited to 500
   * characters.
   */
  async updateEmailSent(invoice: Stripe.Invoice, emailType: string) {
    const emailTypes = this.getEmailTypes(invoice);
    if (emailTypes.includes(emailType)) {
      return;
    }
    if (!invoice.id) throw new Error('Invoice ID must be provided');
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
    if (!invoice.id) throw new Error('Invoice ID must be provided');
    try {
      return await this.stripe.invoices.pay(invoice.id, {
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

  /**
   * Update the customer object to add customer's address.
   */
  async updateCustomerBillingAddress({
    customerId,
    options,
    name,
  }: {
    customerId: string;
    options?: BillingAddressOptions;
    name?: string;
  }): Promise<Stripe.Customer> {
    const updates: Stripe.CustomerUpdateParams = { expand: ['tax'] };
    if (options) {
      updates.address = {
        city: options.city,
        country: options.country,
        line1: options.line1,
        line2: options.line2,
        postal_code: options.postalCode,
        state: options.state,
      };
    }
    if (name) {
      updates.name = name;
    }
    const customer = await this.stripe.customers.update(customerId, updates);
    // Pull out tax as we don't want to cache that inconsistently.
    const tax = customer.tax;
    delete customer.tax;
    await this.stripeFirestore.insertCustomerRecordWithBackfill(
      customer.metadata.userid,
      customer
    );
    return { ...customer, tax };
  }

  /**
   * Set the state (code), country (code), and postal code for a customer.
   * Returns a boolean indicating success.  It does not throw any exceptions as
   * this operation should not block any functionality.
   *
   * This will _overwrite_ any existing customer address.
   */
  async setCustomerLocation({
    customerId,
    postalCode,
    country,
  }: {
    customerId: string;
    postalCode: string;
    country: string;
  }): Promise<boolean> {
    try {
      const state = await this.googleMapsService.getStateFromZip(
        postalCode,
        country
      );

      await this.updateCustomerBillingAddress({
        customerId: customerId,
        options: {
          line1: '',
          line2: '',
          city: '',
          state,
          country,
          postalCode,
        },
      });
      return true;
    } catch (err: unknown) {
      Sentry.withScope((scope) => {
        scope.setContext('setCustomerLocation', {
          customer: { id: customerId },
          postalCode,
          country,
        });
        reportSentryError(err);
      });
    }
    return false;
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
  ): AsyncGenerator<Stripe.Invoice> {
    for await (const invoice of this.stripe.invoices.list({
      customer: customerId,
      limit: 100,
      collection_method: 'send_invoice',
      status: 'open',
      created,
      expand: ['data.customer', 'data.subscription'],
    })) {
      const subscription = invoice.subscription as Stripe.Subscription;
      if (
        subscription &&
        ACTIVE_SUBSCRIPTION_STATUSES.includes(subscription.status)
      ) {
        yield invoice;
      }
    }
  }

  /**
   * Updates the invoice to uncollectible
   */
  markUncollectible(invoice: Stripe.Invoice) {
    if (!invoice.id) throw new Error('Invoice ID must be provided');
    return this.stripe.invoices.markUncollectible(invoice.id);
  }

  /**
   * Updates subscription to cancelled status
   */
  async cancelSubscription(
    subscriptionId: string
  ): Promise<Stripe.Subscription> {
    return this.stripe.subscriptions.cancel(subscriptionId);
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
    return this.expandResource<Stripe.PaymentMethod>(
      paymentMethodId,
      PAYMENT_METHOD_RESOURCE
    );
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
  async hasActiveSubscription(uid: string): Promise<boolean> {
    const { stripeCustomerId } = (await getAccountCustomerByUid(uid)) || {};
    if (!stripeCustomerId) {
      return false;
    }
    const customer = await this.expandResource<Stripe.Customer>(
      stripeCustomerId,
      CUSTOMER_RESOURCE
    );
    const subscription = customer.subscriptions?.data.find((sub) =>
      ACTIVE_SUBSCRIPTION_STATUSES.includes(sub.status)
    );
    return !!subscription;
  }

  /**
   * Fetches all latest invoices for all active subscriptions.
   */
  async getLatestInvoicesForActiveSubscriptions(
    customer: Stripe.Customer
  ): Promise<Stripe.Invoice[]> {
    const invoices = customer.subscriptions?.data
      .filter((sub) => ACTIVE_SUBSCRIPTION_STATUSES.includes(sub.status))
      .map((sub) => sub.latest_invoice)
      .filter(
        (invoice): invoice is Stripe.Invoice | 'string' => invoice !== null
      );
    if (!invoices?.length) {
      return [];
    }
    return Promise.all(
      invoices.map((invoice) =>
        this.expandResource<Stripe.Invoice>(invoice, INVOICES_RESOURCE)
      )
    );
  }

  /**
   * Returns whether or not any of the invoices for the customer are open (payment
   * has not been processed) and have any payment attempts.
   */
  async hasOpenInvoiceWithPaymentAttempts(customer: Stripe.Customer) {
    const invoices =
      await this.getLatestInvoicesForActiveSubscriptions(customer);
    if (!invoices?.length) {
      return false;
    }
    return invoices.some(
      (invoice) =>
        invoice.status === 'open' && this.getPaymentAttempts(invoice) > 0
    );
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
      return this.stripeFirestore.insertCustomerRecordWithBackfill(
        customer.metadata.userid,
        updatedCustomer
      );
    }
    return;
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
    const paymentMethod =
      await this.stripe.paymentMethods.detach(paymentMethodId);
    await this.stripeFirestore.removePaymentMethodRecord(paymentMethodId);
    return paymentMethod;
  }

  /**
   * Fetch a customer for the record from Stripe based on user id.
   */
  async fetchCustomer(
    uid: string,
    expand?: (
      | 'subscriptions'
      | 'invoice_settings.default_payment_method'
      | 'tax'
    )[]
  ): Promise<Stripe.Customer | void> {
    try {
      return await super.fetchCustomer(uid, expand);
    } catch (err) {
      throw error.backendServiceFailure('stripe', 'fetchCustomer', {}, err);
    }
  }

  async fetchInvoicesForActiveSubscriptions(
    customerId: string,
    status: Stripe.InvoiceListParams.Status,
    earliestCreatedDate?: Date
  ) {
    const activeSubscriptionIds = (
      await this.stripe.subscriptions.list({
        customer: customerId,
        status: 'active',
      })
    ).data.map((sub) => sub.id);
    if (!activeSubscriptionIds.length) return [];

    const invoices = await this.stripe.invoices.list({
      customer: customerId,
      status,
      created: earliestCreatedDate
        ? { gte: Math.floor(earliestCreatedDate.getTime() / 1000) }
        : undefined,
    });

    return invoices.data.filter((invoice) => {
      // The invoice list we fetched did not expand the subscription so these must be strings
      if (typeof invoice.subscription !== 'string') return false;
      return activeSubscriptionIds.includes(invoice.subscription);
    });
  }

  /**
   * On FxA deletion, if the user is a Stripe Customer:
   * - delete the stripe customer to delete
   * - remove the cache entry
   * - optionally update the subscription metadata to record metadata about the deletion
   *
   * @param updateActiveSubMetadata - Optional metadata to update the active subscriptions with
   *                                  before removing the customer.
   */
  async removeCustomer(
    uid: string,
    updateActiveSubMetadata?: Record<string, string>
  ) {
    const accountCustomer = await getAccountCustomerByUid(uid);
    if (!accountCustomer || !accountCustomer.stripeCustomerId) return;
    const customer = await this.fetchCustomer(accountCustomer.uid, [
      'invoice_settings.default_payment_method',
    ]);
    if (customer) {
      // detach the customer's payment method so we maybe won't get webhooks about it
      if (customer.invoice_settings.default_payment_method)
        await this.stripe.paymentMethods.detach(
          (
            customer.invoice_settings
              .default_payment_method as Stripe.PaymentMethod
          ).id
        );
      // Only update metadata if we were passed an object with keys. Otherwise
      // this would erase existing metadata if it were passed an empty object.
      if (
        updateActiveSubMetadata &&
        Object.keys(updateActiveSubMetadata).length > 0
      ) {
        const activeSubscriptions =
          customer.subscriptions?.data.filter((sub) =>
            ACTIVE_SUBSCRIPTION_STATUSES.includes(sub.status)
          ) || [];
        for (const sub of activeSubscriptions) {
          await this.stripe.subscriptions.update(sub.id, {
            metadata: updateActiveSubMetadata,
          });
        }
      }
      await this.stripe.customers.del(accountCustomer.stripeCustomerId);
    }
    const recordsDeleted = await deleteAccountCustomer(uid);
    if (recordsDeleted === 0) {
      this.log.error(
        `StripeHelper.removeCustomer failed to remove AccountCustomer record for uid ${uid}`,
        {}
      );
    }
  }

  /**
   * Fetch a subscription for a customer from Stripe.
   *
   * Uses Redis caching if configured.
   *
   * Note: This method is used in context to only return this
   * subscription if it belongs to this user.
   */
  async subscriptionForCustomer(
    uid: string,
    email: string,
    subscriptionId: string
  ): Promise<Stripe.Subscription | void> {
    const customer = await this.fetchCustomer(uid, ['subscriptions']);
    if (!customer) {
      return;
    }

    return customer.subscriptions?.data.find(
      (subscription) => subscription.id === subscriptionId
    );
  }

  /**
   * Fetch all price ids that correspond to a list of Play Store or App Store
   * SubscriptionPurchases.
   *
   * Confusingly, the App Store analog to a Stripe planId is the App Store productId.
   */
  async iapPurchasesToPriceIds(
    purchases: (PlayStoreSubscriptionPurchase | AppStoreSubscriptionPurchase)[]
  ) {
    const prices = await this.allAbbrevPlans();
    const purchasedIds = purchases.map((purchase) => {
      if (isAppStoreSubscriptionPurchase(purchase)) {
        return purchase.productId.toLowerCase();
      }

      if (isPlayStoreSubscriptionPurchase(purchase)) {
        return purchase.sku.toLowerCase();
      }

      throw new Error(
        'Purchase is not recognized as either Google or Apple IAP.'
      );
    });
    const iapType = getIapPurchaseType(purchases[0]);
    const purchasedPrices = new Array<string>();
    for (const price of prices) {
      const purchaseIds = this.priceToIapIdentifiers(price, iapType);
      if (purchaseIds.some((id) => purchasedIds.includes(id))) {
        purchasedPrices.push(price.plan_id);
      }
    }
    return purchasedPrices;
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
    limit = 50
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

  @CacheUpdate({
    cacheKey: STRIPE_PLANS_CACHE_KEY,
    ttlSeconds: (args, context) => context.plansAndProductsCacheTtlSeconds,
    cacheKeysToClear: 'noop',
    clearStrategy: noopCacheClearStrategy,
  })
  async updateAllPlans(allPlans: Stripe.Plan[]) {
    return allPlans;
  }

  /**
   * Find a plan by id or error if it's not a valid planId.
   */
  async findAbbrevPlanById(planId: string): Promise<AbbrevPlan> {
    const plans = await this.allAbbrevPlans();
    const selectedPlan = plans.find((p) => p.plan_id === planId);
    if (!selectedPlan) {
      throw error.unknownSubscriptionPlan(planId);
    }
    return selectedPlan;
  }

  /**
   * Check if customer's automatic tax status indicates that they're eligible for automatic tax.
   * Creating a subscription with automatic_tax enabled requires a customer with an address
   * that is in a recognized location with an active tax registration.
   */
  isCustomerStripeTaxEligible(customer: Stripe.Customer) {
    return (
      customer.tax?.automatic_tax === 'supported' ||
      customer.tax?.automatic_tax === 'not_collecting'
    );
  }

  /**
   * Check if we should enable stripe tax for a given customer and subscription currency.
   */
  isCustomerTaxableWithSubscriptionCurrency(
    customer: Stripe.Customer,
    targetCurrency: string
  ) {
    const taxCountry = customer.tax?.location?.country;
    if (!taxCountry) {
      return false;
    }

    const isCurrencyCompatibleWithCountry =
      this.currencyHelper.isCurrencyCompatibleWithCountry(
        targetCurrency,
        taxCountry
      );
    if (!isCurrencyCompatibleWithCountry) {
      return false;
    }

    return this.isCustomerStripeTaxEligible(customer);
  }

  async updateSubscriptionAndBackfill(
    subscription: Stripe.Subscription,
    newProps: Stripe.SubscriptionUpdateParams
  ) {
    const updatedSubscription = await this.stripe.subscriptions.update(
      subscription.id,
      newProps
    );
    await this.stripeFirestore.insertSubscriptionRecordWithBackfill(
      updatedSubscription
    );
    return updatedSubscription;
  }

  /**
   * Change a subscription to the new plan.
   *
   * Note that this call does not verify its a valid upgrade, the
   * `verifyPlanUpgradeForSubscription` should be done first to
   * validate this is an appropriate change for tier use.
   */
  async changeSubscriptionPlan(
    subscription: Stripe.Subscription,
    newPlanId: string
  ): Promise<Stripe.Subscription> {
    const currentPlanId = subscription.items.data[0].plan.id;
    if (currentPlanId === newPlanId) {
      throw error.subscriptionAlreadyChanged();
    }

    const updatedMetadata = {
      ...subscription.metadata,
      previous_plan_id: currentPlanId,
      plan_change_date: moment().unix(),
    };

    const updatedSubscription = await this.updateSubscriptionAndBackfill(
      subscription,
      {
        cancel_at_period_end: false,
        items: [
          {
            id: subscription.items.data[0].id,
            plan: newPlanId,
          },
        ],
        proration_behavior: 'always_invoice',
        metadata: updatedMetadata,
      }
    );
    return updatedSubscription;
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

    await this.updateSubscriptionAndBackfill(subscription, {
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

    const reactivatedSubscription = await this.updateSubscriptionAndBackfill(
      subscription,
      {
        cancel_at_period_end: false,
        metadata: {
          ...(subscription.metadata || {}),
          cancelled_for_customer_at: '',
        },
      }
    );
    return reactivatedSubscription;
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

    const latestCharge = subscription.latest_invoice.payment_intent
      .latest_charge as string | Stripe.Charge | null | undefined;
    if (latestCharge && typeof latestCharge !== 'string') {
      // Get the country from the payment details.
      // However, historically there were (rare) instances where `charges` was
      // not found in the object graph, hence the defensive code.
      // There's only one charge (the latest), per Stripe's docs.
      const paymentMethodDetails: Stripe.Charge.PaymentMethodDetails | null =
        latestCharge.payment_method_details;

      if (paymentMethodDetails?.card?.country) {
        return paymentMethodDetails.card.country;
      }
    } else {
      Sentry.withScope((scope) => {
        scope.setContext('stripeSubscription', {
          subscription: { id: subscription.id },
        });
        reportSentryMessage(
          'Payment charges not found in subscription payment intent on subscription creation.',
          'warning' as SeverityLevel
        );
      });
    }
    return null;
  }

  async getBillingDetailsAndSubscriptions(uid: string) {
    const customer = await this.fetchCustomer(uid, [
      'invoice_settings.default_payment_method',
    ]);

    if (!customer) {
      return null;
    }

    const billingDetails = await this.extractBillingDetails(customer);
    const detailsAndSubs: {
      customerId: string;
      subscriptions: WebSubscription[];
    } & PaymentBillingDetails = {
      customerId: customer.id,
      subscriptions: [],
      ...billingDetails,
    };

    if (detailsAndSubs.payment_provider === 'paypal') {
      detailsAndSubs.billing_agreement_id =
        this.getCustomerPaypalAgreement(customer);
    }

    if (
      detailsAndSubs.payment_provider === 'paypal' &&
      this.hasSubscriptionRequiringPaymentMethod(customer)
    ) {
      if (!this.getCustomerPaypalAgreement(customer)) {
        detailsAndSubs.paypal_payment_error =
          PAYPAL_PAYMENT_ERROR_MISSING_AGREEMENT;
      } else if (await this.hasOpenInvoiceWithPaymentAttempts(customer)) {
        detailsAndSubs.paypal_payment_error =
          PAYPAL_PAYMENT_ERROR_FUNDING_SOURCE;
      }
    }

    if (customer.subscriptions) {
      const activeSubscriptions = customer.subscriptions.data.filter((sub) =>
        ACTIVE_SUBSCRIPTION_STATUSES.includes(sub.status)
      );

      detailsAndSubs.subscriptions = await this.subscriptionsToResponse({
        ...customer.subscriptions,
        data: activeSubscriptions,
      });
    }

    return detailsAndSubs;
  }

  /**
   * Extracts billing details if a customer has a source on file.
   */
  async extractBillingDetails(customer: Stripe.Customer) {
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
    if (customer.default_source) {
      const paymentMethod = await this.expandResource<Stripe.PaymentMethod>(
        // CustomerSource doesn't quite overlap with PaymentMethod, but in our
        // situation, the missing type isn't one we let our customers use.
        customer.default_source as unknown as Stripe.PaymentMethod,
        PAYMENT_METHOD_RESOURCE
      );
      if (!paymentMethod.card)
        throw new Error('Card must be present on payment method');
      const { brand, exp_month, exp_year, funding, last4 } = paymentMethod.card;
      return {
        billing_name: customer.name,
        payment_provider: paymentProvider,
        payment_type: funding,
        last4,
        exp_month,
        exp_year,
        brand,
      };
    }

    return {
      payment_provider: paymentProvider,
    };
  }

  /**
   * Check if a subscription is past due
   */
  checkSubscriptionPastDue(subscription: Stripe.Subscription) {
    return (
      subscription.status === 'past_due' &&
      subscription.collection_method === 'charge_automatically'
    );
  }

  /**
   * Formats Stripe subscriptions for a customer into an appropriate response.
   */
  async subscriptionsToResponse(
    subscriptions: Stripe.ApiList<Stripe.Subscription>
  ): Promise<WebSubscription[]> {
    const subs: WebSubscription[] = [];
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
        latestInvoice = await this.expandResource<Stripe.Invoice>(
          latestInvoice,
          INVOICES_RESOURCE
        );
      }

      if (!latestInvoice) {
        throw new Error('Latest invoice for subscription could not be found');
      }

      if (!latestInvoice.number) {
        throw new Error('Invoice number for subscription is required');
      }

      // If this is a charge-automatically payment that is past_due, attempt
      // to get details of why it failed. The caller should expand the last_invoice
      // calls by passing ['data.subscriptions.data.latest_invoice'] to `fetchCustomer`
      // as the `expand` argument or this will not fetch the failure code/message.
      if (
        this.checkSubscriptionPastDue(sub) &&
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

      const { discount } = sub;

      // This type inconsistency runs quite deep, but plan does exist on the subscription here
      // for all current use-cases.
      const plan = (sub as any).plan as Stripe.Plan;

      const product = products.find((p) => p.product_id === plan.product);
      if (!product)
        throw new Error(
          `Matching product for subscription ${sub.id} not found`
        );

      const { product_id, product_name } = product;

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
        latest_invoice: latestInvoice.number,
        latest_invoice_items:
          stripeInvoiceToLatestInvoiceItemsDTO(latestInvoice),
        plan_id: plan.id,
        product_name,
        product_id,
        status: sub.status,
        subscription_id: sub.id,
        failure_code,
        failure_message,
        promotion_amount_off: discount?.coupon?.amount_off ?? null,
        promotion_code:
          sub.metadata[SUBSCRIPTION_PROMOTION_CODE_METADATA_KEY] ?? null,
        promotion_duration: (discount?.coupon?.duration as string) ?? null,
        promotion_end: discount?.end ?? null,
        promotion_name: discount?.coupon?.name ?? null,
        promotion_percent_off: discount?.coupon?.percent_off ?? null,
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
    const subs = new Array<any>();
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
          new Error(`Product invalid for subscription: ${sub.id}`)
        );
      }
      const product_name = product.name;

      let previous_product: string | null = null;
      let plan_changed: number | null = null;

      if (sub.metadata.previous_plan_id !== undefined) {
        const previousPlan = await this.findAbbrevPlanById(
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
   * Get PriceId of subscription from invoice
   */
  getPriceIdFromInvoice(invoice: Stripe.Invoice) {
    return invoice.lines.data.find(
      (invoiceLine) => invoiceLine.type === 'subscription'
    )?.price?.id;
  }

  /**
   * Extract invoice details for billing emails.
   *
   * Note that this function throws an error in the following cases:
   *   - Stripe customer is deleted.
   *   - No plan in the invoice.
   *   - No product attached to the plan.
   *   - No email on the customer object.
   *   - No subscriptions in the invoice.
   */
  async extractInvoiceDetailsForEmail(invoice: Stripe.Invoice) {
    const customer = await this.expandResource(
      invoice.customer,
      CUSTOMER_RESOURCE
    );
    if (!customer || customer.deleted) {
      throw error.unknownCustomer(invoice.customer);
    }

    // Get the new subscription, ignoring any invoiceitem line items
    // that could contain prorations for old subscriptions
    const subscriptionLineItem = invoice.lines.data.find(
      (line) => line.type === 'subscription'
    );

    // In certain instances the invoice won't have a 'subscription' line item.
    // In those cases, select the 'invoiceitem' without proration_details.credited_items
    const invoiceitemLineItem = !subscriptionLineItem
      ? invoice.lines.data.find(
          (line) =>
            line.type === 'invoiceitem' &&
            !line.proration_details?.credited_items
        )
      : undefined;

    const lineItem = subscriptionLineItem || invoiceitemLineItem;

    if (!lineItem) {
      // No subscription or invoiceitem is present for the invoice. This should never happen
      // since all invoices have a related incoming subscription as one of the line items.
      throw error.internalValidationError(
        'extractInvoiceDetailsForEmail',
        invoice,
        new Error(
          `No subscription or invoiceitem line items found for invoice: ${invoice.id}`
        )
      );
    }

    // Dig up & expand objects in the invoice that usually come as just IDs
    const { plan } = lineItem;
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

    // if the invoice does not have the deprecated discount property but has a discount ID in discounts
    // expand the discount
    let discountType: Stripe.Coupon.Duration | null = null;
    let discountDuration: number | null = null;

    if (invoice.discount) {
      discountType = invoice.discount.coupon.duration;
      discountDuration = invoice.discount.coupon.duration_in_months;
    }

    if (
      invoice.id &&
      !invoice.discount &&
      !!invoice.discounts?.length &&
      invoice.discounts.length === 1
    ) {
      const invoiceWithDiscount = await this.getInvoiceWithDiscount(invoice.id);
      const discount = invoiceWithDiscount.discounts?.pop() as Stripe.Discount;
      discountType = discount.coupon.duration;
      discountDuration = discount.coupon.duration_in_months;
    }

    if (!!invoice.discounts?.length && invoice.discounts.length > 1) {
      throw error.internalValidationError(
        'extractInvoiceDetailsForEmail',
        invoice,
        new Error(`Invoice has multiple discounts.`)
      );
    }

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
      subtotal: invoiceSubtotalInCents,
      hosted_invoice_url: invoiceLink,
      tax: invoiceTaxAmountInCents,
      status: invoiceStatus,
    } = invoice;

    const nextInvoiceDate = lineItem.period.end;

    const invoiceDiscountAmountInCents =
      (invoice.total_discount_amounts &&
        invoice.total_discount_amounts.length &&
        invoice.total_discount_amounts[0].amount) ||
      null;

    // Only show the Subtotal when there is a Discount
    const showSubtotal =
      invoiceDiscountAmountInCents || discountType || discountDuration;

    const { id: planId, nickname: planName } = plan;
    const abbrevPlan = await this.findAbbrevPlanById(planId);
    const productMetadata = this.mergeMetadata(
      {
        ...plan,
        metadata: abbrevPlan.plan_metadata,
      },
      abbrevProduct
    );

    // Use Firestore product configs if that exist
    const planConfig: Partial<PlanConfig> =
      await this.maybeGetPlanConfig(planId);

    const { emailIconURL: planEmailIconURL = '', successActionButtonURL } = {
      emailIconURL: planConfig.urls?.emailIcon || productMetadata.emailIconURL,
      successActionButtonURL:
        planConfig.urls?.successActionButton ||
        productMetadata.successActionButtonURL,
    };

    const planSuccessActionButtonURL = successActionButtonURL || '';

    const { lastFour, cardType } = this.extractCardDetails({
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
      invoiceStatus,
      invoiceTotalInCents,
      invoiceTotalCurrency,
      invoiceSubtotalInCents: showSubtotal ? invoiceSubtotalInCents : null,
      invoiceDiscountAmountInCents,
      invoiceTaxAmountInCents,
      invoiceDate: new Date(invoiceDate * 1000),
      nextInvoiceDate: new Date(nextInvoiceDate * 1000),
      productId,
      productName,
      planId,
      planName,
      planEmailIconURL,
      planSuccessActionButtonURL,
      planConfig,
      productMetadata,
      showPaymentMethod: !!invoiceTotalInCents,
      showTaxAmount: false, // Currently we do not want to show tax amounts in emails
      discountType,
      discountDuration,
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
    const planConfig = await this.maybeGetPlanConfig(plan.id);
    const { product_id: productId, product_name: productName } = abbrevProduct;
    const { id: planId, nickname: planName } = plan;
    const abbrevPlan = await this.findAbbrevPlanById(planId);
    const productMetadata = this.mergeMetadata(
      {
        ...plan,
        metadata: abbrevPlan.plan_metadata,
      },
      abbrevProduct
    );
    const { emailIconURL: planEmailIconURL = '', successActionButtonURL } =
      productMetadata;

    const planSuccessActionButtonURL = successActionButtonURL || '';

    return {
      productId,
      productName,
      planId,
      planName,
      planEmailIconURL,
      planSuccessActionButtonURL,
      planConfig,
      productMetadata,
    };
  }

  async formatSubscriptionsForEmails(
    customer: Readonly<Stripe.Customer>
  ): Promise<FormattedSubscriptionForEmail[]> {
    if (!customer.subscriptions) {
      return [];
    }

    const formattedSubscriptions = new Array<FormattedSubscriptionForEmail>();

    for (const subscription of customer.subscriptions.data) {
      if (ACTIVE_SUBSCRIPTION_STATUSES.includes(subscription.status)) {
        const formattedSubscription =
          await this.formatSubscriptionForEmail(subscription);
        formattedSubscriptions.push(formattedSubscription);
      }
    }

    return formattedSubscriptions;
  }

  extractCardDetails({ charge }: { charge: Stripe.Charge | null }) {
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

  stripePlanToPaymentCycle(plan: Stripe.Plan) {
    if (plan.interval_count === 1) {
      return plan.interval;
    }
    return `${plan.interval_count} ${plan.interval}s`;
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

    // Stripe only sends fields that have changed in their previous_attributes field
    // Additionally, previous_attributes is a generic field that has no proper typings
    // and is used in a flexible manner.
    const previousAttributes = eventData.previous_attributes as any;
    const planOldDiff = (previousAttributes as any)
      .plan as Partial<Stripe.Plan> | null;
    const planOld: Stripe.Plan | null = planOldDiff
      ? {
          ...planNew,
          ...planOldDiff,
        }
      : null;

    let invoiceTotalOldInCents: number | undefined;
    const previousLatestInvoice = previousAttributes.latest_invoice as
      | string
      | undefined;

    if (previousLatestInvoice) {
      const invoiceOld = await this.getInvoice(previousLatestInvoice);
      invoiceTotalOldInCents = invoiceOld.total;
    }

    const planIdNew = planNew.id;

    const cancelAtPeriodEndNew = subscription.cancel_at_period_end;
    const cancelAtPeriodEndOld = previousAttributes.cancel_at_period_end;

    const abbrevProductNew = await this.expandAbbrevProductForPlan(planNew);
    const {
      amount: paymentAmountNewInCents,
      currency: paymentAmountNewCurrency,
    } = planNew;
    const { product_id: productIdNew, product_name: productNameNew } =
      abbrevProductNew;
    const abbrevPlanNew = await this.findAbbrevPlanById(planNew.id);
    const productNewMetadata = this.mergeMetadata(
      {
        ...planNew,
        metadata: abbrevPlanNew.plan_metadata,
      },
      abbrevProductNew
    );
    const { emailIconURL: productIconURLNew = '' } = productNewMetadata;
    const planConfig = await this.maybeGetPlanConfig(planIdNew);

    const productPaymentCycleNew = this.stripePlanToPaymentCycle(planNew);

    // During upgrades it's possible that an invoice isn't created when the
    // subscription is updated. Instead there will be pending invoice items
    // which will be added to next invoice once its generated.
    // For more info see https://stripe.com/docs/api/subscriptions/update
    let upcomingInvoiceWithInvoiceItem: Stripe.UpcomingInvoice | undefined;
    try {
      const upcomingInvoice = await this.stripe.invoices.retrieveUpcoming({
        customer: customer.id,
        subscription: subscription.id,
      });
      // Only use upcomingInvoice if there are `invoiceitems`
      upcomingInvoiceWithInvoiceItem = upcomingInvoice?.lines.data.some(
        (line) => line.type === 'invoiceitem'
      )
        ? upcomingInvoice
        : undefined;
    } catch (error) {
      if (
        error.type === 'StripeInvalidRequestError' &&
        error.code === 'invoice_upcoming_none'
      ) {
        upcomingInvoiceWithInvoiceItem = undefined;
      } else {
        throw error;
      }
    }

    const baseDetails = {
      uid,
      email,
      planId: planIdNew,
      productId: productIdNew,
      productIdNew,
      productNameNew,
      productIconURLNew,
      planIdNew,
      paymentAmountNewInCents,
      paymentAmountNewCurrency,
      productPaymentCycleNew,
      closeDate: event.created,
      invoiceTotalOldInCents,
      productMetadata: productNewMetadata,
      planConfig,
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
        invoice,
        upcomingInvoiceWithInvoiceItem
      );
    } else if (cancelAtPeriodEndOld && !cancelAtPeriodEndNew && !planOld) {
      return this.extractSubscriptionUpdateReactivationDetailsForEmail(
        subscription,
        baseDetails
      );
    } else if (!cancelAtPeriodEndNew && planOld) {
      return this.extractSubscriptionUpdateUpgradeDowngradeDetailsForEmail(
        subscription,
        baseDetails,
        invoice,
        upcomingInvoiceWithInvoiceItem,
        planOld
      );
    }

    // unknown update scenario, but let's return some details anyway
    return baseDetails;
  }

  /**
   * Helper for extractSubscriptionDeletedEventDetailsForEmail to further
   * extract details in redundant case
   */
  async extractSubscriptionDeletedEventDetailsForEmail(
    subscription: Stripe.Subscription
  ) {
    if (typeof subscription.latest_invoice !== 'string') {
      throw error.internalValidationError(
        'handleSubscriptionDeletedEvent',
        {
          subscriptionId: subscription.id,
          subscriptionInvoiceType: typeof subscription.latest_invoice,
        },
        'Subscription latest_invoice was not a string.'
      );
    }
    const invoice = await this.expandResource<Stripe.Invoice>(
      subscription.latest_invoice,
      INVOICES_RESOURCE
    );
    return this.extractInvoiceDetailsForEmail(invoice);
  }

  /**
   * Helper for extractSubscriptionUpdateEventDetailsForEmail to further
   * extract details in cancellation case
   */
  async extractSubscriptionUpdateCancellationDetailsForEmail(
    subscription: Stripe.Subscription,
    baseDetails: any,
    invoice: Stripe.Invoice,
    upcomingInvoiceWithInvoiceItem: Stripe.UpcomingInvoice | undefined
  ) {
    const { current_period_end: serviceLastActiveDate } = subscription;

    const {
      uid,
      email,
      planId,
      productId,
      productNameNew: productName,
      productIconURLNew: planEmailIconURL,
      productMetadata,
      planConfig,
    } = baseDetails;

    const {
      total: invoiceTotalInCents,
      currency: invoiceTotalCurrency,
      created: invoiceDate,
    } = upcomingInvoiceWithInvoiceItem || invoice;

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
      showOutstandingBalance: !!upcomingInvoiceWithInvoiceItem,
      productMetadata,
      planConfig,
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
    baseDetails: any
  ) {
    const {
      uid,
      email,
      planId,
      productId,
      productNameNew: productName,
      productIconURLNew: planEmailIconURL,
      planConfig,
    } = baseDetails;

    const { lastFour, cardType } =
      await this.extractCustomerDefaultPaymentDetailsByUid(uid);

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
      planConfig,
    };
  }

  async extractCustomerDefaultPaymentDetailsByUid(uid: string) {
    const customer = await this.fetchCustomer(uid, [
      'invoice_settings.default_payment_method',
    ]);

    if (!customer) {
      throw error.unknownCustomer(uid);
    }

    return this.extractCustomerDefaultPaymentDetails(customer);
  }

  async extractCustomerDefaultPaymentDetails(customer: Stripe.Customer) {
    let lastFour: string | null = null;
    let cardType: string | null = null;
    let country: string | null = null;
    let postalCode: string | null = null;

    if (customer.invoice_settings.default_payment_method) {
      // Post-SCA customer with a default PaymentMethod
      // default_payment_method *should* be expanded, but just in case...
      const paymentMethod = customer.invoice_settings
        .default_payment_method as Stripe.PaymentMethod;
      if (paymentMethod.card) {
        ({ last4: lastFour, brand: cardType, country } = paymentMethod.card);
      }
      if (paymentMethod.billing_details.address)
        ({ postal_code: postalCode } = paymentMethod.billing_details.address);
      // PaymentMethods should all be cards, but email templates should
      // already handle undefined lastFour and cardType gracefully
    } else if (customer.default_source) {
      // Legacy pre-SCA customer still using a Source rather than PaymentMethod
      if (typeof customer.default_source !== 'string') {
        // We don't expand this resource in cached customer, but it seemed to happen once
        ({
          last4: lastFour,
          brand: cardType,
          country,
          address_zip: postalCode,
        } = customer.default_source as Stripe.Card);
      } else {
        // Sources are available as payment methods, so we can expand them.
        const pm = await this.expandResource<Stripe.PaymentMethod>(
          customer.default_source,
          PAYMENT_METHOD_RESOURCE
        );
        if (!pm.card) throw new Error('Card must be present on payment method');
        ({ last4: lastFour, brand: cardType, country } = pm.card);

        if (pm.billing_details.address)
          ({ postal_code: postalCode } = pm.billing_details.address);
      }
    }

    return { lastFour, cardType, country, postalCode };
  }

  /**
   * Helper for extractSubscriptionUpdateEventDetailsForEmail to further
   * extract details in upgrade & downgrade cases.
   */
  async extractSubscriptionUpdateUpgradeDowngradeDetailsForEmail(
    subscription: Stripe.Subscription,
    baseDetails: any,
    invoice: Stripe.Invoice,
    upcomingInvoiceWithInvoiceItem: Stripe.UpcomingInvoice | undefined,
    planOld: Stripe.Plan
  ) {
    const {
      id: invoiceId,
      number: invoiceNumber,
      currency: paymentProratedCurrency,
      total: invoiceTotal,
    } = invoice;

    // https://github.com/mozilla/subhub/blob/e224feddcdcbafaf0f3cd7d52691d29d94157de5/src/hub/vendor/customer.py#L643
    const abbrevProductOld = await this.expandAbbrevProductForPlan(planOld);
    const { product_id: productIdOld, product_name: productNameOld } =
      abbrevProductOld;
    const abbrevPlanOld = await this.findAbbrevPlanById(planOld.id);
    const { emailIconURL: productIconURLOld = '' } = this.mergeMetadata(
      {
        ...planOld,
        metadata: abbrevPlanOld.plan_metadata,
      },
      abbrevProductOld
    );

    const productPaymentCycleOld = this.stripePlanToPaymentCycle(planOld);

    // get next invoice details
    const nextInvoice = upcomingInvoiceWithInvoiceItem
      ? upcomingInvoiceWithInvoiceItem
      : await this.previewInvoiceBySubscriptionId({
          subscriptionId: subscription.id,
        });

    const { total: nextInvoiceTotal, currency: nextInvoiceCurrency } =
      nextInvoice || {};

    return {
      ...baseDetails,
      updateType: SUBSCRIPTION_UPDATE_TYPES.UPGRADE,
      productIdOld,
      productNameOld,
      productIconURLOld,
      productPaymentCycleOld,
      paymentAmountOldInCents: baseDetails.invoiceTotalOldInCents,
      paymentAmountOldCurrency: planOld.currency,
      paymentAmountNewInCents: nextInvoiceTotal,
      paymentAmountNewCurrency: nextInvoiceCurrency,
      invoiceNumber,
      invoiceId,
      paymentProratedInCents: invoiceTotal,
      paymentProratedCurrency,
    };
  }

  /**
   * Process a customer event that needs to be saved to Firestore.
   */
  async processCustomerEventToFirestore(event: Stripe.Event) {
    const customer = await this.stripe.customers.retrieve(
      (event.data.object as Stripe.Customer).id
    );
    const { uid } = await getUidAndEmailByStripeCustomerId(customer.id);
    if (!uid) {
      return;
    }

    // Ensure the customer and its subscriptions exist in Firestore.
    // Note that we still insert the object here in case we've already
    // fetched the customer previously.
    return this.stripeFirestore.insertCustomerRecordWithBackfill(uid, customer);
  }

  /**
   * Process a subscription event that needs to be saved to Firestore.
   */
  async processSubscriptionEventToFirestore(event: Stripe.Event) {
    const subscription = await this.stripe.subscriptions.retrieve(
      (event.data.object as Stripe.Subscription).id
    );
    // Update the customer if our copy of the customer is missing the currency.
    // This could occur in some edge cases where the subscription is created
    // before a user paying with paypal has the paypal agreement ID set on the
    // user.
    const customer = await this.expandResource(
      subscription.customer,
      CUSTOMER_RESOURCE
    );
    if (!customer.deleted && !customer.currency) {
      await this.stripeFirestore.fetchAndInsertCustomer(
        subscription.customer as string
      );
      return subscription;
    }

    return this.stripeFirestore.insertSubscriptionRecordWithBackfill(
      subscription
    );
  }

  /**
   * Process a invoice event that needs to be saved to Firestore.
   */
  async processInvoiceEventToFirestore(event: Stripe.Event) {
    const invoiceId = (event.data.object as Stripe.Invoice).id;
    if (!invoiceId) throw new Error('Invoice ID must be specified');

    const invoice = await this.stripe.invoices.retrieve(invoiceId);

    try {
      await this.stripeFirestore.insertInvoiceRecord(invoice);
    } catch (err) {
      if (err.name === FirestoreStripeError.FIRESTORE_CUSTOMER_NOT_FOUND) {
        await this.stripeFirestore.retrieveAndFetchSubscription(
          invoice.subscription as string
        );
        return this.stripeFirestore.insertInvoiceRecord(invoice);
      }
      throw err;
    }
    return;
  }

  /**
   * Process a payment method event that needs to be saved to Firestore.
   *
   * Note that this does not account for previous attributes as payment methods
   * only change in their entirety.
   */
  async processPaymentMethodEventToFirestore(event: Stripe.Event) {
    // If this payment method is not attached, we can't store it in firestore as
    // the customer may not exist.
    if (!(event.data.object as Stripe.PaymentMethod).customer) {
      return;
    }

    const paymentMethod = await this.stripe.paymentMethods.retrieve(
      (event.data.object as Stripe.PaymentMethod).id
    );

    // If this payment method is not attached, we can't store it in firestore as
    // the customer may not exist. It is possible that a payment_method.detached
    // event has already been processed, detaching the payment method.
    if (!paymentMethod.customer) {
      return;
    }

    try {
      await this.stripeFirestore.insertPaymentMethodRecordWithBackfill(
        paymentMethod
      );
    } catch (err) {
      if (
        !(
          err.name === FirestoreStripeError.STRIPE_CUSTOMER_DELETED &&
          [
            'payment_method.card_automatically_updated',
            'payment_method.updated',
          ].includes(event.type)
        )
      ) {
        throw err;
      }
    }
  }

  /**
   * Process a payment_method.detached event. Remove the payment method from Firestore.
   */
  async processPaymentMethodDetachedEventToFirestore(event: Stripe.Event) {
    const paymentMethodId = (event.data.object as Stripe.PaymentMethod).id;
    await this.stripeFirestore.removePaymentMethodRecord(paymentMethodId);
  }

  /**
   * Process a webhook event from Stripe and if needed, save it to Firestore.
   */
  async processWebhookEventToFirestore(event: Stripe.Event) {
    const { type } = event;

    // Stripe does not include the card_automatically_updated event
    // despite this being a valid event for Stripe webhook registration
    type StripeEnabledEvent =
      | Stripe.WebhookEndpointUpdateParams.EnabledEvent
      | 'payment_method.card_automatically_updated';

    // Note that we must insert before any event handled by the general
    // webhook code to ensure the object is up to date in Firestore before
    // our code handles the event.
    let handled = true;
    try {
      switch (type as StripeEnabledEvent) {
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
        case 'customer.deleted':
          await this.processCustomerEventToFirestore(event);
          break;
        case 'customer.subscription.created':
        case 'customer.subscription.updated':
        case 'customer.subscription.deleted':
          await this.processSubscriptionEventToFirestore(event);
          break;
        case 'payment_method.attached':
        case 'payment_method.card_automatically_updated':
        case 'payment_method.updated':
          await this.processPaymentMethodEventToFirestore(event);
          break;
        case 'payment_method.detached':
          await this.processPaymentMethodDetachedEventToFirestore(event);
          break;
        default: {
          handled = false;
          break;
        }
      }
    } catch (err) {
      if (
        [
          FirestoreStripeError.STRIPE_CUSTOMER_DELETED,
          FirestoreStripeError.FIRESTORE_CUSTOMER_NOT_FOUND,
        ].includes(err.name)
      ) {
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
    const checkDeletedProduct = (product: Stripe.Product) => {
      if ((product.deleted as unknown as boolean) === true) {
        throw error.unknownSubscriptionPlan(plan.id);
      }
      return this.abbrevProductFromStripeProduct(product);
    };

    // The "plan" argument might not have any product info on it.
    const planWithProductId = await this.findAbbrevPlanById(plan.id);

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

  /**
   * TODO This function exists to help the transition from product/plan
   * metadata to Firestore doc based configs.  Once the Firestore based configs
   * have been proven stable in prod, we remove this level of indirection.
   */
  async maybeGetPlanConfig(planId: string) {
    return this.paymentConfigManager
      ? (await this.paymentConfigManager.getMergedPlanConfiguration(planId)) ||
          {}
      : {};
  }

  async removeFirestoreCustomer(uid: string) {
    try {
      return await this.stripeFirestore.removeCustomerRecursive(uid);
    } catch (error) {
      if (error instanceof StripeFirestoreMultiError) {
        reportSentryError(error);
      }
      throw error;
    }
  }
}

/**
 * Create a Stripe Helper with built-in caching.
 */
export function createStripeHelper(log: any, config: any, statsd: StatsD) {
  const stripeHelper = new StripeHelper(log, config, statsd);
  stripeHelper.checkStripeAPIKey();
  return stripeHelper;
}
