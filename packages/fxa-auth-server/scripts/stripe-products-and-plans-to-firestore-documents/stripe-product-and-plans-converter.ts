/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { Logger } from 'mozlog';
import Stripe from 'stripe';
import { Container } from 'typedi';

import {
  BaseConfig,
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
import { commaSeparatedListToArray } from '../../lib/payments/configuration/utils';
import { StripeHelper } from '../../lib/payments/stripe';

/**
 * TODO: write JSDOC
 * Handles conversion and updates of Stripe metadata into Firestore documents.
 * Documents could already exist and just need updating.
 */
export class StripeProductsAndPlansConverter {
  private supportedLanguages: any;
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
    supportedLanguages: any;
  }) {
    this.log = log;
    this.stripeHelper = stripeHelper;
    this.supportedLanguages = supportedLanguages.map((l: string) =>
      l.toLowerCase()
    );
    this.paymentConfigManager = Container.get(PaymentConfigManager);
  }

  // Get all of the metadata keys that start with the prefix
  getArrayOfStringsFromMetadataKeys(
    metadata: Stripe.Product['metadata'],
    metadataKeyPrefix: string
  ): string[] {
    // Get all of the metadata keys that start with the prefix
    const metadataValues = [];
    for (const [metadataKey, metadataValue] of Object.entries(metadata)) {
      if (metadataKey.startsWith(metadataKeyPrefix)) {
        metadataValues.push(metadataValue);
      }
    }
    return metadataValues;
  }

  // TODO JSDoc
  // For each metadata key that starts with "capabilities", add it to the returned object
  // TODO Will we reuse these same methods for Plan metadata that overrides
  // product metadata? E.g. I think MDN uses capabilities on plans for product tiers.
  capabilitiesMetadataToCapabilityConfig(
    product: Stripe.Product
  ): CapabilityConfig {
    const capabilities: CapabilityConfig = {};
    for (const capability of Object.keys(product.metadata).filter((key) =>
      key.toLowerCase().startsWith('capabilities')
    )) {
      capabilities[capability] = commaSeparatedListToArray(
        product.metadata[capability]
      );
    }
    return capabilities;
  }

  // TODO JSDoc
  stylesMetadataToStyleConfig(product: Stripe.Product): StyleConfig {
    const styleConfig: StyleConfig = {};
    for (const key of StyleConfigKeys) {
      const value = product.metadata[key];
      if (value) {
        styleConfig[key] = value;
      }
    }
    return styleConfig;
  }

  // TODO JSDoc
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

  // TODO JSDoc
  uiContentMetadataToUiContentConfig(
    stripeObject: Stripe.Product | Stripe.Plan
  ): UiContentConfig {
    const uiContentConfig: UiContentConfig = {};
    if (!stripeObject.metadata) {
      return uiContentConfig;
    }
    for (const key of UiContentConfigKeys) {
      let value;
      // TODO: How to filter keys by type (e.g. `string` versus `string[]`);
      // should `details` have a sub-subtype? Would that even help?
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
        uiContentConfig[key] = value;
      }
    }
    return uiContentConfig;
  }

  // TODO JSDoc
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

  // TODO JSDoc
  // This method will return a valid ProductConfig, but it will need to be
  // appended with any locale data for Stripe plans if present.
  stripeProductToProductConfig(product: Stripe.Product): ProductConfig {
    // Firestore cannot serialize class instances
    const productConfig: any = {};

    // BaseConfig
    productConfig.active = product.active;
    productConfig.capabilities =
      this.capabilitiesMetadataToCapabilityConfig(product);
    // `locales` will be populated once we iterate through the Stripe Plans
    productConfig.locales = {};
    productConfig.styles = this.stylesMetadataToStyleConfig(product);
    productConfig.support = this.supportMetadataToSupportConfig(product);
    productConfig.uiContent = this.uiContentMetadataToUiContentConfig(product);
    productConfig.urls = this.urlMetadataToUrlConfig(product);

    // Extended by ProductConfig
    if (product.id) {
      productConfig.stripeProductId = product.id;
    }
    if (product.metadata.productSet) {
      productConfig.productSet = product.metadata.productSet;
    }
    if (product.metadata.promotionCodes) {
      productConfig.promotionCodes = commaSeparatedListToArray(
        product.metadata.promotionCodes
      );
    }
    return productConfig;
  }

  findLocaleStringFromStripePlan(plan: Stripe.Plan): null | string {
    // Try to extract a locale from the plan nickname
    const { nickname } = plan;
    let locale = nickname
      ?.split(' ')
      .filter((w) => this.supportedLanguages.includes(w.toLowerCase()));
    if (locale && locale.length > 0) {
      return locale[0];
    }
    // Failing that, try to ascertain the language of any localized strings
    //  - Use Google Translate Client https://cloud.google.com/translate/docs/samples/translate-v3-detect-language#translate_v3_detect_language-nodejs
    // If the locale is not valid, throw an error
    // Return the locale
    return null;
  }

  // Extract any locale data from a Stripe plan and convert it to ProductConfig.locales
  stripePlanLocalesToProductConfigLocales(
    plan: Stripe.Plan
  ): ProductConfig['locales'] {
    const locales: ProductConfig['locales'] = {};
    const localeStr = this.findLocaleStringFromStripePlan(plan);
    if (!localeStr) {
      return locales;
    }
    const uiContent = this.uiContentMetadataToUiContentConfig(plan);
    const urls = this.urlMetadataToUrlConfig(plan);
    const support = this.supportMetadataToSupportConfig(plan);
    const locale: ProductConfig['locales'][string] = {
      uiContent,
      urls,
      support,
    };
    locales[localeStr] = locale;
    return locales;
  }

  // TODO JSDoc
  stripePlanToPlanConfig(plan: Stripe.Plan): PlanConfig {}

  // TODO: Better method name and JSDoc
  /**
   * For each Stripe Product (only the product with productId else all products)
   *  - Initialize an empty object to represent a productConfig Firestore doc
   *  - Copy any product metadata to the productConfig
   *  - For each Stripe Plan
   *    - Copy any plan locale metadata to productConfig.locales
   *      - If the plan does not have a valid locale (language-region or language only), throw an error.
   *    - Initialize an empty object to represent a planConfig Firestore doc
   *    - Copy any other plan metadata to the planConfig
   *    - Insert the planConfig into the PlanConfig collection in Firestore
   *  - Insert the productConfig into the ProductConfig collection in Firestore
   */
  async convert({
    productId,
    isDryRun,
    delay,
  }: {
    productId: string;
    isDryRun: boolean;
    delay: number;
  }): Promise<void> {
    this.log.info('StripeProductsAndPlansConverter.convertBegin', {
      productId,
      isDryRun,
      delay,
    });
    const params = productId ? { ids: [productId] } : {};
    for await (const product of this.stripeHelper.stripe.products.list(
      params
    )) {
      const productConfig = this.stripeProductToProductConfig(product);
      // TODO: How do I obtain a productConfigId for an existing productConfig
      // document when I re-run this script to update an existing productConfig?
      const productConfigId =
        await this.paymentConfigManager.storeProductConfig(productConfig);
      this.log.info(
        'StripeProductsAndPlansConverter.convertProductNoLocalesSuccess',
        {
          productConfigId,
          productId: product.id,
        }
      );
      for await (const plan of this.stripeHelper.stripe.plans.list({
        product: product.id,
      })) {
        this.stripePlanLocalesToProductConfigLocales(plan);
        productConfig.locales = {
          ...productConfig.locales,
          ...this.stripePlanLocalesToProductConfigLocales(plan),
        };
        const planConfig = this.stripePlanToPlanConfig(plan);
        // TODO: How do I obtain a planConfigId for an existing planConfig
        // document when I re-run this script to update an existing planConfig?
        const planConfigId = await this.paymentConfigManager.storePlanConfig(
          planConfig,
          productConfigId
        );
        this.log.info('StripeProductsAndPlansConverter.convertPlanSuccess', {
          planConfigId,
          planId: plan.id,
        });
        break; // TODO remove after I get it to work for the first plan
      }
      await this.paymentConfigManager.storeProductConfig(
        productConfig,
        productConfigId
      );
      // TODO: Put an error statement on failure to convert or insert errors
      this.log.info('StripeProductsAndPlansConverter.convertProductSuccess', {
        productConfigId,
        productId: product.id,
      });
    }
  }
}
