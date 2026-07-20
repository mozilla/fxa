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
  OAUTH_SUBSCRIPTIONS_IAP_APP_STORE_NOTIFICATION_POST,
  OAUTH_SUBSCRIPTIONS_IAP_APP_STORE_TRANSACTION_POST,
  OAUTH_SUBSCRIPTIONS_IAP_PLANS_APPNAME_GET,
  OAUTH_SUBSCRIPTIONS_IAP_PLAYTOKEN_APPNAME_POST,
  OAUTH_MOZILLA_SUBSCRIPTIONS_CUSTOMER_BILLING_AND_SUBSCRIPTIONS_GET,
  OAUTH_SUBSCRIPTIONS_CLIENTS_GET,
  OAUTH_SUBSCRIPTIONS_IAP_RTDN_POST,
  OAUTH_SUBSCRIPTIONS_STRIPE_EVENT_POST,
  OAUTH_SUPPORTPANEL_SUBSCRIPTIONS_GET,
};

export default API_DOCS;
