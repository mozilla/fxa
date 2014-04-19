/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

 var P = require('./promise')
 var request = require('./requestp')

 module.exports = function (log, error) {

  function Customs(url) {
    this.url = url
  }

  Customs.prototype.check = function (ip, agent, email, action) {
    log.trace({ op: 'customs.check', email: email, action: action })
    if (this.url === 'none') { return P() }
    return request(
      {
        method: 'POST',
        url: this.url + '/check',
        json: {
          ip: ip,
          email: email,
          action: action,
          agent: agent
        }
      }
    )
    .then(
      function (result) {
        if (result.block) {
          throw error.tooManyRequests(result.retryAfter)
        }
      },
      function (err) {
        log.error({ op: 'customs.check.1', email: email, action: action, err: err })
        // allow the request through
      }
    )
  }

  Customs.prototype.flag = function (ip, email) {
    log.trace({ op: 'customs.flag', ip: ip, email: email })
    if (this.url === 'none') { return P() }
    return request(
      {
        method: 'POST',
        url: this.url + '/failedLoginAttempt',
        json: {
          ip: ip,
          email: email
        }
      }
    )
    .then(
      function () {},
      function (err) {
        log.error({ op: 'customs.flag.1', email: email, err: err })
      }
    )
  }

  return Customs
}
