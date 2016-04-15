/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
var net = require('net')

module.exports = function (config, mc, log) {

  var pollInterval = null

  function AllowedIPs(ips) {
    this.setAll(ips)
  }

  AllowedIPs.prototype.setAll = function (ips) {
    this.ips = {}
    for (var i = 0; i < ips.length; i++) {
      this.ips[ips[i]] = true
    }
    return Object.keys(this.ips)
  }

  AllowedIPs.prototype.push = function () {
    log.info({ op: 'allowedIPs.push' })
    return mc.setAsync('allowedIPs', Object.keys(this.ips), 0)
      .then(this.refresh.bind(this))
  }

  AllowedIPs.prototype.refresh = function (options) {
    log.info({ op: 'allowedIPs.refresh' })
    var result = mc.getAsync('allowedIPs').then(validate)

    if (options && options.pushOnMissing) {
      result = result.catch(this.push.bind(this))
    }

    return result.then(
      this.setAll.bind(this),
      function (err) {
        log.error({ op: 'allowedIPs.refresh', err: err })
      }
    )
  }

  AllowedIPs.prototype.pollForUpdates = function () {
    this.stopPolling()
    pollInterval = setInterval(this.refresh.bind(this), config.updatePollIntervalSeconds * 1000)
  }

  AllowedIPs.prototype.stopPolling = function () {
    clearInterval(pollInterval)
  }

  function validate(ips) {
    if (!Array.isArray(ips)) {
      log.error({ op: 'allowedIPs.validate.invalid', data: ips })
      throw new Error('invalid allowedIPs from memcache')
    }
    return ips.filter(function (ip) {
      var is = net.isIPv4(ip)
      if (!is) {
        log.error({ op: 'allowedIPs.validate.err', ip: ip })
      }
      return is
    })
  }

  var allowedIPs = new AllowedIPs(config.allowedIPs || [])
  return allowedIPs
}
