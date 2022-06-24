/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { MozillaSubscriptionTypes } from 'fxa-shared/subscriptions/types';

// Note that these `*.Response` interfaces are purely for access to known
// response keys and not an attempt to validate the return payloads from
// the database.

interface WebSubscription {
  created: string;
  current_period_end: string;
  current_period_start: string;
  plan_changed: string;
  previous_product: string;
  product_name: string;
  status: string;
  subscription_id: string;
}

type PlaySubscription = {
  auto_renewing: boolean;
  cancel_reason?: number;
  package_name: string;
  sku: string;
  product_id: string;
  expiry: string;
};

type AppStoreSubscription = {
  app_store_product_id: string;
  auto_renewing: boolean;
  bundle_id: string;
  is_in_billing_retry_period: boolean;
  product_id: string;
  expiry: string;
};

export type SubscriptionResponse = {
  [MozillaSubscriptionTypes.WEB]: WebSubscription[];
  [MozillaSubscriptionTypes.IAP_GOOGLE]: PlaySubscription[];
  [MozillaSubscriptionTypes.IAP_APPLE]: AppStoreSubscription[];
};

interface SigninLocation {
  city: string;
  state: string;
  stateCode: string;
  country: string;
  countryCode: string;
  lastAccessTime: number | Date;
}

export interface SigninLocationResponse extends Array<SigninLocation> {}

export interface TotpTokenResponse {
  sharedSecret: string;
  epoch: number;
  verified: boolean;
  enabled: boolean;
}

/** SupportController configuration */
export type SupportConfig = {
  authHeader: string;
  authServer: {
    secretBearerToken: string;
    signinLocationsSearchPath: string;
    subscriptionsSearchPath: string;
    url: string;
  };
};
