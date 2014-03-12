/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var validators = require('./validators')
var HEX_STRING = validators.HEX_STRING

module.exports = function (log, crypto, isA, config, redirectDomain) {

  var routes = [
    {
      method: 'POST',
      path: '/get_random_bytes',
      handler: function getRandomBytes(request, reply) {
        reply({ data: crypto.randomBytes(32).toString('hex') })
      }
    },
    {
      method: 'GET',
      path: '/verify_email',
      config: {
        validate: {
          query: {
            code: isA.string().max(32).regex(HEX_STRING).required(),
            uid: isA.string().max(32).regex(HEX_STRING).required(),
            service: isA.string().max(16).alphanum().optional(),
            redirectTo: isA.string()
              .max(512)
              .regex(validators.domainRegex(redirectDomain))
              .optional()
          }
        }
      },
      handler: function (request, reply) {
        return reply().redirect(config.contentServer.url + request.raw.req.url)
      }
    },
    {
      method: 'GET',
      path: '/complete_reset_password',
      config: {
        validate: {
          query: {
            email: validators.email().required(),
            code: isA.string().max(32).regex(HEX_STRING).required(),
            token: isA.string().max(64).regex(HEX_STRING).required(),
            service: isA.string().max(16).alphanum().optional(),
            redirectTo: isA.string()
              .max(512)
              .regex(validators.domainRegex(redirectDomain))
              .optional()
          }
        }
      },
      handler: function (request, reply) {
        return reply().redirect(config.contentServer.url + request.raw.req.url)
      }
    }
  ]

  return routes
}
