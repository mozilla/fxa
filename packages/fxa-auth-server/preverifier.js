/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
var jws = require('jws')
var P = require('./promise')

module.exports = function (jwks, error, config) {

  function parseJwt(str) {
    try { return JSON.parse(Buffer(str, 'base64')) } catch (e) { return {} }
  }

  function jwtError(email, jwt) {
    if (jwt.exp < Date.now()) {
      return { exp: jwt.exp }
    }
    if (jwt.aud !== config.domain) {
      return { aud: jwt.aud }
    }
    if (!jwt.sub || jwt.sub !== email) {
      return { sub: jwt.sub }
    }
    return false
  }

  function isValidToken(email, token) {
    var decoded = jws.decode(token)
    if (!decoded) { return P.reject(error.invalidVerificationCode({ token: token })) }

    return jwks.get(decoded.header.jku, decoded.header.kid)
      .then(
        function (key) {
          var d = P.defer()
          var parts = token.split('.')
          key.verify(parts[0] + '.' + parts[1], parts[2],
            function (err, result) {
              var invalid = err || !result || jwtError(email, parseJwt(parts[1]))
              if (invalid) {
                return d.reject(error.invalidVerificationCode(invalid))
              }
              return d.resolve(true)
            }
          )
          return d.promise
        }
      )
  }

  return function isPreVerified(email, token) {
    if (!token) { return P(false) }
    return isValidToken(email, token)
  }
}
