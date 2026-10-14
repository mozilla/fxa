/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */
import * as iapSubscription from './dto/auth/payments/iap-subscription';
import * as invoice from './dto/auth/payments/invoice';
import popularDomains from './email/popularDomains.json';
import express from './express';
import amplitude from './metrics/amplitude';
import scopes from './oauth/scopes';
import {
  metadataFromPlan,
  productDetailsFromPlan,
} from './subscriptions/metadata';
import * as stripe from './subscriptions/stripe';
import * as subscriptions from './subscriptions/type-guards';

module.exports = {
  email: {
    popularDomains,
  },
  express,
  metrics: {
    amplitude,
  },
  oauth: {
    scopes,
  },
  subscriptions: {
    metadata: {
      metadataFromPlan,
      productDetailsFromPlan,
    },
    stripe,
    subscriptions,
  },
  dto: {
    auth: {
      payments: {
        iapSubscription,
        invoice,
      },
    },
  },
};
