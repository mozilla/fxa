/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// Only `require()` the newrelic module if explicity enabled.
// If required, modules will be instrumented.
require('../lib/newrelic')();

const logger = require('../lib/logging')('bin.worker');
const Server = require('../lib/server/worker');

async function start() {
  const server = await Server.create();

  try {
    await server.start();
    logger.info('listening', server.info.uri);
  } catch (err) {
    logger.error('failed to start', err);
  }
}

start();
