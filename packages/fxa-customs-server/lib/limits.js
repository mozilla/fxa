/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var deepEqual = require('deep-equal')

module.exports = function (config, mc, log) {

  var pollInterval = null

  function Limits(settings) {
    this.setAll(settings)
  }

  Limits.prototype.setAll = function (settings) {
    this.blockIntervalSeconds = settings.blockIntervalSeconds
    this.blockIntervalMs = settings.blockIntervalSeconds * 1000
    this.rateLimitIntervalSeconds = settings.rateLimitIntervalSeconds
    this.rateLimitIntervalMs = settings.rateLimitIntervalSeconds * 1000
    this.maxEmails = settings.maxEmails
    this.maxBadLogins = settings.maxBadLogins
    this.maxBadLoginsPerIp = settings.maxBadLoginsPerIp
    this.maxUnblockAttempts = settings.maxUnblockAttempts
    this.maxVerifyCodes = settings.maxVerifyCodes
    this.ipRateLimitIntervalSeconds = settings.ipRateLimitIntervalSeconds
    this.ipRateLimitIntervalMs = settings.ipRateLimitIntervalSeconds * 1000
    this.ipRateLimitBanDurationSeconds = settings.ipRateLimitBanDurationSeconds
    this.ipRateLimitBanDurationMs = settings.ipRateLimitBanDurationSeconds * 1000
    this.maxAccountStatusCheck = settings.maxAccountStatusCheck
    this.badLoginErrnoWeights = settings.badLoginErrnoWeights || {}
    this.uidRateLimit = settings.uidRateLimit || {}
    this.maxChecksPerUid = this.uidRateLimit.maxChecks
    this.uidRateLimitBanDurationMs = this.uidRateLimit.banDurationSeconds * 1000
    this.uidRateLimitIntervalMs = this.uidRateLimit.limitIntervalSeconds * 1000
    return this
  }

  Limits.prototype.push = function () {
    log.info({ op: 'limits.push' })
    return mc.setAsync('limits', this, 0)
      .then(this.refresh.bind(this))
  }

  Limits.prototype.refresh = function (options) {
    log.info({ op: 'limits.refresh' })
    var result = mc.getAsync('limits').then(validate)

    if (options && options.pushOnMissing) {
      result = result.catch(this.push.bind(this))
    }

    return result.then(
      this.setAll.bind(this),
      function (err) {
        log.error({ op: 'limits.refresh', err: err })
      }
    )
  }

  Limits.prototype.pollForUpdates = function () {
    this.stopPolling()
    pollInterval = setInterval(this.refresh.bind(this), config.updatePollIntervalSeconds * 1000)
  }

  Limits.prototype.stopPolling = function () {
    clearInterval(pollInterval)
  }

  var limits = new Limits(config.limits)

  function validate(settings) {
    if (typeof(settings) !== 'object') {
      log.error({ op: 'limits.validate.invalid', data: settings })
      throw new Error('invalid limits from memcache')
    }
    var keys = Object.keys(config.limits)
    for (var i = 0; i < keys.length; i++) {
      var key = keys[i]
      var current = limits[key]
      var future = settings[key]
      if (typeof(current) !== typeof(future)) {
        log.error({ op: 'limits.validate.err', key: key, msg: 'types do not match'})
        settings[key] = current
      }
      else if (!deepEqual(current, future)) {
        log.info({ op: 'limits.validate.changed', key: key, current: current, future: future })
      }
    }
    return settings
  }

  return limits
}
