/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { StatsD } from 'hot-shots';
import * as Sentry from '@sentry/node';
import Stripe from 'stripe';
import { promisify } from 'util';
import { STRIPE_API_VERSION } from '@fxa/payments/stripe';
import { initSentry } from '@fxa/shared/sentry-node';

import { checkStripeWebhookFailures } from './check-stripe-webhook-failures/check-stripe-webhook-failures';

const pckg = require('../package.json');
const config = require('../config').default.getProperties();
const statsd = new StatsD(config.statsd);
const log = require('../lib/log')(
  config.log.level,
  'check-stripe-webhook-failures',
  { statsd }
);
initSentry({ ...config, release: pckg.version }, log);

async function init() {
  const stripe = new Stripe(config.subscriptions.stripeApiKey, {
    apiVersion: STRIPE_API_VERSION,
    maxNetworkRetries: 3,
  });

  try {
    const failedEventsCount = await checkStripeWebhookFailures(stripe, statsd);
    log.info('check-stripe-webhook-failures-complete', { failedEventsCount });
  } finally {
    await promisify(statsd.close)
      .bind(statsd)()
      .catch((err) => log.error('statsd.close', err));
  }

  return 0;
}

if (require.main === module) {
  let exitStatus = 1;
  init()
    .then((result) => {
      exitStatus = result;
    })
    .catch((err) => {
      Sentry.captureException(err);
      console.error(err);
    })
    .then(() => {
      return Sentry.close(2000);
    })
    .finally(() => {
      process.exit(exitStatus);
    });
}
