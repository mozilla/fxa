/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { z } from 'zod';

const intervalEnumSchema = z.enum([
  'daily',
  'weekly',
  'monthly',
  'halfyearly',
  'yearly',
]);

const churnTypeEnumSchema = z.enum(['cancel', 'stay_subscribed']);

const stripePlanChoiceSchema = z.object({
  stripePlanChoice: z.string().regex(/^(price_|plan_)/),
});

const stripeLegacyPlanSchema = z.object({
  stripeLegacyPlan: z.string().regex(/^(price_|plan_)/),
});

const stripePromotionCodeSchema = z.object({
  PromoCode: z.string().min(2),
});

const purchaseDetailSchema = z.object({
  details: z.string().min(1),
  productName: z.string().min(1),
  subtitle: z.string().nullable().optional(),
  webIcon: z.string().min(1),
});

const commonContentSchema = z.object({
  privacyNoticeUrl: z.string().min(1),
  privacyNoticeDownloadUrl: z.string().min(1),
  termsOfServiceUrl: z.string().min(1),
  termsOfServiceDownloadUrl: z.string().min(1),
  cancellationUrl: z.string().nullable().optional(),
  emailIcon: z.string().nullable().optional(),
  successActionButtonUrl: z.string().min(1),
  successActionButtonLabel: z.string().nullable().optional(),
  newsletterLabelTextCode: z.string().nullable().optional(),
  newsletterSlug: z.array(z.string()).nullable().optional(),
  supportUrl: z.string().min(1),
});

const serviceRefSchema = z.object({
  oauthClientId: z.string().min(1),
});

const capabilityRefSchema = z.object({
  slug: z.string().min(1),
  services: z.array(serviceRefSchema).min(1),
});

const purchaseRefSchema = z.object({
  purchaseDetails: purchaseDetailSchema,
  stripePlanChoices: z.array(stripePlanChoiceSchema).min(1),
});

const couponConfigRefSchema = z.object({
  internalName: z.string().min(1),
  stripePromotionCodes: z.array(stripePromotionCodeSchema).optional(),
});

const subgroupRefSchema = z.object({
  internalName: z.string().min(1),
  groupName: z.string().nullable().optional(),
});

export const offeringValidationSchema = z.object({
  apiIdentifier: z.string().min(1),
  stripeProductId: z.string().min(1),
  countries: z.array(z.string()).min(1),
  defaultPurchase: purchaseRefSchema,
  commonContent: commonContentSchema,
  capabilities: z.array(capabilityRefSchema).min(1),
  stripeLegacyPlans: z.array(stripeLegacyPlanSchema).optional(),
  couponConfig: couponConfigRefSchema.nullable().optional(),
  subGroups: z.array(subgroupRefSchema).optional(),
});

export const purchaseValidationSchema = z.object({
  internalName: z.string().min(1),
  purchaseDetails: purchaseDetailSchema,
  stripePlanChoices: z.array(stripePlanChoiceSchema).min(1),
});

export const purchaseDetailValidationSchema = purchaseDetailSchema;

export const commonContentValidationSchema = commonContentSchema;

export const capabilityValidationSchema = z.object({
  slug: z.string().min(1),
  services: z.array(serviceRefSchema).min(1),
});

export const serviceValidationSchema = z.object({
  oauthClientId: z.string().min(1),
});

export const subgroupValidationSchema = z.object({
  internalName: z.string().min(1),
  groupName: z.string().nullable().optional(),
});

export const iapValidationSchema = z.object({
  storeID: z.string().min(1),
  interval: intervalEnumSchema,
  offering: z.object({
    apiIdentifier: z.string().min(1),
  }),
});

export const churnInterventionValidationSchema = z.object({
  churnInterventionId: z.string().min(1),
  churnType: churnTypeEnumSchema,
  stripeCouponId: z.string().min(1),
  interval: intervalEnumSchema,
  discountAmount: z.number().min(1).max(100),
  ctaMessage: z.string().min(1),
  modalHeading: z.string().min(1),
  modalMessage: z.string().min(1),
  productPageUrl: z.string().min(1),
  termsHeading: z.string().min(1),
  termsDetails: z.string().min(1),
  redemptionLimit: z.number().nullable().optional(),
});

export const cancelInterstitialOfferValidationSchema = z.object({
  offeringApiIdentifier: z.string().min(1),
  currentInterval: intervalEnumSchema,
  upgradeInterval: intervalEnumSchema,
  modalHeading1: z.string().min(1),
  modalMessage: z.string().min(1),
  productPageUrl: z.string().min(1),
  upgradeButtonLabel: z.string().min(1),
  upgradeButtonUrl: z.string().min(1),
  offering: z.object({
    stripeProductId: z.string().min(1),
  }),
});

export const couponConfigValidationSchema = z.object({
  internalName: z.string().min(1),
  stripePromotionCodes: z.array(stripePromotionCodeSchema).optional(),
});

