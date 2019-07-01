/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var config = require('../config');
var dbServer = require('../db-server');
var error = dbServer.errors;
var logger = require('../lib/logging')('bin.server');
var DB = require('../lib/db/mem')(logger, error);

DB.connect(config).done(function(db) {
  var server = dbServer.createServer(db);
  server.listen(config.port, config.hostname, function() {
    logger.info('start', { port: config.port });
  });
  server.on('error', function(err) {
    logger.error('start', { message: err.message });
  });
  server.on('success', function(d) {
    logger.info('summary', d);
  });
  server.on('failure', function(err) {
    if (err.statusCode >= 500) {
      logger.error('summary', err);
    } else {
      logger.warn('summary', err);
    }
  });
  server.on('mem', function(stats) {
    logger.info('mem', stats);
  });
});
