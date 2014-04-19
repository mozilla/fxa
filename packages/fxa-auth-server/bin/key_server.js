/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var fs = require('fs')
var config = require('../config').root()

function main() {
  var log = require('../log')(config.log.level)

  log.event('config', config)
  if (config.env !== 'prod') {
    log.info(config, "starting config")
  }

  // memory monitor
  var MemoryMonitor = require('../memory_monitor')
  var memoryMonitor = new MemoryMonitor()
  memoryMonitor.on(
    'mem',
    function (usage) {
      log.stat(
        {
          stat: 'mem',
          rss: usage.rss,
          heapTotal: usage.heapTotal,
          heapUsed: usage.heapUsed
        }
      )
    }
  )
  memoryMonitor.start()

  var error = require('../error')
  var Token = require('../tokens')(log, config.tokenLifetimes)

  // signer compute-cluster
  var CC = require('compute-cluster')
  var signer = new CC({ module: __dirname + '/signer.js' })
  signer.on('error', function () {}) // don't die

  var Customs = require('../customs')(log, error)

  var Server = require('../server')
  var server = null
  var mailer = null

  // TODO: send to the SMTP server directly. In the future this may change
  // to another process that we send an http request to.
  require('../mailer')(config.smtp, config.i18n.defaultLanguage, config.templateServer, log)
    .done(
      function(m) {
        mailer = m
        // server public key
        var serverPublicKey = JSON.parse(fs.readFileSync(config.publicKeyFile))

        // databases
        var DB = require('../db')(
          config.db.backend,
          log,
          error,
          Token.SessionToken,
          Token.KeyFetchToken,
          Token.AccountResetToken,
          Token.PasswordForgotToken,
          Token.PasswordChangeToken
        )

        DB.connect(config[config.db.backend])
          .done(
            function (db) {
              var customs = new Customs(config.customsUrl)
              var routes = require('../routes')(
                log,
                error,
                serverPublicKey,
                signer,
                db,
                mailer,
                config,
                customs
              )
              server = Server.create(log, error, config, routes, db)

              server.start(
                function () {
                  log.info({ op: 'server.start.1', msg: 'running on ' + server.info.uri })
                }
              )
            },
            function (err) {
              log.error({ op: 'DB.connect', err: err.message })
              process.exit(1)
            }
          )

      }
    )

  process.on(
    'uncaughtException',
    function (err) {
      log.fatal(err)
      process.exit(8)
    }
  )
  process.on('SIGINT', shutdown)
  log.on('error', shutdown)

  function shutdown() {
    memoryMonitor.stop()
    mailer.stop()
    server.stop(
      function () {
        process.exit()
      }
    )
  }
}

if (!fs.existsSync(config.publicKeyFile)) {
  require('../scripts/gen_keys')(main)
}
else {
  main()
}
