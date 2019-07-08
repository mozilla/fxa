/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const Hapi = require('hapi');
const Boom = require('boom');
const path = require('path');
const Inert = require('inert');

const config = require('../config').getProperties();
const logger = require('../logging')('server.static');

const DEFAULT_AVATAR_DIR = path.resolve(__dirname, '..', 'assets');
const DEFAULT_AVATAR_ID = config.img.defaultAvatarId;
const DEFAULT_AVATAR = path.resolve(DEFAULT_AVATAR_DIR, 'default-profile.png');
const DEFAULT_AVATAR_LARGE = path.resolve(
  DEFAULT_AVATAR_DIR,
  'default-profile_large.png'
);
const DEFAULT_AVATAR_SMALL = path.resolve(
  DEFAULT_AVATAR_DIR,
  'default-profile_small.png'
);

exports.create = function() {
  var server = new Hapi.Server({
    debug: false,
  });

  server.register(Inert, function() {});

  server.connection({
    host: config.server.host,
    port: config.server.port + 1,
  });

  server.route({
    method: 'GET',
    path: '/a/' + DEFAULT_AVATAR_ID + '{type?}',
    handler: function(request, reply) {
      switch (request.params.type) {
        case '':
          reply.file(DEFAULT_AVATAR);
          break;
        case '_small':
          reply.file(DEFAULT_AVATAR_SMALL);
          break;
        case '_large':
          reply.file(DEFAULT_AVATAR_LARGE);
          break;
        default:
          reply(Boom.notFound());
      }
    },
  });

  server.route({
    method: 'GET',
    path: '/a/{id}',
    handler: {
      directory: {
        path: config.img.uploads.dest.public,
      },
    },
  });

  server.on('log', function onLog(evt) {
    logger.verbose('hapi.server', evt);
  });

  server.on('request', function onRequest(req, evt) {
    logger.verbose('hapi.request', evt);
  });

  return server;
};
