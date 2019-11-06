/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const error = require('../error');

const getVersion = require('../version').getVersion;

module.exports = (log, db) => {
  async function versionHandler(request, h) {
    log.begin('Defaults.root', request);
    const versionData = await getVersion();
    return h
      .response(versionData)
      .spaces(2)
      .suffix('\n');
  }

  const routes = [
    {
      method: 'GET',
      path: '/',
      handler: versionHandler,
    },
    {
      method: 'GET',
      path: '/__version__',
      handler: versionHandler,
    },
    {
      method: 'GET',
      path: '/__heartbeat__',
      handler: async function heartbeat(request) {
        log.begin('Defaults.heartbeat', request);
        try {
          await db.ping();
        } catch (err) {
          log.error('heartbeat', { err });
          throw error.serviceUnavailable();
        }
        return {};
      },
    },
    {
      method: 'GET',
      path: '/__lbheartbeat__',
      handler: async function heartbeat(request) {
        log.begin('Defaults.lbheartbeat', request);
        return {};
      },
    },
    {
      method: '*',
      path: '/v0/{p*}',
      options: {
        validate: {
          query: true,
          params: true,
        },
      },
      handler: async function v0(request) {
        log.begin('Defaults.v0', request);
        throw error.gone();
      },
    },
  ];

  return routes;
};
