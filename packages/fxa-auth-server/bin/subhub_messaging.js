/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

'use strict';

const LIB_DIR = '../lib';

const sentry = require('@sentry/node');
const config = require('../config').getProperties();
const StatsD = require('hot-shots');
const statsd = new StatsD(config.statsd);
const log = require(`${LIB_DIR}/log`)(
  config.log.level,
  'subhub-messaging',
  statsd
);
const Promise = require(`${LIB_DIR}/promise`);
const Token = require(`${LIB_DIR}/tokens`)(log, config);
const SQSReceiver = require(`${LIB_DIR}/sqs`)(log, statsd);
const subhubUpdates = require(`${LIB_DIR}/subhub/updates`)(log, config);

sentry.init({ dsn: config.sentryDsn });

run();

async function run() {
  try {
    const subhubUpdatesQueue = new SQSReceiver(
      config.subhubServerMessaging.region,
      [config.subhubServerMessaging.subhubUpdatesQueueUrl]
    );

    const [db] = await Promise.all([
      require(`${LIB_DIR}/db`)(config, log, Token).connect(
        config[config.db.backend]
      ),
      require(`${LIB_DIR}/senders/translator`)(
        config.i18n.supportedLanguages,
        config.i18n.defaultLanguage
      ),
    ]);

    subhubUpdates(subhubUpdatesQueue, db);
  } catch (err) {
    log.error('bin.subhub.error', { err });
    process.exit(1);
  }
}
