/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */
import * as iapSubscription from './dto/auth/payments/iap-subscription';
import * as invoice from './dto/auth/payments/invoice';
import * as emailHelpers from './email/helpers';
import popularDomains from './email/popularDomains.json';
import BaseGroupingRule from './experiments/base';
import featureFlags from './feature-flags';
import { localizeTimestamp } from './l10n/localizeTimestamp';
import supportedLanguages from './l10n/supportedLanguages.json';
import amplitude from './metrics/amplitude';
import flowPerformance from './metrics/flow-performance';
import navigationTimingSchema from './metrics/navigation-timing-validation';
import userAgent from './metrics/user-agent';
import scopes from './oauth/scopes';
import {
  metadataFromPlan,
  productDetailsFromPlan,
} from './subscriptions/metadata';
import * as stripe from './subscriptions/stripe';
import * as subscriptions from './subscriptions/type-guards';

module.exports = {
  email: {
    helpers: emailHelpers,
    popularDomains,
  },
  experiments: {
    BaseGroupingRule,
  },
  featureFlags,
  l10n: {
    localizeTimestamp,
    supportedLanguages,
  },
  metrics: {
    amplitude,
    flowPerformance,
    navigationTimingSchema,
    userAgent,
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
