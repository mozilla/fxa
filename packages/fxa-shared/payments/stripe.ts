/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import cacheManager, { Cacheable } from '@type-cacheable/core';
import { useAdapter } from '@type-cacheable/ioredis-adapter';
import { StatsD } from 'hot-shots';
import ioredis from 'ioredis';
import mapValues from 'lodash/mapValues';
import { Stripe } from 'stripe';
import {
  deleteAccountCustomer,
  getAccountCustomerByUid,
} from '../db/models/auth';
import { IapExtraStripeInfo } from '../dto/auth/payments/iap-subscription';
import { formatPlanConfigDto } from '../dto/auth/payments/plan-configuration';
import { ILogger } from '../log';
import { MergedPlanConfig } from '../subscriptions/configuration/plan';
import { mapPlanConfigsByPriceId } from '../subscriptions/configuration/utils';
import {
  AbbrevPlan,
  AbbrevProduct,
  ConfiguredPlan,
  MozillaSubscriptionTypes,
  SubscriptionType,
} from '../subscriptions/types';
import { PaymentConfigManager } from './configuration/manager';
import { AppStoreSubscriptionPurchase } from './iap/apple-app-store/subscription-purchase';
import { PlayStoreSubscriptionPurchase } from './iap/google-play/subscription-purchase';
import { FirestoreStripeError, StripeFirestore } from './stripe-firestore';
import { ProductConfigurationManager } from '@fxa/shared/cms';
import { StripeMapperService } from '@fxa/payments/legacy';
import * as Sentry from '@sentry/node';

export const CHARGES_RESOURCE = 'charges';
export const COUPON_RESOURCE = 'coupons';
export const CREDIT_NOTE_RESOURCE = 'creditNotes';
export const CUSTOMER_RESOURCE = 'customers';
export const INVOICES_RESOURCE = 'invoices';
export const PAYMENT_METHOD_RESOURCE = 'paymentMethods';
export const PLAN_RESOURCE = 'plans';
export const PRICE_RESOURCE = 'prices';
export const PRODUCT_RESOURCE = 'products';
export const SOURCE_RESOURCE = 'sources';
export const SUBSCRIPTIONS_RESOURCE = 'subscriptions';
export const TAX_RATE_RESOURCE = 'taxRates';
export const STRIPE_PLANS_CACHE_KEY = 'listStripePlans';
export const STRIPE_PRODUCTS_CACHE_KEY = 'listStripeProducts';

export const STRIPE_OBJECT_TYPE_TO_RESOURCE: Record<string, string> = {
  charge: CHARGES_RESOURCE,
  coupon: COUPON_RESOURCE,
  credit_note: CREDIT_NOTE_RESOURCE,
  customer: CUSTOMER_RESOURCE,
  invoice: INVOICES_RESOURCE,
  payment_method: PAYMENT_METHOD_RESOURCE,
  plan: PLAN_RESOURCE,
  price: PRICE_RESOURCE,
  product: PRODUCT_RESOURCE,
  source: SOURCE_RESOURCE,
  subscription: SUBSCRIPTIONS_RESOURCE,
  tax_rate: TAX_RATE_RESOURCE,
};

export const VALID_RESOURCE_TYPES = Object.values(
  STRIPE_OBJECT_TYPE_TO_RESOURCE
);

export enum STRIPE_PRICE_METADATA {
  APP_STORE_PRODUCT_IDS = 'appStoreProductIds',
  PROMOTION_CODES = 'promotionCodes',
  PLAY_SKU_IDS = 'playSkuIds',
}

// PlayStoreSubscriptionPurchase or AppStoreSubscriptionPurchase properties corresponding to the Stripe price id
export enum STRIPE_PRICE_ID_TO_IAP_ANALOG {
  PLAY_STORE = 'sku',
  APP_STORE = 'productId',
}

export type StripeHelperConfig = {
  env: string;
  subscriptions: {
    stripeApiKey: string;
    stripeWebhookSecret: string;
    productConfigsFirestore: {
      enabled: boolean;
    };
  };
  authFirestore: {
    prefix: string;
  };
  subhub: {
    plansCacheTtlSeconds: number;
  };
  redis: any; // TODO
  cms: {
    enabled: boolean;
    legacyMapper: {
      mapperCacheTTL: number;
    };
  };
};

/**
 * Base class for shared stripe operations
 */
export abstract class StripeHelper {
  /** Stripe instance used to communicate with stripe api. */
  public abstract readonly stripe: Stripe;

  /** StripeFirestore instance used to access customer data held in firestore documents. */
  protected abstract readonly stripeFirestore: StripeFirestore;

  // TODO remove the ? when removing the SUBSCRIPTIONS_FIRESTORE_CONFIGS_ENABLED feature flag
  protected abstract readonly paymentConfigManager?: PaymentConfigManager;

