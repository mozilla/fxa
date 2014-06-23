/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const Hapi = require('hapi');

const AppError = require('./error');
const config = require('./config').root();
const logger = require('./logging').getLogger('fxa.server');
const hapiLogger = require('./logging').getLogger('fxa.server.hapi');
const summary = require('./logging/summary');

exports.create = function createServer() {
  var server = Hapi.createServer(
    config.server.host,
    config.server.port,
    {
      cors: true,
      debug: false,
      validation: {
        stripUnknown: true
      }
    }
  );

  server.route(require('./routing'));

  // hapi internal logging: server and request
  server.on('log', function onServerLog(ev, tags) {
    if (tags.error && tags.implementation) {
      hapiLogger.critical('Uncaught internal error', ev.tags, ev.data);
    } else {
      hapiLogger.verbose('Server', ev.tags, ev.data);
    }
  });

  server.on('request', function onRequestLog(req, ev, tags) {
    if (tags.error && tags.implementation) {
      hapiLogger.critical('Uncaught internal error', ev.tags, ev.data);
    } else {
      hapiLogger.verbose('Request <%s>', req.id, ev.tags, ev.data);
    }
  });

  server.ext('onPreResponse', function onPreResponse(request, next) {
    var response = request.response;
    if (response.isBoom) {
      response = AppError.translate(response);
    }
    summary(request, response);
    next(response);
  });

  // response logging
  server.on('response', function onResponse(req) {
    logger.info(
      '%s %s - %d (%dms) <%s>',
      req.method.toUpperCase(),
      req.path,
      req.response.statusCode,
      Date.now() - req.info.received,
      req.id
    );
    logger.verbose('Response: %:2j <%s>', req.response.source, req.id);
  });

  return server;
};
