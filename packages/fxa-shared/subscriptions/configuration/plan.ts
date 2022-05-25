/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import joi from 'joi';

import { STRIPE_PRICE_METADATA } from '../../payments/stripe';
import {
  BaseConfig,
  baseConfigSchema,
  CapabilityConfig,
  extendBaseConfigSchema,
  ProductConfigSchemaValidation,
  StyleConfig,
  SupportConfig,
  UiContentConfig,
  UrlConfig,
} from './base';

export const planConfigJoiKeys = {
  productConfigId: joi.string().allow(null).allow(''),
  stripePriceId: joi.string().optional(),
  productOrder: joi.number().optional(),
  [STRIPE_PRICE_METADATA.PLAY_SKU_IDS]: joi
    .array()
    .items(joi.string())
    .optional(),
  [STRIPE_PRICE_METADATA.APP_STORE_PRODUCT_IDS]: joi
    .array()
    .items(joi.string())
    .optional(),
};

export const planConfigSchema = baseConfigSchema
  .keys(planConfigJoiKeys)
  .requiredKeys('active');

const buildPlanConfigSchema = (baseSchema: joi.ObjectSchema) =>
  baseSchema.keys(planConfigJoiKeys).requiredKeys('active');

export class PlanConfig implements BaseConfig {
  // Firestore document id
  id!: string;
  // Firestore ProductConfig document id
  productConfigId!: string;

  active!: boolean;
  capabilities?: CapabilityConfig;
  urls?: UrlConfig;
  uiContent?: UiContentConfig;
  styles?: StyleConfig;
  locales?: {
    [key: string]: {
      uiContent?: Partial<UiContentConfig>;
      urls?: Partial<UrlConfig>;
      support?: Partial<SupportConfig>;
    };
  };
  support?: SupportConfig;
  promotionCodes?: string[];

  // Extended by PlanConfig
  stripePriceId?: string;
  productSet?: string;
  productOrder?: number;
  [STRIPE_PRICE_METADATA.PLAY_SKU_IDS]?: string[];
  [STRIPE_PRICE_METADATA.APP_STORE_PRODUCT_IDS]?: string[];

  static async validate(
    planConfig: PlanConfig,
    schemaValidation: ProductConfigSchemaValidation
  ) {
    const extendedBaseSchema = extendBaseConfigSchema(
      baseConfigSchema,
      schemaValidation.cdnUrlRegex
    );

    const planConfigSchema = buildPlanConfigSchema(extendedBaseSchema);

    try {
      const value = await joi.validate(planConfig, planConfigSchema, {
        abortEarly: false,
      });
      return { value };
    } catch (error) {
      return { error };
    }
  }

  static fromFirestoreObject(firestoreObject: any, docId: string): PlanConfig {
    const planConfig = new PlanConfig();
    Object.keys(firestoreObject).map((key) => {
      // @ts-ignore
      planConfig[key] = firestoreObject[key];
    });
    planConfig.id = docId;
    return planConfig;
  }
}
