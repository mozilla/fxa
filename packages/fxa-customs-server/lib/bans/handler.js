/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

module.exports = function (LIFETIME_SEC, mc, EmailRecord, IpRecord, log) {

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
