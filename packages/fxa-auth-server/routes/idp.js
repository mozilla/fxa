/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

module.exports = function (log, serverPublicKey) {

  var browseridKey = {
    'public-key': {
      algorithm: serverPublicKey.jwk.algorithm,
      n: serverPublicKey.jwk.n,
      e: serverPublicKey.jwk.e
    },
    'authentication': '/.well-known/browserid/sign_in.html',
    'provisioning': '/.well-known/browserid/provision.html'
  }

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
      handler: function browserid(request, reply) {
        log.begin('browserid', request)
        reply(browseridKey)
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
