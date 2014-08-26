/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const config = require('../lib/config').root();
const logger = require('../lib/logging').getLogger('fxa.bin.server');
const server = require('../lib/server').create();

process.title = 'server';

logger.debug('Starting with config: %:2j', config);
server.start(function() {
  logger.info('Server started at:', server.info.uri);
});
