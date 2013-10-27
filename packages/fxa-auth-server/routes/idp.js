/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

module.exports = function (log, serverPublicKey) {

  const HEX_STRING = /^(?:[a-fA-F0-9]{2})+$/

  var routes = [
    {
      method: 'GET',
      path: '/.well-known/browserid',
      config: {
        handler: function wellKnown(request) {
          log.begin('wellKnown', request)
          request.reply(
            {
              'public-key': serverPublicKey,
              'authentication': '/.well-known/browserid/sign_in.html',
              'provisioning': '/.well-known/browserid/provision.html'
            }
          )
        }
      }
    },
    {
      method: 'GET',
      path: '/.well-known/browserid/sign_in.html',
      config: {
        handler: {
          file: './routes/static/sign_in.html'
        }
      }
    },
    {
      method: 'GET',
      path: '/.well-known/browserid/provision.html',
      config: {
        handler: {
          file: './routes/static/provision.html'
        }
      }
    }
  ]

  return routes
}
