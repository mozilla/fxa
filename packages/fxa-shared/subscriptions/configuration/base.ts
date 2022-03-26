/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import joi from 'joi';

export type CapabilityConfig = {
  [key: string]: string[];
};

const capabilitySchema = joi
  .object()
  .pattern(joi.string(), joi.array().items(joi.string()).min(1))
  .min(1);

export const UrlConfigKeys = [
  'download',
  'webIcon',
  'emailIcon',
  'termsOfService',
  'termsOfServiceDownload',
  'privacyNotice',
  'privacyNoticeDownload',
  'playStore',
  'appStore',
  'cancellationSurvey',
] as const;
type UrlConfigKeysT = typeof UrlConfigKeys;
export type UrlConfig = {
  [key in UrlConfigKeysT[number]]?: string;
};

const urlsSchema = joi.object({
  download: joi.string().uri(),
  webIcon: joi.string().uri(),
  emailIcon: joi.string().uri(),
  termsOfService: joi.string().uri(),
  termsOfServiceDownload: joi.string().uri(),
  privacyNotice: joi.string().uri(),
  privacyNoticeDownload: joi.string().uri(),
  playStore: joi.string().uri(),
  appStore: joi.string().uri(),
  cancellationSurvey: joi.string().uri(),
});

export const UiContentConfigKeys = {
  subtitle: 'subtitle',
  details: 'details',
  successActionButtonLabel: 'successActionButtonLabel',
  upgradeCTA: 'upgradeCTA',
} as const;
type UiContentConfigKeysT = typeof UiContentConfigKeys;
export type UiContentConfig = {
  [k in keyof Omit<UiContentConfigKeysT, 'details'>]?: string;
} & { details?: string[] };

const uiContentSchema = joi.object({
  subtitle: joi.string(),
  details: joi.array().items(joi.string()),
  successActionButtonLabel: joi.string(),
  upgradeCTA: joi.string(),
});

export const StyleConfigKeys = ['webIconBackground'] as const;
type StyleConfigKeysT = typeof StyleConfigKeys;
export type StyleConfig = {
  [key in StyleConfigKeysT[number]]?: string;
};

const stylesSchema = joi.object({
  webIconBackground: joi.string(),
});

export const SupportConfigKeys = ['app'] as const;
type SupportConfigKeysT = typeof SupportConfigKeys;
export type SupportConfig = {
  [key in SupportConfigKeysT[number]]?: string[];
};

const supportSchema = joi.object({
  app: joi.array().items(joi.string()),
});

/**
 * Base config class that has common components both Products and Plans
 * can extend from.
 */
export interface BaseConfig {
  active: boolean;
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
}

export const minimalConfigSchema = joi.object({
  id: joi.string().optional().allow(null).allow(''),
  productSet: joi.string().optional().allow(null).allow(''),
  urls: urlsSchema,
  uiContent: uiContentSchema,
  styles: stylesSchema,
  locales: joi.object({}).pattern(
    joi.string(),
    joi.object({
      uiContent: uiContentSchema,
      urls: urlsSchema,
      support: supportSchema,
    })
  ),
  support: supportSchema,
});

export const baseConfigSchema = minimalConfigSchema
  .keys({
    active: joi.boolean().required(),
    promotionCodes: joi.array().items(joi.string()),
    capabilities: capabilitySchema,
  })
  .required();
