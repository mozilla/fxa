/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { Logger } from 'mozlog';
import Stripe from 'stripe';
import { Container } from 'typedi';

import {
  CapabilityConfig,
  StyleConfig,
  StyleConfigKeys,
  SupportConfig,
  SupportConfigKeys,
  UiContentConfig,
  UiContentConfigKeys,
  UrlConfig,
  UrlConfigKeys,
} from '../../lib/payments/configuration/base';
import { PaymentConfigManager } from '../../lib/payments/configuration/manager';
import { PlanConfig } from '../../lib/payments/configuration/plan';
import { ProductConfig } from '../../lib/payments/configuration/product';
import { StripeHelper } from '../../lib/payments/stripe';
import { commaSeparatedListToArray } from '../../lib/payments/utils';

const DEFAULT_LOCALE = 'en';

/**
 * Handles converting Stripe Products and Plans to Firestore ProductConfig
 * and PlanConfig Firestore documents. Updates existing documents if they
 * already exist.
 */
export class StripeProductsAndPlansConverter {
  private supportedLanguages: string[];
  private log: Logger;
  private stripeHelper: StripeHelper;
  private paymentConfigManager: PaymentConfigManager;

  constructor({
    log,
    stripeHelper,
    supportedLanguages,
  }: {
    log: Logger;
    stripeHelper: StripeHelper;
    supportedLanguages: string[];
  }) {
    this.log = log;
    this.stripeHelper = stripeHelper;
    this.supportedLanguages = supportedLanguages.map((l: string) =>
      l.toLowerCase()
    );
    this.paymentConfigManager = Container.get(PaymentConfigManager);
    this.paymentConfigManager.startListeners();
  }

  /**
   * Get all of the metadata keys that start with the prefix, and
   * concatenate them into a single list.
   * */
  getArrayOfStringsFromMetadataKeys(
    metadata: Stripe.Product['metadata'],
    metadataKeyPrefix: string
  ): string[] {
    const metadataValues = [];
    for (const [metadataKey, metadataValue] of Object.entries(metadata)) {
      if (metadataKey.startsWith(metadataKeyPrefix)) {
        metadataValues.push(metadataValue);
      }
    }
    return metadataValues;
  }

  /**
   * Convert Stripe Product or Plan capabilities metadata keys into a
   * nested CapabilityConfig object.
   *
   * For example, a Stripe object with the capabilities `metadata` keys:
   *   {
   *     capabilities: 'abc',
   *     capabilities[clientId]: 'def',
   *   }
   * Would result in the following `capabilities` object:
   *   {
   *     '*': 'abc',
   *     [clientId]: 'def',
   *   }
   */
  capabilitiesMetadataToCapabilityConfig(
    stripeObject: Stripe.Product | Stripe.Plan
  ): CapabilityConfig {
    const capabilities: CapabilityConfig = {};
    if (!stripeObject.metadata) {
      return capabilities;
    }
    for (const oldKey of Object.keys(stripeObject.metadata).filter((key) =>
      key.toLowerCase().startsWith('capabilities')
    )) {
      // Parse the key to determine if it's an 'all RP' or single RP capability
      const [_, clientId] = oldKey.split(':');
      const newKey = clientId ?? '*';
      capabilities[newKey] = commaSeparatedListToArray(
        stripeObject.metadata![oldKey]
      );
    }
    return capabilities;
  }

  /**
   * Convert Stripe Product or Plan style metadata keys into a
   * StyleConfig object.
   */
  stylesMetadataToStyleConfig(
    stripeObject: Stripe.Product | Stripe.Plan
  ): StyleConfig {
    const styleConfig: StyleConfig = {};
    if (!stripeObject.metadata) {
      return styleConfig;
    }
    for (const key of StyleConfigKeys) {
      const value = stripeObject.metadata[key];
      if (value) {
        styleConfig[key] = value;
      }
    }
    return styleConfig;
  }

  /**
   * Convert Stripe Product or Plan support metadata keys prefixed
   * with 'support:' into a SupportConfig object.
   */
  supportMetadataToSupportConfig(
    stripeObject: Stripe.Product | Stripe.Plan
  ): SupportConfig {
    const supportConfig: SupportConfig = {};
    if (!stripeObject.metadata) {
      return supportConfig;
    }
    for (const key of SupportConfigKeys) {
      const metadataKeyPrefix = `support:${key}`;
      const metadataValues = this.getArrayOfStringsFromMetadataKeys(
        stripeObject.metadata,
        metadataKeyPrefix
      );
      if (metadataValues.length > 0) {
        supportConfig[key] = metadataValues;
      }
    }
    return supportConfig;
  }

