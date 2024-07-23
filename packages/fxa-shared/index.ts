/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */
import * as iapSubscription from './dto/auth/payments/iap-subscription';
import * as invoice from './dto/auth/payments/invoice';
import * as emailHelpers from './email/helpers';
import popularDomains from './email/popularDomains.json';
import BaseGroupingRule from './experiments/base';
import express from './express';
import featureFlags from './feature-flags';
import amplitude from './metrics/amplitude';
import flowPerformance from './metrics/flow-performance';
import navigationTimingSchema from './metrics/navigation-timing-validation';
import userAgent from './lib/user-agent';
import scopes from './oauth/scopes';
import {
  metadataFromPlan,
  productDetailsFromPlan,
} from './subscriptions/metadata';
import * as stripe from './subscriptions/stripe';
import * as subscriptions from './subscriptions/type-guards';
import * as errors from './lib/errors';

module.exports = {
  email: {
    helpers: emailHelpers,
    popularDomains,
  },
  experiments: {
    BaseGroupingRule,
  },
  express,
  featureFlags,
  metrics: {
    amplitude,
    flowPerformance,
    navigationTimingSchema,
  },
  oauth: {
    scopes,
  },
  lib: {
    errors,
    userAgent,
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
