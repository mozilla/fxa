/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
var P = require('./promise')
var request = require('request')
var bigint = require('bigint')
var bidcrypto = require('browserid-crypto')
require('browserid-crypto/lib/algs/rs')


// URL-safe base64 decode to a buffer.
// The version provided by browserid-crypto decodes to a utf8 string
// and doesn't seem to want to cooperate with binary data.
function unb64(arg) {
  var s = arg;
  s = s.replace(/-/g, '+'); // 62nd char of encoding
  s = s.replace(/_/g, '/'); // 63rd char of encoding
  switch (s.length % 4) { // Pad with trailing '='s
  case 0:
    break; // No pad chars in this case
  case 2:
    s += "==";
    break; // Two pad chars
  case 3:
    s += "=";
    break; // One pad char
  }
  return new Buffer(s, 'base64'); // Standard base64 decoder
}


module.exports = function (error, config) {
  // a naive jwk cache
  function JwkCache() {
    this.cache = {} // one entry per config.trustedJKUs
  }

  function getJwkSet(jku) {
    var d = P.defer()
    request(
      {
        method: 'GET',
        url: jku,
        strictSSL: true,
        json: true
      },
      function (err, res, json) {
        if (err || res.statusCode !== 200) {
          return d.reject(err || res)
        }
        var set = {}
        json.keys.forEach(
          function (key) {
            var k = bidcrypto.loadPublicKeyFromObject(
              {
                algorithm: 'RS',
                n: bigint.fromBuffer(unb64(key.n)).toString(10),
                e: bigint.fromBuffer(unb64(key.e)).toString(10)
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
        return P.reject(error.invalidVerificationCode({ jku: jku }))
      }
      p = getJwkSet(jku).then(saveJwkSet.bind(this, jku))
    }
    return p.then(
      function (set) {
        var jwk = set[kid]
        if (!jwk) { throw error.invalidVerificationCode({ kid: kid }) }
        return jwk
      }
    )
  }

  return new JwkCache()
}
