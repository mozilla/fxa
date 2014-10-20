/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const logger = require('../lib/logging')('bin.worker');
const server = require('../lib/server/worker').create();

server.start(function() {
  logger.info('listening', server.info.uri);
});
