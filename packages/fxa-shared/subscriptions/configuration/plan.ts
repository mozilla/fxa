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

export const planConfigJoiKeys = {
  productConfigId: joi.string().allow(null).allow(''),
  stripePriceId: joi.string().optional(),
  productOrder: joi.number().optional(),
  googlePlaySku: joi.array().items(joi.string()).optional(),
  appleProductId: joi.array().items(joi.string()).optional(),
};

const allKeys = {
  ...planConfigJoiKeys,
  active: joi.boolean().required(),
};

export const planConfigSchema = baseConfigSchema.keys(allKeys);
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
  googlePlaySku?: string[];
  appleProductId?: string[];

  static async validate(planConfig: PlanConfig) {
    try {
      const value = await planConfigSchema.validateAsync(planConfig, {
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
