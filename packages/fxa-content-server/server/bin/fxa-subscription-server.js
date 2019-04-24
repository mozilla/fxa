#!/usr/bin/env node

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

// setup version first for the rest of the modules
const logger = require('../lib/logging/log')('server.main');
const version = require('../lib/version');

logger.info(`source set to: ${version.source}`);
logger.info(`version set to: ${version.version}`);
logger.info(`commit hash set to: ${version.commit}`);
logger.info(`fxa-content-server-l10n commit hash set to: ${version.l10n}`);
logger.info(`tos-pp (legal-docs) commit hash set to: ${version.tosPp}`);

const config = require('../lib/configuration');
const routes = require('../lib/router')('subscription-server', config);
const server = require('../lib/server')(logger, config.get('public_url'), config.get('payment_port'), routes);

const path = require('path');
// This can't possibly be best way to librar-ify this module.
const isMain = process.argv[1] === __filename;
if (isMain) {
  // ./server is our current working directory
  process.chdir(path.dirname(__dirname));
}

let app;

if (isMain) {
  app = server.makeApp();
  server.listen(app);
} else {
  module.exports = server;
}
