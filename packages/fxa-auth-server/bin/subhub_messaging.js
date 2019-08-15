/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

'use strict';

const LIB_DIR = '../lib';

// This MUST be the first require in the program.
// Only `require()` the newrelic module if explicity enabled.
// If required, modules will be instrumented.
require(`${LIB_DIR}/newrelic`)();

const config = require('../config').getProperties();
const log = require(`${LIB_DIR}/log`)(config.log.level, 'subhub-messaging');
const Promise = require(`${LIB_DIR}/promise`);
const Token = require(`${LIB_DIR}/tokens`)(log, config);
const SQSReceiver = require(`${LIB_DIR}/sqs`)(log);
const subhubUpdates = require(`${LIB_DIR}/subhub/updates`)(log, config);

run();

async function run() {
  try {
    const subhubUpdatesQueue = new SQSReceiver(
      config.subhubServerMessaging.region,
      [config.subhubServerMessaging.subhubUpdatesQueueUrl]
    );

    const [db, translator] = await Promise.all([
      require(`${LIB_DIR}/db`)(config, log, Token).connect(
        config[config.db.backend]
      ),
      require(`${LIB_DIR}/senders/translator`)(
        config.i18n.supportedLanguages,
        config.i18n.defaultLanguage
      ),
    ]);

    const { email: mailer } = await require(`${LIB_DIR}/senders`)(
      log,
      config,
      require(`${LIB_DIR}/error`),
      translator,
      require(`${LIB_DIR}/oauthdb`)(log, config)
    );

    subhubUpdates(subhubUpdatesQueue, db, mailer);
  } catch (err) {
    log.error('bin.subhub.error', { err });
    process.exit(1);
  }
}
