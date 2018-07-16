/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict'

var jwtool = require('fxa-jwtool')

function b64toDec(str) {
  var n = new jwtool.BN(Buffer.from(str, 'base64'))
  return n.toString(10)
}

function toDec(str) {
  return /^[0-9]+$/.test(str) ? str : b64toDec(str)
}

function browseridFormat(keys) {
  var primary = keys[0]
  return {
    'public-key': {
      kid: primary.jwk.kid,
      'fxa-createdAt': primary.jwk['fxa-createdAt'],
      algorithm: primary.jwk.algorithm,
      n: toDec(primary.jwk.n),
      e: toDec(primary.jwk.e)
    },
    authentication: '/.well-known/browserid/sign_in.html',
    provisioning: '/.well-known/browserid/provision.html',
    keys: keys
  }
}

module.exports = function (log, serverPublicKeys) {
  var keys = [ serverPublicKeys.primary ]
  if (serverPublicKeys.secondary) { keys.push(serverPublicKeys.secondary) }

  var browserid = browseridFormat(keys)

  var routes = [
    {
      method: 'GET',
      path: '/.well-known/browserid',
      options: {
        cache: {
          privacy: 'public',
          expiresIn: 10000
        }
      },
      handler: async function (request) {
        log.begin('browserid', request)
        return browserid
      }
    },
    {
      method: 'GET',
      path: '/.well-known/public-keys',
      handler: async function (request) {
        // FOR DEV PURPOSES ONLY
        return {
            keys: keys
        }
      }
    },
    {
      method: 'GET',
      path: '/.well-known/browserid/sign_in.html',
      handler: {
        file: './lib/routes/static/sign_in.html'
      }
    },
    {
      method: 'GET',
      path: '/.well-known/browserid/provision.html',
      handler: {
        file: './lib/routes/static/provision.html'
      }
    }
  ]

  return routes
}
