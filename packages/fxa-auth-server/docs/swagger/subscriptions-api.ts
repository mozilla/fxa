/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import dedent from 'dedent';
import TAGS from './swagger-tags';

const TAGS_SUBSCRIPTIONS = {
  tags: TAGS.SUBSCRIPTIONS,
};

const OAUTH_SUBSCRIPTIONS_IAP_PLANS_APPNAME_GET = {
  ...TAGS_SUBSCRIPTIONS,
  description: '/oauth/subscriptions/iap/plans/{appName}',
  notes: ['Returns available plans for In-App Purchase clients.'],
};

const OAUTH_SUBSCRIPTIONS_IAP_PLAYTOKEN_APPNAME_POST = {
  ...TAGS_SUBSCRIPTIONS,
  description: '/oauth/subscriptions/iap/play-token/{appName}',
  notes: [
    dedent`
      🔒 Authenticated with OAuth bearer token

      Validate and store a Play Store Puchase Token for the given user. Returns token validity.
    `,
  ],
};

const OAUTH_SUBSCRIPTIONS_IAP_APP_STORE_TRANSACTION_POST = {
  ...TAGS_SUBSCRIPTIONS,
  description: '/oauth/subscriptions/iap/app-store-transaction/{appName}',
  notes: [
    dedent`
      🔒 authenticated with OAuth bearer token

      Validate and store an App Store Original Transaction ID for the given user. Returns token validity.
    `,
  ],
};

const OAUTH_SUBSCRIPTIONS_IAP_APP_STORE_NOTIFICATION_POST = {
  ...TAGS_SUBSCRIPTIONS,
  description: '/oauth/subscriptions/iap/app-store-notification',
  notes: [
    dedent`
      🔒 payload validated against Apple certificates

      Update stored purchase information with latest subscription status.
    `,
  ],
};

const OAUTH_SUBSCRIPTIONS_PLANS_GET = {
  ...TAGS_SUBSCRIPTIONS,
  description: '/oauth/subscriptions/plans',
  notes: ['Returns a list of available subscription plans.'],
};

const OAUTH_SUBSCRIPTIONS_ACTIVE_GET = {
  ...TAGS_SUBSCRIPTIONS,
  description: '/oauth/subscriptions/active',
  notes: [
    dedent`
      🔒 Authenticated with OAuth bearer token

      Returns a list of active subscriptions for the user.
    `,
  ],
};

const OAUTH_SUBSCRIPTIONS_CUSTOMER_POST = {
  ...TAGS_SUBSCRIPTIONS,
  description: '/oauth/subscriptions/customer',
  notes: [
    dedent`
      🔒 Authenticated with OAuth bearer token

      Create a new customer object for use with subscription payments.
    `,
  ],
};

const OAUTH_SUBSCRIPTIONS_ACTIVE_NEW_POST = {
  ...TAGS_SUBSCRIPTIONS,
  description: '/oauth/subscriptions/active/new',
  notes: [
    dedent`
      🔒 Authenticated with OAuth bearer token

      Subscribe the user to a price using a payment method id.
    `,
  ],
};

const OAUTH_SUBSCRIPTIONS_INVOICE_RETRY_POST = {
  ...TAGS_SUBSCRIPTIONS,
  description: 'oauth/subscriptions/invoice/retry',
  notes: [
    dedent`
      🔒 Authenticated with OAuth bearer token

      Retry an incomplete subscription invoice with a new payment method id.
    `,
  ],
};

const OAUTH_SUBSCRIPTIONS_SETUPINTENT_CREATE_POST = {
  ...TAGS_SUBSCRIPTIONS,
  description: '/oauth/subscriptions/setupintent/create',
  notes: [
    dedent`
      🔒 Authenticated with OAuth bearer token

      Create a new setup intent for attaching a new payment method to the user.
    `,
  ],
};

const OAUTH_SUBSCRIPTIONS_PAYMENTMETHOD_DEFAULT_POST = {
  ...TAGS_SUBSCRIPTIONS,
  description: '/oauth/subscriptions/paymentmethod/default',
  notes: [
    dedent`
      🔒 Authenticated with OAuth bearer token

      Update a user's default payment method for invoices to the attached payment method id.
    `,
  ],
};

const OAUTH_SUBSCRIPTIONS_ACTIVE_SUBSCRIPTIONID_DELETE = {
  ...TAGS_SUBSCRIPTIONS,
  description: '/oauth/subscriptions/active/{subscriptionid}',
  notes: [
    dedent`
      🔒 Authenticated with OAuth bearer token

      Cancel an active subscription for the user.
    `,
  ],
};

