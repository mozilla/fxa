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
  baseSchema.fork(
    [
      'capabilities',
      'locales',
      'styles',
      'support',
      'uiContent',
      'urls.successActionButton',
      'urls.privacyNotice',
      'urls.termsOfService',
      'urls.termsOfServiceDownload',
      'urls.webIcon',
      'urls',
    ],
    (schema) => schema.required()
  );

// This type defines the required fields of urls, set by function buildProductConfigSchema.
// Any change to required fields in urls, should be updated here as well.
export type ProductConfigUrlConfig = Partial<UrlConfig> & {
  successActionButton: string;
  privacyNotice: string;
  termsOfService: string;
  termsOfServiceDownload: string;
  webIcon: string;
};

// This type picks the keys of ProductConfig that can also be found in locales.
// Any change to ProductConfig.locales types should be updated here as well.
export type ProductConfigLocalesConfig = Pick<
  ProductConfig,
  'uiContent' | 'urls' | 'support'
>;

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
  urls!: ProductConfigUrlConfig;
  promotionCodes?: string[];

  // Extended by ProductConfig
  stripeProductId?: string;
  productSet?: string;

  static async validate(
    productConfig: ProductConfig,
    schemaValidation: ProductConfigSchemaValidation
  ) {
    const extendedBaseSchema = extendBaseConfigSchema(
      baseConfigSchema.keys(productConfigJoiKeys),
      schemaValidation.cdnUrlRegex
    );

    const productConfigSchema = buildProductConfigSchema(extendedBaseSchema);

    try {
      const value = await productConfigSchema.validateAsync(productConfig, {
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
