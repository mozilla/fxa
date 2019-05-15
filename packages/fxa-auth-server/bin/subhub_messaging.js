/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. 
 */

'use strict';

// This MUST be the first require in the program.
// Only `require()` the newrelic module if explicity enabled.
// If required, modules will be instrumented.
require('../lib/newrelic')();

const config = require('../config').getProperties();
const log = require('../lib/log')(config.log.level, 'subhub-messaging');
const Token = require('../lib/tokens')(log, config);
const SQSReceiver = require('../lib/sqs')(log);
// FIXME: import a different module:
const subhubUpdates = require('../lib/subhub/updates')(log);

const DB = require('../lib/db')(
  config,
  log,
  Token
);

const subhubUpdatesQueue = new SQSReceiver(config.subhubServerMessaging.region, [
  config.subhubServerMessaging.subhubUpdatesQueueUrl
]);

DB.connect(config[config.db.backend])
  .then(
    (db) => {
      subhubUpdates(subhubUpdatesQueue, db);
    }
  );
