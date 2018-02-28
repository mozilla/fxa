/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const Hapi = require('hapi');
const Inert = require('inert');

const config = require('../config').getProperties();
const logger = require('../logging')('server.static');

exports.create = function() {
  var server = new Hapi.Server({
    debug: false
  });

  server.register(Inert, function() {});

  server.connection({
    host: config.server.host,
    port: config.server.port + 1
  });

  server.route({
    method: 'GET',
    path: '/a/{id}',
    handler: {
      'directory': {
        'path': config.img.uploads.dest.public
      }
    }
  });

  server.on('log', function onLog(evt) {
    logger.verbose('hapi.server', evt);
  });

  server.on('request', function onRequest(req, evt) {
    logger.verbose('hapi.request', evt);
  });

  return server;
};
