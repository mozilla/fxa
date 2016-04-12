/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var config = require('../config').root()

var LIFETIME_SEC = config.memcache.recordLifetimeSeconds
var BLOCK_INTERVAL_MS = config.limits.blockIntervalSeconds * 1000
var RATE_LIMIT_INTERVAL_MS = config.limits.rateLimitIntervalSeconds * 1000
var IP_RATE_LIMIT_INTERVAL_MS = config.limits.ipRateLimitIntervalSeconds * 1000
var IP_RATE_LIMIT_BAN_DURATION_MS = config.limits.ipRateLimitBanDurationSeconds * 1000
var MAX_EMAILS = config.limits.emails
var BAD_LOGIN_LOCKOUT = config.limits.badLoginLockout
var BAD_LOGIN_LOCKOUT_INTERVAL_MS = config.limits.badLoginLockoutIntervalSeconds * 1000
var MAX_BAD_LOGINS_PER_IP = config.limits.maxBadLoginsPerIp
var BAD_LOGIN_ERRNO_WEIGHTS = config.limits.badLoginErrnoWeights
var MAX_ACCOUNT_STATUS_CHECK = config.limits.maxAccountStatusCheck

var EmailRecord = require('../email_record')(RATE_LIMIT_INTERVAL_MS, BLOCK_INTERVAL_MS, BAD_LOGIN_LOCKOUT_INTERVAL_MS, MAX_EMAILS, BAD_LOGIN_LOCKOUT)
var IpRecord = require('../ip_record')(BLOCK_INTERVAL_MS, IP_RATE_LIMIT_INTERVAL_MS, IP_RATE_LIMIT_BAN_DURATION_MS, MAX_BAD_LOGINS_PER_IP, BAD_LOGIN_ERRNO_WEIGHTS, MAX_ACCOUNT_STATUS_CHECK)

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
        var lifetime = Math.max(LIFETIME_SEC, ir.getMinLifetimeMS() / 1000)
        mc.set(ip, ir, lifetime,
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
        var lifetime = Math.max(LIFETIME_SEC, er.getMinLifetimeMS() / 1000)
        mc.set(email, er, lifetime,
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
