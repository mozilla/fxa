/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict'

const error = require('../error')
const isA = require('joi')
const P = require('../promise')
const random = require('../crypto/random')

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
          strategy: 'sessionToken'
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
    },
    {
      method: 'POST',
      path: '/session/duplicate',
      config: {
        auth: {
          strategy: 'sessionToken'
        },
        validate: {
          payload: {
            reason: isA.string().max(16).optional()
          }
        }
      },
      handler: function (request, reply) {
        log.begin('Session.duplicate', request)
        const origSessionToken = request.auth.credentials

        return P.resolve()
          .then(duplicateVerificationState)
          .then(createSessionToken)
          .then(formatResponse)
          .then(reply, reply)

        function duplicateVerificationState() {
          // Copy verification state of the token, but generate
          // independent verification codes.
          const newVerificationState = {}
          if (origSessionToken.tokenVerificationId) {
            newVerificationState.tokenVerificationId = random.hex(origSessionToken.tokenVerificationId.length / 2)
          }
          if (origSessionToken.tokenVerificationCode) {
            // Using expiresAt=0 here prevents the new token from being verified via email code.
            // That's OK, because we don't send them a new email with the new verification code
            // unless they explicitly ask us to resend it, and resend only handles email links
            // rather than email codes.
            newVerificationState.tokenVerificationCode = random.hex(origSessionToken.tokenVerificationCode.length / 2)
            newVerificationState.tokenVerificationCodeExpiresAt = 0
          }
          return P.props(newVerificationState)
        }

        function createSessionToken(newVerificationState) {
          // Update UA info based on the requesting device.
          const newUAInfo = {
            uaBrowser: request.app.ua.browser,
            uaBrowserVersion: request.app.ua.browserVersion,
            uaOS: request.app.ua.os,
            uaOSVersion: request.app.ua.osVersion,
            uaDeviceType: request.app.ua.deviceType,
            uaFormFactor: request.app.ua.formFactor
          }

          // Copy all other details from the original sessionToken.
          // We have to lie a little here and copy the creation time
          // of the original sessionToken.  If we set createdAt to the
          // current time, we would falsely report the new session's
          // `lastAuthAt` value as the current timestamp.
          const sessionTokenOptions = Object.assign({}, origSessionToken, newUAInfo, newVerificationState)
          return db.createSessionToken(sessionTokenOptions)
        }

        function formatResponse(newSessionToken) {
          const response = {
            uid: newSessionToken.uid,
            sessionToken: newSessionToken.data,
            authAt: newSessionToken.lastAuthAt()
          }

          if (! newSessionToken.emailVerified) {
            response.verified = false
            response.verificationMethod = 'email'
            response.verificationReason = 'signup'
          } else if (! newSessionToken.tokenVerified) {
            response.verified = false
            response.verificationMethod = 'email'
            response.verificationReason = 'login'
          } else {
            response.verified = true
          }

          return response
        }
      }
    } ]

  return routes
}
