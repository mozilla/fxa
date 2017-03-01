/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// Only `require()` the newrelic module if explicity enabled.
// If required, modules will be instrumented.
require('../lib/newrelic')()

var config = require('../config').getProperties()
var jwtool = require('fxa-jwtool')

var log = require('../lib/log')(config.log.level)
var getGeoData = require('../lib/geodb')(log)

function main() {
  // Force the geo to load and run at startup, not waiting for it to run on
  // some route later.
  var knownIp = '63.245.221.32' // Mozilla MTV
  getGeoData(knownIp)
    .then(function(result) {
      log.info({ op: 'geodb.check', result: result })
    })

  // RegExp instances serialise to empty objects, display regex strings instead.
  const stringifiedConfig =
    JSON.stringify(config, (k, v) =>
      v && v.constructor === RegExp ? v.toString() : v
    )

  process.stdout.write('{"event":"config","data":' + stringifiedConfig + '}\n')

  if (config.env !== 'prod') {
    log.info(stringifiedConfig, 'starting config')
  }

  var error = require('../lib/error')
  var Token = require('../lib/tokens')(log, config)
  var Password = require('../lib/crypto/password')(log, config)
  var UnblockCode = require('../lib/crypto/base32')(config.signinUnblock.codeLength)

  var signer = require('../lib/signer')(config.secretKeyFile, config.domain)
  var serverPublicKeys = {
    primary: jwtool.JWK.fromFile(
      config.publicKeyFile,
      {
        algorithm: 'RS',
        use: 'sig',
        kty: 'RSA'
      }
    ),
    secondary: config.oldPublicKeyFile ?
      jwtool.JWK.fromFile(
        config.oldPublicKeyFile,
        {
          algorithm: 'RS',
          use: 'sig',
          kty: 'RSA'
        }
      )
      : null
  }

  var Customs = require('../lib/customs')(log, error)

  var Server = require('../lib/server')
  var server = null
  var senders = null
  var statsInterval = null
  var database = null
  var customs = null

  function logStatInfo() {
    log.stat(server.stat())
    log.stat(Password.stat())
  }

  require('../lib/senders')(config, log)
    .then(
      function(result) {
        senders = result

        var DB = require('../lib/db')(
          config,
          log,
          error,
          Token.SessionToken,
          Token.KeyFetchToken,
          Token.AccountResetToken,
          Token.PasswordForgotToken,
          Token.PasswordChangeToken,
          UnblockCode
        )

        DB.connect(config[config.db.backend])
          .then(
            function (db) {
              database = db
              customs = new Customs(config.customsUrl)
              var routes = require('../lib/routes')(
                log,
                error,
                serverPublicKeys,
                signer,
                db,
                senders.email,
                senders.sms,
                Password,
                config,
                customs
              )
              server = Server.create(log, error, config, routes, db)

              server.start(
                function (err) {
                  if (err) {
                    log.error({ op: 'server.start.1', msg: 'failed startup with error',
                      err: { message: err.message } })
                    process.exit(1)
                  } else {
                    log.info({ op: 'server.start.1', msg: 'running on ' + server.info.uri })
                  }
                }
              )
              statsInterval = setInterval(logStatInfo, 15000)
            },
            function (err) {
              log.error({ op: 'DB.connect', err: { message: err.message } })
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
    clearInterval(statsInterval)
    server.stop(
      function () {
        customs.close()
        try {
          senders.email.stop()
        } catch (e) {
          // XXX: simplesmtp module may quit early and set socket to `false`, stopping it may fail
          log.warn({ op: 'shutdown', message: 'Mailer client already disconnected' })
        }
        database.close()
        process.exit() //XXX: because of openid dep ಠ_ಠ
      }
    )
  }
}

main()
