/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var restify = require('restify')
var config = require('../config')
var logConfig = config.get('logging')
var log = require('../log')(logConfig.level, logConfig.app)
var packageJson = require('../package.json')
var P = require('bluebird')
var Mailer = require('../mailer')(log)

P.all(
  [
    require('../translator')(config.get('locales')),
    require('../templates')()
  ]
)
.spread(
  function (translator, templates) {
    var mailer = new Mailer(translator, templates, config.get('mail'))

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
          log.error({ op: 'send', err: { message: 'invalid type', body: req.body }})
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
      config.port,
      function () {
        log.info({ op: 'listening', port: config.get('port') })
      }
    )
  }
)
.catch(
  function (err) {
    log.fatal({ op: 'init', err: err })
    process.exit(8)
  }
)
