/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var restify = require('restify')
var config = require('../config')

var log = require('../log')('server')
var mailConfig = config.get('mail')

var packageJson = require('../package.json')
var P = require('bluebird')
var DB = require('../lib/db')()

// NOTE: Mailer is also used by fxa-auth-server directly with an old logging interface
// the legacy log module provides an interface to convert old logs to new mozlog logging.
var mailerLog = require('../log')('mailer')
var legacyMailerLog = require('../legacy_log')(mailerLog)
var Mailer = require('../mailer')(legacyMailerLog)

P.all(
  [
    require('../translator')(config.get('locales')),
    require('../templates')()
  ]
)
.spread(
  function (translator, templates) {
    var mailer = new Mailer(translator, templates, mailConfig)
    log.info('config', mailConfig)
    log.info('templates', Object.keys(templates))

    // fetch and process verification reminders

    DB.connect(config.get(config.get('db').backend))
      .then(
        function (db) {
          var verificationReminders = require('../lib/verification-reminders')(mailer, db)
          verificationReminders.poll()
        },
        function (err) {
          log.error('db', { err: err })
        }
      )

    var api = restify.createServer()
    api.use(restify.bodyParser())
    /*/
    {
      type:
      email:
      uid:
      code:
      token:
      service:
      redirectTo:
      acceptLanguage:
    }
    /*/
    api.post(
      '/send',
      function (req, res, next) {
        var type = req.body.type
        if (typeof(mailer[type]) === 'function') {
          mailer[type](req.body)
          res.send(200)
        }
        else {
          log.error('send', { err: { message: 'invalid type', body: req.body }})
          res.send(400)
        }
        next()
      }
    )

    api.get(
      '/',
      function (req, res, next) {
        res.send({ version: packageJson.version })
        next()
      }
    )

    api.listen(
      config.get('port'),
      config.get('host'),
      function () {
        log.info('listening', { port: config.get('port'), host: config.get('host') })
      }
    )
  }
)
.catch(
  function (err) {
    log.error('init', err)
    process.exit(8)
  }
)
