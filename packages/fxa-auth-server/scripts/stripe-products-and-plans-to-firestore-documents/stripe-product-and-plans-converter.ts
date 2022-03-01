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
import {
  PlanConfig,
  planConfigSchema,
} from '../../lib/payments/configuration/plan';
import { ProductConfig } from '../../lib/payments/configuration/product';
import { commaSeparatedListToArray } from '../../lib/payments/utils';
import { StripeHelper } from '../../lib/payments/stripe';

/**
 * TODO: write JSDOC
 * Handles conversion and updates of Stripe metadata into Firestore documents.
 * Documents could already exist and just need updating.
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
  capabilitiesMetadataToCapabilityConfig(
    stripeObject: Stripe.Product | Stripe.Plan
  ): CapabilityConfig {
    const capabilities: CapabilityConfig = {};
    for (const oldKey of Object.keys(stripeObject.metadata!).filter((key) =>
      key.toLowerCase().startsWith('capabilities')
    )) {
      // Parse the key to determine if it's an "all RP" or single RP capability
      const [_, clientId] = oldKey.split(':');
      const newKey = clientId ?? '*';
      capabilities[newKey] = commaSeparatedListToArray(
        stripeObject.metadata![oldKey]
      );
    }
    return capabilities;
  }

  // TODO JSDoc
  stylesMetadataToStyleConfig(
    stripeObject: Stripe.Product | Stripe.Plan
  ): StyleConfig {
    const styleConfig: StyleConfig = {};
    for (const key of StyleConfigKeys) {
      const value = stripeObject.metadata![key];
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
    const { id, productSet, promotionCodes } = product.metadata;
    productConfig.stripeProductId = id;
    if (productSet) {
      productConfig.productSet = productSet;
    }
    if (promotionCodes) {
      productConfig.promotionCodes = commaSeparatedListToArray(promotionCodes);
    }
    return productConfig;
  }

  // TODO: JSDoc
  // TODO: #12053: Improve heuristics
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
    locales[localeStr] = {
      uiContent,
      urls,
      support,
    };
    return locales;
  }

  // TODO JSDoc
  stripePlanToPlanConfig(plan: Stripe.Plan): PlanConfig {
    // Firestore cannot serialize class instances
    const planConfig: any = {};

    planConfig.active = plan.active;

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
    // @ts-ignore `includes` isn't allowing SearchElement to be any string
    if (metadataKeys.some((key) => StyleConfigKeys.includes(key))) {
      planConfig.styles = this.stylesMetadataToStyleConfig(plan);
    }
    if (metadataKeys.some((key) => key.toLowerCase().startsWith('support'))) {
      planConfig.support = this.supportMetadataToSupportConfig(plan);
    }
    // TODO Do we need `locales` on the planConfig, since they'll exist on productConfig?

    // Extended by PlanConfig
    const { id, productOrder, googlePlaySku, appleProductId } = plan.metadata;
    planConfig.stripePriceId = id;
    if (productOrder) {
      planConfig.productOrder = productOrder;
    }
    if (googlePlaySku) {
      planConfig.googlePlaySku = commaSeparatedListToArray(googlePlaySku);
    }
    if (appleProductId) {
      planConfig.appleProductId = commaSeparatedListToArray(appleProductId);
    }
    return planConfig;
  }

  // TODO: Better method name and JSDoc
  /**
   * For each Stripe Product (only the product with `productId` else all products)
   *  - Initialize an empty object to represent a productConfig Firestore doc
   *  - Copy any product metadata to the productConfig
   *  - Check if a document already exists for this Stripe product ID and get its doc ID
   *  - For each Stripe Plan
   *    - Copy any plan locale metadata to productConfig.locales
   *    - Initialize an empty object to represent a planConfig Firestore doc
   *    - Copy any other plan metadata to the planConfig
   *    - Check if a document already exists for this Stripe plan ID and get its doc ID
   *    - Update or add the planConfig into the PlanConfig collection in Firestore
   *  - Update or add the productConfig into the ProductConfig collection in Firestore
   */
  async convert({
    productId,
    isDryRun,
  }: {
    productId: string;
    isDryRun: boolean;
  }): Promise<void> {
    this.log.info('StripeProductsAndPlansConverter.convertBegin', {
      productId,
      isDryRun,
    });
    await this.paymentConfigManager.load();
    this.paymentConfigManager.startListeners();
    const params = productId ? { ids: [productId] } : {};
    for await (const product of this.stripeHelper.stripe.products.list(
      params
    )) {
      const productConfig = this.stripeProductToProductConfig(product);
      // We need a productConfigId to store a planConfig; this may require
      // storing a new productConfig with `locales: {}` and updating it after
      // we've iterated through the Stripe Plans.
      const existingProductConfigId =
        await this.paymentConfigManager.getDocumentIdByStripeId(product.id);
      let productConfigId;
      if (existingProductConfigId) {
        productConfigId = existingProductConfigId;
      } else {
        productConfigId = await this.paymentConfigManager.storeProductConfig(
          productConfig
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
        const planConfig = this.stripePlanToPlanConfig(plan);
        // If a planConfig doc already exists, update it rather than creating
        // a new doc
        const existingPlanConfigId =
          await this.paymentConfigManager.getDocumentIdByStripeId(plan.id);
        const planConfigId = existingPlanConfigId
          ? await this.paymentConfigManager.storePlanConfig(
              planConfig,
              productConfigId,
              existingPlanConfigId
            )
          : await this.paymentConfigManager.storePlanConfig(
              planConfig,
              productConfigId
            );
        this.log.info('StripeProductsAndPlansConverter.convertPlanSuccess', {
          planConfigId,
          planId: plan.id,
        });
        break; // TODO remove after I get it to work for the first plan
      }
      // Whether just added above or not, the productConfig exists now, so update it.
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
    this.paymentConfigManager.stopListeners();
  }
}
