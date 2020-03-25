/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const config = require('../lib/config').getProperties();
const logger = require('../lib/logging')('bin._static');
const Server = require('../lib/server/_static');

if (config.env !== 'development') {
  logger.warn('sanity-check', 'static bin should only be used for local dev!');
}

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
