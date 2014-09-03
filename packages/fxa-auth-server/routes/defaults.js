/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var path = require('path')
var fs = require('fs')
var util = require('util')
var child_process = require('child_process')

var version = require('../package.json').version
var commitHash;

module.exports = function (log, P, db, error) {

  var routes = [
    {
      method: 'GET',
      path: '/',
      handler: function index(request, reply) {
        log.begin('Defaults.root', request)

        function sendReply() {
          reply(
            {
              version: version,
              commit: commitHash
            }
          )
        }

        // if we already have the commitHash, send the reply and return
        if (commitHash) {
          return sendReply()
        }

        // Note: we figure out the Git hash in the following order:
        //
        // (1) read config/version.json if exists (ie. staging, production)
        // (2) figure it out from git (either regular '.git', or '/home/app/git' for AwsBox)

        // (1) read config/version.json if exists (ie. staging, production)
        var configFile = path.join(__dirname, '..', 'config', 'version.json')
        if ( fs.existsSync(configFile) ) {
          commitHash = require(configFile).version.hash
          return sendReply()
        }

        // (2) figure it out from git (either regular '.git', or '/home/app/git' for AwsBox)
        var gitDir
        if ( !fs.existsSync(path.join(__dirname, '..', '.git')) ) {
          // try at '/home/app/git' for AwsBox deploys
          gitDir = path.sep + path.join('home', 'app', 'git')
        }
        var cmd = util.format('git %s rev-parse HEAD', gitDir ? '--git-dir=' + gitDir : '')
        child_process.exec(cmd, function(err, stdout) {
          commitHash = stdout.replace(/\s+/, '')
          return sendReply()
        })
      }
    },
    {
      method: 'GET',
      path: '/__heartbeat__',
      handler: function heartbeat(request, reply) {
        log.begin('Defaults.heartbeat', request)
        db.ping()
          .done(
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
      handler: function v0(request, reply) {
        log.begin('Defaults.v0', request)
        reply(error.gone())
      }
    }
  ]

  return routes
}
