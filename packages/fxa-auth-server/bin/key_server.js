/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var fs = require('fs')
var config = require('../config').root()

function main() {
  var log = require('../log')(config.log.level)

  function logMemoryStats() {
    log.stat(
      {
        stat: 'mem',
        rss: this.rss,
        heapUsed: this.heapUsed
      }
    )
  }

  log.event('config', config)
  if (config.env !== 'prod') {
    log.info(config, "starting config")
  }

  var error = require('../error')
  var Token = require('../tokens')(log, config.tokenLifetimes)

  var CC = require('compute-cluster')
  var signer = new CC({ module: __dirname + '/signer.js' })
  signer.on('error', function () {}) // don't die

  var Customs = require('../customs')(log, error)

  var Server = require('../server')
  var server = null
  var mailer = null
  var memInterval = null
  var database = null
  var customs = null

  require('../mailer')(config, log)
    .done(
      function(m) {
        mailer = m
        var serverPublicKey = JSON.parse(fs.readFileSync(config.publicKeyFile))

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
              database = db
              customs = new Customs(config.customsUrl)
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
              memInterval = setInterval(logMemoryStats.bind(server.load), 15000)
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
    log.info({ op: 'shutdown' })
    clearInterval(memInterval)
    server.stop(
      function () {
        customs.close()
        mailer.stop()
        database.close()
        signer.exit()
      }
    )
  }
}

main()
