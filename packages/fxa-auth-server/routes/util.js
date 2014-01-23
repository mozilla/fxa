/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var validators = require('./validators')
var HEX_STRING = validators.HEX_STRING
var LAZY_EMAIL = validators.LAZY_EMAIL

module.exports = function (log, crypto, isA, config, redirectDomain) {

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
            uid: isA.String().max(64).regex(HEX_STRING).required(),
            service: isA.String().max(16).alphanum().optional(),
            redirectTo: isA.String()
              .max(512)
              .regex(validators.domainRegex(redirectDomain))
              .optional()
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
            email: isA.String().max(255).regex(LAZY_EMAIL).required(),
            code: isA.String().max(32).regex(HEX_STRING).required(),
            token: isA.String().max(64).regex(HEX_STRING).required(),
            service: isA.String().max(16).alphanum().optional(),
            redirectTo: isA.String()
              .max(512)
              .regex(validators.domainRegex(redirectDomain))
              .optional()
          }
        }
      }
    }
  ]

  return routes
}
