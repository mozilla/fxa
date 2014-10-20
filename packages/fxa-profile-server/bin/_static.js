/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const config = require('../lib/config').root();
const logger = require('../lib/logging')('bin._static');
const server = require('../lib/server/_static').create();

if (config.env !== 'dev') {
  logger.warn('static bin should only be for local dev');
}


server.start(function() {
  logger.info('listening', server.info.uri);
});
