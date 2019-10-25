/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const config = require('../config').getProperties();
const StatsD = require('hot-shots');
const statsd = new StatsD(config.statsd);
const log = require('../lib/log')(
  config.log.level,
  'profile-server-messaging',
  statsd
);
const Token = require('../lib/tokens')(log, config);
const SQSReceiver = require('../lib/sqs')(log, statsd);
const profileUpdates = require('../lib/profile/updates')(log);
const push = require('../lib/push');

const DB = require('../lib/db')(config, log, Token);

const profileUpdatesQueue = new SQSReceiver(
  config.profileServerMessaging.region,
  [config.profileServerMessaging.profileUpdatesQueueUrl]
);

DB.connect(config[config.db.backend]).then(db => {
  profileUpdates(profileUpdatesQueue, push(log, db, config), db);
});
