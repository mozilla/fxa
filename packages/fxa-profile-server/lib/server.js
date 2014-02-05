/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const Hapi = require('hapi');

const config = require('./config').root();
const logger = require('./logging').getLogger('fxa.server');

exports.create = function createServer() {
  var server = Hapi.createServer(
    config.server.host,
    config.server.port
  );

  server.route(require('./routing'));

  // response logging
  server.on('response', function(req) {
    logger.info(
      '%s %s - %d (%dms)',
      req.method.toUpperCase(),
      req.path,
      req.response.statusCode,
      Date.now() - req.info.received
    );
  });

  return server;
};
