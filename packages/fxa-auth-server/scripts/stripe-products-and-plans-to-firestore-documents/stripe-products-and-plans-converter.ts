/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { STRIPE_PRICE_METADATA } from 'fxa-shared/payments/stripe';
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
} from 'fxa-shared/subscriptions/configuration/base';
import { PlanConfig } from 'fxa-shared/subscriptions/configuration/plan';
import { ProductConfig } from 'fxa-shared/subscriptions/configuration/product';
import { Logger } from 'mozlog';
import Stripe from 'stripe';
import { Container } from 'typedi';

import { PaymentConfigManager } from '../../lib/payments/configuration/manager';
import { StripeHelper } from '../../lib/payments/stripe';
import { commaSeparatedListToArray } from 'fxa-shared/lib/utils';
import {
  PLAN_EN_LANG_ERROR,
  getLanguageTagFromPlanMetadata,
} from './plan-language-tags-guesser';
import { promises as fsPromises, constants } from 'fs';
import path from 'path';

const DEFAULT_LOCALE = 'en';

export enum OutputTarget {
  Local = 'local',
  Firestore = 'firestore',
}

function isGoogleTranslationApiError(err: any) {
  return (
    err.code >= 400 &&
    err.response?.request?.href?.includes('translation.googleapis')
  );
}

async function createDir(dirPath: string) {
  try {
    // Check if the folder exists.
    // https://nodejs.dev/learn/working-with-folders-in-nodejs#check-if-a-folder-exists
    await fsPromises.access(dirPath, constants.W_OK);
  } catch (err) {
    // If folder doesn't exist, access throws error. So create folder.
    await fsPromises.mkdir(dirPath, { recursive: true });
  }
}

/**
 * Helper method to get path for current working directory
 */
