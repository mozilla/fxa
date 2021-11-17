/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {
  AbbrevPlayPurchase,
  MozillaSubscriptionTypes,
} from 'fxa-shared/subscriptions/types';

// Note that these `*.Response` interfaces are purely for access to known
// response keys and not an attempt to validate the return payloads from
// fxa-auth-db-mysql.

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

type PlaySubscription = Omit<AbbrevPlayPurchase, 'expiry_time_millis'> & {
  product_id: string;
  expiry: string;
};

export type SubscriptionResponse = {
  [MozillaSubscriptionTypes.WEB]: WebSubscription[];
  [MozillaSubscriptionTypes.IAP_GOOGLE]: PlaySubscription[];
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
