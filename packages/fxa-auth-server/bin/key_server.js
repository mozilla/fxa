#!/usr/bin/env node
/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var fs = require('fs')
var config = require('../config').root()

function main() {
  var log = require('../log')(config.log.level)

  if (config.env !== 'production') {
    log.info(config, "starting config")
  }

  // memory monitor
  var MemoryMonitor = require('../memory_monitor')
  var memoryMonitor = new MemoryMonitor()
  memoryMonitor.on(
    'mem',
    function (usage) {
      log.info(
        {
          op: 'stat',
          stat: 'mem',
          rss: usage.rss,
          heapTotal: usage.heapTotal,
          heapUsed: usage.heapUsed
        }
      )
    }
  )
  memoryMonitor.start()

  var error = require('../error')(log)
  var Token = require('../tokens')(log)
  var i18n = require('../i18n')(config.i18n)

  // signer compute-cluster
  var CC = require('compute-cluster')
  var signer = new CC({ module: __dirname + '/signer.js' })
  signer.on('error', function () {}) // don't die

  // client_heklper compute-cluster
  var clientHelper = new CC({ module: __dirname + '/client_helper.js' })
  clientHelper.on('error', function () {}) // don't die

  var Server = require('../server')
  var server = null
  // TODO: send to the SMTP server directly. In the future this may change
  // to another process that we send an http request to.
  var mailer = require('../mailer')(config.smtp, i18n, log)

  // server public key
  var serverPublicKey = JSON.parse(fs.readFileSync(config.publicKeyFile))

  // databases
  var DB = require('../db')(
    config.db.backend,
    log,
    Token.error,
    Token.AuthToken,
    Token.SessionToken,
    Token.KeyFetchToken,
    Token.AccountResetToken,
    Token.SrpToken,
    Token.ForgotPasswordToken
  )

  var noncedb = require('../noncedb')(
    config,
    log
  )
  DB.connect(config[config.db.backend])
    .then(
      function (db) {
        return noncedb.connect()
                      .then(function(ndb) { return [db, ndb] })
      },
      function (err) {
        log.error({ op: 'noncedb.connect', err: err })
        process.exit(1)
      }
    )
    .then(
      function (backends) {
        var db = backends[0]
        var noncedb = backends[1]
        var routes = require('../routes')(log, error, serverPublicKey, signer, clientHelper, db, mailer, Token, config)
        server = Server.create(log, error, config, routes, db, noncedb, i18n)

        server.start(
          function () {
            log.info('running on ' + server.info.uri)
          }
        )
      },
      function (err) {
        log.error({ op: 'DB.connect', err: err.message })
        process.exit(1)
      }
    )

  process.on(
    'SIGINT',
    function () {
      memoryMonitor.stop()
      server.stop(
        function () {
          process.exit()
        }
      )
    }
  )
}

if (!fs.existsSync(config.publicKeyFile)) {
  require('../scripts/gen_keys')(main)
}
else {
  main()
}
