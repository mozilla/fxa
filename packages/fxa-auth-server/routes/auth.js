/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

module.exports = function (log, isA, error, db, Token) {

  const HEX_STRING = /^(?:[a-fA-F0-9]{2})+$/

  function clientData(srpToken) {
    return srpToken.clientData()
  }

  function bundleAuth(K, authToken) {
    return Token.Bundle.bundle(K, 'auth/finish', Buffer(authToken.data, 'hex'))
  }

  function srpFinish(srpToken, A, M) {
    return srpToken.finish(A, M)
  }

  var routes = [
    {
      method: 'POST',
      path: '/auth/start',
      config: {
        description:
          "Begins an SRP login for the supplied email address, " +
          "returning the temporary srpToken and parameters for " +
          "key stretching and the SRP protocol for the client.",
        tags: ["srp", "account"],
        handler: function (request) {
          log.begin('Auth.start', request)
          var reply = request.reply.bind(request)
          db.emailRecord(request.payload.email)
            .then(
              function (emailRecord) {
                return db.createSrpToken(emailRecord)
              }
            )
            .then(
              function (srpToken) {
                return clientData(srpToken)
              }
            )
            .done(reply, reply)
        },
        validate: {
          payload: {
            email: isA.String().max(1024).regex(HEX_STRING).required()
          },
          response: {
            schema: {
              srpToken: isA.String().required(),
              passwordStretching: isA.Object(),
              srp: isA.Object({
                type: isA.String().required(),
                salt: isA.String().regex(HEX_STRING), // salt
                B: isA.String().regex(HEX_STRING)  // server's public key value
              })
            }
          }
        }
      }
    },
    {
      method: 'POST',
      path: '/auth/finish',
      config: {
        description:
          "Finishes the SRP dance, with the client providing " +
          "proof-of-knownledge of the password and receiving " +
          "the bundle encrypted with the authToken.",
        tags: ["srp", "session"],
        handler: function (request) {
          log.begin('Auth.finish', request)
          var reply = request.reply.bind(request)

          db.srpToken(request.payload.srpToken)
            .then(
              function (srpToken) {
                return srpFinish(srpToken, request.payload.A, request.payload.M)
              }
            )
            .then(
              function (srpToken) {
                return db.authFinish(srpToken)
                  .then(
                    function (authToken) {
                      return bundleAuth(srpToken.K, authToken)
                    }
                  )
                  .then(
                    function (bundle) {
                      return {bundle: bundle}
                    }
                  )
              }
            )
            .done(reply, reply)
        },
        validate: {
          payload: {
            srpToken: isA.String().required(),
            A: isA.String().regex(HEX_STRING).required(),
            M: isA.String().regex(HEX_STRING).required()
          },
          response: {
            schema: {
              bundle: isA.String().regex(HEX_STRING).required()
            }
          }
        }
      }
    }
  ]

  return routes
}
