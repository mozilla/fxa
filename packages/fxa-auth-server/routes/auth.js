/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

module.exports = function (isA, Account, SrpSession, AuthBundle) {

  const HEX_STRING = /^(?:[a-fA-F0-9]{2})+$/

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
          var reply = request.reply.bind(request)
          Account.getByEmail(request.payload.email)
            .then(SrpSession.start.bind(null))
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
          var reply = request.reply.bind(request)
          SrpSession
            .finish(request.payload.srpToken, request.payload.A, request.payload.M)
            .then(
              function (srpSession) {
                return AuthBundle.login(srpSession.K, srpSession.uid)
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
    },

  ]

  return routes
}
