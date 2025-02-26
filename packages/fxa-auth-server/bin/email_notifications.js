/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const config = require('../config').default.getProperties();
const StatsD = require('hot-shots');
const { CurrencyHelper } = require('../lib/payments/currencies');

const { Container } = require('typedi');
const { AuthFirestore, AppConfig, AuthLogger } = require('../lib/types');
const { StripeHelper } = require('../lib/payments/stripe');
const { setupFirestore } = require('../lib/firestore-db');

const statsd = new StatsD(config.statsd);
Container.set(StatsD, statsd);
const log = require('../lib/log')(config.log.level, 'fxa-email-bouncer', {
  statsd,
});

Container.set(AppConfig, config);
Container.set(AuthLogger, log);

// Set currencyHelper before stripe and paypal helpers, so they can use it.
try {
  // eslint-disable-next-line
  const currencyHelper = new CurrencyHelper(config);
  Container.set(CurrencyHelper, currencyHelper);
} catch (err) {
  log.error('Invalid currency configuration', {
    err: { message: err.message },
  });
  process.exit(1);
}

const authFirestore = setupFirestore(config);
Container.set(AuthFirestore, authFirestore);

/** @type {undefined | import('../lib/payments/stripe').StripeHelper} */
let stripeHelper = undefined;
if (config.subscriptions && config.subscriptions.stripeApiKey) {
  const { createStripeHelper } = require('../lib/payments/stripe');
  stripeHelper = createStripeHelper(log, config, statsd);
  Container.set(StripeHelper, stripeHelper);

  if (config.subscriptions.paypalNvpSigCredentials.enabled) {
    const { PayPalClient } = require('@fxa/payments/paypal');
    const { PayPalHelper } = require('../lib/payments/paypal/helper');
    const paypalClient = new PayPalClient(
      config.subscriptions.paypalNvpSigCredentials,
      statsd
    );
    Container.set(PayPalClient, paypalClient);
    const paypalHelper = new PayPalHelper({ log });
    Container.set(PayPalHelper, paypalHelper);
  }
}

const error = require('../lib/error');
const Token = require('../lib/tokens')(log, config);
const SQSReceiver = require('../lib/sqs')(log, statsd);
const bounces = require('../lib/email/bounces')(log, error);
const delivery = require('../lib/email/delivery')(log);
const notifications = require('../lib/email/notifications')(log, error);

const { createDB } = require('../lib/db');
const DB = createDB(config, log, Token);

const {
  bounceQueueUrl,
  complaintQueueUrl,
  deliveryQueueUrl,
  notificationQueueUrl,
  region,
} = config.emailNotifications;

const bounceQueue = new SQSReceiver(region, [
  bounceQueueUrl,
  complaintQueueUrl,
]);
const deliveryQueue = new SQSReceiver(region, [deliveryQueueUrl]);
const notificationQueue = new SQSReceiver(region, [notificationQueueUrl]);

DB.connect(config).then((db) => {
  bounces(bounceQueue, db);
  delivery(deliveryQueue);
  notifications(notificationQueue, db);
});
