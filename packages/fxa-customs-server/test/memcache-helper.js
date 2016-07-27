/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var P = require('bluebird')
var Memcached = require('memcached')
P.promisifyAll(Memcached.prototype)

var config = {
  memcache: {
    host: '127.0.0.1',
    port: '11211'
  },
  limits: {
    blockIntervalSeconds: 1,
    rateLimitIntervalSeconds: 1,
    maxAccountStatusCheck: Number(process.env.MAX_ACCOUNT_STATUS_CHECK) || 5,
    maxEmails: 3,
    maxBadLogins: 2,
    maxBadLoginsPerIp: Number(process.env.MAX_BAD_LOGINS_PER_IP) || 3,
    ipRateLimitIntervalSeconds: Number(process.env.IP_RATE_LIMIT_INTERVAL_SECONDS) || 60 * 15,
    ipRateLimitBanDurationSeconds: Number(process.env.IP_RATE_LIMIT_BAN_DURATION_SECONDS) || 60 * 15,
    badLoginLockout: 3,
    badLoginLockoutIntervalSeconds: 20
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

var limits = require('../lib/limits')(config, mc, console)
var allowedIPs = require('../lib/allowed_ips')(config, mc, console)
var allowedEmailDomains = require('../lib/allowed_email_domains')(config, mc, console)
var EmailRecord = require('../lib/email_record')(limits)
var IpEmailRecord = require('../lib/ip_email_record')(limits)
var IpRecord = require('../lib/ip_record')(limits)

module.exports.limits = limits

function blockedEmailCheck(cb) {
  setTimeout( // give memcache time to flush the writes
    function () {
      mc.get(TEST_EMAIL,
        function (err, data) {
          var er = EmailRecord.parse(data)
          mc.end()
          cb(er.shouldBlock())
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
          cb(ir.shouldBlock())
        }
      )
    }
  )
}

module.exports.blockedIpCheck = blockedIpCheck

function badLoginCheck(cb) {
  setTimeout( // give memcache time to flush the writes
    function () {
      P.all([
        mc.getAsync(TEST_IP + TEST_EMAIL),
        mc.getAsync(TEST_IP)
      ])
      .spread(function (d1, d2) {
        var ier = IpEmailRecord.parse(d1)
        var ir = IpRecord.parse(d2)
        mc.end()
        cb(ier.isOverBadLogins(), false, ir.isOverBadLogins())
      })
    }
  )
}

module.exports.badLoginCheck = badLoginCheck

function clearEverything(cb) {
  P.all([
    mc.delAsync('limits'),
    mc.delAsync('allowedIPs'),
    mc.delAsync('allowedEmailDomains'),
    mc.delAsync(TEST_EMAIL),
    mc.delAsync(TEST_IP + TEST_EMAIL),
    mc.delAsync(TEST_IP)
  ])
  .then(function () {
    mc.end()
    cb()
  },
  cb)
}

module.exports.clearEverything = clearEverything

function setLimits(settings) {
  var keys = Object.keys(settings)
  for (var i = 0; i < keys.length; i++) {
    var k = keys[i]
    limits[k] = settings[k]
  }
  return limits.push().
    then(function (s) {
      mc.end()
      return s
    })
}

module.exports.setLimits = setLimits

function setAllowedIPs(ips) {
  allowedIPs.setAll(ips)
  return allowedIPs.push()
    .then(function (ips) {
      mc.end()
      return ips
    })
}

module.exports.setAllowedIPs = setAllowedIPs

function setAllowedEmailDomains(domains) {
  allowedEmailDomains.setAll(domains)
  return allowedEmailDomains.push()
    .then(function (domains) {
      mc.end()
      return domains
    })
}

module.exports.setAllowedEmailDomains = setAllowedEmailDomains
