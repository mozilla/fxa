/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict'

// Only `require()` the newrelic module if explicity enabled.
// If required, modules will be instrumented.
require('../lib/newrelic')()

var jwtool = require('fxa-jwtool')
var P = require('../lib/promise')


function run(config) {
  var log = require('../lib/log')(config.log)
  var getGeoData = require('../lib/geodb')(log)
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

  var DB = require('../lib/db')(
    config,
    log,
    Token,
    UnblockCode
  )

  return P.all([
    DB.connect(config[config.db.backend]),
    require('../lib/senders/translator')(config.i18n.supportedLanguages, config.i18n.defaultLanguage)
  ])
    .spread(
      (db, translator) => {
        database = db
        const bounces = require('../lib/bounces')(config, db)

        return require('../lib/senders')(log, config, error, bounces, translator)
          .then(result => {
            senders = result
            customs = new Customs(config.customsUrl)
            var routes = require('../lib/routes')(
              log,
              serverPublicKeys,
              signer,
              db,
              bounces,
              senders.email,
              senders.sms,
              Password,
              config,
              customs
            )
            server = Server.create(log, error, config, routes, db, translator)
            statsInterval = setInterval(logStatInfo, 15000)

            return new P((resolve, reject) => {
              server.start(
                function (err) {
                  if (err) {
                    log.error({ op: 'server.start.1', msg: 'failed startup with error',
                      err: { message: err.message } })
                    reject(err)
                  } else {
                    log.info({ op: 'server.start.1', msg: 'running on ' + server.info.uri })
                    resolve()
                  }
                }
              )
            })
          })
      },
      function (err) {
        log.error({ op: 'DB.connect', err: { message: err.message } })
        process.exit(1)
      }
    )
    .then(() => {
      return {
        log: log,
        close() {
          return new P((resolve) => {
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
                resolve()
              }
            )
          })
        }
      }
    })
}

function main() {
  const config = require('../config').getProperties()
  run(config).then(server => {
    process.on('uncaughtException', (err) => {
      server.log.fatal(err)
      process.exit(8)
    })
    process.on('unhandledRejection', (reason, promise) => {
      server.log.fatal({
        op: 'promise.unhandledRejection',
        error: reason
      })
    })
    process.on('SIGINT', shutdown)
    server.log.on('error', shutdown)

    function shutdown() {
      server.close().then(() => {
        process.exit() //XXX: because of openid dep ಠ_ಠ
      })
    }
  })
  .catch(process.exit.bind(null, 8))
}

if (require.main === module) {
  main()
} else {
  module.exports = run
}
