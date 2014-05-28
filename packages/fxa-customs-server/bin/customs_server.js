/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var Memcached = require('memcached')
var restify = require('restify')
var config = require('../config')
var log = require('../log')(config.logLevel, 'customs-server')
var packageJson = require('../package.json')

var LIFETIME = config.recordLifetimeSeconds
var BLOCK_INTERVAL_MS = config.blockIntervalSeconds * 1000

var IpEmailRecord = require('../ip_email_record')(BLOCK_INTERVAL_MS, config.maxBadLogins)
var EmailRecord = require('../email_record')(BLOCK_INTERVAL_MS, config.maxEmails)
var IpRecord = require('../ip_record')(BLOCK_INTERVAL_MS)

var P = require('bluebird')
P.promisifyAll(Memcached.prototype)

function shutdown() {
  process.nextTick(process.exit)
}

if (process.env.ASS_CODE_COVERAGE) {
  process.on('SIGINT', shutdown)
}

var mc = new Memcached(
  config.memcached,
  {
    timeout: 500,
    retries: 1,
    retry: 1000,
    reconnect: 1000,
    idle: 30000,
    namespace: 'fxa~'
  }
)

var api = restify.createServer()
api.use(restify.bodyParser())

function ignore(err) {
  log.error({ op: 'memcachedError', err: err })
}

function fetchRecords(email, ip) {
  return P.all(
    [
      // get records and ignore errors by returning a new record
      mc.getAsync(email).then(EmailRecord.parse, EmailRecord.parse),
      mc.getAsync(ip).then(IpRecord.parse, IpRecord.parse),
      mc.getAsync(ip + email).then(IpEmailRecord.parse, IpEmailRecord.parse)
    ]
  )
}

function setRecords(email, ip, emailRecord, ipRecord, ipEmailRecord) {
  return P.all(
    [
      // store records ignoring errors
      mc.setAsync(email, emailRecord, LIFETIME).caught(ignore),
      mc.setAsync(ip, ipRecord, LIFETIME).caught(ignore),
      mc.setAsync(ip + email, ipEmailRecord, LIFETIME).caught(ignore)
    ]
  )
}

function max(prev, cur) {
  return Math.max(prev, cur)
}

api.post(
  '/check',
  function (req, res, next) {
    var email = req.body.email
    var ip = req.body.ip
    var action = req.body.action

    if (!email || !ip || !action) {
      var err = {code: 'MissingParameters', message: 'email, ip and action are all required'}
      log.error({ op: 'request.failedLoginAttempt', email: email, ip: ip, action: action, err: err })
      res.send(500, err)
      return next()
    }

    fetchRecords(email, ip)
      .spread(
        function (emailRecord, ipRecord, ipEmailRecord) {
          var blockEmail = emailRecord.update(action)
          var blockIpEmail = ipEmailRecord.update(action)
          var blockIp = ipRecord.update()

          if (blockIpEmail && ipEmailRecord.unblockIfReset(emailRecord.pr)) {
            blockIpEmail = 0
          }
          var retryAfter = [blockEmail, blockIpEmail, blockIp].reduce(max)

          return setRecords(email, ip, emailRecord, ipRecord, ipEmailRecord)
            .then(
              function () {
                return {
                  block: retryAfter > 0,
                  retryAfter: retryAfter
                }
              }
            )
        }
      )
      .then(
        function (result) {
          log.info({ op: 'request.check', email: email, ip: ip, action: action, block: result.block })
          res.send(result)
        },
        function (err) {
          log.error({ op: 'request.check', email: email, ip: ip, action: action, err: err })
          res.send(500, err)
        }
      )
      .done(next, next)
  }
)

api.post(
  '/failedLoginAttempt',
  function (req, res, next) {
    var email = req.body.email
    var ip = req.body.ip
    if (!email || !ip) {
      var err = {code: 'MissingParameters', message: 'email and ip are both required'}
      log.error({ op: 'request.failedLoginAttempt', email: email, ip: ip, err: err })
      res.send(500, err)
      next()
    }

    mc.getAsync(ip + email)
      .then(IpEmailRecord.parse, IpEmailRecord.parse)
      .then(
        function (ipEmailRecord) {
          ipEmailRecord.addBadLogin()
          return mc.setAsync(ip + email, ipEmailRecord, LIFETIME).caught(ignore)
        }
      )
      .then(
        function () {
          log.info({ op: 'request.failedLoginAttempt', email: email, ip: ip })
          res.send({})
        },
        function (err) {
          log.error({ op: 'request.failedLoginAttempt', email: email, ip: ip, err: err })
          res.send(500, err)
        }
      )
      .done(next, next)
  }
)

api.post(
  '/passwordReset',
  function (req, res, next) {
    var email = req.body.email
    if (!email) {
      var err = {code: 'MissingParameters', message: 'email is required'}
      log.error({ op: 'request.passwordReset', email: email, err: err })
      res.send(500, err)
      next()
    }

    mc.getAsync(email)
      .then(EmailRecord.parse, EmailRecord.parse)
      .then(
        function (emailRecord) {
          emailRecord.passwordReset()
          return mc.setAsync(email, emailRecord, LIFETIME).caught(ignore)
        }
      )
      .then(
        function () {
          log.info({ op: 'request.passwordReset', email: email })
          res.send({})
        },
        function (err) {
          log.error({ op: 'request.passwordReset', email: email, err: err })
          res.send(500, err)
        }
      )
      .done(next, next)
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
    log.info({ op: 'listening', port: config.port })
  }
)
