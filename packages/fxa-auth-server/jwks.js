/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
var jws = require('jws')
var P = require('./promise')
var request = require('request')
var jwcrypto = require('jwcrypto')
require('jwcrypto/lib/algs/rs')

module.exports = function (error, config) {
  // a naive jwk cache
  function JwkCache() {
    this.cache = {}
  }

  function getJwkSet(jku) {
    var d = P.defer()
    request(
      {
        method: 'GET',
        url: jku,
        json: true
      },
      function (err, res, json) {
        if (err || res.statusCode !== 200) {
          return d.reject(err || res)
        }
        var set = {}
        json.keys.forEach(
          function (key) {
            var k = jwcrypto.loadPublicKeyFromObject(
              {
                algorithm:'RS',
                version: '2012.08.15', // used to base64 decode n & e
                modulus: key.n,
                exponent: key.e
              }
            )
            k.kid = key.kid
            set[k.kid] = k
          }
        )

        d.resolve(set)
      }
    )
    return d.promise
  }

  function saveJwkSet(jku, jwkSet) {
    this.cache[jku] = jwkSet
    return jwkSet
  }

  JwkCache.prototype.get = function (jku, kid) {
    var jwkSet = this.cache[jku]
    var p = P(jwkSet)
    if (!jwkSet || !jwkSet[kid]) {
      if (config.trustedJKUs.indexOf(jku) === -1) {
        return P.reject(error.invalidVerificationCode())
      }
      p = getJwkSet(jku).then(saveJwkSet.bind(this, jku))
    }
    return p.then(
      function (set) {
        var jwk = set[kid]
        if (!jwk) { throw error.invalidVerificationCode() }
        return jwk
      }
    )
  }

  return new JwkCache()
}
