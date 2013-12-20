/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var HEX_STRING = require('./validators').HEX_STRING
var HEX_EMAIL = require('./validators').HEX_EMAIL


module.exports = function (log, isA, error, db, Token) {

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
          db.emailRecord(Buffer(request.payload.email, 'hex').toString())
            .then(
              function (emailRecord) {
                return db.createSrpToken(emailRecord)
              }
            )
            .then(
              function (srpToken) {
                return srpToken.clientData()
              }
            )
            .done(reply, reply)
        },
        validate: {
          payload: {
            email: isA.String().max(1024).regex(HEX_EMAIL).required()
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
          var srpTokenId = Buffer(request.payload.srpToken, 'hex')
          var srpToken = null;
          db.srpToken(srpTokenId)
            .then(
              function (token) {
                srpToken = token
                return srpToken.finish(request.payload.A, request.payload.M)
              }
            )
            .then(
              function (srpToken) {
                log.security({ event: 'login-success', uid: srpToken.uid });
                return srpToken
              },
              function (err) {
                log.security({ event: 'login-failure', err: err, uid: srpToken.uid });
                throw err
              }
            )
            .then(
              function (srpToken) {
                return db.authFinish(srpToken)
                  .then(
                    function (authToken) {
                      return srpToken.bundleAuth(authToken.data)
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
            srpToken: isA.String().regex(HEX_STRING).required(),
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
