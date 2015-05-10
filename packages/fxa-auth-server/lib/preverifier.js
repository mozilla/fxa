/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var P = require('./promise')
var JWTool = require('fxa-jwtool')

module.exports = function (error, config) {

  var jwtool = new JWTool(config.trustedJKUs)

  function nowSeconds() {
    return Math.floor(Date.now() / 1000)
  }

  function jwtError(email, payload) {
    if (payload.exp < nowSeconds()) {
      return { exp: payload.exp }
    }
    if (payload.aud !== config.domain) {
      return { aud: payload.aud }
    }
    if (!payload.sub || payload.sub !== email) {
      return { sub: payload.sub }
    }
    return false
  }

  function isValidToken(email, token) {
    return jwtool.verify(token)
      .then(
        function (payload) {
          var invalid = jwtError(email, payload)
          if (invalid) {
            throw error.invalidVerificationCode(invalid)
          }
          return true
        },
        function (err) {
          throw error.invalidVerificationCode({ internal: err.message })
        }
      )
  }

  return function isPreVerified(email, token) {
    if (!token) { return P(false) }
    return isValidToken(email, token)
  }
}
