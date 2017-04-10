/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict'

const path = require('path')
const cp = require('child_process')
const error = require('../error')

const version = require('../../package.json').version
var commitHash
var sourceRepo

const UNKNOWN = 'unknown'

// Production and stage provide './config/version.json'. Try to load this at
// startup; punt on failure. For dev environments, we'll get this from `git`
// for dev environments.
try {
  var versionJson = path.join(__dirname, '..', '..', 'config', 'version.json')
  var info = require(versionJson)
  commitHash = info.version.hash
  sourceRepo = info.version.source
} catch (e) {
  /* ignore */
}

module.exports = (log, db) => {

  function versionHandler(request, reply) {
    log.begin('Defaults.root', request)

    function sendReply() {
      reply(
        {
          version: version,
          commit: commitHash,
          source: sourceRepo
        }
      ).spaces(2).suffix('\n')
    }

    // if we already have the commitHash, send the reply and return
    if (commitHash) {
      return sendReply()
    }

    // ignore errors and default to 'unknown' if not found
    var gitDir = path.resolve(__dirname, '..', '..', '.git')
    cp.exec('git rev-parse HEAD', { cwd: gitDir }, function(err, stdout1) {
      var configPath = path.join(gitDir, 'config')
      var cmd = 'git config --get remote.origin.url'
      cp.exec(cmd, { env: { GIT_CONFIG: configPath, PATH: process.env.PATH } }, function(err, stdout2) {
        commitHash = (stdout1 && stdout1.trim()) || UNKNOWN
        sourceRepo = (stdout2 && stdout2.trim()) || UNKNOWN
        return sendReply()
      })
    })
  }

  var routes = [
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
      handler: function heartbeat(request, reply) {
        log.begin('Defaults.heartbeat', request)
        db.ping()
          .then(
            function () {
              reply({})
            },
            function (err) {
              log.error({ op: 'heartbeat', err: err })
              reply(error.serviceUnavailable())
            }
          )
      }
    },
    {
      method: 'GET',
      path: '/__lbheartbeat__',
      handler: function heartbeat(request, reply) {
        log.begin('Defaults.lbheartbeat', request)
        reply({})
      }
    },
    {
      method: '*',
      path: '/v0/{p*}',
      config: {
        validate: {
          query: true,
          params: true
        }
      },
      handler: function v0(request, reply) {
        log.begin('Defaults.v0', request)
        reply(error.gone())
      }
    }
  ]

  return routes
}
