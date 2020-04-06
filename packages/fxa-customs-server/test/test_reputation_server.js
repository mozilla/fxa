/* eslint-disable no-prototype-builtins */
/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/* eslint-disable no-console */
const Hapi = require('@hapi/hapi');
const config = require('../lib/config').getProperties();

// hashmap of ip -> list of violations
const mostRecentViolationByIp = {};

// hashmap of ip -> reputation
const reputationsByIp = {};

function ReputationServer(configUpdates) {
  this.server = null;
  this.config = Object.assign({}, config, configUpdates);
}

ReputationServer.prototype.start = async function() {
  if (!this.server) {
    this.server = await init(this.config);
  }
  await this.server.start();
};

ReputationServer.prototype.stop = async function() {
  if (this.server) {
    await this.server.stop();
    this.server = null;
  }
};

async function init(config) {
  const server = Hapi.server({
    port: '9009',
    host: '127.0.0.1',
  });

  server.route({
    method: 'PUT',
    path: '/violations/{ip}',
    handler: async req => {
      const ip = req.params.ip;
      mostRecentViolationByIp[ip] = req.payload.violation;
      return {};
    },
  });

  server.route({
    method: 'GET',
    path: '/mostRecentViolation/{ip}',
    handler: async (req, h) => {
      var ip = req.params.ip;

      if (mostRecentViolationByIp[ip]) {
        return { violation: mostRecentViolationByIp[ip] };
      }

      return {};
    },
  });

  server.route({
    method: 'DELETE',
    path: '/mostRecentViolation/{ip}',
    handler: async req => {
      var ip = req.params.ip;
      console.log('delete req', req.url);
      delete mostRecentViolationByIp[ip];
      return {};
    },
  });

  server.route({
    method: 'GET',
    path: '/heartbeat',
    handler: async req => {
      return {};
    },
  });

  server.route({
    method: 'GET',
    path: '/{ip}',
    handler: async (req, h) => {
      var ip = req.params.ip;
      if (ip === '9.9.9.9') {
        return h.response({}).code(500);
      } else if (reputationsByIp.hasOwnProperty(ip)) {
        return { reputation: reputationsByIp[ip], reviewed: false };
      } else {
        return h.response({}).code(404);
      }
    },
  });

  server.route({
    method: 'DELETE',
    path: '/{ip}',
    handler: async (req, h) => {
      var ip = req.params.ip;
      if (reputationsByIp.hasOwnProperty(ip)) {
        delete reputationsByIp[ip];
      }
      return {};
    },
  });

  server.route({
    method: 'PUT',
    path: '/{ip}',
    handler: async (req, h) => {
      var ip = req.payload.ip;
      reputationsByIp[ip] = req.payload.reputation;
      return {};
    },
  });

  return server;
}

module.exports = ReputationServer;
