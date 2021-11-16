/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { ServerRoute } from '@hapi/hapi';
import zendesk from 'node-zendesk';

import { ConfigType } from '../../../config';
import { StripeHelper } from '../../payments/stripe';
import { AuthLogger } from '../../types';
import { googleIapRoutes } from './google';
import { paypalRoutes } from './paypal';
import { paypalNotificationRoutes } from './paypal-notifications';
import { playPubsubRoutes } from './play-pubsub';
import { sanitizePlans, StripeHandler, stripeRoutes } from './stripe';
import { stripeWebhookRoutes } from './stripe-webhook';
import { mozillaSubscriptionRoutes } from './mozilla';
import { supportRoutes } from './support';
import { handleAuth } from './utils';

const createRoutes = (
  log: AuthLogger,
  db: any,
  config: ConfigType,
  customs: any,
  push: any,
  mailer: any,
  profile: any,
  stripeHelper: StripeHelper,
  zendeskClient: zendesk.Client
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
    routes.push(...supportRoutes(log, db, config, customs, zendeskClient));
    routes.push(
      ...mozillaSubscriptionRoutes({ log, db, config, customs, stripeHelper })
    );
  }
  if (stripeHelper && config.subscriptions.paypalNvpSigCredentials.enabled) {
    routes.push(
      ...paypalRoutes(
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
      ...paypalNotificationRoutes(
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

  if (config.subscriptions?.playApiServiceAccount?.enabled) {
    routes.push(...googleIapRoutes(db));
    routes.push(...playPubsubRoutes(db));
  }

  return routes;
};

module.exports = createRoutes;
module.exports.DirectStripeRoutes = StripeHandler;
module.exports.handleAuth = handleAuth;
module.exports.sanitizePlans = sanitizePlans;
