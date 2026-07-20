/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { z } from 'zod';

/**
 * Zod schema for the price information attached to each subscription.
 */
export const priceInfoSchema = z.object({
  amount: z
    .number()
    .nullable()
    .describe('Price amount in minor units (e.g. cents), or null if free'),
  currency: z
    .string()
    .nullable()
    .describe('ISO 4217 currency code (e.g. "usd"), or null if free'),
  interval: z.string().describe('Billing interval unit (e.g. "month", "year")'),
  interval_count: z.number().describe('Number of intervals between billings'),
});

/**
 * Price information attached to each subscription.
 */
export type PriceInfo = z.infer<typeof priceInfoSchema>;

/**
 * Zod schema for a Stripe web subscription.
 */
export const webSubscriptionSchema = z.object({
  _subscription_type: z
    .literal('web')
    .describe('Discriminator for Stripe web subscriptions'),
  created: z
    .number()
    .describe('Unix timestamp when the subscription was created'),
  current_period_end: z
    .number()
    .describe('Unix timestamp when the current billing period ends'),
  current_period_start: z
    .number()
    .describe('Unix timestamp when the current billing period started'),
  cancel_at_period_end: z
    .boolean()
    .describe(
      'Whether the subscription will cancel at the end of the current period'
    ),
  end_at: z
    .number()
    .nullable()
    .describe(
      'Unix timestamp when the subscription ended, or null if still active'
    ),
  plan_id: z.string().describe('Stripe price/plan identifier'),
  product_id: z.string().describe('Stripe product identifier'),
  priceInfo: priceInfoSchema,
  status: z
    .string()
    .describe(
      'Stripe subscription status (e.g. "active", "canceled", "past_due")'
    ),
  subscription_id: z.string().describe('Stripe subscription identifier'),
});

/**
 * A Stripe web subscription.
 */
export type WebSubscription = z.infer<typeof webSubscriptionSchema>;

/**
 * Zod schema for a Google Play (IAP) subscription.
 */
export const googleIapSubscriptionSchema = z.object({
  _subscription_type: z
    .literal('iap_google')
    .describe('Discriminator for Google Play IAP subscriptions'),
  auto_renewing: z
    .boolean()
    .describe('Whether the subscription is set to auto-renew'),
  cancel_reason: z
    .number()
    .optional()
    .describe('Google Play cancel reason code, if canceled'),
  expiry_time_millis: z
    .number()
    .describe('Expiration time in milliseconds since epoch'),
  package_name: z.string().describe('Android app package name'),
  sku: z.string().describe('Google Play SKU identifier'),
  price_id: z.string().describe('Internal price identifier'),
  product_id: z.string().describe('Internal product identifier'),
  product_name: z.string().describe('Human-readable product name'),
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
  _subscription_type: z
    .literal('iap_apple')
    .describe('Discriminator for Apple App Store IAP subscriptions'),
  app_store_product_id: z
    .string()
    .describe('Apple App Store product identifier'),
  auto_renewing: z
    .boolean()
    .describe('Whether the subscription is set to auto-renew'),
  bundle_id: z.string().describe('iOS app bundle identifier'),
  expiry_time_millis: z
    .number()
    .optional()
    .describe('Expiration time in milliseconds since epoch'),
  is_in_billing_retry_period: z
    .boolean()
    .optional()
    .describe('Whether Apple is retrying a failed billing attempt'),
  price_id: z.string().describe('Internal price identifier'),
  product_id: z.string().describe('Internal product identifier'),
  product_name: z.string().describe('Human-readable product name'),
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
  billing_name: z
    .string()
    .nullable()
    .optional()
    .describe('Name on the payment method, or null/absent if not available'),
  exp_month: z.number().optional().describe('Card expiration month (1-12)'),
  exp_year: z.number().optional().describe('Card expiration year (e.g. 2026)'),
  last4: z.string().optional().describe('Last four digits of the card number'),
  payment_provider: z
    .string()
    .optional()
    .describe('Payment provider (e.g. "stripe", "paypal")'),
  payment_type: z
    .string()
    .optional()
    .describe('Payment method type (e.g. "credit", "debit")'),
  paypal_payment_error: z
    .string()
    .optional()
    .describe('PayPal billing agreement error, if any'),
  brand: z
    .string()
    .optional()
    .describe('Card brand (e.g. "visa", "mastercard")'),
  subscriptions: z
    .array(subscriptionSchema)
    .describe('All active subscriptions across web, Google IAP, and Apple IAP'),
});

/**
 * Response from GET /v1/billing-and-subscriptions.
 */
export type BillingAndSubscriptionsResponse = z.infer<
  typeof billingAndSubscriptionsResponseSchema
>;
