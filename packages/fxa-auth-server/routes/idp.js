/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var jwtool = require('fxa-jwtool')

function b64toDec(str) {
  var n = new jwtool.BN(Buffer(str, 'base64'))
  return n.toString(10)
}

function toDec(str) {
  return /^[0-9]+$/.test(str) ? str : b64toDec(str)
}

function browseridKey(jwk) {
  return {
    'public-key': {
      algorithm: jwk.algorithm,
      n: toDec(jwk.n),
      e: toDec(jwk.e)
    },
    'authentication': '/.well-known/browserid/sign_in.html',
    'provisioning': '/.well-known/browserid/provision.html'
  }
}

module.exports = function (log, serverPublicKey) {

  var browserid = browseridKey(serverPublicKey.jwk)

  var routes = [
    {
      method: 'GET',
      path: '/.well-known/browserid',
      config: {
        cache: {
          privacy: 'public',
          expiresIn: 10000
        }
      },
      handler: function (request, reply) {
        log.begin('browserid', request)
        reply(browserid)
      }
    },
    {
      method: 'GET',
      path: '/.well-known/public-keys',
      handler: function (request, reply) {
        // FOR DEV PURPOSES ONLY
        reply(
          {
            keys: [ serverPublicKey ]
          }
        )
      }
    },
    {
      method: 'GET',
      path: '/.well-known/browserid/sign_in.html',
      handler: {
        file: './routes/static/sign_in.html'
      }
    },
    {
      method: 'GET',
      path: '/.well-known/browserid/provision.html',
      handler: {
        file: './routes/static/provision.html'
      }
    }
  ]

  return routes
}
