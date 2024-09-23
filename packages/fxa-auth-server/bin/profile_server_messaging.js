/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

import configModule from "../config";
const config = configModule.getProperties();
import StatsD from 'hot-shots';
const statsd = new StatsD(config.statsd);
import logModule from "../lib/log";
const log = logModule(config.log.level, 'profile-server-messaging', statsd);
import TokenModule from "../lib/tokens";
const Token = TokenModule(log, config);
import SQSReceiverModule from "../lib/sqs";
const SQSReceiver = SQSReceiverModule(log, statsd);
import profileUpdatesModule from "../lib/profile/updates";
const profileUpdates = profileUpdatesModule(log);
import push from '../lib/push';

import DBModule from "../lib/db";
const DB = DBModule(config, log, Token);

const profileUpdatesQueue = new SQSReceiver(
  config.profileServerMessaging.region,
  [config.profileServerMessaging.profileUpdatesQueueUrl]
);

DB.connect(config).then((db) => {
  profileUpdates(profileUpdatesQueue, push(log, db, config), db);
});
