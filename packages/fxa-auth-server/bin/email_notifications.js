/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const config = require('../config').getProperties();
const StatsD = require('hot-shots');
const statsd = new StatsD(config.statsd);
const log = require('../lib/log')(config.log.level, 'fxa-email-bouncer', {
  statsd,
});
const error = require('../lib/error');
const Token = require('../lib/tokens')(log, config);
const SQSReceiver = require('../lib/sqs')(log, statsd);
const bounces = require('../lib/email/bounces')(log, error);
const delivery = require('../lib/email/delivery')(log);
const notifications = require('../lib/email/notifications')(log, error);

const DB = require('../lib/db')(config, log, Token);

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

DB.connect(config[config.db.backend]).then((db) => {
  // bounces and delivery are now deprecated, we'll delete them
  // as soon as we're 100% confident in fxa-email-service
  bounces(bounceQueue, db);
  delivery(deliveryQueue);
  notifications(notificationQueue, db);
});
