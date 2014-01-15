/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var HEX_STRING = require('./validators').HEX_STRING

module.exports = function (log, crypto, isA, config) {

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
        handler: function (request) {
          return request.reply.redirect(config.contentServer.url + request.raw.req.url)
        },
        validate: {
          query: {
            code: isA.String().max(32).regex(HEX_STRING).required(),
            uid: isA.String().max(64).regex(HEX_STRING).required()
          }
        }
      }
    },
    {
      method: 'GET',
      path: '/complete_reset_password',
      config: {
        handler: function (request) {
          return request.reply.redirect(config.contentServer.url + request.raw.req.url)
        },
        validate: {
          query: {
            code: isA.String().max(32).regex(HEX_STRING).required(),
            uid: isA.String().max(64).regex(HEX_STRING).required()
          }
        }
      }
    }
  ]

  return routes
}
