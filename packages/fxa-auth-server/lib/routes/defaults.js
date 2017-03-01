/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var path = require('path')
var cp = require('child_process')
const util = require('util')

var version = require('../../package.json').version
var commitHash
var sourceRepo

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

module.exports = function (log, P, db, error) {

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
    var cmd = util.format('git --git-dir=%s rev-parse HEAD', gitDir)
    cp.exec(cmd, function(err, stdout1) {
      var configPath = path.join(gitDir, 'config')
      var cmd = util.format('git config --file %s --get remote.origin.url', configPath)
      cp.exec(cmd, function(err, stdout2) {
        commitHash = (stdout1 && stdout1.trim()) || 'unknown'
        sourceRepo = (stdout2 && stdout2.trim()) || 'unknown'
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
