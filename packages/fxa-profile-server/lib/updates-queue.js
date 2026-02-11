/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const config = require('./config');
const logger = require('./logging')('updates_queue');
const SQSSender = require('./sqs')(logger);

const profileUpdatedQueue = new SQSSender(
  config.get('authServerMessaging.region'),
  config.get('authServerMessaging.profileUpdatesQueueUrl')
);

function notifyProfileUpdated(uid) {
  return profileUpdatedQueue.send({ uid: uid.toString('hex') });
}

module.exports = notifyProfileUpdated;
