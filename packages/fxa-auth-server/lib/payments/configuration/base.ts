/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import joi from '@hapi/joi';

export type CapabilityConfig = {
  [key: string]: string[];
};

const capabilitySchema = joi
  .object()
  .pattern(joi.string(), joi.array().items(joi.string()).min(1))
  .min(1);

export type UrlConfig = {
  download?: string;
  webIcon?: string;
  emailIcon?: string;
  termsOfService?: string;
  termsOfServiceDownload?: string;
  privacyNotice?: string;
  privacyNoticeDownload?: string;
  playStore?: string;
  appStore?: string;
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
});

export type UiContentConfig = {
  subtitle?: string;
  details?: string[];
  successActionButtonLabel?: string;
  upgradeCTA?: string;
};

const uiContentSchema = joi.object({
  subtitle: joi.string(),
  details: joi.array().items(joi.string()),
  successActionButtonLabel: joi.string(),
  upgradeCTA: joi.string(),
});

export type StyleConfig = {
  webIconBackground?: string;
};

const stylesSchema = joi.object({
  webIconBackground: joi.string(),
});

export type SupportConfig = {
  app?: string[];
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
}

export const baseConfigSchema = joi
  .object({
    active: joi.boolean().required(),
    promotionCodes: joi.array().items(joi.string()),
    capabilities: capabilitySchema,
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
  })
  .required();
