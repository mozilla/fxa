/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
var jws = require('jws')
var P = require('./promise')

module.exports = function (jwks, error, config) {

  function parseJwt(str) {
    try { return JSON.parse(Buffer(str, 'base64')) } catch (e) { return {} }
  }

  function isValidJwt(email, jwt) {
    return jwt.exp > Date.now() &&
      jwt.aud === config.domain &&
      !!jwt.sub &&
      jwt.sub === email
  }

  function isValidToken(email, token) {
    var decoded = jws.decode(token)
    if (!decoded) { return P.reject(error.invalidVerificationCode()) }

    return jwks.get(decoded.header.jku, decoded.header.kid)
      .then(
        function (key) {
          var d = P.defer()
          var parts = token.split('.')
          key.verify(parts[0] + '.' + parts[1], parts[2],
            function (err, result) {
              if (err || !result || !isValidJwt(email, parseJwt(parts[1]))) {
                return d.reject(error.invalidVerificationCode())
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
