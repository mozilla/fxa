/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var Memcached = require('memcached')
var restify = require('restify')
var config = require('../config')
var log = require('../log')(config.logLevel, 'customs-server')
var package = require('../package.json')

var LIFETIME = config.recordLifetimeSeconds
var BLOCK_INTERVAL_MS = config.blockIntervalSeconds * 1000

var IpEmailRecord = require('../ip_email_record')(BLOCK_INTERVAL_MS, config.maxBadLogins)
var EmailRecord = require('../email_record')(BLOCK_INTERVAL_MS, config.maxEmails)
var IpRecord = require('../ip_record')()

var P = require('bluebird')
P.promisifyAll(Memcached.prototype)

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
      mc.setAsync(email, emailRecord, LIFETIME).catch(ignore),
      mc.setAsync(ip, ipRecord, LIFETIME).catch(ignore),
      mc.setAsync(ip + email, ipEmailRecord, LIFETIME).catch(ignore)
    ]
  )
}

function retryAfter(record) {
  if (!record.isBlocked()) { return 0 }
  return Math.floor((record.bk + BLOCK_INTERVAL_MS - Date.now()) / 1000)
}

function max(prev, cur) {
  return Math.max(prev, cur)
}

api.post(
  '/check',
  function (req, res, next) {
    var email = req.body.email
    var ip = req.body.ip
    var agent = req.body.agent
    var action = req.body.action

    fetchRecords(email, ip)
      .spread(
        function (emailRecord, ipRecord, ipEmailRecord) {
          emailRecord.update(action)
          ipRecord.update(agent)
          ipEmailRecord.update(action)

          return setRecords(email, ip, emailRecord, ipRecord, ipEmailRecord)
            .then(
              function () {
                var rt = [
                    retryAfter(emailRecord),
                    retryAfter(ipRecord),
                    retryAfter(ipEmailRecord)
                  ].reduce(max)
                return {
                  block: rt > 0,
                  retryAfter: rt
                }
                return
              }
            )
        }
      )
      .then(
        function (result) {
          log.info({ op: 'request.check', email: email, ip: ip, block: result.block })
          res.send(result)
        },
        function (err) {
          log.error({ op: 'request.check', email: email, ip: ip, err: err })
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
    mc.getAsync(ip + email)
      .then(IpEmailRecord.parse, IpEmailRecord.parse)
      .then(
        function (ipEmailRecord) {
          ipEmailRecord.addBadLogin()
          return mc.setAsync(ip + email, ipEmailRecord, LIFETIME).catch(ignore)
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

api.get(
  '/',
  function (req, res, next) {
    res.send({ version: package.version })
    next()
  }
)

api.listen(
  config.port,
  function () {
    log.info({ op: 'listening', port: config.port })
  }
)
