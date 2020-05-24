/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var path = require('path');
var mysql = require('mysql');
var config = require('../config');
var logger = require('../lib/logging')('bin.db_patcher');
var patcher = require('mysql-patcher');

var patch = require('../lib/db/patch');
const constants = require('../lib/constants');

// set some options
var options = Object.assign({}, config.master);
options.dir = path.join(__dirname, '..', 'lib', 'db', 'schema');
options.patchKey = config.patchKey;
options.metaTable = 'dbMetadata';
options.patchLevel = patch.level;
options.mysql = mysql;
options.createDatabase = true;
options.reversePatchAllowed = false;
options.database = constants.DATABASE_NAME;

patcher.patch(options, function (err) {
  if (err) {
    logger.error('patch-error', { err: '' + err });
    process.exit(2);
  }
  logger.info('patched', { level: options.patchLevel });
});