  /** Optional Redis instance used for caching. */
  protected readonly redis?: ioredis.Redis;

  /** */
  protected abstract readonly productConfigurationManager?: ProductConfigurationManager;
  protected abstract readonly stripeMapperService?: StripeMapperService;

  /**
   * Create a Stripe Helper with built-in caching.
   */
  constructor(
    protected readonly config: StripeHelperConfig,
    protected readonly statsd: StatsD,
    protected readonly log: ILogger
  ) {
    cacheManager.setOptions({
      // Ensure the StripeHelper instance is passed into TTLBuilder functions
      excludeContext: false,
    });
  }

  /**
   * Once redis has been instantiated, this method should be invoked to enable caching via redis.
   */
  protected initRedis() {
    if (this.redis) {
      useAdapter(this.redis);
    }
  }

  /**
   * Once stripe has been instantiated, this method should be invoked to ensure stripe metrics are being collected.
   */
  protected initStripe() {
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

  /**
   * Given a plan indicates if the plan is in a valid state.
   * @param plan - Plan to validate
   * @returns - true if plan is valid
   */
  protected abstract validatePlan(plan: Stripe.Plan): Promise<boolean>;

  /**
   * Fetch all product data and cache it if Redis is enabled.
   *
   * Use `allProducts` below to use the cached-enhanced version.
   */
  async fetchAllProducts(): Promise<Stripe.Product[]> {
    const products: Stripe.Product[] = [];
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

  /**
   * Formats all products from stripe into an abberviated format. (i.e. an improved subset of the object, with only pertinent data.)
   * @returns
   */
  async allAbbrevProducts(): Promise<AbbrevProduct[]> {
    const products = await this.allProducts();
    return products.map(this.abbrevProductFromStripeProduct);
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
   * Fetch a customer for the record from Stripe based on user id.
   */
  async fetchCustomer(
    uid: string,
    expand?: (
      | 'subscriptions'
      | 'invoice_settings.default_payment_method'
      | 'tax'
    )[],
    statusFilter?: Stripe.Subscription.Status[]
  ): Promise<Stripe.Customer | void> {
    const { stripeCustomerId } = (await getAccountCustomerByUid(uid)) || {};
    if (!stripeCustomerId) {
      return;
    }

    // By default this has subscriptions expanded.
    let customer = await this.expandResource<Stripe.Customer>(
      stripeCustomerId,
      CUSTOMER_RESOURCE,
      statusFilter
    );

    if (customer.deleted) {
      await deleteAccountCustomer(uid);
      return;
    }

    // If the customer has subscriptions and no currency, we must have a stale
    // customer record. Let's update it.
    if (customer.subscriptions?.data.length && !customer.currency) {
      await this.stripeFirestore.fetchAndInsertCustomer(customer.id);
      // Retrieve the customer again.
      customer = await this.expandResource<Stripe.Customer>(
        stripeCustomerId,
        CUSTOMER_RESOURCE
      );
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
      throw new Error(
        `Stripe Customer: ${customer.id} has mismatched uid in metadata.`
      );
    }

    // There's only 3 expansions used in our code-base:
    //  - subscriptions
    //  - invoice_settings.default_payment_method
    //  - tax
    // Subscriptions is already expanded. Manually fetch the other if needed.
    if (expand?.includes('invoice_settings.default_payment_method')) {
      customer.invoice_settings.default_payment_method =
        await this.expandResource(
          customer.invoice_settings.default_payment_method,
          PAYMENT_METHOD_RESOURCE
        );
    }
    if (expand?.includes('tax')) {
      const customerWithTax = await this.stripe.customers.retrieve(
        customer.id,
        { expand: ['tax'] }
      );
      if (customerWithTax.deleted) {
        return;
      }
      customer.tax = customerWithTax.tax;
    }

    return customer;
  }

  /**
   * Return a list of Google Play Store skus or Apple App Store productIds for a given price,
   * based on the iapType passed in.
   */
  priceToIapIdentifiers(
    price: AbbrevPlan,
    iapType: Omit<SubscriptionType, typeof MozillaSubscriptionTypes.WEB>
  ) {
    return determineIapIdentifiers(iapType, price);
  }

  /**
   * Append any matching prices and related info to their corresponding IAP purchases.
   */
  async addPriceInfoToIapPurchases<
    T extends AppStoreSubscriptionPurchase | PlayStoreSubscriptionPurchase
  >(
    purchases: T[],
    iapType: Omit<SubscriptionType, typeof MozillaSubscriptionTypes.WEB>
  ): Promise<(T & IapExtraStripeInfo)[]> {
    const plans = await this.allAbbrevPlans();
    const appendedPurchases: (T & IapExtraStripeInfo)[] = [];
    for (const plan of plans) {
      const iapIdentifiers = this.priceToIapIdentifiers(plan, iapType);
      const matchingPurchases = purchases.filter((purchase) => {
        if (STRIPE_PRICE_ID_TO_IAP_ANALOG.APP_STORE in purchase) {
          return iapIdentifiers.includes(
            purchase[STRIPE_PRICE_ID_TO_IAP_ANALOG.APP_STORE].toLowerCase()
          );
        }

        if (STRIPE_PRICE_ID_TO_IAP_ANALOG.PLAY_STORE in purchase) {
          return iapIdentifiers.includes(
            purchase[STRIPE_PRICE_ID_TO_IAP_ANALOG.PLAY_STORE].toLowerCase()
          );
        }

        return false;
      });
      for (const matchingPurchase of matchingPurchases) {
        appendedPurchases.push({
          ...matchingPurchase,
          product_id: plan.product_id,
          product_name: plan.product_name,
          price_id: plan.plan_id,
        });
      }
    }
    return appendedPurchases;
  }

  /**
   * Fetches all plans from stripe and returns them.
   *
   * Use `allPlans` below to use the cached-enhanced version.
   */
  async fetchAllPlans(): Promise<Stripe.Plan[]> {
    const plans: Stripe.Plan[] = [];

    for await (const item of this.stripe.plans.list({
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

      item.product.metadata = mapValues(item.product.metadata, (v) => v.trim());
      item.metadata = mapValues(item.metadata, (v) => v.trim());

      // We should return all the plans when relying on Firestore docs for
      // their configuration
      if (
        this.config.subscriptions.productConfigsFirestore.enabled ||
        (await this.validatePlan(item))
      ) {
        plans.push(item);
      }
    }

    return plans;
  }

  async allConfiguredPlans(): Promise<ConfiguredPlan[] | Stripe.Plan[]> {
    // for a transitional period we will include configs from both Firestore
    // docs and Stripe metadata when enabled by the feature flag, making it
    // possible for Payments to toggle the Firestore configs feature flag
    // without any changes or re-deploy necessary on the auth-server

    const allPlans = await this.allPlans();
    const planConfigs = await this.allMergedPlanConfigs();

    return allPlans.map((p) => {
      (p as ConfiguredPlan).configuration = planConfigs[p.id]
        ? formatPlanConfigDto(planConfigs[p.id])
        : null;
      return p as ConfiguredPlan;
    });
  }

  async allMergedPlanConfigs() {
    // TODO remove when removing the SUBSCRIPTIONS_FIRESTORE_CONFIGS_ENABLED feature flag
    if (!this.paymentConfigManager) {
      return {};
    }

    const planConfigs = mapPlanConfigsByPriceId(
      await this.paymentConfigManager.allPlans()
    );

    Object.entries(planConfigs).forEach(([k, pConfig]) => {
      planConfigs[k] = this.paymentConfigManager!.getMergedConfig(pConfig);
    });

    return planConfigs as { [key: string]: MergedPlanConfig };
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

  async allAbbrevPlans(acceptLanguage = 'en'): Promise<AbbrevPlan[]> {
    const plans = await this.allConfiguredPlans();
    const validPlans: (Stripe.Plan | ConfiguredPlan)[] = [];
    const validPlansFinal: (Stripe.Plan | ConfiguredPlan)[] = [];
    const validPlanIds: Stripe.Plan['id'][] = [];

    for (const p of plans) {
      // @ts-ignore: depending the SUBSCRIPTIONS_FIRESTORE_CONFIGS_ENABLED feature flag, p can be a Stripe.Plan, which does not have a `configuration`
      if (p.configuration || (await this.validatePlan(p))) {
        validPlans.push(p);
        validPlanIds.push(p.id);
      }
    }

    if (this.productConfigurationManager && this.stripeMapperService) {
      try {
        // Determine the locale before mapping the plans
        // to limit the number of cache entries to the total number
        // of supported Strapi locales
        const locale =
          await this.productConfigurationManager.getSupportedLocale(
            acceptLanguage
          );

        const validPlansMapped =
          await this.stripeMapperService.mapCMSToStripePlans(
            validPlans,
            locale,
            this.config.cms.enabled
          );

        validPlansFinal.push(...validPlansMapped.mappedPlans);
        if (validPlansMapped.nonMatchingPlans.length) {
          const nonMatchingPlans = validPlansMapped.nonMatchingPlans;
          this.log.error(`stripeHelper.allAbbrevPlans.nonMatchingPlans`, {
            acceptLanguage,
            nonMatchingPlans,
          });
          Sentry.withScope((scope) => {
            scope.setContext('allAbbrevPlans', {
              acceptLanguage,
              nonMatchingPlans,
            });
            Sentry.captureMessage(
              `StripeHelper.allAbbrevPlans - CMS config does not match Stripe metadata`,
              'warning' as Sentry.SeverityLevel
            );
          });
        }
      } catch (error) {
        Sentry.captureException(error);
        validPlansFinal.push(...validPlans);
      }
    } else {
      validPlansFinal.push(...validPlans);
    }

    return validPlansFinal.map((p) => ({
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
      active: p.active,
      // TODO simply copy p.configuration below when remove the SUBSCRIPTIONS_FIRESTORE_CONFIGS_ENABLED feature flag
      // @ts-ignore: depending the SUBSCRIPTIONS_FIRESTORE_CONFIGS_ENABLED feature flag, p can be a Stripe.Plan, which does not have a `configuration`
      configuration: p.configuration ?? null,
    }));
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
    resourceType: (typeof VALID_RESOURCE_TYPES)[number],
    statusFilter?: Stripe.Subscription.Status[]
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
          resource,
          true
        );
        if (customer?.deleted) {
          // There are no subscriptions for deleted customers on the customer object.
          // @ts-ignore
          return customer;
        }
        const subscriptions =
          await this.stripeFirestore.retrieveCustomerSubscriptions(
            resource,
            statusFilter
          );
        (customer as any).subscriptions = {
          data: subscriptions as any,
          has_more: false,
        };
        // @ts-ignore
        return customer;
      case SUBSCRIPTIONS_RESOURCE:
        // @ts-ignore
        return this.stripeFirestore.retrieveAndFetchSubscription(
          resource,
          true
        );
      case INVOICES_RESOURCE:
        try {
          // TODO we could remove the getInvoiceWithDiscount method if we add logic
          // here to check if the discounts field is expanded but it would mean
          // adding another stipe call to get discounts even when unnecessary
          const invoice = await this.stripeFirestore.retrieveInvoice(resource);
          // @ts-ignore
          return invoice;
        } catch (err) {
          if (err.name === FirestoreStripeError.FIRESTORE_INVOICE_NOT_FOUND) {
            const invoice = await this.stripe.invoices.retrieve(resource, {
              expand: ['discounts'],
            });
            await this.stripeFirestore.retrieveAndFetchCustomer(
              invoice.customer as string,
              true
            );
            await this.stripeFirestore.insertInvoiceRecord(invoice, true);
            // @ts-ignore
            return invoice;
          }
          throw err;
        }
      case PAYMENT_METHOD_RESOURCE:
        try {
          const paymentMethod =
            await this.stripeFirestore.retrievePaymentMethod(resource);
          // @ts-ignore
          return paymentMethod;
        } catch (err) {
          if (
            err.name === FirestoreStripeError.FIRESTORE_PAYMENT_METHOD_NOT_FOUND
          ) {
            const paymentMethod = await this.stripe.paymentMethods.retrieve(
              resource
            );
            // Payment methods may not be attached to customers, in which case we
            // cannot store it in Firestore.
            if (paymentMethod.customer) {
              await this.stripeFirestore.retrieveAndFetchCustomer(
                paymentMethod.customer as string,
                true
              );
              await this.stripeFirestore.insertPaymentMethodRecord(
                paymentMethod,
                true
              );
            }
            // @ts-ignore
            return paymentMethod;
          }
          throw err;
        }
      case PRODUCT_RESOURCE:
        const products = await this.allProducts();
        // @ts-ignore
        return products.find((p) => p.id === resource);
      case PLAN_RESOURCE:
        const plans = await this.allPlans();
        // @ts-ignore
        return plans.find((p) => p.id === resource);
      default:
        // @ts-ignore
        return this.stripe[resourceType].retrieve(resource);
    }
  }
}

/**
 * Auxillary function that looks into plan metadata and extracts the correct set of product identifier given an iap type.
 * @param iapType - desired aip type
 * @param plan - a target plan
 * @returns set of product identifiers
 */
export function determineIapIdentifiers(
  iapType: Omit<SubscriptionType, typeof MozillaSubscriptionTypes.WEB>,
  plan: AbbrevPlan
) {
  const key =
    iapType === MozillaSubscriptionTypes.IAP_GOOGLE
      ? STRIPE_PRICE_METADATA.PLAY_SKU_IDS
      : iapType === MozillaSubscriptionTypes.IAP_APPLE
      ? STRIPE_PRICE_METADATA.APP_STORE_PRODUCT_IDS
      : null;

  if (!key) {
    throw new Error('Invalid iapType');
  }

  const priceConfigIAPIds = plan.configuration?.[key] || [];
  const priceMetadataIAPIds = plan.plan_metadata?.[key] || '';
  return [
    ...new Set(
      priceConfigIAPIds.concat(
        priceMetadataIAPIds
          .trim()
          .split(',')
          .map((c) => c.trim().toLowerCase())
          .filter((c) => !!c)
      )
    ),
  ];
}
