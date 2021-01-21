/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { ServerRoute } from '@hapi/hapi';

import { ConfigType } from '../../../config';
import { StripeHelper } from '../../payments/stripe';
import { AuthLogger } from '../../types';
import {
  stripeRoutes,
  StripeHandler,
  handleAuth,
  sanitizePlans,
} from './stripe';
import { stripeWebhookRoutes } from './stripe-webhook';

const createRoutes = (
  log: AuthLogger,
  db: any,
  config: ConfigType,
  customs: any,
  push: any,
  mailer: any,
  profile: any,
  stripeHelper: StripeHelper
) => {
  const routes: ServerRoute[] = [];

  // Skip routes if the subscriptions feature is not configured & enabled
  if (!config.subscriptions || !config.subscriptions.enabled) {
    return routes;
  }

  if (stripeHelper) {
    routes.push(
      ...stripeRoutes(
        log,
        db,
        config,
        customs,
        push,
        mailer,
        profile,
        stripeHelper
      )
    );
    routes.push(
      ...stripeWebhookRoutes(
        log,
        db,
        config,
        customs,
        push,
        mailer,
        profile,
        stripeHelper
      )
    );
  }

  return routes;
};

module.exports = createRoutes;
module.exports.DirectStripeRoutes = StripeHandler;
module.exports.handleAuth = handleAuth;
module.exports.sanitizePlans = sanitizePlans;
