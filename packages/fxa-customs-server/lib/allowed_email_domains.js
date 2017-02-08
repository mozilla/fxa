/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

module.exports = function (config, mc, log) {

  var pollInterval = null

  function AllowedEmailDomains(domains) {
    this.setAll(domains)
  }

  AllowedEmailDomains.prototype.isAllowed = function (email) {
    var match = /^.+@(.+)$/.exec(email)
    return match ? this.domains[match[1]] : false
  }

  AllowedEmailDomains.prototype.setAll = function (domains) {
    this.domains = {}
    for (var i = 0; i < domains.length; i++) {
      this.domains[domains[i]] = true
    }
    return Object.keys(this.domains)
  }

  AllowedEmailDomains.prototype.push = function () {
    log.info({ op: 'allowedEmailDomains.push' })
    return mc.setAsync('allowedEmailDomains', Object.keys(this.domains), 0)
      .then(this.refresh.bind(this))
  }

  AllowedEmailDomains.prototype.refresh = function (options) {
    log.info({ op: 'allowedEmailDomains.refresh' })
    var result = mc.getAsync('allowedEmailDomains').then(validate)

    if (options && options.pushOnMissing) {
      result = result.catch(this.push.bind(this))
    }

    return result.then(
      this.setAll.bind(this),
      function (err) {
        log.error({ op: 'allowedEmailDomains.refresh', err: err })
      }
    )
  }

  AllowedEmailDomains.prototype.pollForUpdates = function () {
    this.stopPolling()
    pollInterval = setInterval(this.refresh.bind(this), config.updatePollIntervalSeconds * 1000)
    pollInterval.unref()
  }

  AllowedEmailDomains.prototype.stopPolling = function () {
    clearInterval(pollInterval)
  }

  function validate(domains) {
    if (!Array.isArray(domains)) {
      log.error({ op: 'allowedEmailDomains.validate.invalid', data: domains })
      throw new Error('invalid allowedEmailDomains from memcache')
    }
    return domains
  }

  var allowedEmailDomains = new AllowedEmailDomains(config.allowedEmailDomains || [])
  return allowedEmailDomains
}
