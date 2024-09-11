/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

import configModule from '../config';
const config = configModule.getProperties();
import StatsD from 'hot-shots';
import { CurrencyHelper } from '../lib/payments/currencies';
import { Container } from 'typedi';
import { AuthFirestore, AppConfig, AuthLogger } from '../lib/types';
import { StripeHelper } from '../lib/payments/stripe';
import { setupFirestore } from '../lib/firestore-db';
import { createStripeHelper } from '../lib/payments/stripe';
import { PayPalClient } from '@fxa/payments/paypal';
import { PayPalHelper } from '../lib/payments/paypal/helper';

const statsd = new StatsD(config.statsd);
Container.set(StatsD, statsd);
import logModule from '../lib/log';

const log = logModule(config.log.level, 'fxa-email-bouncer', {
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
  stripeHelper = createStripeHelper(log, config, statsd);
  Container.set(StripeHelper, stripeHelper);

  if (config.subscriptions.paypalNvpSigCredentials.enabled) {
    const paypalClient = new PayPalClient(
      config.subscriptions.paypalNvpSigCredentials
    );
    Container.set(PayPalClient, paypalClient);
    const paypalHelper = new PayPalHelper({ log });
    Container.set(PayPalHelper, paypalHelper);
  }
}

import error from '../lib/error';
import TokenModule from '../lib/tokens';
const Token = TokenModule(log, config);
import SQSReceiverModule from '../lib/sqs';
const SQSReceiver = SQSReceiverModule(log, statsd);
import bouncesModule from '../lib/email/bounces';
const bounces = bouncesModule(log, error);
import deliveryModule from '../lib/email/delivery';
const delivery = deliveryModule(log);
import notificationsModule from '../lib/email/notifications';
const notifications = notificationsModule(log, error);
import DBModule from '../lib/db';
const DB = DBModule(config, log, Token);

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
