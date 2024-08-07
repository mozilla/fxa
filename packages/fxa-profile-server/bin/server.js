/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// Important! Must be required first to get proper hooks in place.
require('../lib/monitoring');

const configuration = require('../lib/config');
const db = require('../lib/db');
const logger = require('../lib/logging')('bin.server');
const Server = require('../lib/server');

// The stringify/parse is to force the output back to unindented json.
logger.info('config', JSON.stringify(JSON.parse(configuration.toString())));

async function start() {
  const server = await Server.create();
  const events = require('../lib/events')(server);
  try {
    await db.ping();
    await server.start();
    logger.info('listening', server.info.uri);
    events.start();
  } catch (err) {
    logger.critical('server.start', err);
    process.exit(1);
  }
}

start();
