/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var deepEqual = require('deep-equal')

module.exports = function (config, mc, log) {

  var requestChecks = null
  var pollInterval = null

  function RequestChecks(settings) {
    this.setAll(settings)
  }

  RequestChecks.prototype.setAll = function (settings) {
    this.treatEveryoneWithSuspicion = settings.treatEveryoneWithSuspicion
    // The private branch puts some additional private config here.
    return this
  }

  RequestChecks.prototype.push = function () {
    log.info({ op: 'requestChecks.push' })
    return mc.setAsync('requestChecks', this, 0)
      .then(this.refresh.bind(this))
  }

  RequestChecks.prototype.refresh = function (options) {
    log.info({ op: 'requestChecks.refresh' })
    var result = mc.getAsync('requestChecks').then(validateAndMerge)

    if (options && options.pushOnMissing) {
      result = result.catch(this.push.bind(this))
    }

    return result.then(
      this.setAll.bind(this),
      function (err) {
        log.error({ op: 'requestChecks.refresh', err: err })
      }
    )
  }

  RequestChecks.prototype.pollForUpdates = function () {
    this.stopPolling()
    pollInterval = setInterval(this.refresh.bind(this), config.updatePollIntervalSeconds * 1000)
  }

  RequestChecks.prototype.stopPolling = function () {
    clearInterval(pollInterval)
  }

  // Type-checks updates to the settings, and merges them
  // with the current values, modying its argument in-place.
  function validateAndMerge(settings) {
    if (typeof(settings) !== 'object') {
      log.error({ op: 'requestChecks.validate.invalid', data: settings })
      throw new Error('invalid requestChecks from memcache')
    }
    var keys = Object.keys(config.requestChecks)
    for (var i = 0; i < keys.length; i++) {
      var key = keys[i]
      var current = requestChecks[key]
      var future = settings[key]
      if (typeof(future) === 'undefined') {
        settings[key] = current
      }
      else if (typeof(current) !== typeof(future)) {
        log.error({ op: 'requestChecks.validate.err', key: key, message: 'types do not match' })
        settings[key] = current
      }
      else if (!deepEqual(current, future)) {
        log.info({ op: 'requestChecks.validate.changed', key: key, current: current, future: future })
      }
    }
    return settings
  }

  requestChecks = new RequestChecks(config.requestChecks)
  return requestChecks
}
