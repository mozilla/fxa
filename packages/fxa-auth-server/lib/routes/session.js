/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const error = require('../error')
const isA = require('joi')
const P = require('../promise')

const validators = require('./validators')
const HEX_STRING = validators.HEX_STRING

module.exports = function (log, db) {
  var routes = [
    {
      method: 'POST',
      path: '/session/destroy',
      config: {
        auth: {
          strategy: 'sessionToken'
        },
        validate: {
          payload: isA.object({
            customSessionToken: isA.string().min(64).max(64).regex(HEX_STRING).optional()
          }).allow(null)
        }
      },
      handler: function (request, reply) {
        log.begin('Session.destroy', request)
        var sessionToken = request.auth.credentials
        var uid = request.auth.credentials.uid

        return P.resolve()
          .then(() => {
            if (request.payload && request.payload.customSessionToken) {
              const customSessionToken = request.payload.customSessionToken

              return db.sessionToken(customSessionToken)
                .then(function (tokenData) {
                  // NOTE: validate that the token belongs to the same user
                  if (tokenData && uid === tokenData.uid) {
                    sessionToken = {
                      id: customSessionToken,
                      uid: uid,
                    }

                    return sessionToken
                  } else {
                    throw error.invalidToken('Invalid session token')
                  }
                })
            } else {
              return sessionToken
            }
          })
          .then((sessionToken) => {
            return db.deleteSessionToken(sessionToken)
          })
          .then(
            function () {
              reply({})
            },
            reply
          )
      }
    },
    {
      method: 'GET',
      path: '/session/status',
      config: {
        auth: {
          strategy: 'sessionTokenWithVerificationStatus'
        },
        response: {
          schema: {
            state: isA.string().required(),
            uid: isA.string().regex(HEX_STRING).required()
          }
        }
      },
      handler(request, reply) {
        log.begin('Session.status', request)
        const sessionToken = request.auth.credentials
        reply({
          state: sessionToken.state,
          uid: sessionToken.uid
        })
      }
    }
  ]

  return routes
}