const OAUTH_SUBSCRIPTIONS_PAYPAL_CHECKOUT_POST = {
  ...TAGS_SUBSCRIPTIONS,
  description: '/oauth/subscriptions/paypal-checkout',
  notes: [
    'Retrieves token authorizing transaction to move to the next stage of PayPal checkout.',
  ],
};

const OAUTH_MOZILLA_SUBSCRIPTIONS_CUSTOMER_BILLING_AND_SUBSCRIPTIONS_GET = {
  ...TAGS_SUBSCRIPTIONS,
  description:
    '/oauth/mozilla-subscriptions/customer/billing-and-subscriptions',
  notes: [
    dedent`
      🔒 Authenticated with OAuth bearer token

      Returns a customer billing details and subscriptions.
    `,
  ],
};

const OAUTH_MOZILLA_SUBSCRIPTIONS_CUSTOMER_PLAN_ELIGIBILITY = {
  ...TAGS_SUBSCRIPTIONS,
  description:
    '/oauth/mozilla-subscriptions/customer/plan-eligibility/{planid}',
  notes: [
    dedent`
      🔒 Authenticated with OAuth bearer token

      Get eligibility for a given plan. Returns eligibility as 'create'|'upgrade'|'downgrade'|'blocked_iap'|'invalid'.
    `,
  ],
};

const OAUTH_SUBSCRIPTIONS_IAP_RTDN_POST = {
  ...TAGS_SUBSCRIPTIONS,
  description: '/oauth/subscriptions/iap/rtdn',
  notes: ['Handles a Google Play Real-time Developer Notification.'],
};

const OAUTH_SUBSCRIPTIONS_CLIENTS_GET = {
  ...TAGS_SUBSCRIPTIONS,
  description: '/oauth/subscriptions/clients',
  notes: [
    dedent`
      🔒 [Authenticated with OAuth bearer token](https://github.com/mozilla/fxa/blob/95cded6e96e2b20f7593153a428d158001bb8d3b/packages/fxa-shared/oauth/constants.ts#L5)

      Returns a list of clients and their capabilities.
    `,
  ],
};

const OAUTH_SUBSCRIPTIONS_INVOICE_PREVIEW_POST = {
  ...TAGS_SUBSCRIPTIONS,
  description: '/oauth/subscriptions/invoice/preview',
  notes: [
    `Previews an invoice for a new plan where the user is not yet subscribed (and therefore there is no \`subscriptionId\`); includes estimated tax (based on the user's geolocation) and any discount from a promotion code.`,
  ],
};

const OAUTH_SUBSCRIPTIONS_INVOICE_PREVIEW_SUBSEQUENT_GET = {
  ...TAGS_SUBSCRIPTIONS,
  description: '/oauth/subscriptions/invoice/preview-subsequent',
  notes: [
    dedent`
      🔒 Authenticated with OAuth bearer token

      Previews a list of subsequent invoices based on existing subscriptions and the customer's \`subscriptionId\`; includes estimated tax (based on the customer's last known geolocation) and any discount from a promotion code.
    `,
  ],
};

const OAUTH_SUBSCRIPTIONS_COUPON_POST = {
  ...TAGS_SUBSCRIPTIONS,
  description: '/oauth/subscriptions/coupon',
  notes: ['Retrieves coupon details of a valid plan and promotion code.'],
};

const OAUTH_SUBSCRIPTIONS_COUPON_APPLY_PUT = {
  ...TAGS_SUBSCRIPTIONS,
  description: '/oauth/subscriptions/coupon/apply',
  notes: ['Updates customer subscription with promotion code.'],
};

const OAUTH_SUBSCRIPTIONS_PAYMENTMETHOD_FAILED_DETACH_POST = {
  ...TAGS_SUBSCRIPTIONS,
  description: '/oauth/subscriptions/paymentmethod/failed/detach',
  notes: [
    dedent`
      🔒 Authenticated with OAuth bearer token

      Detaches a payment method from a Stripe customer without any subscriptions. This is only for Stripe customers; excludes customers using PayPal, Apple, Google, etc).
    `,
  ],
};

const OAUTH_SUBSCRIPTIONS_PRODUCTNAME_GET = {
  ...TAGS_SUBSCRIPTIONS,
  description: '/oauth/subscriptions/productname',
  notes: [
    'Returns the product name of a valid Stripe `productId` (does not apply to IAP).',
  ],
};

const OAUTH_SUBSCRIPTIONS_ACTIVE_SUBSCRIPTIONID_PUT = {
  ...TAGS_SUBSCRIPTIONS,
  description: '/oauth/subscriptions/active/{subscriptionId}',
  notes: [
    dedent`
      🔒 Authenticated with OAuth bearer token

      Updates an active subscription for Stripe customer based on their Stripe \`subscriptionId\` (does not apply to IAP).
    `,
  ],
};

