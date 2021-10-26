/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */
import popularDomains from './email/popularDomains.json';
import BaseGroupingRule from './experiments/base';
import { localizeTimestamp } from './l10n/localizeTimestamp';
import supportedLanguages from './l10n/supportedLanguages.json';
import scopes from './oauth/scopes';
import * as emailHelpers from './email/helpers';
import featureFlags from './feature-flags';
import {
  metadataFromPlan,
  productDetailsFromPlan,
} from './subscriptions/metadata';
import * as stripe from './subscriptions/stripe';

import amplitude from './metrics/amplitude';
import flowPerformance from './metrics/flow-performance';
import navigationTimingSchema from './metrics/navigation-timing-validation';
import userAgent from './metrics/user-agent';

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
  },
};
