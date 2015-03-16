/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var config = require('../config').root()

var LIFETIME = config.memcache.recordLifetimeSeconds
var BLOCK_INTERVAL_MS = config.limits.blockIntervalSeconds * 1000
var RATE_LIMIT_INTERVAL_MS = config.limits.rateLimitIntervalSeconds * 1000
var MAX_EMAILS = config.limits.emails
var BAD_LOGIN_LOCKOUT = config.limits.badLoginLockout
var BAD_LOGIN_LOCKOUT_INTERVAL_MS = config.limits.badLoginLockoutIntervalSeconds * 1000

var EmailRecord = require('../email_record')(RATE_LIMIT_INTERVAL_MS, BLOCK_INTERVAL_MS, BAD_LOGIN_LOCKOUT_INTERVAL_MS, MAX_EMAILS, BAD_LOGIN_LOCKOUT)
var IpRecord = require('../ip_record')(BLOCK_INTERVAL_MS)

module.exports = function (mc, log) {

  function blockIp(ip, cb) {
    mc.get(ip,
      function (err, data) {
        if (err) {
          log.error({ op: 'handleBan.blockIp', ip: ip, err: err })
          return cb(err)
        }

        log.info({ op: 'handleBan.blockIp', ip: ip })
        var ir = IpRecord.parse(data)
        ir.block()
        mc.set(ip, ir, LIFETIME,
          function (err) {
            if (err) {
              log.error({ op: 'memcachedError', err: err })
              return cb(err)
            }
            mc.end()
            cb(null)
          }
        )
      }
    )
  }

  function blockEmail(email, cb) {
    mc.get(email,
      function (err, data) {
        if (err) {
          log.error({ op: 'handleBan.blockEmail', email: email, err: err })
          return cb(err)
        }

        log.info({ op: 'handleBan.blockEmail', email: email })
        var er = EmailRecord.parse(data)
        er.block()
        mc.set(email, er, LIFETIME,
          function (err) {
            if (err) {
              log.error({ op: 'memcachedError', err: err })
              return cb(err)
            }
            mc.end()
            cb(null)
          }
        )
      }
    )
  }

  function handleBan(message, cb) {
    if (!cb) {
      cb = function () {}
    }
    if (message.ban && message.ban.ip) {
      blockIp(message.ban.ip, cb)
    }
    else if (message.ban && message.ban.email) {
      blockEmail(message.ban.email, cb)
    }
    else {
      log.error({ op: 'handleBan', ban: !!message.ban })
      cb('invalid message')
    }
  }

  return handleBan
}
