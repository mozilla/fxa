/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const path = require('path');
const cp = require('child_process');
const error = require('../error');

const version = require('../../package.json').version;
let commitHash;
let sourceRepo;

const UNKNOWN = 'unknown';

// Production and stage provide './config/version.json'. Try to load this at
// startup; punt on failure. For dev environments, we'll get this from `git`
// for dev environments.
try {
  const versionJson = path.join(__dirname, '..', '..', 'config', 'version.json');
  const info = require(versionJson);
  commitHash = info.version.hash;
  sourceRepo = info.version.source;
} catch (e) {
  /* ignore */
}

module.exports = (log, db) => {

  async function versionHandler(request, h) {
    log.begin('Defaults.root', request);

    function getVersion() {
      return new Promise((resolve, reject) => {
        // ignore errors and default to 'unknown' if not found
        const gitDir = path.resolve(__dirname, '..', '..', '..', '..', '.git');

          cp.exec('git rev-parse HEAD', { cwd: gitDir },  (err, stdout1) => {
            const configPath = path.join(gitDir, 'config');
            const cmd = 'git config --get remote.origin.url';
            cp.exec(cmd, { env: { GIT_CONFIG: configPath, PATH: process.env.PATH } }, (err, stdout2) => {
               commitHash = (stdout1 && stdout1.trim()) || UNKNOWN;
               sourceRepo = (stdout2 && stdout2.trim()) || UNKNOWN;
               resolve();
            });
          });
      });
    }

    function getResp() {
        return h.response({
            version: version,
            commit: commitHash,
            source: sourceRepo
        }).spaces(2).suffix('\n');
    }

    // if we already have the commitHash, send the reply and return
    if (commitHash) {
      return getResp();
    }

     await getVersion();
     return getResp();

  }

  const routes = [
    {
      method: 'GET',
      path: '/',
      handler: versionHandler
    },
    {
      method: 'GET',
      path: '/__version__',
      handler: versionHandler
    },
    {
      method: 'GET',
      path: '/__heartbeat__',
      handler: async function heartbeat(request) {
        log.begin('Defaults.heartbeat', request);
        return db.ping()
          .then(
            () => {
              return {};
            },
            (err) => {
              log.error('heartbeat', { err: err });
              throw error.serviceUnavailable();
            }
          );
      }
    },
    {
      method: 'GET',
      path: '/__lbheartbeat__',
      handler: async function heartbeat(request) {
        log.begin('Defaults.lbheartbeat', request);
        return {};
      }
    },
    {
      method: '*',
      path: '/v0/{p*}',
      options: {
        validate: {
          query: true,
          params: true
        }
      },
      handler: async function v0(request) {
        log.begin('Defaults.v0', request);
        throw error.gone();
      }
    }
  ];

  return routes;
};
