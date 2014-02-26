/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const util = require('util');

const Hapi = require('hapi');

const AppError = require('./error');
const config = require('./config').root();
const logger = require('./logging').getLogger('fxa.server');

exports.create = function createServer() {
  var server = Hapi.createServer(
    config.server.host,
    config.server.port
  );

  server.route(require('./routing'));

  server.ext('onPreResponse', function onPreResponse(request, next) {
    var response = request.response;
    if (response.isBoom) {
      response = AppError.translate(response);
    }
    next(response);
  });

  // error response logging
  server.on('request', function onRequest(req, evt, tags) {
    if (tags.error && util.isError(evt.data)) {
      var err = evt.data;
      if (err.isBoom && err.output.statusCode < 500) {
        // a 4xx error, so its not our fault. not an ERROR level log
        logger.warn('%d response: %s', err.output.statusCode, err.message);
      } else {
        logger.error('%s', err);
      }
    }
  });

  // response logging
  server.on('response', function onResponse(req) {
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
