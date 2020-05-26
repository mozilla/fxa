/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// Only `require()` the newrelic module if explicity enabled.
// If required, modules will be instrumented.
require('../lib/newrelic')();

const configuration = require('../lib/config');
const db = require('../lib/db');
const logger = require('../lib/logging')('bin.server');
const Server = require('../lib/server');

// The stringify/parse is to force the output back to unindented json.
logger.info('config', JSON.stringify(JSON.parse(configuration.toString())));

async function start() {
  const server = await Server.create();
  const events = require('../lib/events')(server);

  db.ping().done(
    async function () {
      try {
        await server.start();
        logger.info('listening', server.info.uri);
      } catch (err) {
        logger.critical('server.start', err);
        process.exit(1);
      }

      events.start();
    },
    function (err) {
      logger.critical('db.ping', err);
      process.exit(2);
    }
  );
}

start();
