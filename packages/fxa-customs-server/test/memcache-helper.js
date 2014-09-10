/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var Memcached = require('memcached')

var config = {
  memcache: {
    host: '127.0.0.1',
    port: '11211'
  },
  limits: {
    blockIntervalSeconds: 1,
    rateLimitIntervalSeconds: 1,
    maxEmails: 3,
    maxBadLogins: 2,
    badLoginLockout: 3
  }
}

var mc = new Memcached(
  config.memcache.address,
  {
    timeout: 500,
    retries: 1,
    retry: 1000,
    reconnect: 1000,
    idle: 30000,
    namespace: 'fxa~'
  }
)

module.exports.mc = mc

var TEST_EMAIL = 'test@example.com'
var TEST_IP = '192.0.2.1'

var EmailRecord = require('../email_record')(config.limits.rateLimitIntervalSeconds * 1000, config.limits.blockIntervalSeconds * 1000, config.limits.maxEmails, config.limits.badLoginLockout)
var IpEmailRecord = require('../ip_email_record')(config.limits.rateLimitIntervalSeconds * 1000, config.limits.maxBadLogins)
var IpRecord = require('../ip_record')(config.limits.blockIntervalSeconds * 1000)

function blockedEmailCheck(cb) {
  setTimeout( // give memcache time to flush the writes
    function () {
      mc.get(TEST_EMAIL,
        function (err, data) {
          var er = EmailRecord.parse(data)
          mc.end()
          cb(er.isBlocked())
        }
      )
    }
  )
}

module.exports.blockedEmailCheck = blockedEmailCheck

function blockedIpCheck(cb) {
  setTimeout( // give memcache time to flush the writes
    function () {
      mc.get(TEST_IP,
        function (err, data) {
          var ir = IpRecord.parse(data)
          mc.end()
          cb(ir.isBlocked())
        }
      )
    }
  )
}

module.exports.blockedIpCheck = blockedIpCheck

function badLoginCheck(cb) {
  setTimeout( // give memcache time to flush the writes
    function () {
      mc.get(TEST_IP + TEST_EMAIL,
        function (err, data1) {
          var ier = IpEmailRecord.parse(data1)

          mc.get(TEST_EMAIL,
            function (err, data2) {
              var er = EmailRecord.parse(data2)
              mc.end()
              cb(ier.isOverBadLogins(), er.isWayOverBadLogins())
            }
          )
        }
      )
    }
  )
}

module.exports.badLoginCheck = badLoginCheck

function clearEverything(cb) {
  mc.del(TEST_EMAIL,
    function (err) {
      if (err) {
        return cb(err)
      }

      blockedEmailCheck(
        function (isBlocked) {
          if (isBlocked) {
            return cb('email was not unblocked')
          }

          mc.del(TEST_IP + TEST_EMAIL,
            function (err) {
              if (err) {
                return cb(err)
              }

              badLoginCheck(
                function (isOverBadLogins, isWayOverBadLogins) {
                  if (isOverBadLogins || isWayOverBadLogins) {
                    return cb('there are still some bad logins')
                  }

                  mc.del(TEST_IP,
                    function (err) {
                      if (err) {
                        return cb(err)
                      }

                      blockedIpCheck(
                        function (isBlocked) {
                          if (isBlocked) {
                            return cb('IP was not unblocked')
                          }

                          return cb(null)
                        }
                      )
                    }
                  )
                }
              )
            }
          )
        }
      )
    }
  )
}

module.exports.clearEverything = clearEverything
