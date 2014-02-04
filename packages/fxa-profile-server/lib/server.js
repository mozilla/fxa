/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const Hapi = require('hapi');

const config = require('./config');

const server = Hapi.createServer(
  config.get('server.host'),
  config.get('server.port')
);

server.route({
  method: 'GET',
  path: '/',
  handler: function(req, reply) {
    reply('fxa profiles!');
  }
});

module.exports = server;