  /**
   * Convert Stripe Product or Plan UI Content metadata keys
   * with and without a 'product:' prefix into a UiContentConfig
   * object.
   */
  uiContentMetadataToUiContentConfig(
    stripeObject: Stripe.Product | Stripe.Plan
  ): UiContentConfig {
    const uiContentConfig: UiContentConfig = {};
    if (!stripeObject.metadata) {
      return uiContentConfig;
    }
    for (const key of Object.values(UiContentConfigKeys)) {
      let value;
      if (key === 'details') {
        const metadataKeyPrefix = `product:${key}`;
        value = this.getArrayOfStringsFromMetadataKeys(
          stripeObject.metadata,
          metadataKeyPrefix
        );
        if (value.length > 0) {
          uiContentConfig[key] = value;
        }
        continue;
      }
      value =
        stripeObject.metadata[key] ?? stripeObject.metadata[`product:${key}`];
      if (value) {
        // @ts-ignore We need to be able to assign values to all keys
        uiContentConfig[key] = value;
      }
    }
    return uiContentConfig;
  }

  /**
   * Convert Stripe Product or Plan URL metadata keys with various prefixes
   * and suffixes to a UrlConfig object.
   */
  urlMetadataToUrlConfig(
    stripeObject: Stripe.Product | Stripe.Plan
  ): UrlConfig {
    const urlConfig: UrlConfig = {};
    if (!stripeObject.metadata) {
      return urlConfig;
    }
    for (const key of UrlConfigKeys) {
      const value =
        stripeObject.metadata[`${key}URL`] ??
        stripeObject.metadata[`${key}Link`] ??
        stripeObject.metadata[`product:${key}URL`];
      if (value) {
        urlConfig[key] = value;
      }
    }
    return urlConfig;
  }

  /**
   * Convert a Stripe Product to a ProductConfig object with an empty
   * `locales` key.
   */
  stripeProductToProductConfig(product: Stripe.Product): ProductConfig {
    // Firestore cannot serialize class instances
    const productConfig: any = {};

    // BaseConfig
    productConfig.active = true;
    productConfig.capabilities =
      this.capabilitiesMetadataToCapabilityConfig(product);
    // `locales` will be populated once we iterate through the Stripe Plans
    productConfig.locales = {};
    productConfig.styles = this.stylesMetadataToStyleConfig(product);
    productConfig.support = this.supportMetadataToSupportConfig(product);
    productConfig.uiContent = this.uiContentMetadataToUiContentConfig(product);
    productConfig.urls = this.urlMetadataToUrlConfig(product);

    // Extended by ProductConfig
    productConfig.stripeProductId = product.id;
    const { productSet, promotionCodes } = product.metadata;
    if (productSet) {
      productConfig.productSet = productSet;
    }
    if (promotionCodes) {
      productConfig.promotionCodes = commaSeparatedListToArray(promotionCodes);
    }
    return productConfig;
  }

  /**
   * Infer a locale (language only or language and region) from a Stripe Plan.
   * TODO: #12053: Improve heuristics
   */
  findLocaleStringFromStripePlan(plan: Stripe.Plan): null | string {
    // Try to extract a locale from the plan nickname
    const { nickname } = plan;
    let locale = nickname
      ?.split(' ')
      .filter((w) => this.supportedLanguages.includes(w.toLowerCase()));
    if (locale && locale.length > 0) {
      return locale[0];
    }
    return null;
  }

  /**
   * Extract localized data from a Stripe Plan and convert it to
   * ProductConfig.locales
   */
  stripePlanLocalesToProductConfigLocales(
    plan: Stripe.Plan
  ): ProductConfig['locales'] {
    const locales: ProductConfig['locales'] = {};
    const localeStr = this.findLocaleStringFromStripePlan(plan);
    // These keys exist on the top level of ProductConfig for the default locale
    if (
      !localeStr ||
      localeStr.toLowerCase() === DEFAULT_LOCALE.toLowerCase()
    ) {
      return locales;
    }
    const uiContent = this.uiContentMetadataToUiContentConfig(plan);
    const urls = this.urlMetadataToUrlConfig(plan);
    const support = this.supportMetadataToSupportConfig(plan);
    locales[localeStr] = {
      uiContent,
      urls,
      support,
    };
    return locales;
  }