const OAUTH_SUBSCRIPTIONS_REACTIVATE_POST = {
  ...TAGS_SUBSCRIPTIONS,
  description: '/oauth/subscriptions/reactivate',
  notes: [
    dedent`
      🔒 Authenticated with OAuth bearer token

      Reactivate valid Stripe/PayPal customer subscription (does not apply to IAP).
    `,
  ],
};

const OAUTH_SUBSCRIPTIONS_ACTIVE_NEW_PAYPAL_POST = {
  ...TAGS_SUBSCRIPTIONS,
  description: '/oauth/subscriptions/active/new-paypal',
  notes: ['Create subscription for the provided customer using PayPal.'],
};

const OAUTH_SUBSCRIPTIONS_PAYMENTMETHOD_BILLING_AGREEMENT_POST = {
  ...TAGS_SUBSCRIPTIONS,
  description: '/oauth/subscriptions/paymentmethod/billing-agreement',
  notes: [
    dedent`
      🔒 Authenticated with OAuth bearer token

      Updates the billing agreement for a user with a new PayPal token.
    `,
  ],
};

const OAUTH_SUBSCRIPTIONS_STRIPE_EVENT_POST = {
  ...TAGS_SUBSCRIPTIONS,
  description: '/oauth/subscriptions/stripe/event',
  notes: [
    'Handles webhook events from Stripe by pre-processing the incoming event and dispatching to the appropriate sub-handler.',
  ],
};

const OAUTH_SUPPORTPANEL_SUBSCRIPTIONS_GET = {
  ...TAGS_SUBSCRIPTIONS,
  description: '/oauth/support-panel/subscriptions',
  notes: ['This endpoint is deprecated.'],
  plugins: {
    'hapi-swagger': {
      deprecated: true,
    },
  },
};

const API_DOCS = {
  OAUTH_SUBSCRIPTIONS_ACTIVE_GET,
  OAUTH_SUBSCRIPTIONS_ACTIVE_NEW_POST,
  OAUTH_SUBSCRIPTIONS_ACTIVE_SUBSCRIPTIONID_DELETE,
  OAUTH_SUBSCRIPTIONS_CUSTOMER_POST,
  OAUTH_SUBSCRIPTIONS_IAP_APP_STORE_NOTIFICATION_POST,
  OAUTH_SUBSCRIPTIONS_IAP_APP_STORE_TRANSACTION_POST,
  OAUTH_SUBSCRIPTIONS_IAP_PLANS_APPNAME_GET,
  OAUTH_SUBSCRIPTIONS_IAP_PLAYTOKEN_APPNAME_POST,
  OAUTH_SUBSCRIPTIONS_INVOICE_RETRY_POST,
  OAUTH_SUBSCRIPTIONS_PAYMENTMETHOD_DEFAULT_POST,
  OAUTH_SUBSCRIPTIONS_PAYPAL_CHECKOUT_POST,
  OAUTH_SUBSCRIPTIONS_PLANS_GET,
  OAUTH_SUBSCRIPTIONS_SETUPINTENT_CREATE_POST,
  OAUTH_MOZILLA_SUBSCRIPTIONS_CUSTOMER_BILLING_AND_SUBSCRIPTIONS_GET,
  OAUTH_MOZILLA_SUBSCRIPTIONS_CUSTOMER_PLAN_ELIGIBILITY,
  OAUTH_SUBSCRIPTIONS_ACTIVE_NEW_PAYPAL_POST,
  OAUTH_SUBSCRIPTIONS_ACTIVE_SUBSCRIPTIONID_PUT,
  OAUTH_SUBSCRIPTIONS_CLIENTS_GET,
  OAUTH_SUBSCRIPTIONS_COUPON_POST,
  OAUTH_SUBSCRIPTIONS_COUPON_APPLY_PUT,
  OAUTH_SUBSCRIPTIONS_IAP_RTDN_POST,
  OAUTH_SUBSCRIPTIONS_INVOICE_PREVIEW_POST,
  OAUTH_SUBSCRIPTIONS_INVOICE_PREVIEW_SUBSEQUENT_GET,
  OAUTH_SUBSCRIPTIONS_PAYMENTMETHOD_BILLING_AGREEMENT_POST,
  OAUTH_SUBSCRIPTIONS_PAYMENTMETHOD_FAILED_DETACH_POST,
  OAUTH_SUBSCRIPTIONS_PRODUCTNAME_GET,
  OAUTH_SUBSCRIPTIONS_REACTIVATE_POST,
  OAUTH_SUBSCRIPTIONS_STRIPE_EVENT_POST,
  OAUTH_SUPPORTPANEL_SUBSCRIPTIONS_GET,
};

export default API_DOCS;
