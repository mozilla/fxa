/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const path = require('path');

const Hapi = require('hapi');

const config = require('../config').root();
const logger = require('../logging').getLogger('fxa.server.static');

exports.create = function() {
  var server = Hapi.createServer(
    config.server.host,
    config.server.port + 1,
    {
      debug: false
    }
  );

  server.route({
    method: 'GET',
    path: '/a/{id}',
    handler: {
      'directory': {
        'path': path.join(__dirname, '..', '..', 'var', 'public')
      }
    }
  });

  server.on('log', function onLog(evt) {
    logger.verbose('hapi.server', evt);
  });

  server.on('request', function onRequest(req, evt) {
    logger.verbose('hapi.request', evt);
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
  });

  return server;
};