  /**
   * Convert a Stripe Plan to a PlanConfig object
   */
  stripePlanToPlanConfig(plan: Stripe.Plan): PlanConfig {
    // Firestore cannot serialize class instances
    const planConfig: any = {};

    planConfig.active = true;

    if (!plan.metadata) {
      return planConfig;
    }

    const metadataKeys = Object.keys(plan.metadata);

    // Optional BaseConfig
    if (
      metadataKeys.some((key) => key.toLowerCase().startsWith('capabilities'))
    ) {
      planConfig.capabilities =
        this.capabilitiesMetadataToCapabilityConfig(plan);
    }
    if (metadataKeys.some((key) => key.toLowerCase().includes('url'))) {
      planConfig.urls = this.urlMetadataToUrlConfig(plan);
    }
    if (
      metadataKeys.some((key) => Object.keys(UiContentConfigKeys).includes(key))
    ) {
      planConfig.uiContent = this.uiContentMetadataToUiContentConfig(plan);
    }
    // @ts-ignore `includes` doesn't allow SearchElement to be any `string`
    if (metadataKeys.some((key) => StyleConfigKeys.includes(key))) {
      planConfig.styles = this.stylesMetadataToStyleConfig(plan);
    }
    if (metadataKeys.some((key) => key.toLowerCase().startsWith('support'))) {
      planConfig.support = this.supportMetadataToSupportConfig(plan);
    }

    // Extended by PlanConfig
    planConfig.stripePriceId = plan.id;
    const { productOrder, googlePlaySku, appleProductId } = plan.metadata;
    if (productOrder) {
      planConfig.productOrder = parseInt(productOrder);
    }
    if (googlePlaySku) {
      planConfig.googlePlaySku = commaSeparatedListToArray(googlePlaySku);
    }
    if (appleProductId) {
      planConfig.appleProductId = commaSeparatedListToArray(appleProductId);
    }
    return planConfig;
  }

  async load() {
    await this.paymentConfigManager.load();
  }

  /**
   * Iterates through all Stripe Plans for all Stripe Products to convert each
   * plan to a PlanConfig object and each product to a ProductConfig object,
   * moving localized metadata from the plan to the ProductConfig.
   *
   * Stores the PlanConfigs and ProductConfigs in Firestore as new document(s) if
   * none existed, else updates the existing Firestore document(s).
   *
   * Logs errors, but does not abort early on failure.
   *
   * If a `productId` is passed, processes all plans for the given product ID only.
   *
   * If `dryRun` is true, logs each Product and its ProductConfig and each plan
   * and its PlanConfig, but doesn't update Firestore.
   */
  async convert({
    productId,
    isDryRun,
  }: {
    productId: string;
    isDryRun: boolean;
  }): Promise<void> {
    this.log.debug('StripeProductsAndPlansConverter.convertBegin', {
      productId,
      isDryRun,
    });
    const params = productId ? { ids: [productId] } : {};
    for await (const product of this.stripeHelper.stripe.products.list(
      params
    )) {
      try {
        const productConfig = this.stripeProductToProductConfig(product);
        // We need a productConfigId to store a planConfig. For a new
        // productConfig, this requires storing the new object with locales = {}
        // to get an id and updating it after we've iterated through the Stripe
        // Plans.
        let productConfigId =
          await this.paymentConfigManager.getDocumentIdByStripeId(product.id);
        if (isDryRun) {
          // We'll log the full productConfig with `locales` updated further down
        } else {
          productConfigId = await this.paymentConfigManager.storeProductConfig(
            productConfig,
            productConfigId
          );
        }
        for await (const plan of this.stripeHelper.stripe.plans.list({
          product: product.id,
        })) {
          this.stripePlanLocalesToProductConfigLocales(plan);
          productConfig.locales = {
            ...productConfig.locales,
            ...this.stripePlanLocalesToProductConfigLocales(plan),
          };
          try {
            const planConfig = this.stripePlanToPlanConfig(plan);
            // If a planConfig doc already exists, update it rather than creating
            // a new doc
            const existingPlanConfigId =
              await this.paymentConfigManager.getDocumentIdByStripeId(plan.id);
            if (isDryRun) {
              this.log.debug(
                'StripeProductsAndPlansConverter.dryRun.convertPlanSuccess',
                {
                  stripePlanId: plan.id,
                  planConfig,
                }
              );
            } else {
              const planConfigId =
                await this.paymentConfigManager.storePlanConfig(
                  planConfig,
                  productConfigId as string,
                  existingPlanConfigId
                );
              this.log.debug(
                'StripeProductsAndPlansConverter.convertPlanSuccess',
                {
                  planConfigId,
                  stripePlanId: plan.id,
                }
              );
            }
          } catch (error) {
            this.log.error('StripeProductsAndPlansConverter.convertPlanError', {
              error: error.message,
              stripePlanId: plan.id,
              stripeProductId: product.id,
            });
          }
        }
        if (isDryRun) {
          this.log.debug(
            'StripeProductsAndPlansConverter.dryRun.convertProductSuccess',
            {
              stripeProductId: product.id,
              productConfig,
            }
          );
        } else {
          // Whether just added above or not, the productConfig exists now, so update it.
          await this.paymentConfigManager.storeProductConfig(
            productConfig,
            productConfigId
          );
          this.log.debug(
            'StripeProductsAndPlansConverter.convertProductSuccess',
            {
              productConfigId,
              stripeProductId: product.id,
            }
          );
        }
      } catch (error) {
        this.log.error('StripeProductsAndPlansConverter.convertProductError', {
          error: error.message,
          stripeProductId: product.id,
        });
      }
    }
    this.paymentConfigManager.stopListeners();
  }
}
