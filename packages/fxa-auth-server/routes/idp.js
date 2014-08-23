/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

module.exports = function (log, serverPublicKey) {

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
        reply(
          {
            'public-key': serverPublicKey,
            'authentication': '/.well-known/browserid/sign_in.html',
            'provisioning': '/.well-known/browserid/provision.html'
          }
        )
      }
    },
    {
      method: 'GET',
      path: '/.well-known/public-keys',
      handler: function (request, reply) {
        // FOR DEV PURPOSES ONLY
        reply(
          {
            keys: [
              {
                kty: "RSA",
                n: serverPublicKey.n,//bigint(serverPublicKey.n).toBuffer().toString('base64'),
                e: serverPublicKey.e,//bigint(serverPublicKey.e).toBuffer().toString('base64'),
                kid: "dev-1"
              }
            ]
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
