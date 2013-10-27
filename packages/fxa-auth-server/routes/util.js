/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

module.exports = function (log, crypto, isA, bridge) {

  const HEX_STRING = /^(?:[a-fA-F0-9]{2})+$/

  var routes = [
    {
      method: 'POST',
      path: '/get_random_bytes',
      config: {
        handler: function getRandomBytes(request) {
          request.reply({ data: crypto.randomBytes(32).toString('hex') })
        }
      }
    },
    {
      method: 'GET',
      path: '/verify_email',
      config: {
        handler: function (request, next) {
          return request.reply.redirect(bridge.url + request.raw.req.url)
        },
        validate: {
          query: {
            code: isA.String().regex(HEX_STRING).required(),
            uid: isA.String().max(64).required()
          }
        }
      }
    }
  ]

  return routes
}
