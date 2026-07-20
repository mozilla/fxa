/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { z } from 'zod';

/**
 * Zod schema for the price information attached to each subscription.
 */
export const priceInfoSchema = z.object({
  amount: z.number().nullable(),
  currency: z.string().nullable(),
  interval: z.string(),
  interval_count: z.number(),
});

/**
 * Price information attached to each subscription.
 */
export type PriceInfo = z.infer<typeof priceInfoSchema>;

/**
 * Zod schema for a Stripe web subscription.
 */
export const webSubscriptionSchema = z.object({
  _subscription_type: z.literal('web'),
  created: z.number(),
  current_period_end: z.number(),
  current_period_start: z.number(),
  cancel_at_period_end: z.boolean(),
  end_at: z.number().nullable(),
  plan_id: z.string(),
  product_id: z.string(),
  priceInfo: priceInfoSchema,
  status: z.string(),
  subscription_id: z.string(),
});

/**
 * A Stripe web subscription.
 */
export type WebSubscription = z.infer<typeof webSubscriptionSchema>;

/**
 * Zod schema for a Google Play (IAP) subscription.
 */
export const googleIapSubscriptionSchema = z.object({
  _subscription_type: z.literal('iap_google'),
  auto_renewing: z.boolean(),
  cancel_reason: z.number().optional(),
  expiry_time_millis: z.number(),
  package_name: z.string(),
  sku: z.string(),
  price_id: z.string(),
  product_id: z.string(),
  product_name: z.string(),
  priceInfo: priceInfoSchema,
});

/**
 * A Google Play (IAP) subscription.
 */
export type GoogleIapSubscription = z.infer<typeof googleIapSubscriptionSchema>;

/**
 * Zod schema for an Apple App Store (IAP) subscription.
 */
export const appleIapSubscriptionSchema = z.object({
  _subscription_type: z.literal('iap_apple'),
  app_store_product_id: z.string(),
  auto_renewing: z.boolean(),
  bundle_id: z.string(),
  expiry_time_millis: z.number().optional(),
  is_in_billing_retry_period: z.boolean().optional(),
  price_id: z.string(),
  product_id: z.string(),
  product_name: z.string(),
  priceInfo: priceInfoSchema,
});

/**
 * An Apple App Store (IAP) subscription.
 */
export type AppleIapSubscription = z.infer<typeof appleIapSubscriptionSchema>;

/**
 * Zod schema for a subscription returned by the billing-and-subscriptions
 * endpoint, discriminated on `_subscription_type`.
 */
export const subscriptionSchema = z.discriminatedUnion('_subscription_type', [
  webSubscriptionSchema,
  googleIapSubscriptionSchema,
  appleIapSubscriptionSchema,
]);

/**
 * A subscription returned by the billing-and-subscriptions endpoint.
 */
export type Subscription = z.infer<typeof subscriptionSchema>;

/**
 * Zod schema for the response from GET /v1/billing-and-subscriptions.
 */
export const billingAndSubscriptionsResponseSchema = z.object({
  billing_name: z.string().nullable().optional(),
  exp_month: z.number().optional(),
  exp_year: z.number().optional(),
  last4: z.string().optional(),
  payment_provider: z.string().optional(),
  payment_type: z.string().optional(),
  paypal_payment_error: z.string().optional(),
  brand: z.string().optional(),
  subscriptions: z.array(subscriptionSchema),
});

/**
 * Response from GET /v1/billing-and-subscriptions.
 */
export type BillingAndSubscriptionsResponse = z.infer<
  typeof billingAndSubscriptionsResponseSchema
>;
