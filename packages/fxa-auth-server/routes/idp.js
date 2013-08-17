/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

module.exports = function (crypto, error, isA, serverPublicKey, bridge) {

  var routes = [
    {
      method: 'GET',
      path: '/.well-known/browserid',
      config: {
        handler: function wellKnown(request) {
          request.reply(
            {
              'public-key': serverPublicKey,
              'authentication': '/sign_in.html',
              'provisioning': '/provision.html'
            }
          )
        }
      }
    },
    {
      method: 'GET',
      path: '/sign_in.html',
      config: {
        handler: {
          file: './sign_in.html'
        }
      }
    },
    {
      method: 'GET',
      path: '/provision.html',
      config: {
        handler: {
          file: './provision.html'
        }
      }
    },
    {
      method: 'POST',
      path: '/get_random_bytes',
      config: {
        handler: function getRandomBytes(request) {
          crypto.randomBytes(
            32,
            function(err, buf) {
              request.reply(err || { data: buf.toString('hex') })
            }
          )
        }
      }
    },
    {
      method: 'GET',
      path: '/verify_email',
      config: {
        handler: {
          proxy: {
            mapUri: function (request, next) {
              return next(null, bridge.url + '/verify_email')
            },
            passThrough: true,
            xforward: true
          }
        }
      }
    },
  ]

  return routes
}
