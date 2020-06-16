/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// This MUST be the first require in the program.
// Only `require()` the newrelic module if explicity enabled.
// If required, modules will be instrumented.
require('../lib/newrelic')();

var config = require('../config');
var dbServer = require('../db-server');
var error = dbServer.errors;
var logger = require('../lib/logging')('bin.server');
var DB = require('../lib/db/mysql')(logger, error);
var restify = require('restify');
// configure Sentry
var Sentry = require('@sentry/node');
const sentryDsn = config.sentryDsn;

if (sentryDsn) {
  Sentry.init({
    dsn: sentryDsn,
  });
  logger.info('sentryEnabled');
} else {
  logger.info('sentryDisabled');
}

function logCharsetInfo(db, poolName) {
  // Record some information about mysql connection configuration and
  // charset at startup.
  db._showVariables(poolName)
    .then(function (variables) {
      logger.info(['variables', poolName].join('.'), variables);
    })
    .then(function () {
      return db._connectionConfig(poolName);
    })
    .then(function (config) {
      logger.info(['connectionConfig', poolName].join('.'), config);
    })
    .catch(function (err) {
      logger.error('error', { error: err });
    });
}

DB.connect(config).done(function (db) {
  // Serve the HTTP API.
  var server = dbServer.createServer(db);
  server.listen(config.port, config.hostname, function () {
    logger.info('start', { port: config.port });
  });

  server.on('uncaughtException', function (req, res, route, err) {
    if (sentryDsn) {
      Sentry.captureException(err);
    }
    res.send(new restify.errors.InternalServerError('Server Error'));
  });

  server.on('error', function (err) {
    if (sentryDsn) {
      Sentry.captureException(err);
    }
    logger.error('start', { message: err.message });
  });
  server.on('success', function (d) {
    logger.info('summary', d);
  });
  server.on('failure', function (err) {
    if (err.statusCode >= 500) {
      logger.error('summary', err);
    } else {
      logger.warn('summary', err);
    }
  });
  server.on('mem', function (stats) {
    logger.info('mem', stats);
  });

  // Log connection config and charset info
  logCharsetInfo(db, 'MASTER');
  logCharsetInfo(db, 'SLAVE');
});
