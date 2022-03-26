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
} from './base';

export const productConfigJoiKeys = {
  stripeProductId: joi.string().optional(),
  productSet: joi.string().optional(),
  promotionCodes: joi.array().items(joi.string()).optional(),
};

const allKeys = {
  ...productConfigJoiKeys,
  capabilities: joi.object().required(),
  locales: joi.object().required(),
  styles: joi.object().required(),
  support: joi.object().required(),
  uiContent: joi
    .object({
      subtitle: joi.string(),
      details: joi.array().items(joi.string()),
      successActionButtonLabel: joi.string(),
      upgradeCTA: joi.string(),
    })
    .required(),
  urls: joi
    .object({
      download: joi.string().uri().required(),
      privacyNotice: joi.string().uri().required(),
      termsOfService: joi.string().uri().required(),
      termsOfServiceDownload: joi.string().uri().required(),
      webIcon: joi.string().uri().required(),
      emailIcon: joi.string().uri().optional(),
    })
    .required(),
};

export const productConfigSchema = baseConfigSchema.keys(allKeys);

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

  static async validate(productConfig: ProductConfig) {
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
