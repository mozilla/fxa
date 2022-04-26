/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import joi from 'joi';

import {
  BaseConfig,
  baseConfigSchema,
  CapabilityConfig,
  StyleConfig,
  SupportConfig,
  UiContentConfig,
  UrlConfig,
  extendBaseConfigSchema,
  ProductConfigSchemaValidation,
} from './base';

export const productConfigJoiKeys = {
  stripeProductId: joi.string().optional(),
  productSet: joi.string().optional(),
  promotionCodes: joi.array().items(joi.string()).optional(),
};

const buildProductConfigSchema = (baseSchema: joi.ObjectSchema) =>
  baseSchema
    .keys(productConfigJoiKeys)
    .requiredKeys(
      'capabilities',
      'locales',
      'styles',
      'support',
      'uiContent',
      'urls.download',
      'urls.privacyNotice',
      'urls.termsOfService',
      'urls.termsOfServiceDownload',
      'urls.webIcon',
      'urls'
    );

export class ProductConfig implements BaseConfig {
  // Firestore document id
  id!: string;

  active!: boolean;
  capabilities!: CapabilityConfig;
  locales!: {
    [key: string]: {
      uiContent?: Partial<UiContentConfig>;
      urls?: Partial<UrlConfig>;
      support?: Partial<SupportConfig>;
    };
  };
  styles!: StyleConfig;
  support!: SupportConfig;
  uiContent!: UiContentConfig;
  urls!: UrlConfig;
  promotionCodes?: string[];

  // Extended by ProductConfig
  stripeProductId?: string;
  productSet?: string;

  static async validate(
    productConfig: ProductConfig,
    schemaValidation: ProductConfigSchemaValidation
  ) {
    const extendedBaseSchema = extendBaseConfigSchema(
      baseConfigSchema,
      schemaValidation.cdnUrlRegex
    );

    const productConfigSchema = buildProductConfigSchema(extendedBaseSchema);

    try {
      const value = await joi.validate(productConfig, productConfigSchema, {
        abortEarly: false,
      });
      return { value };
    } catch (error) {
      return { error };
    }
  }

  static fromFirestoreObject(
    firestoreObject: any,
    docId: string
  ): ProductConfig {
    const productConfig = new ProductConfig();
    Object.keys(firestoreObject).map((key) => {
      // @ts-ignore
      productConfig[key] = firestoreObject[key];
    });
    productConfig.id = docId;
    return productConfig;
  }
}
