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
  description: '🔒 oauthToken',
  notes: [
    dedent`
      🔒 authenticated with OAuth bearer token

      Validate and store an App Store Original Transaction ID for the given user. Returns token validity.
    `,
  ],
};

const OAUTH_SUBSCRIPTIONS_IAP_APP_STORE_NOTIFICATION_POST = {
  ...TAGS_SUBSCRIPTIONS,
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
  notes: [
    dedent`
      🔒 Authenticated with OAuth bearer token

      Returns a list of available subscription plans.
    `,
  ],
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
};

const OAUTH_MOZILLA_SUBSCRIPTIONS_CUSTOMER_BILLING_AND_SUBSCRIPTIONS_GET = {
  ...TAGS_SUBSCRIPTIONS,
  description:
    '/oauth/mozilla-subscriptions/customer/billing-and-subscriptions',
  notes: ['🔒 Authenticated with OAuth bearer token'],
};

const OAUTH_SUBSCRIPTIONS_IAP_RTDN_POST = {
  ...TAGS_SUBSCRIPTIONS,
  description: '/oauth/subscriptions/iap/rtdn',
};

const OAUTH_SUBSCRIPTIONS_CLIENTS_GET = {
  ...TAGS_SUBSCRIPTIONS,
  description: '/oauth/subscriptions/clients',
};

const OAUTH_SUBSCRIPTIONS_INVOICE_PREVIEW_POST = {
  ...TAGS_SUBSCRIPTIONS,
  description: '/oauth/subscriptions/invoice/preview',
};

const OAUTH_SUBSCRIPTIONS_INVOICE_PREVIEW_SUBSEQUENT_GET = {
  ...TAGS_SUBSCRIPTIONS,
  description: '/oauth/subscriptions/invoice/preview-subsequent',
};

const OAUTH_SUBSCRIPTIONS_COUPON_POST = {
  ...TAGS_SUBSCRIPTIONS,
  description: '/oauth/subscriptions/coupon',
};

const OAUTH_SUBSCRIPTIONS_PAYMENTMETHOD_FAILED_DETACH_POST = {
  ...TAGS_SUBSCRIPTIONS,
  description: '/oauth/subscriptions/paymentmethod/failed/detach',
  notes: ['🔒 Authenticated with OAuth bearer token'],
};

const OAUTH_SUBSCRIPTIONS_PRODUCTNAME_GET = {
  ...TAGS_SUBSCRIPTIONS,
  description: '/oauth/subscriptions/productname',
};

const OAUTH_SUBSCRIPTIONS_ACTIVE_SUBSCRIPTIONID_PUT = {
  ...TAGS_SUBSCRIPTIONS,
  description: '/oauth/subscriptions/active/{subscriptionId}',
  notes: ['🔒 Authenticated with OAuth bearer token'],
};

const OAUTH_SUBSCRIPTIONS_REACTIVATE_POST = {
  ...TAGS_SUBSCRIPTIONS,
  description: '/oauth/subscriptions/reactivate',
  notes: ['🔒 Authenticated with OAuth bearer token'],
};

const OAUTH_SUBSCRIPTIONS_ACTIVE_NEW_PAYPAL_POST = {
  ...TAGS_SUBSCRIPTIONS,
  description: '/oauth/subscriptions/active/new-paypal',
};

const OAUTH_SUBSCRIPTIONS_PAYMENTMETHOD_BILLING_AGREEMENT_POST = {
  ...TAGS_SUBSCRIPTIONS,
  description: '/oauth/subscriptions/paymentmethod/billing-agreement',
  notes: ['🔒 Authenticated with OAuth bearer token'],
};

const OAUTH_SUBSCRIPTIONS_STRIPE_EVENT_POST = {
  ...TAGS_SUBSCRIPTIONS,
  description: '/oauth/subscriptions/stripe/event',
};

const OAUTH_SUPPORTPANEL_SUBSCRIPTIONS_GET = {
  ...TAGS_SUBSCRIPTIONS,
  description: '/oauth/support-panel/subscriptions',
  notes: ['🔒 Authenticated with support panel secret'],
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
  OAUTH_SUBSCRIPTIONS_ACTIVE_NEW_PAYPAL_POST,
  OAUTH_SUBSCRIPTIONS_ACTIVE_SUBSCRIPTIONID_PUT,
  OAUTH_SUBSCRIPTIONS_CLIENTS_GET,
  OAUTH_SUBSCRIPTIONS_COUPON_POST,
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