function createPathForWorkingDirectory(directory: string) {
  return (name: string) => {
    return path.join(directory, `${name.toLowerCase().replace(' ', '_')}.json`);
  };
}

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
  }

  /**
   * Get all of the metadata keys that start with the prefix, and
   * concatenate them into a single list.
   * */
  getArrayOfStringsFromMetadataKeys(
    metadata: Stripe.Product['metadata'],
    metadataKeyPrefix: string
  ): string[] {
    const metadataValues = new Array<any>();
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
      const [, clientId] = oldKey.split(':');
      const newKey = clientId ?? '*';
      capabilities[newKey] = commaSeparatedListToArray(
        stripeObject.metadata[oldKey]
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
    for (const _key in UiContentConfigKeys) {
      const key = _key as keyof typeof UiContentConfigKeys;

      if (key === UiContentConfigKeys.details) {
        const metadataKeyPrefix = `product:${key}`;
        const value = this.getArrayOfStringsFromMetadataKeys(
          stripeObject.metadata,
          metadataKeyPrefix
        );
        if (value.length > 0) {
          uiContentConfig[key] = value;
        }
      } else {
        const value =
          stripeObject.metadata[key] ?? stripeObject.metadata[`product:${key}`];
        if (value) {
          uiContentConfig[key] = value;
        }
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
    productConfig.stripeProductId = product.id;
    const { productSet, promotionCodes } = product.metadata;
    if (productSet) {
      productConfig.productSet = commaSeparatedListToArray(productSet);
    }
    if (promotionCodes) {
      productConfig.promotionCodes = commaSeparatedListToArray(promotionCodes);
    }
    return productConfig;
  }

  metadataToLocalizableConfigs(stripeObject: Stripe.Product | Stripe.Plan) {
    return {
      uiContent: this.uiContentMetadataToUiContentConfig(stripeObject),
      urls: this.urlMetadataToUrlConfig(stripeObject),
      support: this.supportMetadataToSupportConfig(stripeObject),
    };
  }

  /**
   * Extract localized data from a Stripe Plan and convert it to
   * ProductConfig.locales
   */
  async stripePlanLocalesToProductConfigLocales(
    plan: Stripe.Plan
  ): Promise<ProductConfig['locales']> {
    const locales: ProductConfig['locales'] = {};
    const localeStr = await getLanguageTagFromPlanMetadata(
      plan,
      this.supportedLanguages
    );
    // These keys exist on the top level of ProductConfig for the default locale
    if (
      !localeStr ||
      localeStr.toLowerCase() === DEFAULT_LOCALE.toLowerCase()
    ) {
      return locales;
    }
    locales[localeStr] = this.metadataToLocalizableConfigs(plan);
    return locales;
  }

  /**
   * Convert a Stripe Plan to a PlanConfig object
   */
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
    if (metadataKeys.some((key) => StyleConfigKeys.includes(key as any))) {
      planConfig.styles = this.stylesMetadataToStyleConfig(plan);
    }
    if (metadataKeys.some((key) => key.toLowerCase().startsWith('support'))) {
      planConfig.support = this.supportMetadataToSupportConfig(plan);
    }

    // Extended by PlanConfig
    planConfig.stripePriceId = plan.id;
    const { productOrder, productSet } = plan.metadata;
    const playSkuIds = plan.metadata[STRIPE_PRICE_METADATA.PLAY_SKU_IDS];
    const appStoreProductIds =
      plan.metadata[STRIPE_PRICE_METADATA.APP_STORE_PRODUCT_IDS];
    if (productOrder) {
      planConfig.productOrder = parseInt(productOrder);
    }
    if (productSet) {
      planConfig.productSet = commaSeparatedListToArray(productSet);
    }
    if (playSkuIds) {
      planConfig[STRIPE_PRICE_METADATA.PLAY_SKU_IDS] =
        commaSeparatedListToArray(playSkuIds);
    }
    if (appStoreProductIds) {
      planConfig[STRIPE_PRICE_METADATA.APP_STORE_PRODUCT_IDS] =
        commaSeparatedListToArray(appStoreProductIds);
    }
    return planConfig;
  }

  /**
   * Validate the ProductConfig object, and if its valid write the object to JSON.
   */
  async writeToFileProductConfig(
    productConfig: ProductConfig,
    existingProductConfigId: string | null,
    productConfigPath: string,
    withLog = true
  ) {
    await this.paymentConfigManager.validateProductConfig(productConfig);
    await fsPromises.writeFile(
      productConfigPath,
      JSON.stringify(
        {
          ...productConfig,
          id: existingProductConfigId,
        },
        null,
        2
      )
    );
    if (withLog) {
      this.log.debug(
        'StripeProductsAndPlansConverter.writeToFileProductSuccess',
        {
          productConfigPath,
        }
      );
    }
  }

  /**
   * Validate the PlanConfig object, and if its valid write the object to JSON.
   */
  async writeToFilePlanConfig(
    planConfig: PlanConfig,
    productConfigId: string,
    existingPlanConfigId: string | null,
    planConfigPath: string
  ) {
    await this.paymentConfigManager.validatePlanConfig(
      planConfig,
      productConfigId
    );
    await fsPromises.writeFile(
      planConfigPath,
      JSON.stringify(
        {
          ...planConfig,
          id: existingPlanConfigId,
          productConfigId,
        },
        null,
        2
      )
    );
    this.log.debug('StripeProductsAndPlansConverter.writeToFilePlanSuccess', {
      planConfigPath,
    });
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
    target,
    targetDir,
  }: {
    productId: string;
    isDryRun: boolean;
    target: OutputTarget;
    targetDir: string;
  }): Promise<void> {
    this.log.debug('StripeProductsAndPlansConverter.convertBegin', {
      productId,
      isDryRun,
      target,
      targetDir: target === 'local' ? targetDir : undefined,
    });
    const params = productId ? { ids: [productId] } : {};

    for await (const product of this.stripeHelper.stripe.products.list(
      params
    )) {
      const currentDirectory = path.join(
        targetDir,
        product.name.toLowerCase().replace(' ', '_')
      );
      const getFilePath = createPathForWorkingDirectory(currentDirectory);

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
          if (target === OutputTarget.Firestore) {
            productConfigId =
              await this.paymentConfigManager.storeProductConfig(
                productConfig,
                productConfigId
              );
          } else if (target === OutputTarget.Local) {
            // Create the folder here.
            await createDir(currentDirectory);
            await this.writeToFileProductConfig(
              productConfig,
              productConfigId,
              getFilePath(`prod_${product.name}`),
              false
            );
          }
        }
        for await (const plan of this.stripeHelper.stripe.plans.list({
          product: product.id,
        })) {
          let planEnLocale;

          try {
            productConfig.locales = {
              ...productConfig.locales,
              ...(await this.stripePlanLocalesToProductConfigLocales(plan)),
            };
          } catch (err) {
            if (err.message === PLAN_EN_LANG_ERROR) {
              planEnLocale = {
                [DEFAULT_LOCALE]: this.metadataToLocalizableConfigs(plan),
              };
            } else if (isGoogleTranslationApiError(err)) {
              throw err;
            } else {
              this.log.error(
                'StripeProductsAndPlansConverter.guessLanguageError',
                {
                  error: err.message,
                  stripePlanId: plan.id,
                  stripeProductId: product.id,
                }
              );
            }
          }

          try {
            const planConfig = this.stripePlanToPlanConfig(plan);
            if (planEnLocale) {
              planConfig.locales = planEnLocale;
            }
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
              if (target === OutputTarget.Firestore) {
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
              } else if (target === OutputTarget.Local) {
                await this.writeToFilePlanConfig(
                  planConfig,
                  productConfigId as string,
                  existingPlanConfigId,
                  getFilePath(
                    `plan_${plan.currency}_${plan.interval}_${
                      plan.interval_count
                    }_${plan.amount ?? 'none'}`
                  )
                );
              }
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
          if (target === OutputTarget.Firestore) {
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
          } else if (target === OutputTarget.Local) {
            await this.writeToFileProductConfig(
              productConfig,
              productConfigId,
              getFilePath(`prod_${product.name}`)
            );
          }
        }
      } catch (error) {
        if (isGoogleTranslationApiError(error)) {
          throw new Error(`Google Translation API error: ${error.message}`);
        }

        this.log.error('StripeProductsAndPlansConverter.convertProductError', {
          error: error.message,
          stripeProductId: product.id,
        });
      }
    }
    this.paymentConfigManager.stopListeners();
  }
}
