/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/*
 * Runs an event-handling loop to process account-related events from SQS.
 */

var config = require('../lib/config');
var events = require('../lib/events');
var SQSReceiver = require('../lib/events/sqs');

var basketQueue = new SQSReceiver(config.get('basket.sqs.region'), [
  config.get('basket.sqs.queue_url'),
]);
basketQueue.on('data', events.handleEvent);
basketQueue.start();
